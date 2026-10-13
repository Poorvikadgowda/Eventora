"""
Automated Test Suite for GenericSwap Relational Database Layer.
Verifies SQLAlchemy models, SQLite foreign keys, seed data, CRUD operations,
and REST API endpoints for USERS, MEDICINES, GENERIC_MEDICINES, PHARMACIES,
PHARMACY_INVENTORY, PRESCRIPTIONS, EXTRACTED_MEDICINES, and SEARCH_HISTORY.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.main import app
from backend.models.sql_models import (
    Base,
    User,
    Medicine,
    GenericMedicine,
    Pharmacy,
    PharmacyInventory,
    Prescription,
    ExtractedMedicine,
    SearchHistory
)
from backend.core.database import get_db, init_sqlalchemy_db
from backend.seed_data import seed_verified_demo_data
from backend import crud
from backend.schemas.db_schemas import (
    UserCreate,
    MedicineCreate,
    GenericMedicineCreate,
    PharmacyCreate,
    PrescriptionCreate,
    ExtractedMedicineBase,
    ExtractedMedicineUpdate
)


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    """Ensure database tables and verified seed data are initialized."""
    init_sqlalchemy_db()
    from backend.core.database import SessionLocal
    db = SessionLocal()
    try:
        med = db.query(Medicine).filter_by(id="combiflam-test").first()
        if med:
            db.delete(med)
            db.commit()
    finally:
        db.close()


def test_seed_data_integrity():
    """Verify that verified demo data is correctly seeded into all tables."""
    client = TestClient(app)

    # 1. Check verified medicines
    res_meds = client.get("/api/db/medicines")
    assert res_meds.status_code == 200
    meds = res_meds.json()
    assert len(meds) >= 8
    dolo = next((m for m in meds if m["id"] == "dolo-650"), None)
    assert dolo is not None
    assert dolo["brand_name"] == "Dolo 650"
    assert dolo["active_ingredient"] == "Paracetamol"
    assert dolo["verified"] is True

    # 2. Check verified generic alternatives
    res_gen = client.get("/api/db/generics/by-medicine/dolo-650")
    assert res_gen.status_code == 200
    generics = res_gen.json()
    assert len(generics) >= 1
    assert "Paracetamol" in generics[0]["generic_name"]
    assert generics[0]["approximate_price"] < dolo["approximate_price"]

    # 3. Check pharmacies
    res_pharm = client.get("/api/db/pharmacies")
    assert res_pharm.status_code == 200
    pharmacies = res_pharm.json()
    assert len(pharmacies) >= 4

    # 4. Check demo inventory is clearly labeled
    res_inv = client.get("/api/db/inventory/pharmacy/pmbjp-delhi-02")
    assert res_inv.status_code == 200
    inv = res_inv.json()
    assert len(inv) >= 1
    assert inv[0]["availability_status"].startswith("DEMO_")
    assert inv[0]["is_demo_data"] is True


def test_medicine_crud_and_search():
    """Test creating and searching medicines in the database."""
    client = TestClient(app)

    # 1. Search for Paracetamol
    search_res = client.get("/api/db/medicines?search=paracetamol")
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) >= 1
    assert any(m["id"] == "dolo-650" for m in results)

    # 2. Create a new verified medicine
    new_med = {
        "id": "combiflam-test",
        "brand_name": "Combiflam",
        "generic_name": "Ibuprofen & Paracetamol Tablets",
        "active_ingredient": "Ibuprofen + Paracetamol",
        "strength": "400mg + 325mg",
        "dosage_form": "Tablet",
        "manufacturer": "Sanofi India",
        "pack_size": 20,
        "approximate_price": 45.0,
        "source": "VERIFIED_REGISTRY",
        "verified": True
    }
    create_res = client.post("/api/db/medicines", json=new_med)
    assert create_res.status_code in (200, 201)

    # 3. Add generic alternative for it
    new_gen = {
        "id": "gen-combiflam-test",
        "medicine_id": "combiflam-test",
        "generic_name": "Ibuprofen 400mg + Paracetamol 325mg Tablets (PMBJP0099)",
        "active_ingredient": "Ibuprofen + Paracetamol",
        "strength": "400mg + 325mg",
        "dosage_form": "Tablet",
        "manufacturer": "Jan Aushadhi (BPPI)",
        "approximate_price": 12.0,
        "verified": True
    }
    create_gen_res = client.post("/api/db/generics", json=new_gen)
    assert create_gen_res.status_code in (200, 201)

    # Verify detail returns generic alternatives
    detail_res = client.get("/api/db/medicines/combiflam-test")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["generic_alternatives"]) >= 1


def test_pharmacy_and_nearby_geospatial():
    """Test pharmacy listing and Haversine geospatial proximity query."""
    client = TestClient(app)

    # Connaught Place coordinates: 28.6328, 77.2197
    res = client.get("/api/db/pharmacies/nearby?lat=28.6328&lon=77.2197&radius=15&medicine_id=dolo-650")
    assert res.status_code == 200
    nearby = res.json()
    assert len(nearby) >= 2
    # Verify sorted by distance ascending
    assert nearby[0]["distance_km"] <= nearby[1]["distance_km"]
    assert "directions_url" in nearby[0]
    assert nearby[0]["target_inventory"] is not None
    assert nearby[0]["target_inventory"]["is_demo_data"] is True


def test_prescription_and_extracted_medicines_lifecycle():
    """Test saving prescriptions and updating extracted medicine entities."""
    client = TestClient(app)

    # 1. Create prescription with extracted items
    payload = {
        "user_id": "user-rahul-01",
        "image_path": "uploads/rx_lifestyle_01.png",
        "OCR_text": "Rx: Tab Telma 40mg 1-0-0, Tab Atorva 10mg 0-0-1",
        "processed_text": "1. Tab Telma 40mg (Morning)\n2. Tab Atorva 10mg (Night)",
        "extracted_items": [
            {
                "detected_name": "Tab Telma 40mg",
                "corrected_name": "Telma 40",
                "active_ingredient": "Telmisartan",
                "strength": "40mg",
                "dosage_form": "Tablet",
                "dosage_text": "1-0-0 Morning",
                "confidence": 0.95,
                "verification_status": "UNVERIFIED"
            }
        ]
    }
    create_rx = client.post("/api/db/prescriptions", json=payload)
    assert create_rx.status_code in (200, 201)
    rx_data = create_rx.json()
    rx_id = rx_data["id"]
    assert len(rx_data["extracted_medicines"]) == 1

    item_id = rx_data["extracted_medicines"][0]["id"]

    # 2. Update extracted item (Module 9: Confirmation / Editing)
    update_res = client.put(f"/api/db/prescriptions/items/{item_id}", json={
        "verification_status": "USER_VERIFIED",
        "dosage_text": "1-0-0 Morning after breakfast - 30 days"
    })
    assert update_res.status_code == 200
    updated_item = update_res.json()
    assert updated_item["verification_status"] == "USER_VERIFIED"
    assert "breakfast" in updated_item["dosage_text"]


def test_search_history():
    """Test logging and retrieving user medicine search audit trail."""
    client = TestClient(app)

    # Log search
    log_res = client.post("/api/db/search-history?medicine_id=dolo-650&user_id=user-rahul-01")
    assert log_res.status_code == 200

    # Retrieve history
    hist_res = client.get("/api/db/search-history/user-rahul-01")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert any(h["medicine_id"] == "dolo-650" for h in history)
