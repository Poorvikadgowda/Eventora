"""
Dynamic Rotating QR Code & Anti-Fraud System Routes
15-Second rotating cryptographically salted HMAC tokens with single-use replay protection.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any
import time
import uuid

from backend.database import get_db_connection
from backend.schemas.eventora_schemas import (
    QRSessionStartRequest, QRValidateRequest
)
from backend.auth_utils import (
    generate_rotating_qr_token, validate_rotating_qr_token
)

router = APIRouter(prefix="/api/qr", tags=["Dynamic QR System"])

# In-memory active QR sessions store: event_id -> session_data
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}
USED_TOKENS: set = set()

@router.post("/session")
def start_qr_session(req: QRSessionStartRequest):
    """
    Start an automated rotating QR attendance session for an event.
    The session rotates valid cryptographic tokens every 15 seconds.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM events WHERE id = ?", (req.eventId,))
    ev = cursor.fetchone()
    conn.close()

    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    session_id = f"qrs_{uuid.uuid4().hex[:12]}"
    secret_salt = uuid.uuid4().hex[:8]

    session_data = {
        "sessionId": session_id,
        "eventId": req.eventId,
        "eventTitle": ev["title"],
        "secretSalt": secret_salt,
        "windowSeconds": req.windowSeconds or 15,
        "startedAt": int(time.time()),
        "active": True
    }
    ACTIVE_SESSIONS[req.eventId] = session_data

    # Generate first token
    token_info = generate_rotating_qr_token(req.eventId, secret_salt, session_data["windowSeconds"])

    return {
        "message": "Dynamic QR session initiated",
        "sessionId": session_id,
        "eventId": req.eventId,
        "token": token_info["token"],
        "remainingSeconds": token_info["remaining_seconds"],
        "window": token_info["window"],
        "qrPayload": token_info["qr_payload"],
        "windowSeconds": session_data["windowSeconds"]
    }

@router.get("/token/{event_id}")
def get_current_qr_token(event_id: str):
    """
    Retrieve currently valid dynamic QR token for an active session.
    Calculated in real-time based on the 15-second timestamp epoch.
    """
    session = ACTIVE_SESSIONS.get(event_id)
    secret_salt = session["secretSalt"] if session else f"evt_salt_{event_id}"
    window_sec = session["windowSeconds"] if session else 15

    token_info = generate_rotating_qr_token(event_id, secret_salt, window_sec)
    return {
        "eventId": event_id,
        "token": token_info["token"],
        "remainingSeconds": token_info["remaining_seconds"],
        "window": token_info["window"],
        "qrPayload": token_info["qr_payload"],
        "windowSeconds": window_sec,
        "sessionActive": session is not None and session.get("active", False)
    }

@router.post("/validate")
def validate_qr_token(req: QRValidateRequest):
    """
    Validate a scanned QR code token against anti-fraud rules:
    1. Checks HMAC signature within ±1 rotation window (15s).
    2. Enforces single-use replay protection.
    3. Logs fraud audit trail on violations.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify event exists
    cursor.execute("SELECT id, title FROM events WHERE id = ?", (req.eventId,))
    ev = cursor.fetchone()
    if not ev:
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")
        
    event_title = ev["title"]

    session = ACTIVE_SESSIONS.get(req.eventId)
    secret_salt = session["secretSalt"] if session else f"evt_salt_{req.eventId}"
    window_sec = session["windowSeconds"] if session else 15

    # Check for replay attack
    token_key = f"{req.eventId}:{req.token}"
    if token_key in USED_TOKENS:
        # Replay attack detected
        log_id = f"log_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO anti_fraud_logs (id, event_id, student, usn, timestamp, result, reason, ip, device_info)
        VALUES (?, ?, ?, ?, time('now'), 'Rejected', 'Replay attack: Token already redeemed', '127.0.0.1', ?)
        """, (log_id, req.eventId, "Attended Device", "N/A", req.deviceInfo or "Web Scanner"))
        conn.commit()
        conn.close()
        return {
            "valid": False,
            "error": "Replay Detected",
            "message": "This QR token has already been scanned and redeemed. Dynamic QR codes are single-use."
        }

    # Validate cryptographic HMAC time-window
    val_result = validate_rotating_qr_token(req.eventId, req.token, secret_salt, window_sec)

    if not val_result["valid"]:
        # Log expired or spoofed token
        log_id = f"log_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO anti_fraud_logs (id, event_id, student, usn, timestamp, result, reason, ip, device_info)
        VALUES (?, ?, ?, ?, time('now'), 'Fraud Attempt', ?, '127.0.0.1', ?)
        """, (log_id, req.eventId, "Unknown Device", "N/A", val_result["reason"], req.deviceInfo or "Web Scanner"))
        conn.commit()
        conn.close()
        return {
            "valid": False,
            "error": "Token Expired or Invalid",
            "message": val_result["reason"]
        }

    # Mark token as used for replay prevention
    USED_TOKENS.add(token_key)

    # Valid scan - log successful audit
    log_id = f"log_{uuid.uuid4().hex[:8]}"
    student_id = req.studentId or "usr_alex_01"
    cursor.execute("SELECT name, usn FROM users WHERE id = ?", (student_id,))
    u_row = cursor.fetchone()
    student_name = u_row["name"] if u_row else "Alexander Wright"
    student_usn = u_row["usn"] if u_row else "1MS22CS042"

    cursor.execute("""
    INSERT INTO anti_fraud_logs (id, event_id, student, usn, timestamp, result, reason, ip, device_info)
    VALUES (?, ?, ?, ?, time('now'), 'Valid', 'Token authenticated within 15s window', '127.0.0.1', ?)
    """, (log_id, req.eventId, student_name, student_usn, req.deviceInfo or "Web Scanner"))

    # Record attendance
    att_id = f"att_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO attendance (id, student_id, student_name, usn, event_id, event_name, date, time, status, method, verified)
    VALUES (?, ?, ?, ?, ?, ?, date('now'), time('now'), 'Present', 'Dynamic QR', 1)
    """, (att_id, student_id, student_name, student_usn, req.eventId, event_title))

    # Increment event attendance count
    cursor.execute("UPDATE events SET attendance_count = attendance_count + 1 WHERE id = ?", (req.eventId,))
    cursor.execute("UPDATE users SET attended_count = attended_count + 1 WHERE id = ?", (student_id,))

    conn.commit()
    conn.close()

    return {
        "valid": True,
        "message": "Attendance verified successfully! Dynamic QR authenticated.",
        "student": student_name,
        "usn": student_usn,
        "event": event_title,
        "attendanceId": att_id
    }

@router.post("/end-session")
def end_qr_session(req: QRSessionStartRequest):
    """Terminate an active dynamic QR attendance session."""
    if req.eventId in ACTIVE_SESSIONS:
        ACTIVE_SESSIONS.pop(req.eventId)
    return {"message": "Dynamic QR session closed successfully", "eventId": req.eventId}
