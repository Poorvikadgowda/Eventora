"""
tests/test_price_comparison.py

Automated test suite for GenericSwap Price Comparison Module.

Validates:
1. Exact calculations:
   - absolute_saving = brand_price - generic_price
   - saving_percentage = ((brand_price - generic_price) / brand_price) * 100
2. Output metrics:
   - Brand Medicine (₹XXX)
   - Generic Medicine (₹XXX)
   - Estimated Savings (₹XXX)
   - Savings Percentage (XX%)
3. Statutory Invariant:
   - Prices must be labeled as approximate/demo/local-database prices.
   - Never claim displayed price is current market price without live verified data.
4. FastAPI endpoint:
   - GET /api/price-comparison/{medicine_id}
   - GET /api/price-comparison
5. Resilience against zero division and non-existent IDs (404).
"""

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.pricing_service import (
    PriceComparisonEngine,
    STATUTORY_PRICE_DISCLAIMER,
    PRICE_DATA_SOURCE_TYPE
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
# 1. Calculation Unit Tests
# ---------------------------------------------------------------------------

def test_calculate_savings_formula():
    """
    Test exact formula execution:
    absolute_saving = brand_price - generic_price
    saving_percentage = ((brand_price - generic_price) / brand_price) * 100
    """
    brand_price = 100.0
    generic_price = 20.0

    abs_sav, sav_pct = PriceComparisonEngine.calculate_savings(brand_price, generic_price)
    assert abs_sav == 80.0
    assert sav_pct == 80.0

    # Test with real Dolo 650 numbers
    # 32.0 - 9.5 = 22.5
    # (22.5 / 32.0) * 100 = 70.3125 -> 70.31%
    dolo_abs, dolo_pct = PriceComparisonEngine.calculate_savings(32.0, 9.5)
    assert dolo_abs == 22.5
    assert dolo_pct == 70.31

    # Test with Pantocid DSR numbers
    # 195.0 - 32.0 = 163.0
    # (163.0 / 195.0) * 100 = 83.5897... -> 83.59%
    panto_abs, panto_pct = PriceComparisonEngine.calculate_savings(195.0, 32.0)
    assert panto_abs == 163.0
    assert panto_pct == 83.59


def test_calculate_savings_division_by_zero_safety():
    """
    Ensure calculation safely handles 0.0 or negative brand prices without crashing.
    """
    abs_sav, sav_pct = PriceComparisonEngine.calculate_savings(0.0, 10.0)
    assert abs_sav == -10.0
    assert sav_pct == 0.0

    abs_sav, sav_pct = PriceComparisonEngine.calculate_savings(0.0, 0.0)
    assert abs_sav == 0.0
    assert sav_pct == 0.0


# ---------------------------------------------------------------------------
# 2. GET /api/price-comparison/{medicine_id} Tests
# ---------------------------------------------------------------------------

def test_endpoint_get_price_comparison_dolo(client):
    """
    Test GET /api/price-comparison/dolo-650
    Verifies 4 required display metrics and statutory disclaimer.
    """
    response = client.get("/api/price-comparison/dolo-650")
    assert response.status_code == 200

    data = response.json()

    # 1. Brand Medicine & Price
    assert data["brand_medicine"] == "Dolo 650"
    assert data["brand_price"] == 32.0

    # 2. Generic Medicine & Price
    assert "Paracetamol" in data["generic_medicine"]
    assert data["generic_price"] == 9.5

    # 3. Estimated Savings
    assert data["absolute_saving"] == 22.5

    # 4. Savings Percentage
    assert data["saving_percentage"] == 70.31

    # Statutory Labeling Invariants
    assert data["price_type"] == PRICE_DATA_SOURCE_TYPE
    assert data["is_live_market_price"] is False
    assert STATUTORY_PRICE_DISCLAIMER in data["disclaimer"]
    assert "approximate" in data["disclaimer"].lower()

    # Chart data structure
    chart = data["chart_data"]
    assert len(chart["bars"]) == 2
    assert chart["bars"][0]["label"] == "Brand Medicine"
    assert chart["bars"][0]["price"] == 32.0
    assert chart["bars"][1]["label"] == "Generic Medicine"
    assert chart["bars"][1]["price"] == 9.5
    assert chart["absolute_saving"] == 22.5
    assert chart["saving_percentage"] == 70.31


def test_endpoint_get_price_comparison_pantocid(client):
    """
    Test GET /api/price-comparison/pantocid-dsr
    """
    response = client.get("/api/price-comparison/pantocid-dsr")
    assert response.status_code == 200

    data = response.json()
    assert data["brand_medicine"] == "Pantocid DSR"
    assert data["brand_price"] == 195.0
    assert data["generic_price"] == 32.0
    assert data["absolute_saving"] == 163.0
    assert data["saving_percentage"] == 83.59


def test_endpoint_get_price_comparison_slug_resilience(client):
    """
    Test flexible lookup: user or URL provides 'Dolo 650' or 'dolo 650'
    """
    resp1 = client.get("/api/price-comparison/Dolo 650")
    assert resp1.status_code == 200
    assert resp1.json()["brand_medicine"] == "Dolo 650"

    resp2 = client.get("/api/price-comparison/augmentin-625-duo")
    assert resp2.status_code == 200
    assert resp2.json()["brand_price"] == 224.0
    assert resp2.json()["generic_price"] == 60.0


def test_endpoint_get_price_comparison_not_found(client):
    """
    Test 404 response when medicine does not exist.
    """
    response = client.get("/api/price-comparison/non-existent-medicine-xyz")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 3. GET /api/price-comparison (Catalog List) Tests
# ---------------------------------------------------------------------------

def test_endpoint_list_all_price_comparisons(client):
    """
    Test GET /api/price-comparison
    Returns verified catalog comparisons with statutory disclaimer on all entries.
    """
    response = client.get("/api/price-comparison")
    assert response.status_code == 200

    data = response.json()
    assert data["total_comparable_medicines"] >= 5
    assert data["price_type"] == PRICE_DATA_SOURCE_TYPE
    assert STATUTORY_PRICE_DISCLAIMER in data["disclaimer"]

    # Check that each comparison includes the 4 primary metrics
    for comp in data["comparisons"]:
        assert "brand_medicine" in comp
        assert "brand_price" in comp
        assert "generic_medicine" in comp
        assert "generic_price" in comp
        assert "absolute_saving" in comp
        assert "saving_percentage" in comp
        assert comp["is_live_market_price"] is False
        assert comp["price_type"] == PRICE_DATA_SOURCE_TYPE
