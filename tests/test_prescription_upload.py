"""
Automated Test Suite for Module 4: Prescription Upload & Multi-Stage Validation.
Tests POST /api/prescriptions/upload endpoint, file validation, blur detection,
secure file persistence, and database record creation without running OCR.
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

client = TestClient(app)


def create_synthetic_prescription(width=600, height=500, text="Rx: Paracetamol 650mg"):
    """Creates a high-contrast sharp synthetic prescription image."""
    img = np.ones((height, width, 3), dtype=np.uint8) * 255
    cv2.putText(img, text, (40, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)
    cv2.putText(img, "Pantoprazole 40mg", (40, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)
    cv2.putText(img, "Dr. A. Sharma, MD", (40, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    success, buffer = cv2.imencode(".png", img)
    return buffer.tobytes()


def create_blurry_prescription(width=600, height=500):
    """Creates an intentionally blurred synthetic image with very low Laplacian variance (< 20)."""
    # Start with a solid gray/uniform gradient with heavy Gaussian blur
    img = np.full((height, width, 3), 200, dtype=np.uint8)
    cv2.putText(img, "Faded text", (40, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (190, 190, 190), 1)
    blurred = cv2.GaussianBlur(img, (51, 51), 0)
    success, buffer = cv2.imencode(".png", blurred)
    return buffer.tobytes()


def test_upload_valid_prescription_png():
    """Valid sharp PNG upload succeeds with 200 OK, READY_FOR_OCR, file stored, and DB record created."""
    img_bytes = create_synthetic_prescription()

    response = client.post(
        "/api/prescriptions/upload",
        files={"file": ("rx_sharp.png", img_bytes, "image/png")},
        data={"user_id": "user-rahul-01"}
    )

    assert response.status_code == 200, response.text
    data = response.json()

    # Exact return payload validation: { prescription_id, filename, image_status, message }
    assert "prescription_id" in data
    assert "filename" in data
    assert data["image_status"] == "READY_FOR_OCR"
    assert "message" in data
    assert "successfully uploaded" in data["message"].lower()

    # Check file exists in uploads/prescriptions
    saved_filename = data["filename"]
    project_root = Path(__file__).resolve().parent.parent
    saved_path = project_root / "uploads" / "prescriptions" / saved_filename
    assert saved_path.exists()
    assert saved_path.stat().st_size > 0

    # Verify SQLite database record
    db = SessionLocal()
    try:
        rx_record = db.query(Prescription).filter_by(id=data["prescription_id"]).first()
        assert rx_record is not None
        assert rx_record.image_name == "rx_sharp.png"
        assert rx_record.OCR_text == ""       # OCR must NOT have run yet
        assert rx_record.processed_text == "" # Processed text empty
    finally:
        db.close()


def test_upload_valid_prescription_jpg():
    """Valid sharp JPG upload succeeds with 200 OK."""
    img = np.ones((500, 500, 3), dtype=np.uint8) * 255
    cv2.putText(img, "Rx: Amoxicillin 500mg", (30, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)
    _, buffer = cv2.imencode(".jpg", img)

    response = client.post(
        "/api/prescriptions/upload",
        files={"file": ("sample_rx.jpg", buffer.tobytes(), "image/jpeg")}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["image_status"] == "READY_FOR_OCR"
    assert data["filename"].endswith(".jpg")


def test_upload_invalid_file_extension():
    """Rejecting files with unsupported extensions (e.g. .pdf, .txt)."""
    response = client.post(
        "/api/prescriptions/upload",
        files={"file": ("medical_report.pdf", b"%PDF-1.4 simulated pdf document content", "application/pdf")}
    )

    assert response.status_code == 400
    data = response.json()
    assert "unsupported file extension" in data["detail"].lower()


def test_upload_corrupted_image():
    """Rejecting corrupted/unreadable image bytes."""
    corrupted_bytes = b"NOT_A_VALID_IMAGE_DATA_PADDING_TO_OVER_200_BYTES_" * 10
    response = client.post(
        "/api/prescriptions/upload",
        files={"file": ("corrupted.png", corrupted_bytes, "image/png")}
    )

    assert response.status_code == 400
    data = response.json()
    assert "corrupted" in data["detail"].lower() or "decode" in data["detail"].lower() or "unreadable" in data["detail"].lower()


def test_upload_extremely_small_image():
    """Rejecting images smaller than 250x250 pixels."""
    small_img = np.ones((100, 100, 3), dtype=np.uint8) * 255
    _, buffer = cv2.imencode(".png", small_img)

    response = client.post(
        "/api/prescriptions/upload",
        files={"file": ("tiny_rx.png", buffer.tobytes(), "image/png")}
    )

    assert response.status_code == 400
    data = response.json()
    assert "small" in data["detail"].lower() or "resolution" in data["detail"].lower()


def test_upload_blurry_image():
    """Rejecting blurry images with low Laplacian sharpness (< 30.0)."""
    blurry_bytes = create_blurry_prescription(width=600, height=500)

    response = client.post(
        "/api/prescriptions/upload",
        files={"file": ("blurry_rx.png", blurry_bytes, "image/png")}
    )

    assert response.status_code == 400
    data = response.json()
    assert "blurry" in data["detail"].lower()


def test_upload_file_too_large():
    """Rejecting files exceeding 10MB."""
    large_bytes = b"0" * (10 * 1024 * 1024 + 1024)  # 10MB + 1KB
    response = client.post(
        "/api/prescriptions/upload",
        files={"file": ("large_rx.png", large_bytes, "image/png")}
    )

    assert response.status_code == 400
    data = response.json()
    assert "exceeds maximum allowed limit of 10 mb" in data["detail"].lower()
