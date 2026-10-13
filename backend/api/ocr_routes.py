"""
Module 7: Prescription OCR Preprocessing & Experimental Pipelines Route.
Provides POST /api/ocr/preprocess/{prescription_id} to execute the 8-stage
OpenCV image enhancement pipeline without overwriting the original image,
saving the preprocessed image into uploads/prescriptions/preprocessed/ and
returning comprehensive step metadata and metrics for UI comparison.
"""

import os
import time
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from fastapi import APIRouter, HTTPException, status, Depends, Body
from sqlalchemy.orm import Session
import cv2

from backend.core.database import get_db
from backend.models.sql_models import Prescription
from backend.services.preprocessing_service import (
    PreprocessingConfig,
    PRESET_CONFIGS,
    run_modular_preprocessing_pipeline
)

ocr_router = APIRouter(prefix="/api/ocr", tags=["OCR & Preprocessing"])

# Directories
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = PROJECT_ROOT / "uploads" / "prescriptions"
PREPROCESSED_DIR = UPLOAD_DIR / "preprocessed"
PREPROCESSED_DIR.mkdir(parents=True, exist_ok=True)


@ocr_router.get(
    "/preprocess/presets",
    summary="List available experimental preprocessing configuration presets"
)
def get_preprocessing_presets() -> Dict[str, Any]:
    """
    Returns the catalog of modular OpenCV preprocessing presets for clinical experimentation.
    """
    return {
        preset_key: cfg.model_dump() if hasattr(cfg, "model_dump") else cfg.dict()
        for preset_key, cfg in PRESET_CONFIGS.items()
    }


@ocr_router.post(
    "/preprocess/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Execute 8-stage OpenCV preprocessing on an uploaded prescription"
)
def preprocess_prescription_endpoint(
    prescription_id: str,
    config: Optional[PreprocessingConfig] = Body(None, description="Optional custom or preset preprocessing configuration"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Pipeline Sequence:
    Original Image -> Resize -> Grayscale -> Noise reduction -> Contrast enhancement (CLAHE)
    -> Adaptive thresholding -> Deskew -> Optional morphological processing -> Preprocessed image.

    Saves both the original and preprocessed images (never overwriting the original image).
    Returns complete pipeline metadata, metrics, and base64 preview for side-by-side UI rendering.
    """
    # 1. Fetch prescription from database
    rx = db.query(Prescription).filter_by(id=prescription_id).first()
    if not rx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID '{prescription_id}' not found."
        )

    # 2. Resolve original image file on disk
    image_rel_path = rx.image_path or ""
    orig_file_path = PROJECT_ROOT / image_rel_path.replace("\\", "/")

    if not orig_file_path.exists():
        # Fallback search directly in UPLOAD_DIR
        candidate = UPLOAD_DIR / os.path.basename(image_rel_path)
        if candidate.exists():
            orig_file_path = candidate
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Original prescription image file '{image_rel_path}' not found on storage disk."
            )

    # 3. Read original image
    cv_img = cv2.imread(str(orig_file_path), cv2.IMREAD_COLOR)
    if cv_img is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to decode original prescription image using OpenCV."
        )

    # 4. Resolve configuration (support named preset or customized hyperparameters)
    active_config = config
    if active_config is None:
        active_config = PRESET_CONFIGS["default_medical"]
    elif active_config.preset_name in PRESET_CONFIGS and active_config.preset_name != "custom":
        # Start from the base preset
        base = PRESET_CONFIGS[active_config.preset_name]
        # If user explicitly overrode fields, keep them; otherwise use preset values
        # Pydantic validation handles this gracefully
        pass

    # 5. Execute modular 8-stage preprocessing pipeline
    try:
        pipeline_result = run_modular_preprocessing_pipeline(cv_img, active_config)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OpenCV preprocessing pipeline failed: {str(e)}"
        )

    # 6. Save preprocessed image to isolated storage (Original image remains untouched)
    timestamp = int(time.time())
    preprocessed_filename = f"preprocessed_{prescription_id}_{timestamp}.png"
    target_preprocessed_path = PREPROCESSED_DIR / preprocessed_filename

    try:
        with open(target_preprocessed_path, "wb") as f:
            f.write(pipeline_result["processed_bytes"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save preprocessed image to disk: {str(e)}"
        )

    # 7. Update Prescription record in SQLite with preprocessed path
    rel_preprocessed_path = f"uploads/prescriptions/preprocessed/{preprocessed_filename}"
    rx.preprocessed_image_path = rel_preprocessed_path
    db.commit()
    db.refresh(rx)

    # 8. Return comprehensive preprocessing information
    orig_url = f"/{rx.image_path.lstrip('/')}" if rx.image_path else ""
    prep_url = f"/{rel_preprocessed_path.lstrip('/')}"

    return {
        "prescription_id": prescription_id,
        "original_image_path": rx.image_path,
        "original_image_url": orig_url,
        "preprocessed_image_path": rel_preprocessed_path,
        "preprocessed_image_url": prep_url,
        "base64_preprocessed": pipeline_result["base64_preview"],
        "pipeline_steps": pipeline_result["pipeline_steps"],
        "configuration": pipeline_result["configuration"],
        "metrics": pipeline_result["metrics"],
        "message": "Prescription image preprocessed successfully through 8-stage OpenCV pipeline."
    }


# -------------------------------------------------------------
# OCR Engine Endpoints (PaddleOCR, EasyOCR & Dual Comparison)
# -------------------------------------------------------------

import uuid
from backend.services.ocr_service import (
    paddle_service,
    easy_service,
    tesseract_service,
    compare_ocr_services,
    compare_all_ocr_services,
    LOW_CONFIDENCE_WARNING_MESSAGE
)
from backend.services.trocr_service import trocr_service
from backend.models.sql_models import OcrEvaluation
from pydantic import BaseModel, Field


class SelectOCRRequest(BaseModel):
    selected_engine: str = Field(..., description="Chosen OCR engine: 'TrOCR', 'PaddleOCR', 'EasyOCR', or 'Tesseract'")
    selected_text: str = Field(..., description="Confirmed or manually verified OCR text")
    notes: Optional[str] = Field(None, description="Optional clinician or user verification notes")


class EvaluateOCRRequest(BaseModel):
    ground_truth_text: str = Field(..., min_length=1, description="Clinician-verified ground-truth prescription text")


def _resolve_prescription_image_path(prescription_id: str, db: Session) -> Tuple[Prescription, Path]:
    """Helper to retrieve prescription and resolve best available image path (preprocessed preferred)."""
    rx = db.query(Prescription).filter_by(id=prescription_id).first()
    if not rx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID '{prescription_id}' not found."
        )

    # 1. Prefer preprocessed image
    if rx.preprocessed_image_path:
        p_path = PROJECT_ROOT / rx.preprocessed_image_path.replace("\\", "/")
        if p_path.exists():
            return rx, p_path

    # 2. Fall back to original image
    if rx.image_path:
        orig_path = PROJECT_ROOT / rx.image_path.replace("\\", "/")
        if orig_path.exists():
            return rx, orig_path

        # Try basename in UPLOAD_DIR
        candidate = UPLOAD_DIR / os.path.basename(rx.image_path)
        if candidate.exists():
            return rx, candidate

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No readable image file found for prescription '{prescription_id}'."
    )


@ocr_router.post(
    "/paddle/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Execute PaddleOCR on preprocessed prescription image"
)
def endpoint_paddle_ocr(prescription_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Executes PaddleOCR on the preprocessed prescription image.
    Returns detected text, confidence score, bounding boxes, and processing time.
    """
    rx, img_path = _resolve_prescription_image_path(prescription_id, db)
    result = paddle_service.run_ocr(str(img_path))
    result["prescription_id"] = prescription_id
    result["image_used"] = str(img_path.name)
    return result


@ocr_router.post(
    "/easy/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Execute EasyOCR on preprocessed prescription image"
)
def endpoint_easy_ocr(prescription_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Executes EasyOCR on the preprocessed prescription image.
    Returns detected text, confidence score, bounding boxes, and processing time.
    """
    rx, img_path = _resolve_prescription_image_path(prescription_id, db)
    result = easy_service.run_ocr(str(img_path))
    result["prescription_id"] = prescription_id
    result["image_used"] = str(img_path.name)
    return result


@ocr_router.post(
    "/compare/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Execute both PaddleOCR and EasyOCR side-by-side with comparison metrics"
)
def endpoint_compare_ocr(prescription_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Runs both PaddleOCR and EasyOCR concurrently on the preprocessed prescription image.
    Outputs detected text, confidence scores, processing times, and bounding boxes side-by-side.
    Flags low confidence warning if any engine has confidence below threshold.
    Strictly avoids silent merging of uncertain results.
    """
    rx, img_path = _resolve_prescription_image_path(prescription_id, db)
    result = compare_ocr_services(str(img_path))
    result["prescription_id"] = prescription_id
    result["image_used"] = str(img_path.name)
    return result


@ocr_router.post(
    "/select/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Save user-selected OCR output to prescription record"
)
def endpoint_select_ocr(
    prescription_id: str,
    payload: SelectOCRRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Persists the user's selected OCR result into the PRESCRIPTIONS database record
    without silent merging of ambiguous characters.
    """
    rx = db.query(Prescription).filter_by(id=prescription_id).first()
    if not rx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID '{prescription_id}' not found."
        )

    rx.OCR_text = payload.selected_text
    rx.raw_text = payload.selected_text
    db.commit()
    db.refresh(rx)

    return {
        "success": True,
        "prescription_id": prescription_id,
        "selected_engine": payload.selected_engine,
        "OCR_text": rx.OCR_text,
        "message": f"Successfully confirmed {payload.selected_engine} text for medicine extraction."
    }


# -------------------------------------------------------------
# TrOCR, Tesseract, Multi-Engine Comparison & Evaluation Endpoints
# -------------------------------------------------------------

@ocr_router.post(
    "/trocr/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Execute Hugging Face TrOCR on prescription image"
)
def endpoint_trocr_ocr(prescription_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Executes pretrained Hugging Face TrOCR (microsoft/trocr-base-handwritten)
    on the prescription image.
    Returns:
    {
        "engine": "TrOCR",
        "text": "...",
        "processing_time": 0.0,
        "status": "success"
    }
    """
    rx, img_path = _resolve_prescription_image_path(prescription_id, db)
    try:
        result = trocr_service.run_ocr(str(img_path))
        return {
            "engine": "TrOCR",
            "text": result.get("text", ""),
            "processing_time": result.get("processing_time", 0.0),
            "status": "success",
            "prescription_id": prescription_id,
            "processing_time_ms": result.get("processing_time_ms", 0),
            "lines_count": result.get("lines_count", 0)
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image processing validation error for TrOCR: {str(ve)}"
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"TrOCR model runtime error: {str(re)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TrOCR execution error: {str(e)}"
        )


@ocr_router.post(
    "/tesseract/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Execute Tesseract OCR on prescription image"
)
def endpoint_tesseract_ocr(prescription_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Executes Tesseract OCR on the prescription image.
    Returns detected text, confidence score, bounding boxes, and processing time.
    """
    rx, img_path = _resolve_prescription_image_path(prescription_id, db)
    result = tesseract_service.run_ocr(str(img_path))
    result["prescription_id"] = prescription_id
    result["image_used"] = str(img_path.name)
    return result


@ocr_router.post(
    "/compare-all/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Execute all 4 OCR models (TrOCR, PaddleOCR, EasyOCR, Tesseract) side-by-side"
)
def endpoint_compare_all_ocr(
    prescription_id: str,
    payload: Optional[EvaluateOCRRequest] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes TrOCR, PaddleOCR, EasyOCR, and Tesseract concurrently on the prescription image.
    Outputs side-by-side recognized text table, processing latencies, model architectures,
    and optional CER/WER evaluation if ground-truth transcription is provided.
    """
    rx, img_path = _resolve_prescription_image_path(prescription_id, db)
    gt_text = payload.ground_truth_text if payload else None
    result = compare_all_ocr_services(str(img_path), ground_truth_text=gt_text)
    result["prescription_id"] = prescription_id
    result["image_used"] = str(img_path.name)
    return result


@ocr_router.post(
    "/evaluate/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Research Evaluation: Compare TrOCR, PaddleOCR, EasyOCR, and Tesseract against Ground Truth"
)
def endpoint_evaluate_ocr(
    prescription_id: str,
    payload: EvaluateOCRRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Research Evaluation Benchmark:
    Calculates exact CER (Character Error Rate), WER (Word Error Rate), processing time,
    and medicine recognition accuracy for all 4 engines against clinician ground-truth text.
    Persists evaluation runs into SQLite ocr_evaluations database table.
    """
    rx, img_path = _resolve_prescription_image_path(prescription_id, db)
    comp_result = compare_all_ocr_services(str(img_path), ground_truth_text=payload.ground_truth_text)
    evaluations = comp_result.get("evaluations", [])

    if not evaluations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to generate evaluations. Please provide non-empty ground truth text."
        )

    # Delete previous evaluations for this prescription if re-evaluating
    db.query(OcrEvaluation).filter_by(prescription_id=prescription_id).delete()

    for ev in evaluations:
        db_eval = OcrEvaluation(
            id=f"eval-{uuid.uuid4().hex[:8]}",
            prescription_id=prescription_id,
            engine_name=ev["engine_name"],
            ground_truth_text=ev["ground_truth_text"],
            recognized_text=ev["recognized_text"],
            cer=ev["cer"],
            wer=ev["wer"],
            accuracy=ev["recognition_accuracy"],
            processing_time_ms=ev["processing_time_ms"],
            medicine_recognition_accuracy=ev["medicine_recognition_accuracy"]
        )
        db.add(db_eval)

    db.commit()

    best_cer_eng = min(evaluations, key=lambda x: x["cer"])["engine_name"] if evaluations else "TrOCR"
    fastest_eng = min(evaluations, key=lambda x: x["processing_time_ms"])["engine_name"] if evaluations else "TrOCR"

    return {
        "success": True,
        "prescription_id": prescription_id,
        "ground_truth_text": payload.ground_truth_text,
        "evaluations": evaluations,
        "total_engines_evaluated": len(evaluations),
        "best_cer_engine": best_cer_eng,
        "fastest_engine": fastest_eng,
        "message": f"Successfully evaluated 4 OCR engines. Best CER achieved by {best_cer_eng}."
    }


@ocr_router.get(
    "/evaluations/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Retrieve stored research evaluations for a prescription"
)
def endpoint_get_ocr_evaluations(
    prescription_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Retrieves stored OCR evaluation metrics from SQLite ocr_evaluations table.
    """
    evals = db.query(OcrEvaluation).filter_by(prescription_id=prescription_id).all()
    results = [
        {
            "id": e.id,
            "engine_name": e.engine_name,
            "cer": e.cer,
            "cer_percentage": round(e.cer * 100.0, 1),
            "wer": e.wer,
            "wer_percentage": round(e.wer * 100.0, 1),
            "recognition_accuracy": e.accuracy,
            "medicine_recognition_accuracy": e.medicine_recognition_accuracy,
            "processing_time_ms": e.processing_time_ms,
            "ground_truth_text": e.ground_truth_text,
            "recognized_text": e.recognized_text,
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in evals
    ]

    return {
        "prescription_id": prescription_id,
        "count": len(results),
        "evaluations": results
    }
