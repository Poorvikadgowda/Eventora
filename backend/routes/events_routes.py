"""
Event Management API Routes for Eventora
Handles event creation, updating, listing, filtering, and student registration.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List, Dict, Any
import json
import uuid

from backend.database import get_db_connection
from backend.schemas.eventora_schemas import (
    EventCreateRequest, EventUpdateRequest, RegistrationRequest
)
from backend.services.event_email_service import send_registration_confirmation_email

router = APIRouter(prefix="/api/events", tags=["Events"])

def format_event_row(row: Any) -> Dict[str, Any]:
    """Helper to deserialize JSON columns into clean dictionary."""
    ev = dict(row)
    ev["speakers"] = json.loads(ev.get("speakers_json") or "[]")
    ev["agenda"] = json.loads(ev.get("agenda_json") or "[]")
    ev["features"] = json.loads(ev.get("features_json") or "{}")
    ev["certificateTypes"] = json.loads(ev.get("certificate_types_json") or '["participation"]')
    ev["isLive"] = bool(ev.get("is_live", 0))
    ev["registeredCount"] = ev.get("registered_count", 0)
    ev["attendanceCount"] = ev.get("attendance_count", 0)
    ev["startTime"] = ev.get("start_time", "")
    ev["endTime"] = ev.get("end_time", "")
    ev["displayDate"] = ev.get("display_date", ev.get("date", ""))
    ev["successScore"] = ev.get("success_score", 90.0)
    ev["matchReason"] = ev.get("match_reason", "")
    return ev

@router.get("")
def list_events(
    category: Optional[str] = None,
    status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    live_only: Optional[bool] = False
):
    """Retrieve filtered list of events."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM events WHERE 1=1"
    params = []

    if category and category != "All":
        query += " AND category = ?"
        params.append(category)
    if status:
        query += " AND status = ?"
        params.append(status)
    if department and department != "All":
        query += " AND department = ?"
        params.append(department)
    if live_only:
        query += " AND is_live = 1"
    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR venue LIKE ? OR organizer LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s, s])

    query += " ORDER BY date ASC, start_time ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    events = [format_event_row(r) for r in rows]
    return {"events": events, "total": len(events)}

@router.get("/{event_id}")
def get_event(event_id: str):
    """Retrieve full details of an event by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")
        
    ev = format_event_row(row)
    
    # Also fetch recent registered attendee count
    cursor.execute("SELECT COUNT(*) FROM registrations WHERE event_id = ?", (event_id,))
    reg_count = cursor.fetchone()[0]
    ev["registeredCount"] = reg_count
    
    conn.close()
    return ev

@router.post("", status_code=201)
def create_event(req: EventCreateRequest):
    """Create a new event."""
    conn = get_db_connection()
    cursor = conn.cursor()

    new_id = f"evt_{uuid.uuid4().hex[:8]}"
    default_img = req.image or "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000"

    cursor.execute("""
    INSERT INTO events (
        id, title, description, category, date, display_date, start_time, end_time,
        venue, building, organizer, capacity, registered_count, attendance_count,
        status, is_live, price, department, image, speakers_json, agenda_json,
        features_json, certificate_types_json, success_score, match_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id,
        req.title,
        req.description,
        req.category,
        req.date,
        req.date,
        req.startTime,
        req.endTime,
        req.venue,
        req.building or "Tech Center",
        req.organizer,
        req.capacity,
        0, # registered
        0, # attended
        "Published",
        0,
        req.price or "Free",
        req.department or "General",
        default_img,
        json.dumps(req.speakers or []),
        json.dumps(req.agenda or []),
        json.dumps(req.features or {}),
        json.dumps(req.certificateTypes or ["participation"]),
        91.0,
        "New campus event announcement"
    ))
    conn.commit()

    cursor.execute("SELECT * FROM events WHERE id = ?", (new_id,))
    created = format_event_row(cursor.fetchone())
    conn.close()

    return {"message": "Event created successfully", "event": created}

@router.put("/{event_id}")
def update_event(event_id: str, req: EventUpdateRequest):
    """Update event properties."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM events WHERE id = ?", (event_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")

    updates = []
    params = []

    if req.title:
        updates.append("title = ?")
        params.append(req.title)
    if req.description:
        updates.append("description = ?")
        params.append(req.description)
    if req.category:
        updates.append("category = ?")
        params.append(req.category)
    if req.date:
        updates.append("date = ?")
        params.append(req.date)
    if req.startTime:
        updates.append("start_time = ?")
        params.append(req.startTime)
    if req.endTime:
        updates.append("end_time = ?")
        params.append(req.endTime)
    if req.venue:
        updates.append("venue = ?")
        params.append(req.venue)
    if req.building:
        updates.append("building = ?")
        params.append(req.building)
    if req.organizer:
        updates.append("organizer = ?")
        params.append(req.organizer)
    if req.capacity:
        updates.append("capacity = ?")
        params.append(req.capacity)
    if req.price is not None:
        updates.append("price = ?")
        params.append(req.price)
    if req.status:
        updates.append("status = ?")
        params.append(req.status)
    if req.isLive is not None:
        updates.append("is_live = ?")
        params.append(1 if req.isLive else 0)
    if req.image:
        updates.append("image = ?")
        params.append(req.image)
    if req.speakers is not None:
        updates.append("speakers_json = ?")
        params.append(json.dumps(req.speakers))
    if req.agenda is not None:
        updates.append("agenda_json = ?")
        params.append(json.dumps(req.agenda))
    if req.certificateTypes is not None:
        updates.append("certificate_types_json = ?")
        params.append(json.dumps(req.certificateTypes))

    if updates:
        params.append(event_id)
        cursor.execute(f"UPDATE events SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()

    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    updated = format_event_row(cursor.fetchone())
    conn.close()

    return {"message": "Event updated successfully", "event": updated}

@router.delete("/{event_id}")
def delete_event(event_id: str):
    """Delete an event and related attendance/registrations."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM registrations WHERE event_id = ?", (event_id,))
    cursor.execute("DELETE FROM attendance WHERE event_id = ?", (event_id,))
    cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()
    return {"message": "Event deleted successfully"}

# ================= REGISTRATION ENDPOINTS =================

@router.post("/{event_id}/register")
def register_for_event(
    event_id: str,
    student_id: Optional[str] = "usr_alex_01",
    student_email: Optional[str] = None,
    student_name: Optional[str] = None
):
    """Register student for an event and dispatch confirmation directly to email."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check event capacity
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    ev_row = cursor.fetchone()
    if not ev_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")
        
    capacity = ev_row["capacity"]
    registered_count = ev_row["registered_count"]
    
    if registered_count >= capacity:
        conn.close()
        raise HTTPException(status_code=400, detail="Event is sold out / at full capacity")

    # Check if already registered
    cursor.execute("SELECT id FROM registrations WHERE event_id = ? AND student_id = ?", (event_id, student_id))
    if cursor.fetchone():
        conn.close()
        return {"message": "Already registered for this event", "registered": True}

    reg_id = f"REG-2026-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO registrations (id, event_id, student_id, status)
    VALUES (?, ?, ?, 'confirmed')
    """, (reg_id, event_id, student_id))

    cursor.execute("""
    UPDATE events SET registered_count = registered_count + 1 WHERE id = ?
    """, (event_id,))

    cursor.execute("""
    UPDATE users SET registered_count = registered_count + 1 WHERE id = ?
    """, (student_id,))

    conn.commit()
    conn.close()

    # Dispatch confirmation email directly in background
    target_email = student_email or "student@eventora.edu"
    target_name = student_name or "Student"
    
    email_res = send_registration_confirmation_email(
        to_email=target_email,
        recipient_name=target_name,
        event_title=ev_row["title"],
        event_date=ev_row["display_date"] or ev_row["date"],
        event_time=ev_row["start_time"],
        venue=ev_row["venue"],
        building=ev_row["building"] or "Tech Center",
        registration_code=reg_id
    )

    return {
        "message": f"Registration confirmed! Confirmation email sent to {target_email}",
        "registrationId": reg_id,
        "registered": True,
        "emailSent": email_res.get("dispatched", True),
        "emailRecipient": target_email
    }

@router.post("/{event_id}/send-confirmation-email")
def send_event_confirmation_email(event_id: str, payload: Dict[str, Any]):
    """Dedicated background endpoint to send email confirmation directly to user's inbox."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    ev_row = cursor.fetchone()
    conn.close()

    target_email = payload.get("studentEmail") or payload.get("recipientEmail") or "student@eventora.edu"
    target_name = payload.get("studentName") or payload.get("recipientName") or "Student"
    event_title = payload.get("eventTitle") or (ev_row["title"] if ev_row else "Campus Event")
    event_date = payload.get("eventDate") or (ev_row["display_date"] if ev_row else "Upcoming")
    event_time = payload.get("eventTime") or (ev_row["start_time"] if ev_row else "09:00 AM")
    venue = payload.get("venue") or (ev_row["venue"] if ev_row else "Main Auditorium")
    building = payload.get("building") or (ev_row["building"] if ev_row else "Campus Hub")
    reg_code = payload.get("registrationCode") or f"REG-2026-{uuid.uuid4().hex[:6].upper()}"

    res = send_registration_confirmation_email(
        to_email=target_email,
        recipient_name=target_name,
        event_title=event_title,
        event_date=event_date,
        event_time=event_time,
        venue=venue,
        building=building,
        registration_code=reg_code
    )

    return res

@router.delete("/{event_id}/register")
def cancel_registration(event_id: str, student_id: Optional[str] = "usr_alex_01"):
    """Cancel a student registration."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM registrations WHERE event_id = ? AND student_id = ?", (event_id, student_id))
    if cursor.rowcount > 0:
        cursor.execute("UPDATE events SET registered_count = MAX(0, registered_count - 1) WHERE id = ?", (event_id,))
        cursor.execute("UPDATE users SET registered_count = MAX(0, registered_count - 1) WHERE id = ?", (student_id,))
        conn.commit()

    conn.close()
    return {"message": "Registration cancelled successfully", "registered": False}

@router.get("/{event_id}/registrations")
def get_event_registrations(event_id: str):
    """Retrieve all students registered for an event."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT r.id as registration_id, r.registered_at, r.status,
           u.id as user_id, u.name, u.email, u.usn, u.department, u.avatar
    FROM registrations r
    JOIN users u ON r.student_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.registered_at DESC
    """, (event_id,))
    rows = cursor.fetchall()
    conn.close()

    registrations = [dict(r) for r in rows]
    return {"registrations": registrations, "count": len(registrations)}

@router.get("/{event_id}/participants")
def get_event_participants(event_id: str):
    """
    Retrieve real database records for all registered participants and their teams,
    including verified Dynamic QR check-in status.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT 
        r.id as registration_id,
        r.status as registration_status,
        r.team_name,
        r.project_title,
        r.registered_at,
        u.id as student_id,
        u.name,
        u.email,
        u.usn,
        u.department,
        u.avatar,
        a.id as attendance_id,
        a.status as attendance_status,
        a.verified as attendance_verified,
        a.method as attendance_method,
        a.time as checkin_time
    FROM registrations r
    JOIN users u ON r.student_id = u.id
    LEFT JOIN attendance a ON a.event_id = r.event_id AND a.student_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.team_name ASC, u.name ASC
    """, (event_id,))
    rows = cursor.fetchall()
    conn.close()

    participants = []
    for r in rows:
        participants.append({
            "registrationId": r["registration_id"],
            "studentId": r["student_id"],
            "name": r["name"],
            "email": r["email"],
            "usn": r["usn"] or "",
            "department": r["department"] or "General",
            "avatar": r["avatar"] or "",
            "teamName": r["team_name"] or None,
            "projectTitle": r["project_title"] or None,
            "registrationStatus": r["registration_status"],
            "attendanceStatus": r["attendance_status"] or "Not Checked In",
            "isAttendanceVerified": bool(r["attendance_verified"] == 1 if r["attendance_verified"] is not None else False),
            "attendanceMethod": r["attendance_method"] or None,
            "checkinTime": r["checkin_time"] or None,
        })

    return {"participants": participants, "total": len(participants)}

@router.get("/{event_id}/teams")
def get_event_teams(event_id: str):
    """Retrieve all competitive teams and member rosters registered for an event."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. First get teams from teams table
    cursor.execute("SELECT * FROM teams WHERE event_id = ? ORDER BY name ASC", (event_id,))
    team_rows = cursor.fetchall()

    teams_map = {}
    for tr in team_rows:
        members_ids = json.loads(tr["members_json"] or "[]")
        teams_map[tr["name"]] = {
            "id": tr["id"],
            "eventId": event_id,
            "name": tr["name"],
            "projectTitle": tr["project_title"],
            "memberIds": members_ids,
            "members": [],
            "createdAt": tr["created_at"],
        }

    # 2. Also look at registrations grouped by team_name
    cursor.execute("""
    SELECT 
        r.team_name,
        r.project_title,
        u.id as student_id,
        u.name,
        u.email,
        u.usn,
        u.department,
        a.verified as attendance_verified
    FROM registrations r
    JOIN users u ON r.student_id = u.id
    LEFT JOIN attendance a ON a.event_id = r.event_id AND a.student_id = u.id
    WHERE r.event_id = ? AND r.team_name IS NOT NULL AND TRIM(r.team_name) != ''
    ORDER BY r.team_name ASC, u.name ASC
    """, (event_id,))
    reg_rows = cursor.fetchall()

    for rr in reg_rows:
        tname = rr["team_name"]
        if tname not in teams_map:
            teams_map[tname] = {
                "id": f"team_{uuid.uuid4().hex[:8]}",
                "eventId": event_id,
                "name": tname,
                "projectTitle": rr["project_title"] or "",
                "memberIds": [],
                "members": [],
                "createdAt": None,
            }
        
        member_obj = {
            "id": rr["student_id"],
            "name": rr["name"],
            "email": rr["email"],
            "usn": rr["usn"] or "",
            "department": rr["department"] or "",
            "isAttendanceVerified": bool(rr["attendance_verified"] == 1 if rr["attendance_verified"] is not None else False),
        }
        if rr["student_id"] not in teams_map[tname]["memberIds"]:
            teams_map[tname]["memberIds"].append(rr["student_id"])
        
        # Avoid duplicate member records
        if not any(m["id"] == rr["student_id"] for m in teams_map[tname]["members"]):
            teams_map[tname]["members"].append(member_obj)
        if not teams_map[tname]["projectTitle"] and rr["project_title"]:
            teams_map[tname]["projectTitle"] = rr["project_title"]

    conn.close()
    team_list = list(teams_map.values())
    return {"teams": team_list, "total": len(team_list)}

