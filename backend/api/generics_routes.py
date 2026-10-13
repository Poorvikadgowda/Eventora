"""
backend/api/generics_routes.py

FastAPI Router for Generic Medicine Matching Engine:
- POST /api/generics/match
- POST /api/generics/match-batch

Implements strict clinical rules:
1. Active ingredient must match.
2. Strength must match.
3. Dosage form should match.
4. Only verified database records are returned.
5. Does not recommend medicines based only on similar names.
Includes mandatory statutory warning:
"Generic matching is based on database records. Confirm any substitution with a doctor or pharmacist."
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.services.generic_matching_service import (
    GenericMatchingEngine,
    STATUTORY_WARNING_MESSAGE
)

generics_router = APIRouter(prefix="/api/generics", tags=["Generic Medicine Matching Engine"])


# ---------------------------------------------------------------------------
# Request and Response Schemas
# ---------------------------------------------------------------------------

class GenericMatchRequest(BaseModel):
    confirmed_medicine_name: Optional[str] = Field(
        None,
        description="Prescribed branded medicine name",
        examples=["ExampleBrand"]
    )
    medicine_name: Optional[str] = Field(
        None,
        description="Alias for confirmed_medicine_name",
        examples=["ExampleBrand"]
    )
    active_ingredient: str = Field(
        ...,
        description="Active pharmaceutical ingredient (API/salt)",
        examples=["Paracetamol"]
    )
    strength: str = Field(
        ...,
        description="Strength of the active pharmaceutical ingredient",
        examples=["650 mg"]
    )
    dosage_form: Optional[str] = Field(
        "Tablet",
        description="Dosage form (e.g. Tablet, Capsule, Syrup)",
        examples=["Tablet"]
    )


class GenericBatchMatchRequest(BaseModel):
    medicines: List[GenericMatchRequest] = Field(
        ...,
        description="List of confirmed medicines to match against verified generics database"
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@generics_router.post(
    "/match",
    status_code=status.HTTP_200_OK,
    summary="Match confirmed prescription medicine with verified generic alternatives"
)
def endpoint_match_generic(
    payload: GenericMatchRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Searches the verified generic database for exact active ingredient and strength matches.
    Matching rules:
    1. Active ingredient must match.
    2. Strength must match.
    3. Dosage form should match.
    4. Only verified database records can be returned.
    5. Do not recommend medicines based only on similar names.

    Response includes:
    - prescribed brand
    - active ingredient
    - strength
    - dosage form
    - generic name
    - manufacturer
    - approximate price
    - verification status
    - statutory warning:
      "Generic matching is based on database records. Confirm any substitution with a doctor or pharmacist."
    """
    brand = payload.confirmed_medicine_name or payload.medicine_name or "Prescribed Brand"
    result = GenericMatchingEngine.match_generics(
        db=db,
        prescribed_brand=brand,
        active_ingredient=payload.active_ingredient,
        strength=payload.strength,
        dosage_form=payload.dosage_form or "Tablet"
    )
    return result


@generics_router.post(
    "/match-batch",
    status_code=status.HTTP_200_OK,
    summary="Batch match multiple confirmed medicines from a prescription"
)
def endpoint_match_generics_batch(
    payload: GenericBatchMatchRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Matches an array of confirmed prescription medicines against verified database generics.
    Enforces the statutory clinician disclaimer on all items.
    """
    items = [item.model_dump() for item in payload.medicines]
    return GenericMatchingEngine.match_generics_batch(db=db, items=items)
