"""
Automated Test Suite for GenericSwap Application:
Tests Mobile Number OTP confirmation, OCR NER parsing, drug registry matching,
savings calculations, and FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app, load_datasets
from backend.auth import send_otp, verify_otp, sanitize_mobile
from backend.ocr_engine import parse_prescription_text
import json
from pathlib import Path


from backend.database import init_db
from backend.core.database import init_sqlalchemy_db


@pytest.fixture(scope="module", autouse=True)
def init_app():
    load_datasets()
    init_sqlalchemy_db()
    init_db()


def test_sanitize_mobile():
    assert sanitize_mobile("9876543210") == "9876543210"
    assert sanitize_mobile("+91 98765-43210") == "9876543210"
    assert sanitize_mobile("09876543210") == "9876543210"
    assert sanitize_mobile("+919876543210") == "9876543210"


def test_mobile_otp_flow():
    test_phone = "9876543210"

    # Step 1: Request 6-digit OTP
    otp_resp = send_otp(test_phone, "Test User")
    assert otp_resp["success"] is True
    assert "demo_code" in otp_resp
    code = otp_resp["demo_code"]
    assert len(code) == 6
    assert code.isdigit()

    # Step 2: Test invalid 6-digit code rejection
    invalid_resp = verify_otp(test_phone, "000000")
    assert invalid_resp["success"] is False

    # Step 3: Test valid 6-digit confirmation
    verify_resp = verify_otp(test_phone, code)
    assert verify_resp["success"] is True
    assert "session_token" in verify_resp
    assert verify_resp["mobile_number"] == test_phone


def test_dataset_integrity():
    data_dir = Path(__file__).resolve().parent.parent / "backend" / "data"
    with open(data_dir / "drug_registry.json", "r", encoding="utf-8") as f:
        drugs = json.load(f)
    assert len(drugs) >= 10
    
    # Check Dolo 650
    dolo = next((d for d in drugs if d["id"] == "dolo-650"), None)
    assert dolo is not None
    assert dolo["active_ingredients"][0]["molecule"] == "Paracetamol"
    assert dolo["active_ingredients"][0]["dosage"] == "650mg"

    with open(data_dir / "jan_aushadhi_catalog.json", "r", encoding="utf-8") as f:
        generics = json.load(f)
    assert len(generics) >= 10
    
    para_gen = next((g for g in generics if g["generic_molecule_slug"] == "paracetamol-650mg"), None)
    assert para_gen is not None
    assert para_gen["pmbjp_drug_code"] == "PMBJP00124"
    assert para_gen["jan_aushadhi_unit_price"] < dolo["price_per_unit"]


def test_prescription_ner_extraction():
    data_dir = Path(__file__).resolve().parent.parent / "backend" / "data"
    with open(data_dir / "drug_registry.json", "r", encoding="utf-8") as f:
        drugs = json.load(f)

    sample_rx = (
        "Rx\n"
        "1. Tab Dolo 650mg 1-0-1 after food\n"
        "2. Cap Pantocid DSR 1-0-0 empty stomach\n"
        "Advice: Drink plenty of water"
    )

    parsed = parse_prescription_text(sample_rx, drugs)
    assert parsed["total_medicines_detected"] >= 2
    
    names = [d["drug_data"]["brand_name"] for d in parsed["detected_drugs"]]
    assert "Dolo 650" in names
    assert "Pantocid DSR" in names


def test_fastapi_endpoints():
    client = TestClient(app)

    # 1. Health check
    h = client.get("/api/health")
    assert h.status_code == 200
    assert h.json()["status"] == "healthy"

    # 2. Send OTP endpoint
    send_res = client.post("/api/auth/send-otp", json={
        "mobile_number": "9123456789",
        "user_name": "API Test Patient"
    })
    assert send_res.status_code == 200
    demo_code = send_res.json()["demo_code"]

    # 3. Verify OTP endpoint
    verify_res = client.post("/api/auth/verify-otp", json={
        "mobile_number": "9123456789",
        "code": demo_code
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True

    # 4. Search endpoint
    search_res = client.get("/api/search?q=augmentin")
    assert search_res.status_code == 200
    assert search_res.json()["count"] >= 1

    # 5. Prescription Analysis endpoint
    analysis_res = client.post("/api/analyze-prescription", data={
        "raw_text": "Tab Telma 40mg 1-0-0 daily\nTab Glycomet GP2 1-0-0"
    })
    assert analysis_res.status_code == 200
    data = analysis_res.json()
    assert data["total_medicines_found"] >= 2
    assert data["financial_summary"]["savings_percentage"] > 70.0


def test_chronic_savings_calculator():
    client = TestClient(app)
    payload = {
        "items": [
            {"drug_id": "telma-40", "daily_units": 1.0},
            {"drug_id": "pantocid-dsr", "daily_units": 1.0}
        ],
        "duration_months": 12,
        "family_members_count": 1
    }
    calc_res = client.post("/api/savings-calculator", json=payload)
    assert calc_res.status_code == 200
    res_data = calc_res.json()
    assert res_data["total_branded_spend_inr"] > res_data["total_generic_spend_inr"]
    assert res_data["overall_savings_percentage"] > 80.0
    assert res_data["annualized_savings_inr"] > 5000.0


def test_chatbot_endpoint():
    client = TestClient(app)
    # 1. Ask about bioequivalence
    chat_res = client.post("/api/chat", json={
        "message": "Are generic medicines really as effective and safe as branded ones?",
        "history": []
    })
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "response" in data
    assert "Bioequivalent" in data["response"] or "API" in data["response"]

    # 2. Ask with prescription context
    rx_context = {
        "medicines": [
            {
                "brand_name": "Dolo 650",
                "strength": "650mg",
                "therapeutic_class": "Analgesic & Antipyretic",
                "branded_unit_price": 2.27,
                "generic_unit_price": 0.95,
                "savings_percentage": 58.1
            }
        ]
    }
    chat_rx = client.post("/api/chat", json={
        "message": "Explain my prescription medicines",
        "history": [],
        "prescription_context": rx_context
    })
    assert chat_rx.status_code == 200
    rx_data = chat_rx.json()
    assert "Dolo 650" in rx_data["response"]


def test_medicine_history_safety_checker():
    from backend.medicine_history import check_clinical_safety
    
    # Patient with Penicillin allergy & GERD
    patient = {
        "patient_name": "Test Patient",
        "drug_allergies": ["Penicillin / Amoxicillin / Ampicillin"],
        "chronic_conditions": ["Peptic Ulcer / Acid Reflux (GERD)"],
        "current_medications": [{"brand_or_molecule": "Telma 40"}]
    }

    # 1. Prescribe Augmentin (contains Amoxicillin) -> Should trigger Critical Allergy Alert
    safety_aug = check_clinical_safety(patient, [
        {"brand_name": "Augmentin 625 Duo", "strength": "Amoxicillin 500mg + Clavulanic Acid 125mg"}
    ])
    assert safety_aug["is_clinically_safe"] is False
    assert len(safety_aug["alerts"]) >= 1
    assert any("ALLERGIC" in a["message"] for a in safety_aug["alerts"])

    # 2. Prescribe Combiflam (Ibuprofen NSAID) -> Should trigger GERD caution
    safety_combi = check_clinical_safety(patient, [
        {"brand_name": "Combiflam", "strength": "Ibuprofen 400mg + Paracetamol 325mg"}
    ])
    assert any("Peptic Ulcer" in a["title"] for a in safety_combi["alerts"])


def test_multilingual_voice_engine():
    from backend.multilingual_voice import get_multilingual_response, generate_audio_speech_base64

    # 1. Test Hindi response
    resp_hi = get_multilingual_response("क्या दवाएं सुरक्षित हैं?", lang_code="hi")
    assert resp_hi["language"] == "hi"
    assert "सुरक्षित" in resp_hi["response"] or "API" in resp_hi["response"]

    # 2. Test Audio base64 generation
    audio_b64 = generate_audio_speech_base64("नमस्ते, जेनेरिक दवाएं सुरक्षित हैं", lang_code="hi")
    assert audio_b64 is not None
    assert audio_b64.startswith("data:audio/mp3;base64,")


def test_patient_history_endpoints():
    client = TestClient(app)

    # 1. Get history
    hist_res = client.get("/api/patient/history?mobile=9876543210")
    assert hist_res.status_code == 200
    assert "drug_allergies" in hist_res.json()

    # 2. Save history
    save_res = client.post("/api/patient/history", json={
        "mobile_number": "9876543210",
        "patient_name": "Rahul Verma",
        "age": 38,
        "gender": "Male",
        "chronic_conditions": ["Hypertension (High Blood Pressure)"],
        "drug_allergies": ["Penicillin / Amoxicillin / Ampicillin"],
        "current_medications": [{"brand_or_molecule": "Telma 40", "strength": "40mg"}],
        "past_adverse_reactions": "Skin hives with Amoxicillin"
    })
    assert save_res.status_code == 200
    assert save_res.json()["success"] is True

    # 3. Check safety endpoint
    safety_res = client.post("/api/patient/check-safety", json={
        "mobile_number": "9876543210",
        "medicines": [{"brand_name": "Augmentin 625 Duo", "strength": "Amoxicillin 500mg"}]
    })
    assert safety_res.status_code == 200
    assert safety_res.json()["is_clinically_safe"] is False

    # 4. Multilingual chat with voice audio
    chat_hi = client.post("/api/chat", json={
        "message": "जन औषधि के बारे में बताएं",
        "language": "hi",
        "enable_voice": True
    })
    assert chat_hi.status_code == 200
    hi_data = chat_hi.json()
    assert hi_data["language"] == "hi"
    assert hi_data["audio_base64"] is not None


def test_pharmacy_locator_and_stock():
    client = TestClient(app)

    # 1. Search pharmacies near Connaught Place Delhi (28.6328, 77.2197)
    pharm_res = client.get("/api/pharmacies/nearby?lat=28.6328&lon=77.2197&max_radius_km=15")
    assert pharm_res.status_code == 200
    pharmacies = pharm_res.json()
    assert len(pharmacies) >= 2
    # Verify distance calculation is sorted ascending
    assert pharmacies[0]["distance_km"] <= pharmacies[1]["distance_km"]

    # 2. Check stock for Dolo 650 with in_stock_only filter
    stock_res = client.get("/api/pharmacies/nearby?lat=28.6328&lon=77.2197&drug_id=dolo-650&in_stock_only=true")
    assert stock_res.status_code == 200
    in_stock_list = stock_res.json()
    assert len(in_stock_list) >= 1
    assert in_stock_list[0]["target_drug_stock"]["in_stock"] is True
    assert in_stock_list[0]["target_drug_stock"]["quantity_strips"] > 0

    # 3. Test Medicine 1-Hour Hold Reservation
    store_id = in_stock_list[0]["id"]
    res_payload = {
        "pharmacy_id": store_id,
        "patient_mobile": "9876543210",
        "patient_name": "Rahul Verma",
        "drug_id": "dolo-650",
        "drug_name": "Paracetamol 650mg Generic",
        "quantity_strips": 1
    }
    reserve_res = client.post("/api/pharmacies/reserve", json=res_payload)
    assert reserve_res.status_code == 200
    res_data = reserve_res.json()
    assert res_data["success"] is True
    assert "reservation" in res_data
    assert res_data["reservation"]["reservation_id"].startswith("RES-")

    # 4. Test Multi-Medicine Prescription Basket Stock Checker
    basket_req = {
        "lat": 28.6328,
        "lon": 77.2197,
        "drug_ids": ["dolo-650", "pantocid-dsr", "augmentin-625-duo"],
        "in_stock_only": False,
        "max_radius_km": 30.0
    }
    basket_res = client.post("/api/pharmacies/check-basket-stock", json=basket_req)
    assert basket_res.status_code == 200
    basket_data = basket_res.json()
    assert basket_data["success"] is True
    assert basket_data["total_medicines_checked"] == 3
    assert len(basket_data["pharmacies"]) >= 2
    # Verify items breakdown exists
    first_pharm = basket_data["pharmacies"][0]
    assert len(first_pharm["items"]) == 3
    assert "google_maps_url" in first_pharm

    # 5. Test Basket Reservation Hold
    reserve_basket_req = {
        "pharmacy_id": first_pharm["id"],
        "patient_mobile": "9876543210",
        "patient_name": "Rahul Verma",
        "items": [
            {"drug_id": "dolo-650", "drug_name": "Paracetamol 650mg", "quantity_strips": 1},
            {"drug_id": "pantocid-dsr", "drug_name": "Pantocid DSR", "quantity_strips": 1}
        ]
    }
    b_res = client.post("/api/pharmacies/reserve-basket", json=reserve_basket_req)
    assert b_res.status_code == 200
    b_data = b_res.json()
    assert b_data["success"] is True
    assert b_data["reservation"]["reservation_id"].startswith("BASKET-RES-")
    assert len(b_data["reservation"]["reserved_items"]) >= 1


def test_prescription_history_endpoints():
    """Verify saving, retrieving, and deleting patient prescriptions."""
    client = TestClient(app)

    # 1. Retrieve seeded history for default user
    res = client.get("/api/prescriptions/user/9876543210")
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) >= 1
    assert "Dolo 650" in str(history)

    # 2. Save a new prescription
    new_rx = {
        "user_mobile": "9876543210",
        "patient_name": "Rahul Verma",
        "doctor_name": "Dr. R. Mehta, DM",
        "title": "Chronic Cardiac & BP Rx",
        "raw_text": "Tab Telma 40mg 1-0-0",
        "total_branded_cost": 140.0,
        "total_generic_cost": 14.0,
        "net_savings": 126.0,
        "savings_percentage": 90.0,
        "items": [
            {
                "brand_name": "Telma 40",
                "active_ingredient": "Telmisartan",
                "strength": "40mg",
                "dosage_form": "Tablet",
                "frequency": "1-0-0",
                "timing": "Morning",
                "branded_unit_price": 9.33,
                "generic_unit_price": 1.40,
                "savings_percentage": 85.0,
                "generic_molecule_slug": "telmisartan-40mg",
                "pmbjp_code": "PMBJP0412",
                "generic_manufacturer": "Jan Aushadhi (BPPI)"
            }
        ]
    }
    save_res = client.post("/api/prescriptions/save", json=new_rx)
    assert save_res.status_code == 200
    save_data = save_res.json()
    assert save_data["success"] is True
    rx_id = save_data["prescription_id"]

    # 3. Retrieve by ID
    get_res = client.get(f"/api/prescriptions/{rx_id}")
    assert get_res.status_code == 200
    rx_details = get_res.json()
    assert rx_details["title"] == "Chronic Cardiac & BP Rx"
    assert len(rx_details["items"]) == 1

    # 4. Delete prescription
    del_res = client.delete(f"/api/prescriptions/{rx_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True


def test_kannada_multilingual_voice():
    """Verify Kannada clinical response generation."""
    from backend.multilingual_voice import get_multilingual_response
    resp_kn = get_multilingual_response("ಜನೌಷಧಿ ಸುರಕ್ಷಿತವೇ?", lang_code="kn")
    assert resp_kn["language"] == "kn"
    assert "ಜನೌಷಧಿ" in resp_kn["response"] or "ಸುರಕ್ಷಿತ" in resp_kn["response"] or "API" in resp_kn["response"]


if __name__ == "__main__":
    pytest.main(["-v", __file__])



