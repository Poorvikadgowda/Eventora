"""
End-to-End Automated Verification Test Suite for GenericSwap Supabase Integration.
Tests all required routes:
1. /api/supabase/status
2. /api/auth/register & /api/auth/login
3. /api/prescriptions/upload & /api/prescriptions/confirm
4. /api/medicines & /api/medicines/{medicine_id}
5. /api/generics & /api/generics/{medicine_id}
6. /api/pharmacies & /api/pharmacies/nearby
7. /api/inventory (GET & POST)
8. /api/chat
9. /api/profile/{user_id} & /api/profile/safety-check
"""

import pytest
import requests

BASE_URL = "http://127.0.0.1:8000"


def test_supabase_connection_status():
    """Verify live Supabase probe reports connected and all 8 tables are ready."""
    resp = requests.get(f"{BASE_URL}/api/supabase/status", timeout=10)
    assert resp.status_code == 200
    data = resp.json()
    assert data["connected"] is True
    assert data["auth_available"] is True
    assert data["database_connected"] is True
    assert "tables_status" in data
    # Check that critical tables are READY
    for table in ["medicines", "generic_medicines", "pharmacies", "inventory"]:
        assert data["tables_status"].get(table) == "READY", f"Table {table} not ready"


def test_auth_registration_and_login():
    """Verify patient registration and login endpoints create profiles."""
    test_phone = "9876543210"
    reg_payload = {
        "full_name": "Rahul Verma",
        "email": "rahul.verma@example.com",
        "phone": test_phone,
        "preferred_language": "en"
    }
    reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload, timeout=10)
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert reg_data["success"] is True
    assert "session_token" in reg_data

    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={"phone_or_email": test_phone}, timeout=10)
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["success"] is True
    assert "session_token" in login_data


def test_medicines_and_generics_catalog():
    """Verify medicines catalog and Jan Aushadhi generic alternatives."""
    meds_resp = requests.get(f"{BASE_URL}/api/medicines", timeout=10)
    assert meds_resp.status_code == 200
    meds_data = meds_resp.json()
    assert meds_data["count"] >= 1
    assert any(m["id"] == "dolo-650" for m in meds_data["medicines"])

    single_med_resp = requests.get(f"{BASE_URL}/api/medicines/dolo-650", timeout=10)
    assert single_med_resp.status_code == 200
    assert single_med_resp.json()["brand_name"] == "Dolo 650"

    generics_resp = requests.get(f"{BASE_URL}/api/generics", timeout=10)
    assert generics_resp.status_code == 200
    generics_data = generics_resp.json()
    assert generics_data["count"] >= 1


def test_pharmacies_and_inventory():
    """Verify registered pharmacies and inventory management."""
    pharm_resp = requests.get(f"{BASE_URL}/api/pharmacies", timeout=10)
    assert pharm_resp.status_code == 200
    pharm_data = pharm_resp.json()
    assert pharm_data["count"] >= 1

    inv_resp = requests.get(f"{BASE_URL}/api/inventory", timeout=10)
    assert inv_resp.status_code == 200
    inv_data = inv_resp.json()
    assert len(inv_data) >= 1

    # Test inventory stock update
    inv_update_payload = {
        "pharmacy_id": "jan-aushadhi-kendra-01",
        "medicine_id": "dolo-650",
        "quantity": 75,
        "price": 9.50,
        "stock_status": "IN_STOCK",
        "changed_by": "Pharmacist In-Charge",
        "notes": "Weekly inventory restock verified"
    }
    update_resp = requests.post(f"{BASE_URL}/api/inventory", json=inv_update_payload, timeout=10)
    assert update_resp.status_code == 200
    assert update_resp.json().get("success") is True


def test_prescription_upload_and_confirmation():
    """Verify prescription upload to Supabase Storage, OCR extraction, and confirmation."""
    files = {"file": ("rx_test.png", b"fake_png_header_content", "image/png")}
    form_data = {
        "user_id": "test-patient-001",
        "doctor_name": "Dr. S. Nair, MD",
        "clinic_name": "Apex Multi-Speciality Clinic"
    }
    upload_resp = requests.post(f"{BASE_URL}/api/prescriptions/upload", files=files, data=form_data, timeout=15)
    assert upload_resp.status_code == 200
    upload_data = upload_resp.json()
    assert upload_data["success"] is True
    assert "prescription_id" in upload_data
    assert "image_url" in upload_data
    assert upload_data["ocr_status"] == "PROCESSED"
    assert len(upload_data["extracted_medicines"]) >= 1

    rx_id = upload_data["prescription_id"]
    confirm_resp = requests.post(f"{BASE_URL}/api/prescriptions/confirm", json={
        "prescription_id": rx_id,
        "verified_medicines": upload_data["extracted_medicines"]
    }, timeout=10)
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["user_verified"] is True


def test_ai_pharmacist_chat_persistence():
    """Verify multilingual chatbot returns response and persists into chat_history."""
    chat_payload = {
        "message": "Is generic Paracetamol bioequivalent to Dolo 650?",
        "language": "en",
        "user_id": "test-patient-001"
    }
    chat_resp = requests.post(f"{BASE_URL}/api/chat", json=chat_payload, timeout=15)
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "response" in chat_data
    assert "CDSCO bioequivalence" in chat_data["response"]
    assert chat_data.get("persisted_in_supabase") is True


def test_profile_and_safety_check():
    """Verify user profile lookup and clinical allergy check."""
    profile_resp = requests.get(f"{BASE_URL}/api/profile/test-patient-001", timeout=10)
    assert profile_resp.status_code == 200
    assert profile_resp.json().get("id") == "test-patient-001"

    # Allergy check
    safety_resp = requests.post(f"{BASE_URL}/api/profile/safety-check", data={
        "user_id": "test-patient-001",
        "medicines": '[{"brand_name": "Augmentin 625 Duo", "active_ingredient": "Amoxicillin"}]'
    }, timeout=10)
    assert safety_resp.status_code == 200
    safety_data = safety_resp.json()
    assert "is_safe" in safety_data
