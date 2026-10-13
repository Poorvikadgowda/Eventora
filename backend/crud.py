"""
CRUD (Create, Read, Update, Delete) Operations for GenericSwap SQLite Database.
All database access uses SQLAlchemy sessions with explicit commits and rollbacks.
"""

import math
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from backend.models.sql_models import (
    User,
    Medicine,
    GenericMedicine,
    Pharmacy,
    PharmacyInventory,
    Prescription,
    ExtractedMedicine,
    SearchHistory
)
from backend.schemas.db_schemas import (
    UserCreate,
    MedicineCreate,
    GenericMedicineCreate,
    PharmacyCreate,
    PharmacyInventoryCreate,
    PharmacyInventoryUpdate,
    PrescriptionCreate,
    ExtractedMedicineCreate,
    ExtractedMedicineUpdate
)


# -------------------------------------------------------------
# 1. USER CRUD
# -------------------------------------------------------------

def get_user(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    clean_phone = "".join(filter(str.isdigit, phone))[-10:]
    return db.query(User).filter(User.phone == clean_phone).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    clean_phone = "".join(filter(str.isdigit, user_in.phone))[-10:]
    user_id = user_in.id or f"usr-{uuid.uuid4().hex[:10]}"
    db_user = User(
        id=user_id,
        name=user_in.name,
        email=user_in.email,
        phone=clean_phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_or_create_user(db: Session, phone: str, name: str = "Patient", email: Optional[str] = None) -> User:
    clean_phone = "".join(filter(str.isdigit, phone))[-10:]
    user = get_user_by_phone(db, clean_phone)
    if not user:
        user = create_user(db, UserCreate(name=name, phone=clean_phone, email=email))
    return user


# -------------------------------------------------------------
# 2. MEDICINES CRUD
# -------------------------------------------------------------

def get_medicine(db: Session, medicine_id: str) -> Optional[Medicine]:
    return db.query(Medicine).filter(Medicine.id == medicine_id).first()


def list_medicines(db: Session, skip: int = 0, limit: int = 50, search: Optional[str] = None) -> List[Medicine]:
    query = db.query(Medicine)
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Medicine.brand_name.ilike(s),
                Medicine.generic_name.ilike(s),
                Medicine.active_ingredient.ilike(s),
                Medicine.id.ilike(s)
            )
        )
    return query.offset(skip).limit(limit).all()


def create_medicine(db: Session, med_in: MedicineCreate) -> Medicine:
    db_med = Medicine(**med_in.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med


# -------------------------------------------------------------
# 3. GENERIC MEDICINES CRUD
# -------------------------------------------------------------

def get_generics_for_medicine(db: Session, medicine_id: str) -> List[GenericMedicine]:
    return db.query(GenericMedicine).filter(GenericMedicine.medicine_id == medicine_id).all()


def list_generics(db: Session, skip: int = 0, limit: int = 50) -> List[GenericMedicine]:
    return db.query(GenericMedicine).offset(skip).limit(limit).all()


def create_generic_medicine(db: Session, gen_in: GenericMedicineCreate) -> GenericMedicine:
    db_gen = GenericMedicine(**gen_in.model_dump())
    db.add(db_gen)
    db.commit()
    db.refresh(db_gen)
    return db_gen


# -------------------------------------------------------------
# 4. PHARMACIES CRUD & GEOSPATIAL HAVERSINE
# -------------------------------------------------------------

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def get_pharmacy(db: Session, pharmacy_id: str) -> Optional[Pharmacy]:
    return db.query(Pharmacy).filter(Pharmacy.id == pharmacy_id).first()


def list_pharmacies(db: Session, skip: int = 0, limit: int = 50) -> List[Pharmacy]:
    return db.query(Pharmacy).offset(skip).limit(limit).all()


def create_pharmacy(db: Session, pharm_in: PharmacyCreate) -> Pharmacy:
    db_pharm = Pharmacy(**pharm_in.model_dump())
    db.add(db_pharm)
    db.commit()
    db.refresh(db_pharm)
    return db_pharm


def get_nearby_pharmacies_db(
    db: Session,
    user_lat: float,
    user_lon: float,
    max_radius_km: float = 20.0,
    medicine_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Geospatial nearby query calculating Haversine distance and attaching demo inventory.
    """
    pharmacies = db.query(Pharmacy).all()
    results = []

    for p in pharmacies:
        dist = calculate_haversine(user_lat, user_lon, p.latitude, p.longitude)
        if dist > max_radius_km:
            continue

        item = {
            "id": p.id,
            "name": p.name,
            "address": p.address,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "phone": p.phone,
            "verified": p.verified,
            "distance_km": dist,
            "directions_url": f"https://www.google.com/maps/dir/?api=1&destination={p.latitude},{p.longitude}",
            "target_inventory": None
        }

        if medicine_id:
            inv = db.query(PharmacyInventory).filter(
                PharmacyInventory.pharmacy_id == p.id,
                PharmacyInventory.medicine_id == medicine_id
            ).first()
            if inv:
                item["target_inventory"] = {
                    "medicine_id": inv.medicine_id,
                    "availability_status": inv.availability_status,
                    "stock_quantity": inv.stock_quantity,
                    "approximate_price": inv.approximate_price,
                    "is_demo_data": True,
                    "last_updated": inv.last_updated.isoformat() if inv.last_updated else None
                }

        results.append(item)

    results.sort(key=lambda x: x["distance_km"])
    return results


# -------------------------------------------------------------
# 5. PHARMACY INVENTORY CRUD
# -------------------------------------------------------------

def get_inventory_for_pharmacy(db: Session, pharmacy_id: str) -> List[PharmacyInventory]:
    return db.query(PharmacyInventory).filter(PharmacyInventory.pharmacy_id == pharmacy_id).all()


def get_inventory_for_medicine(db: Session, medicine_id: str) -> List[PharmacyInventory]:
    return db.query(PharmacyInventory).filter(PharmacyInventory.medicine_id == medicine_id).all()


def upsert_inventory_item(
    db: Session,
    pharmacy_id: str,
    medicine_id: str,
    stock_quantity: int,
    approximate_price: float,
    availability_status: Optional[str] = None
) -> PharmacyInventory:
    """
    Create or update an inventory entry for a given pharmacy & medicine.
    """
    inv = db.query(PharmacyInventory).filter(
        PharmacyInventory.pharmacy_id == pharmacy_id,
        PharmacyInventory.medicine_id == medicine_id
    ).first()

    status = availability_status
    if not status:
        if stock_quantity > 10:
            status = "DEMO_IN_STOCK"
        elif stock_quantity > 0:
            status = "DEMO_LOW_STOCK"
        else:
            status = "DEMO_OUT_OF_STOCK"

    now = datetime.now(timezone.utc)

    if inv:
        inv.stock_quantity = stock_quantity
        inv.approximate_price = approximate_price
        inv.availability_status = status
        inv.last_updated = now
    else:
        inv = PharmacyInventory(
            id=f"inv-{uuid.uuid4().hex[:10]}",
            pharmacy_id=pharmacy_id,
            medicine_id=medicine_id,
            stock_quantity=stock_quantity,
            approximate_price=approximate_price,
            availability_status=status,
            last_updated=now
        )
        db.add(inv)

    db.commit()
    db.refresh(inv)
    return inv


# -------------------------------------------------------------
# 6. PRESCRIPTIONS & EXTRACTED MEDICINES CRUD
# -------------------------------------------------------------

def create_prescription(db: Session, rx_in: PrescriptionCreate) -> Prescription:
    rx_id = rx_in.id or f"rx-{uuid.uuid4().hex[:10]}"
    db_rx = Prescription(
        id=rx_id,
        user_id=rx_in.user_id,
        image_path=rx_in.image_path,
        OCR_text=rx_in.OCR_text,
        processed_text=rx_in.processed_text
    )
    db.add(db_rx)
    db.commit()
    db.refresh(db_rx)

    # Attach extracted items if provided
    if rx_in.extracted_items:
        for item in rx_in.extracted_items:
            ext_id = f"ext-{uuid.uuid4().hex[:10]}"
            ext_med = ExtractedMedicine(
                id=ext_id,
                prescription_id=rx_id,
                detected_name=item.detected_name,
                corrected_name=item.corrected_name,
                active_ingredient=item.active_ingredient,
                strength=item.strength,
                dosage_form=item.dosage_form,
                dosage_text=item.dosage_text,
                confidence=item.confidence,
                verification_status=item.verification_status
            )
            db.add(ext_med)
        db.commit()
        db.refresh(db_rx)

    return db_rx


def get_prescription(db: Session, prescription_id: str) -> Optional[Prescription]:
    return db.query(Prescription).filter(Prescription.id == prescription_id).first()


def list_user_prescriptions(db: Session, user_id: str) -> List[Prescription]:
    return db.query(Prescription).filter(Prescription.user_id == user_id).order_by(desc(Prescription.created_at)).all()


def add_extracted_medicine(db: Session, item_in: ExtractedMedicineCreate) -> ExtractedMedicine:
    ext_id = item_in.id or f"ext-{uuid.uuid4().hex[:10]}"
    ext_med = ExtractedMedicine(
        id=ext_id,
        prescription_id=item_in.prescription_id,
        detected_name=item_in.detected_name,
        corrected_name=item_in.corrected_name,
        active_ingredient=item_in.active_ingredient,
        strength=item_in.strength,
        dosage_form=item_in.dosage_form,
        dosage_text=item_in.dosage_text,
        confidence=item_in.confidence,
        verification_status=item_in.verification_status
    )
    db.add(ext_med)
    db.commit()
    db.refresh(ext_med)
    return ext_med


def update_extracted_medicine(db: Session, item_id: str, update_in: ExtractedMedicineUpdate) -> Optional[ExtractedMedicine]:
    item = db.query(ExtractedMedicine).filter(ExtractedMedicine.id == item_id).first()
    if not item:
        return None
    for field, value in update_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


# -------------------------------------------------------------
# 7. SEARCH HISTORY CRUD
# -------------------------------------------------------------

def log_search(db: Session, medicine_id: str, user_id: Optional[str] = None) -> SearchHistory:
    entry = SearchHistory(
        id=f"sch-{uuid.uuid4().hex[:10]}",
        user_id=user_id,
        medicine_id=medicine_id
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_search_history(db: Session, user_id: str, limit: int = 20) -> List[SearchHistory]:
    return db.query(SearchHistory).filter(SearchHistory.user_id == user_id).order_by(desc(SearchHistory.searched_at)).limit(limit).all()
