"""
Comprehensive Verification Test Suite for Eventora Multi-Certificate Types Engine
Tests all 7 scenarios specified in requirements:
1. Workshop Participation Certificate
2. Hackathon 1st Place Winner Certificate
3. Team Member Multi-Issuance (both team members receive personalized certificates)
4. Non-Winner Protection (attended participants do NOT receive winner certificates unless approved in results)
5. No Certificate Event Handling (blocks generation)
6. Multi-Certificate Access (student has both Participation and Winner certificates for same event)
7. Duplicate Prevention (re-running generation for same type does not create duplicates)
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
from backend.database import get_db_connection

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("STARTING EVENTORA MULTI-CERTIFICATE VALIDATION SUITE")
    print("=" * 70)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Setup / Reset test certificates for deterministic runs
    cursor.execute("DELETE FROM certificates WHERE certificate_id LIKE 'CERT-TEST-%' OR event_id LIKE 'evt_test_%'")
    cursor.execute("DELETE FROM event_results WHERE id LIKE 'res_test_%' OR event_id LIKE 'evt_test_%'")
    cursor.execute("DELETE FROM events WHERE id LIKE 'evt_test_%'")
    cursor.execute("DELETE FROM registrations WHERE event_id LIKE 'evt_test_%'")
    cursor.execute("DELETE FROM attendance WHERE event_id LIKE 'evt_test_%'")
    conn.commit()

    # Seed test users if needed
    # Ensure students exist
    cursor.execute("SELECT id FROM users WHERE id IN ('usr_alex_01', 'usr_sarah_02', 'usr_david_05', 'usr_priya_04')")
    existing_users = [r[0] for r in cursor.fetchall()]
    assert len(existing_users) >= 4, "Required test users exist in DB"

    # Setup Event 1: Workshop (Participation only)
    cursor.execute("""
    INSERT INTO events (id, title, description, category, date, start_time, end_time, venue, capacity, organizer, certificate_types_json)
    VALUES ('evt_test_workshop', 'Advanced AI & LLM Workshop', 'Hands-on AI workshop', 'Workshop', '2026-11-01', '09:00 AM', '05:00 PM', 'Lab 4B', 100, 'AI Club', '["participation"]')
    """)

    # Setup Event 2: Hackathon (Participation + Winner + Achievement)
    cursor.execute("""
    INSERT INTO events (id, title, description, category, date, start_time, end_time, venue, capacity, organizer, certificate_types_json)
    VALUES ('evt_test_hackathon', 'Campus 24hr Hackathon 2026', 'Flagship overnight hackathon', 'Hackathon', '2026-11-05', '09:00 AM', '09:00 AM', 'Main Arena', 200, 'Tech Council', '["participation", "winner", "achievement"]')
    """)

    # Setup Event 3: No-Cert Orientation (none)
    cursor.execute("""
    INSERT INTO events (id, title, description, category, date, start_time, end_time, venue, capacity, organizer, certificate_types_json)
    VALUES ('evt_test_no_cert', 'Freshman Casual Meetup', 'Orientation gathering with no certificates', 'Orientation', '2026-11-10', '02:00 PM', '04:00 PM', 'Cafeteria', 50, 'Student Union', '["none"]')
    """)

    # Seed Registrations and Attendance for Alex (usr_alex_01) and Sarah (usr_sarah_02) and David (usr_david_05)
    student_map = {
        'usr_alex_01': ('Alexander Wright', '1MS22CS042'),
        'usr_sarah_02': ('Sarah Jenkins', '1MS22IS019'),
        'usr_david_05': ('David Chen', '1MS22ME034'),
        'usr_priya_04': ('Priya Sharma', '1MS22CS112'),
    }

    for sid in ['usr_alex_01', 'usr_sarah_02', 'usr_david_05']:
        sname, susn = student_map[sid]
        cursor.execute("INSERT INTO registrations (id, event_id, student_id, status) VALUES (?, 'evt_test_workshop', ?, 'confirmed')", (f"reg_ws_{sid}", sid))
        cursor.execute("""
        INSERT INTO attendance (id, event_id, student_id, student_name, usn, event_name, status, method, verified)
        VALUES (?, 'evt_test_workshop', ?, ?, ?, 'Advanced AI & LLM Workshop', 'Present', 'Dynamic QR', 1)
        """, (f"att_ws_{sid}", sid, sname, susn))

        cursor.execute("INSERT INTO registrations (id, event_id, student_id, status) VALUES (?, 'evt_test_hackathon', ?, 'confirmed')", (f"reg_hk_{sid}", sid))
        cursor.execute("""
        INSERT INTO attendance (id, event_id, student_id, student_name, usn, event_name, status, method, verified)
        VALUES (?, 'evt_test_hackathon', ?, ?, ?, 'Campus 24hr Hackathon 2026', 'Present', 'Dynamic QR', 1)
        """, (f"att_hk_{sid}", sid, sname, susn))

    # Also register Priya who attended Hackathon but did NOT win
    pname, pusn = student_map['usr_priya_04']
    cursor.execute("INSERT INTO registrations (id, event_id, student_id, status) VALUES ('reg_hk_priya', 'evt_test_hackathon', 'usr_priya_04', 'confirmed')")
    cursor.execute("""
    INSERT INTO attendance (id, event_id, student_id, student_name, usn, event_name, status, method, verified)
    VALUES ('att_hk_priya', 'evt_test_hackathon', 'usr_priya_04', ?, ?, 'Campus 24hr Hackathon 2026', 'Present', 'Dynamic QR', 1)
    """, (pname, pusn))

    # Record Hackathon Results:
    # 1st Place Individual Winner: Alex (usr_alex_01)
    cursor.execute("""
    INSERT INTO event_results (id, event_id, award_category, award_title, rank, is_team, student_ids_json, student_names_json, project_title, status)
    VALUES ('res_test_win1', 'evt_test_hackathon', 'winner', '1st Place (Champion)', 1, 0, '["usr_alex_01"]', '["Alexander Wright"]', 'Autonomous Agentic IDE', 'approved')
    """)

    # 2nd Place Team Winner: Sarah & David (FinTech Titans)
    cursor.execute("""
    INSERT INTO event_results (id, event_id, award_category, award_title, rank, is_team, team_name, student_ids_json, student_names_json, project_title, status)
    VALUES ('res_test_win2', 'evt_test_hackathon', 'winner', '2nd Place (Runner-Up)', 2, 1, 'FinTech Titans', '["usr_sarah_02", "usr_david_05"]', '["Sarah Jenkins", "David Chen"]', 'DeFi Fraud Shield', 'approved')
    """)

    # Achievement Award: Alex (Best Innovation)
    cursor.execute("""
    INSERT INTO event_results (id, event_id, award_category, award_title, rank, is_team, student_ids_json, student_names_json, project_title, status)
    VALUES ('res_test_ach1', 'evt_test_hackathon', 'achievement', 'Best Innovation', NULL, 0, '["usr_alex_01"]', '["Alexander Wright"]', 'Autonomous Agentic IDE', 'approved')
    """)

    conn.commit()
    conn.close()

    print("[SETUP COMPLETE] Seeded test events, registrations, attendance, and competition results.\n")

    # -------------------------------------------------------------------------
    # SCENARIO 1: Workshop Participation Certificate
    # -------------------------------------------------------------------------
    print("--- SCENARIO 1: Workshop Participation Certificate ---")
    ws_res = client.post("/api/certificates/generate-batch", json={
        "eventId": "evt_test_workshop",
        "certificateType": "participation",
        "templateConfig": {
            "title": "Certificate of Participation",
            "eventName": "Advanced AI & LLM Workshop",
            "issuerName": "Dr. Eleanor Vance",
            "issuerTitle": "Chief Academic Officer"
        }
    })
    assert ws_res.status_code == 200, f"Expected 200, got {ws_res.status_code}: {ws_res.text}"
    ws_data = ws_res.json()
    assert ws_data["successfulCount"] >= 3, f"Expected at least 3 participation certs, got {ws_data['successfulCount']}"
    # Verify certificate record in DB
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT certificate_id, certificate_type, award_title, rank FROM certificates WHERE event_id = 'evt_test_workshop' AND recipient_id = 'usr_alex_01'")
    row = c.fetchone()
    assert row is not None, "Alex participation certificate exists"
    assert row["certificate_type"].lower() == "participation", f"Expected Participation, got {row['certificate_type']}"
    assert row["rank"] is None, "Rank is None for participation certificate"
    ws_cert_id = row["certificate_id"]
    conn.close()
    print(f"[PASS] SCENARIO 1 PASSED: Participation certificate {ws_cert_id} generated for eligible student.\n")

    # -------------------------------------------------------------------------
    # SCENARIO 2: Hackathon 1st Place Winner Certificate
    # -------------------------------------------------------------------------
    print("--- SCENARIO 2: Hackathon 1st Place Winner Certificate ---")
    hk_win_res = client.post("/api/certificates/generate-batch", json={
        "eventId": "evt_test_hackathon",
        "certificateType": "winner",
        "templateConfig": {
            "title": "Certificate of Winner",
            "eventName": "Campus 24hr Hackathon 2026",
            "issuerName": "Dr. Eleanor Vance",
            "issuerTitle": "Chief Academic Officer"
        }
    })
    assert hk_win_res.status_code == 200, f"Expected 200, got {hk_win_res.status_code}"
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT certificate_id, certificate_type, award_title, rank FROM certificates WHERE event_id = 'evt_test_hackathon' AND recipient_id = 'usr_alex_01' AND LOWER(certificate_type) = 'winner'")
    row = c.fetchone()
    assert row is not None, "Alex 1st place winner certificate exists"
    assert row["certificate_type"].lower() == "winner"
    assert row["rank"] == 1, f"Expected rank 1, got {row['rank']}"
    assert "1st Place" in row["award_title"], f"Expected 1st Place in award_title, got {row['award_title']}"
    alex_win_cert_id = row["certificate_id"]
    conn.close()

    # Public verification check
    ver_res = client.get(f"/api/certificates/verify/{alex_win_cert_id}")
    assert ver_res.status_code == 200, "Verification endpoint returns 200"
    vdata = ver_res.json()
    assert vdata["status"] == "Valid"
    assert vdata["certificateType"] == "Winner"
    assert vdata["rank"] == 1
    assert "1st Place" in vdata["awardTitle"]
    print(f"[PASS] SCENARIO 2 PASSED: Winner Certificate {alex_win_cert_id} verified with Rank 1 and 1st Place title.\n")

    # -------------------------------------------------------------------------
    # SCENARIO 3: Team Member Multi-Issuance
    # -------------------------------------------------------------------------
    print("--- SCENARIO 3: Team Member Multi-Issuance ---")
    conn = get_db_connection()
    c = conn.cursor()
    # Check that both Sarah and David got their individual certificates for FinTech Titans
    c.execute("SELECT recipient_id, recipient_name, certificate_id, team_name, rank, award_title FROM certificates WHERE event_id = 'evt_test_hackathon' AND recipient_id IN ('usr_sarah_02', 'usr_david_05') AND LOWER(certificate_type) = 'winner'")
    team_certs = c.fetchall()
    assert len(team_certs) == 2, f"Expected 2 certificates for team members, got {len(team_certs)}"
    recipients = {r["recipient_id"]: dict(r) for r in team_certs}
    assert "usr_sarah_02" in recipients and "usr_david_05" in recipients
    assert recipients["usr_sarah_02"]["team_name"] == "FinTech Titans"
    assert recipients["usr_david_05"]["team_name"] == "FinTech Titans"
    assert recipients["usr_sarah_02"]["rank"] == 2
    assert recipients["usr_david_05"]["rank"] == 2
    assert recipients["usr_sarah_02"]["certificate_id"] != recipients["usr_david_05"]["certificate_id"], "Unique cert IDs per team member"
    conn.close()
    print("[PASS] SCENARIO 3 PASSED: Both team members received individual personalized certificates with Team Name 'FinTech Titans'.\n")

    # -------------------------------------------------------------------------
    # SCENARIO 4: Non-Winner Protection
    # -------------------------------------------------------------------------
    print("--- SCENARIO 4: Non-Winner Protection ---")
    conn = get_db_connection()
    c = conn.cursor()
    # Priya attended and registered for Hackathon, but was NOT placed in event_results
    c.execute("SELECT certificate_id FROM certificates WHERE event_id = 'evt_test_hackathon' AND recipient_id = 'usr_priya_04' AND LOWER(certificate_type) = 'winner'")
    priya_win = c.fetchone()
    assert priya_win is None, "Non-winner participant Priya did NOT receive a winner certificate"
    conn.close()
    print("[PASS] SCENARIO 4 PASSED: Attended student who was not in approved results did NOT receive a Winner certificate.\n")

    # -------------------------------------------------------------------------
    # SCENARIO 5: No Certificate Event Handling
    # -------------------------------------------------------------------------
    print("--- SCENARIO 5: No Certificate Event Handling ---")
    no_cert_res = client.post("/api/certificates/generate-batch", json={
        "eventId": "evt_test_no_cert",
        "certificateType": "all",
        "templateConfig": {
            "title": "Certificate of Attendance",
            "eventName": "Freshman Casual Meetup"
        }
    })
    assert no_cert_res.status_code == 400, f"Expected 400 for No Certificate event, got {no_cert_res.status_code}"
    assert "No Certificate" in no_cert_res.json()["detail"], "Rejection message confirms 'No Certificate' block"
    print(f"[PASS] SCENARIO 5 PASSED: Event configured with ['none'] successfully blocked batch generation ({no_cert_res.json()['detail']}).\n")

    # -------------------------------------------------------------------------
    # SCENARIO 6: Multi-Certificate Access (Participation + Winner for same student/event)
    # -------------------------------------------------------------------------
    print("--- SCENARIO 6: Multi-Certificate Access ---")
    # Generate participation certificates for Hackathon
    hk_part_res = client.post("/api/certificates/generate-batch", json={
        "eventId": "evt_test_hackathon",
        "certificateType": "participation",
        "templateConfig": {
            "title": "Certificate of Participation",
            "eventName": "Campus 24hr Hackathon 2026"
        }
    })
    assert hk_part_res.status_code == 200

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT certificate_id, certificate_type, award_title, rank FROM certificates WHERE event_id = 'evt_test_hackathon' AND recipient_id = 'usr_alex_01' ORDER BY created_at ASC")
    alex_certs = c.fetchall()
    # Alex should have Participation AND Winner for evt_test_hackathon!
    cert_types = [r["certificate_type"].lower() for r in alex_certs]
    assert "participation" in cert_types, "Alex has Participation certificate for Hackathon"
    assert "winner" in cert_types, "Alex also has Winner certificate for Hackathon"
    assert len(alex_certs) >= 2, f"Expected at least 2 credentials for Alex, got {len(alex_certs)}"
    conn.close()

    # Verify query via student list API
    list_res = client.get("/api/certificates?student_id=usr_alex_01&event_id=evt_test_hackathon")
    assert list_res.status_code == 200
    alex_list = list_res.json()["certificates"]
    alex_api_types = [c["certificateType"].lower() for c in alex_list]
    assert "participation" in alex_api_types and "winner" in alex_api_types
    print(f"[PASS] SCENARIO 6 PASSED: Student holds both Participation and Winner credentials for the same event without collision.\n")

    # -------------------------------------------------------------------------
    # SCENARIO 7: Duplicate Prevention
    # -------------------------------------------------------------------------
    print("--- SCENARIO 7: Duplicate Prevention ---")
    # Re-run Winner generation for Hackathon
    hk_win_rerun = client.post("/api/certificates/generate-batch", json={
        "eventId": "evt_test_hackathon",
        "certificateType": "winner",
        "templateConfig": {
            "title": "Certificate of Winner",
            "eventName": "Campus 24hr Hackathon 2026"
        }
    })
    assert hk_win_rerun.status_code == 200
    rerun_data = hk_win_rerun.json()
    assert rerun_data["successfulCount"] == 0, f"Expected 0 new certs on re-run, got {rerun_data['successfulCount']}"
    assert rerun_data["skippedCount"] >= 3, f"Expected all existing winner certs to be skipped, got {rerun_data['skippedCount']}"

    # Verify in DB that count for Alex Winner didn't duplicate
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM certificates WHERE event_id = 'evt_test_hackathon' AND recipient_id = 'usr_alex_01' AND LOWER(certificate_type) = 'winner'")
    win_count = c.fetchone()[0]
    assert win_count == 1, f"Expected exactly 1 Winner cert for Alex, got {win_count}"
    conn.close()
    print("[PASS] SCENARIO 7 PASSED: Duplicate generation was safely blocked; exactly 1 certificate per (event, student, type) exists.\n")

    print("=" * 70)
    print("ALL 7 MULTI-CERTIFICATE VALIDATION SCENARIOS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
