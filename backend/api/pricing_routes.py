"""
backend/api/pricing_routes.py

FastAPI Router for Price Comparison Module:
- GET /api/price-comparison/{medicine_id}
- GET /api/price-comparison

Compares Prescribed Brand Price vs Generic Medicine Price and calculates:
- absolute_saving = brand_price - generic_price
- saving_percentage = ((brand_price - generic_price) / brand_price) * 100

Enforces statutory price disclaimer:
"Prices are approximate/demo/local-database prices. Never claim that the displayed
price is the current market price unless the application actually receives verified current data."
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.services.pricing_service import (
    PriceComparisonEngine,
    STATUTORY_PRICE_DISCLAIMER,
    PRICE_DATA_SOURCE_TYPE
)

pricing_router = APIRouter(prefix="/api/price-comparison", tags=["Price Comparison Module"])


# ---------------------------------------------------------------------------
# Pydantic Response Schemas
# ---------------------------------------------------------------------------

class ChartBarItem(BaseModel):
    label: str = Field(..., description="Entity label (e.g. Brand Medicine, Generic Medicine)")
    medicine: str = Field(..., description="Full commercial or generic title")
    price: float = Field(..., description="Price in INR")
    fill: str = Field(..., description="Visual color code")


class ChartDataPayload(BaseModel):
    bars: List[ChartBarItem]
    absolute_saving: float
    saving_percentage: float


class PriceComparisonResponse(BaseModel):
    medicine_id: str = Field(..., description="Unique medicine identifier")
    brand_medicine: str = Field(..., description="Doctor-prescribed brand medicine name")
    brand_name: str = Field(..., description="Alias for brand_medicine")
    brand_price: float = Field(..., description="Doctor prescribed brand MRP (approximate/demo/local)")
    active_ingredient: str = Field(..., description="Active pharmaceutical ingredient (API)")
    strength: str = Field(..., description="Dosage strength")
    dosage_form: str = Field(..., description="Dosage delivery form (Tablet, Capsule, etc.)")
    brand_manufacturer: Optional[str] = Field(None, description="Branded manufacturer name")
    pack_size: Optional[int] = Field(10, description="Packaging strip size")
    generic_medicine: str = Field(..., description="Bioequivalent generic medicine name")
    generic_name: str = Field(..., description="Alias for generic_medicine")
    generic_price: float = Field(..., description="Govt certified generic price (approximate/demo/local)")
    generic_manufacturer: Optional[str] = Field("Bureau of Pharma PSUs of India (BPPI)", description="Generic manufacturer")
    generic_id: Optional[str] = Field(None, description="Unique generic drug code or ID")
    absolute_saving: float = Field(..., description="Absolute monetary saving: brand_price - generic_price")
    saving_percentage: float = Field(..., description="Savings percentage: ((brand_price - generic_price) / brand_price) * 100")
    currency: str = Field("INR", description="Currency ISO code")
    currency_symbol: str = Field("₹", description="Currency symbol")
    price_type: str = Field(PRICE_DATA_SOURCE_TYPE, description="Type tag: approximate_local_database")
    is_live_market_price: bool = Field(False, description="Flag indicating live vs approximate local database")
    disclaimer: str = Field(STATUTORY_PRICE_DISCLAIMER, description="Mandatory statutory pricing disclaimer")
    chart_data: ChartDataPayload = Field(..., description="Structured payload for bar/chart visualization")


class PriceComparisonListResponse(BaseModel):
    total_comparable_medicines: int
    price_type: str
    disclaimer: str
    comparisons: List[PriceComparisonResponse]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@pricing_router.get(
    "/{medicine_id}",
    response_model=PriceComparisonResponse,
    status_code=status.HTTP_200_OK,
    summary="Get price comparison between prescribed brand and generic medicine"
)
def get_price_comparison(
    medicine_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves side-by-side price comparison for a specific medicine.

    Calculates:
    - absolute_saving = brand_price - generic_price
    - saving_percentage = ((brand_price - generic_price) / brand_price) * 100

    Outputs the 4 mandatory metrics:
    - Brand Medicine: ₹XXX
    - Generic Medicine: ₹XXX
    - Estimated Savings: ₹XXX
    - Savings Percentage: XX%

    Prices are labeled as approximate/demo/local-database prices.
    Never claims that the displayed price is the current market price without live verified data.
    """
    comparison = PriceComparisonEngine.get_medicine_price_comparison(db=db, medicine_id=medicine_id)
    if not comparison:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine '{medicine_id}' not found in database registry. Cannot perform price comparison."
        )
    return comparison


@pricing_router.get(
    "",
    response_model=PriceComparisonListResponse,
    status_code=status.HTTP_200_OK,
    summary="List price comparisons for all verified catalog medicines"
)
def list_all_price_comparisons(
    db: Session = Depends(get_db)
):
    """
    Returns price comparisons for all verified medicines in the database catalog.
    Enforces the statutory approximate pricing disclaimer on all records.
    """
    comparisons = PriceComparisonEngine.list_all_price_comparisons(db=db)
    return {
        "total_comparable_medicines": len(comparisons),
        "price_type": PRICE_DATA_SOURCE_TYPE,
        "disclaimer": STATUTORY_PRICE_DISCLAIMER,
        "comparisons": comparisons
    }
