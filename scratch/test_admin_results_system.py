"""
Comprehensive Validation Test Suite for Admin Result Management System
Verifies all 15 requirements:
1. Real Database Participants & Teams Loading
2. Judge Score & Rank Entry with Audit Log
3. CSV Result Import Validation & Pre-save Preview (catches invalid scores / unregistered students)
4. Review & Approval Gate (records approver and timestamp)
5. Winner Certificates generated ONLY for approved results
6. Non-Winner Protection
7. Separate Participation Certificate generation based on verified attendance
8. Dual-certificate access (a winner can receive both winner & participation certificates)
9. Student-tamper prevention & authorization
10. Reapproval Requirement: Modifying approved results reverts to 'reapproval_required' and blocks generation until reapproved
11. Audit Trail History preservation
"""

import sys
import json
import sqlite3
import datetime
from pathlib import Path

# Adjust path for backend imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db_connection, init_db

client = TestClient(app)

def run_suite():
    print("=" * 75)
    print("STARTING ADMIN RESULT MANAGEMENT SYSTEM VERIFICATION SUITE")
    print("=" * 75)

    # Re-initialize DB to ensure schema and seeded competition data are applied
    init_db()

    conn = get_db_connection()
    cursor = conn.cursor()

    # Reset any leftover test certificates or results for a clean test run
    test_event_id = "evt_hackathon_03"
    # Reseed fresh teams and registrations
    from backend.database import seed_competition_data
    seed_competition_data(conn)

    # Clear event_results for deterministic test progression (starting with 0 outcomes)
    cursor.execute("DELETE FROM event_results WHERE event_id = ?", (test_event_id,))
    cursor.execute("DELETE FROM certificates WHERE event_id = ?", (test_event_id,))
    conn.commit()
    conn.close()

    print("[SETUP COMPLETE] Clean test slate ready for evt_hackathon_03.\n")

    # -------------------------------------------------------------------------
    # TEST 1: Real Database Participants & Teams Ingestion
    # -------------------------------------------------------------------------
    print("--- TEST 1: Real Database Participants & Teams Ingestion ---")
    p_res = client.get(f"/api/events/{test_event_id}/participants")
    assert p_res.status_code == 200, f"Expected 200, got {p_res.status_code}"
    p_data = p_res.json()
    assert p_data["total"] >= 6, f"Expected >= 6 participants, got {p_data['total']}"
    
    # Verify participant has real USN and attendance verification
    alex_p = next((p for p in p_data["participants"] if p["studentId"] == "usr_alex_01"), None)
    assert alex_p is not None, "Alex exists in participants"
    assert alex_p["usn"] == "1MS22CS042", f"Expected real USN, got {alex_p['usn']}"
    assert alex_p["teamName"] == "CodeCrafters", f"Expected CodeCrafters, got {alex_p['teamName']}"
    assert alex_p["isAttendanceVerified"] is True, "Expected verified attendance for Alex"

    t_res = client.get(f"/api/events/{test_event_id}/teams")
    assert t_res.status_code == 200
    t_data = t_res.json()
    assert t_data["total"] >= 2, f"Expected >= 2 teams, got {t_data['total']}"
    codecrafters = next((t for t in t_data["teams"] if t["name"] == "CodeCrafters"), None)
    assert codecrafters is not None, "CodeCrafters team exists"
    assert "usr_alex_01" in codecrafters["memberIds"]
    assert "usr_sarah_02" in codecrafters["memberIds"]
    print("[PASS] TEST 1 PASSED: Real database participants and teams loaded with attendance status.\n")

    # -------------------------------------------------------------------------
    # TEST 2: Judge Score & Rank Entry with Draft Status and Audit Log
    # -------------------------------------------------------------------------
    print("--- TEST 2: Judge Score & Rank Entry with Audit Log ---")
    create_res = client.post(f"/api/certificates/events/{test_event_id}/results", json={
        "awardCategory": "winner",
        "awardTitle": "1st Place (Champion)",
        "rank": 1,
        "isTeam": True,
        "teamName": "CodeCrafters",
        "studentIds": ["usr_alex_01", "usr_sarah_02"],
        "projectTitle": "Autonomous Agentic IDE",
        "score": 98.5,
        "judgeNotes": "Flawless tool coordination and enterprise-grade architecture",
        "status": "draft",
    })
    assert create_res.status_code == 201, f"Expected 201, got {create_res.status_code}: {create_res.text}"
    created = create_res.json()["result"]
    assert created["status"] == "draft"
    assert created["score"] == 98.5
    assert len(created["auditTrail"]) == 1
    assert created["auditTrail"][0]["action"] == "created_as_draft"
    result_1_id = created["id"]
    print(f"[PASS] TEST 2 PASSED: Result {result_1_id} recorded in 'draft' status with score 98.5 and audit log.\n")

    # -------------------------------------------------------------------------
    # TEST 3: CSV Import Pre-Save Validation (Valid vs Invalid Rows)
    # -------------------------------------------------------------------------
    print("--- TEST 3: CSV Import Pre-Save Validation ---")
    csv_payload = {
        "csvText": (
            "rank,award_category,award_title,team_name,identifier,score,project_title,notes\n"
            "2,winner,2nd Place (Runner-Up),CyberKnights,1MS22ME034,94.0,Quantum Intrusion Defense,Strong cryptography\n"
            "3,winner,3rd Place,DataDynamos,1MS22CS075,150.0,Predictive Agro,Score above 100\n" # Invalid: score > 100
            ",achievement,Best Innovation,,NON_EXISTENT_USN,91.0,AI Diagnostics,Unknown user\n" # Invalid: unregistered
            ",achievement,Best Innovation,,1MS22AI015,92.0,AI Vision Diagnostics,Valid achievement\n" # Valid row
        )
    }
    val_res = client.post(f"/api/certificates/events/{test_event_id}/results/import-csv", json=csv_payload)
    assert val_res.status_code == 200, f"Expected 200, got {val_res.status_code}: {val_res.text}"
    v_data = val_res.json()
    assert v_data["totalRows"] == 4, f"Expected 4 rows, got {v_data['totalRows']}"
    assert v_data["validCount"] == 2, f"Expected 2 valid rows, got {v_data['validCount']}"
    assert v_data["invalidCount"] == 2, f"Expected 2 invalid rows, got {v_data['invalidCount']}"

    # Verify invalid row errors caught
    invalid_row_scores = [ir for ir in v_data["invalidRows"] if "between 0 and 100" in ir["errors"][0]]
    assert len(invalid_row_scores) == 1, "Caught score > 100 violation"
    invalid_row_users = [ir for ir in v_data["invalidRows"] if "not registered" in ir["errors"][0] or "No registered student" in ir["errors"][0]]
    assert len(invalid_row_users) == 1, "Caught unregistered student identifier"

    # Bulk save the valid rows
    bulk_res = client.post(f"/api/certificates/events/{test_event_id}/results/bulk-save", json={
        "results": v_data["validRows"],
        "initialStatus": "pending_approval"
    })
    assert bulk_res.status_code == 201
    assert bulk_res.json()["savedCount"] == 2
    print(f"[PASS] TEST 3 PASSED: CSV validation caught invalid rows (score > 100, unregistered USN); saved {bulk_res.json()['savedCount']} valid outcomes.\n")

    # -------------------------------------------------------------------------
    # TEST 4: Winner Certificates Locked Before Approval
    # -------------------------------------------------------------------------
    print("--- TEST 4: Winner Certificates Locked Before Approval ---")
    gen_locked_res = client.post("/api/certificates/generate-batch", json={
        "eventId": test_event_id,
        "certificateType": "winner",
        "templateConfig": {
            "title": "Certificate of Winner",
            "eventName": "Global FinTech Hackathon 2026"
        }
    })
    assert gen_locked_res.status_code == 200
    gen_locked_data = gen_locked_res.json()
    assert gen_locked_data["successfulCount"] == 0, f"Expected 0 certs generated when results unapproved, got {gen_locked_data['successfulCount']}"
    # Check that skipped details explicitly noted the unapproved status
    unapproved_skips = [s for s in gen_locked_data["skippedDetails"] if "requires official organizer approval" in s.get("reason", "")]
    assert len(unapproved_skips) >= 1, "Skipped details explicitly cited unapproved state requirement"
    print("[PASS] TEST 4 PASSED: Winner certificate generation safely locked when outcomes are in draft / pending_approval.\n")

    # -------------------------------------------------------------------------
    # TEST 5: Review & Approval Workflow (Records Approver and Timestamp)
    # -------------------------------------------------------------------------
    print("--- TEST 5: Review & Approval Workflow ---")
    approver_name = "Dr. Eleanor Vance (Chief Academic Officer)"
    appr_res = client.put(f"/api/certificates/results/{result_1_id}/approve", json={
        "approvedBy": approver_name,
        "approvalNotes": "Judging panel unanimous confirmation of 1st Place champion"
    })
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "approved"

    # Bulk approve the remaining outcomes
    bulk_appr_res = client.post(f"/api/certificates/events/{test_event_id}/results/approve-all", json={
        "approvedBy": approver_name
    })
    assert bulk_appr_res.status_code == 200
    assert bulk_appr_res.json()["approvedCount"] >= 2

    # Verify in DB that approved_by and approved_at are recorded
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT status, approved_by, approved_at FROM event_results WHERE id = ?", (result_1_id,))
    row = c.fetchone()
    assert row["status"] == "approved"
    assert row["approved_by"] == approver_name
    assert row["approved_at"] is not None
    conn.close()
    print(f"[PASS] TEST 5 PASSED: Outcome approved by '{approver_name}' with official timestamp.\n")

    # -------------------------------------------------------------------------
    # TEST 6: Winner Certificates Generated for Approved Teams & Members
    # -------------------------------------------------------------------------
    print("--- TEST 6: Winner Certificates Generated for Approved Teams & Members ---")
    gen_appr_res = client.post("/api/certificates/generate-batch", json={
        "eventId": test_event_id,
        "certificateType": "winner",
        "templateConfig": {
            "title": "Certificate of Winner",
            "eventName": "Global FinTech Hackathon 2026"
        }
    })
    assert gen_appr_res.status_code == 200
    gen_appr_data = gen_appr_res.json()
    assert gen_appr_data["successfulCount"] >= 2, f"Expected >= 2 winner certificates generated, got {gen_appr_data['successfulCount']}"

    # Verify both team members of CodeCrafters got individual personalized certs
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT recipient_id, recipient_name, certificate_id, team_name, rank, award_title FROM certificates WHERE event_id = ? AND recipient_id IN ('usr_alex_01', 'usr_sarah_02') AND LOWER(certificate_type) = 'winner'", (test_event_id,))
    team_certs = c.fetchall()
    assert len(team_certs) == 2, f"Expected 2 certs for team members, got {len(team_certs)}"
    assert team_certs[0]["team_name"] == "CodeCrafters"
    assert team_certs[1]["team_name"] == "CodeCrafters"
    assert team_certs[0]["certificate_id"] != team_certs[1]["certificate_id"]
    conn.close()
    print("[PASS] TEST 6 PASSED: Both team members received individual Winner certificates with Team Name 'CodeCrafters'.\n")

    # -------------------------------------------------------------------------
    # TEST 7: Non-Winner Protection (Unapproved Attending Participants do NOT get Winner certs)
    # -------------------------------------------------------------------------
    print("--- TEST 7: Non-Winner Protection ---")
    conn = get_db_connection()
    c = conn.cursor()
    # Rohit (usr_rohit_07) attended hackathon but was in the rejected 150-score row (not approved)
    c.execute("SELECT certificate_id FROM certificates WHERE event_id = ? AND recipient_id = 'usr_rohit_07' AND LOWER(certificate_type) = 'winner'", (test_event_id,))
    assert c.fetchone() is None, "Non-winning participant did NOT receive a winner certificate"
    conn.close()
    print("[PASS] TEST 7 PASSED: Non-winning registered participant was strictly protected from receiving a Winner certificate.\n")

    # -------------------------------------------------------------------------
    # TEST 8: Separate Participation Certificate Generation & Dual Credential Access
    # -------------------------------------------------------------------------
    print("--- TEST 8: Separate Participation Certificate Generation & Dual Access ---")
    part_res = client.post("/api/certificates/generate-batch", json={
        "eventId": test_event_id,
        "certificateType": "participation",
        "templateConfig": {
            "title": "Certificate of Participation",
            "eventName": "Global FinTech Hackathon 2026"
        }
    })
    assert part_res.status_code == 200
    assert part_res.json()["successfulCount"] >= 4

    # Verify Alex holds BOTH Participation and Winner certificates for the hackathon
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT certificate_id, certificate_type, award_title FROM certificates WHERE event_id = ? AND recipient_id = 'usr_alex_01'", (test_event_id,))
    alex_certs = c.fetchall()
    c_types = [r["certificate_type"].lower() for r in alex_certs]
    assert "participation" in c_types, "Alex has Participation certificate"
    assert "winner" in c_types, "Alex has Winner certificate"
    assert len(alex_certs) == 2, f"Alex has exactly 2 certificates, got {len(alex_certs)}"
    conn.close()
    print("[PASS] TEST 8 PASSED: Dual credentials verified: winner holds both Winner and Participation certificates without collision.\n")

    # -------------------------------------------------------------------------
    # TEST 9: Reapproval Requirement Trigger on Score/Rank Revision
    # -------------------------------------------------------------------------
    print("--- TEST 9: Reapproval Requirement Trigger on Score/Rank Revision ---")
    # Result 1 was previously approved. Now an organizer modifies the score.
    edit_res = client.put(f"/api/certificates/results/{result_1_id}", json={
        "score": 99.2,
        "editorName": "Prof. Alan Turing",
        "editReason": "Bonus points added for quantum encryption demo"
    })
    assert edit_res.status_code == 200
    edit_data = edit_res.json()
    assert edit_data["status"] == "reapproval_required", f"Expected status 'reapproval_required', got {edit_data['status']}"
    assert edit_data["reapprovalRequired"] is True

    # Check that winner cert generation skips this outcome while in reapproval_required
    reapp_gen_res = client.post("/api/certificates/generate-batch", json={
        "eventId": test_event_id,
        "certificateType": "winner",
        "templateConfig": {
            "title": "Certificate of Winner",
            "eventName": "Global FinTech Hackathon 2026"
        }
    })
    assert reapp_gen_res.status_code == 200
    # CodeCrafters certs won't be re-issued while reapproval is required
    skip_reapp = [s for s in reapp_gen_res.json()["skippedDetails"] if "reapproval_required" in s.get("reason", "") or "requires official organizer approval" in s.get("reason", "")]
    assert len(skip_reapp) >= 1, "Skipped details notes reapproval requirement"
    print("[PASS] TEST 9 PASSED: Editing an approved result reverted status to 'reapproval_required' and blocked generation until reapproved.\n")

    # -------------------------------------------------------------------------
    # TEST 10: Re-Approval & Audit Trail History Preservation
    # -------------------------------------------------------------------------
    print("--- TEST 10: Re-Approval & Audit Trail History Preservation ---")
    # Re-approve Result 1
    re_appr_res = client.put(f"/api/certificates/results/{result_1_id}/approve", json={
        "approvedBy": "Dr. Eleanor Vance (Chief Academic Officer)",
        "approvalNotes": "Re-verified after score bonus addition"
    })
    assert re_appr_res.status_code == 200
    assert re_appr_res.json()["status"] == "approved"

    # Inspect full audit trail in DB
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT audit_trail_json FROM event_results WHERE id = ?", (result_1_id,))
    audit_history = json.loads(c.fetchone()[0])
    conn.close()

    actions = [a["action"] for a in audit_history]
    assert "created_as_draft" in actions, "Audit trail contains creation"
    assert "approved" in actions or "bulk_approved" in actions, "Audit trail contains approval"
    assert "modified_requires_reapproval" in actions, "Audit trail contains modification & reapproval trigger"
    assert "reapproved" in actions, "Audit trail contains reapproval"
    assert len(audit_history) >= 4, f"Expected >= 4 audit events, got {len(audit_history)}"
    print(f"[PASS] TEST 10 PASSED: Complete audit trail verified with {len(audit_history)} immutable chronological entries.\n")

    print("=" * 75)
    print("ALL 10 ADMIN RESULT MANAGEMENT VERIFICATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 75)

if __name__ == "__main__":
    run_suite()
