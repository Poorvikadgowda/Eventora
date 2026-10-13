"""
Nearby Pharmacy & Real-Time Medicine Stock Locator Engine.
Allows patients to find Jan Aushadhi Kendras & certified generic pharmacies nearby,
verify live stock availability of their active molecules, and hold/reserve medicines
before traveling to prevent wasted trips.
"""

import math
import time
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

# Alias mapping from various brand names, salts, and generic slugs to canonical inventory IDs
ALIAS_MAP: Dict[str, str] = {
    "dolo-650": "dolo-650",
    "calpol-650": "dolo-650",
    "paracetamol": "dolo-650",
    "paracetamol-650mg": "dolo-650",
    "pantocid-dsr": "pantocid-dsr",
    "pan-d": "pantocid-dsr",
    "pantoprazole": "pantocid-dsr",
    "pantoprazole-40mg-domperidone-30mg": "pantocid-dsr",
    "augmentin-625-duo": "augmentin-625-duo",
    "augmentin": "augmentin-625-duo",
    "clavam-625": "augmentin-625-duo",
    "amoxicillin": "augmentin-625-duo",
    "amoxicillin-500mg-clavulanate-125mg": "augmentin-625-duo",
    "telma-40": "telma-40",
    "telmikind-40": "telma-40",
    "telmisartan": "telma-40",
    "telmisartan-40mg": "telma-40",
    "glycomet-gp2": "glycomet-gp2",
    "gemer-2": "glycomet-gp2",
    "metformin": "glycomet-gp2",
    "metformin-500mg-glimepiride-2mg": "glycomet-gp2",
    "atorva-10": "atorva-10",
    "lipitor-10": "atorva-10",
    "atorvastatin": "atorva-10",
    "atorvastatin-10mg": "atorva-10",
    "azithral-500": "azithral-500",
    "azithromycin": "azithral-500",
    "azithromycin-500mg": "azithral-500",
    "montair-lc": "montair-lc",
    "montelukast": "montair-lc",
    "montelukast-10mg-levocetirizine-5mg": "montair-lc",
    "combiflam": "combiflam",
    "ibuprofen": "combiflam",
    "ibuprofen-400mg-paracetamol-325mg": "combiflam",
    "meftal-spas": "meftal-spas",
    "mefenamic": "meftal-spas",
    "mefenamic-acid-dicyclomine": "meftal-spas",
    "allegra-120": "allegra-120",
    "fexofenadine": "allegra-120",
    "fexofenadine-120mg": "allegra-120"
}

# Display names for canonical inventory keys
DRUG_DISPLAY_NAMES: Dict[str, str] = {
    "dolo-650": "Paracetamol 650mg Generic (Dolo / Calpol equivalent)",
    "pantocid-dsr": "Pantoprazole 40mg + Domperidone 30mg SR (Pantocid DSR / Pan D equivalent)",
    "augmentin-625-duo": "Amoxicillin 500mg + Clavulanate 125mg (Augmentin / Clavam equivalent)",
    "telma-40": "Telmisartan 40mg Generic (Telma 40 / Telmikind equivalent)",
    "glycomet-gp2": "Metformin 500mg + Glimepiride 2mg SR (Glycomet GP2 / Gemer equivalent)",
    "atorva-10": "Atorvastatin 10mg Generic (Atorva 10 / Lipitor equivalent)",
    "azithral-500": "Azithromycin 500mg Generic (Azithral 500 equivalent)",
    "montair-lc": "Montelukast 10mg + Levocetirizine 5mg (Montair-LC equivalent)",
    "combiflam": "Ibuprofen 400mg + Paracetamol 325mg (Combiflam equivalent)",
    "meftal-spas": "Mefenamic Acid 250mg + Dicyclomine 10mg (Meftal-Spas equivalent)",
    "allegra-120": "Fexofenadine 120mg Generic (Allegra 120 equivalent)"
}

# Curated dataset of Jan Aushadhi Kendras and certified generic pharmacies
# across major medical hubs and coordinates
PHARMACY_NETWORK: List[Dict[str, Any]] = [
    # --- DELHI NCR ---
    {
        "id": "pmbjp-delhi-01",
        "name": "PMBJP Jan Aushadhi Kendra #1042 - Metro Health Hub",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Delhi NCR",
        "pincode": "110001",
        "address": "Shop 12, Metro Station Concourse, Rajiv Chowk, New Delhi",
        "latitude": 28.6328,
        "longitude": 77.2197,
        "phone": "+91 98110 24890",
        "operating_hours": "08:00 AM - 10:00 PM (Daily)",
        "open_now": True,
        "rating": 4.8,
        "verified_pmbjp_license": "PMBJP-DL-8429",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 45, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 22, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 18, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 30, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 15, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 28, "unit_price": 1.10, "status": "In Stock"},
            "azithral-500": {"in_stock": True, "quantity_strips": 14, "unit_price": 8.00, "status": "In Stock"},
            "montair-lc": {"in_stock": False, "quantity_strips": 0, "unit_price": 2.70, "status": "Out of Stock"},
            "combiflam": {"in_stock": True, "quantity_strips": 35, "unit_price": 0.80, "status": "In Stock"},
            "meftal-spas": {"in_stock": True, "quantity_strips": 20, "unit_price": 1.50, "status": "In Stock"},
            "allegra-120": {"in_stock": True, "quantity_strips": 12, "unit_price": 4.20, "status": "In Stock"}
        }
    },
    {
        "id": "pmbjp-delhi-02",
        "name": "PMBJP Kendra #1409 - AIIMS Gate Dispensary",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Delhi NCR",
        "pincode": "110029",
        "address": "Gate 2, Ansari Nagar, Near AIIMS Hospital, New Delhi",
        "latitude": 28.5672,
        "longitude": 77.2100,
        "phone": "+91 98112 39180",
        "operating_hours": "24 Hours (Open 24/7)",
        "open_now": True,
        "rating": 4.9,
        "verified_pmbjp_license": "PMBJP-DL-9182",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 120, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 65, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 40, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 85, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 50, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 70, "unit_price": 1.10, "status": "In Stock"},
            "azithral-500": {"in_stock": True, "quantity_strips": 30, "unit_price": 8.00, "status": "In Stock"},
            "montair-lc": {"in_stock": True, "quantity_strips": 32, "unit_price": 2.70, "status": "In Stock"},
            "combiflam": {"in_stock": True, "quantity_strips": 55, "unit_price": 0.80, "status": "In Stock"},
            "meftal-spas": {"in_stock": True, "quantity_strips": 40, "unit_price": 1.50, "status": "In Stock"},
            "allegra-120": {"in_stock": True, "quantity_strips": 25, "unit_price": 4.20, "status": "In Stock"}
        }
    },
    {
        "id": "sanjeevani-generic-01",
        "name": "Sanjeevani Certified Generic Pharmacy",
        "type": "Certified Generic Pharmacy",
        "city": "Delhi NCR",
        "pincode": "110016",
        "address": "C-14, Green Park Main Market, Near Gurudwara, New Delhi",
        "latitude": 28.5588,
        "longitude": 77.2028,
        "phone": "+91 98710 49102",
        "operating_hours": "08:30 AM - 11:00 PM",
        "open_now": True,
        "rating": 4.7,
        "verified_pmbjp_license": "CGP-DL-4120",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 18, "unit_price": 1.40, "status": "In Stock (Cipla Generic)"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 4, "unit_price": 5.80, "status": "Low Stock (4 strips left)"},
            "augmentin-625-duo": {"in_stock": False, "quantity_strips": 0, "unit_price": 11.50, "status": "Out of Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 25, "unit_price": 3.80, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 19, "unit_price": 4.80, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 16, "unit_price": 3.80, "status": "In Stock"},
            "combiflam": {"in_stock": True, "quantity_strips": 15, "unit_price": 1.20, "status": "In Stock"}
        }
    },
    {
        "id": "pmbjp-delhi-lajpat",
        "name": "PMBJP Jan Aushadhi Kendra #1184 - Lajpat Nagar Central",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Delhi NCR",
        "pincode": "110024",
        "address": "Block 3, Central Market, Near Metro Gate 4, Lajpat Nagar II, New Delhi",
        "latitude": 28.5695,
        "longitude": 77.2415,
        "phone": "+91 98115 67201",
        "operating_hours": "09:00 AM - 09:30 PM",
        "open_now": True,
        "rating": 4.6,
        "verified_pmbjp_license": "PMBJP-DL-1184",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 60, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 30, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 22, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 40, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": False, "quantity_strips": 0, "unit_price": 1.95, "status": "Out of Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 25, "unit_price": 1.10, "status": "In Stock"},
            "montair-lc": {"in_stock": True, "quantity_strips": 18, "unit_price": 2.70, "status": "In Stock"}
        }
    },
    # --- MUMBAI ---
    {
        "id": "pmbjp-mumbai-01",
        "name": "PMBJP Jan Aushadhi Kendra #2081 - Bandra Station",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Mumbai",
        "pincode": "400050",
        "address": "Platform 1 West, Near Ticket Counter, Bandra West, Mumbai",
        "latitude": 19.0544,
        "longitude": 72.8402,
        "phone": "+91 98200 48190",
        "operating_hours": "07:30 AM - 10:30 PM",
        "open_now": True,
        "rating": 4.8,
        "verified_pmbjp_license": "PMBJP-MH-2081",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 50, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 30, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 25, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 45, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 20, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 35, "unit_price": 1.10, "status": "In Stock"},
            "montair-lc": {"in_stock": True, "quantity_strips": 20, "unit_price": 2.70, "status": "In Stock"},
            "combiflam": {"in_stock": True, "quantity_strips": 40, "unit_price": 0.80, "status": "In Stock"}
        }
    },
    {
        "id": "pmbjp-mumbai-dadar",
        "name": "PMBJP Kendra #2150 - Dadar T.T. Circle",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Mumbai",
        "pincode": "400014",
        "address": "Shop 4, Swami Gyan Jivandas Marg, Dadar East, Mumbai",
        "latitude": 19.0178,
        "longitude": 72.8478,
        "phone": "+91 98205 11980",
        "operating_hours": "08:00 AM - 10:00 PM",
        "open_now": True,
        "rating": 4.7,
        "verified_pmbjp_license": "PMBJP-MH-2150",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 80, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 40, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 30, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 50, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 35, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 45, "unit_price": 1.10, "status": "In Stock"}
        }
    },
    # --- BENGALURU ---
    {
        "id": "pmbjp-blr-01",
        "name": "PMBJP Kendra #3194 - Indiranagar 100ft Road",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Bengaluru",
        "pincode": "560038",
        "address": "84, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru",
        "latitude": 12.9719,
        "longitude": 77.6412,
        "phone": "+91 98450 12890",
        "operating_hours": "08:00 AM - 10:00 PM",
        "open_now": True,
        "rating": 4.8,
        "verified_pmbjp_license": "PMBJP-KA-3194",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 80, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 45, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 35, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 60, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 40, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 50, "unit_price": 1.10, "status": "In Stock"},
            "montair-lc": {"in_stock": True, "quantity_strips": 25, "unit_price": 2.70, "status": "In Stock"},
            "combiflam": {"in_stock": True, "quantity_strips": 60, "unit_price": 0.80, "status": "In Stock"}
        }
    },
    {
        "id": "pmbjp-blr-jayanagar",
        "name": "PMBJP Kendra #3281 - Jayanagar 4th Block",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Bengaluru",
        "pincode": "560011",
        "address": "12, 11th Main Rd, 4th Block, Jayanagar, Bengaluru",
        "latitude": 12.9299,
        "longitude": 77.5834,
        "phone": "+91 98452 77102",
        "operating_hours": "08:30 AM - 09:30 PM",
        "open_now": True,
        "rating": 4.7,
        "verified_pmbjp_license": "PMBJP-KA-3281",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 70, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 38, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 28, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 45, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 30, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 40, "unit_price": 1.10, "status": "In Stock"}
        }
    },
    # --- HYDERABAD ---
    {
        "id": "pmbjp-hyd-ameerpet",
        "name": "PMBJP Kendra #4102 - Ameerpet Metro Hub",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Hyderabad",
        "pincode": "500038",
        "address": "Beside Pillar A1042, Ameerpet Main Rd, Hyderabad",
        "latitude": 17.4375,
        "longitude": 78.4482,
        "phone": "+91 98490 65123",
        "operating_hours": "08:00 AM - 10:00 PM",
        "open_now": True,
        "rating": 4.8,
        "verified_pmbjp_license": "PMBJP-TG-4102",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 90, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 50, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 35, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 65, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 45, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 55, "unit_price": 1.10, "status": "In Stock"}
        }
    },
    # --- CHENNAI ---
    {
        "id": "pmbjp-chn-tnagar",
        "name": "PMBJP Kendra #5120 - T. Nagar Panagal Park",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Chennai",
        "pincode": "600017",
        "address": "45, Prakasam Rd, Opp Panagal Park, T. Nagar, Chennai",
        "latitude": 13.0418,
        "longitude": 80.2341,
        "phone": "+91 98401 22890",
        "operating_hours": "08:30 AM - 10:00 PM",
        "open_now": True,
        "rating": 4.8,
        "verified_pmbjp_license": "PMBJP-TN-5120",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 110, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 55, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 40, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 75, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 50, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 60, "unit_price": 1.10, "status": "In Stock"}
        }
    },
    # --- KOLKATA ---
    {
        "id": "pmbjp-kol-parkst",
        "name": "PMBJP Kendra #6045 - Park Street Crossing",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Kolkata",
        "pincode": "700016",
        "address": "18, Park Street, Near Mullick Bazar Crossing, Kolkata",
        "latitude": 22.5512,
        "longitude": 88.3585,
        "phone": "+91 98302 44109",
        "operating_hours": "08:00 AM - 09:30 PM",
        "open_now": True,
        "rating": 4.7,
        "verified_pmbjp_license": "PMBJP-WB-6045",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 85, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 42, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 32, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 50, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 38, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 48, "unit_price": 1.10, "status": "In Stock"}
        }
    },
    # --- PUNE ---
    {
        "id": "pmbjp-pune-fc",
        "name": "PMBJP Kendra #7021 - FC Road Deccan",
        "type": "Jan Aushadhi Kendra (Govt PMBJP)",
        "city": "Pune",
        "pincode": "411004",
        "address": "Fergusson College Rd, Shivajinagar, Deccan Gymkhana, Pune",
        "latitude": 18.5204,
        "longitude": 73.8431,
        "phone": "+91 98220 88123",
        "operating_hours": "08:30 AM - 10:00 PM",
        "open_now": True,
        "rating": 4.8,
        "verified_pmbjp_license": "PMBJP-MH-7021",
        "inventory": {
            "dolo-650": {"in_stock": True, "quantity_strips": 95, "unit_price": 0.95, "status": "In Stock"},
            "pantocid-dsr": {"in_stock": True, "quantity_strips": 48, "unit_price": 3.20, "status": "In Stock"},
            "augmentin-625-duo": {"in_stock": True, "quantity_strips": 36, "unit_price": 6.00, "status": "In Stock"},
            "telma-40": {"in_stock": True, "quantity_strips": 58, "unit_price": 1.40, "status": "In Stock"},
            "glycomet-gp2": {"in_stock": True, "quantity_strips": 42, "unit_price": 1.95, "status": "In Stock"},
            "atorva-10": {"in_stock": True, "quantity_strips": 52, "unit_price": 1.10, "status": "In Stock"}
        }
    }
]

# In-memory store for reserved medicines
_RESERVATIONS: List[Dict[str, Any]] = []


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute geodesic distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def resolve_canonical_drug_id(query_drug: str) -> str:
    """
    Map brand names, active salts, or slugs to standard canonical inventory keys.
    """
    clean = query_drug.lower().strip()
    if clean in ALIAS_MAP:
        return ALIAS_MAP[clean]

    # Substring search in ALIAS_MAP
    for alias_key, canon_val in ALIAS_MAP.items():
        if alias_key in clean or clean in alias_key:
            return canon_val

    return clean


def get_drug_stock_for_pharmacy(pharmacy: Dict[str, Any], query_drug: str) -> Dict[str, Any]:
    """
    Lookup real-time stock for a specific medicine (brand or generic) at a given pharmacy.
    """
    inventory = pharmacy.get("inventory", {})
    canonical_id = resolve_canonical_drug_id(query_drug)

    # 1. Exact match on canonical key
    if canonical_id in inventory:
        st = inventory[canonical_id].copy()
        st["canonical_id"] = canonical_id
        st["display_name"] = DRUG_DISPLAY_NAMES.get(canonical_id, query_drug.title())
        return st

    # 2. Direct match on query_drug as key
    if query_drug in inventory:
        st = inventory[query_drug].copy()
        st["canonical_id"] = query_drug
        st["display_name"] = DRUG_DISPLAY_NAMES.get(query_drug, query_drug.title())
        return st

    # 3. Not stocked
    return {
        "in_stock": False,
        "quantity_strips": 0,
        "unit_price": 0.0,
        "status": "Not Stocked / Out of Stock",
        "canonical_id": canonical_id,
        "display_name": DRUG_DISPLAY_NAMES.get(canonical_id, query_drug.title())
    }


def find_alternative_pharmacy_with_stock(
    missing_drug_id: str,
    current_store_id: str,
    user_lat: float,
    user_lon: float
) -> Optional[Dict[str, Any]]:
    """
    If a store is out of stock of a particular medicine, find the nearest store
    that DOES have it in stock so the patient is never left stranded.
    """
    alternatives = []
    for store in PHARMACY_NETWORK:
        if store["id"] == current_store_id:
            continue
        stock = get_drug_stock_for_pharmacy(store, missing_drug_id)
        if stock.get("in_stock") and stock.get("quantity_strips", 0) > 0:
            dist = calculate_distance_km(user_lat, user_lon, store["latitude"], store["longitude"])
            alternatives.append({
                "pharmacy_id": store["id"],
                "pharmacy_name": store["name"],
                "distance_km": dist,
                "phone": store["phone"],
                "address": store["address"],
                "quantity_strips": stock.get("quantity_strips"),
                "unit_price": stock.get("unit_price")
            })

    if alternatives:
        alternatives.sort(key=lambda x: x["distance_km"])
        return alternatives[0]
    return None


def find_nearby_pharmacies(
    user_lat: float = 28.6139,
    user_lon: float = 77.2090,
    city: Optional[str] = None,
    drug_id: Optional[str] = None,
    in_stock_only: bool = False,
    max_radius_km: float = 30.0
) -> List[Dict[str, Any]]:
    """
    Search nearby pharmacies, calculate distance, and check live stock for requested medicine.
    """
    results = []

    for store in PHARMACY_NETWORK:
        # Distance calculation
        dist = calculate_distance_km(user_lat, user_lon, store["latitude"], store["longitude"])

        # Check stock for requested drug if specified
        drug_stock = None
        alt_store = None
        if drug_id:
            drug_stock = get_drug_stock_for_pharmacy(store, drug_id)
            if in_stock_only and not drug_stock.get("in_stock"):
                continue

            # If out of stock, locate nearest alternative branch with stock
            if not drug_stock.get("in_stock"):
                alt_store = find_alternative_pharmacy_with_stock(drug_id, store["id"], user_lat, user_lon)

        if dist <= max_radius_km:
            google_maps_url = f"https://www.google.com/maps/dir/?api=1&destination={store['latitude']},{store['longitude']}"
            results.append({
                "id": store["id"],
                "name": store["name"],
                "type": store["type"],
                "city": store["city"],
                "pincode": store["pincode"],
                "address": store["address"],
                "latitude": store["latitude"],
                "longitude": store["longitude"],
                "distance_km": dist,
                "phone": store["phone"],
                "operating_hours": store["operating_hours"],
                "open_now": store["open_now"],
                "rating": store["rating"],
                "license": store["verified_pmbjp_license"],
                "target_drug_stock": drug_stock,
                "alternative_store_with_stock": alt_store,
                "all_inventory": store["inventory"],
                "google_maps_url": google_maps_url
            })

    # Sort primarily by distance
    results.sort(key=lambda x: x["distance_km"])
    return results


class BasketStockCheckRequest(BaseModel):
    lat: float = Field(28.6139, description="Patient latitude")
    lon: float = Field(77.2090, description="Patient longitude")
    drug_ids: List[str] = Field(..., description="List of prescribed medicines to check")
    in_stock_only: bool = Field(False, description="Filter only stores with all items in stock")
    max_radius_km: float = Field(35.0, description="Search radius in kilometers")


def check_basket_stock(
    user_lat: float = 28.6139,
    user_lon: float = 77.2090,
    drug_ids: Optional[List[str]] = None,
    in_stock_only: bool = False,
    max_radius_km: float = 35.0
) -> Dict[str, Any]:
    """
    Multi-medicine basket stock checker.
    Evaluates whether a pharmacy has ALL required medicines from a prescription,
    avoiding wasted trips where a patient only gets partial prescriptions filled.
    """
    if not drug_ids:
        drug_ids = ["dolo-650", "pantocid-dsr"]

    pharmacy_results = []

    for store in PHARMACY_NETWORK:
        dist = calculate_distance_km(user_lat, user_lon, store["latitude"], store["longitude"])
        if dist > max_radius_km:
            continue

        item_breakdown = []
        available_count = 0
        total_generic_cost = 0.0

        for d_id in drug_ids:
            stock = get_drug_stock_for_pharmacy(store, d_id)
            if stock.get("in_stock"):
                available_count += 1
                total_generic_cost += stock.get("unit_price", 0.0) * 10
            else:
                # Find alternative pharmacy with this missing item
                stock["nearest_alternative_store"] = find_alternative_pharmacy_with_stock(
                    d_id, store["id"], user_lat, user_lon
                )

            item_breakdown.append({
                "query_drug": d_id,
                "canonical_id": stock.get("canonical_id", d_id),
                "display_name": stock.get("display_name", d_id.title()),
                "in_stock": stock.get("in_stock", False),
                "quantity_strips": stock.get("quantity_strips", 0),
                "unit_price": stock.get("unit_price", 0.0),
                "status": stock.get("status", "Unknown"),
                "nearest_alternative_store": stock.get("nearest_alternative_store")
            })

        all_available = (available_count == len(drug_ids))
        if in_stock_only and not all_available:
            continue

        google_maps_url = f"https://www.google.com/maps/dir/?api=1&destination={store['latitude']},{store['longitude']}"

        pharmacy_results.append({
            "id": store["id"],
            "name": store["name"],
            "type": store["type"],
            "city": store["city"],
            "pincode": store["pincode"],
            "address": store["address"],
            "latitude": store["latitude"],
            "longitude": store["longitude"],
            "distance_km": dist,
            "phone": store["phone"],
            "operating_hours": store["operating_hours"],
            "open_now": store["open_now"],
            "rating": store["rating"],
            "license": store["verified_pmbjp_license"],
            "total_requested": len(drug_ids),
            "total_available": available_count,
            "all_available": all_available,
            "availability_percentage": round((available_count / len(drug_ids)) * 100, 1),
            "estimated_generic_cost_10tabs": round(total_generic_cost, 2),
            "items": item_breakdown,
            "google_maps_url": google_maps_url
        })

    # Sort algorithm: Stores with all items available come first, then sorted by distance
    pharmacy_results.sort(key=lambda x: (-1 if x["all_available"] else 0, -x["total_available"], x["distance_km"]))

    # Summary metrics
    stores_with_full_stock = [p for p in pharmacy_results if p["all_available"]]

    return {
        "success": True,
        "total_medicines_checked": len(drug_ids),
        "requested_medicines": drug_ids,
        "total_stores_found": len(pharmacy_results),
        "stores_with_full_stock_count": len(stores_with_full_stock),
        "nearest_full_stock_store": stores_with_full_stock[0] if stores_with_full_stock else None,
        "pharmacies": pharmacy_results
    }


class ReserveMedicineRequest(BaseModel):
    pharmacy_id: str
    patient_mobile: str
    patient_name: str
    drug_id: str
    drug_name: str
    quantity_strips: int = 1


def reserve_medicine_strip(req: ReserveMedicineRequest) -> Dict[str, Any]:
    """
    Pre-hold / reserve a medicine strip at a designated pharmacy for 1 hour.
    Guarantees the patient does not arrive only to find the medicine sold out.
    """
    pharmacy = next((p for p in PHARMACY_NETWORK if p["id"] == req.pharmacy_id), None)
    if not pharmacy:
        return {"success": False, "message": "Pharmacy not found."}

    canonical_id = resolve_canonical_drug_id(req.drug_id)
    stock = pharmacy["inventory"].get(canonical_id) or pharmacy["inventory"].get(req.drug_id)

    if not stock or not stock.get("in_stock") or stock.get("quantity_strips", 0) < req.quantity_strips:
        return {
            "success": False,
            "message": f"Sorry, {req.drug_name} is currently out of stock at this pharmacy."
        }

    # Decrement available strips
    stock["quantity_strips"] -= req.quantity_strips
    if stock["quantity_strips"] == 0:
        stock["in_stock"] = False
        stock["status"] = "Out of Stock"

    reservation_id = f"RES-{int(time.time()) % 100000}"
    rec = {
        "reservation_id": reservation_id,
        "pharmacy_name": pharmacy["name"],
        "pharmacy_phone": pharmacy["phone"],
        "pharmacy_address": pharmacy["address"],
        "patient_name": req.patient_name,
        "patient_mobile": req.patient_mobile,
        "drug_name": req.drug_name,
        "quantity_strips": req.quantity_strips,
        "valid_until": "1 Hour from now",
        "created_at": time.strftime("%H:%M:%S")
    }
    _RESERVATIONS.append(rec)

    return {
        "success": True,
        "message": f"Medicine reserved successfully! Reference code: {reservation_id}.",
        "reservation": rec
    }


class ReserveBasketRequest(BaseModel):
    pharmacy_id: str
    patient_mobile: str
    patient_name: str
    items: List[Dict[str, Any]]  # [{"drug_id": ..., "drug_name": ..., "quantity_strips": 1}]


def reserve_medicine_basket(req: ReserveBasketRequest) -> Dict[str, Any]:
    """
    Pre-hold / reserve all medicines in a prescription basket at once for 1 hour.
    """
    pharmacy = next((p for p in PHARMACY_NETWORK if p["id"] == req.pharmacy_id), None)
    if not pharmacy:
        return {"success": False, "message": "Pharmacy not found."}

    reserved_items = []
    failed_items = []

    for item in req.items:
        d_id = item.get("drug_id", "")
        d_name = item.get("drug_name", d_id)
        qty = int(item.get("quantity_strips", 1))

        canon = resolve_canonical_drug_id(d_id)
        stock = pharmacy["inventory"].get(canon) or pharmacy["inventory"].get(d_id)

        if stock and stock.get("in_stock") and stock.get("quantity_strips", 0) >= qty:
            stock["quantity_strips"] -= qty
            if stock["quantity_strips"] == 0:
                stock["in_stock"] = False
                stock["status"] = "Out of Stock"
            reserved_items.append({"drug_name": d_name, "quantity": qty, "unit_price": stock.get("unit_price")})
        else:
            failed_items.append({"drug_name": d_name, "reason": "Insufficient stock"})

    if not reserved_items:
        return {
            "success": False,
            "message": "None of the requested medicines could be reserved due to zero stock."
        }

    reservation_id = f"BASKET-RES-{int(time.time()) % 100000}"
    rec = {
        "reservation_id": reservation_id,
        "pharmacy_name": pharmacy["name"],
        "pharmacy_phone": pharmacy["phone"],
        "pharmacy_address": pharmacy["address"],
        "patient_name": req.patient_name,
        "patient_mobile": req.patient_mobile,
        "reserved_items": reserved_items,
        "failed_items": failed_items,
        "valid_until": "1 Hour from now",
        "created_at": time.strftime("%H:%M:%S")
    }
    _RESERVATIONS.append(rec)

    return {
        "success": True,
        "message": f"Basket reserved successfully! Reference code: {reservation_id}.",
        "reservation": rec
    }
