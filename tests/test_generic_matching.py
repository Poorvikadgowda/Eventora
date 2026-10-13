"""
tests/test_generic_matching.py

Automated Test Suite for Module: Generic Medicine Matching Engine.
Tests all clinical rules:
1. Active ingredient must match.
2. Strength must match.
3. Dosage form should match.
4. Only verified database records can be returned.
5. Do not recommend medicines based only on similar names.

Tests endpoint:
POST /api/generics/match
POST /api/generics/match-batch
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.main import app
from backend.core.database import SessionLocal, engine
from backend.models.sql_models import Base, Medicine, GenericMedicine
from backend.services.generic_matching_service import (
    normalize_active_ingredient,
    normalize_strength,
    normalize_dosage_form,
    GenericMatchingEngine,
    STATUTORY_WARNING_MESSAGE
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test Fixture
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module", autouse=True)
def setup_test_generics_database():
    """Ensures database has verified and unverified generic records for testing."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Clean up existing test generics if any
    test_gen_ids = ["test-gen-unverified", "test-gen-similar-name"]
    db.query(GenericMedicine).filter(GenericMedicine.id.in_(test_gen_ids)).delete(synchronize_session=False)
    db.commit()

    # 2. Add an unverified generic record to test Rule 4 (verified records only)
    unverified_gen = GenericMedicine(
        id="test-gen-unverified",
        medicine_id="dolo-650",
        generic_name="Unverified Paracetamol Generic 650mg",
        active_ingredient="Paracetamol",
        strength="650mg",
        dosage_form="Tablet",
        manufacturer="Unverified Pharma Ltd",
        approximate_price=5.0,
        verified=False  # Rule 4: Must NOT be returned
    )
    db.add(unverified_gen)

    # 3. Add a medicine with a similar brand name but different active ingredient to test Rule 5
    similar_name_brand = Medicine(
        id="paracet-cold-brand",
        brand_name="Paracet-Cold",
        generic_name="Phenylephrine & Chlorpheniramine",
        active_ingredient="Phenylephrine + Chlorpheniramine",
        strength="10mg + 4mg",
        dosage_form="Tablet",
        manufacturer="Cold Pharma",
        approximate_price=45.0,
        verified=True
    )
    existing_med = db.query(Medicine).filter_by(id="paracet-cold-brand").first()
    if not existing_med:
        db.add(similar_name_brand)

    db.commit()
    db.close()

    yield

    # Teardown
    db = SessionLocal()
    db.query(GenericMedicine).filter(GenericMedicine.id.in_(test_gen_ids)).delete(synchronize_session=False)
    db.query(Medicine).filter_by(id="paracet-cold-brand").delete(synchronize_session=False)
    db.commit()
    db.close()


# ---------------------------------------------------------------------------
# 1. Normalization Unit Tests
# ---------------------------------------------------------------------------

def test_normalize_active_ingredient():
    """Verify active ingredient normalization, synonym mapping, and order parity."""
    # Basic normalization
    assert normalize_active_ingredient("Paracetamol") == "paracetamol"
    assert normalize_active_ingredient("PARACETAMOL") == "paracetamol"

    # Chemical synonym mapping
    assert normalize_active_ingredient("Acetaminophen") == "paracetamol"
    assert normalize_active_ingredient("Amoxycillin") == "amoxicillin"
    assert normalize_active_ingredient("Potassium Clavulanate") == "clavulanic acid"

    # Multi-component combination normalization & canonical alphabetical sorting
    norm1 = normalize_active_ingredient("Pantoprazole + Domperidone")
    norm2 = normalize_active_ingredient("Domperidone & Pantoprazole")
    norm3 = normalize_active_ingredient("Pantoprazole and Domperidone")
    assert norm1 == "domperidone + pantoprazole"
    assert norm1 == norm2 == norm3


def test_normalize_strength():
    """Verify formulation strength normalization across space and unit variations."""
    assert normalize_strength("650 mg") == "650mg"
    assert normalize_strength("650mg") == "650mg"
    assert normalize_strength("40 mg + 30 mg") == "40mg+30mg"
    assert normalize_strength("40mg + 30mg SR") == "40mg+30mg"
    assert normalize_strength("500 mg + 125 mg Duo") == "500mg+125mg"


def test_normalize_dosage_form():
    """Verify canonical dosage form mappings."""
    assert normalize_dosage_form("Tablet") == "tablet"
    assert normalize_dosage_form("Tab") == "tablet"
    assert normalize_dosage_form("Tablets") == "tablet"
    assert normalize_dosage_form("Capsule (SR)") == "capsule"
    assert normalize_dosage_form("Cap") == "capsule"
    assert normalize_dosage_form("Syrup") == "syrup"


# ---------------------------------------------------------------------------
# 2. Matching Engine Rules Tests (Rules 1 - 5)
# ---------------------------------------------------------------------------

def test_matching_example_scenario():
    """
    Prompt Example Scenario:
    Prescribed:
      Brand: ExampleBrand
      Active Ingredient: Paracetamol
      Strength: 650 mg
      Form: Tablet

    Search the database for:
      Paracetamol, 650 mg, Tablet
    Must return matching generic medicines with required fields and statutory warning.
    """
    db = SessionLocal()
    result = GenericMatchingEngine.match_generics(
        db=db,
        prescribed_brand="ExampleBrand",
        active_ingredient="Paracetamol",
        strength="650 mg",
        dosage_form="Tablet"
    )
    db.close()

    assert result["prescribed_brand"] == "ExampleBrand"
    assert result["active_ingredient"] == "Paracetamol"
    assert result["strength"] == "650 mg"
    assert result["dosage_form"] == "Tablet"
    assert result["generic_name"] is not None
    assert "Paracetamol" in result["generic_name"]
    assert "650" in result["generic_name"]
    assert result["manufacturer"] == "Bureau of Pharma PSUs of India (BPPI)"
    assert result["approximate_price"] == 9.50
    assert result["verification_status"] == "VERIFIED"
    assert result["warning"] == STATUTORY_WARNING_MESSAGE
    assert result["match_count"] >= 1


def test_rule_1_active_ingredient_must_match():
    """Rule 1: If active ingredient does not match, return 0 matches."""
    db = SessionLocal()
    # Prescribing ExampleBrand with Ibuprofen when strength is 650 mg
    result = GenericMatchingEngine.match_generics(
        db=db,
        prescribed_brand="ExampleBrand",
        active_ingredient="UnknownSaltMolecule",
        strength="650 mg",
        dosage_form="Tablet"
    )
    db.close()

    assert result["match_count"] == 0
    assert result["generic_name"] is None
    assert result["verification_status"] == "NO_VERIFIED_GENERIC_FOUND"
    assert result["warning"] == STATUTORY_WARNING_MESSAGE


def test_rule_2_strength_must_match():
    """Rule 2: If strength does not match (e.g. 500mg vs 650mg), return 0 matches."""
    db = SessionLocal()
    result = GenericMatchingEngine.match_generics(
        db=db,
        prescribed_brand="ExampleBrand",
        active_ingredient="Paracetamol",
        strength="500 mg",  # Database only has 650mg
        dosage_form="Tablet"
    )
    db.close()

    assert result["match_count"] == 0
    assert result["generic_name"] is None
    assert result["verification_status"] == "NO_VERIFIED_GENERIC_FOUND"


def test_rule_3_dosage_form_parity():
    """Rule 3: Dosage form should match bioequivalent form."""
    db = SessionLocal()
    result = GenericMatchingEngine.match_generics(
        db=db,
        prescribed_brand="Pantocid DSR",
        active_ingredient="Pantoprazole + Domperidone",
        strength="40mg + 30mg",
        dosage_form="Capsule (SR)"
    )
    db.close()

    assert result["match_count"] >= 1
    assert "Capsule" in result["dosage_form"]
    assert result["matches"][0]["form_exact_match"] is True


def test_rule_4_only_verified_records_returned():
    """Rule 4: Unverified database records (verified == False) must NEVER be returned."""
    db = SessionLocal()
    result = GenericMatchingEngine.match_generics(
        db=db,
        prescribed_brand="ExampleBrand",
        active_ingredient="Paracetamol",
        strength="650 mg",
        dosage_form="Tablet"
    )
    db.close()

    # Ensure unverified test record was excluded
    matched_ids = [m["id"] for m in result["matches"]]
    assert "test-gen-unverified" not in matched_ids
    for m in result["matches"]:
        assert m["verified"] is True
        assert m["verification_status"] == "VERIFIED"


def test_rule_5_do_not_recommend_by_similar_brand_name():
    """
    Rule 5: Do not recommend medicines based only on similar names.
    Searching for 'Paracet-Cold' with active ingredient 'Phenylephrine + Chlorpheniramine'
    must NOT return Paracetamol 650mg, even though the brand name starts with 'Paracet'.
    """
    db = SessionLocal()
    result = GenericMatchingEngine.match_generics(
        db=db,
        prescribed_brand="Paracet-Cold",
        active_ingredient="Phenylephrine + Chlorpheniramine",
        strength="10mg + 4mg",
        dosage_form="Tablet"
    )
    db.close()

    # Must NOT substitute with Paracetamol 650mg
    assert result["match_count"] == 0
    assert result["generic_name"] is None


# ---------------------------------------------------------------------------
# 3. REST API Endpoint Integration Tests
# ---------------------------------------------------------------------------

def test_endpoint_post_generics_match_success():
    """Verify POST /api/generics/match endpoint with valid inputs."""
    payload = {
        "confirmed_medicine_name": "ExampleBrand",
        "active_ingredient": "Paracetamol",
        "strength": "650 mg",
        "dosage_form": "Tablet"
    }

    response = client.post("/api/generics/match", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Exact required response schema assertions
    assert data["prescribed_brand"] == "ExampleBrand"
    assert data["active_ingredient"] == "Paracetamol"
    assert data["strength"] == "650 mg"
    assert data["dosage_form"] == "Tablet"
    assert data["generic_name"] is not None
    assert data["manufacturer"] is not None
    assert data["approximate_price"] is not None
    assert data["verification_status"] == "VERIFIED"
    assert data["warning"] == STATUTORY_WARNING_MESSAGE
    assert len(data["matches"]) >= 1


def test_endpoint_post_generics_match_alias_field():
    """Verify POST /api/generics/match accepts 'medicine_name' as alias for 'confirmed_medicine_name'."""
    payload = {
        "medicine_name": "Dolo 650",
        "active_ingredient": "Paracetamol",
        "strength": "650mg",
        "dosage_form": "Tablet"
    }

    response = client.post("/api/generics/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prescribed_brand"] == "Dolo 650"
    assert data["verification_status"] == "VERIFIED"


def test_endpoint_post_generics_match_not_found():
    """Verify POST /api/generics/match returns clean status when no verified generic exists."""
    payload = {
        "confirmed_medicine_name": "ExperimentalBrand",
        "active_ingredient": "NonExistentActiveMolecule",
        "strength": "123 mg",
        "dosage_form": "Tablet"
    }

    response = client.post("/api/generics/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verification_status"] == "NO_VERIFIED_GENERIC_FOUND"
    assert data["match_count"] == 0
    assert data["generic_name"] is None
    assert data["warning"] == STATUTORY_WARNING_MESSAGE


def test_endpoint_post_generics_match_batch():
    """Verify POST /api/generics/match-batch processes multiple medicines."""
    payload = {
        "medicines": [
            {
                "confirmed_medicine_name": "Dolo 650",
                "active_ingredient": "Paracetamol",
                "strength": "650mg",
                "dosage_form": "Tablet"
            },
            {
                "confirmed_medicine_name": "Pantocid DSR",
                "active_ingredient": "Pantoprazole + Domperidone",
                "strength": "40mg + 30mg",
                "dosage_form": "Capsule (SR)"
            }
        ]
    }

    response = client.post("/api/generics/match-batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_medicines_processed"] == 2
    assert data["total_medicines_matched"] == 2
    assert len(data["results"]) == 2
    assert data["warning"] == STATUTORY_WARNING_MESSAGE
