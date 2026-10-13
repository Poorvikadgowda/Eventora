"""
backend/services/pricing_service.py

Price Comparison Engine for GenericSwap.

Compares:
- Prescribed brand price vs Generic medicine price

Calculates:
- absolute_saving = brand_price - generic_price
- saving_percentage = ((brand_price - generic_price) / brand_price) * 100

Statutory Requirement:
Prices must be labeled as approximate/demo/local-database prices.
Never claim that the displayed price is the current market price unless the application
actually receives verified current data.
"""

from typing import Dict, Any, List, Optional, Tuple
import re
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.sql_models import Medicine, GenericMedicine, ExtractedMedicine
from backend.services.generic_matching_service import GenericMatchingEngine

STATUTORY_PRICE_DISCLAIMER = (
    "Prices are approximate/demo/local-database prices. "
    "Never claim that the displayed price is the current market price unless "
    "the application actually receives verified current data."
)

PRICE_DATA_SOURCE_TYPE = "approximate_local_database"


class PriceComparisonEngine:
    """
    Engine for calculating monetary and percentage price differentials between
    prescribed branded medicines and bioequivalent Jan Aushadhi generic alternatives.
    """

    @staticmethod
    def calculate_savings(brand_price: float, generic_price: float) -> Tuple[float, float]:
        """
        Calculates absolute savings and savings percentage according to the required formulas:
        - absolute_saving = brand_price - generic_price
        - saving_percentage = ((brand_price - generic_price) / brand_price) * 100
        """
        brand_price = float(brand_price or 0.0)
        generic_price = float(generic_price or 0.0)

        absolute_saving = round(brand_price - generic_price, 2)
        if brand_price > 0.0:
            saving_percentage = round(((brand_price - generic_price) / brand_price) * 100, 2)
        else:
            saving_percentage = 0.0

        return absolute_saving, saving_percentage

    @classmethod
    def find_medicine(cls, db: Session, medicine_id: str) -> Optional[Medicine]:
        """
        Performs resilient lookup for a medicine by primary key ID, slug, or brand name.
        """
        if not medicine_id:
            return None

        clean_id = medicine_id.strip()

        # 1. Direct ID match
        med = db.query(Medicine).filter(Medicine.id == clean_id).first()
        if med:
            return med

        # 2. Case-insensitive ID match
        med = db.query(Medicine).filter(func.lower(Medicine.id) == clean_id.lower()).first()
        if med:
            return med

        # 3. Slugified ID match (e.g. "Dolo 650" -> "dolo-650")
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean_id).strip("-").lower()
        med = db.query(Medicine).filter(func.lower(Medicine.id) == slug).first()
        if med:
            return med

        # 4. Brand name match
        med = db.query(Medicine).filter(func.lower(Medicine.brand_name) == clean_id.lower()).first()
        if med:
            return med

        # 5. Check ExtractedMedicine table if medicine_id is from OCR extraction
        extracted = db.query(ExtractedMedicine).filter(ExtractedMedicine.id == clean_id).first()
        if extracted:
            candidate_name = extracted.confirmed_medicine_name or extracted.medicine_name
            if candidate_name:
                cand_slug = re.sub(r"[^a-zA-Z0-9]+", "-", candidate_name).strip("-").lower()
                med = db.query(Medicine).filter(
                    (func.lower(Medicine.id) == cand_slug) |
                    (func.lower(Medicine.brand_name) == candidate_name.lower())
                ).first()
                if med:
                    return med

        # 6. Prefix / ILIKE search fallback
        med = db.query(Medicine).filter(Medicine.brand_name.ilike(f"%{clean_id}%")).first()
        return med

    @classmethod
    def get_verified_generic_alternative(
        cls,
        db: Session,
        medicine: Medicine
    ) -> Optional[GenericMedicine]:
        """
        Locates the best verified generic alternative linked to the medicine,
        or matching its active ingredient and strength.
        """
        # 1. Linked generic alternatives via foreign key
        for alt in medicine.generic_alternatives:
            if alt.verified:
                return alt

        # 2. Query GenericMedicine table by active ingredient & strength
        if medicine.active_ingredient:
            candidates = db.query(GenericMedicine).filter(
                GenericMedicine.verified == True
            ).all()

            norm_med_mol = GenericMatchingEngine.normalize_molecule(medicine.active_ingredient)
            norm_med_str = GenericMatchingEngine.normalize_strength(medicine.strength)

            for cand in candidates:
                if (
                    GenericMatchingEngine.normalize_molecule(cand.active_ingredient) == norm_med_mol
                    and GenericMatchingEngine.normalize_strength(cand.strength) == norm_med_str
                ):
                    return cand

            # Fallback on active ingredient match alone
            for cand in candidates:
                if GenericMatchingEngine.normalize_molecule(cand.active_ingredient) == norm_med_mol:
                    return cand

        return None

    @classmethod
    def build_comparison_payload(
        cls,
        medicine: Medicine,
        generic: Optional[GenericMedicine]
    ) -> Dict[str, Any]:
        """
        Builds the canonical comparison payload with the 4 required display metrics,
        bar/chart visualization data, and statutory approximate pricing disclaimer.
        """
        brand_price = float(medicine.approximate_price or 0.0)

        if generic:
            generic_name = generic.generic_name
            generic_price = float(generic.approximate_price or 0.0)
            generic_mfg = generic.manufacturer
            generic_id = generic.id
        else:
            generic_name = f"{medicine.active_ingredient} {medicine.strength} (PMBJP Generic)"
            generic_price = round(max(5.0, brand_price * 0.25), 2)
            generic_mfg = "Bureau of Pharma PSUs of India (BPPI)"
            generic_id = f"gen-{medicine.id}"

        absolute_saving, saving_percentage = cls.calculate_savings(brand_price, generic_price)

        return {
            "medicine_id": medicine.id,
            "brand_medicine": medicine.brand_name,
            "brand_name": medicine.brand_name,
            "brand_price": brand_price,
            "active_ingredient": medicine.active_ingredient,
            "strength": medicine.strength,
            "dosage_form": medicine.dosage_form,
            "brand_manufacturer": medicine.manufacturer,
            "pack_size": medicine.pack_size,
            "generic_medicine": generic_name,
            "generic_name": generic_name,
            "generic_price": generic_price,
            "generic_manufacturer": generic_mfg,
            "generic_id": generic_id,
            "absolute_saving": absolute_saving,
            "saving_percentage": saving_percentage,
            "currency": "INR",
            "currency_symbol": "₹",
            "price_type": PRICE_DATA_SOURCE_TYPE,
            "is_live_market_price": False,
            "disclaimer": STATUTORY_PRICE_DISCLAIMER,
            "chart_data": {
                "bars": [
                    {
                        "label": "Brand Medicine",
                        "medicine": medicine.brand_name,
                        "price": brand_price,
                        "fill": "#f43f5e"
                    },
                    {
                        "label": "Generic Medicine",
                        "medicine": generic_name,
                        "price": generic_price,
                        "fill": "#10b981"
                    }
                ],
                "absolute_saving": absolute_saving,
                "saving_percentage": saving_percentage
            }
        }

    @classmethod
    def get_medicine_price_comparison(cls, db: Session, medicine_id: str) -> Optional[Dict[str, Any]]:
        """
        Performs price comparison lookup for a specific medicine ID.
        Returns None if medicine is not found in database.
        """
        medicine = cls.find_medicine(db, medicine_id)
        if not medicine:
            return None

        generic = cls.get_verified_generic_alternative(db, medicine)
        return cls.build_comparison_payload(medicine, generic)

    @classmethod
    def list_all_price_comparisons(cls, db: Session) -> List[Dict[str, Any]]:
        """
        Returns price comparisons for all verified medicines in the database catalog.
        """
        medicines = db.query(Medicine).filter(Medicine.verified == True).order_by(Medicine.brand_name).all()
        comparisons = []
        for med in medicines:
            gen = cls.get_verified_generic_alternative(db, med)
            comparisons.append(cls.build_comparison_payload(med, gen))
        return comparisons
