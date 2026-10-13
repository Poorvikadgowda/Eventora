"""
Automated Test Suite for Image Validation, Preprocessing & Evaluation Metrics Pipeline.
Tests Module 5, Module 6, and Module 19 services and REST endpoints.
"""

import io
import pytest
import numpy as np
import cv2
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.validation_service import validate_prescription_image, calculate_blur_score
from backend.services.preprocessing_service import preprocess_prescription_cv, compute_skew_angle
from backend.services.evaluation_service import (
    compute_cer,
    compute_wer,
    calculate_levenshtein,
    get_system_evaluation_metrics
)


def create_synthetic_rx_image(width=800, height=600, text="Rx: Dolo 650mg 1-0-1"):
    """Helper to generate a clean synthetic prescription image in memory."""
    img = np.ones((height, width, 3), dtype=np.uint8) * 255
    cv2.putText(img, text, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (20, 20, 20), 2)
    cv2.putText(img, "Pantocid DSR 1-0-0", (50, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (20, 20, 20), 2)
    success, buffer = cv2.imencode(".png", img)
    return buffer.tobytes()


def test_validation_service_valid_image():
    img_bytes = create_synthetic_rx_image()
    res = validate_prescription_image(img_bytes, "test_rx.png")
    assert res["is_valid"] is True
    assert res["can_proceed_to_ocr"] is True
    assert res["dimensions"]["width"] == 800
    assert res["dimensions"]["height"] == 600
    assert res["sharpness_score"] > 0


def test_validation_service_invalid_empty():
    res = validate_prescription_image(b"too small", "corrupted.png")
    assert res["is_valid"] is False
    assert "empty or corrupted" in res["error"].lower()


def test_opencv_preprocessing_service():
    img_bytes = create_synthetic_rx_image()
    result = preprocess_prescription_cv(img_bytes, apply_binarization=True, apply_deskew=True)
    assert result["success"] is True
    assert "processed_bytes" in result
    assert result["base64_preview"].startswith("data:image/png;base64,")
    assert "grayscale_conversion" in result["steps_applied"]
    assert "otsu_adaptive_binarization" in result["steps_applied"]


def test_evaluation_service_metrics():
    # 1. CER & WER
    ref = "Paracetamol 650mg"
    hyp = "Paracetamol 650mg"
    assert compute_cer(ref, hyp) == 0.0
    assert compute_wer(ref, hyp) == 0.0

    # Slight typo
    hyp_typo = "Paracetmol 650mg"
    assert 0.0 < compute_cer(ref, hyp_typo) < 0.2

    # 2. System evaluation metrics payload
    metrics = get_system_evaluation_metrics()
    assert "summary" in metrics
    assert metrics["summary"]["overall_accuracy_percentage"] >= 90.0
    assert len(metrics["ner_entity_metrics"]) >= 4
    assert len(metrics["category_accuracy"]) >= 4
    assert len(metrics["latency_breakdown_ms"]) >= 4


def test_fastapi_image_and_metrics_endpoints():
    client = TestClient(app)
    img_bytes = create_synthetic_rx_image()

    # 1. Validation endpoint
    files = {"file": ("rx_test.png", img_bytes, "image/png")}
    val_resp = client.post("/api/image/validate", files=files)
    assert val_resp.status_code == 200
    assert val_resp.json()["is_valid"] is True

    # 2. Preprocess endpoint
    files2 = {"file": ("rx_test.png", img_bytes, "image/png")}
    prep_resp = client.post("/api/image/preprocess", files=files2, data={"apply_binarization": "true"})
    assert prep_resp.status_code == 200
    assert prep_resp.json()["success"] is True
    assert "base64_preview" in prep_resp.json()

    # 3. Evaluation metrics endpoint
    metrics_resp = client.get("/api/metrics/evaluation")
    assert metrics_resp.status_code == 200
    data = metrics_resp.json()
    assert "summary" in data
    assert "ner_entity_metrics" in data
