"""
Automated Test Suite for Pretrained Hugging Face TrOCR, Multi-Engine OCR Comparison,
and Scientific Research Evaluation (CER / WER / Latency / Accuracy).
Tests:
1. Exact Character Error Rate (CER) and Word Error Rate (WER) mathematical algorithms.
2. TrOCRService modular loader and output schema.
3. TesseractOCRService output schema.
4. Multi-engine comparison across TrOCR, PaddleOCR, EasyOCR, and Tesseract.
5. Endpoints:
   - POST /api/ocr/trocr/{prescription_id}
   - POST /api/ocr/tesseract/{prescription_id}
   - POST /api/ocr/compare-all/{prescription_id}
   - POST /api/ocr/evaluate/{prescription_id}
   - GET /api/ocr/evaluations/{prescription_id}
6. Database persistence in SQLite `ocr_evaluations` table.
"""

import os
import cv2
import numpy as np
import pytest
from pathlib import Path
from PIL import Image
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.database import SessionLocal, engine
from backend.models.sql_models import Base, Prescription, OcrEvaluation
from backend.services.evaluation_service import (
    calculate_char_levenshtein,
    calculate_word_levenshtein,
    compute_cer,
    compute_wer,
    compute_medicine_recognition_accuracy,
    evaluate_ocr_result
)
from backend.services.trocr_service import TrOCRService, trocr_service
from backend.services.ocr_service import (
    TesseractOCRService,
    PaddleOCRService,
    EasyOCRService,
    compare_all_ocr_services
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test Helpers & Fixtures
# ---------------------------------------------------------------------------

def create_synthetic_handwritten_image():
    """Generates a test prescription image with cursive-like handwritten test lines."""
    project_root = Path(__file__).resolve().parent.parent
    test_dir = project_root / "uploads" / "prescriptions"
    test_dir.mkdir(parents=True, exist_ok=True)
    test_file = test_dir / "test_trocr_handwritten.png"

    img = np.ones((600, 900, 3), dtype=np.uint8) * 255
    cv2.putText(img, "Rx Doctor Prescription", (30, 60), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 1.0, (20, 20, 20), 2)
    cv2.putText(img, "Paracetamol 650 mg tab 1-0-1", (30, 140), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 0.9, (20, 20, 20), 2)
    cv2.putText(img, "Pantocid DSR 40mg 1-0-0", (30, 220), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 0.9, (20, 20, 20), 2)
    cv2.putText(img, "Augmentin 625 Duo 1-0-1", (30, 300), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 0.9, (20, 20, 20), 2)
    cv2.imwrite(str(test_file), img)
    return str(test_file)


@pytest.fixture
def test_prescription():
    """Seeds a test prescription database record with an actual image on disk."""
    Base.metadata.create_all(bind=engine)
    img_path = create_synthetic_handwritten_image()
    db = SessionLocal()
    rx_id = "test-rx-trocr-001"
    
    # Remove existing record if present
    db.query(OcrEvaluation).filter_by(prescription_id=rx_id).delete()
    db.query(Prescription).filter_by(id=rx_id).delete()
    db.commit()

    rx = Prescription(
        id=rx_id,
        user_id=None,
        image_path=img_path,
        raw_text="Pending OCR extraction"
    )
    db.add(rx)
    db.commit()
    db.refresh(rx)
    db.close()

    yield rx_id

    # Teardown
    db = SessionLocal()
    db.query(OcrEvaluation).filter_by(prescription_id=rx_id).delete()
    db.query(Prescription).filter_by(id=rx_id).delete()
    db.commit()
    db.close()


# ---------------------------------------------------------------------------
# 1. CER & WER Mathematical Correctness Tests
# ---------------------------------------------------------------------------

def test_char_levenshtein_distance():
    """Test character-level edit distance."""
    assert calculate_char_levenshtein("kitten", "sitting") == 3
    assert calculate_char_levenshtein("Paracetamol", "Paracetamol") == 0
    assert calculate_char_levenshtein("", "Dolo") == 4
    assert calculate_char_levenshtein("Dolo", "") == 4
    assert calculate_char_levenshtein("Paracetmol", "Paracetamol") == 1  # insertion of 'a'


def test_word_levenshtein_distance():
    """Test word-level token edit distance."""
    ref = ["Tab", "Dolo", "650mg", "1-0-1"]
    hyp_identical = ["Tab", "Dolo", "650mg", "1-0-1"]
    hyp_sub = ["Tab", "Paracetamol", "650mg", "1-0-1"]
    hyp_del = ["Tab", "Dolo", "650mg"]

    assert calculate_word_levenshtein(ref, hyp_identical) == 0
    assert calculate_word_levenshtein(ref, hyp_sub) == 1
    assert calculate_word_levenshtein(ref, hyp_del) == 1


def test_compute_cer_formula():
    """CER = (Substitutions + Deletions + Insertions) / Total_Characters_in_Reference."""
    ref = "Paracetamol 650mg"
    # Exact match: CER = 0
    assert compute_cer(ref, ref) == 0.0

    # 1 deletion out of 17 chars: CER = 1/17 = 0.0588
    hyp_del = "Paracetmol 650mg"
    cer = compute_cer(ref, hyp_del)
    assert 0.05 <= cer <= 0.06

    # Empty ref with non-empty hyp
    assert compute_cer("", "Test") == 1.0


def test_compute_wer_formula():
    """WER = (Word_Substitutions + Word_Deletions + Word_Insertions) / Total_Words."""
    ref = "Tab Dolo 650mg 1-0-1"
    # Exact match: WER = 0
    assert compute_wer(ref, ref) == 0.0

    # 1 word change in 4 words: WER = 1/4 = 0.25
    hyp = "Tab Calpol 650mg 1-0-1"
    assert compute_wer(ref, hyp) == 0.25


def test_evaluate_ocr_result_schema():
    """Verify evaluate_ocr_result returns all scientific benchmark metrics."""
    res = evaluate_ocr_result(
        engine_name="TrOCR",
        hypothesis_text="Paracetamol 650 mg tab 1-0-1",
        ground_truth_text="Paracetamol 650 mg tab 1-0-1",
        processing_time_ms=185.4
    )
    assert res["engine_name"] == "TrOCR"
    assert res["cer"] == 0.0
    assert res["wer"] == 0.0
    assert res["recognition_accuracy"] == 100.0
    assert res["processing_time_ms"] == 185.4
    assert res["medicine_recognition_accuracy"] >= 0.0


# ---------------------------------------------------------------------------
# 2. TrOCR Service Unit Tests
# ---------------------------------------------------------------------------

def test_trocr_service_initialization():
    """Verify TrOCRService initializes with correct defaults and does not reload on every call."""
    service = TrOCRService(model_name_or_path="microsoft/trocr-base-handwritten")
    assert service.engine_name == "TrOCR"
    assert service.model_name_or_path == "microsoft/trocr-base-handwritten"
    assert service.processor is None
    assert service.model is None


def test_trocr_service_image_preprocessing():
    """Verify TrOCR image preprocessing produces an RGB PIL image."""
    img_path = create_synthetic_handwritten_image()
    service = TrOCRService()

    # From file path
    pil_from_path = service.preprocess_image(img_path)
    assert isinstance(pil_from_path, Image.Image)
    assert pil_from_path.mode == "RGB"

    # From OpenCV numpy array
    cv_arr = cv2.imread(img_path)
    pil_from_cv = service.preprocess_image(cv_arr)
    assert isinstance(pil_from_cv, Image.Image)
    assert pil_from_cv.mode == "RGB"


def test_trocr_service_line_segmentation():
    """Verify TrOCR service segments prescription into line crops."""
    img_path = create_synthetic_handwritten_image()
    service = TrOCRService()
    pil_img = service.preprocess_image(img_path)

    crops = service.segment_prescription_lines(pil_img)
    assert isinstance(crops, list)
    assert len(crops) >= 1
    for crop in crops:
        assert isinstance(crop, Image.Image)


def test_trocr_service_inference_mocked():
    """Verify TrOCR run_ocr returns the exact required schema."""
    img_path = create_synthetic_handwritten_image()
    service = TrOCRService()

    # Mock model and processor to test inference pipeline logic and output schema
    service.is_loaded = True
    service.processor = MagicMock()
    service.processor.return_value.pixel_values.to.return_value = MagicMock()
    service.processor.batch_decode.return_value = ["Paracetamol 650mg tab 1-0-1"]
    service.model = MagicMock()
    service.model.generate.return_value = MagicMock()
    service.device = "cpu"

    result = service.run_ocr(img_path)

    assert result["engine"] == "TrOCR"
    assert "Paracetamol 650mg tab 1-0-1" in result["text"]
    assert "processing_time" in result
    assert result["processing_time"] >= 0.0
    assert result["status"] == "success"
    # Strictly do not invent uncalibrated confidence
    assert result["confidence"] is None


# ---------------------------------------------------------------------------
# 3. Tesseract OCR Service Tests
# ---------------------------------------------------------------------------

def test_tesseract_ocr_service_output():
    """Verify TesseractOCRService returns detected text, confidence score, and status."""
    img_path = create_synthetic_handwritten_image()
    service = TesseractOCRService()
    result = service.run_ocr(img_path)

    assert result["engine"] == "Tesseract"
    assert "detected_text" in result
    assert len(result["detected_text"]) > 5
    assert "confidence_score" in result
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert result["status"] == "SUCCESS"
    assert result["processing_time_ms"] >= 0


# ---------------------------------------------------------------------------
# 4. Multi-Engine OCR Comparison Tests
# ---------------------------------------------------------------------------

def test_compare_all_ocr_services():
    """Verify compare_all_ocr_services benchmarks TrOCR, PaddleOCR, EasyOCR, and Tesseract."""
    img_path = create_synthetic_handwritten_image()
    ground_truth = "Paracetamol 650 mg tab 1-0-1\nPantocid DSR 40mg 1-0-0"

    result = compare_all_ocr_services(img_path, ground_truth_text=ground_truth)

    assert "trocr_result" in result
    assert "paddle_result" in result
    assert "easy_result" in result
    assert "tesseract_result" in result
    assert "engines" in result

    # Verify all 4 engines are represented in the engines table
    engine_names = [e["engine"] for e in result["engines"]]
    assert "TrOCR" in engine_names
    assert "PaddleOCR" in engine_names
    assert "EasyOCR" in engine_names
    assert "Tesseract" in engine_names

    # Verify research evaluation metrics are computed when ground truth is provided
    assert "evaluations" in result
    assert len(result["evaluations"]) == 4
    for ev in result["evaluations"]:
        assert "engine_name" in ev
        assert "cer" in ev
        assert "wer" in ev
        assert "processing_time_ms" in ev
        assert "recognition_accuracy" in ev


# ---------------------------------------------------------------------------
# 5. FastApi Endpoints Integration Tests
# ---------------------------------------------------------------------------

def test_endpoint_trocr_ocr(test_prescription):
    """Verify POST /api/ocr/trocr/{prescription_id} endpoint returns the exact required schema."""
    with patch.object(trocr_service, "run_ocr") as mock_run:
        mock_run.return_value = {
            "engine": "TrOCR",
            "text": "Paracetamol 650 mg tab 1-0-1",
            "processing_time": 0.245,
            "processing_time_ms": 245,
            "status": "success",
            "lines_count": 1,
            "confidence": None
        }

        response = client.post(f"/api/ocr/trocr/{test_prescription}")
        assert response.status_code == 200
        data = response.json()

        # Strict specification assertions
        assert data["engine"] == "TrOCR"
        assert data["text"] == "Paracetamol 650 mg tab 1-0-1"
        assert data["processing_time"] == 0.245
        assert data["status"] == "success"
        assert data["prescription_id"] == test_prescription


def test_endpoint_tesseract_ocr(test_prescription):
    """Verify POST /api/ocr/tesseract/{prescription_id} endpoint."""
    response = client.post(f"/api/ocr/tesseract/{test_prescription}")
    assert response.status_code == 200
    data = response.json()
    assert data["engine"] == "Tesseract"
    assert "detected_text" in data
    assert data["status"] == "SUCCESS"


def test_endpoint_compare_all_ocr(test_prescription):
    """Verify POST /api/ocr/compare-all/{prescription_id} benchmarks all 4 models."""
    response = client.post(
        f"/api/ocr/compare-all/{test_prescription}",
        json={"ground_truth_text": "Rx\n1. Tab Dolo 650mg 1-0-1"}
    )
    assert response.status_code == 200
    data = response.json()

    assert "engines" in data
    assert len(data["engines"]) == 4
    assert "comparison" in data
    assert data["comparison"]["total_engines_compared"] == 4


def test_endpoint_evaluate_and_persist_evaluations(test_prescription):
    """
    Verify POST /api/ocr/evaluate/{prescription_id}:
    1. Computes CER & WER for all 4 models.
    2. Persists the records into SQLite `ocr_evaluations` table.
    3. GET /api/ocr/evaluations/{prescription_id} retrieves persisted records.
    """
    ground_truth = "Rx\n1. Tab Dolo 650mg - 1-0-1 - 5 days\n2. Cap Pantocid DSR - 1-0-0 - 10 days"

    eval_response = client.post(
        f"/api/ocr/evaluate/{test_prescription}",
        json={"ground_truth_text": ground_truth}
    )
    assert eval_response.status_code == 200
    eval_data = eval_response.json()

    assert eval_data["success"] is True
    assert eval_data["total_engines_evaluated"] == 4
    assert "best_cer_engine" in eval_data
    assert "fastest_engine" in eval_data
    assert len(eval_data["evaluations"]) == 4

    # Verify each evaluated engine has genuine metrics
    for ev in eval_data["evaluations"]:
        assert 0.0 <= ev["cer"]
        assert 0.0 <= ev["wer"]
        assert 0.0 <= ev["recognition_accuracy"] <= 100.0

    # Retrieve from GET /api/ocr/evaluations/{prescription_id}
    get_response = client.get(f"/api/ocr/evaluations/{test_prescription}")
    assert get_response.status_code == 200
    db_data = get_response.json()

    assert db_data["count"] == 4
    persisted_engines = [e["engine_name"] for e in db_data["evaluations"]]
    assert "TrOCR" in persisted_engines
    assert "PaddleOCR" in persisted_engines
    assert "EasyOCR" in persisted_engines
    assert "Tesseract" in persisted_engines
