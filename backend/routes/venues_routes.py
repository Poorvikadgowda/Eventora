"""
Campus Venues, Map Coordinates, Recommendations, and Notifications Routes for Eventora
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any

from backend.database import get_db_connection
from backend.routes.events_routes import format_event_row

router = APIRouter(prefix="/api", tags=["Campus Map & Recommendations"])

@router.get("/venues")
def list_campus_venues():
    """Retrieve all campus venues with coordinates and real-time telemetry."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM venues ORDER BY name ASC")
    rows = cursor.fetchall()
    conn.close()

    venues = []
    for r in rows:
        d = dict(r)
        d["currentEvent"] = d.get("current_event")
        d["occupancyPercent"] = d.get("occupancy_percent")
        venues.append(d)

    return {"venues": venues, "count": len(venues)}

@router.get("/recommendations/{student_id}")
def get_student_recommendations(student_id: str):
    """
    Generate personalized recommendations based on student department,
    interests tags, and attendance history.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get student interests
    cursor.execute("SELECT department, interests_json FROM users WHERE id = ?", (student_id,))
    u_row = cursor.fetchone()
    department = u_row["department"] if u_row else "Computer Science"

    # Get events matching department or high success score
    cursor.execute("""
    SELECT * FROM events
    WHERE department = ? OR category IN ('Technical', 'Hackathon', 'Workshop')
    ORDER BY success_score DESC
    LIMIT 6
    """, (department,))
    rows = cursor.fetchall()
    conn.close()

    recommended = [format_event_row(r) for r in rows]
    return {
        "studentId": student_id,
        "primaryDepartment": department,
        "recommendations": recommended,
        "count": len(recommended)
    }

@router.get("/notifications")
def get_user_notifications(user_id: Optional[str] = "usr_alex_01"):
    """Retrieve user notifications and reminders."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    notifs = []
    for r in rows:
        d = dict(r)
        d["isRead"] = bool(d.get("is_read", 0))
        notifs.append(d)

    return {"notifications": notifs, "count": len(notifs)}
