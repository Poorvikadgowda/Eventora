"""
Authentication & User Management Routes for Eventora
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List, Dict, Any
import json
import uuid
import hashlib

from backend.database import get_db_connection
from backend.schemas.eventora_schemas import (
    UserLoginRequest, UserRegisterRequest, UserProfileUpdateRequest,
    UserResponse, AuthTokenResponse
)
from backend.auth_utils import (
    hash_password, verify_password, create_access_token, decode_access_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Dependency to get authenticated user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (payload.get("user_id"),))
    user_row = cursor.fetchone()
    conn.close()
    
    if not user_row:
        return None
    
    user_dict = dict(user_row)
    user_dict["interests"] = json.loads(user_dict.get("interests_json") or "[]")
    return user_dict

@router.post("/login", response_model=AuthTokenResponse)
def login(creds: UserLoginRequest):
    """Authenticate user with email and password."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (creds.email.lower().strip(),))
    user = cursor.fetchone()
    conn.close()

    if not user:
        # Fallback demo auth convenience if testing
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_dict = dict(user)
    
    # Check password hash (or allow standard demo password)
    hashed = hashlib.sha256(creds.password.encode()).hexdigest()
    if user_dict["password_hash"] != hashed and creds.password != "demo123":
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_dict["interests"] = json.loads(user_dict.get("interests_json") or "[]")
    user_dict.pop("password_hash", None)

    token = create_access_token({
        "user_id": user_dict["id"],
        "email": user_dict["email"],
        "role": user_dict["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.post("/register", response_model=AuthTokenResponse)
def register(req: UserRegisterRequest):
    """Register a new student or organizer account."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if email exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email.lower().strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    pwd_hash = hashlib.sha256(req.password.encode()).hexdigest()
    interests_json = json.dumps(req.interests or ["Technology", "Campus Life"])

    cursor.execute("""
    INSERT INTO users (id, name, email, password_hash, role, usn, department, phone, interests_json, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        req.name.strip(),
        req.email.lower().strip(),
        pwd_hash,
        req.role or "student",
        req.usn or f"1MS24CS{user_id[-3:].upper()}",
        req.department or "Computer Science",
        req.phone or "+1 (555) 000-0000",
        interests_json,
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
    ))
    conn.commit()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    new_user = dict(cursor.fetchone())
    conn.close()

    new_user["interests"] = json.loads(new_user.get("interests_json") or "[]")
    new_user.pop("password_hash", None)

    token = create_access_token({
        "user_id": user_id,
        "email": new_user["email"],
        "role": new_user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.get("/me")
def get_current_user(current_user: Optional[Dict[str, Any]] = Depends(get_current_user_from_header)):
    """Return currently authenticated user details."""
    if not current_user:
        # Fallback to Alex Wright for seamless offline exploration
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = 'usr_alex_01'")
        row = cursor.fetchone()
        conn.close()
        if row:
            u = dict(row)
            u["interests"] = json.loads(u.get("interests_json") or "[]")
            u.pop("password_hash", None)
            return u
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user

@router.put("/profile")
def update_profile(
    updates: UserProfileUpdateRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_from_header)
):
    """Update profile details for the current user."""
    user_id = current_user["id"] if current_user else "usr_alex_01"
    conn = get_db_connection()
    cursor = conn.cursor()

    update_fields = []
    params = []

    if updates.name:
        update_fields.append("name = ?")
        params.append(updates.name)
    if updates.phone:
        update_fields.append("phone = ?")
        params.append(updates.phone)
    if updates.department:
        update_fields.append("department = ?")
        params.append(updates.department)
    if updates.interests is not None:
        update_fields.append("interests_json = ?")
        params.append(json.dumps(updates.interests))
    if updates.avatar:
        update_fields.append("avatar = ?")
        params.append(updates.avatar)

    if update_fields:
        params.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?", params)
        conn.commit()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    updated = dict(cursor.fetchone())
    conn.close()

    updated["interests"] = json.loads(updated.get("interests_json") or "[]")
    updated.pop("password_hash", None)
    return {"message": "Profile updated successfully", "user": updated}

@router.get("/users")
def get_all_users(role: Optional[str] = None, search: Optional[str] = None):
    """Admin endpoint to list and search platform users."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM users WHERE 1=1"
    params = []

    if role:
        query += " AND role = ?"
        params.append(role)
    if search:
        query += " AND (name LIKE ? OR email LIKE ? OR usn LIKE ? OR department LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s, s])

    query += " ORDER BY name ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    users = []
    for r in rows:
        d = dict(r)
        d["interests"] = json.loads(d.get("interests_json") or "[]")
        d.pop("password_hash", None)
        users.append(d)

    return {"users": users, "total": len(users)}


@router.post("/send-verification-email")
def dispatch_verification_email(payload: Dict[str, Any]):
    """Dispatch welcome and verification email to newly registered user."""
    from backend.services.event_email_service import send_account_verification_email

    email = payload.get("email")
    name = payload.get("name") or "User"
    role = payload.get("role") or "student"

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    return send_account_verification_email(
        to_email=email,
        recipient_name=name,
        role=role
    )

