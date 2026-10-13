"""
Pharmacy Admin Service for GenericSwap.
Powers the Pharmacy Admin Portal: inventory management, stock updates,
price configuration, batch/expiry editing, and immutable audit history logs.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from backend.database import get_db_connection
from backend.pharmacy_service import get_stock_status_info, format_time_ago


def get_pharmacy_admin_dashboard(pharmacy_id: str) -> Dict[str, Any]:
    """
    Retrieve KPI stats for the Pharmacy Admin Dashboard:
    - Total Medicines
    - Total Stock Units
    - Low-Stock Medicines (4-10)
    - Out-of-Stock Medicines (0)
    - In-Stock Medicines (>10)
    - Last Inventory Update
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM pharmacies WHERE id = ?", (pharmacy_id,))
    pharm = cursor.fetchone()
    if not pharm:
        conn.close()
        return {"success": False, "message": "Pharmacy not found"}

    # Aggregate inventory statistics
    cursor.execute("""
    SELECT 
        COUNT(*) as total_medicines,
        COALESCE(SUM(stock_quantity), 0) as total_units,
        MAX(last_updated) as latest_update
    FROM pharmacy_inventory 
    WHERE pharmacy_id = ?
    """, (pharmacy_id,))
    summary = cursor.fetchone()

    cursor.execute("""
    SELECT stock_quantity FROM pharmacy_inventory WHERE pharmacy_id = ?
    """, (pharmacy_id,))
    all_stocks = [r["stock_quantity"] for r in cursor.fetchall()]

    in_stock_cnt = sum(1 for q in all_stocks if q > 10)
    low_stock_cnt = sum(1 for q in all_stocks if 1 <= q <= 10)
    out_of_stock_cnt = sum(1 for q in all_stocks if q == 0)

    # Fetch inventory list with medicine details
    cursor.execute("""
    SELECT pi.*, m.brand_name, m.generic_name, m.strength, m.dosage_form, m.manufacturer
    FROM pharmacy_inventory pi
    JOIN medicines m ON pi.medicine_id = m.id
    WHERE pi.pharmacy_id = ?
    ORDER BY pi.stock_quantity ASC
    """, (pharmacy_id,))
    inv_rows = cursor.fetchall()

    inventory_list = []
    for r in inv_rows:
        st_info = get_stock_status_info(r["stock_quantity"])
        inventory_list.append({
            "inventory_id": r["id"],
            "medicine_id": r["medicine_id"],
            "brand_name": r["brand_name"],
            "generic_name": r["generic_name"],
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
            "status_bg": st_info["bg_color"]
        })

    # Fetch latest 10 history logs
    cursor.execute("""
    SELECT h.*, m.brand_name, m.strength
    FROM inventory_history h
    JOIN medicines m ON h.medicine_id = m.id
    WHERE h.pharmacy_id = ?
    ORDER BY h.changed_at DESC
    LIMIT 10
    """, (pharmacy_id,))
    history_rows = cursor.fetchall()

    history_logs = []
    for h in history_rows:
        history_logs.append({
            "history_id": h["id"],
            "medicine_name": f"{h['brand_name']} ({h['strength']})",
            "old_quantity": h["old_quantity"],
            "new_quantity": h["new_quantity"],
            "delta": h["new_quantity"] - h["old_quantity"],
            "changed_by": h["changed_by"],
            "changed_at": h["changed_at"],
            "time_ago": format_time_ago(h["changed_at"]),
            "notes": h["notes"]
        })

    conn.close()

    return {
        "success": True,
        "pharmacy": dict(pharm),
        "kpis": {
            "total_medicines": summary["total_medicines"],
            "total_stock_units": summary["total_units"],
            "in_stock_count": in_stock_cnt,
            "low_stock_count": low_stock_cnt,
            "out_of_stock_count": out_of_stock_cnt,
            "last_updated_raw": summary["latest_update"],
            "last_updated_human": format_time_ago(summary["latest_update"])
        },
        "inventory": inventory_list,
        "recent_history": history_logs
    }


def update_inventory_item(
    pharmacy_id: str,
    medicine_id: str,
    new_quantity: int,
    price: Optional[float] = None,
    batch_number: Optional[str] = None,
    expiry_date: Optional[str] = None,
    changed_by: str = "Pharmacy Administrator",
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update stock quantity, price, batch, and expiry for a medicine in the pharmacy inventory.
    Automatically generates an audit entry in inventory_history.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM pharmacy_inventory 
    WHERE pharmacy_id = ? AND medicine_id = ?
    """, (pharmacy_id, medicine_id))
    existing = cursor.fetchone()

    now_iso = datetime.now(timezone.utc).isoformat()

    if existing:
        old_qty = existing["stock_quantity"]
        updated_price = price if price is not None else existing["price"]
        updated_batch = batch_number if batch_number is not None else existing["batch_number"]
        updated_expiry = expiry_date if expiry_date is not None else existing["expiry_date"]

        cursor.execute("""
        UPDATE pharmacy_inventory
        SET stock_quantity = ?, price = ?, batch_number = ?, expiry_date = ?, last_updated = ?
        WHERE pharmacy_id = ? AND medicine_id = ?
        """, (new_quantity, updated_price, updated_batch, updated_expiry, now_iso, pharmacy_id, medicine_id))

        # Insert audit history
        hist_id = f"hist-{uuid.uuid4().hex[:8]}"
        note_text = notes or f"Stock updated from {old_qty} → {new_quantity}"
        cursor.execute("""
        INSERT INTO inventory_history (id, pharmacy_id, medicine_id, old_quantity, new_quantity, changed_by, changed_at, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (hist_id, pharmacy_id, medicine_id, old_qty, new_quantity, changed_by, now_iso, note_text))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": f"Inventory updated successfully. Stock changed from {old_qty} → {new_quantity}.",
            "old_quantity": old_qty,
            "new_quantity": new_quantity,
            "last_updated": now_iso
        }
    else:
        # Create new inventory entry
        inv_id = f"inv-{uuid.uuid4().hex[:8]}"
        final_price = price or 20.0
        final_batch = batch_number or f"BATCH-{now_iso[:10]}"
        final_expiry = expiry_date or "2027-12-31"

        cursor.execute("""
        INSERT INTO pharmacy_inventory (id, pharmacy_id, medicine_id, stock_quantity, unit, price, batch_number, expiry_date, last_updated)
        VALUES (?, ?, ?, ?, 'strip', ?, ?, ?, ?)
        """, (inv_id, pharmacy_id, medicine_id, new_quantity, final_price, final_batch, final_expiry, now_iso))

        hist_id = f"hist-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO inventory_history (id, pharmacy_id, medicine_id, old_quantity, new_quantity, changed_by, changed_at, notes)
        VALUES (?, ?, ?, 0, ?, ?, ?, 'Initial stock added to inventory')
        """, (hist_id, pharmacy_id, medicine_id, new_quantity, changed_by, now_iso))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": f"Medicine added to inventory with stock: {new_quantity}.",
            "old_quantity": 0,
            "new_quantity": new_quantity,
            "last_updated": now_iso
        }


def mark_medicine_out_of_stock(pharmacy_id: str, medicine_id: str, changed_by: str = "Pharmacy Admin") -> Dict[str, Any]:
    """Convenience helper to set medicine stock to 0."""
    return update_inventory_item(
        pharmacy_id=pharmacy_id,
        medicine_id=medicine_id,
        new_quantity=0,
        changed_by=changed_by,
        notes="Marked Out of Stock by Administrator"
    )


def get_all_registered_pharmacies() -> List[Dict[str, Any]]:
    """Retrieve list of all registered pharmacies for admin selection."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, address, phone, is_verified FROM pharmacies ORDER BY name ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def get_all_catalog_medicines() -> List[Dict[str, Any]]:
    """Retrieve all catalog medicines."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medicines ORDER BY brand_name ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows
