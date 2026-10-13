"""
backend/services/generic_matching_service.py

Module: Generic Medicine Matching Engine
Implements strict clinical parity matching rules:
1. Active ingredient must match.
2. Strength must match.
3. Dosage form should match.
4. Only verified database records can be returned.
5. Do not recommend medicines based only on similar names.

Mandatory Statutory Warning:
"Generic matching is based on database records. Confirm any substitution with a doctor or pharmacist."
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.models.sql_models import Medicine, GenericMedicine


STATUTORY_WARNING_MESSAGE = (
    "Generic matching is based on database records. Confirm any substitution with a doctor or pharmacist."
)


# ---------------------------------------------------------------------------
# Normalization Utilities for Molecular and Strength Parity
# ---------------------------------------------------------------------------

MOLECULE_SYNONYMS = {
    "acetaminophen": "paracetamol",
    "paracetamol": "paracetamol",
    "amoxycillin": "amoxicillin",
    "amoxicillin": "amoxicillin",
    "clavulanate potassium": "clavulanic acid",
    "potassium clavulanate": "clavulanic acid",
    "clavulanic acid": "clavulanic acid",
    "cholecalciferol": "vitamin d3",
    "cyanocobalamin": "vitamin b12",
}

DOSAGE_FORM_CANONICAL = {
    "tab": "tablet",
    "tabs": "tablet",
    "tablet": "tablet",
    "tablets": "tablet",
    "film coated tablet": "tablet",
    "dispersible tablet": "tablet",
    "chewable tablet": "tablet",
    "cap": "capsule",
    "caps": "capsule",
    "capsule": "capsule",
    "capsules": "capsule",
    "capsule (sr)": "capsule",
    "sr capsule": "capsule",
    "sustained release capsule": "capsule",
    "syr": "syrup",
    "syrup": "syrup",
    "suspension": "suspension",
    "drops": "drops",
    "inj": "injection",
    "injection": "injection",
    "ointment": "ointment",
    "cream": "ointment",
    "gel": "ointment",
}


def normalize_molecule_token(token: str) -> str:
    """Normalizes an individual molecule name token."""
    cleaned = token.lower().strip()
    cleaned = re.sub(r"[^\w\s-]", "", cleaned)
    cleaned = " ".join(cleaned.split())
    return MOLECULE_SYNONYMS.get(cleaned, cleaned)


def normalize_active_ingredient(ingredient_str: str) -> str:
    """
    Normalizes multi-active chemical ingredient strings:
    - Normalizes separators ('+', '&', 'and', '/')
    - Normalizes chemical synonyms (e.g. acetaminophen -> paracetamol)
    - Orders components canonically so 'A + B' matches 'B + A'
    """
    if not ingredient_str:
        return ""

    raw = ingredient_str.replace("&", "+").replace(" and ", "+").replace("/", "+")
    parts = [p.strip() for p in raw.split("+") if p.strip()]

    normalized_parts = [normalize_molecule_token(p) for p in parts]
    # Sort parts alphabetically to ensure order-agnostic matching
    normalized_parts.sort()

    return " + ".join(normalized_parts)


def normalize_strength_token(token: str) -> str:
    """Normalizes a single strength component (e.g., '650 mg' -> '650mg')."""
    cleaned = token.lower().strip()
    # Remove release specifiers from strength component (e.g. 'SR', 'ER', 'Duo')
    cleaned = re.sub(r"\b(sr|er|cr|pr|duo|ip|usp|bp)\b", "", cleaned).strip()
    # Normalize spacing between digits and units (e.g. '650 mg' -> '650mg')
    cleaned = re.sub(r"(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|u)\b", r"\1\2", cleaned)
    # Strip any extra whitespace
    return "".join(cleaned.split())


def normalize_strength(strength_str: str) -> str:
    """
    Normalizes formulation strength strings:
    - Removes whitespace between values and units ('650 mg' -> '650mg')
    - Handles combination strengths ('40 mg + 30 mg' -> '40mg+30mg')
    - Orders strength components consistently
    """
    if not strength_str:
        return ""

    raw = strength_str.replace("&", "+").replace(" and ", "+").replace("/", "+")
    parts = [p.strip() for p in raw.split("+") if p.strip()]

    normalized_parts = [normalize_strength_token(p) for p in parts]
    return "+".join(normalized_parts)


def normalize_dosage_form(form_str: str) -> str:
    """Canonicalizes dosage form strings (e.g. 'Tab' -> 'tablet')."""
    if not form_str:
        return "tablet"
    cleaned = form_str.lower().strip()
    cleaned = re.sub(r"[^\w\s()]", "", cleaned)
    return DOSAGE_FORM_CANONICAL.get(cleaned, cleaned)


# ---------------------------------------------------------------------------
# Core Generic Medicine Matching Engine
# ---------------------------------------------------------------------------

class GenericMatchingEngine:
    """
    Clinical Decision-Support Generic Matching Engine.
    Enforces Active Ingredient Parity, Strength Parity, and Dosage Form Parity
    strictly from verified database records.
    """

    @staticmethod
    def match_generics(
        db: Session,
        prescribed_brand: Optional[str],
        active_ingredient: str,
        strength: str,
        dosage_form: str
    ) -> Dict[str, Any]:
        """
        Executes generic matching against the verified database:
        1. Validates input fields.
        2. Normalizes active ingredient, strength, and dosage form.
        3. Queries verified GenericMedicine records (verified == True).
        4. Rejects matches that do not satisfy active ingredient or strength parity.
        5. Returns structured match details with statutory clinician warning.
        """
        brand_clean = (prescribed_brand or "Prescribed Medicine").strip()
        ingredient_clean = (active_ingredient or "").strip()
        strength_clean = (strength or "").strip()
        form_clean = (dosage_form or "Tablet").strip()

        # Validation: Mandatory inputs for clinical generic substitution
        if not ingredient_clean or not strength_clean:
            return {
                "prescribed_brand": brand_clean,
                "active_ingredient": ingredient_clean,
                "strength": strength_clean,
                "dosage_form": form_clean,
                "generic_name": None,
                "manufacturer": None,
                "approximate_price": None,
                "verification_status": "INPUT_REQUIRED",
                "match_count": 0,
                "matches": [],
                "warning": STATUTORY_WARNING_MESSAGE,
                "message": "Both active ingredient and strength are required for verified generic matching."
            }

        norm_req_api = normalize_active_ingredient(ingredient_clean)
        norm_req_strength = normalize_strength(strength_clean)
        norm_req_form = normalize_dosage_form(form_clean)

        # Query all verified generic records from database (Rule 4: verified records only)
        # We explicitly enforce verified == True in the query
        db_generics = (
            db.query(GenericMedicine)
            .filter(GenericMedicine.verified.is_(True))
            .all()
        )

        matched_records: List[Dict[str, Any]] = []

        for gen in db_generics:
            db_api_norm = normalize_active_ingredient(gen.active_ingredient)
            db_strength_norm = normalize_strength(gen.strength)
            db_form_norm = normalize_dosage_form(gen.dosage_form)

            # Rule 1: Active ingredient must match exactly
            if db_api_norm != norm_req_api:
                # Also allow partial subset match only if all requested active molecules are present
                req_molecules = set(norm_req_api.split(" + "))
                db_molecules = set(db_api_norm.split(" + "))
                if req_molecules != db_molecules:
                    continue

            # Rule 2: Strength must match
            # Verify exact strength equivalence
            if db_strength_norm != norm_req_strength:
                # Check if multi-component strengths are matching in any component permutation
                req_str_parts = set(norm_req_strength.split("+"))
                db_str_parts = set(db_strength_norm.split("+"))
                if req_str_parts != db_str_parts:
                    continue

            # Rule 3: Dosage form should match (priority scoring)
            form_matched = (db_form_norm == norm_req_form) or (
                "tablet" in db_form_norm and "tablet" in norm_req_form
            ) or (
                "capsule" in db_form_norm and "capsule" in norm_req_form
            )

            # Rule 5: Note that matching was performed purely on API + strength + form,
            # NOT by brand name similarity.

            # Resolve parent branded medicine for price comparison if available
            parent_med = db.query(Medicine).filter_by(id=gen.medicine_id).first() if gen.medicine_id else None
            branded_price = float(parent_med.approximate_price) if parent_med else None
            gen_price = float(gen.approximate_price)
            savings_pct = None
            if branded_price and branded_price > 0 and gen_price < branded_price:
                savings_pct = round(((branded_price - gen_price) / branded_price) * 100, 1)

            matched_records.append({
                "id": gen.id,
                "generic_name": gen.generic_name,
                "active_ingredient": gen.active_ingredient,
                "strength": gen.strength,
                "dosage_form": gen.dosage_form,
                "manufacturer": gen.manufacturer or "Bureau of Pharma PSUs of India (BPPI)",
                "approximate_price": gen_price,
                "verification_status": "VERIFIED" if gen.verified else "UNVERIFIED",
                "verified": bool(gen.verified),
                "form_exact_match": form_matched,
                "branded_reference_price": branded_price,
                "savings_percentage": savings_pct,
                "pmbjp_certified": "BPPI" in (gen.manufacturer or "") or "PMBJP" in gen.generic_name
            })

        # Sort matches: exact dosage form matches first, then lowest price
        matched_records.sort(key=lambda m: (not m["form_exact_match"], m["approximate_price"]))

        if matched_records:
            primary_match = matched_records[0]
            return {
                "prescribed_brand": brand_clean,
                "active_ingredient": ingredient_clean,
                "strength": strength_clean,
                "dosage_form": form_clean,
                "generic_name": primary_match["generic_name"],
                "manufacturer": primary_match["manufacturer"],
                "approximate_price": primary_match["approximate_price"],
                "verification_status": "VERIFIED",
                "match_count": len(matched_records),
                "matches": matched_records,
                "warning": STATUTORY_WARNING_MESSAGE,
                "message": f"Successfully identified {len(matched_records)} verified generic alternative(s) matching '{ingredient_clean} {strength_clean}'."
            }
        else:
            return {
                "prescribed_brand": brand_clean,
                "active_ingredient": ingredient_clean,
                "strength": strength_clean,
                "dosage_form": form_clean,
                "generic_name": None,
                "manufacturer": None,
                "approximate_price": None,
                "verification_status": "NO_VERIFIED_GENERIC_FOUND",
                "match_count": 0,
                "matches": [],
                "warning": STATUTORY_WARNING_MESSAGE,
                "message": f"No verified generic medicine found matching the exact active ingredient '{ingredient_clean}' and strength '{strength_clean}'."
            }

    @staticmethod
    def match_generics_batch(
        db: Session,
        items: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Processes a batch of confirmed prescription medicines and matches each item
        to verified generic alternatives.
        """
        results = []
        total_matched = 0

        for item in items:
            brand = item.get("confirmed_medicine_name") or item.get("medicine_name") or item.get("brand_name")
            ingredient = item.get("active_ingredient") or brand
            strength = item.get("strength") or "Standard"
            dosage_form = item.get("dosage_form") or "Tablet"

            match_res = GenericMatchingEngine.match_generics(
                db=db,
                prescribed_brand=brand,
                active_ingredient=ingredient,
                strength=strength,
                dosage_form=dosage_form
            )
            if match_res.get("match_count", 0) > 0:
                total_matched += 1
            results.append(match_res)

        return {
            "success": True,
            "total_medicines_processed": len(items),
            "total_medicines_matched": total_matched,
            "results": results,
            "warning": STATUTORY_WARNING_MESSAGE
        }
