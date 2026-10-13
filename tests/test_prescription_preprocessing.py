"""
Automated Test Suite for Module 6 & 7: OpenCV Prescription Image Preprocessing Pipeline.
Tests 8-stage modular pipeline, experimental presets comparison, non-destructive file persistence,
and POST /api/ocr/preprocess/{prescription_id} endpoint.
"""

import os
import io
import pytest
import numpy as np
import cv2
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.database import SessionLocal
from backend.models.sql_models import Prescription
from backend.services.preprocessing_service import (
    PreprocessingConfig,
    PRESET_CONFIGS,
    run_modular_preprocessing_pipeline,
    step_resize,
    step_grayscale,
    step_noise_reduction,
    step_contrast_enhancement,
    step_adaptive_threshold,
    step_deskew,
    step_morphological_processing
)

client = TestClient(app)


def create_synthetic_rx_canvas(width=1000, height=800, text="Rx: Azithromycin 500mg"):
    """Creates a high-contrast synthetic prescription canvas for testing."""
    img = np.ones((height, width, 3), dtype=np.uint8) * 255
    cv2.putText(img, text, (50, 120), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (15, 15, 15), 2)
    cv2.putText(img, "Tab Pantocid 40mg 1-0-0", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (15, 15, 15), 2)
    cv2.putText(img, "Dr. K. Patel, MD Internal Medicine", (50, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (30, 30, 30), 2)
    return img


def test_modular_pipeline_stages_individually():
    """Verify each of the modular 8 pipeline steps independently."""
    img = create_synthetic_rx_canvas(width=2200, height=1600)

    # 1. Resize
    resized, meta_s1 = step_resize(img, enable=True, max_width=1800)
    assert resized.shape[1] == 1800
    assert meta_s1["applied"] is True

    # 2. Grayscale
    gray, meta_s2 = step_grayscale(resized)
    assert len(gray.shape) == 2
    assert meta_s2["applied"] is True

    # 3. Noise Reduction
    denoised, meta_s3 = step_noise_reduction(gray, method="bilateral", strength=9)
    assert denoised.shape == gray.shape
    assert meta_s3["applied"] is True

    # 4. Contrast Enhancement (CLAHE)
    clahe_img, meta_s4 = step_contrast_enhancement(denoised, method="clahe", clip_limit=2.5)
    assert clahe_img.shape == gray.shape
    assert meta_s4["applied"] is True

    # 5. Adaptive Thresholding
    thresh_img, meta_s5 = step_adaptive_threshold(clahe_img, method="adaptive_gaussian", block_size=17, c=8)
    assert len(np.unique(thresh_img)) <= 2  # Binary 0 and 255
    assert meta_s5["applied"] is True

    # 6. Deskew
    deskewed, angle, meta_s6 = step_deskew(thresh_img, enable=True)
    assert deskewed.shape == thresh_img.shape
    assert isinstance(angle, float)

    # 7. Morphological Processing
    morphed, meta_s7 = step_morphological_processing(deskewed, operation="close", kernel_size=2)
    assert morphed.shape == deskewed.shape
    assert meta_s7["applied"] is True


def test_full_pipeline_execution():
    """Tests run_modular_preprocessing_pipeline end-to-end execution."""
    img = create_synthetic_rx_canvas()
    result = run_modular_preprocessing_pipeline(img, PRESET_CONFIGS["default_medical"])

    assert result["success"] is True
    assert "processed_bytes" in result
    assert result["base64_preview"].startswith("data:image/png;base64,")
    assert len(result["pipeline_steps"]) == 7
    assert result["metrics"]["preprocessed_dimensions"]["width"] > 0
    assert result["metrics"]["execution_time_ms"] >= 0


def test_experimental_presets_comparison():
    """Verify each clinical preset executes properly with distinct parameters."""
    img = create_synthetic_rx_canvas()

    for preset_key, cfg in PRESET_CONFIGS.items():
        res = run_modular_preprocessing_pipeline(img, cfg)
        assert res["success"] is True
        assert res["configuration"]["preset_name"] == preset_key
        assert len(res["processed_bytes"]) > 0


def test_endpoint_preprocess_prescription():
    """
    End-to-End Test:
    1. Upload prescription image (POST /api/prescriptions/upload)
    2. Preprocess prescription (POST /api/ocr/preprocess/{id})
    3. Assert original image is preserved and not overwritten
    4. Assert preprocessed image is saved and recorded in DB
    """
    img = create_synthetic_rx_canvas()
    _, buffer = cv2.imencode(".png", img)
    orig_bytes = buffer.tobytes()

    # Step 1: Upload
    upload_res = client.post(
        "/api/prescriptions/upload",
        files={"file": ("rx_test_sample.png", orig_bytes, "image/png")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    rx_id = upload_data["prescription_id"]

    project_root = Path(__file__).resolve().parent.parent
    orig_file_path = project_root / "uploads" / "prescriptions" / upload_data["filename"]
    assert orig_file_path.exists()
    orig_mod_time = orig_file_path.stat().st_mtime

    # Step 2: Preprocess
    prep_res = client.post(
        f"/api/ocr/preprocess/{rx_id}",
        json={"preset_name": "default_medical"}
    )
    assert prep_res.status_code == 200, prep_res.text
    prep_data = prep_res.json()

    # Verify return payload structure
    assert prep_data["prescription_id"] == rx_id
    assert "original_image_path" in prep_data
    assert "preprocessed_image_path" in prep_data
    assert prep_data["base64_preprocessed"].startswith("data:image/png;base64,")
    assert len(prep_data["pipeline_steps"]) == 7
    assert "metrics" in prep_data
    assert "configuration" in prep_data

    # Step 3: Verify non-destructive storage (Original file MUST NOT be overwritten)
    assert orig_file_path.exists()
    assert orig_file_path.stat().st_mtime == orig_mod_time, "Original file was modified or overwritten!"

    # Step 4: Verify preprocessed file was saved in preprocessed/ directory
    prep_file_path = project_root / prep_data["preprocessed_image_path"]
    assert prep_file_path.exists()
    assert prep_file_path.stat().st_size > 0
    assert str(orig_file_path) != str(prep_file_path)

    # Step 5: Verify SQLite database record
    db = SessionLocal()
    try:
        rx_db = db.query(Prescription).filter_by(id=rx_id).first()
        assert rx_db is not None
        assert rx_db.preprocessed_image_path == prep_data["preprocessed_image_path"]
    finally:
        db.close()


def test_endpoint_preprocess_nonexistent_rx():
    """Verify 404 is returned when prescription ID does not exist."""
    res = client.post("/api/ocr/preprocess/rx-nonexistent-id", json={})
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_endpoint_get_presets_catalog():
    """Verify GET /api/ocr/preprocess/presets returns experimental presets."""
    res = client.get("/api/ocr/preprocess/presets")
    assert res.status_code == 200
    presets = res.json()
    assert "default_medical" in presets
    assert "faint_handwriting" in presets
    assert "low_light_camera" in presets
    assert "dense_printed" in presets
