"""
SQLAlchemy Relational Database Models for GenericSwap.
Defines schemas for USERS, MEDICINES, GENERIC_MEDICINES, PHARMACIES,
PHARMACY_INVENTORY, PRESCRIPTIONS, EXTRACTED_MEDICINES, and SEARCH_HISTORY.
"""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
    Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def get_utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)


class User(Base):
    """
    USERS table.
    Stores patient and pharmacy user accounts.
    """
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=True, index=True)
    phone = Column(String(32), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Legacy & portal compatibility
    mobile = Column(String(32), nullable=True)
    role = Column(String(32), nullable=True, default="USER")
    pharmacy_id = Column(String(64), nullable=True)

    # Relationships
    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete-orphan")
    searches = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id='{self.id}', name='{self.name}', phone='{self.phone}')>"


class Medicine(Base):
    """
    MEDICINES table.
    Verified branded medicines registry.
    """
    __tablename__ = "medicines"

    id = Column(String(64), primary_key=True, index=True)
    brand_name = Column(String(128), nullable=False, index=True)
    generic_name = Column(String(128), nullable=False, index=True)
    active_ingredient = Column(String(256), nullable=False, index=True)
    strength = Column(String(64), nullable=False)
    dosage_form = Column(String(64), nullable=False)
    manufacturer = Column(String(128), nullable=False)
    pack_size = Column(Integer, nullable=False, default=10)
    approximate_price = Column(Float, nullable=False, default=0.0)
    source = Column(String(64), nullable=False, default="VERIFIED_REGISTRY")
    verified = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    generic_alternatives = relationship("GenericMedicine", back_populates="medicine", cascade="all, delete-orphan")
    inventories = relationship("PharmacyInventory", back_populates="medicine", cascade="all, delete-orphan")
    search_histories = relationship("SearchHistory", back_populates="medicine", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Medicine(id='{self.id}', brand_name='{self.brand_name}', strength='{self.strength}')>"


class GenericMedicine(Base):
    """
    GENERIC_MEDICINES table.
    Bioequivalent generic alternatives (e.g. Jan Aushadhi / PMBJP).
    """
    __tablename__ = "generic_medicines"

    id = Column(String(64), primary_key=True, index=True)
    medicine_id = Column(String(64), ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    generic_name = Column(String(128), nullable=False, index=True)
    active_ingredient = Column(String(256), nullable=False)
    strength = Column(String(64), nullable=False)
    dosage_form = Column(String(64), nullable=False)
    manufacturer = Column(String(128), nullable=False, default="Jan Aushadhi (BPPI)")
    approximate_price = Column(Float, nullable=False, default=0.0)
    verified = Column(Boolean, nullable=False, default=True)

    # Relationships
    medicine = relationship("Medicine", back_populates="generic_alternatives")

    def __repr__(self):
        return f"<GenericMedicine(id='{self.id}', generic_name='{self.generic_name}', price={self.approximate_price})>"


class Pharmacy(Base):
    """
    PHARMACIES table.
    Physical retail stores & PMBJP Jan Aushadhi Kendras.
    """
    __tablename__ = "pharmacies"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False, index=True)
    address = Column(String(256), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(32), nullable=False)
    verified = Column(Boolean, nullable=False, default=True)

    # Legacy & portal compatibility
    email = Column(String(128), nullable=True, default="")
    opening_time = Column(String(32), nullable=True, default="08:00 AM")
    closing_time = Column(String(32), nullable=True, default="10:00 PM")
    is_verified = Column(Integer, nullable=True, default=1)
    created_at = Column(DateTime, default=get_utc_now, nullable=True)
    updated_at = Column(DateTime, default=get_utc_now, nullable=True)

    # Relationships
    inventories = relationship("PharmacyInventory", back_populates="pharmacy", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Pharmacy(id='{self.id}', name='{self.name}', city_coords=({self.latitude}, {self.longitude}))>"


class PharmacyInventory(Base):
    """
    PHARMACY_INVENTORY table.
    Locally stored medicine availability per pharmacy.
    Clearly indicates demo status.
    """
    __tablename__ = "pharmacy_inventory"

    id = Column(String(64), primary_key=True, index=True)
    pharmacy_id = Column(String(64), ForeignKey("pharmacies.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_id = Column(String(64), ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    availability_status = Column(String(32), nullable=False, default="DEMO_IN_STOCK")
    stock_quantity = Column(Integer, nullable=False, default=0)
    approximate_price = Column(Float, nullable=False, default=0.0)
    last_updated = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Legacy & portal compatibility
    price = Column(Float, nullable=True, default=0.0)
    unit = Column(String(32), nullable=True, default="strip")
    batch_number = Column(String(64), nullable=True)
    expiry_date = Column(String(32), nullable=True)

    __table_args__ = (
        UniqueConstraint("pharmacy_id", "medicine_id", name="uq_pharmacy_medicine"),
        Index("idx_pharmacy_inventory_status", "pharmacy_id", "availability_status"),
    )

    # Relationships
    pharmacy = relationship("Pharmacy", back_populates="inventories")
    medicine = relationship("Medicine", back_populates="inventories")

    @property
    def is_demo_data(self) -> bool:
        return True

    def __repr__(self):
        return f"<PharmacyInventory(pharmacy='{self.pharmacy_id}', med='{self.medicine_id}', qty={self.stock_quantity})>"


class Prescription(Base):
    """
    PRESCRIPTIONS table.
    Uploaded prescription records and extracted texts.
    """
    __tablename__ = "prescriptions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    image_path = Column(String(256), nullable=True, default="")
    preprocessed_image_path = Column(String(256), nullable=True, default="")
    OCR_text = Column(Text, nullable=True, default="")
    processed_text = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Legacy & summary compatibility
    user_mobile = Column(String(32), nullable=True)
    patient_name = Column(String(128), nullable=True)
    doctor_name = Column(String(128), nullable=True)
    title = Column(String(128), nullable=True)
    raw_text = Column(Text, nullable=True)
    image_name = Column(String(256), nullable=True)
    total_branded_cost = Column(Float, nullable=True, default=0.0)
    total_generic_cost = Column(Float, nullable=True, default=0.0)
    net_savings = Column(Float, nullable=True, default=0.0)
    savings_percentage = Column(Float, nullable=True, default=0.0)

    # Relationships
    user = relationship("User", back_populates="prescriptions")
    extracted_medicines = relationship("ExtractedMedicine", back_populates="prescription", cascade="all, delete-orphan")
    evaluations = relationship("OcrEvaluation", back_populates="prescription", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Prescription(id='{self.id}', user_id='{self.user_id}', created_at='{self.created_at}')>"


class ExtractedMedicine(Base):
    """
    EXTRACTED_MEDICINES table.
    Specific medicine entities extracted from a prescription via OCR/NER.
    """
    __tablename__ = "extracted_medicines"

    id = Column(String(64), primary_key=True, index=True)
    prescription_id = Column(String(64), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    detected_name = Column(String(128), nullable=False)
    corrected_name = Column(String(128), nullable=False)
    active_ingredient = Column(String(256), nullable=False)
    strength = Column(String(64), nullable=False)
    dosage_form = Column(String(64), nullable=False, default="Tablet")
    dosage_text = Column(String(128), nullable=False, default="")
    duration = Column(String(64), nullable=True, default="")
    confidence = Column(Float, nullable=False, default=0.90)
    verification_status = Column(String(32), nullable=False, default="UNVERIFIED")

    # Relationships
    prescription = relationship("Prescription", back_populates="extracted_medicines")

    def __repr__(self):
        return f"<ExtractedMedicine(id='{self.id}', detected='{self.detected_name}', corrected='{self.corrected_name}')>"


class SearchHistory(Base):
    """
    SEARCH_HISTORY table.
    Audit log of medicine lookups.
    """
    __tablename__ = "search_history"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    medicine_id = Column(String(64), ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    searched_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="searches")
    medicine = relationship("Medicine", back_populates="search_histories")

    def __repr__(self):
        return f"<SearchHistory(id='{self.id}', user='{self.user_id}', med='{self.medicine_id}')>"


class OcrEvaluation(Base):
    """
    OCR_EVALUATIONS table.
    Stores empirical research evaluation benchmarks for OCR engines:
    TrOCR, PaddleOCR, EasyOCR, Tesseract against ground-truth prescription text.
    Measures CER, WER, latency, and medicine recognition accuracy.
    """
    __tablename__ = "ocr_evaluations"

    id = Column(String(64), primary_key=True, index=True)
    prescription_id = Column(String(64), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    engine_name = Column(String(32), nullable=False)  # TrOCR, PaddleOCR, EasyOCR, Tesseract
    ground_truth_text = Column(Text, nullable=False)
    recognized_text = Column(Text, nullable=False)
    cer = Column(Float, nullable=False)  # Character Error Rate (0.0 - 1.0+)
    wer = Column(Float, nullable=False)  # Word Error Rate (0.0 - 1.0+)
    accuracy = Column(Float, nullable=False)  # Recognition Accuracy %: max(0.0, 1 - CER) * 100
    processing_time_ms = Column(Float, nullable=False)
    medicine_recognition_accuracy = Column(Float, nullable=False)  # % of ground truth medicines detected
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    prescription = relationship("Prescription", back_populates="evaluations")

    def __repr__(self):
        return f"<OcrEvaluation(id='{self.id}', engine='{self.engine_name}', cer={self.cer}, wer={self.wer})>"
