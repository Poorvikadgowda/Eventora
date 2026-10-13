"""
Cryptographic Certificate Studio, Multi-Type Generation & Verification Routes for Eventora
Issues tamper-evident digital credentials with ReportLab landscape A4 PDFs,
SHA-256 cryptographic hashes, Supabase Storage integration, and public URL verification.
Supports Participation, Winner (1st, 2nd, 3rd, custom categories, individual & team),
and Achievement / Special Awards, while respecting 'No Certificate' configurations.
"""

from fastapi import APIRouter, HTTPException, Query, Response, status
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import datetime
import json
import io
from pathlib import Path
import httpx

from backend.database import get_db_connection
from backend.auth_utils import generate_certificate_hash
from backend.services.pdf_certificate_service import (
    generate_landscape_a4_pdf,
    upload_pdf_to_storage,
    STORAGE_DIR,
)
from backend.supabase_service import SUPABASE_URL, SUPABASE_KEY, get_headers

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])


# ================= DATA SCHEMAS =================

class TemplateConfigModel(BaseModel):
    title: str = "Certificate of Excellence"
    subtitle: str = "This is proudly presented to"
    eventName: str = "Campus Event"
    description: Optional[str] = None
    issueDate: str = datetime.date.today().strftime("%B %d, %Y")
    issuerName: str = "Dr. Eleanor Vance"
    issuerTitle: str = "Chief Academic Officer"
    coIssuerName: str = "Marcus Sterling"
    coIssuerTitle: str = "Event Director"
    logoType: str = "eventora"
    certificateType: Optional[str] = "Participation"
    awardTitle: Optional[str] = None
    rank: Optional[int] = None
    teamName: Optional[str] = None


class EligibilityRulesModel(BaseModel):
    requireRegistration: bool = True
    requireDynamicQR: bool = True
    requireApproval: bool = True


class BatchGenerateRequest(BaseModel):
    eventId: str
    templateConfig: TemplateConfigModel
    eligibilityRules: Optional[EligibilityRulesModel] = None
    approvedStudentIds: Optional[List[str]] = None
    certificateType: Optional[str] = "all"  # "all", "participation", "winner", "achievement", "results"


class RevokeCertificateRequest(BaseModel):
    certificateId: str
    reason: Optional[str] = "Administrative policy audit"
    actor: Optional[str] = "Academic Authority"


class ReissueCertificateRequest(BaseModel):
    certificateId: str
    actor: Optional[str] = "Academic Authority"


class EventResultCreateRequest(BaseModel):
    awardCategory: str  # "winner", "achievement"
    awardTitle: str     # "1st Place", "2nd Place", "Best Innovation", etc.
    rank: Optional[int] = None
    isTeam: bool = False
    teamName: Optional[str] = None
    studentIds: List[str]
    studentNames: Optional[List[str]] = None
    projectTitle: Optional[str] = None
    score: Optional[float] = 0.0
    judgeNotes: Optional[str] = None
    status: Optional[str] = "draft"  # "draft", "pending_approval", "approved"
    approvedBy: Optional[str] = None


class EventResultUpdateRequest(BaseModel):
    awardCategory: Optional[str] = None
    awardTitle: Optional[str] = None
    rank: Optional[int] = None
    isTeam: Optional[bool] = None
    teamName: Optional[str] = None
    studentIds: Optional[List[str]] = None
    studentNames: Optional[List[str]] = None
    projectTitle: Optional[str] = None
    score: Optional[float] = None
    judgeNotes: Optional[str] = None
    status: Optional[str] = None
    editorName: Optional[str] = "Academic Organizer"
    editReason: Optional[str] = "Result adjustment"


class EventResultApproveRequest(BaseModel):
    approvedBy: Optional[str] = "Dr. Eleanor Vance (Chief Academic Officer)"
    approvalNotes: Optional[str] = None


class BulkApproveRequest(BaseModel):
    approvedBy: Optional[str] = "Dr. Eleanor Vance (Chief Academic Officer)"
    approvalNotes: Optional[str] = None


class CsvImportValidateRequest(BaseModel):
    csvText: Optional[str] = None
    rows: Optional[List[Dict[str, Any]]] = None


class BulkSaveResultsRequest(BaseModel):
    results: List[EventResultCreateRequest]
    initialStatus: Optional[str] = "draft"


class ConfigureCertificateTypesRequest(BaseModel):
    certificateTypes: List[str]


# ================= COMPETITION RESULTS MANAGEMENT =================

@router.get("/events/{event_id}/results")
def get_event_results(event_id: str):
    """Retrieve all competition results, judge scores, and audit trails for an event."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM event_results WHERE event_id = ? ORDER BY rank ASC, score DESC, created_at ASC",
        (event_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        d = dict(r)
        d["studentIds"] = json.loads(d.get("student_ids_json") or "[]")
        d["studentNames"] = json.loads(d.get("student_names_json") or "[]")
        d["isTeam"] = bool(d.get("is_team", 0))
        d["teamName"] = d.get("team_name")
        d["awardCategory"] = d.get("award_category")
        d["awardTitle"] = d.get("award_title")
        d["projectTitle"] = d.get("project_title")
        d["score"] = float(d.get("score") or 0.0)
        d["judgeNotes"] = d.get("judge_notes")
        d["status"] = d.get("status") or "draft"
        d["approvedBy"] = d.get("approved_by")
        d["approvedAt"] = d.get("approved_at")
        d["auditTrail"] = json.loads(d.get("audit_trail_json") or "[]")
        results.append(d)
    return {"results": results, "total": len(results)}


@router.post("/events/{event_id}/results", status_code=status.HTTP_201_CREATED)
def create_event_result(event_id: str, req: EventResultCreateRequest):
    """Record an individual or team competition outcome with verified score, rank, and audit record."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, title FROM events WHERE id = ?", (event_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")

    result_id = f"res_{uuid.uuid4().hex[:8]}"
    student_ids = req.studentIds or []
    student_names = req.studentNames or []

    # Auto-resolve names from users if omitted
    if not student_names and student_ids:
        resolved = []
        for sid in student_ids:
            cursor.execute("SELECT name FROM users WHERE id = ?", (sid,))
            u = cursor.fetchone()
            resolved.append(u["name"] if u else sid)
        student_names = resolved

    now_iso = datetime.datetime.now().isoformat()
    init_status = req.status or "draft"
    is_approved = init_status == "approved"
    approved_at = now_iso if is_approved else None

    # Initial audit log entry
    audit_entry = {
        "timestamp": now_iso,
        "actor": req.approvedBy if is_approved else "Organizer",
        "action": "created_and_approved" if is_approved else "created_as_draft",
        "score": req.score or 0.0,
        "rank": req.rank,
        "award": req.awardTitle,
        "notes": req.judgeNotes or "Initial result registration"
    }

    cursor.execute("""
    INSERT INTO event_results (
        id, event_id, award_category, award_title, rank, is_team, team_name,
        student_ids_json, student_names_json, project_title, score, judge_notes,
        status, approved_by, approved_at, audit_trail_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result_id,
        event_id,
        req.awardCategory.lower(),
        req.awardTitle,
        req.rank,
        1 if req.isTeam else 0,
        req.teamName,
        json.dumps(student_ids),
        json.dumps(student_names),
        req.projectTitle,
        req.score or 0.0,
        req.judgeNotes,
        init_status,
        req.approvedBy if is_approved else None,
        approved_at,
        json.dumps([audit_entry]),
    ))
    conn.commit()
    conn.close()

    return {
        "message": "Competition result recorded successfully",
        "resultId": result_id,
        "result": {
            "id": result_id,
            "eventId": event_id,
            "awardCategory": req.awardCategory.lower(),
            "awardTitle": req.awardTitle,
            "rank": req.rank,
            "isTeam": req.isTeam,
            "teamName": req.teamName,
            "studentIds": student_ids,
            "studentNames": student_names,
            "projectTitle": req.projectTitle,
            "score": req.score or 0.0,
            "judgeNotes": req.judgeNotes,
            "status": init_status,
            "approvedBy": req.approvedBy if is_approved else None,
            "approvedAt": approved_at,
            "auditTrail": [audit_entry],
        }
    }


@router.put("/results/{result_id}")
def update_event_result(result_id: str, req: EventResultUpdateRequest):
    """
    Update an existing competition result.
    ENFORCES REAPPROVAL: If the result was previously 'approved', modifying any score,
    rank, award title, or student roster automatically reverts status to 'reapproval_required'.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM event_results WHERE id = ?", (result_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Competition result not found")

    row = dict(existing)
    prev_status = row.get("status") or "draft"
    now_iso = datetime.datetime.now().isoformat()
    audit_trail = json.loads(row.get("audit_trail_json") or "[]")

    updates = []
    params = []
    critical_change_detected = False
    changes_desc = []

    if req.score is not None:
        old_val = row.get("score") or 0.0
        if float(req.score) != float(old_val):
            critical_change_detected = True
            changes_desc.append(f"Score changed from {old_val} to {req.score}")
        updates.append("score = ?")
        params.append(float(req.score))

    if req.rank is not None:
        if req.rank != row.get("rank"):
            critical_change_detected = True
            changes_desc.append(f"Rank changed from {row.get('rank')} to {req.rank}")
        updates.append("rank = ?")
        params.append(req.rank)

    if req.awardCategory is not None:
        updates.append("award_category = ?")
        params.append(req.awardCategory.lower())

    if req.awardTitle is not None:
        if req.awardTitle != row.get("award_title"):
            critical_change_detected = True
            changes_desc.append(f"Award Title changed to '{req.awardTitle}'")
        updates.append("award_title = ?")
        params.append(req.awardTitle)

    if req.isTeam is not None:
        updates.append("is_team = ?")
        params.append(1 if req.isTeam else 0)

    if req.teamName is not None:
        updates.append("team_name = ?")
        params.append(req.teamName)

    if req.projectTitle is not None:
        updates.append("project_title = ?")
        params.append(req.projectTitle)

    if req.judgeNotes is not None:
        updates.append("judge_notes = ?")
        params.append(req.judgeNotes)

    if req.studentIds is not None:
        old_sids = json.loads(row.get("student_ids_json") or "[]")
        if sorted(old_sids) != sorted(req.studentIds):
            critical_change_detected = True
            changes_desc.append(f"Student roster updated ({len(req.studentIds)} members)")
        updates.append("student_ids_json = ?")
        params.append(json.dumps(req.studentIds))

        # Update student names
        student_names = req.studentNames or []
        if not student_names:
            resolved = []
            for sid in req.studentIds:
                cursor.execute("SELECT name FROM users WHERE id = ?", (sid,))
                u = cursor.fetchone()
                resolved.append(u["name"] if u else sid)
            student_names = resolved
        updates.append("student_names_json = ?")
        params.append(json.dumps(student_names))

    # Reapproval rule: If was approved and critical data changed, revert to 'reapproval_required'
    new_status = prev_status
    if req.status:
        new_status = req.status
    elif prev_status == "approved" and critical_change_detected:
        new_status = "reapproval_required"

    updates.append("status = ?")
    params.append(new_status)

    # Log audit entry
    audit_trail.append({
        "timestamp": now_iso,
        "actor": req.editorName or "Academic Organizer",
        "action": "modified_requires_reapproval" if new_status == "reapproval_required" else "updated",
        "previousStatus": prev_status,
        "newStatus": new_status,
        "changes": changes_desc,
        "reason": req.editReason or "Result revision"
    })

    updates.append("audit_trail_json = ?")
    params.append(json.dumps(audit_trail))

    params.append(result_id)
    cursor.execute(f"UPDATE event_results SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()

    return {
        "message": "Competition result updated successfully",
        "resultId": result_id,
        "status": new_status,
        "reapprovalRequired": new_status == "reapproval_required",
        "changes": changes_desc,
    }


@router.put("/results/{result_id}/approve")
def approve_event_result(result_id: str, req: EventResultApproveRequest):
    """Approve or re-approve a competition outcome for official certificate issuance."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM event_results WHERE id = ?", (result_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Result not found")

    d = dict(row)
    now_iso = datetime.datetime.now().isoformat()
    audit_trail = json.loads(d.get("audit_trail_json") or "[]")
    was_reapproval = d.get("status") == "reapproval_required"

    audit_trail.append({
        "timestamp": now_iso,
        "actor": req.approvedBy or "Academic Director",
        "action": "reapproved" if was_reapproval else "approved",
        "notes": req.approvalNotes or ("Re-approved after outcome modifications" if was_reapproval else "Official outcome approved for certificate issuance")
    })

    cursor.execute(
        "UPDATE event_results SET status = 'approved', approved_by = ?, approved_at = ?, audit_trail_json = ? WHERE id = ?",
        (req.approvedBy or "Academic Director", now_iso, json.dumps(audit_trail), result_id)
    )
    conn.commit()
    conn.close()
    return {
        "message": f"Competition result {'re-approved' if was_reapproval else 'approved'} successfully",
        "resultId": result_id,
        "status": "approved"
    }


@router.post("/events/{event_id}/results/approve-all")
def approve_all_event_results(event_id: str, req: BulkApproveRequest):
    """Bulk approve all unapproved outcomes for an event in one atomic action."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, status, audit_trail_json FROM event_results WHERE event_id = ? AND status != 'approved'", (event_id,))
    unapproved = cursor.fetchall()
    now_iso = datetime.datetime.now().isoformat()
    approved_count = 0

    for r in unapproved:
        rid = r["id"]
        audit_trail = json.loads(r["audit_trail_json"] or "[]")
        audit_trail.append({
            "timestamp": now_iso,
            "actor": req.approvedBy or "Academic Director",
            "action": "bulk_approved",
            "notes": req.approvalNotes or "Bulk outcome approval by authorized organizer"
        })
        cursor.execute(
            "UPDATE event_results SET status = 'approved', approved_by = ?, approved_at = ?, audit_trail_json = ? WHERE id = ?",
            (req.approvedBy or "Academic Director", now_iso, json.dumps(audit_trail), rid)
        )
        approved_count += 1

    conn.commit()
    conn.close()
    return {
        "message": f"Successfully approved {approved_count} competition outcome(s)",
        "approvedCount": approved_count
    }


@router.post("/events/{event_id}/results/import-csv")
def validate_and_preview_csv(event_id: str, req: CsvImportValidateRequest):
    """
    Validate imported CSV result rows before committing to database.
    Checks student registration existence, scores (0-100), categories, and ranks.
    Returns preview summary with valid rows and flagged invalid errors.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Load all registered participants for matching
    cursor.execute("""
    SELECT r.student_id, u.name, u.email, u.usn, r.team_name, r.project_title
    FROM registrations r
    JOIN users u ON r.student_id = u.id
    WHERE r.event_id = ?
    """, (event_id,))
    reg_rows = cursor.fetchall()

    # Lookups by USN, email, name, team_name
    student_by_usn = {r["usn"].lower(): dict(r) for r in reg_rows if r["usn"]}
    student_by_email = {r["email"].lower(): dict(r) for r in reg_rows if r["email"]}
    student_by_name = {r["name"].lower(): dict(r) for r in reg_rows if r["name"]}
    students_by_team = {}
    for r in reg_rows:
        tname = r["team_name"]
        if tname:
            tname_lower = tname.lower().strip()
            students_by_team.setdefault(tname_lower, []).append(dict(r))

    raw_rows = req.rows or []
    if req.csvText:
        import csv
        reader = csv.DictReader(io.StringIO(req.csvText.strip()))
        raw_rows = [row for row in reader]

    valid_rows = []
    invalid_rows = []

    for idx, row in enumerate(raw_rows, start=1):
        errors = []
        rank_val = None
        score_val = 0.0

        # Rank validation
        raw_rank = str(row.get("rank") or row.get("Rank") or "").strip()
        if raw_rank:
            try:
                rank_val = int(raw_rank)
                if rank_val <= 0:
                    errors.append("Rank must be positive integer")
            except ValueError:
                errors.append(f"Invalid rank '{raw_rank}'")

        # Score validation
        raw_score = str(row.get("score") or row.get("Score") or "").strip()
        if raw_score:
            try:
                score_val = float(raw_score)
                if score_val < 0 or score_val > 100:
                    errors.append(f"Score must be between 0 and 100 (got {score_val})")
            except ValueError:
                errors.append(f"Score '{raw_score}' is not a valid number")

        # Award category validation
        cat = str(row.get("award_category") or row.get("category") or row.get("Category") or "").strip().lower()
        if not cat:
            cat = "winner" if rank_val else "achievement"
        if cat not in ["winner", "achievement"]:
            errors.append(f"Category must be 'winner' or 'achievement' (got '{cat}')")

        # Award title validation
        title = str(row.get("award_title") or row.get("award") or row.get("Award") or "").strip()
        if not title:
            if rank_val == 1:
                title = "1st Place (Champion)"
            elif rank_val == 2:
                title = "2nd Place (Runner-Up)"
            elif rank_val == 3:
                title = "3rd Place"
            else:
                title = "Finalist Recognition"

        # Participant / Team matching
        ident = str(row.get("identifier") or row.get("usn") or row.get("USN") or row.get("email") or row.get("student") or "").strip().lower()
        tname = str(row.get("team_name") or row.get("team") or row.get("Team") or "").strip()
        proj = str(row.get("project_title") or row.get("project") or row.get("Project") or "").strip()
        notes = str(row.get("notes") or row.get("judge_notes") or "").strip()

        matched_students = []
        is_team = bool(tname)

        if is_team and tname.lower() in students_by_team:
            matched_students = students_by_team[tname.lower()]
        elif ident:
            # Check USN, email, name
            if ident in student_by_usn:
                matched_students = [student_by_usn[ident]]
            elif ident in student_by_email:
                matched_students = [student_by_email[ident]]
            elif ident in student_by_name:
                matched_students = [student_by_name[ident]]
            else:
                # Comma-separated identifiers
                parts = [p.strip() for p in ident.split(",") if p.strip()]
                for p in parts:
                    m = student_by_usn.get(p) or student_by_email.get(p) or student_by_name.get(p)
                    if m:
                        matched_students.append(m)
                    else:
                        errors.append(f"Participant '{p}' is not registered for this event")

        if not matched_students and not errors:
            errors.append("No registered student or team matches this record")

        entry = {
            "rowNumber": idx,
            "rank": rank_val,
            "awardCategory": cat,
            "awardTitle": title,
            "isTeam": is_team or len(matched_students) > 1,
            "teamName": tname or (matched_students[0].get("team_name") if matched_students else None),
            "projectTitle": proj or (matched_students[0].get("project_title") if matched_students else None),
            "score": score_val,
            "judgeNotes": notes,
            "studentIds": [s["student_id"] for s in matched_students],
            "studentNames": [s["name"] for s in matched_students],
        }

        if errors:
            invalid_rows.append({
                "rowNumber": idx,
                "data": entry,
                "errors": errors
            })
        else:
            valid_rows.append(entry)

    conn.close()

    return {
        "totalRows": len(raw_rows),
        "validCount": len(valid_rows),
        "invalidCount": len(invalid_rows),
        "validRows": valid_rows,
        "invalidRows": invalid_rows,
    }


@router.post("/events/{event_id}/results/bulk-save", status_code=status.HTTP_201_CREATED)
def bulk_save_event_results(event_id: str, req: BulkSaveResultsRequest):
    """Save validated CSV or batch entries into event_results."""
    conn = get_db_connection()
    cursor = conn.cursor()

    saved_count = 0
    now_iso = datetime.datetime.now().isoformat()
    init_status = req.initialStatus or "draft"
    is_approved = init_status == "approved"

    for item in req.results:
        rid = f"res_{uuid.uuid4().hex[:8]}"
        audit = [{
            "timestamp": now_iso,
            "actor": "Organizer (CSV Import)",
            "action": "imported_as_" + init_status,
            "score": item.score or 0.0,
            "rank": item.rank,
            "award": item.awardTitle,
            "notes": item.judgeNotes or "Imported via CSV Results tool"
        }]

        cursor.execute("""
        INSERT INTO event_results (
            id, event_id, award_category, award_title, rank, is_team, team_name,
            student_ids_json, student_names_json, project_title, score, judge_notes,
            status, approved_by, approved_at, audit_trail_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rid,
            event_id,
            item.awardCategory.lower(),
            item.awardTitle,
            item.rank,
            1 if item.isTeam else 0,
            item.teamName,
            json.dumps(item.studentIds),
            json.dumps(item.studentNames or []),
            item.projectTitle,
            item.score or 0.0,
            item.judgeNotes,
            init_status,
            item.approvedBy if is_approved else None,
            now_iso if is_approved else None,
            json.dumps(audit),
        ))
        saved_count += 1

    conn.commit()
    conn.close()
    return {"message": f"Successfully recorded {saved_count} result(s)", "savedCount": saved_count}


@router.delete("/results/{result_id}")
def delete_event_result(result_id: str):
    """Delete a competition result."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM event_results WHERE id = ?", (result_id,))
    conn.commit()
    conn.close()
    return {"message": "Result deleted successfully", "resultId": result_id}


@router.post("/events/{event_id}/configure-types")
def configure_event_certificate_types(event_id: str, req: ConfigureCertificateTypesRequest):
    """Configure allowed certificate types for an event."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM events WHERE id = ?", (event_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")

    types_json = json.dumps(req.certificateTypes)
    cursor.execute("UPDATE events SET certificate_types_json = ? WHERE id = ?", (types_json, event_id))
    conn.commit()
    conn.close()
    return {"message": "Event certificate configuration updated", "certificateTypes": req.certificateTypes}



# ================= CERTIFICATE LISTING & AUTHENTICATION =================

@router.get("")
def list_certificates(student_id: Optional[str] = None, event_id: Optional[str] = None):
    """Retrieve certificates with optional recipient or event filters."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM certificates WHERE 1=1"
    params = []

    if student_id:
        query += " AND recipient_id = ?"
        params.append(student_id)
    if event_id:
        query += " AND event_id = ?"
        params.append(event_id)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    certs = []
    for r in rows:
        d = dict(r)
        d["certificateId"] = d.get("certificate_id")
        d["eventName"] = d.get("event_name")
        d["recipientName"] = d.get("recipient_name")
        d["recipientEmail"] = d.get("recipient_email")
        d["issueDate"] = d.get("issue_date")
        d["qrVerificationUrl"] = d.get("qr_verification_url")
        d["downloadUrl"] = f"/api/certificates/download/{d.get('certificate_id')}"
        d["certificateType"] = d.get("certificate_type") or "Participation"
        d["awardTitle"] = d.get("award_title")
        d["rank"] = d.get("rank")
        d["teamName"] = d.get("team_name")
        d["resultId"] = d.get("result_id")
        certs.append(d)

    return {"certificates": certs, "total": len(certs)}


async def get_supabase_certificate(clean_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve authoritative certificate status directly from Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            # 1. Attempt secure RPC verify_certificate_public
            rpc_res = await client.post(
                f"{SUPABASE_URL}/rest/v1/rpc/verify_certificate_public",
                headers=get_headers(),
                json={"lookup_cert_id": clean_id},
            )
            if rpc_res.status_code == 200:
                rows = rpc_res.json()
                if isinstance(rows, list) and len(rows) > 0:
                    r = rows[0]
                    return {
                        "certificate_id": r.get("certificate_id"),
                        "recipient_name": r.get("recipient_name"),
                        "event_name": r.get("event_title"),
                        "issue_date": r.get("issue_date"),
                        "issuer": "Eventora Academic Credential Registry",
                        "status": "Revoked" if r.get("status") == "revoked" or not r.get("is_valid") else "Verified",
                        "certificate_type": r.get("certificate_type") or "Participation",
                        "award_title": r.get("award_title"),
                        "rank": r.get("rank"),
                    }

            # 2. Direct Supabase certificates query
            tab_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/certificates?certificate_id=eq.{clean_id}&select=*,events(title),profiles(name)",
                headers=get_headers(),
            )
            if tab_res.status_code == 200:
                rows = tab_res.json()
                if isinstance(rows, list) and len(rows) > 0:
                    r = rows[0]
                    raw_st = r.get("status", "verified")
                    return {
                        "certificate_id": r.get("certificate_id"),
                        "recipient_name": r.get("profiles", {}).get("name") if isinstance(r.get("profiles"), dict) else r.get("recipient_name"),
                        "event_name": r.get("events", {}).get("title") if isinstance(r.get("events"), dict) else r.get("event_name"),
                        "issue_date": r.get("issued_at", "October 15, 2026"),
                        "issuer": "Eventora Academic Credential Registry",
                        "status": "Revoked" if str(raw_st).lower() == "revoked" else "Verified",
                        "certificate_type": r.get("certificate_type") or "Participation",
                        "award_title": r.get("award_title"),
                        "rank": r.get("rank"),
                        "team_name": r.get("team_name"),
                    }
    except Exception as err:
        print(f"[SUPABASE VERIFY QUERY]: {err}")
    return None


@router.get("/verify/{certificate_id}")
async def verify_certificate_public(certificate_id: str):
    """
    Public verification endpoint for tamper-evident digital certificates.
    Exposes approved verification fields:
    - Status: 'Valid', 'Revoked', or 'Not Found'
    - recipientName, eventName, issuingOrganization, issueDate, certificateId
    - certificateType, awardTitle, rank, teamName (for competition/achievement credentials)
    """
    clean_id = certificate_id.strip().upper()

    # 1. Query Supabase
    supabase_record = await get_supabase_certificate(clean_id)

    # 2. Local database fallback
    local_record = None
    if not supabase_record:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM certificates WHERE certificate_id = ? OR id = ?",
            (clean_id, clean_id),
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            local_record = dict(row)

    target = supabase_record or local_record

    if not target:
        raise HTTPException(
            status_code=404,
            detail=f"Certificate {clean_id} could not be found or has not been issued in the registry.",
        )

    raw_status = target.get("status", "Verified")
    is_revoked = str(raw_status).lower() == "revoked"
    status_label = "Revoked" if is_revoked else "Valid"

    # Extract approved display fields ONLY
    recipient_name = target.get("recipient_name") or target.get("recipientName") or "Verified Recipient"
    event_name = target.get("event_name") or target.get("eventName") or "Academic Event"
    issuer_name = target.get("issuer") or "Eventora Academic Credential Registry"
    issuer_title = target.get("issuer_title")
    issuing_org = f"{issuer_name} ({issuer_title})" if issuer_title else issuer_name
    issue_date = target.get("issue_date") or target.get("issueDate") or "October 15, 2026"
    cert_type = target.get("certificate_type") or target.get("certificateType") or "Participation"
    award_title = target.get("award_title") or target.get("awardTitle")
    rank = target.get("rank")
    team_name = target.get("team_name") or target.get("teamName")

    # Extract revocation audit details if revoked
    revocation_reason = None
    revoked_at = None
    if is_revoked:
        audit_raw = target.get("audit_trail_json") or target.get("audit_trail")
        if audit_raw:
            try:
                audit_list = json.loads(audit_raw) if isinstance(audit_raw, str) else audit_raw
                revoked_events = [e for e in audit_list if e.get("action") == "Revoked"]
                if revoked_events:
                    latest = revoked_events[-1]
                    revocation_reason = latest.get("reason", "Administrative policy audit")
                    revoked_at = latest.get("timestamp")
            except Exception:
                pass
        if not revocation_reason:
            revocation_reason = "Formal revocation by issuing academic authority"

    return {
        "status": status_label,
        "isValid": not is_revoked,
        "certificateId": clean_id,
        "recipientName": recipient_name,
        "eventName": event_name,
        "issuingOrganization": issuing_org,
        "issueDate": issue_date,
        "certificateType": cert_type,
        "awardTitle": award_title,
        "rank": rank,
        "teamName": team_name,
        "revocationReason": revocation_reason,
        "revokedAt": revoked_at,
    }


@router.post("/revoke", status_code=status.HTTP_200_OK)
def revoke_certificate(req: RevokeCertificateRequest):
    """Revoke a certificate by unique certificate ID."""
    clean_id = req.certificateId.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates WHERE certificate_id = ? OR id = ?", (clean_id, clean_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert = dict(row)
    try:
        audit_trail = json.loads(cert.get("audit_trail_json") or "[]")
    except Exception:
        audit_trail = []

    revocation_entry = {
        "action": "Revoked",
        "timestamp": datetime.datetime.now().strftime("%B %d, %Y %I:%M %p"),
        "actor": req.actor or "Academic Authority",
        "reason": req.reason or "Administrative policy audit",
    }
    audit_trail.append(revocation_entry)

    cursor.execute(
        "UPDATE certificates SET status = 'Revoked', audit_trail_json = ? WHERE certificate_id = ? OR id = ?",
        (json.dumps(audit_trail), clean_id, clean_id),
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "certificateId": clean_id,
        "status": "Revoked",
        "reason": req.reason,
        "revokedAt": revocation_entry["timestamp"],
        "revokedBy": revocation_entry["actor"],
        "message": f"Certificate {clean_id} has been revoked.",
    }


@router.post("/reissue", status_code=status.HTTP_200_OK)
def reissue_certificate(req: ReissueCertificateRequest):
    """Reissue / restore a revoked certificate back to Verified status."""
    clean_id = req.certificateId.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates WHERE certificate_id = ? OR id = ?", (clean_id, clean_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert = dict(row)
    try:
        audit_trail = json.loads(cert.get("audit_trail_json") or "[]")
    except Exception:
        audit_trail = []

    audit_trail.append({
        "action": "Reissued",
        "timestamp": datetime.datetime.now().strftime("%B %d, %Y %I:%M %p"),
        "actor": req.actor or "Academic Authority",
        "reason": "Reinstated to valid standing",
    })

    cursor.execute(
        "UPDATE certificates SET status = 'Verified', audit_trail_json = ? WHERE certificate_id = ? OR id = ?",
        (json.dumps(audit_trail), clean_id, clean_id),
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "certificateId": clean_id,
        "status": "Verified",
        "message": f"Certificate {clean_id} has been reinstated as Verified.",
    }


@router.get("/download/{certificate_id}")
def download_certificate_pdf(certificate_id: str):
    """Stream the authentic ReportLab landscape A4 PDF certificate."""
    clean_id = certificate_id.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates WHERE certificate_id = ? OR id = ?", (clean_id, clean_id))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Certificate record not found")

    cert = dict(row)

    # 1. Look for existing saved PDF on disk
    event_id = cert.get("event_id") or "default"
    local_event_dir = STORAGE_DIR / event_id
    matching_files = list(local_event_dir.glob(f"{clean_id}*.pdf"))

    if matching_files and matching_files[0].exists():
        pdf_bytes = matching_files[0].read_bytes()
    else:
        # 2. Generate on the fly using stored metadata
        verification_url = cert.get("qr_verification_url") or f"http://localhost:5173/verify/{clean_id}"
        pdf_bytes = generate_landscape_a4_pdf(
            certificate_id=clean_id,
            recipient_name=cert.get("recipient_name", "Student Attendee"),
            recipient_usn=cert.get("usn"),
            event_title=cert.get("event_name", "Campus Event"),
            certificate_title=f"Certificate of {cert.get('certificate_type', 'Participation')}",
            description=cert.get("description", "For verified participation and excellence."),
            issue_date=cert.get("issue_date", datetime.date.today().strftime("%B %d, %Y")),
            issuer_name=cert.get("issuer", "Dr. Eleanor Vance"),
            issuer_title=cert.get("issuer_title", "Chief Academic Officer"),
            co_issuer_name=cert.get("co_issuer", "Marcus Sterling"),
            co_issuer_title=cert.get("co_issuer_title", "Event Director"),
            verification_url=verification_url,
            certificate_type=cert.get("certificate_type") or "Participation",
            award_title=cert.get("award_title"),
            rank=cert.get("rank"),
            team_name=cert.get("team_name"),
        )
        local_event_dir.mkdir(parents=True, exist_ok=True)
        (local_event_dir / f"{clean_id}.pdf").write_bytes(pdf_bytes)

    filename = f"Eventora-{clean_id}-{cert.get('recipient_name', 'Certificate').replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "public, max-age=3600",
        },
    )


@router.post("/preview-sample")
def preview_sample_certificate(tpl: TemplateConfigModel):
    """Generate an in-memory sample landscape A4 PDF for live preview."""
    sample_cert_id = f"PREVIEW-{uuid.uuid4().hex[:6].upper()}"
    pdf_bytes = generate_landscape_a4_pdf(
        certificate_id=sample_cert_id,
        recipient_name="Poorvika Gowda",
        recipient_usn="1DA22CS042",
        event_title=tpl.eventName,
        certificate_title=tpl.title,
        description=tpl.description or f"For demonstrated technical excellence in {tpl.eventName}.",
        issue_date=tpl.issueDate,
        issuer_name=tpl.issuerName,
        issuer_title=tpl.issuerTitle,
        co_issuer_name=tpl.coIssuerName,
        co_issuer_title=tpl.coIssuerTitle,
        verification_url=f"http://localhost:5173/verify/{sample_cert_id}",
        logo_type=tpl.logoType,
        certificate_type=tpl.certificateType or "Participation",
        award_title=tpl.awardTitle or ("1st Place" if (tpl.certificateType or "").lower() == "winner" else None),
        rank=tpl.rank or (1 if (tpl.certificateType or "").lower() == "winner" else None),
        team_name=tpl.teamName or ("CodeCrafters" if (tpl.certificateType or "").lower() == "winner" else None),
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="Sample-Certificate.pdf"'},
    )


# ================= BATCH GENERATION ENGINE =================

@router.post("/generate-batch", status_code=status.HTTP_200_OK)
async def generate_certificates_batch(req: BatchGenerateRequest):
    """
    Multi-Type Server-side Batch Certificate Generation Engine.
    1. Validates event existence and configured certificate types.
    2. Enforces 'No Certificate' rule: blocks issuance if configured with 'none'.
    3. Handles Participation certificates (eligible attendees via Dynamic QR).
    4. Handles Winner & Achievement certificates (official approved results, individual or team members).
    5. Deduplicates on UNIQUE(event_id, student_id, certificate_type).
    6. Returns structured summary of generated, skipped, and team certificates.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Fetch Event
    cursor.execute("SELECT * FROM events WHERE id = ?", (req.eventId,))
    ev_row = cursor.fetchone()
    if not ev_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Event not found")
    event = dict(ev_row)
    event_title = req.templateConfig.eventName or event.get("title")

    # Parse configured types
    configured_raw = event.get("certificate_types_json") or '["participation"]'
    try:
        configured_types = [t.lower() for t in json.loads(configured_raw)]
    except Exception:
        configured_types = ["participation"]

    # Enforce No Certificate configuration
    if "none" in configured_types or len(configured_types) == 0:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="This event is configured with 'No Certificate'. Certificate generation is disabled."
        )

    requested_type = (req.certificateType or "all").lower()

    # Determine types to generate
    if requested_type == "all":
        types_to_generate = [t for t in configured_types if t != "none"]
    elif requested_type in ["results", "winner_and_achievement"]:
        types_to_generate = [t for t in configured_types if t in ["winner", "achievement"]]
    else:
        if requested_type not in configured_types:
            conn.close()
            raise HTTPException(
                status_code=400,
                detail=f"Certificate type '{req.certificateType}' is not enabled for this event. Enabled types: {configured_types}"
            )
        types_to_generate = [requested_type]

    results = []
    skipped_details = []
    successful_count = 0
    today_str = req.templateConfig.issueDate or datetime.date.today().strftime("%B %d, %Y")
    rules = req.eligibilityRules or EligibilityRulesModel()
    approved_ids = set(req.approvedStudentIds or [])

    # ------------------ A. PARTICIPATION CERTIFICATES ------------------
    if "participation" in types_to_generate:
        # Fetch registered students for event
        cursor.execute("""
        SELECT r.student_id, u.name, u.email, u.usn, u.department, r.status as reg_status
        FROM registrations r
        JOIN users u ON r.student_id = u.id
        WHERE r.event_id = ?
        """, (req.eventId,))
        reg_rows = cursor.fetchall()

        if not reg_rows:
            cursor.execute("SELECT id as student_id, name, email, usn, department FROM users WHERE role = 'student'")
            reg_rows = cursor.fetchall()[:8]

        # Fetch attendance records for event
        cursor.execute("SELECT * FROM attendance WHERE event_id = ?", (req.eventId,))
        att_rows = [dict(a) for a in cursor.fetchall()]

        # Fetch existing participation certificates
        cursor.execute(
            "SELECT recipient_id, certificate_id FROM certificates WHERE event_id = ? AND LOWER(certificate_type) = 'participation'",
            (req.eventId,)
        )
        existing_part_certs = {dict(c)["recipient_id"]: dict(c)["certificate_id"] for c in cursor.fetchall()}

        for student_row in reg_rows:
            student = dict(student_row)
            student_id = student.get("student_id") or student.get("id")
            student_name = student.get("name")
            student_email = student.get("email")
            student_usn = student.get("usn")

            # Duplicate check for participation
            if student_id in existing_part_certs:
                skipped_details.append({
                    "studentId": student_id,
                    "studentName": student_name,
                    "certificateType": "Participation",
                    "reason": f"Participation certificate already issued ({existing_part_certs[student_id]})",
                })
                continue

            # Find attendance record
            att_match = next(
                (a for a in att_rows if a.get("student_id") == student_id or a.get("usn") == student_usn or (student_name and a.get("student_name", "").lower() == student_name.lower())),
                None
            )

            has_attendance = bool(att_match and att_match.get("status") == "Present")
            is_dynamic_qr = bool(att_match and (att_match.get("method") == "Dynamic QR" or att_match.get("verified") == 1))

            # Eligibility evaluation
            if rules.requireDynamicQR and not (has_attendance and is_dynamic_qr):
                skipped_details.append({
                    "studentId": student_id,
                    "studentName": student_name,
                    "certificateType": "Participation",
                    "reason": "Missing verified Dynamic QR attendance check-in",
                })
                continue

            if rules.requireApproval and approved_ids and student_id not in approved_ids:
                skipped_details.append({
                    "studentId": student_id,
                    "studentName": student_name,
                    "certificateType": "Participation",
                    "reason": "Pending organizer approval sign-off",
                })
                continue

            # Issue Participation Certificate
            cert_code = f"CERT-{uuid.uuid4().hex[:6].upper()}-ET26"
            cert_pk = f"cert_{uuid.uuid4().hex[:8]}"
            verification_url = f"http://localhost:5173/verify/{cert_code}"
            crypto_hash = generate_certificate_hash(cert_code, student_id, req.eventId)

            try:
                pdf_bytes = generate_landscape_a4_pdf(
                    certificate_id=cert_code,
                    recipient_name=student_name,
                    recipient_usn=student_usn,
                    event_title=event_title,
                    certificate_title="Certificate of Participation",
                    description=req.templateConfig.description or f"For active participation and demonstrated technical proficiency in {event_title}.",
                    issue_date=today_str,
                    issuer_name=req.templateConfig.issuerName,
                    issuer_title=req.templateConfig.issuerTitle,
                    co_issuer_name=req.templateConfig.coIssuerName,
                    co_issuer_title=req.templateConfig.coIssuerTitle,
                    verification_url=verification_url,
                    logo_type=req.templateConfig.logoType,
                    certificate_type="Participation",
                    award_title=None,
                    rank=None,
                    team_name=None,
                )

                upload_success, storage_path, public_url = await upload_pdf_to_storage(
                    pdf_bytes=pdf_bytes,
                    event_id=req.eventId,
                    certificate_id=cert_code,
                    student_id=student_id,
                )

                cursor.execute("""
                INSERT INTO certificates (
                    id, certificate_id, event_id, event_name, recipient_id, recipient_name,
                    recipient_email, usn, issue_date, issuer, issuer_title, co_issuer,
                    co_issuer_title, status, description, cryptographic_hash,
                    qr_verification_url, certificate_type, award_title, rank, team_name, result_id, audit_trail_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verified', ?, ?, ?, 'Participation', NULL, NULL, NULL, NULL, ?)
                """, (
                    cert_pk,
                    cert_code,
                    req.eventId,
                    event_title,
                    student_id,
                    student_name,
                    student_email,
                    student_usn,
                    today_str,
                    req.templateConfig.issuerName,
                    req.templateConfig.issuerTitle,
                    req.templateConfig.coIssuerName,
                    req.templateConfig.coIssuerTitle,
                    req.templateConfig.description or f"For verified participation in {event_title}.",
                    crypto_hash,
                    verification_url,
                    json.dumps([{
                        "action": "Issued",
                        "timestamp": datetime.datetime.now().isoformat(),
                        "actor": req.templateConfig.issuerName,
                    }]),
                ))

                cursor.execute("UPDATE users SET certificates_count = certificates_count + 1 WHERE id = ?", (student_id,))

                results.append({
                    "studentId": student_id,
                    "studentName": student_name,
                    "usn": student_usn,
                    "certificateId": cert_code,
                    "certificateType": "Participation",
                    "status": "success",
                    "storagePath": storage_path,
                    "downloadUrl": f"/api/certificates/download/{cert_code}",
                    "verificationUrl": verification_url,
                })
                successful_count += 1
            except Exception as err:
                print(f"[GENERATION ERROR] Failed participation cert for {student_name}: {err}")
                skipped_details.append({
                    "studentId": student_id,
                    "studentName": student_name,
                    "certificateType": "Participation",
                    "reason": f"PDF generation error: {str(err)}",
                })

    # ------------------ B. WINNER & ACHIEVEMENT AWARDS ------------------
    award_categories = [t for t in types_to_generate if t in ["winner", "achievement"]]
    if award_categories:
        # Check and flag any unapproved or reapproval_required results
        cursor.execute("SELECT award_title, status FROM event_results WHERE event_id = ? AND status != 'approved'", (req.eventId,))
        unapproved_rows = cursor.fetchall()
        for unapp in unapproved_rows:
            skipped_details.append({
                "awardTitle": unapp["award_title"],
                "certificateType": "Winner/Achievement",
                "reason": f"Outcome is in '{unapp['status']}' state — requires official organizer approval before issuance",
            })

        cursor.execute("SELECT * FROM event_results WHERE event_id = ? AND status = 'approved'", (req.eventId,))
        results_rows = cursor.fetchall()

        for res_row in results_rows:
            res = dict(res_row)
            cat = res.get("award_category", "winner").lower()
            if cat not in award_categories:
                continue

            cert_type_display = "Winner" if cat == "winner" else "Achievement"
            award_label = res.get("award_title", "Distinguished Excellence")
            rank_val = res.get("rank")
            is_team = bool(res.get("is_team", 0))
            team_title = res.get("team_name") if is_team else None

            # Student IDs for this result (team or individual)
            sids = json.loads(res.get("student_ids_json") or "[]")

            for sid in sids:
                # Deduplication check for this specific certificate_type
                cursor.execute(
                    "SELECT certificate_id FROM certificates WHERE event_id = ? AND recipient_id = ? AND LOWER(certificate_type) = LOWER(?)",
                    (req.eventId, sid, cert_type_display)
                )
                existing_win_cert = cursor.fetchone()
                if existing_win_cert:
                    skipped_details.append({
                        "studentId": sid,
                        "studentName": sid,
                        "certificateType": cert_type_display,
                        "awardTitle": award_label,
                        "reason": f"{cert_type_display} certificate already issued ({existing_win_cert['certificate_id']})",
                    })
                    continue

                # Fetch student profile
                cursor.execute("SELECT id, name, email, usn FROM users WHERE id = ?", (sid,))
                u_row = cursor.fetchone()
                if u_row:
                    u_dict = dict(u_row)
                    u_name = u_dict.get("name")
                    u_email = u_dict.get("email")
                    u_usn = u_dict.get("usn")
                else:
                    u_name = sid
                    u_email = f"{sid}@eventora.edu"
                    u_usn = "USN-CAMPUS"

                cert_code = f"CERT-{uuid.uuid4().hex[:6].upper()}-ET26"
                cert_pk = f"cert_{uuid.uuid4().hex[:8]}"
                verification_url = f"http://localhost:5173/verify/{cert_code}"
                crypto_hash = generate_certificate_hash(cert_code, sid, req.eventId)

                desc = (
                    f"In recognition of outstanding competitive victory ({award_label}) in {event_title}."
                    if cat == "winner"
                    else f"In recognition of exemplary distinction ({award_label}) in {event_title}."
                )

                try:
                    pdf_bytes = generate_landscape_a4_pdf(
                        certificate_id=cert_code,
                        recipient_name=u_name,
                        recipient_usn=u_usn,
                        event_title=event_title,
                        certificate_title=f"Certificate of {cert_type_display}",
                        description=desc,
                        issue_date=today_str,
                        issuer_name=req.templateConfig.issuerName,
                        issuer_title=req.templateConfig.issuerTitle,
                        co_issuer_name=req.templateConfig.coIssuerName,
                        co_issuer_title=req.templateConfig.coIssuerTitle,
                        verification_url=verification_url,
                        logo_type=req.templateConfig.logoType,
                        certificate_type=cert_type_display,
                        award_title=award_label,
                        rank=rank_val,
                        team_name=team_title,
                    )

                    upload_success, storage_path, public_url = await upload_pdf_to_storage(
                        pdf_bytes=pdf_bytes,
                        event_id=req.eventId,
                        certificate_id=cert_code,
                        student_id=sid,
                    )

                    cursor.execute("""
                    INSERT INTO certificates (
                        id, certificate_id, event_id, event_name, recipient_id, recipient_name,
                        recipient_email, usn, issue_date, issuer, issuer_title, co_issuer,
                        co_issuer_title, status, description, cryptographic_hash,
                        qr_verification_url, certificate_type, award_title, rank, team_name, result_id, audit_trail_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verified', ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        cert_pk,
                        cert_code,
                        req.eventId,
                        event_title,
                        sid,
                        u_name,
                        u_email,
                        u_usn,
                        today_str,
                        req.templateConfig.issuerName,
                        req.templateConfig.issuerTitle,
                        req.templateConfig.coIssuerName,
                        req.templateConfig.coIssuerTitle,
                        desc,
                        crypto_hash,
                        verification_url,
                        cert_type_display,
                        award_label,
                        rank_val,
                        team_title,
                        res.get("id"),
                        json.dumps([{
                            "action": "Issued",
                            "timestamp": datetime.datetime.now().isoformat(),
                            "actor": req.templateConfig.issuerName,
                        }]),
                    ))

                    cursor.execute("UPDATE users SET certificates_count = certificates_count + 1 WHERE id = ?", (sid,))

                    results.append({
                        "studentId": sid,
                        "studentName": u_name,
                        "usn": u_usn,
                        "certificateId": cert_code,
                        "certificateType": cert_type_display,
                        "awardTitle": award_label,
                        "rank": rank_val,
                        "teamName": team_title,
                        "status": "success",
                        "storagePath": storage_path,
                        "downloadUrl": f"/api/certificates/download/{cert_code}",
                        "verificationUrl": verification_url,
                    })
                    successful_count += 1
                except Exception as err:
                    print(f"[GENERATION ERROR] Failed {cert_type_display} cert for {u_name}: {err}")
                    skipped_details.append({
                        "studentId": sid,
                        "studentName": u_name,
                        "certificateType": cert_type_display,
                        "reason": f"PDF generation error: {str(err)}",
                    })

    conn.commit()
    conn.close()

    return {
        "message": f"Successfully issued {successful_count} certificates for {event_title}.",
        "successfulCount": successful_count,
        "skippedCount": len(skipped_details),
        "results": results,
        "skippedDetails": skipped_details,
    }
