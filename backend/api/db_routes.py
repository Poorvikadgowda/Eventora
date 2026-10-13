"""
REST API Endpoints for GenericSwap Relational Database Layer.
Provides endpoints for MEDICINES, GENERICS, PHARMACIES, INVENTORY, PRESCRIPTIONS,
EXTRACTED_MEDICINES, and SEARCH_HISTORY.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.db_schemas import (
    UserCreate,
    UserResponse,
    MedicineCreate,
    MedicineResponse,
    MedicineDetailResponse,
    GenericMedicineCreate,
    GenericMedicineResponse,
    PharmacyCreate,
    PharmacyResponse,
    NearbyPharmacyResponse,
    PharmacyInventoryCreate,
    PharmacyInventoryResponse,
    PrescriptionCreate,
    PrescriptionResponse,
    PrescriptionDetailResponse,
    ExtractedMedicineUpdate,
    ExtractedMedicineResponse,
    SearchHistoryResponse
)
from backend import crud

db_router = APIRouter(prefix="/api/db", tags=["Relational Database Layer"])


# -------------------------------------------------------------
# 1. MEDICINES ENDPOINTS
# -------------------------------------------------------------

@db_router.get("/medicines", response_model=List[MedicineResponse])
def get_medicines_list(
    search: Optional[str] = Query(None, description="Search by brand name, generic name, or salt"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List verified branded medicines with optional search filter.
    """
    return crud.list_medicines(db, skip=skip, limit=limit, search=search)


@db_router.get("/medicines/{medicine_id}", response_model=MedicineDetailResponse)
def get_medicine_detail(medicine_id: str, db: Session = Depends(get_db)):
    """
    Get detailed medicine record with bioequivalent generic alternatives.
    """
    med = crud.get_medicine(db, medicine_id)
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine '{medicine_id}' not found in registry.")
    return med


@db_router.post("/medicines", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine_endpoint(medicine_in: MedicineCreate, db: Session = Depends(get_db)):
    """
    Register a verified branded medicine in the database.
    """
    existing = crud.get_medicine(db, medicine_in.id)
    if existing:
        raise HTTPException(status_code=400, detail=f"Medicine '{medicine_in.id}' already exists.")
    return crud.create_medicine(db, medicine_in)


# -------------------------------------------------------------
# 2. GENERIC MEDICINES ENDPOINTS
# -------------------------------------------------------------

@db_router.get("/generics", response_model=List[GenericMedicineResponse])
def get_all_generics(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List all verified Jan Aushadhi & certified generic medicines.
    """
    return crud.list_generics(db, skip=skip, limit=limit)


@db_router.get("/generics/by-medicine/{medicine_id}", response_model=List[GenericMedicineResponse])
def get_generics_for_medicine_endpoint(medicine_id: str, db: Session = Depends(get_db)):
    """
    Get 1-to-1 bioequivalent generic alternatives for a specific branded medicine.
    """
    return crud.get_generics_for_medicine(db, medicine_id)


@db_router.post("/generics", response_model=GenericMedicineResponse, status_code=status.HTTP_201_CREATED)
def create_generic_endpoint(generic_in: GenericMedicineCreate, db: Session = Depends(get_db)):
    """
    Register a verified bioequivalent generic alternative.
    """
    # Ensure parent medicine exists
    med = crud.get_medicine(db, generic_in.medicine_id)
    if not med:
        raise HTTPException(status_code=400, detail=f"Parent medicine '{generic_in.medicine_id}' does not exist.")
    return crud.create_generic_medicine(db, generic_in)


# -------------------------------------------------------------
# 3. PHARMACIES ENDPOINTS
# -------------------------------------------------------------

@db_router.get("/pharmacies", response_model=List[PharmacyResponse])
def get_pharmacies_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List registered pharmacy retail counters & PMBJP Jan Aushadhi Kendras.
    """
    return crud.list_pharmacies(db, skip=skip, limit=limit)


@db_router.get("/pharmacies/nearby", response_model=List[NearbyPharmacyResponse])
def get_nearby_pharmacies_endpoint(
    lat: float = Query(28.6139, description="User latitude"),
    lon: float = Query(77.2090, description="User longitude"),
    radius: float = Query(20.0, description="Search radius in kilometers"),
    medicine_id: Optional[str] = Query(None, description="Check stock for target medicine"),
    db: Session = Depends(get_db)
):
    """
    Geospatial nearby pharmacy search sorted by Haversine distance with demo stock status.
    """
    return crud.get_nearby_pharmacies_db(
        db=db,
        user_lat=lat,
        user_lon=lon,
        max_radius_km=radius,
        medicine_id=medicine_id
    )


@db_router.get("/pharmacies/{pharmacy_id}", response_model=PharmacyResponse)
def get_pharmacy_detail(pharmacy_id: str, db: Session = Depends(get_db)):
    """
    Get pharmacy store details.
    """
    pharm = crud.get_pharmacy(db, pharmacy_id)
    if not pharm:
        raise HTTPException(status_code=404, detail=f"Pharmacy '{pharmacy_id}' not found.")
    return pharm


@db_router.post("/pharmacies", response_model=PharmacyResponse, status_code=status.HTTP_201_CREATED)
def create_pharmacy_endpoint(pharm_in: PharmacyCreate, db: Session = Depends(get_db)):
    """
    Register a pharmacy store counter.
    """
    existing = crud.get_pharmacy(db, pharm_in.id)
    if existing:
        raise HTTPException(status_code=400, detail=f"Pharmacy '{pharm_in.id}' already exists.")
    return crud.create_pharmacy(db, pharm_in)


# -------------------------------------------------------------
# 4. PHARMACY INVENTORY ENDPOINTS
# -------------------------------------------------------------

@db_router.get("/inventory/pharmacy/{pharmacy_id}", response_model=List[PharmacyInventoryResponse])
def get_inventory_for_pharmacy_endpoint(pharmacy_id: str, db: Session = Depends(get_db)):
    """
    Get all stocked medicines for a pharmacy counter (DEMO DATA).
    """
    return crud.get_inventory_for_pharmacy(db, pharmacy_id)


@db_router.get("/inventory/medicine/{medicine_id}", response_model=List[PharmacyInventoryResponse])
def get_inventory_for_medicine_endpoint(medicine_id: str, db: Session = Depends(get_db)):
    """
    Get stock across all stockists for a specific medicine (DEMO DATA).
    """
    return crud.get_inventory_for_medicine(db, medicine_id)


@db_router.post("/inventory", response_model=PharmacyInventoryResponse)
def upsert_inventory_endpoint(inv_in: PharmacyInventoryCreate, db: Session = Depends(get_db)):
    """
    Add or update inventory quantity, status, and price (DEMO DATA).
    """
    return crud.upsert_inventory_item(
        db=db,
        pharmacy_id=inv_in.pharmacy_id,
        medicine_id=inv_in.medicine_id,
        stock_quantity=inv_in.stock_quantity,
        approximate_price=inv_in.approximate_price,
        availability_status=inv_in.availability_status
    )


# -------------------------------------------------------------
# 5. PRESCRIPTIONS & EXTRACTED MEDICINES ENDPOINTS
# -------------------------------------------------------------

@db_router.post("/prescriptions", response_model=PrescriptionDetailResponse, status_code=status.HTTP_201_CREATED)
def save_prescription_endpoint(rx_in: PrescriptionCreate, db: Session = Depends(get_db)):
    """
    Save scanned prescription record and attach extracted medicines.
    """
    return crud.create_prescription(db, rx_in)


@db_router.get("/prescriptions/{prescription_id}", response_model=PrescriptionDetailResponse)
def get_prescription_endpoint(prescription_id: str, db: Session = Depends(get_db)):
    """
    Get prescription record with all extracted medicine entities.
    """
    rx = crud.get_prescription(db, prescription_id)
    if not rx:
        raise HTTPException(status_code=404, detail=f"Prescription '{prescription_id}' not found.")
    return rx


@db_router.get("/prescriptions/user/{user_id}", response_model=List[PrescriptionDetailResponse])
def get_user_prescriptions_endpoint(user_id: str, db: Session = Depends(get_db)):
    """
    List all prescription history records for a user.
    """
    return crud.list_user_prescriptions(db, user_id)


@db_router.put("/prescriptions/items/{item_id}", response_model=ExtractedMedicineResponse)
def update_extracted_item_endpoint(item_id: str, item_in: ExtractedMedicineUpdate, db: Session = Depends(get_db)):
    """
    Update / confirm an extracted medicine entity (Module 9: Medicine Confirmation/Editing).
    """
    updated = crud.update_extracted_medicine(db, item_id, item_in)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Extracted medicine item '{item_id}' not found.")
    return updated


# -------------------------------------------------------------
# 6. USERS & SEARCH HISTORY
# -------------------------------------------------------------

@db_router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a user account.
    """
    existing = crud.get_user_by_phone(db, user_in.phone)
    if existing:
        return existing
    return crud.create_user(db, user_in)


@db_router.get("/users/{user_id}", response_model=UserResponse)
def get_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@db_router.post("/search-history", response_model=SearchHistoryResponse)
def log_search_endpoint(medicine_id: str, user_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Log a medicine search into SEARCH_HISTORY.
    """
    med = crud.get_medicine(db, medicine_id)
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine '{medicine_id}' not found.")
    return crud.log_search(db, medicine_id=medicine_id, user_id=user_id)


@db_router.get("/search-history/{user_id}", response_model=List[SearchHistoryResponse])
def get_user_search_history_endpoint(user_id: str, limit: int = Query(20, ge=1, le=50), db: Session = Depends(get_db)):
    """
    Get audit history of searched medicines for a user.
    """
    return crud.get_search_history(db, user_id=user_id, limit=limit)
