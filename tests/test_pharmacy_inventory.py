"""
Unit and Integration Tests for Live Pharmacy Location, Medicine Availability,
Stock Status Thresholds, Multi-Medicine Prescription Checking, and Pharmacy Admin Portal.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, get_db_connection
from backend.pharmacy_service import (
    calculate_haversine_distance,
    get_stock_status_info,
    format_time_ago,
    resolve_medicine_id,
    get_nearby_pharmacies_with_inventory,
    check_multi_medicine_prescription_availability,
    get_medicine_price_comparison,
    get_pharmacy_by_id,
    get_pharmacy_inventory,
    get_medicine_availability
)
from backend.admin_service import (
    get_pharmacy_admin_dashboard,
    update_inventory_item,
    mark_medicine_out_of_stock,
    get_all_registered_pharmacies,
    get_all_catalog_medicines
)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure database and seed records are initialized."""
    init_db()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


# ---------------------------------------------------------------------
# 1. Geodesic Distance & Stock Threshold Unit Tests
# ---------------------------------------------------------------------

def test_haversine_distance():
    # Connaught Place (28.6328, 77.2197) to AIIMS Gate (28.5672, 77.2100) ~ 7.3 km
    dist = calculate_haversine_distance(28.6328, 77.2197, 28.5672, 77.2100)
    assert 7.0 <= dist <= 8.0
    # Same point distance should be 0.0
    assert calculate_haversine_distance(28.6328, 77.2197, 28.6328, 77.2197) == 0.0


def test_stock_status_thresholds():
    # stock_quantity > 10 -> IN_STOCK (🟢)
    high = get_stock_status_info(15)
    assert high["status_code"] == "IN_STOCK"
    assert "🟢" in high["badge"]
    assert high["is_available"] is True

    # 4 <= stock_quantity <= 10 -> LOW_STOCK (🟠)
    low_4 = get_stock_status_info(4)
    low_10 = get_stock_status_info(10)
    assert low_4["status_code"] == "LOW_STOCK"
    assert "🟠" in low_4["badge"]
    assert low_10["status_code"] == "LOW_STOCK"
    assert low_4["is_available"] is True

    # 1 <= stock_quantity <= 3 -> VERY_LOW_STOCK (🔴)
    vlow_1 = get_stock_status_info(1)
    vlow_3 = get_stock_status_info(3)
    assert vlow_1["status_code"] == "VERY_LOW_STOCK"
    assert "🔴" in vlow_1["badge"]
    assert vlow_3["status_code"] == "VERY_LOW_STOCK"
    assert vlow_1["is_available"] is True

    # stock_quantity == 0 -> OUT_OF_STOCK (❌)
    out = get_stock_status_info(0)
    assert out["status_code"] == "OUT_OF_STOCK"
    assert "❌" in out["badge"]
    assert out["is_available"] is False


def test_format_time_ago():
    assert "recently" in format_time_ago(None)
    # Testing humanized string output
    now_iso = "2026-09-29T20:00:00+00:00"
    res = format_time_ago(now_iso)
    assert isinstance(res, str)


# ---------------------------------------------------------------------
# 2. Pharmacy Search & Multi-Medicine Prescription Checking
# ---------------------------------------------------------------------

def test_nearby_pharmacies_with_inventory():
    # Search around central Delhi for dolo-650
    pharmacies = get_nearby_pharmacies_with_inventory(
        user_lat=28.6139,
        user_lon=77.2090,
        radius_km=15.0,
        medicine_id="dolo-650"
    )
    assert len(pharmacies) > 0
    first = pharmacies[0]
    assert "name" in first
    assert "distance_km" in first
    assert "target_medicine_stock" in first
    med_stock = first["target_medicine_stock"]
    assert "stock_quantity" in med_stock
    assert "status_badge" in med_stock
    assert "last_updated_human" in med_stock


def test_multi_medicine_prescription_availability():
    # Patient prescribed both Dolo 650 and Pantocid DSR
    res = check_multi_medicine_prescription_availability(
        user_lat=28.6139,
        user_lon=77.2090,
        medicine_ids=["dolo-650", "pantocid-dsr"],
        radius_km=15.0
    )
    assert res["success"] is True
    assert res["total_medicines_requested"] == 2
    assert len(res["pharmacies"]) > 0

    # Ensure pharmacies with ALL_AVAILABLE appear first in sorting
    codes = [p["overall_status_code"] for p in res["pharmacies"]]
    # If there are ALL_AVAILABLE, they must precede OUT_OF_STOCK
    if "ALL_AVAILABLE" in codes and "OUT_OF_STOCK" in codes:
        assert codes.index("ALL_AVAILABLE") < codes.index("OUT_OF_STOCK")


def test_price_comparison():
    comp = get_medicine_price_comparison("dolo-650")
    assert comp["medicine_id"] == "dolo-650"
    assert comp["brand_mrp_inr"] > 0
    assert comp["generic_mrp_inr"] > 0
    assert "nearby_pharmacy_offers" in comp
    assert "disclaimer" in comp


# ---------------------------------------------------------------------
# 3. Pharmacy Admin & Inventory Management
# ---------------------------------------------------------------------

def test_admin_dashboard_and_inventory_update():
    pharmacy_id = "apollo-cp-01"
    dashboard = get_pharmacy_admin_dashboard(pharmacy_id)
    assert dashboard["success"] is True
    assert "kpis" in dashboard
    assert dashboard["kpis"]["total_medicines"] > 0

    # Update stock for dolo-650
    update_res = update_inventory_item(
        pharmacy_id=pharmacy_id,
        medicine_id="dolo-650",
        new_quantity=50,
        price=32.0,
        changed_by="Test Pharmacist",
        notes="Automated test stock update"
    )
    assert update_res["success"] is True
    assert update_res["new_quantity"] == 50

    # Check that audit history was logged
    updated_dash = get_pharmacy_admin_dashboard(pharmacy_id)
    history = updated_dash["recent_history"]
    assert len(history) > 0
    latest = history[0]
    assert latest["new_quantity"] == 50
    assert latest["changed_by"] == "Test Pharmacist"


# ---------------------------------------------------------------------
# 4. REST API Endpoint Tests via TestClient
# ---------------------------------------------------------------------

def test_api_pharmacies_nearby(client):
    response = client.get("/pharmacies/nearby?lat=28.6139&lng=77.2090&radius=10&medicine_id=dolo-650")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "target_medicine_stock" in data[0]


def test_api_pharmacy_details_and_inventory(client):
    # GET /pharmacies/{id}
    res_details = client.get("/pharmacies/apollo-cp-01")
    assert res_details.status_code == 200
    assert res_details.json()["name"] == "Apollo Pharmacy - Connaught Place Hub"

    # GET /pharmacies/{id}/inventory
    res_inv = client.get("/pharmacies/apollo-cp-01/inventory")
    assert res_inv.status_code == 200
    assert "inventory" in res_inv.json()
    assert len(res_inv.json()["inventory"]) > 0


def test_api_medicine_availability(client):
    res = client.get("/medicines/dolo-650/availability")
    assert res.status_code == 200
    data = res.json()
    assert data["medicine_id"] == "dolo-650"
    assert data["total_stockists"] > 0


def test_api_medicine_nearby_availability(client):
    res = client.get("/medicines/dolo-650/nearby-availability?lat=28.6139&lng=77.2090&radius=10")
    assert res.status_code == 200
    data = res.json()
    assert "price_comparison" in data
    assert "nearby_pharmacies" in data


def test_api_check_multi_availability(client):
    payload = {
        "lat": 28.6139,
        "lng": 77.2090,
        "medicine_ids": ["dolo-650", "telma-40"],
        "radius": 15.0
    }
    res = client.post("/pharmacy/check-multi-availability", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "pharmacies" in data


def test_api_pharmacy_admin_flow(client):
    # 1. Fetch dashboard
    res_dash = client.get("/pharmacy/admin/dashboard?pharmacy_id=pmbjp-delhi-02")
    assert res_dash.status_code == 200
    assert "kpis" in res_dash.json()

    # 2. Add / Update stock via POST /pharmacy/inventory
    payload = {
        "pharmacy_id": "pmbjp-delhi-02",
        "medicine_id": "dolo-650",
        "stock_quantity": 99,
        "price": 9.50,
        "changed_by": "Dr. Sharma",
        "notes": "Govt consignment batch intake"
    }
    res_post = client.post("/pharmacy/inventory", json=payload)
    assert res_post.status_code == 200
    assert res_post.json()["new_quantity"] == 99

    # 3. Check audit history
    res_hist = client.get("/inventory/history?pharmacy_id=pmbjp-delhi-02&limit=5")
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) > 0
    assert history[0]["changed_by"] == "Dr. Sharma"
