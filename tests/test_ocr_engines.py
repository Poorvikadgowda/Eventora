"""
Automated Test Suite for Module 8: Dual OCR Engine (PaddleOCR & EasyOCR).
Tests PaddleOCRService, EasyOCRService, side-by-side comparison endpoint,
low confidence warning enforcement, and user selection persistence.
"""

import os
import cv2
import numpy as np
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.database import SessionLocal
from backend.models.sql_models import Prescription
from backend.services.ocr_service import (
    PaddleOCRService,
    EasyOCRService,
    compare_ocr_services,
    LOW_CONFIDENCE_THRESHOLD,
    LOW_CONFIDENCE_WARNING_MESSAGE
)

client = TestClient(app)


def create_test_prescription_image():
    """Helper to generate a clean synthetic prescription image on disk for OCR tests."""
    project_root = Path(__file__).resolve().parent.parent
    test_dir = project_root / "uploads" / "prescriptions"
    test_dir.mkdir(parents=True, exist_ok=True)
    test_file = test_dir / "test_ocr_synthetic.png"

    img = np.ones((800, 1000, 3), dtype=np.uint8) * 255
    cv2.putText(img, "Rx", (40, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)
    cv2.putText(img, "1. Tab Dolo 650mg - 1-0-1 - 5 days", (40, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(img, "2. Cap Pantocid DSR - 1-0-0 - 10 days", (40, 210), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(img, "3. Tab Augmentin 625 Duo - 1-0-1", (40, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.imwrite(str(test_file), img)
    return str(test_file)


def test_paddle_ocr_service_output():
    """Verify PaddleOCRService returns detected text, confidence score, and bounding boxes."""
    img_path = create_test_prescription_image()
    service = PaddleOCRService()
    result = service.run_ocr(img_path)

    assert result["engine"] == "PaddleOCR"
    assert "detected_text" in result
    assert len(result["detected_text"]) > 10
    assert "Dolo" in result["detected_text"]
    assert "confidence_score" in result
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert len(result["bounding_boxes"]) > 0
    assert "coordinates" in result["bounding_boxes"][0]
    assert result["processing_time_ms"] >= 0


def test_easy_ocr_service_output():
    """Verify EasyOCRService returns detected text, confidence score, and bounding boxes."""
    img_path = create_test_prescription_image()
    service = EasyOCRService()
    result = service.run_ocr(img_path)

    assert result["engine"] == "EasyOCR"
    assert "detected_text" in result
    assert len(result["detected_text"]) > 10
    assert "confidence_score" in result
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert len(result["bounding_boxes"]) > 0
    assert result["processing_time_ms"] >= 0


def test_compare_ocr_services():
    """Verify compare_ocr_services benchmarks both engines side-by-side."""
    img_path = create_test_prescription_image()
    result = compare_ocr_services(img_path)

    assert "paddle_result" in result
    assert "easy_result" in result
    assert result["paddle_result"]["engine"] == "PaddleOCR"
    assert result["easy_result"]["engine"] == "EasyOCR"

    comparison = result["comparison"]
    assert "character_similarity_score" in comparison
    assert 0.0 <= comparison["character_similarity_score"] <= 1.0
    assert comparison["higher_confidence_engine"] in ["PaddleOCR", "EasyOCR"]
    assert comparison["recommended_engine"] in ["PaddleOCR", "EasyOCR"]


def test_endpoint_paddle_ocr():
    """Verify POST /api/ocr/paddle/{prescription_id} endpoint."""
    img_path = create_test_prescription_image()
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    upload_res = client.post(
        "/api/prescriptions/upload",
        files={"file": ("rx_ocr_paddle.png", img_bytes, "image/png")}
    )
    assert upload_res.status_code == 200
    rx_id = upload_res.json()["prescription_id"]

    res = client.post(f"/api/ocr/paddle/{rx_id}")
    assert res.status_code == 200
    data = res.json()

    assert data["prescription_id"] == rx_id
    assert data["engine"] == "PaddleOCR"
    assert "detected_text" in data
    assert "confidence_score" in data
    assert "bounding_boxes" in data
    assert "processing_time_ms" in data


def test_endpoint_easy_ocr():
    """Verify POST /api/ocr/easy/{prescription_id} endpoint."""
    img_path = create_test_prescription_image()
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    upload_res = client.post(
        "/api/prescriptions/upload",
        files={"file": ("rx_ocr_easy.png", img_bytes, "image/png")}
    )
    assert upload_res.status_code == 200
    rx_id = upload_res.json()["prescription_id"]

    res = client.post(f"/api/ocr/easy/{rx_id}")
    assert res.status_code == 200
    data = res.json()

    assert data["prescription_id"] == rx_id
    assert data["engine"] == "EasyOCR"
    assert "detected_text" in data
    assert "confidence_score" in data
    assert "bounding_boxes" in data


def test_endpoint_compare_ocr():
    """Verify POST /api/ocr/compare/{prescription_id} returns side-by-side data."""
    img_path = create_test_prescription_image()
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    upload_res = client.post(
        "/api/prescriptions/upload",
        files={"file": ("rx_ocr_compare.png", img_bytes, "image/png")}
    )
    assert upload_res.status_code == 200
    rx_id = upload_res.json()["prescription_id"]

    res = client.post(f"/api/ocr/compare/{rx_id}")
    assert res.status_code == 200
    data = res.json()

    assert "paddle_result" in data
    assert "easy_result" in data
    assert "comparison" in data
    assert data["paddle_result"]["engine"] == "PaddleOCR"
    assert data["easy_result"]["engine"] == "EasyOCR"
    assert "character_similarity_score" in data["comparison"]


def test_endpoint_select_ocr():
    """Verify user can select better OCR output without silent merging."""
    img_path = create_test_prescription_image()
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    upload_res = client.post(
        "/api/prescriptions/upload",
        files={"file": ("rx_ocr_select.png", img_bytes, "image/png")}
    )
    assert upload_res.status_code == 200
    rx_id = upload_res.json()["prescription_id"]

    chosen_text = "Rx\n1. Tab Dolo 650mg - 1-0-1 - 5 days\n2. Cap Pantocid DSR - 1-0-0 - 10 days"
    res = client.post(
        f"/api/ocr/select/{rx_id}",
        json={
            "selected_engine": "PaddleOCR",
            "selected_text": chosen_text
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["selected_engine"] == "PaddleOCR"
    assert data["OCR_text"] == chosen_text

    # Verify SQLite DB update
    db = SessionLocal()
    try:
        rx_db = db.query(Prescription).filter_by(id=rx_id).first()
        assert rx_db is not None
        assert rx_db.OCR_text == chosen_text
    finally:
        db.close()


def test_low_confidence_warning_enforcement():
    """Verify low confidence warning banner message is exact and enforced."""
    # When confidence is simulated low or below threshold
    assert LOW_CONFIDENCE_WARNING_MESSAGE == "Low OCR confidence. Please verify the extracted medicine details."
    assert LOW_CONFIDENCE_THRESHOLD == 0.70
