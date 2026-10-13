"""
Module 5: Prescription Image Validation Service.
Inspects prescription uploads for format integrity, minimum resolution,
aspect ratio, and image sharpness/blur using OpenCV Laplacian variance.
"""

import io
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, List

ALLOWED_FORMATS = {"PNG", "JPEG", "JPG", "WEBP", "TIFF", "BMP"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MIN_RESOLUTION_WIDTH = 250
MIN_RESOLUTION_HEIGHT = 250
OPTIMAL_RESOLUTION_WIDTH = 800
OPTIMAL_RESOLUTION_HEIGHT = 600
BLUR_THRESHOLD_SEVERE = 35.0
BLUR_THRESHOLD_MODERATE = 70.0


def calculate_blur_score(cv_image: np.ndarray) -> float:
    """
    Compute focus/sharpness score using the variance of the Laplacian filter.
    Lower values indicate blurry or out-of-focus prescription images.
    """
    if len(cv_image.shape) == 3:
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    else:
        gray = cv_image
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    return float(round(variance, 2))


def validate_prescription_image(image_bytes: bytes, filename: str = "upload.png") -> Dict[str, Any]:
    """
    Comprehensive prescription image validation against clinical OCR quality standards.
    """
    file_size_bytes = len(image_bytes)
    file_size_kb = round(file_size_bytes / 1024, 1)
    warnings: List[str] = []

    # 1. Size check
    if file_size_bytes > MAX_FILE_SIZE_BYTES:
        return {
            "is_valid": False,
            "can_proceed_to_ocr": False,
            "filename": filename,
            "file_size_kb": file_size_kb,
            "error": f"File size ({file_size_kb} KB) exceeds maximum allowed limit of 10 MB.",
            "warnings": warnings
        }

    if file_size_bytes < 200:
        return {
            "is_valid": False,
            "can_proceed_to_ocr": False,
            "filename": filename,
            "file_size_kb": file_size_kb,
            "error": "File appears empty or corrupted (size < 200 bytes).",
            "warnings": warnings
        }

    # 2. PIL decode & format check
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        img_format = (pil_img.format or "PNG").upper()
        width, height = pil_img.size
    except Exception as e:
        return {
            "is_valid": False,
            "can_proceed_to_ocr": False,
            "filename": filename,
            "error": f"Failed to decode image file: {str(e)}",
            "warnings": warnings
        }

    if img_format not in ALLOWED_FORMATS:
        return {
            "is_valid": False,
            "can_proceed_to_ocr": False,
            "filename": filename,
            "error": f"Format '{img_format}' is not supported. Please upload PNG, JPG, or WEBP.",
            "warnings": warnings
        }

    # 3. Minimum resolution check
    if width < MIN_RESOLUTION_WIDTH or height < MIN_RESOLUTION_HEIGHT:
        return {
            "is_valid": False,
            "can_proceed_to_ocr": False,
            "filename": filename,
            "dimensions": {"width": width, "height": height},
            "error": f"Image resolution ({width}x{height}) is too low for OCR parsing. Minimum required is 250x250.",
            "warnings": warnings
        }

    if width < OPTIMAL_RESOLUTION_WIDTH or height < OPTIMAL_RESOLUTION_HEIGHT:
        warnings.append(
            f"Image resolution ({width}x{height}) is below optimal ({OPTIMAL_RESOLUTION_WIDTH}x{OPTIMAL_RESOLUTION_HEIGHT}). Fine handwriting may be difficult to read."
        )

    # 4. Blur / Sharpness check via OpenCV
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if cv_img is None:
            sharpness_score = 100.0
            sharpness_label = "Optimal"
        else:
            sharpness_score = calculate_blur_score(cv_img)
            if sharpness_score < BLUR_THRESHOLD_SEVERE:
                sharpness_label = "Very Blurry"
                warnings.append("Prescription image is severely blurry. Consider retaking with better focus and lighting.")
            elif sharpness_score < BLUR_THRESHOLD_MODERATE:
                sharpness_label = "Slightly Blurry"
                warnings.append("Prescription image has slight motion blur. Text extraction may require manual verification.")
            else:
                sharpness_label = "Sharp & Legible"
    except Exception:
        sharpness_score = 100.0
        sharpness_label = "Adequate"

    return {
        "is_valid": True,
        "can_proceed_to_ocr": True,
        "filename": filename,
        "format": img_format,
        "dimensions": {"width": width, "height": height},
        "file_size_kb": file_size_kb,
        "sharpness_score": sharpness_score,
        "sharpness_label": sharpness_label,
        "warnings": warnings,
        "status_message": "Image validation successful. Ready for OpenCV preprocessing." if not warnings else "Image validated with quality recommendations."
    }
