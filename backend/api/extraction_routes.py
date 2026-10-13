"""
Module 9: Prescription Medicine Extraction & User Confirmation Routes.
Exposes:
- POST /api/medicines/extract/{prescription_id}
- PUT /api/medicines/confirm/{prescription_id}
- GET /api/medicines/extracted/{prescription_id}
"""

import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.sql_models import Prescription, ExtractedMedicine
from backend.services.extraction_service import (
    extract_all_medicines_from_text,
    POSSIBLE_MATCH_LABEL
)

extraction_router = APIRouter(prefix="/api/medicines", tags=["Medicine Extraction & Verification"])


class ExtractTextRequest(BaseModel):
    raw_text: Optional[str] = Field(None, description="Optional raw or corrected OCR text override")


class ConfirmedMedicineItem(BaseModel):
    id: Optional[str] = Field(None, description="Extracted medicine item ID")
    medicine_name: str = Field(..., description="Confirmed brand or generic name")
    active_ingredient: Optional[str] = Field(None, description="Active pharmaceutical ingredient")
    strength: str = Field(..., description="Confirmed strength (e.g. 650 mg)")
    dosage_form: str = Field(..., description="Confirmed dosage form (e.g. Tablet, Capsule)")
    dosage_text: str = Field(..., description="Confirmed dosage/frequency instructions (e.g. 1-0-1)")
    duration: Optional[str] = Field("", description="Optional duration (e.g. 5 days)")
    verification_status: Optional[str] = Field("CONFIRMED", description="Verification status")


class ConfirmMedicinesPayload(BaseModel):
    medicines: List[ConfirmedMedicineItem] = Field(..., description="List of user-verified and edited medicines")


@extraction_router.post(
    "/extract/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Extract structured medicines from prescription OCR text"
)
def extract_prescription_medicines(
    prescription_id: str,
    payload: Optional[ExtractTextRequest] = Body(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Extracts medicine information from OCR text using spaCy, regex, and fuzzy database lookup:
    1. Medicine name (with fuzzy typo correction)
    2. Active pharmaceutical ingredient (API)
    3. Strength
    4. Dosage form
    5. Frequency / dosage text
    6. Duration if detected

    Enforces safety rules:
    - Never automatically accepts uncertain corrections.
    - Low confidence matches (< 0.85) are flagged with 'Possible medicine match' and require confirmation.
    - Persists extracted medicines into SQLite EXTRACTED_MEDICINES table.
    """
    rx = db.query(Prescription).filter_by(id=prescription_id).first()
    if not rx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID '{prescription_id}' not found."
        )

    # Determine OCR text source
    ocr_text = (payload.raw_text if payload and payload.raw_text else None) or rx.OCR_text or rx.raw_text or ""
    if not ocr_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prescription contains no OCR text. Please run OCR before medicine extraction."
        )

    # Run extraction engine
    extracted_items = extract_all_medicines_from_text(ocr_text, db=db, prescription_id=prescription_id)

    # Clean old extracted records for this prescription if re-extracting
    db.query(ExtractedMedicine).filter_by(prescription_id=prescription_id).delete()

    # Save to SQLite EXTRACTED_MEDICINES table
    for item in extracted_items:
        db_em = ExtractedMedicine(
            id=item["id"],
            prescription_id=prescription_id,
            detected_name=item["detected_name"],
            corrected_name=item["corrected_name"],
            active_ingredient=item["active_ingredient"],
            strength=item["strength"],
            dosage_form=item["dosage_form"],
            dosage_text=item["dosage_text"],
            duration=item.get("duration", ""),
            confidence=item["confidence"],
            verification_status=item["verification_status"]
        )
        db.add(db_em)

    db.commit()

    has_uncertain = any(m["requires_user_confirmation"] for m in extracted_items)
    all_confirmed = not has_uncertain and len(extracted_items) > 0

    return {
        "prescription_id": prescription_id,
        "total_medicines_detected": len(extracted_items),
        "has_uncertain_matches": has_uncertain,
        "all_confirmed": all_confirmed,
        "medicines": extracted_items,
        "message": (
            "Extracted medicines require your verification before generic matching."
            if has_uncertain
            else "Extracted medicines successfully identified. Ready for user verification."
        )
    }


@extraction_router.put(
    "/confirm/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Confirm or edit extracted medicine details before generic substitution"
)
def confirm_prescription_medicines(
    prescription_id: str,
    payload: ConfirmMedicinesPayload,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    User Confirmation Screen Endpoint:
    Allows user to edit Medicine Name, Strength, Dosage Form, and Dosage Text.
    Strictly verifies that medicine identity and strength are confirmed before generic matching.
    Marks status as CONFIRMED in SQLite.
    """
    rx = db.query(Prescription).filter_by(id=prescription_id).first()
    if not rx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prescription with ID '{prescription_id}' not found."
        )

    if not payload.medicines:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one medicine must be confirmed to proceed with generic matching."
        )

    # Validate that every medicine has non-empty identity and strength
    for idx, med in enumerate(payload.medicines):
        if not med.medicine_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Medicine item #{idx + 1} has an empty medicine name. Identity must be confirmed."
            )
        if not med.strength.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Medicine '{med.medicine_name}' has an empty strength. Strength must be confirmed."
            )

    # Clean existing rows and insert updated confirmed records
    db.query(ExtractedMedicine).filter_by(prescription_id=prescription_id).delete()

    confirmed_list = []
    for med in payload.medicines:
        med_id = med.id or f"ext-conf-{uuid.uuid4().hex[:8]}"
        act_ing = med.active_ingredient or med.medicine_name

        db_em = ExtractedMedicine(
            id=med_id,
            prescription_id=prescription_id,
            detected_name=med.medicine_name,
            corrected_name=med.medicine_name,
            active_ingredient=act_ing,
            strength=med.strength,
            dosage_form=med.dosage_form,
            dosage_text=med.dosage_text,
            duration=med.duration or "",
            confidence=1.0,
            verification_status="CONFIRMED"
        )
        db.add(db_em)

        confirmed_list.append({
            "id": med_id,
            "prescription_id": prescription_id,
            "detected_name": med.medicine_name,
            "corrected_name": med.medicine_name,
            "medicine_name": med.medicine_name,
            "active_ingredient": act_ing,
            "strength": med.strength,
            "dosage_form": med.dosage_form,
            "dosage_text": med.dosage_text,
            "duration": med.duration or "",
            "confidence": 1.0,
            "confidence_level": "HIGH",
            "requires_user_confirmation": False,
            "verification_status": "CONFIRMED"
        })

    db.commit()

    return {
        "success": True,
        "prescription_id": prescription_id,
        "total_confirmed": len(confirmed_list),
        "all_confirmed": True,
        "has_uncertain_matches": False,
        "medicines": confirmed_list,
        "message": "Medicine identities and strengths successfully confirmed. Ready for generic substitution matching."
    }


@extraction_router.get(
    "/extracted/{prescription_id}",
    status_code=status.HTTP_200_OK,
    summary="Retrieve extracted medicines for a prescription"
)
def get_extracted_prescription_medicines(
    prescription_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns stored extracted medicines from the SQLite EXTRACTED_MEDICINES table.
    """
    items = db.query(ExtractedMedicine).filter_by(prescription_id=prescription_id).all()
    res = [
        {
            "id": em.id,
            "prescription_id": em.prescription_id,
            "detected_name": em.detected_name,
            "corrected_name": em.corrected_name,
            "medicine_name": em.corrected_name,
            "active_ingredient": em.active_ingredient,
            "strength": em.strength,
            "dosage_form": em.dosage_form,
            "dosage_text": em.dosage_text,
            "duration": em.duration or "",
            "confidence": em.confidence,
            "confidence_level": "HIGH" if em.confidence >= 0.85 else "LOW",
            "match_label": "Verified Registry Match" if em.confidence >= 0.85 else POSSIBLE_MATCH_LABEL,
            "requires_user_confirmation": em.verification_status != "CONFIRMED",
            "verification_status": em.verification_status
        }
        for em in items
    ]

    has_uncertain = any(m["requires_user_confirmation"] for m in res)
    return {
        "prescription_id": prescription_id,
        "total_medicines": len(res),
        "has_uncertain_matches": has_uncertain,
        "all_confirmed": not has_uncertain and len(res) > 0,
        "medicines": res
    }
