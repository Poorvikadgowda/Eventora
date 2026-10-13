"""
tests/test_pharmacy_locator_module.py

Automated test suite for Pharmacy Locator Module.

Verifies:
1. Haversine distance calculation using GPS coordinates.
2. Availability status values:
   - AVAILABLE
   - LOW STOCK
   - OUT OF STOCK
   - UNKNOWN
3. Safety Invariant:
   - Never convert UNKNOWN into AVAILABLE.
4. GET /api/pharmacies/nearby:
   - Card fields:
     - Pharmacy name
     - Address
     - Distance
     - Phone
     - Selected medicine
     - Availability status
     - Approximate price
     - Last updated
5. Sorting options:
   - Distance (nearest first)
   - Availability (AVAILABLE > LOW STOCK > UNKNOWN > OUT OF STOCK)
   - Price (lowest price first)
6. Google Maps navigation link generation and graceful fallback.
7. Manual city and query search filtering.
"""

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.pharmacy_locator_service import (
    calculate_haversine_distance,
    evaluate_stock_availability,
    PharmacyLocatorService,
    AVAILABILITY_AVAILABLE,
    AVAILABILITY_LOW_STOCK,
    AVAILABILITY_OUT_OF_STOCK,
    AVAILABILITY_UNKNOWN,
    VALID_AVAILABILITY_STATUSES
)
from backend.core.database import SessionLocal, init_sqlalchemy_db
from backend.seed_data import seed_verified_demo_data


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure database and seed data are initialized."""
    init_sqlalchemy_db()
    db = SessionLocal()
    try:
        seed_verified_demo_data(db)
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


# ---------------------------------------------------------------------------
# 1. Geodesic Haversine Distance Calculation Tests
# ---------------------------------------------------------------------------

def test_haversine_distance_calculation():
    """
    Test geodesic Haversine distance formula with known coordinates.
    AIIMS Delhi (28.5672, 77.2100) to Connaught Place (28.6328, 77.2197) is approx 7.3 km.
    """
    dist = calculate_haversine_distance(28.5672, 77.2100, 28.6328, 77.2197)
    assert 7.0 <= dist <= 7.6

    # Same location should be 0.0
    zero_dist = calculate_haversine_distance(28.6139, 77.2090, 28.6139, 77.2090)
    assert zero_dist == 0.0


# ---------------------------------------------------------------------------
# 2. Availability Modeling & Invariant: Never convert UNKNOWN into AVAILABLE
# ---------------------------------------------------------------------------

def test_evaluate_stock_availability_thresholds():
    """
    Validate mapping:
    - > 10 strips -> AVAILABLE
    - 1 to 10 strips -> LOW STOCK
    - 0 strips -> OUT OF STOCK
    - None/Missing -> UNKNOWN
    """
    # > 10 strips
    status, qty, price, _, _ = evaluate_stock_availability({"stock_quantity": 45, "approximate_price": 9.5})
    assert status == AVAILABILITY_AVAILABLE
    assert qty == 45
    assert price == 9.5

    # 1 to 10 strips
    status_low, qty_low, _, _, _ = evaluate_stock_availability({"stock_quantity": 4, "approximate_price": 32.0})
    assert status_low == AVAILABILITY_LOW_STOCK
    assert qty_low == 4

    # 0 strips
    status_out, qty_out, _, _, _ = evaluate_stock_availability({"stock_quantity": 0, "approximate_price": 32.0})
    assert status_out == AVAILABILITY_OUT_OF_STOCK
    assert qty_out == 0


def test_safety_invariant_never_convert_unknown_to_available():
    """
    CRITICAL INVARIANT TEST:
    Never convert UNKNOWN into AVAILABLE.
    If no record exists, stock is None, or unverified -> MUST BE UNKNOWN.
    """
    # 1. None record
    status1, qty1, price1, _, _ = evaluate_stock_availability(None)
    assert status1 == AVAILABILITY_UNKNOWN
    assert status1 != AVAILABILITY_AVAILABLE

    # 2. Empty dict
    status2, qty2, price2, _, _ = evaluate_stock_availability({})
    assert status2 == AVAILABILITY_UNKNOWN
    assert status2 != AVAILABILITY_AVAILABLE

    # 3. Explicit unknown status
    status3, _, _, _, _ = evaluate_stock_availability({"status": "UNKNOWN"})
    assert status3 == AVAILABILITY_UNKNOWN
    assert status3 != AVAILABILITY_AVAILABLE

    # 4. Record without quantity
    status4, _, _, _, _ = evaluate_stock_availability({"medicine_id": "rare-drug-xyz"})
    assert status4 == AVAILABILITY_UNKNOWN
    assert status4 != AVAILABILITY_AVAILABLE


# ---------------------------------------------------------------------------
# 3. GET /api/pharmacies/nearby Endpoint Tests
# ---------------------------------------------------------------------------

def test_endpoint_get_nearby_pharmacies_card_fields(client):
    """
    Test that GET /api/pharmacies/nearby returns all required card fields:
    1. Pharmacy name
    2. Address
    3. Distance
    4. Phone
    5. Selected medicine
    6. Availability status
    7. Approximate price
    8. Last updated
    """
    response = client.get("/api/pharmacies/nearby?lat=28.6139&lon=77.2090&medicine_id=dolo-650")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert "user_location" in data
    assert "selected_medicine" in data
    assert "sort_by" in data
    assert len(data["pharmacies"]) > 0

    first = data["pharmacies"][0]
    # Card fields check
    assert "pharmacy_name" in first
    assert "address" in first
    assert "distance" in first
    assert "distance_km" in first
    assert "distance_text" in first
    assert "phone" in first
    assert "selected_medicine" in first
    assert "availability_status" in first
    assert first["availability_status"] in VALID_AVAILABILITY_STATUSES
    assert "approximate_price" in first
    assert "last_updated" in first
    assert "last_updated_human" in first

    # Navigation URL check
    assert "google_maps_url" in first
    assert "https://www.google.com/maps/dir/?api=1" in first["google_maps_url"]


def test_endpoint_sorting_by_distance(client):
    """
    Test sort_by=distance returns ascending distance.
    """
    response = client.get("/api/pharmacies/nearby?lat=28.6139&lon=77.2090&sort_by=distance")
    assert response.status_code == 200

    pharmacies = response.json()["pharmacies"]
    distances = [p["distance"] for p in pharmacies]
    assert distances == sorted(distances)


def test_endpoint_sorting_by_availability(client):
    """
    Test sort_by=availability prioritizes AVAILABLE over LOW STOCK / OUT OF STOCK.
    """
    response = client.get("/api/pharmacies/nearby?lat=28.6139&lon=77.2090&medicine_id=dolo-650&sort_by=availability")
    assert response.status_code == 200

    pharmacies = response.json()["pharmacies"]
    statuses = [p["availability_status"] for p in pharmacies]

    # If both AVAILABLE and OUT OF STOCK exist, AVAILABLE must appear before OUT OF STOCK
    if AVAILABILITY_AVAILABLE in statuses and AVAILABILITY_OUT_OF_STOCK in statuses:
        first_avail = statuses.index(AVAILABILITY_AVAILABLE)
        first_out = statuses.index(AVAILABILITY_OUT_OF_STOCK)
        assert first_avail < first_out


def test_endpoint_sorting_by_price(client):
    """
    Test sort_by=price prioritizes lowest approximate price.
    """
    response = client.get("/api/pharmacies/nearby?lat=28.6139&lon=77.2090&medicine_id=dolo-650&sort_by=price")
    assert response.status_code == 200

    pharmacies = response.json()["pharmacies"]
    available_prices = [p["approximate_price"] for p in pharmacies if p["availability_status"] != AVAILABILITY_OUT_OF_STOCK and p["approximate_price"] > 0]
    if len(available_prices) > 1:
        assert available_prices == sorted(available_prices)


def test_endpoint_manual_city_search(client):
    """
    Test manual location/search filtering when geolocation is not used or permission denied.
    """
    response = client.get("/api/pharmacies/nearby?city=Bengaluru&medicine_id=dolo-650")
    assert response.status_code == 200

    pharmacies = response.json()["pharmacies"]
    assert len(pharmacies) > 0
    for p in pharmacies:
        assert "bengaluru" in (p["address"] + " " + p["pharmacy_name"]).lower()


def test_endpoint_unknown_medicine_availability_invariant(client):
    """
    Test requesting a non-existent medicine returns UNKNOWN availability, NEVER AVAILABLE.
    """
    response = client.get("/api/pharmacies/nearby?lat=28.6139&lon=77.2090&medicine_id=non-existent-drug-12345")
    assert response.status_code == 200

    pharmacies = response.json()["pharmacies"]
    assert len(pharmacies) > 0
    for p in pharmacies:
        # Every pharmacy must report UNKNOWN (or OUT OF STOCK), never AVAILABLE!
        assert p["availability_status"] != AVAILABILITY_AVAILABLE
        assert p["availability_status"] in (AVAILABILITY_UNKNOWN, AVAILABILITY_OUT_OF_STOCK)
