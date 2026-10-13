"""
Eventora - System Settings API Routes
Dual-layer system settings persistence (SQLite + Supabase parity)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import time

from backend.database import get_db_connection

router = APIRouter(prefix="/api/settings", tags=["System Settings"])

DEFAULT_SETTINGS = {
    "attendance_shortage_threshold": 75,
    "qr_rotation_interval": 15,
    "allow_manual_attendance": True,
    "require_geolocation": False,
    "campus_name": "Dr. Ambedkar Institute of Technology (Dr. AIT)",
    "academic_term": "Fall Semester 2024–2025",
    "default_department": "Computer Science & Engineering",
    "email_dispatch_enabled": True,
    "inapp_alerts_enabled": True,
    "cert_auto_issue_enabled": True,
    "cert_min_attendance": 75
}

class SettingsUpdateRequest(BaseModel):
    attendance_shortage_threshold: Optional[int] = None
    qr_rotation_interval: Optional[int] = None
    allow_manual_attendance: Optional[bool] = None
    require_geolocation: Optional[bool] = None
    campus_name: Optional[str] = None
    academic_term: Optional[str] = None
    default_department: Optional[str] = None
    email_dispatch_enabled: Optional[bool] = None
    inapp_alerts_enabled: Optional[bool] = None
    cert_auto_issue_enabled: Optional[bool] = None
    cert_min_attendance: Optional[int] = None

@router.get("")
def get_system_settings():
    """Retrieve all current system settings."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value_json FROM system_settings")
    rows = cursor.fetchall()
    conn.close()

    settings = dict(DEFAULT_SETTINGS)
    for r in rows:
        key = r["key"]
        try:
            val = json.loads(r["value_json"])
            settings[key] = val
        except Exception:
            settings[key] = r["value_json"]

    return {
        "status": "success",
        "settings": settings,
        "timestamp": int(time.time())
    }

@router.post("")
def update_system_settings(req: SettingsUpdateRequest):
    """Update system settings with provided values."""
    data = req.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No settings provided to update")

    conn = get_db_connection()
    cursor = conn.cursor()

    for key, value in data.items():
        val_json = json.dumps(value)
        cursor.execute("""
            INSERT INTO system_settings (key, value_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET
                value_json = excluded.value_json,
                updated_at = CURRENT_TIMESTAMP
        """, (key, val_json))

    conn.commit()
    conn.close()

    return get_system_settings()
