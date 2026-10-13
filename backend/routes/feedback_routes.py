"""
5-Criterion Feedback & Sentiment Analytics Routes for Eventora
Evaluates Organization, Content, Speaker, Venue, and Overall Value.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
import uuid

from backend.database import get_db_connection
from backend.schemas.eventora_schemas import FeedbackSubmitRequest

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

def analyze_sentiment(comment: str, rating: int) -> str:
    """Lightweight sentiment classification based on keywords and ratings."""
    if not comment:
        return "Positive" if rating >= 4 else ("Neutral" if rating == 3 else "Negative")
    
    text = comment.lower()
    positive_words = ["great", "excellent", "best", "unbelievable", "amazing", "insightful", "helpful", "perfect", "loved"]
    negative_words = ["bad", "poor", "boring", "slow", "delay", "worst", "terrible", "confusing", "crowded"]

    pos_score = sum(1 for w in positive_words if w in text)
    neg_score = sum(1 for w in negative_words if w in text)

    if pos_score > neg_score or rating >= 4:
        return "Positive"
    elif neg_score > pos_score or rating <= 2:
        return "Negative"
    return "Neutral"

@router.post("", status_code=201)
def submit_feedback(req: FeedbackSubmitRequest):
    """Submit 5-criterion feedback rubric review for an event."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT title FROM events WHERE id = ?", (req.eventId,))
    ev = cursor.fetchone()
    if not ev:
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")
        
    event_title = ev["title"]

    student_id = req.studentId or "usr_alex_01"
    cursor.execute("SELECT name, avatar FROM users WHERE id = ?", (student_id,))
    u = cursor.fetchone()
    student_name = u["name"] if u else "Alexander Wright"
    student_avatar = u["avatar"] if u else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"

    sentiment = analyze_sentiment(req.comment or "", req.overallRating)
    fb_id = f"fb_{uuid.uuid4().hex[:8]}"

    cursor.execute("""
    INSERT INTO feedback (
        id, event_id, event_name, student_id, student_name, student_avatar,
        organization_rating, speaker_rating, venue_rating, content_rating,
        overall_rating, comment, sentiment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        fb_id,
        req.eventId,
        event_title,
        student_id,
        student_name,
        student_avatar,
        req.organizationRating,
        req.speakerRating,
        req.venueRating,
        req.contentRating,
        req.overallRating,
        req.comment or "",
        sentiment
    ))
    conn.commit()

    cursor.execute("SELECT * FROM feedback WHERE id = ?", (fb_id,))
    created = dict(cursor.fetchone())
    conn.close()

    return {"message": "Thank you! Your feedback has been recorded.", "feedback": created}

@router.get("/event/{event_id}")
def get_event_feedback(event_id: str):
    """Retrieve all feedback reviews and aggregated criteria averages for an event."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM feedback WHERE event_id = ? ORDER BY created_at DESC", (event_id,))
    rows = cursor.fetchall()
    reviews = [dict(r) for r in rows]

    # Calculate rubric averages
    if reviews:
        avg_org = round(sum(r["organization_rating"] for r in reviews) / len(reviews), 2)
        avg_speaker = round(sum(r["speaker_rating"] for r in reviews) / len(reviews), 2)
        avg_venue = round(sum(r["venue_rating"] for r in reviews) / len(reviews), 2)
        avg_content = round(sum(r["content_rating"] for r in reviews) / len(reviews), 2)
        avg_overall = round(sum(r["overall_rating"] for r in reviews) / len(reviews), 2)
    else:
        avg_org = avg_speaker = avg_venue = avg_content = avg_overall = 5.0

    conn.close()

    return {
        "eventId": event_id,
        "count": len(reviews),
        "averages": {
            "organization": avg_org,
            "speaker": avg_speaker,
            "venue": avg_venue,
            "content": avg_content,
            "overall": avg_overall
        },
        "reviews": reviews
    }

@router.get("/analytics")
def get_feedback_analytics():
    """Platform-wide rubric analytics and sentiment distribution."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM feedback")
    reviews = [dict(r) for r in cursor.fetchall()]
    conn.close()

    total = max(1, len(reviews))
    positives = sum(1 for r in reviews if r["sentiment"] == "Positive")
    neutrals = sum(1 for r in reviews if r["sentiment"] == "Neutral")
    negatives = sum(1 for r in reviews if r["sentiment"] == "Negative")

    avg_rating = round(sum(r["overall_rating"] for r in reviews) / total, 2) if reviews else 4.8

    return {
        "totalReviews": len(reviews),
        "averageRating": avg_rating,
        "sentimentDistribution": {
            "positive": round((positives / total) * 100, 1),
            "neutral": round((neutrals / total) * 100, 1),
            "negative": round((negatives / total) * 100, 1)
        },
        "rubricBreakdown": {
            "organization": round(sum(r["organization_rating"] for r in reviews) / total, 2) if reviews else 4.8,
            "contentQuality": round(sum(r["content_rating"] for r in reviews) / total, 2) if reviews else 4.9,
            "speakerEffectiveness": round(sum(r["speaker_rating"] for r in reviews) / total, 2) if reviews else 4.7,
            "venueAndLogistics": round(sum(r["venue_rating"] for r in reviews) / total, 2) if reviews else 4.6
        }
    }
