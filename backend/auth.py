"""
Authentication module for GenericSwap.
Supports Mobile Number Login with 6-digit SMS OTP confirmation.
"""

import time
import secrets
import re
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field

# In-memory storage for OTP verification requests and active sessions
# Key: sanitized mobile number -> Dict of OTP data
_OTP_STORE: Dict[str, Dict[str, Any]] = {}

# Key: session_token -> Dict of user session data
_SESSIONS: Dict[str, Dict[str, Any]] = {}

# Key: mobile_number -> User profile
_USERS: Dict[str, Dict[str, Any]] = {}

OTP_EXPIRY_SECONDS = 300  # 5 minutes
MAX_ATTEMPTS = 5


class SendOtpRequest(BaseModel):
    mobile_number: str = Field(..., description="10-digit mobile number, e.g. 9876543210 or +919876543210")
    user_name: Optional[str] = Field("Patient / Caregiver", description="Optional display name")


class VerifyOtpRequest(BaseModel):
    mobile_number: str = Field(..., description="Mobile number that received the 6-digit code")
    code: str = Field(..., description="6-digit verification code")


def sanitize_mobile(mobile: str) -> str:
    """Extract standard 10-digit national number from various formats."""
    digits = re.sub(r"\D", "", mobile)
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    elif digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    return digits


def generate_6digit_code() -> str:
    """Generate cryptographically secure 6-digit verification code."""
    return f"{secrets.randbelow(900000) + 100000}"


def send_otp(mobile_number: str, user_name: str = "User") -> Dict[str, Any]:
    """
    Generate and register a 6-digit OTP for the provided mobile number.
    In demo / development mode, returns the code so the user can easily test it.
    """
    clean_mobile = sanitize_mobile(mobile_number)
    if len(clean_mobile) != 10:
        return {
            "success": False,
            "message": "Please enter a valid 10-digit mobile number (e.g. 9876543210)."
        }

    code = generate_6digit_code()
    now = time.time()

    _OTP_STORE[clean_mobile] = {
        "code": code,
        "created_at": now,
        "expires_at": now + OTP_EXPIRY_SECONDS,
        "attempts": 0,
        "user_name": user_name or "Patient / Caregiver"
    }

    # Simulate SMS dispatch
    masked_mobile = f"+91 {clean_mobile[:2]}******{clean_mobile[-2:]}"
    return {
        "success": True,
        "mobile_number": clean_mobile,
        "masked_mobile": masked_mobile,
        "expires_in_seconds": OTP_EXPIRY_SECONDS,
        "message": f"6-digit verification code sent to {masked_mobile}.",
        "demo_code": code  # Provided for frictionless testing and demo preview
    }


def verify_otp(mobile_number: str, code: str) -> Dict[str, Any]:
    """
    Validate the 6-digit confirmation code against active OTP store.
    """
    clean_mobile = sanitize_mobile(mobile_number)
    clean_code = str(code).strip()

    otp_record = _OTP_STORE.get(clean_mobile)
    if not otp_record:
        return {
            "success": False,
            "message": "No active verification code found for this mobile number. Please request a new code."
        }

    now = time.time()
    if now > otp_record["expires_at"]:
        _OTP_STORE.pop(clean_mobile, None)
        return {
            "success": False,
            "message": "The 6-digit verification code has expired. Please request a new code."
        }

    otp_record["attempts"] += 1
    if otp_record["attempts"] > MAX_ATTEMPTS:
        _OTP_STORE.pop(clean_mobile, None)
        return {
            "success": False,
            "message": "Too many incorrect attempts. Please request a new verification code."
        }

    if otp_record["code"] != clean_code:
        remaining = MAX_ATTEMPTS - otp_record["attempts"]
        return {
            "success": False,
            "message": f"Incorrect 6-digit code. {remaining} attempt(s) remaining."
        }

    # Successful verification! Create session and profile
    session_token = secrets.token_hex(24)
    user_name = otp_record.get("user_name", "Patient")

    if clean_mobile not in _USERS:
        _USERS[clean_mobile] = {
            "mobile_number": clean_mobile,
            "user_name": user_name,
            "created_at": now,
            "verified": True,
            "saved_prescriptions": [],
            "total_savings_inr": 0.0
        }
    else:
        _USERS[clean_mobile]["verified"] = True

    _SESSIONS[session_token] = {
        "mobile_number": clean_mobile,
        "created_at": now,
        "last_active": now
    }

    # Clean up used OTP
    _OTP_STORE.pop(clean_mobile, None)

    return {
        "success": True,
        "session_token": session_token,
        "mobile_number": clean_mobile,
        "user_name": _USERS[clean_mobile]["user_name"],
        "message": "Mobile number confirmed successfully! Welcome to GenericSwap."
    }


def get_user_by_session(session_token: str) -> Optional[Dict[str, Any]]:
    """Retrieve authenticated user profile from active session token."""
    session = _SESSIONS.get(session_token)
    if not session:
        return None
    session["last_active"] = time.time()
    return _USERS.get(session["mobile_number"])


def get_user_profile(mobile_number: str) -> Optional[Dict[str, Any]]:
    """Retrieve user profile directly by mobile number."""
    clean_mobile = sanitize_mobile(mobile_number)
    return _USERS.get(clean_mobile)
