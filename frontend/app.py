"""
GenericSwap: Active Molecule & Low-Cost Generic Medicine Finder
Interactive Streamlit Application with Mobile Number & 6-Digit OTP Confirmation.
"""

import streamlit as st
import requests
import json
import time
from pathlib import Path
from PIL import Image
import pandas as pd
import streamlit.components.v1 as components

# Page configuration
st.set_page_config(
    page_title="GenericSwap - Active Molecule & Generic Finder",
    page_icon="💊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# API Configuration
API_BASE_URL = "http://127.0.0.1:8000"
SAMPLE_DIR = Path(__file__).resolve().parent / "sample_prescriptions"

# Custom Professional Healthcare Styling (Modern Medical Design System)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    /* CSS Custom Properties & Semantic Tokens */
    :root {
        --primary-teal: #0d9488;
        --dark-teal: #0f766e;
        --deep-teal: #042f2e;
        --light-teal: #f0fdfa;
        --accent-emerald: #10b981;
        --emerald-dark: #047857;
        --brand-blue: #2563eb;
        --brand-sky: #0284c7;
        --slate-900: #0f172a;
        --slate-800: #1e293b;
        --slate-700: #334155;
        --slate-600: #475569;
        --slate-500: #64748b;
        --slate-300: #cbd5e1;
        --slate-200: #e2e8f0;
        --slate-100: #f1f5f9;
        --slate-50: #f8fafc;
        --surface-white: #ffffff;
        --surface-glass: rgba(255, 255, 255, 0.96);
        --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        --font-mono: 'JetBrains Mono', Courier, monospace;
    }

    /* Universal Typography & Base Layout */
    html, body, [class*="css"], .stMarkdown, .stText, p, span, label, div {
        font-family: var(--font-sans) !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    /* Subtle Medical Mesh Background */
    .stApp {
        background-color: #f8fafc !important;
        background-image: 
            radial-gradient(at 10% 10%, rgba(13, 148, 136, 0.05) 0px, transparent 50%),
            radial-gradient(at 90% 90%, rgba(37, 99, 235, 0.04) 0px, transparent 50%) !important;
        background-attachment: fixed !important;
    }

    /* Top Brand Hero Banner */
    .main-header {
        background: linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #0369a1 100%);
        padding: 22px 28px;
        border-radius: 16px;
        color: #ffffff;
        margin-bottom: 20px;
        box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.25), 0 8px 10px -6px rgba(13, 148, 136, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(12px);
    }

    .main-header h1 {
        font-weight: 800 !important;
        letter-spacing: -0.03em !important;
        color: #ffffff !important;
        margin: 0 !important;
    }

    .main-header p {
        color: #e0f2fe !important;
        font-size: 0.95rem !important;
        margin: 4px 0 0 0 !important;
        opacity: 0.95;
    }

    /* Sleek Segmented Pill Tabs Navigation */
    .stTabs [data-baseweb="tab-list"] {
        gap: 6px !important;
        background-color: #f1f5f9 !important;
        padding: 6px 8px !important;
        border-radius: 14px !important;
        border: 1px solid #e2e8f0 !important;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03) !important;
        margin-bottom: 24px !important;
        overflow-x: auto !important;
        white-space: nowrap !important;
    }

    .stTabs [data-baseweb="tab"] {
        height: 44px !important;
        border-radius: 10px !important;
        font-weight: 600 !important;
        font-size: 0.88rem !important;
        color: #64748b !important;
        padding: 0 16px !important;
        border: none !important;
        background-color: transparent !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .stTabs [data-baseweb="tab"]:hover {
        color: #0d9488 !important;
        background-color: rgba(255, 255, 255, 0.8) !important;
    }

    .stTabs [aria-selected="true"] {
        background-color: #ffffff !important;
        color: #0f766e !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.12), 0 1px 3px rgba(0, 0, 0, 0.04) !important;
    }

    .stTabs [data-baseweb="tab-border"],
    .stTabs [data-baseweb="tab-highlight"] {
        display: none !important;
    }

    /* Modern Glassmorphic Card Containers */
    .card-glass {
        background: var(--surface-glass);
        border: 1px solid var(--slate-200);
        border-radius: 16px;
        padding: 22px 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
        margin-bottom: 18px;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(12px);
    }

    .card-glass:hover {
        border-color: #cbd5e1;
        box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.07), 0 4px 8px -2px rgba(15, 23, 42, 0.03);
    }

    /* Badges & Trust Seals */
    .badge-verified {
        background: #ecfdf5;
        color: #047857;
        padding: 4px 12px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.82rem;
        border: 1px solid #a7f3d0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 1px 2px rgba(16, 185, 129, 0.1);
    }

    .savings-pill {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #14532d;
        font-weight: 800;
        padding: 6px 14px;
        border-radius: 10px;
        font-size: 0.95rem;
        border: 1px solid #86efac;
        display: inline-block;
        letter-spacing: 0.01em;
        box-shadow: 0 2px 6px rgba(34, 197, 94, 0.15);
    }

    .bioequiv-badge {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        color: #1e40af;
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        padding: 14px 18px;
        font-size: 0.9rem;
        line-height: 1.5;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.08);
    }

    /* High-Contrast Price Displays */
    .price-branded {
        font-family: var(--font-mono) !important;
        font-size: 1.45rem;
        font-weight: 700;
        color: #dc2626;
        text-decoration: line-through;
        opacity: 0.85;
    }

    .price-generic {
        font-family: var(--font-mono) !important;
        font-size: 1.95rem;
        font-weight: 800;
        color: #059669;
        letter-spacing: -0.02em;
    }

    /* Buttons: Polished Pill Style */
    .stButton > button {
        border-radius: 10px !important;
        font-weight: 600 !important;
        font-size: 0.92rem !important;
        padding: 10px 20px !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        border: 1px solid #cbd5e1 !important;
        letter-spacing: 0.01em !important;
    }

    .stButton > button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
    }

    .stButton > button:active {
        transform: translateY(1px) !important;
    }

    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;
        color: white !important;
        border: none !important;
        box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35) !important;
    }

    .stButton > button[kind="primary"]:hover {
        box-shadow: 0 8px 22px rgba(13, 148, 136, 0.45) !important;
        background: linear-gradient(135deg, #0f766e 0%, #115e59 100%) !important;
    }

    /* KPI Stat Metric Cards */
    [data-testid="stMetric"] {
        background: #ffffff !important;
        padding: 16px 20px !important;
        border-radius: 14px !important;
        border: 1px solid #e2e8f0 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
        transition: all 0.2s ease !important;
    }

    [data-testid="stMetric"]:hover {
        border-color: #cbd5e1 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
    }

    [data-testid="stMetricLabel"] {
        color: #64748b !important;
        font-size: 0.82rem !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.04em !important;
    }

    [data-testid="stMetricValue"] {
        color: #0f172a !important;
        font-size: 1.65rem !important;
        font-weight: 800 !important;
        letter-spacing: -0.02em !important;
    }

    /* Form Controls & Inputs Focus Rings */
    .stTextInput > div > div > input,
    .stSelectbox > div > div,
    .stTextArea > div > div > textarea {
        border-radius: 10px !important;
        border-color: #cbd5e1 !important;
        font-size: 0.95rem !important;
        transition: all 0.2s ease !important;
    }

    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: #0d9488 !important;
        box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2) !important;
    }

    /* Rx Prescription Slip Box */
    .rx-box {
        font-family: var(--font-mono) !important;
        background: #fafaf9;
        border: 2px dashed #cbd5e1;
        padding: 22px;
        border-radius: 12px;
        white-space: pre-wrap;
        color: #1e293b;
        line-height: 1.6;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    /* Sleek Custom Scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #0d9488;
    }
</style>
""", unsafe_allow_html=True)



# -------------------------------------------------------------
# Session State Initialization
# -------------------------------------------------------------
if "auth_user" not in st.session_state:
    st.session_state.auth_user = None

if "otp_sent_to" not in st.session_state:
    st.session_state.otp_sent_to = None

if "otp_demo_code" not in st.session_state:
    st.session_state.otp_demo_code = None

if "current_analysis" not in st.session_state:
    st.session_state.current_analysis = None

if "rx_basket" not in st.session_state:
    st.session_state.rx_basket = [
        {"drug_id": "dolo-650", "daily_units": 2.0},
        {"drug_id": "pantocid-dsr", "daily_units": 1.0}
    ]

if "selected_language" not in st.session_state:
    st.session_state.selected_language = "en"

if "patient_history" not in st.session_state:
    st.session_state.patient_history = None

if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = [
        {
            "role": "assistant",
            "content": "👋 Hello! I am your **GenericSwap AI Pharmacist, Medicine History Guide & Multilingual Voice Assistant**.\n\nAsk me anything in English, हिंदी, தமிழ், తెలుగు, বাংলা, मराठी or use the microphone to speak your question!",
            "audio_base64": None
        }
    ]


# -------------------------------------------------------------
# Helper Functions to interact with FastAPI
# -------------------------------------------------------------
def check_api_health():
    try:
        r = requests.get(f"{API_BASE_URL}/api/health", timeout=3)
        return r.status_code == 200, r.json() if r.status_code == 200 else {}
    except Exception:
        return False, {}


def send_chat_api(message: str, history: list, prescription_context=None, patient_history=None, language="en"):
    try:
        clean_history = [
            {"role": m.get("role", "user"), "content": m.get("content", "")}
            for m in history if m.get("content")
        ]
        payload = {
            "message": message,
            "history": clean_history,
            "prescription_context": prescription_context,
            "patient_history": patient_history,
            "language": language,
            "enable_voice": True
        }
        r = requests.post(f"{API_BASE_URL}/api/chat", json=payload, timeout=12)
        if r.status_code == 200:
            return True, r.json()
        return False, {"response": "Sorry, I could not process your query at this moment.", "suggested_followups": [], "audio_base64": None}
    except Exception as e:
        return False, {"response": f"Chatbot connection error: {str(e)}", "suggested_followups": [], "audio_base64": None}


def get_patient_history_api(mobile_number: str):
    try:
        r = requests.get(f"{API_BASE_URL}/api/patient/history", params={"mobile": mobile_number}, timeout=5)
        if r.status_code == 200:
            return r.json()
        return {}
    except Exception:
        return {}


def save_patient_history_api(profile_data: dict):
    try:
        r = requests.post(f"{API_BASE_URL}/api/patient/history", json=profile_data, timeout=8)
        if r.status_code == 200:
            return True, r.json()
        return False, {"message": "Failed to save profile"}
    except Exception as e:
        return False, {"message": str(e)}


def check_prescription_safety_api(mobile_number: str, medicines: list):
    try:
        payload = {"mobile_number": mobile_number, "medicines": medicines}
        r = requests.post(f"{API_BASE_URL}/api/patient/check-safety", json=payload, timeout=5)
        if r.status_code == 200:
            return r.json()
        return {}
    except Exception:
        return {}


def find_nearby_pharmacies_api(lat=28.6139, lon=77.2090, drug_id=None, in_stock_only=False, max_radius_km=25.0):
    try:
        params = {
            "lat": lat,
            "lon": lon,
            "in_stock_only": in_stock_only,
            "max_radius_km": max_radius_km
        }
        if drug_id:
            params["drug_id"] = drug_id
        r = requests.get(f"{API_BASE_URL}/api/pharmacies/nearby", params=params, timeout=5)
        if r.status_code == 200:
            return r.json()
        return []
    except Exception:
        return []


def reserve_medicine_api(pharmacy_id, patient_mobile, patient_name, drug_id, drug_name, quantity=1):
    try:
        payload = {
            "pharmacy_id": pharmacy_id,
            "patient_mobile": patient_mobile,
            "patient_name": patient_name,
            "drug_id": drug_id,
            "drug_name": drug_name,
            "quantity_strips": quantity
        }
        r = requests.post(f"{API_BASE_URL}/api/pharmacies/reserve", json=payload, timeout=5)
        if r.status_code == 200:
            return True, r.json()
        return False, r.json() if r.status_code != 500 else {"message": "Reservation failed"}
    except Exception as e:
        return False, {"message": str(e)}


def check_basket_stock_api(lat=28.6139, lon=77.2090, drug_ids=None, in_stock_only=False, max_radius_km=35.0):
    try:
        payload = {
            "lat": lat,
            "lon": lon,
            "drug_ids": drug_ids or [],
            "in_stock_only": in_stock_only,
            "max_radius_km": max_radius_km
        }
        r = requests.post(f"{API_BASE_URL}/api/pharmacies/check-basket-stock", json=payload, timeout=8)
        if r.status_code == 200:
            return r.json()
        return {}
    except Exception:
        return {}


def reserve_basket_api(pharmacy_id, patient_mobile, patient_name, items):
    try:
        payload = {
            "pharmacy_id": pharmacy_id,
            "patient_mobile": patient_mobile,
            "patient_name": patient_name,
            "items": items
        }
        r = requests.post(f"{API_BASE_URL}/api/pharmacies/reserve-basket", json=payload, timeout=5)
        if r.status_code == 200:
            return True, r.json()
        return False, r.json() if r.status_code != 500 else {"message": "Basket reservation failed"}
    except Exception as e:
        return False, {"message": str(e)}


def request_otp(mobile_number: str, user_name: str = "User"):
    try:
        r = requests.post(f"{API_BASE_URL}/api/auth/send-otp", json={
            "mobile_number": mobile_number,
            "user_name": user_name
        }, timeout=5)
        return r.status_code == 200, r.json()
    except Exception as e:
        return False, {"detail": str(e)}


def verify_mobile_otp(mobile_number: str, code: str):
    try:
        r = requests.post(f"{API_BASE_URL}/api/auth/verify-otp", json={
            "mobile_number": mobile_number,
            "code": code
        }, timeout=5)
        return r.status_code == 200, r.json()
    except Exception as e:
        return False, {"detail": str(e)}


def analyze_prescription_api(image_bytes=None, text_content=None):
    try:
        if image_bytes:
            files = {"file": ("prescription.png", image_bytes, "image/png")}
            r = requests.post(f"{API_BASE_URL}/api/analyze-prescription", files=files, timeout=15)
        elif text_content:
            data = {"raw_text": text_content}
            r = requests.post(f"{API_BASE_URL}/api/analyze-prescription", data=data, timeout=10)
        else:
            return False, {"detail": "No input provided"}
        return r.status_code == 200, r.json()
    except Exception as e:
        return False, {"detail": str(e)}


def search_drug_api(query: str):
    try:
        r = requests.get(f"{API_BASE_URL}/api/search", params={"q": query}, timeout=5)
        return r.status_code == 200, r.json()
    except Exception as e:
        return False, {"detail": str(e)}


def calculate_basket_savings_api(basket_items, duration_months, family_count):
    try:
        payload = {
            "items": basket_items,
            "duration_months": duration_months,
            "family_members_count": family_count
        }
        r = requests.post(f"{API_BASE_URL}/api/savings-calculator", json=payload, timeout=8)
        return r.status_code == 200, r.json()
    except Exception as e:
        return False, {"detail": str(e)}


def fetch_live_nearby_pharmacies_api(lat=28.6139, lon=77.2090, radius=10.0, medicine_id=None, in_stock_only=False):
    try:
        params = {
            "lat": lat,
            "lng": lon,
            "radius": radius,
            "in_stock_only": in_stock_only
        }
        if medicine_id:
            params["medicine_id"] = medicine_id
        r = requests.get(f"{API_BASE_URL}/pharmacies/nearby", params=params, timeout=6)
        if r.status_code == 200:
            return r.json()
        return []
    except Exception:
        return []


def fetch_multi_availability_api(lat, lon, medicine_ids, radius=10.0, filter_status=None):
    try:
        payload = {
            "lat": lat,
            "lng": lon,
            "medicine_ids": medicine_ids,
            "radius": radius,
            "filter_status": filter_status if filter_status != "ALL" else None
        }
        r = requests.post(f"{API_BASE_URL}/pharmacy/check-multi-availability", json=payload, timeout=8)
        if r.status_code == 200:
            return r.json()
        return {}
    except Exception:
        return {}


def fetch_medicine_price_comp_api(medicine_id, lat=28.6139, lon=77.2090, radius=10.0):
    try:
        params = {"lat": lat, "lng": lon, "radius": radius}
        r = requests.get(f"{API_BASE_URL}/medicines/{medicine_id}/nearby-availability", params=params, timeout=6)
        if r.status_code == 200:
            return r.json()
        return {}
    except Exception:
        return {}


def fetch_admin_dashboard_api(pharmacy_id: str):
    try:
        r = requests.get(f"{API_BASE_URL}/pharmacy/admin/dashboard", params={"pharmacy_id": pharmacy_id}, timeout=6)
        if r.status_code == 200:
            return r.json()
        return {}
    except Exception:
        return {}


def fetch_all_pharmacies_api():
    try:
        r = requests.get(f"{API_BASE_URL}/pharmacy/admin/all-pharmacies", timeout=5)
        if r.status_code == 200:
            return r.json()
        return []
    except Exception:
        return []


def fetch_all_catalog_medicines_api():
    try:
        r = requests.get(f"{API_BASE_URL}/pharmacy/admin/medicines", timeout=5)
        if r.status_code == 200:
            return r.json()
        return []
    except Exception:
        return []


def update_inventory_api(pharmacy_id, medicine_id, stock_quantity, price=None, batch_number=None, expiry_date=None, changed_by=None, notes=None):
    try:
        payload = {
            "pharmacy_id": pharmacy_id,
            "medicine_id": medicine_id,
            "stock_quantity": int(stock_quantity),
            "price": float(price) if price is not None else None,
            "batch_number": batch_number,
            "expiry_date": expiry_date,
            "changed_by": changed_by or "Pharmacy Administrator",
            "notes": notes
        }
        r = requests.post(f"{API_BASE_URL}/pharmacy/inventory", json=payload, timeout=6)
        if r.status_code == 200:
            return True, r.json()
        return False, r.json() if r.status_code != 500 else {"detail": "Update failed"}
    except Exception as e:
        return False, {"detail": str(e)}


def fetch_inventory_history_api(pharmacy_id=None, limit=20):
    try:
        params = {"limit": limit}
        if pharmacy_id:
            params["pharmacy_id"] = pharmacy_id
        r = requests.get(f"{API_BASE_URL}/inventory/history", params=params, timeout=5)
        if r.status_code == 200:
            return r.json()
        return []
    except Exception:
        return []


def render_leaflet_map_html(center_lat, center_lon, pharmacies, zoom=12, height=420):
    """
    Generate interactive Leaflet + OpenStreetMap HTML widget with custom pins,
    stock status color-coding, and popups.
    """
    markers_js = []
    
    # User's GPS Pin
    markers_js.append(f"""
        var userIcon = L.divIcon({{
            className: 'user-pin',
            html: '<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(37,99,235,0.8);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        }});
        L.marker([{center_lat}, {center_lon}], {{icon: userIcon}}).addTo(map)
            .bindPopup("<div style='font-family: sans-serif; font-size: 12px; font-weight: 700; color: #1e3a8a;'>📍 Your Selected Location</div>").openPopup();
    """)
    
    for p in pharmacies:
        lat = p.get("latitude")
        lon = p.get("longitude")
        if not lat or not lon:
            continue
            
        p_name = p.get("name", "Pharmacy").replace("'", "\\'")
        dist = p.get("distance_km", 0.0)
        phone = p.get("phone", "")
        addr = p.get("address", "").replace("'", "\\'")
        hours = f"{p.get('opening_time', '')} - {p.get('closing_time', '')}"
        
        # Determine color & badge
        overall_code = p.get("overall_status_code")
        target_med = p.get("target_medicine_stock")
        
        if overall_code == "ALL_AVAILABLE":
            pin_bg = "#10b981"
            badge_html = "<span style='color: #047857; font-weight: 700;'>🟢 All Prescribed Medicines In Stock</span>"
        elif overall_code == "PARTIAL":
            pin_bg = "#f59e0b"
            badge_html = f"<span style='color: #b45309; font-weight: 700;'>🟠 Partial Stock ({p.get('available_medicines_count')}/{p.get('total_medicines_requested')})</span>"
        elif overall_code == "OUT_OF_STOCK":
            pin_bg = "#ef4444"
            badge_html = "<span style='color: #b91c1c; font-weight: 700;'>❌ Out of Stock</span>"
        elif target_med:
            pin_bg = target_med.get("status_color", "#10b981")
            badge_html = f"<span style='color: {pin_bg}; font-weight: 700;'>{target_med.get('status_badge', '')} ({target_med.get('stock_quantity', 0)} {target_med.get('unit', 'units')})</span>"
        else:
            pin_bg = "#0d9488"
            badge_html = "<span style='color: #0d9488; font-weight: 700;'>Verified Pharmacy</span>"

        directions_url = p.get("directions_url", f"https://www.google.com/maps/dir/?api=1&destination={lat},{lon}")

        clean_p_id = p.get("id", "p").replace("-", "_")
        popup_content = (
            f"<div style='font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 220px;'>"
            f"<div style='font-weight: 800; color: #0f172a; font-size: 13px;'>{p_name}</div>"
            f"<div style='color: #0d9488; font-weight: 600; margin: 3px 0;'>📍 {dist} km away • 🕒 {hours}</div>"
            f"<div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px; margin: 6px 0; font-size: 11px;'>{badge_html}</div>"
            f"<div style='font-size: 11px; color: #64748b; margin-bottom: 8px;'>{addr}</div>"
            f"<div style='display: flex; gap: 8px;'>"
            f"<a href=\\\"{directions_url}\\\" target=\\\"_blank\\\" style='background: #0d9488; color: white; padding: 4px 10px; border-radius: 5px; text-decoration: none; font-size: 11px; font-weight: 600;'>🗺️ Directions</a>"
            f"<a href=\\\"tel:{phone.replace(' ', '')}\\\" style='background: #f1f5f9; color: #334155; padding: 4px 10px; border-radius: 5px; text-decoration: none; font-size: 11px; font-weight: 600;'>📞 Call</a>"
            f"</div>"
            f"</div>"
        )

        markers_js.append(f"""
            var icon_{clean_p_id} = L.divIcon({{
                className: 'pharm-pin',
                html: '<div style="background-color: {pin_bg}; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.35); color: white; font-size: 11px;">💊</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            }});
            L.marker([{lat}, {lon}], {{icon: icon_{clean_p_id}}}).addTo(map)
                .bindPopup("{popup_content}");
        """)

    all_markers = "\n".join(markers_js)

    html_str = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            html, body {{ height: 100%; margin: 0; padding: 0; background: #f8fafc; }}
            #map {{ width: 100%; height: {height}px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }}
            .leaflet-popup-content-wrapper {{ border-radius: 10px; box-shadow: 0 8px 24px rgba(15,23,42,0.15); }}
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([{center_lat}, {center_lon}], {zoom});
            L.tileLayer('https://tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }}).addTo(map);

            {all_markers}
        </script>
    </body>
    </html>
    """
    return html_str


# -------------------------------------------------------------
# LOGIN & MOBILE OTP VERIFICATION SCREEN
# -------------------------------------------------------------

def render_login_page():
    st.markdown("""
    <div style="text-align: center; max-width: 580px; margin: 30px auto 16px auto;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 20px; background: linear-gradient(135deg, #0d9488 0%, #0369a1 100%); box-shadow: 0 10px 25px rgba(13, 148, 136, 0.3); margin-bottom: 14px;">
            <span style="font-size: 2.2rem;">💊</span>
        </div>
        <h1 style="color: #0f172a; font-size: 2.3rem; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 6px 0;">GenericSwap</h1>
        <p style="color: #64748b; font-size: 1.05rem; margin: 0 0 16px 0;">
            Active Molecule & Low-Cost Generic Medicine Finder
        </p>
        <div style="display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; color: #047857;">
            <span>🛡️ CDSCO & PMBJP Jan Aushadhi Clinical Bioequivalence Verified</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1.8, 1])
    with col2:
        st.markdown("""
        <div class="card-glass" style="border-top: 5px solid #0d9488; padding: 26px 30px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 4px 0; color: #0f172a; font-weight: 700; font-size: 1.25rem;">🔐 Patient & Clinician Login</h3>
            <p style="color: #64748b; font-size: 0.92rem; margin: 0 0 20px 0;">
                Sign in with your 10-digit mobile number to access prescription scans, bioequivalent savings, and live pharmacy stock.
            </p>
        </div>
        """, unsafe_allow_html=True)

        if not st.session_state.otp_sent_to:
            # Step 1: Mobile Number Input
            with st.form("mobile_login_form"):
                user_name = st.text_input("Full Name (Optional)", value="Rahul Verma", placeholder="Enter your name")
                mobile_col1, mobile_col2 = st.columns([1, 3])
                with mobile_col1:
                    st.text_input("Country", value="+91 (India)", disabled=True)
                with mobile_col2:
                    mobile_input = st.text_input("Mobile Number", value="9876543210", placeholder="10-digit number")

                submit_otp = st.form_submit_button("📲 Get 6-Digit Verification Code", use_container_width=True, type="primary")

                if submit_otp:
                    if len(mobile_input.strip()) < 10:
                        st.error("Please enter a valid 10-digit mobile number.")
                    else:
                        with st.spinner("Dispatching 6-digit verification code..."):
                            success, resp = request_otp(mobile_input, user_name)
                            if success:
                                st.session_state.otp_sent_to = resp.get("mobile_number")
                                st.session_state.otp_demo_code = resp.get("demo_code")
                                st.session_state.user_name_input = user_name
                                st.rerun()
                            else:
                                st.error(resp.get("detail", "Failed to send code. Please ensure backend is running."))

            # Quick Demo Login Button
            st.markdown("<div style='text-align: center; margin: 15px 0; color: #94a3b8; font-size: 0.85rem; font-weight: 600;'>— OR QUICK TEST —</div>", unsafe_allow_html=True)
            if st.button("⚡ 1-Click Instant Demo Login (+91 9876543210)", use_container_width=True):
                st.session_state.auth_user = {
                    "mobile_number": "9876543210",
                    "user_name": "Dr. Rahul Verma (Demo User)",
                    "verified": True
                }
                st.toast("✅ Logged in successfully!", icon="🎉")
                st.rerun()

        else:
            # Step 2: 6-Digit Confirmation Code Entry
            masked = f"+91 {st.session_state.otp_sent_to[:2]}******{st.session_state.otp_sent_to[-2:]}"
            
            st.info(f"📩 6-digit confirmation code sent to **{masked}**")

            # Visual demonstration badge of the SMS code
            if st.session_state.otp_demo_code:
                st.markdown(f"""
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px dashed #d97706; padding: 14px; border-radius: 12px; margin-bottom: 16px; text-align: center; box-shadow: 0 2px 6px rgba(217, 119, 6, 0.1);">
                    <span style="font-size: 0.8rem; color: #92400e; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">📲 Demo SMS Code Received:</span><br/>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; letter-spacing: 6px; font-weight: 800; color: #9a3412;">{st.session_state.otp_demo_code}</span>
                </div>
                """, unsafe_allow_html=True)

            with st.form("verify_code_form"):
                code_input = st.text_input(
                    "Enter 6-Digit Confirmation Code",
                    value=st.session_state.otp_demo_code or "",
                    max_chars=6,
                    placeholder="e.g. 583921"
                )

                col_v1, col_v2 = st.columns(2)
                with col_v1:
                    confirm_btn = st.form_submit_button("✅ Verify & Continue", use_container_width=True, type="primary")
                with col_v2:
                    resend_btn = st.form_submit_button("🔄 Resend Code", use_container_width=True)

                if confirm_btn:
                    if len(code_input.strip()) != 6:
                        st.error("Please enter all 6 digits of your confirmation code.")
                    else:
                        with st.spinner("Confirming your mobile number..."):
                            success, resp = verify_mobile_otp(st.session_state.otp_sent_to, code_input)
                            if success:
                                st.session_state.auth_user = {
                                    "mobile_number": resp.get("mobile_number"),
                                    "user_name": resp.get("user_name", "Patient"),
                                    "session_token": resp.get("session_token"),
                                    "verified": True
                                }
                                st.session_state.otp_sent_to = None
                                st.session_state.otp_demo_code = None
                                st.success("Mobile confirmed! Redirecting...")
                                time.sleep(0.5)
                                st.rerun()
                            else:
                                st.error(resp.get("detail", "Invalid 6-digit code. Please try again."))

                if resend_btn:
                    success, resp = request_otp(st.session_state.otp_sent_to, getattr(st.session_state, "user_name_input", "User"))
                    if success:
                        st.session_state.otp_demo_code = resp.get("demo_code")
                        st.toast("New 6-digit code sent!", icon="📩")
                        st.rerun()

            if st.button("← Change Mobile Number"):
                st.session_state.otp_sent_to = None
                st.session_state.otp_demo_code = None
                st.rerun()



# -------------------------------------------------------------
# PHARMACY ADMIN & INVENTORY MANAGEMENT PORTAL
# -------------------------------------------------------------
def render_pharmacy_admin_portal(user):
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #0f172a 100%); padding: 22px 28px; border-radius: 16px; color: white; margin-bottom: 22px; box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 2.2rem;">🏬</span>
                    <div>
                        <h2 style="margin: 0; color: white; font-weight: 800; font-size: 1.85rem; letter-spacing: -0.02em;">Pharmacy Admin Portal</h2>
                        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.22); padding: 2px 10px; border-radius: 9999px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: #ccfbf1;">Live Inventory & Stock Synchronizer</span>
                    </div>
                </div>
                <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 0.92rem; max-width: 720px;">
                    Manage real-time medicine availability, update unit stock quantities, edit batch and expiry details, and track immutable audit logs.
                </p>
            </div>
            <div style="margin-top: 10px;">
                <div style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 12px; padding: 8px 16px; text-align: right; color: white;">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #a7f3d0; font-weight: 700;">Verified Pharmacist</div>
                    <div style="font-weight: 800; font-size: 0.95rem;">{user.get('user_name', 'Pharmacy Admin')}</div>
                    <div style="font-size: 0.75rem; color: #cbd5e1;">+91 {user.get('mobile_number')}</div>
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # 1. Pharmacy Selection
    all_pharmacies = fetch_all_pharmacies_api()
    if not all_pharmacies:
        all_pharmacies = [
            {"id": "apollo-cp-01", "name": "Apollo Pharmacy - Connaught Place Hub", "address": "Block B, Connaught Place, New Delhi"},
            {"id": "pmbjp-delhi-02", "name": "PMBJP Jan Aushadhi Kendra #1409 - AIIMS Gate", "address": "Gate 2, AIIMS, New Delhi"},
            {"id": "medplus-greenpark-01", "name": "MedPlus Pharmacy - Green Park Market", "address": "Green Park Market, New Delhi"},
            {"id": "wellness-lajpat-01", "name": "Wellness Forever 24/7 - Lajpat Nagar", "address": "Central Market, Lajpat Nagar II, New Delhi"},
            {"id": "sanjeevani-southdelhi-01", "name": "Sanjeevani Certified Generic Pharmacy", "address": "Hauz Khas Enclave, New Delhi"}
        ]

    pharm_dict = {p["id"]: f"{p['name']} ({p.get('address', '').split(',')[0]})" for p in all_pharmacies}

    col_p1, col_p2 = st.columns([2.8, 1.2])
    with col_p1:
        selected_pharm_id = st.selectbox(
            "Select Pharmacy Branch to Manage:",
            options=list(pharm_dict.keys()),
            format_func=lambda k: pharm_dict[k],
            key="portal_active_pharmacy_select"
        )
    with col_p2:
        st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
        if st.button("🔄 Sync & Refresh Dashboard", use_container_width=True):
            st.rerun()

    # 2. Fetch Dashboard KPIs & Inventory
    dash_data = fetch_admin_dashboard_api(selected_pharm_id)
    if not dash_data or not dash_data.get("success"):
        st.error("Failed to load dashboard data. Ensure FastAPI backend is active.")
        return

    kpis = dash_data.get("kpis", {})
    inventory_items = dash_data.get("inventory", [])
    recent_history = dash_data.get("recent_history", [])

    # 3. KPI Stat Cards Row
    k1, k2, k3, k4, k5, k6 = st.columns(6)
    with k1:
        st.metric("Total Medicines", kpis.get("total_medicines", 0))
    with k2:
        st.metric("Total Units", kpis.get("total_stock_units", 0))
    with k3:
        st.metric("🟢 In Stock (>10)", kpis.get("in_stock_count", 0))
    with k4:
        st.metric("🟠 Low Stock (4-10)", kpis.get("low_stock_count", 0))
    with k5:
        st.metric("❌ Out of Stock (0)", kpis.get("out_of_stock_count", 0))
    with k6:
        st.metric("🕒 Last Inventory Sync", kpis.get("last_updated_human", "Recently"))

    st.markdown("---")

    # 4. Tab Navigation for Admin
    tab_inv, tab_update, tab_audit = st.tabs([
        "📦 Live Pharmacy Inventory",
        "✏️ Add / Update Stock & Price",
        "📜 Live Audit History Log"
    ])

    with tab_inv:
        st.subheader("📦 Live Stock Inventory")
        st.markdown(
            "Current active stock quantities for this pharmacy. Stock status automatically determines patient search visibility. "
            "**Stock Status Thresholds:** `>10` 🟢 **IN STOCK** | `4-10` 🟠 **LOW STOCK** | `1-3` 🔴 **VERY LOW STOCK** | `0` ❌ **OUT OF STOCK**."
        )

        if inventory_items:
            table_rows = []
            for item in inventory_items:
                table_rows.append({
                    "Medicine Brand": item["brand_name"],
                    "Generic / Molecule": item["generic_name"],
                    "Strength": item["strength"],
                    "Stock Qty": item["stock_quantity"],
                    "Status": item["status_badge"],
                    "Price (₹)": f"₹{item['price']:.2f}",
                    "Batch No": item.get("batch_number") or "-",
                    "Expiry Date": item.get("expiry_date") or "-",
                    "Last Inventory Update": item["last_updated_human"]
                })
            st.dataframe(pd.DataFrame(table_rows), use_container_width=True, hide_index=True)

            # Quick Actions Section
            with st.expander("⚡ Quick Adjuster: Mark Medicine Out of Stock"):
                col_qa1, col_qa2 = st.columns([3, 1])
                with col_qa1:
                    med_options = [i["medicine_id"] for i in inventory_items]
                    med_to_zero = st.selectbox(
                        "Choose medicine to immediately set to 0 stock:",
                        options=med_options,
                        format_func=lambda mid: next((f"{i['brand_name']} (Current Stock: {i['stock_quantity']})" for i in inventory_items if i["medicine_id"] == mid), mid),
                        key="admin_zero_stock_select"
                    )
                with col_qa2:
                    st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
                    if st.button("❌ Mark Out of Stock (0)", use_container_width=True):
                        ok, res = update_inventory_api(
                            pharmacy_id=selected_pharm_id,
                            medicine_id=med_to_zero,
                            stock_quantity=0,
                            changed_by=user.get("user_name", "Pharmacy Admin"),
                            notes="Marked Out of Stock by Administrator"
                        )
                        if ok:
                            st.toast("Stock set to 0! Patient locator updated.", icon="❌")
                            time.sleep(0.4)
                            st.rerun()
                        else:
                            st.error(res.get("detail", "Update failed."))
        else:
            st.info("No medicines currently found in this pharmacy inventory.")

    with tab_update:
        st.subheader("✏️ Add or Update Medicine Stock")
        st.markdown(
            "Record new shipments, batch deliveries, price changes, or manual adjustments. "
            "All changes are timestamped and committed to the audit history."
        )

        catalog_medicines = fetch_all_catalog_medicines_api()
        if not catalog_medicines:
            catalog_medicines = [
                {"id": "dolo-650", "brand_name": "Dolo 650", "generic_name": "Paracetamol Tablets IP", "strength": "650mg"},
                {"id": "pantocid-dsr", "brand_name": "Pantocid DSR", "generic_name": "Pantoprazole & Domperidone SR", "strength": "40mg + 30mg"},
                {"id": "augmentin-625-duo", "brand_name": "Augmentin 625 Duo", "generic_name": "Amoxicillin & Clavulanate", "strength": "500mg + 125mg"},
                {"id": "telma-40", "brand_name": "Telma 40", "generic_name": "Telmisartan Tablets IP", "strength": "40mg"},
                {"id": "glycomet-gp2", "brand_name": "Glycomet GP2", "generic_name": "Metformin & Glimepiride PR", "strength": "500mg + 2mg"},
                {"id": "montair-lc", "brand_name": "Montair-LC", "generic_name": "Montelukast & Levocetirizine", "strength": "10mg + 5mg"},
                {"id": "azithral-500", "brand_name": "Azithral 500", "generic_name": "Azithromycin Tablets IP", "strength": "500mg"},
                {"id": "combiflam", "brand_name": "Combiflam", "generic_name": "Ibuprofen & Paracetamol", "strength": "400mg + 325mg"}
            ]

        with st.form("admin_inventory_update_form"):
            col_f1, col_f2 = st.columns(2)
            with col_f1:
                target_med_id = st.selectbox(
                    "Select Medicine Formulation:",
                    options=[m["id"] for m in catalog_medicines],
                    format_func=lambda mid: next((f"{m['brand_name']} - {m['generic_name']} ({m.get('strength', '')})" for m in catalog_medicines if m["id"] == mid), mid)
                )

                curr_inv = next((i for i in inventory_items if i["medicine_id"] == target_med_id), None)
                cur_qty = curr_inv["stock_quantity"] if curr_inv else 0
                cur_price = curr_inv["price"] if curr_inv else 35.0
                cur_batch = curr_inv.get("batch_number") or f"BATCH-{selected_pharm_id[:4].upper()}-01"
                cur_exp = curr_inv.get("expiry_date") or "2027-12-31"

                st.info(f"Current Stock: **{cur_qty} units** • Current Price: **₹{cur_price:.2f}**")
                form_qty = st.number_input("New Stock Quantity (units/strips):", min_value=0, max_value=5000, value=cur_qty, step=5)
                form_price = st.number_input("Retail Price per Strip (₹):", min_value=1.0, max_value=5000.0, value=float(cur_price), step=1.0)

            with col_f2:
                form_batch = st.text_input("Batch Number:", value=cur_batch)
                form_exp = st.text_input("Expiry Date (YYYY-MM-DD):", value=cur_exp)
                form_staff = st.text_input("Pharmacist Name:", value=user.get("user_name", "Pharmacy Admin"))
                form_notes = st.text_area("Audit Reason / Change Note:", value="Consignment stock arrival & physical verification")

            submit_inv_btn = st.form_submit_button("💾 Save & Sync Live Inventory", type="primary", use_container_width=True)

            if submit_inv_btn:
                with st.spinner("Writing to database and generating audit record..."):
                    ok, res = update_inventory_api(
                        pharmacy_id=selected_pharm_id,
                        medicine_id=target_med_id,
                        stock_quantity=form_qty,
                        price=form_price,
                        batch_number=form_batch,
                        expiry_date=form_exp,
                        changed_by=form_staff,
                        notes=form_notes
                    )
                    if ok:
                        st.balloons()
                        st.success(f"✅ {res.get('message', 'Inventory updated successfully!')}")
                        time.sleep(0.5)
                        st.rerun()
                    else:
                        st.error(res.get("detail", "Failed to update inventory."))

    with tab_audit:
        st.subheader("📜 Live Audit History Log")
        st.markdown(
            "Every modification creates an immutable audit log entry. "
            "Patients can always see the exact time elapsed since the last verified stock count."
        )

        history_list = fetch_inventory_history_api(pharmacy_id=selected_pharm_id, limit=30)
        if history_list:
            for h in history_list:
                d = h.get("delta", 0)
                d_str = f"+{d}" if d > 0 else f"{d}"
                d_color = "#10b981" if d > 0 else ("#ef4444" if d < 0 else "#64748b")

                st.markdown(f"""
                <div class="card-glass" style="padding: 14px 18px; margin-bottom: 10px; border-left: 5px solid {d_color};">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                        <div>
                            <span style="font-weight: 800; color: #0f172a; font-size: 1rem;">{h.get('medicine_name', 'Medicine')}</span>
                            <span style="background: #f1f5f9; color: #334155; padding: 2px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; margin-left: 8px;">
                                Stock: {h.get('old_quantity')} → {h.get('new_quantity')} ({d_str} units)
                            </span>
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b;">
                            <span>🕒 {h.get('time_ago', 'Recently')}</span> • <span>👤 <strong>{h.get('changed_by', 'Admin')}</strong></span>
                        </div>
                    </div>
                    <div style="margin-top: 6px; font-size: 0.85rem; color: #64748b;">
                        <em>Note:</em> {h.get('notes') or 'Inventory updated'}
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("No audit logs recorded for this pharmacy yet.")


# -------------------------------------------------------------
# MAIN APPLICATION VIEW (AFTER LOGIN)
# -------------------------------------------------------------
def render_main_app():
    user = st.session_state.auth_user

    
    # Ensure patient history is loaded and valid dictionary
    if not isinstance(st.session_state.patient_history, dict) or not st.session_state.patient_history:
        st.session_state.patient_history = get_patient_history_api(user.get("mobile_number", "9876543210"))

    # Top Control Bar (Language Selector & User Profile)
    col_h1, col_h2, col_h3 = st.columns([2.6, 1.2, 1.2])
    with col_h1:
        st.markdown(f"""
        <div class="main-header" style="padding: 16px 22px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.9rem;">💊</span>
                <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.7rem; font-weight: 800; letter-spacing: -0.02em; color: white;">GenericSwap</span>
                        <span style="background: rgba(255,255,255,0.22); font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #f0fdfa;">Active Molecule Engine</span>
                    </div>
                    <p style="margin: 2px 0 0 0; color: #e0f2fe; font-size: 0.88rem; opacity: 0.95;">
                        Jan Aushadhi Pricing • 8-Language Voice Assistant • Live Pharmacy Stock
                    </p>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col_h2:
        # Multilingual Language Selector
        lang_options = {
            "en": "🇮🇳 English",
            "hi": "🇮🇳 हिंदी (Hindi)",
            "ta": "🇮🇳 தமிழ் (Tamil)",
            "te": "🇮🇳 తెలుగు (Telugu)",
            "bn": "🇮🇳 বাংলা (Bengali)",
            "mr": "🇮🇳 मराठी (Marathi)",
            "gu": "🇮🇳 ગુજરાતી (Gujarati)",
            "kn": "🇮🇳 ಕನ್ನಡ (Kannada)"
        }
        selected_lang_key = st.selectbox(
            "🗣️ Voice & App Language",
            options=list(lang_options.keys()),
            format_func=lambda k: lang_options[k],
            index=list(lang_options.keys()).index(st.session_state.selected_language)
        )
        if selected_lang_key != st.session_state.selected_language:
            st.session_state.selected_language = selected_lang_key
            st.rerun()

    with col_h3:
        st.markdown(f"""
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #0d9488 0%, #0369a1 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">
                    {user.get('user_name', 'P')[:1].upper()}
                </div>
                <div>
                    <div style="font-weight: 700; color: #0f172a; font-size: 0.85rem; line-height: 1.2;">{user.get('user_name', 'Patient')}</div>
                    <div class="badge-verified" style="font-size: 0.72rem; padding: 1px 6px; margin-top: 2px;">
                        <span>✓ +91 {user.get('mobile_number')}</span>
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("🚪 Sign Out", use_container_width=True):
            st.session_state.auth_user = None
            st.session_state.current_analysis = None
            st.session_state.patient_history = None
            st.rerun()

    # Top Navigation Mode Switcher Bar
    portal_choice = st.radio(
        "Navigation Role & Portal Mode:",
        ["👤 Patient Mode (Find Low-Cost Medicines & Live Pharmacy Stock)", "🏬 Pharmacy Admin Portal (Manage Inventory & Stock Counts)"],
        horizontal=True,
        index=0 if st.session_state.get("active_portal_role") != "admin" else 1,
        key="app_active_portal_mode"
    )
    if "Pharmacy Admin" in portal_choice:
        st.session_state.active_portal_role = "admin"
        render_pharmacy_admin_portal(user)
        return
    else:
        st.session_state.active_portal_role = "patient"


    # Sidebar: Quick Facts & Jan Aushadhi Info
    # Sidebar: Professional Clinical Profile & System Health
    with st.sidebar:
        st.markdown("""
        <div style="background: linear-gradient(135deg, #042f2e 0%, #0d9488 100%); padding: 18px; border-radius: 14px; color: white; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.6rem;">🏛️</span>
                <div>
                    <h4 style="margin: 0; color: white; font-size: 1.05rem; font-weight: 700;">PMBJP Jan Aushadhi</h4>
                    <span style="font-size: 0.72rem; color: #ccfbf1; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Govt of India Certified</span>
                </div>
            </div>
            <p style="margin: 10px 0 0 0; font-size: 0.82rem; line-height: 1.4; color: #e0f2fe;">
                100% clinically identical active molecules tested under CDSCO bioequivalence protocols saving up to 90%.
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        # Patient Quick Profile Card
        if isinstance(st.session_state.patient_history, dict):
            ph = st.session_state.patient_history
            allgs = ph.get("drug_allergies", [])
            allergy_html = f"<div style='margin-top: 4px;'><span style='background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 700;'>🚨 Allergies: {', '.join(allgs)}</span></div>" if allgs else "<span style='color: #10b981; font-size: 0.8rem; font-weight: 600;'>✓ No drug allergies</span>"
            conds = ph.get("chronic_conditions", [])
            cond_str = ", ".join(conds) if conds else "None reported"

            st.markdown(f"""
            <div class="card-glass" style="padding: 16px; margin-bottom: 16px;">
                <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; font-weight: 700;">Patient Health Profile</div>
                <div style="font-weight: 800; color: #0f172a; font-size: 1rem; margin-top: 2px;">{ph.get('patient_name', 'Patient')}</div>
                <div style="color: #64748b; font-size: 0.82rem;">{ph.get('age', 38)} Yrs • {ph.get('gender', 'Male')}</div>
                {allergy_html}
                <div style="color: #475569; font-size: 0.8rem; margin-top: 6px;">
                    <strong>Chronic:</strong> {cond_str}
                </div>
            </div>
            """, unsafe_allow_html=True)

        # System Health Card
        api_ok, health_data = check_api_health()
        status_bg = "#ecfdf5" if api_ok else "#fef2f2"
        status_color = "#047857" if api_ok else "#b91c1c"
        status_dot = "🟢" if api_ok else "🔴"
        status_text = "FastAPI Backend Online" if api_ok else "FastAPI Backend Offline"

        st.markdown(f"""
        <div class="card-glass" style="padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; font-weight: 700; margin-bottom: 6px;">System Health</div>
            <div style="background: {status_bg}; color: {status_color}; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; display: inline-block;">
                {status_dot} {status_text}
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.82rem; color: #475569;">
                <span>Drug Registry:</span>
                <strong>{health_data.get('registered_drugs_count', 15)} formulations</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.82rem; color: #475569;">
                <span>Jan Aushadhi:</span>
                <strong>{health_data.get('jan_aushadhi_generics_count', 13)} items</strong>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # National Toll-Free Support Card
        st.markdown("""
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
            <span style="font-size: 0.78rem; text-transform: uppercase; color: #64748b; font-weight: 700;">PMBJP National Helpline</span>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.15rem; font-weight: 800; color: #0d9488; margin: 4px 0;">
                1800-180-8080
            </div>
            <span style="font-size: 0.75rem; color: #64748b;">Toll-Free • 24/7 Patient Assistance</span>
        </div>
        """, unsafe_allow_html=True)

    # System Architecture & Data-Flow Pipeline Banner
    with st.expander("📐 View GenericSwap System Architecture & End-to-End Pipeline", expanded=False):
        st.markdown("""
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="text-align: center; margin-bottom: 16px;">
                <span style="font-size: 1.4rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">GenericSwap System Pipeline</span>
                <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">Dual-branch intelligence engine converging active molecule pharmacology with live pharmacy geospatial inventory.</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
                <!-- Branch 1: Prescription Intelligence -->
                <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 16px;">
                    <div style="font-weight: 800; color: #0f766e; font-size: 0.95rem; margin-bottom: 10px;">📄 Prescription Image Pipeline</div>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #134e4a;">
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #ccfbf1;">
                            <strong>1. Prescription Image:</strong> Doctor handwritten/printed Rx pad upload or live camera capture
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: #0d9488;">↓</div>
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #ccfbf1;">
                            <strong>2. Vision OCR Engine:</strong> Deep text extraction, noise cleanup, and medical NER parsing
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: #0d9488;">↓</div>
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #ccfbf1;">
                            <strong>3. Medicine + Dosage:</strong> Normalization of brand names, strengths (e.g., 650mg), and forms
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: #0d9488;">↓</div>
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #ccfbf1;">
                            <strong>4. Active Molecule / Salt:</strong> CDSCO bioequivalence lookup & therapeutic action mapping
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: #0d9488;">↓</div>
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #ccfbf1;">
                            <strong>5. Generic Medicine DB:</strong> PMBJP Jan Aushadhi catalog matching (up to 90% savings)
                        </div>
                    </div>
                </div>

                <!-- Branch 2: Location & Inventory Intelligence -->
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px;">
                    <div style="font-weight: 800; color: #1e40af; font-size: 0.95rem; margin-bottom: 10px;">📍 Geospatial & Inventory Pipeline</div>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #1e3a8a;">
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #dbeafe;">
                            <strong>1. User Location:</strong> GPS coordinates / selected city medical cluster
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: #2563eb;">↓</div>
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #dbeafe;">
                            <strong>2. Location API:</strong> Haversine geodesic distance engine across search radii (1km - 25km)
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: #2563eb;">↓</div>
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #dbeafe;">
                            <strong>3. Nearby Pharmacies:</strong> Verified Jan Aushadhi & certified generic pharmacies
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: #2563eb;">↓</div>
                        <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #dbeafe;">
                            <strong>4. Pharmacy Database:</strong> SQLite relational inventory store synced via Pharmacy Admin Portal
                        </div>
                    </div>
                </div>
            </div>

            <!-- Convergence Flow -->
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 16px; text-align: center;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.95rem; margin-bottom: 8px;">
                    🎯 Convergence & Decision Layer
                </div>
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    <span style="background: #ecfdf5; color: #047857; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; border: 1px solid #a7f3d0;">
                        🟢 Availability: Multi-item stock thresholds
                    </span>
                    <span style="background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; border: 1px solid #fde68a;">
                        🏷️ Price Comparison: Branded vs Jan Aushadhi vs Retail
                    </span>
                    <span style="background: #eff6ff; color: #1e40af; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; border: 1px solid #bfdbfe;">
                        🗺️ Map + Directions: Leaflet OSM & Google Maps
                    </span>
                    <span style="background: #fdf2f8; color: #9d174d; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; border: 1px solid #fbcfe8;">
                        🎙️ Multilingual Chatbot: 8 Languages + Voice
                    </span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    # Main Tabs (Now 9 comprehensive tabs)
    tab_scan, tab_explain, tab_compare, tab_basket, tab_search, tab_slip, tab_bot, tab_hist, tab_loc = st.tabs([

        "📸 1. Prescription Vision OCR",
        "🔬 2. Molecule Explainer",
        "🏷️ 3. Generic Price Comparator",
        "💰 4. Chronic Savings Calculator",
        "🔍 5. Search Drug / Salt",
        "📄 6. Generic Rx Slip",
        "🎙️ 7. Multilingual Voice Assistant",
        "📋 8. Patient Medicine History",
        "📍 9. Nearby Pharmacy & Live Stock"
    ])

    # -------------------------------------------------------------
    # TAB 1: PRESCRIPTION SCANNER & VISION OCR
    # -------------------------------------------------------------
    with tab_scan:
        st.subheader("📸 Upload Doctor's Prescription")
        st.markdown(
            "Upload a photo of your doctor's handwritten or printed prescription pad, or capture it directly with your camera. "
            "Our Vision OCR will automatically extract active molecules, verify clinical safety, and find government Jan Aushadhi generic alternatives."
        )

        upload_mode = st.radio(
            "Select Prescription Input Method:",
            ["📁 Upload Image File (JPG, PNG, JPEG)", "📷 Live Camera Capture"],
            horizontal=True
        )

        input_image_bytes = None
        user_preview_img = None

        if upload_mode == "📁 Upload Image File (JPG, PNG, JPEG)":
            uploaded_file = st.file_uploader(
                "Choose prescription image file:",
                type=["jpg", "jpeg", "png"],
                help="Accepts clear photos of printed clinic prescriptions or handwritten doctor pads"
            )
            if uploaded_file is not None:
                input_image_bytes = uploaded_file.getvalue()
                user_preview_img = Image.open(uploaded_file)
        else:
            camera_file = st.camera_input("Take a photo of your doctor's prescription:")
            if camera_file is not None:
                input_image_bytes = camera_file.getvalue()
                user_preview_img = Image.open(camera_file)

        if user_preview_img is not None:
            col_pv1, col_pv2 = st.columns([1, 1])
            with col_pv1:
                st.image(user_preview_img, caption="Prescription Pad Preview", use_container_width=True)
            with col_pv2:
                st.markdown("""
                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 18px; margin-top: 10px;">
                    <h4 style="margin: 0 0 8px 0; color: #166534;">✅ Prescription Image Loaded</h4>
                    <p style="color: #15803d; font-size: 0.9rem; margin-bottom: 14px;">
                        The system will scan all handwritten and printed medication lines, match active salts, check your allergy history, and calculate 70%–90% generic savings.
                    </p>
                </div>
                """, unsafe_allow_html=True)
                if st.button("⚡ Analyze Prescription with Vision OCR", type="primary", use_container_width=True):
                    with st.spinner("Extracting prescription text and matching active molecules..."):
                        ok, result = analyze_prescription_api(image_bytes=input_image_bytes)
                        if ok:
                            st.session_state.current_analysis = result
                            st.toast("Prescription analyzed successfully!", icon="✅")
                            st.rerun()
                        else:
                            st.error(f"Analysis failed: {result.get('detail', 'Could not process prescription')}")

        # Display Analysis Results
        if st.session_state.current_analysis:
            res = st.session_state.current_analysis
            st.divider()
            st.markdown("### 📋 Prescription Vision OCR Analysis Report")
            
            summary = res.get("financial_summary", {})
            col_s1, col_s2, col_s3, col_s4 = st.columns(4)
            with col_s1:
                st.metric("Medicines Detected", res.get("total_medicines_found", 0))
            with col_s2:
                st.metric("Prescribed Branded Cost (10 tabs)", f"₹{summary.get('sample_pack_branded_total_inr', 0):.2f}")
            with col_s3:
                st.metric("Jan Aushadhi Generic Cost", f"₹{summary.get('sample_pack_generic_total_inr', 0):.2f}")
            with col_s4:
                st.metric("Immediate Savings", f"₹{summary.get('net_savings_inr', 0):.2f}", f"{summary.get('savings_percentage', 0)}% Saved")

            # Real-Time Clinical Safety Cross-Check against Patient Medicine History
            if st.session_state.patient_history and res.get("medicines"):
                safety_check = check_prescription_safety_api(user.get("mobile_number"), res.get("medicines", []))
                if safety_check.get("alerts"):
                    for alert in safety_check["alerts"]:
                        if alert.get("severity", "").startswith("CRITICAL"):
                            st.error(f"**{alert.get('title')}**: {alert.get('message')}")
                        elif alert.get("severity", "").startswith("CAUTION"):
                            st.warning(f"**{alert.get('title')}**: {alert.get('message')}")
                        else:
                            st.info(f"**{alert.get('title')}**: {alert.get('message')}")
                else:
                    st.success("✅ **Clinical Safety Guard:** No drug allergy or chronic condition conflicts detected with your medicine history.")

            st.markdown("#### Extracted Medicines & Active Molecule Composition:")
            for med in res.get("medicines", []):
                with st.container():
                    st.markdown(f"""
                    <div class="card-glass">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 1.25rem; font-weight: 700; color: #1e293b;">{med.get('brand_name')}</span>
                            <span class="savings-pill">Save {med.get('savings_percentage')}% on Generic</span>
                        </div>
                        <p style="color: #64748b; margin: 0 0 8px 0;">
                            <strong>Active Pharmaceutical Ingredient (API):</strong> <span style="color: #0f766e; font-weight: 600;">{med.get('strength')}</span>
                        </p>
                        <p style="color: #475569; margin: 0 0 8px 0; font-size: 0.95rem;">
                            <strong>Therapeutic Class:</strong> {med.get('therapeutic_class')}
                        </p>
                        <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 10px 14px; border-radius: 4px; margin-top: 10px;">
                            <strong>Prescribed Schedule:</strong> {med.get('prescribed_frequency')} | <em>{med.get('prescribed_timing')}</em>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

            # ---------------------------------------------------------
            # TAB 1: INSTANT NEARBY PHARMACY STOCK AVAILABILITY CHECK
            # ---------------------------------------------------------
            st.markdown("---")
            st.markdown("### 📍 Live Stock Availability at Nearby Jan Aushadhi Stores")
            st.markdown("Avoid empty-handed trips! Check if **all your prescribed medicines** are currently in stock at nearby government generic dispensaries:")

            rx_drug_ids = [m["drug_id"] for m in res.get("medicines", []) if m.get("drug_id")]
            if rx_drug_ids:
                with st.spinner("Checking real-time stock across nearby pharmacies..."):
                    rx_basket_stock = check_basket_stock_api(lat=28.6328, lon=77.2197, drug_ids=rx_drug_ids, max_radius_km=30.0)

                if rx_basket_stock and rx_basket_stock.get("pharmacies"):
                    full_stock_stores = [s for s in rx_basket_stock["pharmacies"] if s.get("all_available")]
                    if full_stock_stores:
                        best_store = full_stock_stores[0]
                        st.success(
                            f"🎉 **Great News! All {len(rx_drug_ids)} prescribed medicines are 100% IN STOCK** right now at:\n\n"
                            f"🏬 **{best_store['name']}** (📍 **{best_store['distance_km']} km away**)\n\n"
                            f"📌 **Address:** {best_store['address']} | 🕒 **Hours:** {best_store['operating_hours']} | 📞 **Phone:** {best_store['phone']}"
                        )
                    else:
                        st.warning(
                            f"⚠️ **Partial Stock Warning:** Some prescribed medicines are low/out of stock at the closest store.\n"
                            f"Switch to **Tab 9 (Nearby Pharmacy)** to see exact unit counts and reserve your medicines before heading out!"
                        )

                    # Quick Action Row
                    col_rx_btn1, col_rx_btn2 = st.columns([2, 1])
                    with col_rx_btn1:
                        st.caption(f"Checked across {len(rx_basket_stock['pharmacies'])} Jan Aushadhi Kendras & verified generic stores within 30 km.")
                    with col_rx_btn2:
                        st.info("👉 Switch to **Tab 9** to view interactive map, directions & 1-hour reservation hold.")

    # -------------------------------------------------------------
    # TAB 2: ACTIVE MOLECULE EXPLAINER (PATIENT-FRIENDLY GUIDE)
    # -------------------------------------------------------------
    with tab_explain:
        st.subheader("🔬 Patient-Friendly Active Molecule Breakdown")
        st.markdown("Doctors prescribe brand names, but the curative power lies in the **Active Pharmaceutical Ingredient (API)** or 'salt'. Here is what each molecule does in simple terms:")

        analysis = st.session_state.current_analysis
        if not analysis or not analysis.get("medicines"):
            st.info("💡 Run a prescription analysis in Tab 1 or search for a medicine in Tab 5 to view detailed molecule breakdowns.")
        else:
            for med in analysis.get("medicines", []):
                explanation = med.get("clinical_explanation", {})
                with st.expander(f"💊 {med.get('brand_name')} ({med.get('strength')}) - What it treats", expanded=True):
                    col_m1, col_m2 = st.columns([2, 1])
                    
                    with col_m1:
                        st.markdown(f"#### {explanation.get('title')}")
                        st.markdown(f"**Therapeutic Purpose:** {explanation.get('combination_overview')}")
                        
                        st.markdown("##### Active Salt Breakdown:")
                        for ing in explanation.get("ingredients", []):
                            st.markdown(f"""
                            - **{ing.get('molecule')} ({ing.get('dosage')}):**  
                              *Role:* **{ing.get('role')}**  
                              *How it works in your body:* {ing.get('how_it_acts')}
                            """)

                        st.markdown("##### Clinical Best Practices:")
                        st.markdown(f"**How to Take:** {med.get('how_to_take')}")
                        if med.get("precautions"):
                            st.markdown("**Important Precautions:**")
                            for p in med.get("precautions", []):
                                st.markdown(f"- ⚠️ {p}")

                    with col_m2:
                        st.markdown("""
                        <div class="bioequiv-badge">
                            <h4 style="margin: 0 0 8px 0; color: #1e3a8a;">🛡️ Bioequivalence Verification</h4>
                            <p style="margin: 0; font-size: 0.85rem; line-height: 1.4;">
                                Tested and certified according to <strong>Indian Pharmacopoeia (IP)</strong> &amp; <strong>WHO-GMP</strong> protocols.
                                Absorbs at the exact same rate and delivers identical clinical cure rates as branded drugs.
                            </p>
                        </div>
                        """, unsafe_allow_html=True)
                        st.markdown(f"**Indications:**")
                        for ind in med.get("typical_indications", []):
                            st.markdown(f"`{ind}`")

    # -------------------------------------------------------------
    # TAB 3: GOVERNMENT JAN AUSHADHI & GENERIC PRICE COMPARATOR
    # -------------------------------------------------------------
    with tab_compare:
        st.subheader("🏷️ Side-by-Side Branded vs. Generic Price Comparison")
        st.markdown("Compare the exact price difference between the doctor's prescribed branded medicine and the government-approved Jan Aushadhi generic alternative:")

        analysis = st.session_state.current_analysis
        if not analysis or not analysis.get("medicines"):
            st.info("💡 Scan a prescription in Tab 1 to see the complete price comparison.")
        else:
            for med in analysis.get("medicines", []):
                gen = med.get("generic_alternative")
                with st.container():
                    st.markdown(f"### {med.get('brand_name')} vs. Generic Alternative")
                    col_p1, col_p2, col_p3 = st.columns([1, 1, 1])

                    with col_p1:
                        st.markdown("""
                        <div class="card-glass" style="border-top: 5px solid #ef4444; height: 100%;">
                            <span style="background: #fef2f2; color: #dc2626; font-size: 0.76rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.04em;">Prescribed Branded</span>
                            <h4 style="margin: 10px 0 2px 0; color: #0f172a; font-size: 1.15rem;">{}</h4>
                            <p style="color: #64748b; font-size: 0.85rem; margin: 0 0 14px 0;">Mfr: <strong>{}</strong></p>
                            <div class="price-branded">₹{:.2f}</div>
                            <span style="font-size: 0.82rem; color: #64748b; font-weight: 500;">Per Tablet / Capsule</span>
                            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #e2e8f0; font-weight: 700; color: #334155; font-size: 0.92rem;">
                                ₹{:.2f} per strip ({})
                            </div>
                        </div>
                        """.format(
                            med.get("brand_name"),
                            med.get("manufacturer"),
                            med.get("branded_unit_price"),
                            med.get("branded_mrp_per_strip"),
                            med.get("pack_size")
                        ), unsafe_allow_html=True)

                    with col_p2:
                        if gen:
                            st.markdown("""
                            <div class="card-glass" style="border-top: 5px solid #10b981; background: #f0fdf4; height: 100%;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="background: #dcfce7; color: #166534; font-size: 0.76rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.04em;">Govt Jan Aushadhi</span>
                                    <span style="font-size: 0.78rem; font-weight: 700; color: #047857;">Code: {}</span>
                                </div>
                                <h4 style="margin: 10px 0 2px 0; color: #064e3b; font-size: 1.15rem;">{}</h4>
                                <p style="color: #047857; font-size: 0.85rem; margin: 0 0 14px 0;">Clinical Bioequivalent Rating: <strong>AB-Rated (IP)</strong></p>
                                <div class="price-generic">₹{:.2f}</div>
                                <span style="font-size: 0.82rem; color: #065f46; font-weight: 500;">Per Tablet / Capsule</span>
                                <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #bbf7d0; font-weight: 700; color: #065f46; font-size: 0.92rem;">
                                    ₹{:.2f} per strip ({})
                                </div>
                            </div>
                            """.format(
                                gen.get("pmbjp_drug_code", "PMBJP"),
                                gen.get("molecule_name", "Jan Aushadhi Generic"),
                                gen.get("jan_aushadhi_unit_price", 0.0),
                                gen.get("jan_aushadhi_mrp", 0.0),
                                gen.get("pack_size", 10)
                            ), unsafe_allow_html=True)
                        else:
                            st.warning("Jan Aushadhi generic mapping in progress.")

                    with col_p3:
                        st.markdown(f"""
                        <div class="card-glass" style="border-top: 5px solid #3b82f6; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <span style="background: #eff6ff; color: #1d4ed8; font-size: 0.76rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.04em;">Direct Patient Savings</span>
                                <div style="margin: 16px 0 12px 0;">
                                    <span class="savings-pill" style="font-size: 1.45rem; padding: 8px 18px;">
                                        {med.get('savings_percentage')}% SAVED
                                    </span>
                                </div>
                                <p style="color: #0f172a; font-weight: 800; font-size: 1.15rem; margin: 4px 0;">
                                    Save ₹{med.get('unit_savings_inr'):.2f} per dose
                                </p>
                            </div>
                            <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 8px; margin-top: 10px;">
                                <span style="color: #475569; font-size: 0.85rem; font-weight: 600;">
                                    ~₹{med.get('unit_savings_inr', 0) * 365:,.2f} pocket savings / year (1 tab/day)
                                </span>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    st.markdown("---")

    # -------------------------------------------------------------
    # TAB 4: CHRONIC PRESCRIPTION BASKET & ANNUAL SAVINGS
    # -------------------------------------------------------------
    with tab_basket:
        st.subheader("💰 Chronic Prescription Basket & Annual Savings Calculator")
        st.markdown("For patients managing chronic conditions (Hypertension, Diabetes, Cholesterol, Acidity), small daily differences compound into tens of thousands of rupees annually.")

        col_b1, col_b2 = st.columns([1, 1])
        with col_b1:
            duration = st.slider("Duration of Treatment (Months)", min_value=1, max_value=24, value=12, step=1)
        with col_b2:
            family_count = st.number_input("Family Members on this Treatment Plan", min_value=1, max_value=5, value=1)

        # Build basket from pre-configured or detected items
        items_to_calc = [
            {"drug_id": "telma-40", "daily_units": 1.0},
            {"drug_id": "glycomet-gp2", "daily_units": 1.0},
            {"drug_id": "atorva-10", "daily_units": 1.0},
            {"drug_id": "pantocid-dsr", "daily_units": 1.0}
        ]

        if st.session_state.current_analysis:
            # Dynamically use the detected medicines from user's scan
            detected_items = []
            for m in st.session_state.current_analysis.get("medicines", []):
                detected_items.append({"drug_id": m["drug_id"], "daily_units": 1.0})
            if detected_items:
                items_to_calc = detected_items

        calc_ok, calc_data = calculate_basket_savings_api(items_to_calc, duration, family_count)

        if calc_ok:
            st.markdown("### 📊 Financial Impact Projection")
            kpi_1, kpi_2, kpi_3 = st.columns(3)
            with kpi_1:
                st.metric("Total Branded Spend", f"₹{calc_data.get('total_branded_spend_inr', 0):,.2f}")
            with kpi_2:
                st.metric("Total Jan Aushadhi Spend", f"₹{calc_data.get('total_generic_spend_inr', 0):,.2f}")
            with kpi_3:
                st.metric(
                    f"Pocket Savings ({duration} Months)",
                    f"₹{calc_data.get('net_savings_inr', 0):,.2f}",
                    f"{calc_data.get('overall_savings_percentage', 0)}% Saved"
                )

            # Detailed table
            if calc_data.get("items"):
                df_data = []
                for itm in calc_data["items"]:
                    df_data.append({
                        "Prescribed Brand": itm["brand_name"],
                        "Active Strength": itm["molecule"],
                        "Jan Aushadhi Code": itm["generic_code"],
                        "Branded Spend (₹)": f"₹{itm['branded_total_cost_inr']:,.2f}",
                        "Generic Spend (₹)": f"₹{itm['generic_total_cost_inr']:,.2f}",
                        "Patient Savings (₹)": f"₹{itm['item_savings_inr']:,.2f}",
                        "Savings %": f"{itm['item_savings_percent']}%"
                    })
                st.dataframe(pd.DataFrame(df_data), use_container_width=True)

            st.success(f"🎉 By switching to bioequivalent Jan Aushadhi generics, your household saves **₹{calc_data.get('annualized_savings_inr', 0):,.2f}** every single year!")

    # -------------------------------------------------------------
    # TAB 5: DIRECT DRUG / SALT SEARCH
    # -------------------------------------------------------------
    with tab_search:
        st.subheader("🔍 Search by Brand Name, Active Salt, or Symptom")
        st.markdown("Look up any medicine to immediately identify its active salt and generic substitute:")

        search_query = st.text_input("Enter medicine name (e.g., Dolo, Pantocid, Augmentin, Telma, Metformin, Fever)", value="Augmentin")
        
        if search_query:
            s_ok, s_data = search_drug_api(search_query)
            if s_ok and s_data.get("results"):
                st.write(f"Found **{s_data.get('count')}** matching formulation(s):")
                for r in s_data["results"]:
                    with st.container():
                        st.markdown(f"""
                        <div class="card-glass">
                            <div style="display: flex; justify-content: space-between;">
                                <h4>💊 {r.get('brand_name')} ({r.get('strength')})</h4>
                                <span class="savings-pill">Save {r.get('savings_percentage')}%</span>
                            </div>
                            <p><strong>Salt / Molecule:</strong> {r.get('strength')} | <strong>Form:</strong> {r.get('dosage_form')}</p>
                            <p><strong>What it treats:</strong> {r.get('clinical_explanation', {}).get('combination_overview', '')}</p>
                            <div style="display: flex; gap: 20px; margin-top: 10px;">
                                <div>Branded MRP: <strike>₹{r.get('branded_unit_price'):.2f}/unit</strike></div>
                                <div>Generic Price: <strong style="color: #059669;">₹{r.get('generic_unit_price'):.2f}/unit</strong></div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        # Quick nearby stock indicator for this searched drug
                        drug_id = r.get("id")
                        stk_res = find_nearby_pharmacies_api(lat=28.6328, lon=77.2197, drug_id=drug_id, in_stock_only=True, max_radius_km=30.0)
                        if stk_res:
                            st.success(f"📍 **In Stock Nearby:** Available at **{len(stk_res)}** local Jan Aushadhi stores! Nearest: **{stk_res[0]['name']}** ({stk_res[0]['distance_km']} km away) • Go to **Tab 9** to reserve a 1-hour hold.")
                        else:
                            st.info("ℹ️ Check Tab 9 to view complete inventory and alternative stores within 35 km.")
            else:
                st.warning("No matching medications found. Try searching for 'Dolo', 'Pantocid', 'Telma', 'Glycomet', or 'Augmentin'.")

    # -------------------------------------------------------------
    # TAB 6: GENERIC PRESCRIPTION SLIP GENERATOR
    # -------------------------------------------------------------
    with tab_slip:
        st.subheader("📄 Generic Prescription Slip for Chemists & Jan Aushadhi Kendra")
        st.markdown("Take this clear, standardized slip to any pharmacy or Jan Aushadhi Kendra to request the exact active pharmaceutical ingredient:")

        analysis = st.session_state.current_analysis
        med_list = analysis.get("medicines", []) if analysis else []

        if not med_list:
            st.info("💡 Scan a prescription or select a sample in Tab 1 to generate your printable Generic Rx Slip.")
        else:
            slip_text = f"""
================================================================================
                    GENERIC MEDICINE REQUEST SLIP
               Bioequivalent Salt Formulation Reference
================================================================================
Patient Name : {user.get('user_name', 'Rahul Verma')}
Mobile No    : +91 {user.get('mobile_number')}
Date Generated: {time.strftime('%d-%b-%Y %H:%M')}
Verification : Clinically Bioequivalent under CDSCO / WHO-GMP Norms
--------------------------------------------------------------------------------
Prescribed Active Pharmaceutical Ingredients (APIs) & Government PMBJP Codes:
"""
            for idx, m in enumerate(med_list, 1):
                gen = m.get("generic_alternative", {})
                code = gen.get("pmbjp_drug_code", "GENERIC-IP")
                slip_text += f"\n{idx}. ACTIVE MOLECULE : {m.get('strength')}"
                slip_text += f"\n   Dosage Form     : {m.get('dosage_form')}"
                slip_text += f"\n   Jan Aushadhi Code: {code}"
                slip_text += f"\n   Reference Brand : {m.get('brand_name')} ({m.get('manufacturer')})"
                slip_text += f"\n   Dosage Advice   : {m.get('prescribed_frequency')} - {m.get('prescribed_timing')}"
                slip_text += f"\n   Unit Target MRP : ₹{m.get('generic_unit_price'):.2f} (Savings: {m.get('savings_percentage')}%)\n"

            slip_text += """
--------------------------------------------------------------------------------
Pharmacist Note:
Please dispense government-approved Jan Aushadhi / certified bioequivalent 
generic formulation matching the active pharmaceutical ingredients and 
strengths specified above as per NMC / PMBJP generic substitution guidelines.
================================================================================
"""
            st.markdown(f'<div class="rx-box">{slip_text}</div>', unsafe_allow_html=True)
            st.download_button(
                label="📥 Download Printable Generic Rx Slip (TXT)",
                data=slip_text,
                file_name="GenericSwap_Prescription_Slip.txt",
                mime="text/plain",
                use_container_width=True
            )

    # -------------------------------------------------------------
    # TAB 7: MULTILINGUAL AI PHARMACIST VOICE ASSISTANT
    # -------------------------------------------------------------
    with tab_bot:
        st.subheader("🎙️ Multilingual AI Pharmacist & Voice Assistant")
        
        curr_lang = st.session_state.selected_language
        lang_names = {
            "en": "English", "hi": "हिंदी (Hindi)", "ta": "தமிழ் (Tamil)",
            "te": "తెలుగు (Telugu)", "bn": "বাংলা (Bengali)", "mr": "मराठी (Marathi)",
            "gu": "ગુજરાતી (Gujarati)", "kn": "ಕನ್ನಡ (Kannada)"
        }
        st.markdown(f"Speaking in: **{lang_names.get(curr_lang, 'English')}** | Ask questions via text or microphone:")

        analysis = st.session_state.current_analysis
        active_meds = analysis.get("medicines", []) if analysis else []

        # Context Indicator & Allergy Warning
        if active_meds:
            med_names = ", ".join([f"{m.get('brand_name')} ({m.get('strength')})" for m in active_meds])
            st.markdown(f"""
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px 14px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">🔗</span>
                <div>
                    <strong style="color: #166534;">Connected to Scanned Prescription:</strong>
                    <span style="color: #15803d; font-size: 0.95rem;"> {med_names}</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

        # Web Speech Voice Recognition Bar
        st.markdown("""
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 18px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <span style="font-size: 1.1rem; font-weight: 700; color: #1e293b;">🎙️ Voice Speech Assistant</span><br/>
                <span style="color: #64748b; font-size: 0.85rem;">Click the microphone button below or type to ask in your language.</span>
            </div>
            <div style="background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">
                Live Audio Enabled 🔊
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Quick Suggested Question Chips (Language-Adaptive)
        st.markdown("##### 💡 Suggested Voice & Text Prompts:")
        chip_col1, chip_col2, chip_col3 = st.columns(3)
        chip_col4, chip_col5, chip_col6 = st.columns(3)

        quick_prompt = None
        if curr_lang == "hi":
            with chip_col1:
                if st.button("🛡️ क्या जेनेरिक दवाएं सुरक्षित हैं?", use_container_width=True):
                    quick_prompt = "क्या जन औषधि और जेनेरिक दवाएं ब्रांडेड जितनी सुरक्षित और असरदार हैं?"
            with chip_col2:
                if st.button("📋 मेरी मेडिकल हिस्ट्री चेक करें", use_container_width=True):
                    quick_prompt = "मेरी मेडिकल हिस्ट्री और एलर्जी का रिव्यू दें"
            with chip_col3:
                if st.button("💰 मुझे कितनी बचत होगी?", use_container_width=True):
                    quick_prompt = "जेनेरिक दवाओं से साल भर में कितने पैसे बचेंगे?"
            with chip_col4:
                if st.button("🏪 जन औषधि केंद्र कहाँ मिलेगा?", use_container_width=True):
                    quick_prompt = "जन औषधि केंद्र कहाँ मिलेगा और केमिस्ट से जेनेरिक कैसे मांगें?"
            with chip_col5:
                if st.button("💊 डोलो 650 का एक्टिव सॉल्ट क्या है?", use_container_width=True):
                    quick_prompt = "डोलो 650 में कौन सा एक्टिव सॉल्ट है और इसका जेनेरिक क्या है?"
            with chip_col6:
                if st.button("🗑️ चैट रीसेट करें", use_container_width=True):
                    st.session_state.chat_messages = [{"role": "assistant", "content": "चैट रीसेट हो गई है! आप अपनी दवाओं के बारे में पूछ सकते हैं。", "audio_base64": None}]
                    st.rerun()
        else:
            with chip_col1:
                if st.button("🛡️ Are generics really as effective?", use_container_width=True):
                    quick_prompt = "Are Jan Aushadhi generic medicines really as effective and safe as branded ones?"
            with chip_col2:
                if st.button("📋 Review my medicine history", use_container_width=True):
                    quick_prompt = "Please review my recorded medicine history and drug allergies"
            with chip_col3:
                if st.button("💰 How much can I save on generics?", use_container_width=True):
                    quick_prompt = "How much money can I save by switching to Jan Aushadhi generic medicines?"
            with chip_col4:
                if st.button("🏪 Where to find Jan Aushadhi store?", use_container_width=True):
                    quick_prompt = "Where can I find a Jan Aushadhi Kendra near me and how do I ask for generics?"
            with chip_col5:
                if st.button("💊 What is Dolo 650 salt?", use_container_width=True):
                    quick_prompt = "What is the active molecule in Dolo 650 and what is its generic equivalent?"
            with chip_col6:
                if st.button("🗑️ Clear Chat History", use_container_width=True):
                    st.session_state.chat_messages = [{"role": "assistant", "content": "👋 Chat reset! Ask me anything about medications, active salts, or generic savings.", "audio_base64": None}]
                    st.rerun()

        st.markdown("---")

        # Display Message History with Speech Synthesis Audio Player
        import base64
        for msg in st.session_state.chat_messages:
            with st.chat_message(msg["role"], avatar="💊" if msg["role"] == "assistant" else "👤"):
                st.markdown(msg["content"])
                # If assistant message has spoken audio, render audio player
                if msg["role"] == "assistant" and msg.get("audio_base64"):
                    try:
                        audio_raw = base64.b64decode(msg["audio_base64"].split(",")[1])
                        st.audio(audio_raw, format="audio/mp3")
                    except Exception:
                        pass

        # Input Box
        user_input = st.chat_input(f"Type or ask in {lang_names.get(curr_lang, 'English')} (e.g. active salts, allergies, savings)...")
        prompt_to_send = user_input or quick_prompt

        if prompt_to_send:
            st.session_state.chat_messages.append({"role": "user", "content": prompt_to_send})

            with st.spinner("AI Pharmacist is generating clinical response & voice audio..."):
                ok, chat_res = send_chat_api(
                    message=prompt_to_send,
                    history=st.session_state.chat_messages[:-1],
                    prescription_context=st.session_state.current_analysis,
                    patient_history=st.session_state.patient_history,
                    language=st.session_state.selected_language
                )
                bot_text = chat_res.get("response", "I could not retrieve an answer right now. Please try again.")
                audio_uri = chat_res.get("audio_base64")

                st.session_state.chat_messages.append({
                    "role": "assistant",
                    "content": bot_text,
                    "audio_base64": audio_uri
                })

            st.rerun()

    # -------------------------------------------------------------
    # TAB 8: PATIENT MEDICINE HISTORY & SAFETY PROFILE
    # -------------------------------------------------------------
    with tab_hist:
        st.subheader("📋 Patient Medicine History & Clinical Safety Profile")
        st.markdown("Maintaining an up-to-date medication history prevents life-threatening drug allergies, duplicate ingredients, and contraindications:")

        ph = st.session_state.patient_history if isinstance(st.session_state.patient_history, dict) else {}

        with st.form("patient_history_form"):
            col_p1, col_p2, col_p3 = st.columns(3)
            with col_p1:
                p_name = st.text_input("Patient Full Name", value=ph.get("patient_name", "Rahul Verma"))
            with col_p2:
                p_age = st.number_input("Age", min_value=1, max_value=120, value=ph.get("age", 38))
            with col_p3:
                p_gender = st.selectbox("Gender", options=["Male", "Female", "Other"], index=0 if ph.get("gender") == "Male" else 1)

            st.markdown("##### 🚨 Known Drug Allergies (High Priority Safety Flag):")
            allergy_options = [
                "Penicillin / Amoxicillin / Ampicillin",
                "Sulfa Drugs (Sulfonamides)",
                "NSAIDs (Aspirin, Ibuprofen, Diclofenac)",
                "Cephalosporin Antibiotics (Cefixime, Cephalexin)",
                "Paracetamol / Acetaminophen (Rare)",
                "Fluoroquinolones (Ciprofloxacin, Levofloxacin)"
            ]
            selected_allergies = st.multiselect(
                "Select all known drug allergies:",
                options=allergy_options,
                default=[a for a in ph.get("drug_allergies", []) if a in allergy_options]
            )

            st.markdown("##### 🩺 Chronic Health Conditions:")
            condition_options = [
                "Hypertension (High Blood Pressure)",
                "Type 2 Diabetes Mellitus",
                "Peptic Ulcer / Acid Reflux (GERD)",
                "Asthma / Chronic Bronchitis",
                "Chronic Kidney Disease (CKD)",
                "Heart Disease (CAD / Angina)",
                "High Cholesterol (Dyslipidemia)",
                "Hypothyroidism"
            ]
            selected_conditions = st.multiselect(
                "Select diagnosed chronic conditions:",
                options=condition_options,
                default=[c for c in ph.get("chronic_conditions", []) if c in condition_options]
            )

            st.markdown("##### 💊 Past Adverse Drug Reactions or Side Effects:")
            p_adverse = st.text_area(
                "Describe any past adverse reactions, stomach upset, or rashes from medications:",
                value=ph.get("past_adverse_reactions", "Mild skin hives noticed with Amoxicillin in 2023. Severe acidity flare-up with pain killers.")
            )

            col_sub1, col_sub2 = st.columns(2)
            with col_sub1:
                save_btn = st.form_submit_button("💾 Save & Update Medicine History", use_container_width=True, type="primary")

            if save_btn:
                updated_profile = {
                    "mobile_number": user.get("mobile_number"),
                    "patient_name": p_name,
                    "age": int(p_age),
                    "gender": p_gender,
                    "chronic_conditions": selected_conditions,
                    "drug_allergies": selected_allergies,
                    "current_medications": ph.get("current_medications", []),
                    "past_adverse_reactions": p_adverse
                }
                ok, res_p = save_patient_history_api(updated_profile)
                if ok:
                    st.session_state.patient_history = res_p.get("profile")
                    st.toast("✅ Medicine History Profile Updated!", icon="📋")
                    st.rerun()

        # Action: Voice Review of Medicine History
        st.markdown("---")
        st.markdown("##### 🗣️ Voice Assistant Clinical History Summary:")
        col_vr1, col_vr2 = st.columns([2, 1])
        with col_vr1:
            st.markdown("Have the AI Pharmacist synthesize and read your complete medicine history aloud in your chosen language.")
        with col_vr2:
            if st.button("🔊 Voice Review in " + lang_names.get(curr_lang, "English"), use_container_width=True):
                with st.spinner("AI Pharmacist is generating spoken review..."):
                    ok, voice_res = send_chat_api(
                        message="Please review my complete recorded medicine history and drug allergies",
                        history=[],
                        patient_history=st.session_state.patient_history,
                        language=curr_lang
                    )
                    st.session_state.chat_messages.append({
                        "role": "user",
                        "content": "Please review my complete recorded medicine history and drug allergies"
                    })
                    st.session_state.chat_messages.append({
                        "role": "assistant",
                        "content": voice_res.get("response", ""),
                        "audio_base64": voice_res.get("audio_base64")
                    })
    # -------------------------------------------------------------
    # TAB 9: NEARBY PHARMACY LOCATION, STOCK & PRICE COMPARISON
    # -------------------------------------------------------------
    with tab_loc:
        st.subheader("📍 Nearby Jan Aushadhi & Generic Pharmacy Stock Locator")

        # Required Real-Time Stock Notice
        st.markdown("""
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%); border: 1px solid #99f6e4; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(13,148,136,0.06);">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2rem;">ℹ️</span>
                <div>
                    <span style="font-weight: 800; color: #0f766e; font-size: 0.92rem;">
                        Real-Time Pharmacy Inventory Notice
                    </span>
                    <p style="margin: 2px 0 0 0; color: #134e4a; font-size: 0.85rem; line-height: 1.4;">
                        Stock information is based on the pharmacy's latest inventory update. Separate location geospatial mapping is synchronized directly with live registered pharmacy database counts.
                    </p>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        analysis = st.session_state.current_analysis
        rx_meds = analysis.get("medicines", []) if analysis else []
        rx_med_names = [m.get("brand_name") or m.get("generic_name") or m.get("drug_id") for m in rx_meds]

        # Prescription Medicine Header Notice
        if rx_meds:
            st.markdown(f"""
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">📋</span>
                        <span style="font-weight: 800; color: #1e40af; font-size: 0.95rem;">
                            Prescription contains {len(rx_meds)} medicines: {', '.join(rx_med_names)}
                        </span>
                    </div>
                    <div style="font-size: 0.82rem; color: #3b82f6; margin-top: 3px;">
                        Instantly check availability of all prescribed items across nearby Jan Aushadhi and generic stores to prevent split trips.
                    </div>
                </div>
                <div style="background: #2563eb; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 0.78rem; font-weight: 700;">
                    ✓ Scanned Rx Active
                </div>
            </div>
            """, unsafe_allow_html=True)

        # Location Presets & Coordinates across Indian Medical Hubs
        location_presets = {
            "Central Delhi (Connaught Place / Rajiv Chowk)": {"lat": 28.6328, "lon": 77.2197},
            "South Delhi (AIIMS / Green Park Medical Hub)": {"lat": 28.5672, "lon": 77.2100},
            "South Delhi (Lajpat Nagar Central Market)": {"lat": 28.5695, "lon": 77.2415},
            "Mumbai (Bandra West Station Hub)": {"lat": 19.0544, "lon": 72.8402},
            "Mumbai (Dadar T.T. Circle PMBJP)": {"lat": 19.0178, "lon": 72.8478},
            "Bengaluru (Indiranagar 100ft Road)": {"lat": 12.9719, "lon": 77.6412},
            "Bengaluru (Jayanagar 4th Block PMBJP)": {"lat": 12.9299, "lon": 77.5834},
            "Hyderabad (Ameerpet Metro Hub)": {"lat": 17.4375, "lon": 78.4482},
            "Chennai (T. Nagar Panagal Park)": {"lat": 13.0418, "lon": 80.2341},
            "Kolkata (Park Street Crossing)": {"lat": 22.5512, "lon": 88.3585},
            "Pune (FC Road / Deccan Gymkhana)": {"lat": 18.5204, "lon": 73.8431}
        }

        col_loc1, col_loc2 = st.columns([2.5, 1.5])
        with col_loc1:
            chosen_loc_name = st.selectbox(
                "📍 Select Your Location / City Medical Hub:",
                options=list(location_presets.keys()),
                key="loc_hub_selector"
            )
            chosen_coords = location_presets[chosen_loc_name]
        with col_loc2:
            radius_option = st.radio(
                "Search Radius:",
                ["1 km", "3 km", "5 km", "10 km", "25 km"],
                index=3,
                horizontal=True,
                key="radius_pill_selector"
            )
            radius_km = float(radius_option.replace(" km", ""))

        # Search Type: Multi-Medicine Basket vs Single Drug Search
        search_mode = st.radio(
            "Select Search Type:",
            [
                "📋 Check Entire Prescription Basket (All Needed Medicines)",
                "💊 Search Specific Medicine / Molecule & Price Comparison"
            ],
            horizontal=True,
            key="tab9_search_type_toggle"
        )

        st.markdown("---")

        all_known_drugs = {
            "dolo-650": "Dolo 650 (Paracetamol 650mg)",
            "pantocid-dsr": "Pantocid DSR (Pantoprazole 40mg + Domperidone 30mg)",
            "augmentin-625-duo": "Augmentin 625 Duo (Amoxicillin 500mg + Clavulanic Acid 125mg)",
            "telma-40": "Telma 40 (Telmisartan 40mg)",
            "glycomet-gp2": "Glycomet GP2 (Metformin 500mg + Glimepiride 2mg)",
            "montair-lc": "Montair-LC (Montelukast 10mg + Levocetirizine 5mg)",
            "azithral-500": "Azithral 500 (Azithromycin 500mg)",
            "combiflam": "Combiflam (Ibuprofen 400mg + Paracetamol 325mg)",
            "domperidone-10": "Domstal 10 (Domperidone 10mg)"
        }

        # ---------------------------------------------------------
        # MODE A: PRESCRIPTION BASKET (MULTI-MEDICINE CHECK)
        # ---------------------------------------------------------
        if search_mode.startswith("📋"):
            st.markdown("### 📋 Prescribed Medicine Basket Stock Checker")
            st.markdown("Ranks pharmacies having **100% of your required medicines in stock** first, preventing multiple trips.")

            # Default medicines from scanned prescription or presets
            default_basket_ids = [m["drug_id"] for m in rx_meds] if rx_meds else ["dolo-650", "pantocid-dsr", "augmentin-625-duo"]
            valid_defaults = [k for k in default_basket_ids if k in all_known_drugs]
            if not valid_defaults:
                valid_defaults = ["dolo-650", "pantocid-dsr"]

            col_b1, col_b2 = st.columns([3, 1])
            with col_b1:
                selected_basket_drugs = st.multiselect(
                    "Selected Medicines in your Prescription Basket:",
                    options=list(all_known_drugs.keys()),
                    default=valid_defaults,
                    format_func=lambda k: all_known_drugs[k],
                    key="tab9_basket_multiselect"
                )
            with col_b2:
                filter_choice = st.radio(
                    "Filter Availability:",
                    ["Show All Stores", "🟢 All medicines available", "🟠 Partial availability", "❌ Out of stock"],
                    index=0,
                    key="tab9_basket_filter_radio"
                )
                filter_status_val = None
                if "All medicines" in filter_choice:
                    filter_status_val = "ALL_AVAILABLE"
                elif "Partial" in filter_choice:
                    filter_status_val = "PARTIAL"
                elif "Out of stock" in filter_choice:
                    filter_status_val = "OUT_OF_STOCK"

            if not selected_basket_drugs:
                st.warning("Please select at least one medicine to check availability.")
            else:
                with st.spinner("Checking live database inventories across nearby Jan Aushadhi & verified pharmacies..."):
                    multi_res = fetch_multi_availability_api(
                        lat=chosen_coords["lat"],
                        lon=chosen_coords["lon"],
                        medicine_ids=selected_basket_drugs,
                        radius=radius_km,
                        filter_status=filter_status_val
                    )

                if multi_res and multi_res.get("pharmacies"):
                    pharm_list = multi_res["pharmacies"]
                    all_avail_cnt = multi_res.get("all_medicines_available_count", 0)
                    partial_cnt = multi_res.get("partial_availability_count", 0)
                    out_cnt = multi_res.get("out_of_stock_count", 0)

                    # KPI Cards
                    k1, k2, k3, k4 = st.columns(4)
                    with k1:
                        st.metric("Total Stores Found", len(pharm_list))
                    with k2:
                        st.metric("🟢 100% Full Stock", all_avail_cnt, f"{all_avail_cnt} stores have all items")
                    with k3:
                        st.metric("🟠 Partial Stock", partial_cnt, "Missing 1 or more items")
                    with k4:
                        st.metric("❌ Out of Stock", out_cnt, "Unavailable here")

                    # Interactive Leaflet Map
                    st.markdown("#### 🗺️ Interactive Pharmacy Location Map")
                    map_html = render_leaflet_map_html(
                        center_lat=chosen_coords["lat"],
                        center_lon=chosen_coords["lon"],
                        pharmacies=pharm_list,
                        zoom=13,
                        height=420
                    )
                    components.html(map_html, height=435)

                    st.divider()
                    st.markdown("### 🏬 Verified Pharmacies & Live Stock Status")

                    for p in pharm_list:
                        overall_code = p.get("overall_status_code")
                        border_color = p.get("overall_color", "#10b981")
                        avail_count = p.get("available_medicines_count", 0)
                        req_count = p.get("total_medicines_requested", len(selected_basket_drugs))

                        with st.container():
                            st.markdown(f"""
                            <div class="card-glass" style="border-left: 6px solid {border_color}; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <h4 style="margin: 0; color: #0f172a; font-size: 1.25rem;">{p['name']}</h4>
                                            <span class="badge-verified">✓ Verified Store</span>
                                        </div>
                                        <div style="margin-top: 6px;">
                                            <span style="background: {p.get('overall_color')}15; color: {p.get('overall_color')}; padding: 3px 10px; border-radius: 9999px; font-size: 0.82rem; font-weight: 700; border: 1px solid {p.get('overall_color')}40;">
                                                {p.get('overall_status_badge')}
                                            </span>
                                            <span style="color: #64748b; font-size: 0.85rem; margin-left: 10px;">
                                                📞 {p['phone']}
                                            </span>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <span style="font-size: 1.2rem; font-weight: 800; color: #0d9488;">📍 {p['distance_km']} km away</span>
                                        <div style="color: #059669; font-weight: 600; font-size: 0.85rem;">🕒 {p.get('opening_time', '')} - {p.get('closing_time', '')}</div>
                                    </div>
                                </div>
                                <p style="color: #475569; margin: 10px 0 14px 0; font-size: 0.9rem;">
                                    <strong>Address:</strong> {p['address']}
                                </p>
                            </div>
                            """, unsafe_allow_html=True)

                            # Itemized Stock Table
                            med_items = p.get("medicines", [])
                            if med_items:
                                item_rows = []
                                for m_itm in med_items:
                                    item_rows.append({
                                        "Medicine Name": f"{m_itm['brand_name']} ({m_itm.get('strength', '')})",
                                        "Stock Status": m_itm["status_badge"],
                                        "Exact Stock Quantity": f"{m_itm['stock_quantity']} {m_itm.get('unit', 'units')}",
                                        "Price": f"₹{m_itm['price']:.2f}" if m_itm["price"] > 0 else "N/A",
                                        "Last Inventory Update": m_itm["last_updated_human"]
                                    })
                                st.dataframe(pd.DataFrame(item_rows), use_container_width=True, hide_index=True)

                            # Action Buttons: Directions, Call & Hold
                            col_a1, col_a2, col_a3 = st.columns([1.2, 1.2, 2.0])
                            with col_a1:
                                st.markdown(f"""
                                <a href="{p['directions_url']}" target="_blank" style="text-decoration: none;">
                                    <div style="background: #eff6ff; color: #1d4ed8; text-align: center; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: 1px solid #bfdbfe;">
                                        🗺️ Get Directions
                                    </div>
                                </a>
                                """, unsafe_allow_html=True)
                            with col_a2:
                                st.markdown(f"""
                                <a href="tel:{p['phone'].replace(' ', '')}" style="text-decoration: none;">
                                    <div style="background: #f1f5f9; color: #334155; text-align: center; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: 1px solid #cbd5e1;">
                                        📞 Call Pharmacy
                                    </div>
                                </a>
                                """, unsafe_allow_html=True)
                            with col_a3:
                                basket_res_key = f"res_basket_{p['id']}_{len(selected_basket_drugs)}"
                                if overall_code == "ALL_AVAILABLE":
                                    if st.button("🔒 Hold Full Basket (1-Hour Reservation)", key=basket_res_key, use_container_width=True, type="primary"):
                                        items_to_hold = [{"drug_id": itm["medicine_id"], "drug_name": itm["brand_name"], "quantity_strips": 1} for itm in med_items if itm.get("is_in_stock")]
                                        res_ok, res_res = reserve_basket_api(
                                            pharmacy_id=p["id"],
                                            patient_mobile=user.get("mobile_number"),
                                            patient_name=user.get("user_name", "Patient"),
                                            items=items_to_hold
                                        )
                                        if res_ok:
                                            st.balloons()
                                            st.success(f"🎉 **Prescription Basket Reserved!** Reference Code: **{res_res.get('reservation', {}).get('reservation_id')}**\nStore will hold all items for 1 hour.")
                                        else:
                                            st.error(res_res.get("message", "Reservation failed."))
                                elif avail_count > 0:
                                    if st.button(f"🔒 Hold Available ({avail_count}/{req_count} items)", key=basket_res_key, use_container_width=True):
                                        items_to_hold = [{"drug_id": itm["medicine_id"], "drug_name": itm["brand_name"], "quantity_strips": 1} for itm in med_items if itm.get("is_in_stock")]
                                        res_ok, res_res = reserve_basket_api(
                                            pharmacy_id=p["id"],
                                            patient_mobile=user.get("mobile_number"),
                                            patient_name=user.get("user_name", "Patient"),
                                            items=items_to_hold
                                        )
                                        if res_ok:
                                            st.balloons()
                                            st.success(f"🎉 **Available Medicines Reserved!** Reference Code: **{res_res.get('reservation', {}).get('reservation_id')}**\nStore will hold items for 1 hour.")
                                        else:
                                            st.error(res_res.get("message", "Reservation failed."))
                                else:
                                    st.button("❌ Out of Stock at this Branch", key=basket_res_key, disabled=True, use_container_width=True)

                            st.markdown("---")
                else:
                    st.warning("No pharmacies found matching your selected radius or filters. Try expanding your search radius.")

        # ---------------------------------------------------------
        # MODE B: SINGLE MEDICINE & PRICE COMPARISON SEARCH
        # ---------------------------------------------------------
        else:
            st.markdown("### 💊 Single Medicine Stock & Price Comparator")
            st.markdown("Check real-time stock counts, brand vs Jan Aushadhi generic pricing, and pharmacy retail quotes.")

            col_s1, col_s2 = st.columns([3, 1])
            with col_s1:
                selected_single_drug = st.selectbox(
                    "Choose Medicine or Salt to check:",
                    options=list(all_known_drugs.keys()),
                    format_func=lambda k: all_known_drugs[k],
                    key="tab9_single_med_select"
                )
            with col_s2:
                in_stock_only_single = st.checkbox("🟢 In-Stock Only", value=False, help="Hides stores where this medicine is currently sold out")

            # Fetch nearby availability & price comparison
            with st.spinner("Checking live database stock and price benchmarks..."):
                single_pharmacies = fetch_live_nearby_pharmacies_api(
                    lat=chosen_coords["lat"],
                    lon=chosen_coords["lon"],
                    radius=radius_km,
                    medicine_id=selected_single_drug,
                    in_stock_only=in_stock_only_single
                )
                price_comp = fetch_medicine_price_comp_api(
                    medicine_id=selected_single_drug,
                    lat=chosen_coords["lat"],
                    lon=chosen_coords["lon"],
                    radius=radius_km
                )

            # Price Comparison Benchmark Box
            if price_comp and price_comp.get("price_comparison"):
                comp_data = price_comp["price_comparison"]
                b_mrp = comp_data.get("brand_mrp_inr", 100.0)
                g_mrp = comp_data.get("generic_mrp_inr", 20.0)
                saving_pct = round(((b_mrp - g_mrp) / b_mrp) * 100) if b_mrp > 0 else 0

                st.markdown(f"""
                <div class="card-glass" style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #86efac; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                        <div>
                            <div style="font-size: 0.8rem; text-transform: uppercase; color: #166534; font-weight: 700;">Price Comparison Benchmark</div>
                            <h3 style="margin: 2px 0 0 0; color: #14532d; font-weight: 800;">{all_known_drugs.get(selected_single_drug)}</h3>
                        </div>
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <div>
                                <span style="font-size: 0.78rem; color: #64748b;">Branded MRP:</span><br/>
                                <span class="price-branded">₹{b_mrp:.2f}</span>
                            </div>
                            <div>
                                <span style="font-size: 0.78rem; color: #047857; font-weight: 700;">Jan Aushadhi Generic:</span><br/>
                                <span class="price-generic">₹{g_mrp:.2f}</span>
                            </div>
                            <div class="savings-pill">
                                Save {saving_pct}%
                            </div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

            if single_pharmacies:
                # Interactive Leaflet Map
                st.markdown("#### 🗺️ Interactive Pharmacy Location Map")
                map_html = render_leaflet_map_html(
                    center_lat=chosen_coords["lat"],
                    center_lon=chosen_coords["lon"],
                    pharmacies=single_pharmacies,
                    zoom=13,
                    height=420
                )
                components.html(map_html, height=435)

                st.divider()
                st.markdown(f"### 🏬 Verified Pharmacies Stocking **{all_known_drugs.get(selected_single_drug)}**")

                for p in single_pharmacies:
                    med_stock = p.get("target_medicine_stock") or {}
                    qty = med_stock.get("stock_quantity", 0)
                    is_in_stock = med_stock.get("is_in_stock", False)
                    status_badge = med_stock.get("status_badge", "❌ OUT OF STOCK")
                    status_color = med_stock.get("status_color", "#ef4444")
                    price = med_stock.get("price", 0.0)
                    last_upd = med_stock.get("last_updated_human", "Recently")

                    with st.container():
                        st.markdown(f"""
                        <div class="card-glass" style="border-left: 6px solid {status_color}; margin-bottom: 14px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <h4 style="margin: 0; color: #0f172a; font-size: 1.2rem;">{p['name']}</h4>
                                        <span class="badge-verified">✓ Verified</span>
                                    </div>
                                    <div style="margin-top: 6px;">
                                        <span style="background: {status_color}15; color: {status_color}; padding: 3px 10px; border-radius: 9999px; font-size: 0.82rem; font-weight: 700; border: 1px solid {status_color}40;">
                                            {status_badge}
                                        </span>
                                        <span style="font-weight: 700; color: #0f172a; font-size: 0.92rem; margin-left: 10px;">
                                            Exact Stock: {qty} {med_stock.get('unit', 'strips')}
                                        </span>
                                        <span style="color: #64748b; font-size: 0.85rem; margin-left: 12px;">
                                            Price: <strong>₹{price:.2f}</strong>
                                        </span>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <span style="font-size: 1.2rem; font-weight: 800; color: #0d9488;">📍 {p['distance_km']} km away</span>
                                    <div style="color: #059669; font-weight: 600; font-size: 0.85rem;">🕒 {p.get('opening_time', '')} - {p.get('closing_time', '')}</div>
                                    <div style="color: #64748b; font-size: 0.8rem; margin-top: 2px;">🕒 {last_upd}</div>
                                </div>
                            </div>
                            <p style="color: #475569; margin: 10px 0 12px 0; font-size: 0.9rem;">
                                <strong>Address:</strong> {p['address']} | <strong>Phone:</strong> {p['phone']}
                            </p>
                        </div>
                        """, unsafe_allow_html=True)

                        # Action Buttons
                        col_btn1, col_btn2, col_btn3 = st.columns([1, 1, 1.5])
                        with col_btn1:
                            st.markdown(f"""
                            <a href="{p['directions_url']}" target="_blank" style="text-decoration: none;">
                                <div style="background: #eff6ff; color: #1d4ed8; text-align: center; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: 1px solid #bfdbfe;">
                                    🗺️ Get Directions
                                </div>
                            </a>
                            """, unsafe_allow_html=True)
                        with col_btn2:
                            st.markdown(f"""
                            <a href="tel:{p['phone'].replace(' ', '')}" style="text-decoration: none;">
                                <div style="background: #f1f5f9; color: #334155; text-align: center; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: 1px solid #cbd5e1;">
                                    📞 Call Pharmacy
                                </div>
                            </a>
                            """, unsafe_allow_html=True)
                        with col_btn3:
                            res_single_key = f"res_single_{p['id']}_{selected_single_drug}"
                            if is_in_stock:
                                if st.button("🔒 Hold Strip (1-Hour Reservation)", key=res_single_key, use_container_width=True, type="primary"):
                                    res_ok, res_data = reserve_medicine_api(
                                        pharmacy_id=p["id"],
                                        patient_mobile=user.get("mobile_number"),
                                        patient_name=user.get("user_name", "Patient"),
                                        drug_id=selected_single_drug,
                                        drug_name=all_known_drugs.get(selected_single_drug, "Generic Medicine"),
                                        quantity=1
                                    )
                                    if res_ok:
                                        st.balloons()
                                        st.success(f"🎉 **Reserved!** Token: **{res_data.get('reservation', {}).get('reservation_id')}**\nStore will hold 1 strip for 1 hour.")
                                    else:
                                        st.error(res_data.get("message", "Reservation failed."))
                            else:
                                st.button("❌ Out of Stock", key=res_single_key, disabled=True, use_container_width=True)

                        st.markdown("---")
            else:
                st.warning("No pharmacies found with stock for this medicine within the selected radius. Try expanding your search radius.")

        # Required Advisory Disclaimer at the bottom
        st.markdown("""
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-top: 24px; text-align: center;">
            <p style="margin: 0; color: #92400e; font-size: 0.85rem; line-height: 1.5;">
                ⚠️ <strong>Advisory Disclaimer:</strong> Price and availability information is provided for comparison. Do not substitute or change a prescribed medicine without consulting a doctor or qualified pharmacist.
            </p>
        </div>
        """, unsafe_allow_html=True)



# -------------------------------------------------------------
# MAIN APP ROUTER
# -------------------------------------------------------------
def main():
    if not st.session_state.auth_user:
        render_login_page()
    else:
        render_main_app()


if __name__ == "__main__":
    main()
