"""
backend/api/pharmacy_routes.py

FastAPI Router for Pharmacy Locator:
- GET /api/pharmacies/nearby

Accepts:
- lat (latitude)
- lon (longitude)
- medicine_id / drug_id
- sort_by: 'distance' | 'availability' | 'price'
- max_radius_km
- city / search_query

Returns:
Nearby pharmacies with distance calculation, phone, address, selected medicine,
availability status (AVAILABLE, LOW STOCK, OUT OF STOCK, UNKNOWN),
approximate price, last updated timestamp, and Google Maps navigation link.
"""

import os
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.services.pharmacy_locator_service import (
    PharmacyLocatorService,
    AVAILABILITY_AVAILABLE,
    AVAILABILITY_LOW_STOCK,
    AVAILABILITY_OUT_OF_STOCK,
    AVAILABILITY_UNKNOWN
)

pharmacy_api_router = APIRouter(prefix="/api/pharmacies", tags=["Pharmacy Locator & Stock"])


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class UserLocationInfo(BaseModel):
    latitude: float
    longitude: float
    source: str = Field("gps", description="'gps' or 'manual'")


class PharmacyCardItem(BaseModel):
    id: str
    pharmacy_name: str
    name: str
    address: str
    latitude: float
    longitude: float
    distance: float
    distance_km: float
    distance_text: str
    phone: str
    selected_medicine: str
    medicine_id: str
    availability_status: str = Field(
        ...,
        description="One of: AVAILABLE, LOW STOCK, OUT OF STOCK, UNKNOWN"
    )
    stock_quantity: int
    approximate_price: float
    last_updated: str
    last_updated_human: str
    is_jan_aushadhi: bool
    google_maps_url: str
    navigation_url: str


class NearbyPharmaciesResponse(BaseModel):
    success: bool = True
    user_location: UserLocationInfo
    selected_medicine: str
    sort_by: str
    total_found: int
    has_live_maps_credentials: bool
    pharmacies: List[PharmacyCardItem]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@pharmacy_api_router.get(
    "/nearby",
    response_model=NearbyPharmaciesResponse,
    status_code=status.HTTP_200_OK,
    summary="Locate nearby pharmacies and check medicine availability"
)
def get_nearby_pharmacies_endpoint(
    lat: float = Query(28.6139, description="User latitude (GPS or manual search)"),
    lon: float = Query(77.2090, description="User longitude (GPS or manual search)"),
    medicine_id: Optional[str] = Query(None, description="Medicine ID or brand name to check stock for"),
    drug_id: Optional[str] = Query(None, description="Alias for medicine_id"),
    sort_by: str = Query(
        "distance",
        description="Sort by: 'distance', 'availability', or 'price'",
        pattern="^(distance|availability|price)$"
    ),
    max_radius_km: float = Query(50.0, description="Max search radius in kilometers"),
    city: Optional[str] = Query(None, description="Manual city filter (e.g. Delhi, Bengaluru)"),
    search_query: Optional[str] = Query(None, description="Text search for pharmacy name or area"),
    db: Session = Depends(get_db)
):
    """
    Search nearby Jan Aushadhi Kendras and pharmacies.

    Each pharmacy card provides:
    - Pharmacy name
    - Address
    - Distance (km)
    - Phone
    - Selected medicine
    - Availability status (AVAILABLE, LOW STOCK, OUT OF STOCK, UNKNOWN)
    - Approximate price
    - Last updated

    Sorting options:
    1. Distance (nearest first)
    2. Availability (AVAILABLE > LOW STOCK > UNKNOWN > OUT OF STOCK)
    3. Price (lowest price first)

    Safety Invariant: Never converts UNKNOWN into AVAILABLE.
    """
    target_medicine = medicine_id or drug_id or "dolo-650"
    results = PharmacyLocatorService.get_nearby_pharmacies(
        db=db,
        user_lat=lat,
        user_lon=lon,
        medicine_id=target_medicine,
        sort_by=sort_by,
        max_radius_km=max_radius_km,
        city=city,
        search_query=search_query
    )

    has_live_maps = bool(os.getenv("GOOGLE_MAPS_API_KEY", ""))

    return {
        "success": True,
        "user_location": {
            "latitude": lat,
            "longitude": lon,
            "source": "manual" if city else "gps"
        },
        "selected_medicine": target_medicine,
        "sort_by": sort_by,
        "total_found": len(results),
        "has_live_maps_credentials": has_live_maps,
        "pharmacies": results
    }
