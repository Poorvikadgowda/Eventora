"""
Eventora Authentication & Cryptographic Utilities
Provides zero-dependency HMAC-SHA256 token signing, PBKDF2 password hashing,
and 15-second dynamic rotating QR token generation.
"""

import hmac
import hashlib
import time
import json
import base64
from typing import Optional, Dict, Any

SECRET_KEY = "eventora-super-secure-cryptographic-jwt-secret-key-2026"

def hash_password(password: str, salt: str = "eventora_salt_2026") -> str:
    """Hash a password using PBKDF2 HMAC SHA-256."""
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex()

def verify_password(plain_password: str, hashed_password: str, salt: str = "eventora_salt_2026") -> bool:
    """Verify password against hashed hex."""
    return hash_password(plain_password, salt) == hashed_password

def create_access_token(data: dict, expires_in_seconds: int = 86400) -> str:
    """Generate a lightweight cryptographically signed token."""
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in_seconds
    payload_json = json.dumps(payload, separators=(',', ':'), sort_keys=True)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode().rstrip("=")
    signature = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode cryptographic token."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, signature = parts
        expected_sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        # Add padding back if necessary
        padded_b64 = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded_b64.encode()).decode())
        if payload.get("exp", 0) < int(time.time()):
            return None # Expired
        return payload
    except Exception:
        return None

def generate_rotating_qr_token(event_id: str, secret_salt: str = "evt_salt", window_seconds: int = 15) -> Dict[str, Any]:
    """
    Generate an anti-fraud dynamic rotating QR code token.
    Rotates every `window_seconds` (default 15s).
    Returns token, time_window, remaining_seconds, and payload string.
    """
    current_time = time.time()
    time_window = int(current_time // window_seconds)
    expires_at = (time_window + 1) * window_seconds
    remaining_seconds = max(0, int(expires_at - current_time))
    
    # Compute HMAC signature for this specific time window
    message = f"{event_id}:{time_window}:{secret_salt}"
    token_sig = hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).hexdigest()[:16].upper()
    
    code = f"EVT-{event_id[:6].upper()}-{token_sig}"
    qr_payload = json.dumps({
        "type": "EVENTORA_DYNAMIC_QR",
        "eventId": event_id,
        "token": code,
        "window": time_window,
        "expiresAt": expires_at,
        "v": 1
    })
    
    return {
        "event_id": event_id,
        "token": code,
        "window": time_window,
        "remaining_seconds": remaining_seconds,
        "qr_payload": qr_payload,
        "expires_at": expires_at
    }

def validate_rotating_qr_token(event_id: str, token: str, secret_salt: str = "evt_salt", window_seconds: int = 15) -> Dict[str, Any]:
    """
    Validate a dynamic rotating token allowing current window and immediately previous window (±1 window)
    to accommodate scanner network latency.
    """
    current_time = time.time()
    current_window = int(current_time // window_seconds)
    
    for w in [current_window, current_window - 1]:
        message = f"{event_id}:{w}:{secret_salt}"
        expected_sig = hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).hexdigest()[:16].upper()
        expected_code = f"EVT-{event_id[:6].upper()}-{expected_sig}"
        if token == expected_code:
            return {
                "valid": True,
                "window": w,
                "latency_tolerated": (w != current_window),
                "reason": "Token authenticated within valid time window"
            }
            
    return {
        "valid": False,
        "window": current_window,
        "latency_tolerated": False,
        "reason": "Expired token rotation or invalid cryptographic HMAC signature"
    }

def generate_certificate_hash(cert_id: str, student_id: str, event_id: str) -> str:
    """Generate SHA256 cryptographic verification digest for certificate."""
    raw = f"{cert_id}:{student_id}:{event_id}:{SECRET_KEY}"
    return hashlib.sha256(raw.encode()).hexdigest()
