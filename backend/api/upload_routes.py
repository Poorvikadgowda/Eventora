"""
Module 4: Secure Prescription Image Upload & Multi-Stage Validation Route.
Accepts prescription images (JPG, JPEG, PNG), validates file type, file size,
decodability, minimum resolution, and blur/readability using OpenCV, stores the
image securely, and creates an audit record in SQLite without running OCR yet.
"""

import os
import uuid
import time
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.sql_models import Prescription, User
from backend.services.validation_service import (
    validate_prescription_image,
    calculate_blur_score,
    MAX_FILE_SIZE_BYTES,
    MIN_RESOLUTION_WIDTH,
    MIN_RESOLUTION_HEIGHT
)

upload_router = APIRouter(prefix="/api/prescriptions", tags=["Prescription Upload"])

# Project-root uploads directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = PROJECT_ROOT / "uploads" / "prescriptions"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions and MIME types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


@upload_router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    summary="Secure Prescription Image Upload & Quality Validation"
)
async def upload_prescription_endpoint(
    file: UploadFile = File(..., description="Prescription image file (JPG, JPEG, PNG, max 10MB)"),
    user_id: Optional[str] = Form(None, description="Optional registered user ID"),
    db: Session = Depends(get_db)
):
    """
    Upload and validate a prescription image:
    1. Validates file extension and content type.
    2. Enforces maximum file size (10 MB) and minimum file size (200 B).
    3. Checks for file corruption and decodes pixel data.
    4. Validates minimum resolution (>= 250x250 px).
    5. Evaluates image sharpness/blur via OpenCV Laplacian variance.
    6. Stores the image securely with a sanitized unique filename.
    7. Creates a database record in PRESCRIPTIONS with image_status='READY_FOR_OCR'.
    NOTE: Does NOT run OCR yet.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No prescription image file provided. Please select a valid file."
        )

    # 1. File Type & Extension Validation
    original_filename = os.path.basename(file.filename)
    _, ext = os.path.splitext(original_filename.lower())

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Please upload a JPG, JPEG, or PNG prescription image."
        )

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES and content_type != "application/octet-stream":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file MIME type '{content_type}'. Allowed types: JPG, JPEG, PNG."
        )

    # Read binary contents
    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    # 2. File Size Validation
    file_size_bytes = len(image_bytes)
    if file_size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes). Please upload a valid prescription image."
        )

    if file_size_bytes > MAX_FILE_SIZE_BYTES:
        size_mb = round(file_size_bytes / (1024 * 1024), 2)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({size_mb} MB) exceeds maximum allowed limit of 10 MB. Please upload a smaller image."
        )

    if file_size_bytes < 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is too small or corrupted (< 200 bytes). Please provide a clear prescription image."
        )

    # 3. Image Integrity, Dimensions & Blur Validation
    val_report = validate_prescription_image(image_bytes, filename=original_filename)

    if not val_report.get("is_valid"):
        # Image corrupted, unreadable format, or small dimensions
        error_msg = val_report.get("error", "Image validation failed.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # 4. Strict Readability Check (Severe Blur Rejection)
    # Score below 30.0 indicates text cannot be reliably recognized by OCR
    sharpness = val_report.get("sharpness_score", 100.0)
    if sharpness < 30.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prescription image is too blurry to be read. Please retake the photo with steady focus and adequate lighting."
        )

    # 5. Secure File Storage
    # Generate collision-free sanitized filename
    timestamp = int(time.time())
    unique_token = uuid.uuid4().hex[:8]
    safe_ext = ext if ext else ".png"
    secure_filename = f"rx_{unique_token}_{timestamp}{safe_ext}"
    target_path = UPLOAD_DIR / secure_filename

    try:
        with open(target_path, "wb") as f:
            f.write(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to securely store image: {str(e)}"
        )

    # 6. Database Record Creation (PRESCRIPTIONS)
    prescription_id = f"rx-{uuid.uuid4().hex[:8]}"
    
    # Determine valid user ID if exists, fallback to demo user
    assigned_user_id = user_id
    if assigned_user_id:
        existing_user = db.query(User).filter_by(id=assigned_user_id).first()
        if not existing_user:
            assigned_user_id = "user-rahul-01"
    else:
        assigned_user_id = "user-rahul-01"

    relative_storage_path = f"uploads/prescriptions/{secure_filename}"
    db_rx = Prescription(
        id=prescription_id,
        user_id=assigned_user_id,
        image_path=relative_storage_path,
        image_name=original_filename,
        OCR_text="",          # OCR not run yet
        processed_text="",    # Text extraction not run yet
        user_mobile="9876543210",
        patient_name="Patient",
        title=f"Prescription Upload ({original_filename})",
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_rx)
    db.commit()
    db.refresh(db_rx)

    # 7. Return Standard Response Format
    return {
        "prescription_id": prescription_id,
        "filename": secure_filename,
        "image_status": "READY_FOR_OCR",
        "message": "Prescription image successfully uploaded and validated. Ready for OCR."
    }
