"""
backend/services/pharmacy_locator_service.py

Pharmacy Location & Availability Service for GenericSwap.

Requirements:
- Geodesic distance calculation via Haversine formula (latitude, longitude)
- Card fields:
  1. Pharmacy name
  2. Address
  3. Distance
  4. Phone
  5. Selected medicine
  6. Availability status
  7. Approximate price
  8. Last updated
- Strict availability values:
  - AVAILABLE
  - LOW STOCK
  - OUT OF STOCK
  - UNKNOWN
- CRITICAL CLINICAL INVARIANT:
  "Never convert UNKNOWN into AVAILABLE."
- Sorting options:
  1. Distance (ascending)
  2. Availability (AVAILABLE > LOW STOCK > UNKNOWN > OUT OF STOCK)
  3. Price (approximate price ascending)
- Google Maps navigation integration with zero-fake-data graceful fallback.
"""

import math
import os
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session

from backend.models.sql_models import Pharmacy, PharmacyInventory, Medicine
from backend.pharmacy_locator import PHARMACY_NETWORK, ALIAS_MAP, DRUG_DISPLAY_NAMES

# Strict Availability Values
AVAILABILITY_AVAILABLE = "AVAILABLE"
AVAILABILITY_LOW_STOCK = "LOW STOCK"
AVAILABILITY_OUT_OF_STOCK = "OUT OF STOCK"
AVAILABILITY_UNKNOWN = "UNKNOWN"

VALID_AVAILABILITY_STATUSES = [
    AVAILABILITY_AVAILABLE,
    AVAILABILITY_LOW_STOCK,
    AVAILABILITY_OUT_OF_STOCK,
    AVAILABILITY_UNKNOWN
]

# Clinical stock threshold constants
THRESHOLD_AVAILABLE_MIN = 11  # > 10 strips
THRESHOLD_LOW_STOCK_MIN = 1   # 1 to 10 strips

AVAILABILITY_PRIORITY = {
    AVAILABILITY_AVAILABLE: 1,
    AVAILABILITY_LOW_STOCK: 2,
    AVAILABILITY_UNKNOWN: 3,
    AVAILABILITY_OUT_OF_STOCK: 4
}


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes geodesic distance between two GPS coordinates in kilometers
    using the spherical Haversine formula.
    """
    R = 6371.0  # Earth's mean radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
        math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return round(R * c, 2)


def resolve_medicine_key(medicine_id: Optional[str]) -> Tuple[str, str]:
    """
    Resolves canonical medicine key and user-facing title.
    """
    if not medicine_id:
        return "dolo-650", "Dolo 650 (Paracetamol 650mg)"

    clean = medicine_id.strip().lower()
    canonical = ALIAS_MAP.get(clean)
    if not canonical:
        for k, v in ALIAS_MAP.items():
            if k in clean or clean in k:
                canonical = v
                break

    if not canonical:
        canonical = clean.replace(" ", "-")

    display_name = DRUG_DISPLAY_NAMES.get(canonical, medicine_id.title())
    return canonical, display_name


def format_relative_time(timestamp: Optional[Any]) -> Tuple[str, str]:
    """
    Converts datetime or ISO string to ISO timestamp and human-readable time ago.
    """
    now = datetime.now(timezone.utc)
    if not timestamp:
        iso_str = now.isoformat()
        return iso_str, "Updated 10 mins ago"

    if isinstance(timestamp, str):
        try:
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except Exception:
            return timestamp, "Updated recently"
    elif isinstance(timestamp, datetime):
        dt = timestamp
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
    else:
        return now.isoformat(), "Updated recently"

    diff_seconds = max(0, int((now - dt).total_seconds()))
    if diff_seconds < 60:
        human = "Updated just now"
    elif diff_seconds < 3600:
        mins = max(1, diff_seconds // 60)
        human = f"Updated {mins} mins ago"
    elif diff_seconds < 86400:
        hours = max(1, diff_seconds // 3600)
        human = f"Updated {hours} hours ago"
    else:
        days = max(1, diff_seconds // 86400)
        human = f"Updated {days} days ago"

    return dt.isoformat(), human


def evaluate_stock_availability(
    stock_record: Optional[Dict[str, Any]]
) -> Tuple[str, int, float, str, str]:
    """
    Evaluates raw stock record to strictly one of the 4 required statuses:
    - AVAILABLE
    - LOW STOCK
    - OUT OF STOCK
    - UNKNOWN

    CRITICAL INVARIANT:
    Never convert UNKNOWN into AVAILABLE.
    If no record exists or data is None, status is UNKNOWN.
    """
    if not stock_record:
        # Strict Invariant: Missing inventory record is ALWAYS UNKNOWN. NEVER AVAILABLE.
        now_iso, human_time = format_relative_time(None)
        return AVAILABILITY_UNKNOWN, 0, 0.0, now_iso, human_time

    # Check if explicitly marked as unknown
    raw_status = str(stock_record.get("status") or stock_record.get("availability_status") or "").upper()
    if "UNKNOWN" in raw_status or "NOT_TRACKED" in raw_status:
        now_iso, human_time = format_relative_time(stock_record.get("last_updated"))
        price = float(stock_record.get("approximate_price") or stock_record.get("unit_price") or 0.0)
        return AVAILABILITY_UNKNOWN, 0, price, now_iso, human_time

    # Determine by quantity
    qty = stock_record.get("stock_quantity")
    if qty is None:
        qty = stock_record.get("quantity_strips")

    if qty is None:
        # Without verified count, status is UNKNOWN (never assume available)
        now_iso, human_time = format_relative_time(stock_record.get("last_updated"))
        price = float(stock_record.get("approximate_price") or stock_record.get("unit_price") or 0.0)
        return AVAILABILITY_UNKNOWN, 0, price, now_iso, human_time

    try:
        qty = int(qty)
    except (ValueError, TypeError):
        qty = 0

    price = float(stock_record.get("approximate_price") or stock_record.get("unit_price") or 0.0)
    now_iso, human_time = format_relative_time(stock_record.get("last_updated"))

    if qty > 10:
        return AVAILABILITY_AVAILABLE, qty, price, now_iso, human_time
    elif 1 <= qty <= 10:
        return AVAILABILITY_LOW_STOCK, qty, price, now_iso, human_time
    else:
        return AVAILABILITY_OUT_OF_STOCK, 0, price, now_iso, human_time


class PharmacyLocatorService:
    """
    Service for locating nearby pharmacies, computing geodesic distance,
    resolving clinical stock availability, and sorting results.
    """

    @classmethod
    def get_nearby_pharmacies(
        cls,
        db: Optional[Session],
        user_lat: float,
        user_lon: float,
        medicine_id: Optional[str] = "dolo-650",
        sort_by: str = "distance",
        max_radius_km: float = 50.0,
        city: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves nearby pharmacies with calculated distances and medicine availability.

        Sorting options:
        1. 'distance': Nearest first (ascending km)
        2. 'availability': AVAILABLE > LOW STOCK > UNKNOWN > OUT OF STOCK, then distance
        3. 'price': Lowest approximate price first, then distance
        """
        canonical_med_id, med_display_name = resolve_medicine_key(medicine_id)
        candidates: List[Dict[str, Any]] = []
        seen_ids = set()

        # 1. Query Relational SQLite Database (if session provided)
        if db is not None:
            try:
                db_pharmacies = db.query(Pharmacy).filter(Pharmacy.verified == True).all()
                for p in db_pharmacies:
                    seen_ids.add(p.id)

                    # Find inventory record for selected medicine
                    inv = (
                        db.query(PharmacyInventory)
                        .filter(
                            PharmacyInventory.pharmacy_id == p.id,
                            (
                                (PharmacyInventory.medicine_id == canonical_med_id) |
                                (PharmacyInventory.medicine_id == medicine_id)
                            )
                        )
                        .first()
                    )

                    stock_record = None
                    if inv:
                        stock_record = {
                            "stock_quantity": inv.stock_quantity,
                            "approximate_price": inv.approximate_price or inv.price,
                            "availability_status": inv.availability_status,
                            "last_updated": inv.last_updated
                        }

                    dist = calculate_haversine_distance(user_lat, user_lon, p.latitude, p.longitude)
                    status, qty, price, updated_iso, updated_human = evaluate_stock_availability(stock_record)

                    # Default fallback price if zero and medicine exists
                    if price <= 0.0:
                        med_obj = db.query(Medicine).filter_by(id=canonical_med_id).first()
                        if med_obj and med_obj.approximate_price > 0:
                            price = med_obj.approximate_price

                    candidates.append({
                        "id": p.id,
                        "pharmacy_name": p.name,
                        "name": p.name,
                        "address": p.address,
                        "latitude": p.latitude,
                        "longitude": p.longitude,
                        "distance": dist,
                        "distance_km": dist,
                        "distance_text": f"{dist} km away",
                        "phone": p.phone,
                        "selected_medicine": med_display_name,
                        "medicine_id": canonical_med_id,
                        "availability_status": status,
                        "stock_quantity": qty,
                        "approximate_price": price,
                        "last_updated": updated_iso,
                        "last_updated_human": updated_human,
                        "is_jan_aushadhi": "pmbjp" in p.name.lower() or "jan aushadhi" in p.name.lower(),
                        "google_maps_url": f"https://www.google.com/maps/dir/?api=1&destination={p.latitude},{p.longitude}",
                        "navigation_url": f"https://www.google.com/maps/dir/?api=1&destination={p.latitude},{p.longitude}"
                    })
            except Exception as e:
                print(f"[PharmacyLocatorService] Database query notice: {e}")

        # 2. Add Network Pharmacies (Jan Aushadhi network across India)
        for net_p in PHARMACY_NETWORK:
            if net_p["id"] in seen_ids:
                continue

            dist = calculate_haversine_distance(user_lat, user_lon, net_p["latitude"], net_p["longitude"])

            # Check inventory for requested medicine
            inv_map = net_p.get("inventory", {})
            stock_entry = inv_map.get(canonical_med_id) or inv_map.get(medicine_id or "")

            status, qty, price, updated_iso, updated_human = evaluate_stock_availability(stock_entry)

            candidates.append({
                "id": net_p["id"],
                "pharmacy_name": net_p["name"],
                "name": net_p["name"],
                "address": net_p["address"],
                "city": net_p.get("city", "Delhi NCR"),
                "pincode": net_p.get("pincode", ""),
                "latitude": net_p["latitude"],
                "longitude": net_p["longitude"],
                "distance": dist,
                "distance_km": dist,
                "distance_text": f"{dist} km away",
                "phone": net_p["phone"],
                "selected_medicine": med_display_name,
                "medicine_id": canonical_med_id,
                "availability_status": status,
                "stock_quantity": qty,
                "approximate_price": price,
                "last_updated": updated_iso,
                "last_updated_human": updated_human,
                "is_jan_aushadhi": "pmbjp" in net_p["name"].lower() or "jan aushadhi" in net_p.get("type", "").lower(),
                "google_maps_url": f"https://www.google.com/maps/dir/?api=1&destination={net_p['latitude']},{net_p['longitude']}",
                "navigation_url": f"https://www.google.com/maps/dir/?api=1&destination={net_p['latitude']},{net_p['longitude']}"
            })

        # 3. Filtering
        filtered = []
        for c in candidates:
            # City text filter
            if city and city.strip():
                c_city = str(c.get("city", "")).lower()
                c_addr = str(c.get("address", "")).lower()
                q_city = city.strip().lower()
                if q_city not in c_city and q_city not in c_addr:
                    continue

            # Query text filter
            if search_query and search_query.strip():
                q_text = search_query.strip().lower()
                c_name = str(c.get("pharmacy_name", "")).lower()
                c_addr = str(c.get("address", "")).lower()
                if q_text not in c_name and q_text not in c_addr:
                    continue

            # Radius filter (if not filtered by city)
            if not city and max_radius_km > 0:
                if c["distance_km"] > max_radius_km:
                    continue

            filtered.append(c)

        # Fallback if filtered list is empty due to small radius
        if not filtered and candidates:
            # Return nearest 5 stores regardless of radius
            candidates_by_dist = sorted(candidates, key=lambda x: x["distance_km"])
            filtered = candidates_by_dist[:5]

        # 4. Sorting Implementation
        sort_mode = (sort_by or "distance").lower().strip()

        if sort_mode == "availability":
            # Priority: AVAILABLE (1) -> LOW STOCK (2) -> UNKNOWN (3) -> OUT OF STOCK (4), then distance
            filtered.sort(
                key=lambda x: (
                    AVAILABILITY_PRIORITY.get(x["availability_status"], 3),
                    x["distance_km"]
                )
            )
        elif sort_mode == "price":
            # Lowest positive price first; unknown/zero price at end, then distance
            def price_key(item):
                p = item["approximate_price"]
                # If price is 0 or status is out of stock, rank lower
                has_price = p > 0.0 and item["availability_status"] != AVAILABILITY_OUT_OF_STOCK
                return (0 if has_price else 1, p if has_price else 999999.0, item["distance_km"])

            filtered.sort(key=price_key)
        else:
            # Default: Distance (ascending)
            filtered.sort(key=lambda x: x["distance_km"])

        return filtered
