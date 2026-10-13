"""
Pydantic v2 API Schemas for GenericSwap Relational Database.
Provides validation and serialization for USERS, MEDICINES, GENERIC_MEDICINES,
PHARMACIES, PHARMACY_INVENTORY, PRESCRIPTIONS, EXTRACTED_MEDICINES, and SEARCH_HISTORY.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# 1. USER SCHEMAS
# -------------------------------------------------------------

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    email: Optional[str] = Field(None, max_length=128)
    phone: str = Field(..., min_length=10, max_length=32)

class UserCreate(UserBase):
    id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# 2. MEDICINE SCHEMAS
# -------------------------------------------------------------

class MedicineBase(BaseModel):
    brand_name: str = Field(..., max_length=128)
    generic_name: str = Field(..., max_length=128)
    active_ingredient: str = Field(..., max_length=256)
    strength: str = Field(..., max_length=64)
    dosage_form: str = Field("Tablet", max_length=64)
    manufacturer: str = Field(..., max_length=128)
    pack_size: int = Field(10, ge=1)
    approximate_price: float = Field(..., ge=0.0)
    source: str = Field("VERIFIED_REGISTRY", max_length=64)
    verified: bool = True

class MedicineCreate(MedicineBase):
    id: str

class MedicineResponse(MedicineBase):
    id: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# 3. GENERIC MEDICINE SCHEMAS
# -------------------------------------------------------------

class GenericMedicineBase(BaseModel):
    medicine_id: str
    generic_name: str = Field(..., max_length=128)
    active_ingredient: str = Field(..., max_length=256)
    strength: str = Field(..., max_length=64)
    dosage_form: str = Field("Tablet", max_length=64)
    manufacturer: str = Field("Jan Aushadhi (BPPI)", max_length=128)
    approximate_price: float = Field(..., ge=0.0)
    verified: bool = True

class GenericMedicineCreate(GenericMedicineBase):
    id: str

class GenericMedicineResponse(GenericMedicineBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class MedicineDetailResponse(MedicineResponse):
    generic_alternatives: List[GenericMedicineResponse] = []
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# 4. PHARMACY SCHEMAS
# -------------------------------------------------------------

class PharmacyBase(BaseModel):
    name: str = Field(..., max_length=128)
    address: str = Field(..., max_length=256)
    latitude: float
    longitude: float
    phone: str = Field(..., max_length=32)
    verified: bool = True

class PharmacyCreate(PharmacyBase):
    id: str

class PharmacyResponse(PharmacyBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class NearbyPharmacyResponse(PharmacyResponse):
    distance_km: float
    directions_url: str
    target_inventory: Optional[dict] = None
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# 5. PHARMACY INVENTORY SCHEMAS
# -------------------------------------------------------------

class PharmacyInventoryBase(BaseModel):
    pharmacy_id: str
    medicine_id: str
    availability_status: str = Field("DEMO_IN_STOCK", description="DEMO DATA status: DEMO_IN_STOCK, DEMO_LOW_STOCK, DEMO_OUT_OF_STOCK")
    stock_quantity: int = Field(0, ge=0)
    approximate_price: float = Field(..., ge=0.0)

class PharmacyInventoryCreate(PharmacyInventoryBase):
    id: Optional[str] = None

class PharmacyInventoryUpdate(BaseModel):
    availability_status: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    approximate_price: Optional[float] = Field(None, ge=0.0)

class PharmacyInventoryResponse(PharmacyInventoryBase):
    id: str
    last_updated: datetime
    is_demo_data: bool = True
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# 6. EXTRACTED MEDICINE SCHEMAS
# -------------------------------------------------------------

class ExtractedMedicineBase(BaseModel):
    detected_name: str = Field(..., max_length=128)
    corrected_name: str = Field(..., max_length=128)
    active_ingredient: str = Field(..., max_length=256)
    strength: str = Field(..., max_length=64)
    dosage_form: str = Field("Tablet", max_length=64)
    dosage_text: str = Field("", max_length=128)
    confidence: float = Field(0.90, ge=0.0, le=1.0)
    verification_status: str = Field("UNVERIFIED", max_length=32)

class ExtractedMedicineCreate(ExtractedMedicineBase):
    id: Optional[str] = None
    prescription_id: str

class ExtractedMedicineUpdate(BaseModel):
    corrected_name: Optional[str] = None
    active_ingredient: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    dosage_text: Optional[str] = None
    verification_status: Optional[str] = None

class ExtractedMedicineResponse(ExtractedMedicineBase):
    id: str
    prescription_id: str
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# 7. PRESCRIPTION SCHEMAS
# -------------------------------------------------------------

class PrescriptionBase(BaseModel):
    user_id: Optional[str] = None
    image_path: Optional[str] = None
    OCR_text: str = ""
    processed_text: str = ""

class PrescriptionCreate(PrescriptionBase):
    id: Optional[str] = None
    extracted_items: Optional[List[ExtractedMedicineBase]] = []

class PrescriptionResponse(PrescriptionBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PrescriptionDetailResponse(PrescriptionResponse):
    extracted_medicines: List[ExtractedMedicineResponse] = []
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# 8. SEARCH HISTORY SCHEMAS
# -------------------------------------------------------------

class SearchHistoryBase(BaseModel):
    user_id: Optional[str] = None
    medicine_id: str

class SearchHistoryCreate(SearchHistoryBase):
    id: Optional[str] = None

class SearchHistoryResponse(SearchHistoryBase):
    id: str
    searched_at: datetime
    model_config = ConfigDict(from_attributes=True)
