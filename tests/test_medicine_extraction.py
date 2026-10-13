"""
Automated Test Suite for Module 9: Prescription Medicine Extraction & User Confirmation.
Tests:
- Regex and fuzzy extraction of 6 core attributes:
  1. Medicine name
  2. Active pharmaceutical ingredient
  3. Strength
  4. Dosage form
  5. Frequency/dosage text
  6. Duration if detected
- Target benchmark example: "Paracetmol 650 mg tab 1-0-1" -> Paracetamol, 650 mg, Tablet, 1-0-1
- Safety Guard: Low-confidence fuzzy matches (< 0.85) flagged as 'Possible medicine match'
- Never automatically accepts uncertain corrections
- Duration extraction: "5 days", "10 days"
- POST /api/medicines/extract/{prescription_id}
- PUT /api/medicines/confirm/{prescription_id}
- GET /api/medicines/extracted/{prescription_id}
- Clinical safety guard: Enforcing medicine identity and strength confirmation
"""

import uuid
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.database import SessionLocal
from backend.models.sql_models import Prescription, ExtractedMedicine
from backend.services.extraction_service import (
    extract_medicine_line,
    extract_all_medicines_from_text,
    match_or_fuzzy_correct_medicine,
    POSSIBLE_MATCH_LABEL,
    CONFIDENCE_HIGH_THRESHOLD
)

client = TestClient(app)


def test_benchmark_paracetmol_extraction():
    """
    Benchmark requirement:
    OCR: "Paracetmol 650 mg tab 1-0-1"
    Expected structured output:
      medicine_name: Paracetamol
      strength: 650 mg
      dosage_form: Tablet
      dosage_text: 1-0-1
    """
    raw_line = "Paracetmol 650 mg tab 1-0-1"
    parsed = extract_medicine_line(raw_line)

    assert parsed is not None
    assert parsed["medicine_name"] == "Paracetamol"
    assert parsed["corrected_name"] == "Paracetamol"
    assert parsed["strength"] == "650 mg"
    assert parsed["dosage_form"] == "Tablet"
    assert parsed["dosage_text"] == "1-0-1"
    assert parsed["confidence"] >= CONFIDENCE_HIGH_THRESHOLD
    assert parsed["confidence_level"] == "HIGH"
    assert parsed["requires_user_confirmation"] is False


def test_duration_extraction():
    """Verify that duration text such as '5 days' or '10 days' is accurately detected."""
    line1 = "1. Tab Dolo 650mg - 1-0-1 (After Food) - 5 days"
    parsed1 = extract_medicine_line(line1)
    assert parsed1 is not None
    assert parsed1["detected_name"] == "Dolo"
    assert parsed1["strength"] == "650 mg"
    assert parsed1["duration"] == "5 days"

    line2 = "Augmentin 625 Duo tab 1-0-1 for 10 days"
    parsed2 = extract_medicine_line(line2)
    assert parsed2 is not None
    assert parsed2["detected_name"] == "Augmentin"
    assert parsed2["duration"] == "10 days"


def test_low_confidence_uncertain_match_flagged():
    """
    Safety Guard:
    Uncertain / ambiguous fuzzy match MUST NEVER be automatically accepted.
    Must display 'Possible medicine match' and require explicit user confirmation.
    """
    # "Panacid" resembles "Pantocid" or "Pan" but is ambiguous (~0.80 ratio)
    fuzzy_res = match_or_fuzzy_correct_medicine("Panacid")

    assert fuzzy_res["confidence"] < CONFIDENCE_HIGH_THRESHOLD
    assert fuzzy_res["confidence_level"] == "LOW"
    assert fuzzy_res["match_label"] == POSSIBLE_MATCH_LABEL
    assert fuzzy_res["requires_user_confirmation"] is True
    assert fuzzy_res["status"] == "POSSIBLE_MATCH"


def test_extract_all_medicines_multi_line():
    """Verify extraction over complete multi-line prescription text."""
    multi_line_text = (
        "Rx\n"
        "1. Paracetmol 650 mg tab 1-0-1 for 5 days\n"
        "2. Pantocid 40 mg cap 1-0-0 empty stomach\n"
        "3. Azithromycin 500 mg tab 0-0-1 for 3 days"
    )
    items = extract_all_medicines_from_text(multi_line_text)

    assert len(items) == 3
    # Item 1: Paracetamol 650mg
    assert items[0]["medicine_name"] == "Paracetamol"
    assert items[0]["strength"] == "650 mg"
    assert items[0]["dosage_form"] == "Tablet"
    assert items[0]["dosage_text"] == "1-0-1"
    assert items[0]["duration"] == "5 days"

    # Item 2: Pantocid 40mg
    assert items[1]["detected_name"] == "Pantocid"
    assert items[1]["strength"] == "40 mg"
    assert items[1]["dosage_form"] == "Capsule"
    assert items[1]["dosage_text"] == "1-0-0"

    # Item 3: Azithromycin 500mg
    assert items[2]["detected_name"] == "Azithromycin"
    assert items[2]["strength"] == "500 mg"
    assert items[2]["dosage_form"] == "Tablet"
    assert items[2]["duration"] == "3 days"


def test_api_extract_medicines_endpoint():
    """Test POST /api/medicines/extract/{prescription_id}."""
    db = SessionLocal()
    rx_id = f"rx-test-extract-{uuid.uuid4().hex[:6]}"
    rx = Prescription(
        id=rx_id,
        user_id=None,
        image_path="/uploads/test.png",
        raw_text="Rx\n1. Paracetmol 650 mg tab 1-0-1\n2. Panacid 40 mg tab 1-0-0",
        OCR_text="Rx\n1. Paracetmol 650 mg tab 1-0-1\n2. Panacid 40 mg tab 1-0-0"
    )
    db.add(rx)
    db.commit()
    db.close()

    try:
        response = client.post(f"/api/medicines/extract/{rx_id}")
        assert response.status_code == 200
        data = response.json()

        assert data["prescription_id"] == rx_id
        assert data["total_medicines_detected"] == 2
        # Panacid triggers low confidence / possible match
        assert data["has_uncertain_matches"] is True
        assert data["all_confirmed"] is False

        meds = data["medicines"]
        assert len(meds) == 2
        assert meds[0]["medicine_name"] == "Paracetamol"
        assert meds[0]["strength"] == "650 mg"
        assert meds[0]["dosage_form"] == "Tablet"
        assert meds[0]["dosage_text"] == "1-0-1"

        # Check DB persistence in SQLite EXTRACTED_MEDICINES table
        db2 = SessionLocal()
        stored_items = db2.query(ExtractedMedicine).filter_by(prescription_id=rx_id).all()
        assert len(stored_items) == 2
        assert any(it.corrected_name == "Paracetamol" for it in stored_items)
        db2.close()

    finally:
        db_clean = SessionLocal()
        db_clean.query(ExtractedMedicine).filter_by(prescription_id=rx_id).delete()
        db_clean.query(Prescription).filter_by(id=rx_id).delete()
        db_clean.commit()
        db_clean.close()


def test_api_extract_medicines_not_found():
    """Verify 404 when extracting a non-existent prescription."""
    response = client.post("/api/medicines/extract/rx-non-existent-99999")
    assert response.status_code == 404


def test_api_confirm_medicines_endpoint_success():
    """
    Test PUT /api/medicines/confirm/{prescription_id}:
    User edits medicine name, strength, dosage form, dosage text.
    Records updated to CONFIRMED.
    """
    db = SessionLocal()
    rx_id = f"rx-test-confirm-{uuid.uuid4().hex[:6]}"
    rx = Prescription(
        id=rx_id,
        user_id=None,
        image_path="/uploads/test.png",
        raw_text="Paracetmol 650 mg tab 1-0-1"
    )
    db.add(rx)
    db.commit()
    db.close()

    try:
        payload = {
            "medicines": [
                {
                    "medicine_name": "Paracetamol",
                    "active_ingredient": "Paracetamol",
                    "strength": "650 mg",
                    "dosage_form": "Tablet",
                    "dosage_text": "1-0-1",
                    "duration": "5 days",
                    "verification_status": "CONFIRMED"
                }
            ]
        }
        response = client.put(f"/api/medicines/confirm/{rx_id}", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["all_confirmed"] is True
        assert data["has_uncertain_matches"] is False
        assert data["total_confirmed"] == 1

        # Check GET /api/medicines/extracted/{prescription_id}
        get_res = client.get(f"/api/medicines/extracted/{rx_id}")
        assert get_res.status_code == 200
        get_data = get_res.json()
        assert get_data["total_medicines"] == 1
        assert get_data["all_confirmed"] is True
        assert get_data["medicines"][0]["medicine_name"] == "Paracetamol"
        assert get_data["medicines"][0]["verification_status"] == "CONFIRMED"

    finally:
        db_clean = SessionLocal()
        db_clean.query(ExtractedMedicine).filter_by(prescription_id=rx_id).delete()
        db_clean.query(Prescription).filter_by(id=rx_id).delete()
        db_clean.commit()
        db_clean.close()


def test_api_confirm_medicines_empty_identity_rejected():
    """Clinical Rule: Reject confirmation if medicine identity is blank."""
    db = SessionLocal()
    rx_id = f"rx-test-reject-{uuid.uuid4().hex[:6]}"
    rx = Prescription(
        id=rx_id,
        user_id=None,
        image_path="/uploads/test.png",
        raw_text="Unknown 650 mg"
    )
    db.add(rx)
    db.commit()
    db.close()

    try:
        payload = {
            "medicines": [
                {
                    "medicine_name": "   ",
                    "strength": "650 mg",
                    "dosage_form": "Tablet",
                    "dosage_text": "1-0-1"
                }
            ]
        }
        response = client.put(f"/api/medicines/confirm/{rx_id}", json=payload)
        assert response.status_code == 400
        assert "empty medicine name" in response.json()["detail"].lower()

    finally:
        db_clean = SessionLocal()
        db_clean.query(Prescription).filter_by(id=rx_id).delete()
        db_clean.commit()
        db_clean.close()


def test_api_confirm_medicines_empty_strength_rejected():
    """Clinical Rule: Reject confirmation if strength is blank."""
    db = SessionLocal()
    rx_id = f"rx-test-reject-strength-{uuid.uuid4().hex[:6]}"
    rx = Prescription(
        id=rx_id,
        user_id=None,
        image_path="/uploads/test.png",
        raw_text="Paracetamol"
    )
    db.add(rx)
    db.commit()
    db.close()

    try:
        payload = {
            "medicines": [
                {
                    "medicine_name": "Paracetamol",
                    "strength": "",
                    "dosage_form": "Tablet",
                    "dosage_text": "1-0-1"
                }
            ]
        }
        response = client.put(f"/api/medicines/confirm/{rx_id}", json=payload)
        assert response.status_code == 400
        assert "empty strength" in response.json()["detail"].lower()

    finally:
        db_clean = SessionLocal()
        db_clean.query(Prescription).filter_by(id=rx_id).delete()
        db_clean.commit()
        db_clean.close()
