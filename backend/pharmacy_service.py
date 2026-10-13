"""
Pharmacy Location & Real-Time Inventory Service.
Separates Location Calculation (Haversine/Geo) from Live Database Inventory updates.
Implements stock status thresholds, multi-medicine prescription availability,
and time-ago update formatting.
"""

import math
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from backend.database import get_db_connection


# Configurable stock status thresholds
THRESHOLD_IN_STOCK = 10
THRESHOLD_LOW_STOCK_MIN = 4
THRESHOLD_LOW_STOCK_MAX = 10
THRESHOLD_VERY_LOW_MIN = 1
THRESHOLD_VERY_LOW_MAX = 3


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate geodesic distance between two GPS coordinates in kilometers using Haversine formula.
    """
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def get_stock_status_info(stock_quantity: int) -> Dict[str, Any]:
    """
    Evaluate stock quantity against clinical threshold requirements:
    - stock_quantity > 10 -> IN STOCK (🟢)
    - stock_quantity between 4 and 10 -> LOW STOCK (🟠)
    - stock_quantity between 1 and 3 -> VERY LOW STOCK (🔴)
    - stock_quantity == 0 -> OUT OF STOCK (❌)
    """
    if stock_quantity > THRESHOLD_IN_STOCK:
        return {
            "status_code": "IN_STOCK",
            "label": "IN STOCK",
            "badge": "🟢 IN STOCK",
            "color": "#10b981",
            "bg_color": "#ecfdf5",
            "is_available": True
        }
    elif THRESHOLD_LOW_STOCK_MIN <= stock_quantity <= THRESHOLD_LOW_STOCK_MAX:
        return {
            "status_code": "LOW_STOCK",
            "label": "LOW STOCK",
            "badge": "🟠 LOW STOCK",
            "color": "#f59e0b",
            "bg_color": "#fffbeb",
            "is_available": True
        }
    elif THRESHOLD_VERY_LOW_MIN <= stock_quantity <= THRESHOLD_VERY_LOW_MAX:
        return {
            "status_code": "VERY_LOW_STOCK",
            "label": "VERY LOW STOCK",
            "badge": "🔴 VERY LOW STOCK",
            "color": "#ef4444",
            "bg_color": "#fef2f2",
            "is_available": True
        }
    else:
        return {
            "status_code": "OUT_OF_STOCK",
            "label": "OUT OF STOCK",
            "badge": "❌ OUT OF STOCK",
            "color": "#64748b",
            "bg_color": "#f1f5f9",
            "is_available": False
        }


def format_time_ago(iso_timestamp: Optional[str]) -> str:
    """
    Convert ISO timestamp into friendly, transparent update notice (e.g. 'Updated 5 minutes ago').
    Explicitly clarifies to user that stock reflects latest pharmacy inventory upload.
    """
    if not iso_timestamp:
        return "Updated recently"

    try:
        dt = datetime.fromisoformat(iso_timestamp)
        now = datetime.now(timezone.utc)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        diff = now - dt
        seconds = max(0, int(diff.total_seconds()))

        if seconds < 60:
            return "Updated just now"
        elif seconds < 3600:
            minutes = max(1, seconds // 60)
            return f"Updated {minutes} minute{'s' if minutes != 1 else ''} ago"
        elif seconds < 86400:
            hours = seconds // 3600
            return f"Updated {hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = seconds // 86400
            return f"Updated {days} day{'s' if days != 1 else ''} ago"
    except Exception:
        return "Updated recently"


def resolve_medicine_id(query_str: str) -> Optional[str]:
    """
    Find canonical medicine ID in database from brand name, generic name, or salt.
    """
    clean = query_str.lower().strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Exact ID match
    cursor.execute("SELECT id FROM medicines WHERE id = ?", (clean,))
    row = cursor.fetchone()
    if row:
        conn.close()
        return row["id"]

    # Partial / substring match
    cursor.execute("""
    SELECT id FROM medicines 
    WHERE LOWER(brand_name) LIKE ? 
       OR LOWER(generic_name) LIKE ? 
       OR LOWER(active_ingredient) LIKE ? 
       OR id LIKE ?
    LIMIT 1
    """, (f"%{clean}%", f"%{clean}%", f"%{clean}%", f"%{clean}%"))
    row = cursor.fetchone()
    conn.close()
    return row["id"] if row else clean


def get_nearby_pharmacies_with_inventory(
    user_lat: float = 28.6139,
    user_lon: float = 77.2090,
    radius_km: float = 10.0,
    medicine_id: Optional[str] = None,
    in_stock_only: bool = False
) -> List[Dict[str, Any]]:
    """
    Retrieve pharmacies within search radius (1km, 3km, 5km, 10km) and attach live medicine stock.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM pharmacies")
    all_pharmacies = cursor.fetchall()

    resolved_med_id = resolve_medicine_id(medicine_id) if medicine_id else None

    results = []
    for p in all_pharmacies:
        dist = calculate_haversine_distance(user_lat, user_lon, p["latitude"], p["longitude"])
        if dist > radius_km:
            continue

        pharm_dict = dict(p)
        pharm_dict["distance_km"] = dist
        pharm_dict["directions_url"] = f"https://www.google.com/maps/dir/?api=1&destination={p['latitude']},{p['longitude']}"

        # Fetch inventory for requested medicine
        med_stock_info = None
        if resolved_med_id:
            cursor.execute("""
            SELECT pi.*, m.brand_name, m.generic_name, m.strength, m.dosage_form, m.active_ingredient
            FROM pharmacy_inventory pi
            JOIN medicines m ON pi.medicine_id = m.id
            WHERE pi.pharmacy_id = ? AND (pi.medicine_id = ? OR LOWER(m.brand_name) LIKE ? OR LOWER(m.active_ingredient) LIKE ?)
            LIMIT 1
            """, (p["id"], resolved_med_id, f"%{resolved_med_id}%", f"%{resolved_med_id}%"))
            inv_row = cursor.fetchone()

            if inv_row:
                qty = inv_row["stock_quantity"]
                st_info = get_stock_status_info(qty)
                med_stock_info = {
                    "medicine_id": inv_row["medicine_id"],
                    "brand_name": inv_row["brand_name"],
                    "generic_name": inv_row["generic_name"],
                    "strength": inv_row["strength"],
                    "stock_quantity": qty,
                    "unit": inv_row["unit"],
                    "price": inv_row["price"],
                    "batch_number": inv_row["batch_number"],
                    "expiry_date": inv_row["expiry_date"],
                    "last_updated_raw": inv_row["last_updated"],
                    "last_updated_human": format_time_ago(inv_row["last_updated"]),
                    "status_code": st_info["status_code"],
                    "status_label": st_info["label"],
                    "status_badge": st_info["badge"],
                    "status_color": st_info["color"],
                    "status_bg": st_info["bg_color"],
                    "is_in_stock": st_info["is_available"]
                }
            else:
                # Medicine is not in this pharmacy's database
                med_stock_info = {
                    "medicine_id": resolved_med_id,
                    "brand_name": resolved_med_id.title(),
                    "stock_quantity": 0,
                    "unit": "strip",
                    "price": 0.0,
                    "batch_number": None,
                    "expiry_date": None,
                    "last_updated_raw": None,
                    "last_updated_human": "Not stocked at this branch",
                    "status_code": "OUT_OF_STOCK",
                    "status_label": "OUT OF STOCK",
                    "status_badge": "❌ OUT OF STOCK",
                    "status_color": "#64748b",
                    "status_bg": "#f1f5f9",
                    "is_in_stock": False
                }

            if in_stock_only and not med_stock_info["is_in_stock"]:
                continue

        pharm_dict["target_medicine_stock"] = med_stock_info
        results.append(pharm_dict)

    conn.close()

    # Sort primarily by distance ascending
    results.sort(key=lambda x: x["distance_km"])
    return results


def check_multi_medicine_prescription_availability(
    user_lat: float,
    user_lon: float,
    medicine_ids: List[str],
    radius_km: float = 10.0,
    filter_status: Optional[str] = None  # 'ALL_AVAILABLE', 'PARTIAL', 'OUT_OF_STOCK'
) -> Dict[str, Any]:
    """
    Check availability for EVERY medicine extracted from an uploaded prescription.
    Categorizes pharmacies into:
    - ALL_AVAILABLE: 100% of medicines are in stock
    - PARTIAL: at least 1 medicine in stock, but not all
    - OUT_OF_STOCK: 0 medicines in stock
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM pharmacies")
    all_pharmacies = cursor.fetchall()

    resolved_ids = [resolve_medicine_id(m) for m in medicine_ids if m]
    if not resolved_ids:
        resolved_ids = ["dolo-650", "pantocid-dsr"]

    pharmacy_summaries = []

    for p in all_pharmacies:
        dist = calculate_haversine_distance(user_lat, user_lon, p["latitude"], p["longitude"])
        if dist > radius_km:
            continue

        item_details = []
        available_count = 0
        total_estimated_cost = 0.0

        for mid in resolved_ids:
            cursor.execute("""
            SELECT pi.*, m.brand_name, m.generic_name, m.strength, m.dosage_form
            FROM pharmacy_inventory pi
            JOIN medicines m ON pi.medicine_id = m.id
            WHERE pi.pharmacy_id = ? AND (pi.medicine_id = ? OR LOWER(m.brand_name) LIKE ? OR LOWER(m.active_ingredient) LIKE ?)
            LIMIT 1
            """, (p["id"], mid, f"%{mid}%", f"%{mid}%"))
            inv_row = cursor.fetchone()

            if inv_row:
                qty = inv_row["stock_quantity"]
                st_info = get_stock_status_info(qty)
                if st_info["is_available"]:
                    available_count += 1
                    total_estimated_cost += inv_row["price"]

                item_details.append({
                    "medicine_id": inv_row["medicine_id"],
                    "brand_name": inv_row["brand_name"],
                    "generic_name": inv_row["generic_name"],
                    "strength": inv_row["strength"],
                    "stock_quantity": qty,
                    "unit": inv_row["unit"],
                    "price": inv_row["price"],
                    "last_updated_human": format_time_ago(inv_row["last_updated"]),
                    "status_code": st_info["status_code"],
                    "status_label": st_info["label"],
                    "status_badge": st_info["badge"],
                    "status_color": st_info["color"],
                    "status_bg": st_info["bg_color"],
                    "is_in_stock": st_info["is_available"]
                })
            else:
                item_details.append({
                    "medicine_id": mid,
                    "brand_name": mid.title(),
                    "generic_name": "Generic Medicine",
                    "strength": "",
                    "stock_quantity": 0,
                    "unit": "strip",
                    "price": 0.0,
                    "last_updated_human": "Not stocked",
                    "status_code": "OUT_OF_STOCK",
                    "status_label": "OUT OF STOCK",
                    "status_badge": "❌ OUT OF STOCK",
                    "status_color": "#64748b",
                    "status_bg": "#f1f5f9",
                    "is_in_stock": False
                })

        total_req = len(resolved_ids)
        if available_count == total_req:
            overall_code = "ALL_AVAILABLE"
            overall_badge = "✓ All medicines available"
            overall_color = "#10b981"
        elif available_count > 0:
            overall_code = "PARTIAL"
            overall_badge = f"⚠️ Partial availability ({available_count}/{total_req})"
            overall_color = "#f59e0b"
        else:
            overall_code = "OUT_OF_STOCK"
            overall_badge = "❌ Out of stock"
            overall_color = "#ef4444"

        if filter_status and filter_status != "ALL" and overall_code != filter_status:
            continue

        pharmacy_summaries.append({
            "id": p["id"],
            "name": p["name"],
            "address": p["address"],
            "latitude": p["latitude"],
            "longitude": p["longitude"],
            "phone": p["phone"],
            "email": p["email"],
            "opening_time": p["opening_time"],
            "closing_time": p["closing_time"],
            "is_verified": bool(p["is_verified"]),
            "distance_km": dist,
            "directions_url": f"https://www.google.com/maps/dir/?api=1&destination={p['latitude']},{p['longitude']}",
            "overall_status_code": overall_code,
            "overall_status_badge": overall_badge,
            "overall_color": overall_color,
            "available_medicines_count": available_count,
            "total_medicines_requested": total_req,
            "total_estimated_price": round(total_estimated_cost, 2),
            "medicines": item_details
        })

    conn.close()

    # Sort algorithm: Pharmacies with ALL medicines in stock first, then distance
    pharmacy_summaries.sort(key=lambda x: (
        0 if x["overall_status_code"] == "ALL_AVAILABLE" else (1 if x["overall_status_code"] == "PARTIAL" else 2),
        x["distance_km"]
    ))

    all_avail_count = sum(1 for p in pharmacy_summaries if p["overall_status_code"] == "ALL_AVAILABLE")
    partial_count = sum(1 for p in pharmacy_summaries if p["overall_status_code"] == "PARTIAL")
    out_count = sum(1 for p in pharmacy_summaries if p["overall_status_code"] == "OUT_OF_STOCK")

    return {
        "success": True,
        "total_medicines_requested": len(resolved_ids),
        "requested_medicine_ids": resolved_ids,
        "total_pharmacies_found": len(pharmacy_summaries),
        "all_medicines_available_count": all_avail_count,
        "partial_availability_count": partial_count,
        "out_of_stock_count": out_count,
        "notice": "Stock information is based on the pharmacy's latest inventory update.",
        "pharmacies": pharmacy_summaries
    }


def get_medicine_price_comparison(medicine_id: str) -> Dict[str, Any]:
    """
    Retrieve Brand Price vs Jan Aushadhi Generic Price vs Nearby Pharmacy Retail Prices.
    """
    resolved_id = resolve_medicine_id(medicine_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM medicines WHERE id = ?", (resolved_id,))
    med = cursor.fetchone()

    cursor.execute("""
    SELECT pi.price, pi.stock_quantity, pi.unit, pi.last_updated, p.name as pharmacy_name, p.address
    FROM pharmacy_inventory pi
    JOIN pharmacies p ON pi.pharmacy_id = p.id
    WHERE pi.medicine_id = ?
    ORDER BY pi.price ASC
    """, (resolved_id,))
    pharmacy_prices = cursor.fetchall()
    conn.close()

    # Standard reference baseline prices
    baseline_brands = {
        "dolo-650": {"brand_name": "Dolo 650", "brand_price": 34.00, "generic_price": 9.50},
        "pantocid-dsr": {"brand_name": "Pantocid DSR", "brand_price": 205.00, "generic_price": 32.00},
        "augmentin-625-duo": {"brand_name": "Augmentin 625 Duo", "brand_price": 215.00, "generic_price": 60.00},
        "telma-40": {"brand_name": "Telma 40", "brand_price": 142.00, "generic_price": 14.00},
        "glycomet-gp2": {"brand_name": "Glycomet GP2", "brand_price": 178.00, "generic_price": 19.50},
        "atorva-10": {"brand_name": "Atorva 10", "brand_price": 115.00, "generic_price": 11.00},
        "montair-lc": {"brand_name": "Montair-LC", "brand_price": 165.00, "generic_price": 27.00},
        "combiflam": {"brand_name": "Combiflam", "brand_price": 44.00, "generic_price": 8.00},
        "domperidone-10": {"brand_name": "Domstal 10", "brand_price": 38.00, "generic_price": 7.50}
    }

    base = baseline_brands.get(resolved_id, {
        "brand_name": med["brand_name"] if med else medicine_id.title(),
        "brand_price": 100.0,
        "generic_price": 25.0
    })

    nearby_offers = []
    for r in pharmacy_prices:
        nearby_offers.append({
            "pharmacy_name": r["pharmacy_name"],
            "address": r["address"],
            "price": r["price"],
            "unit": r["unit"],
            "stock_quantity": r["stock_quantity"],
            "last_updated_human": format_time_ago(r["last_updated"])
        })

    return {
        "medicine_id": resolved_id,
        "brand_name": base["brand_name"],
        "brand_mrp_inr": base["brand_price"],
        "generic_mrp_inr": base["generic_price"],
        "nearby_pharmacy_offers": nearby_offers,
        "disclaimer": "Price and availability information is provided for comparison. Do not substitute or change a prescribed medicine without consulting a doctor or qualified pharmacist."
    }


def get_pharmacy_by_id(pharmacy_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve pharmacy details by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pharmacies WHERE id = ?", (pharmacy_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    pharm = dict(row)
    pharm["directions_url"] = f"https://www.google.com/maps/dir/?api=1&destination={pharm['latitude']},{pharm['longitude']}"
    return pharm


def get_pharmacy_inventory(pharmacy_id: str) -> List[Dict[str, Any]]:
    """Retrieve full inventory list for a specific pharmacy."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT pi.*, m.brand_name, m.generic_name, m.active_ingredient, m.strength, m.dosage_form, m.manufacturer
    FROM pharmacy_inventory pi
    JOIN medicines m ON pi.medicine_id = m.id
    WHERE pi.pharmacy_id = ?
    ORDER BY m.brand_name ASC
    """, (pharmacy_id,))
    rows = cursor.fetchall()
    conn.close()
    
    items = []
    for r in rows:
        st_info = get_stock_status_info(r["stock_quantity"])
        items.append({
            "inventory_id": r["id"],
            "pharmacy_id": r["pharmacy_id"],
            "medicine_id": r["medicine_id"],
            "brand_name": r["brand_name"],
            "generic_name": r["generic_name"],
            "active_ingredient": r["active_ingredient"],
            "strength": r["strength"],
            "dosage_form": r["dosage_form"],
            "manufacturer": r["manufacturer"],
            "stock_quantity": r["stock_quantity"],
            "unit": r["unit"],
            "price": r["price"],
            "batch_number": r["batch_number"],
            "expiry_date": r["expiry_date"],
            "last_updated": r["last_updated"],
            "last_updated_human": format_time_ago(r["last_updated"]),
            "status_code": st_info["status_code"],
            "status_label": st_info["label"],
            "status_badge": st_info["badge"],
            "status_color": st_info["color"],
            "status_bg": st_info["bg_color"],
            "is_in_stock": st_info["is_available"]
        })
    return items


def get_medicine_availability(medicine_id: str) -> Dict[str, Any]:
    """Retrieve availability and stock counts for a medicine across all stockists."""
    resolved_id = resolve_medicine_id(medicine_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medicines WHERE id = ?", (resolved_id,))
    med = cursor.fetchone()
    
    cursor.execute("""
    SELECT pi.*, p.name as pharmacy_name, p.address, p.latitude, p.longitude, p.phone, p.opening_time, p.closing_time
    FROM pharmacy_inventory pi
    JOIN pharmacies p ON pi.pharmacy_id = p.id
    WHERE pi.medicine_id = ?
    ORDER BY pi.stock_quantity DESC
    """, (resolved_id,))
    rows = cursor.fetchall()
    conn.close()

    availability_list = []
    for r in rows:
        st_info = get_stock_status_info(r["stock_quantity"])
        availability_list.append({
            "pharmacy_id": r["pharmacy_id"],
            "pharmacy_name": r["pharmacy_name"],
            "address": r["address"],
            "phone": r["phone"],
            "hours": f"{r['opening_time']} - {r['closing_time']}",
            "stock_quantity": r["stock_quantity"],
            "unit": r["unit"],
            "price": r["price"],
            "status_code": st_info["status_code"],
            "status_badge": st_info["badge"],
            "status_color": st_info["color"],
            "status_bg": st_info["bg_color"],
            "last_updated_human": format_time_ago(r["last_updated"]),
            "directions_url": f"https://www.google.com/maps/dir/?api=1&destination={r['latitude']},{r['longitude']}"
        })

    return {
        "medicine_id": resolved_id,
        "brand_name": med["brand_name"] if med else medicine_id.title(),
        "generic_name": med["generic_name"] if med else "",
        "active_ingredient": med["active_ingredient"] if med else "",
        "strength": med["strength"] if med else "",
        "dosage_form": med["dosage_form"] if med else "",
        "total_stockists": len(availability_list),
        "in_stock_stockists": sum(1 for a in availability_list if a["stock_quantity"] > 0),
        "stockists": availability_list,
        "disclaimer": "Stock information is based on the pharmacy's latest inventory update."
    }


def delete_inventory_item(inventory_id: str) -> bool:
    """Delete an inventory item by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM pharmacy_inventory WHERE id = ?", (inventory_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def get_inventory_audit_history(pharmacy_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve audit history logs."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if pharmacy_id:
        cursor.execute("""
        SELECT h.*, m.brand_name, m.strength, p.name as pharmacy_name
        FROM inventory_history h
        JOIN medicines m ON h.medicine_id = m.id
        JOIN pharmacies p ON h.pharmacy_id = p.id
        WHERE h.pharmacy_id = ?
        ORDER BY h.changed_at DESC
        LIMIT ?
        """, (pharmacy_id, limit))
    else:
        cursor.execute("""
        SELECT h.*, m.brand_name, m.strength, p.name as pharmacy_name
        FROM inventory_history h
        JOIN medicines m ON h.medicine_id = m.id
        JOIN pharmacies p ON h.pharmacy_id = p.id
        ORDER BY h.changed_at DESC
        LIMIT ?
        """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    logs = []
    for h in rows:
        logs.append({
            "history_id": h["id"],
            "pharmacy_id": h["pharmacy_id"],
            "pharmacy_name": h["pharmacy_name"],
            "medicine_id": h["medicine_id"],
            "medicine_name": f"{h['brand_name']} ({h['strength']})",
            "old_quantity": h["old_quantity"],
            "new_quantity": h["new_quantity"],
            "delta": h["new_quantity"] - h["old_quantity"],
            "changed_by": h["changed_by"],
            "changed_at": h["changed_at"],
            "time_ago": format_time_ago(h["changed_at"]),
            "notes": h["notes"]
        })
    return logs

