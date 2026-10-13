"""
Database Layer for Eventora
SQLite local development database with automated schema creation,
rich demo dataset seeding, and optional Supabase PostgreSQL sync.
"""

import sqlite3
import json
import os
import hashlib
from typing import List, Dict, Any, Optional
from pathlib import Path

DB_FILE = Path(__file__).parent / "eventora.db"

def get_db_connection() -> sqlite3.Connection:
    """Create a SQLite connection with dict row factory."""
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create all required tables and seed demo dataset if empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        usn TEXT,
        department TEXT,
        semester TEXT DEFAULT 'Fall Semester 2024',
        phone TEXT,
        avatar TEXT,
        badge TEXT,
        interests_json TEXT DEFAULT '[]',
        attendance_rate REAL DEFAULT 90.0,
        attended_count INTEGER DEFAULT 0,
        registered_count INTEGER DEFAULT 0,
        certificates_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        display_date TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        building TEXT DEFAULT 'Tech Center',
        organizer TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        registered_count INTEGER DEFAULT 0,
        attendance_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Published',
        is_live INTEGER DEFAULT 0,
        price TEXT DEFAULT 'Free',
        department TEXT DEFAULT 'Computer Science',
        image TEXT,
        speakers_json TEXT DEFAULT '[]',
        agenda_json TEXT DEFAULT '[]',
        features_json TEXT DEFAULT '{}',
        success_score REAL DEFAULT 90.0,
        match_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. Registrations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        qr_secret TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (student_id) REFERENCES users (id)
    )
    """)

    # 4. Attendance records table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT,
        student_name TEXT NOT NULL,
        usn TEXT,
        event_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'Present',
        method TEXT DEFAULT 'Dynamic QR',
        device_info TEXT,
        verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    """)

    # 5. Anti-fraud audit logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS anti_fraud_logs (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        student TEXT NOT NULL,
        usn TEXT,
        timestamp TEXT NOT NULL,
        result TEXT NOT NULL,
        reason TEXT NOT NULL,
        ip TEXT DEFAULT '127.0.0.1',
        device_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 6. Cryptographic certificates table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        certificate_id TEXT UNIQUE NOT NULL,
        event_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        recipient_email TEXT,
        usn TEXT,
        issue_date TEXT NOT NULL,
        issuer TEXT NOT NULL,
        issuer_title TEXT,
        co_issuer TEXT,
        co_issuer_title TEXT,
        status TEXT DEFAULT 'Verified',
        description TEXT,
        cryptographic_hash TEXT,
        qr_verification_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Safe migrations for certificates
    for col, col_type in [
        ("certificate_type", "TEXT DEFAULT 'Participation'"),
        ("award_title", "TEXT"),
        ("rank", "INTEGER"),
        ("team_name", "TEXT"),
        ("result_id", "TEXT"),
        ("audit_trail_json", "TEXT DEFAULT '[]'"),
        ("template_config_json", "TEXT DEFAULT '{}'")
    ]:
        try:
            cursor.execute(f"ALTER TABLE certificates ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    # Safe migration for events certificate_types_json
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN certificate_types_json TEXT DEFAULT '[\"participation\"]'")
    except Exception:
        pass

    # 6b. Competition results & award allocations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_results (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        award_category TEXT NOT NULL,
        award_title TEXT NOT NULL,
        rank INTEGER,
        is_team INTEGER DEFAULT 0,
        team_name TEXT,
        student_ids_json TEXT NOT NULL DEFAULT '[]',
        student_names_json TEXT NOT NULL DEFAULT '[]',
        project_title TEXT,
        score REAL DEFAULT 0.0,
        judge_notes TEXT,
        status TEXT NOT NULL DEFAULT 'approved',
        approved_by TEXT,
        approved_at TIMESTAMP,
        audit_trail_json TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    """)

    # Safe migrations for event_results
    for col, col_type in [
        ("score", "REAL DEFAULT 0.0"),
        ("judge_notes", "TEXT"),
        ("audit_trail_json", "TEXT DEFAULT '[]'"),
    ]:
        try:
            cursor.execute(f"ALTER TABLE event_results ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    # Safe migrations for registrations (team affiliation and project)
    for col, col_type in [
        ("team_name", "TEXT"),
        ("project_title", "TEXT"),
    ]:
        try:
            cursor.execute(f"ALTER TABLE registrations ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    # 6c. Dedicated competition teams table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        project_title TEXT,
        members_json TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    """)

    # 7. Feedback table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        student_id TEXT,
        student_name TEXT NOT NULL,
        student_avatar TEXT,
        organization_rating INTEGER DEFAULT 5,
        speaker_rating INTEGER DEFAULT 5,
        venue_rating INTEGER DEFAULT 5,
        content_rating INTEGER DEFAULT 5,
        overall_rating INTEGER DEFAULT 5,
        comment TEXT,
        sentiment TEXT DEFAULT 'Positive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 8. Campus Venues table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS venues (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        building TEXT NOT NULL,
        floor TEXT,
        capacity INTEGER NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        current_event TEXT,
        occupancy INTEGER DEFAULT 0,
        occupancy_percent REAL DEFAULT 0.0,
        status TEXT DEFAULT 'Live',
        temperature TEXT DEFAULT '21.5°C',
        speaker TEXT
    )
    """)

    # 9. Notifications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'event',
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 10. System settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Seed if users table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_database(conn)
    
    seed_competition_data(conn)
    conn.close()

def seed_database(conn: sqlite3.Connection):
    """Seed complete, realistic Eventora demo dataset."""
    cursor = conn.cursor()

    # 1. Seed Users (1 Admin + 10 Students)
    users_data = [
        ("usr_admin_01", "Dr. Eleanor Vance", "admin@eventora.demo", "admin", "admin", "EMP001", "Administration", "Chief Academic Officer", "+1 (555) 999-8888", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400", "Chief Academic Officer", json.dumps(["Academic Planning", "Symposiums", "Accreditation"]), 99.0, 45, 12, 18),
        ("usr_alex_01", "Alexander Wright", "student@eventora.demo", "student", "student", "1MS22CS042", "Computer Science", "Fall Semester 2024", "+1 (555) 234-5678", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400", "Active Scholar", json.dumps(["Artificial Intelligence", "Web3", "Cloud Computing", "Hackathons"]), 94.0, 24, 4, 6),
        ("usr_sarah_02", "Sarah Jenkins", "sarah.j@eventora.demo", "student", "student", "1MS22IS019", "Information Science", "Fall Semester 2024", "+1 (555) 345-6789", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400", "Honor Attendee", json.dumps(["UI/UX Design", "Product Management", "Cybersecurity"]), 96.5, 28, 5, 9),
        ("usr_marcus_03", "Marcus Brody", "marcus.b@eventora.demo", "student", "student", "1MS22EC088", "Electronics & Comm.", "Fall Semester 2024", "+1 (555) 456-7890", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400", "Tech Enthusiast", json.dumps(["IoT", "Robotics", "Embedded Systems"]), 88.0, 19, 3, 5),
        ("usr_priya_04", "Priya Sharma", "priya.s@eventora.demo", "student", "student", "1MS22CS112", "Computer Science", "Fall Semester 2024", "+1 (555) 567-8901", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400", "AI Innovator", json.dumps(["Deep Learning", "NLP", "Machine Learning"]), 97.2, 31, 6, 11),
        ("usr_david_05", "David Chen", "david.c@eventora.demo", "student", "student", "1MS22ME034", "Mechanical Eng.", "Fall Semester 2024", "+1 (555) 678-9012", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400", "Design Lead", json.dumps(["3D Printing", "CAD", "Automation"]), 91.0, 22, 2, 7),
        ("usr_elena_06", "Elena Rostova", "elena.r@eventora.demo", "student", "student", "1MS22AI015", "Artificial Intelligence", "Fall Semester 2024", "+1 (555) 789-0123", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400", "Data Scientist", json.dumps(["Computer Vision", "Autonomous Systems"]), 95.0, 26, 4, 8),
        ("usr_rohit_07", "Rohit Verma", "rohit.v@eventora.demo", "student", "student", "1MS22CS075", "Computer Science", "Fall Semester 2024", "+1 (555) 890-1234", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400", "Open Source Contributor", json.dumps(["Fullstack Dev", "DevOps", "Kubernetes"]), 92.5, 20, 3, 6),
        ("usr_ananya_08", "Ananya Iyer", "ananya.i@eventora.demo", "student", "student", "1MS22BT022", "Biotechnology", "Fall Semester 2024", "+1 (555) 901-2345", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400", "Bioinformatics Scholar", json.dumps(["Bioinformatics", "Genomics", "HealthTech"]), 89.0, 18, 2, 4),
        ("usr_jason_09", "Jason Miller", "jason.m@eventora.demo", "student", "student", "1MS22IS055", "Information Science", "Fall Semester 2024", "+1 (555) 012-3456", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400", "Cyber Defender", json.dumps(["Ethical Hacking", "Cryptography", "Network Security"]), 93.8, 25, 4, 8),
        ("usr_tanya_10", "Tanya Sen", "tanya.s@eventora.demo", "student", "student", "1MS22EC041", "Electronics & Comm.", "Fall Semester 2024", "+1 (555) 123-4560", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400", "Event Ambassador", json.dumps(["Public Speaking", "Cultural Events", "Leadership"]), 98.0, 35, 7, 14)
    ]

    for u in users_data:
        pwd_hash = hashlib.sha256("demo123".encode()).hexdigest()
        cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, usn, department, semester, phone, avatar, badge, interests_json, attendance_rate, attended_count, registered_count, certificates_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (u[0], u[1], u[2], pwd_hash, u[3], u[5], u[6], u[7], u[8], u[9], u[10], u[11], u[12], u[13], u[14], u[15]))

    # 2. Seed Venues
    venues = [
        ("ven_auditorium_a", "Auditorium A", "Tech Center", "Ground Floor", 500, 12.9716, 77.5946, "Annual Tech Fest 2026", 462, 92.4, "Live", "21.5°C", "Dr. Eleanor Vance"),
        ("ven_lab_4b", "Lab 4B", "Innovation Hub", "Level 2", 100, 12.9724, 77.5958, "AI & ML Workshop", 85, 85.0, "Live", "22.0°C", "Marcus Brody"),
        ("ven_seminar_3", "Seminar Hall 3", "Student Union", "Level 1", 200, 12.9708, 77.5932, "Web Development Bootcamp", 140, 70.0, "Upcoming", "20.8°C", "Sarah Jenkins"),
        ("ven_science_atrium", "Science Atrium", "Science & Research Block", "Ground Floor", 350, 12.9730, 77.5965, "Cyber Security Awareness Summit", 280, 80.0, "Upcoming", "21.0°C", "Prof. Alan Turing"),
        ("ven_main_arena", "Main Sports Arena", "Athletics Complex", "Ground Floor", 1200, 12.9695, 77.5920, "National Sports Meet 2026", 950, 79.1, "Scheduled", "24.0°C", "Coach Henderson")
    ]
    for v in venues:
        cursor.execute("""
        INSERT INTO venues (id, name, building, floor, capacity, lat, lng, current_event, occupancy, occupancy_percent, status, temperature, speaker)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, v)

    # 3. Seed Events
    events = [
        ("evt_tech_fest_01", "Annual Tech Fest 2026", "The university's flagship technical symposium showcasing student innovations, keynote lectures from industry titans, paper presentations, and robotic exhibits.", "Technical", "2026-10-15", "Oct 15, 2026", "09:00 AM", "05:00 PM", "Auditorium A", "Tech Center", "Dept. of Computer Science & Engineering", 500, 462, 428, "Published", 1, "Free", "Computer Science", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Dr. Eleanor Vance (Chief Academic Officer)", "Sundar Raman (VP Engineering, Vertex Cloud)"]),
         json.dumps([{"time": "09:00 AM", "title": "Inauguration & Keynote Address"}, {"time": "11:00 AM", "title": "AI Innovation Project Exhibition"}, {"time": "01:30 PM", "title": "Networking Lunch"}, {"time": "02:30 PM", "title": "Paper Presentations & Code Sprint"}, {"time": "04:30 PM", "title": "Awards & Closing Ceremony"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": True}), 94.8, "Based on your major in Computer Science and attendance in past AI symposiums."),
        
        ("evt_ai_workshop_02", "AI & ML Workshop: LLMs in Production", "Deep dive into designing, fine-tuning, and deploying enterprise Large Language Models and multi-agent workflows with real-time vector embeddings.", "Workshop", "2026-10-18", "Oct 18, 2026", "10:00 AM", "03:30 PM", "Lab 4B", "Innovation Hub", "AI & Robotics Club", 100, 96, 88, "Published", 0, "₹299", "Artificial Intelligence", "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Marcus Brody (AI Research Fellow)", "Priya Sharma (Deep Learning Engineer)"]),
         json.dumps([{"time": "10:00 AM", "title": "Transformer Architectures from Scratch"}, {"time": "11:45 AM", "title": "Hands-on RAG Pipeline Setup"}, {"time": "01:00 PM", "title": "Lunch Break"}, {"time": "01:45 PM", "title": "Fine-Tuning & Quantization Labs"}, {"time": "03:00 PM", "title": "Q&A & Certificate Verification"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": True}), 92.4, "Direct match for your interest tags 'Artificial Intelligence' and 'Machine Learning'."),
        
        ("evt_hackathon_03", "Global FinTech Hackathon 2026", "36-hour non-stop collegiate hackathon challenging developers to architect scalable financial primitives, fraud prevention AI, and decentralized payments.", "Hackathon", "2026-10-22", "Oct 22-24, 2026", "08:00 AM", "08:00 PM", "Auditorium A", "Tech Center", "FinTech Innovation Cell", 350, 342, 318, "Published", 0, "₹499", "Computer Science", "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Vikramaditya Rao (FinTech Founder)", "Elena Rostova (Quantitative Analyst)"]),
         json.dumps([{"time": "Day 1 08:00 AM", "title": "Opening Ceremony & Problem Statements Release"}, {"time": "Day 1 12:00 PM", "title": "Mentor Check-In 1"}, {"time": "Day 2 09:00 AM", "title": "Mid-way Progress Evaluation"}, {"time": "Day 2 04:00 PM", "title": "Final Code Freeze & Pitch Stage"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": True}), 96.2, "98% Match based on your previous hackathon wins and high attendance velocity."),
        
        ("evt_webdev_04", "Web Development Bootcamp: React 19 & Next.js", "Master modern full-stack web applications with React Server Components, Tailwind CSS, Turbopack, and high-performance serverless backends.", "Bootcamp", "2026-10-25", "Oct 25, 2026", "11:00 AM", "04:00 PM", "Seminar Hall 3", "Student Union", "ACM Student Chapter", 200, 178, 160, "Published", 0, "₹199", "Information Science", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Sarah Jenkins (Staff Frontend Engineer)"]),
         json.dumps([{"time": "11:00 AM", "title": "React 19 Hooks and Transitions"}, {"time": "01:00 PM", "title": "State Management & Performance"}, {"time": "02:30 PM", "title": "Live SaaS Project Build"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": True}), 89.5, "Recommended for Information Science & Computer Science majors."),
        
        ("evt_cybersec_05", "Cyber Security Awareness & Ethical Hacking", "An intensive live demonstration covering zero-day vulnerability discovery, network penetration testing, credential stuffing mitigations, and compliance.", "Seminar", "2026-10-28", "Oct 28, 2026", "02:00 PM", "05:30 PM", "Science Atrium", "Science & Research Block", "InfoSec Division", 350, 310, 295, "Published", 0, "Free", "Information Science", "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Jason Miller (Senior Security Analyst)"]),
         json.dumps([{"time": "02:00 PM", "title": "Current Threat Landscape 2026"}, {"time": "03:15 PM", "title": "Live Capture-the-Flag (CTF) Demo"}, {"time": "04:45 PM", "title": "Career Pathways in Cyber Defense"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": True}), 91.0, "Matches your cybersecurity interest and past campus security workshops."),
        
        ("evt_sports_06", "Annual Inter-Collegiate Sports Meet 2026", "Track and field events, basketball championships, badminton circuits, and football tourneys featuring over 40 participating regional universities.", "Sports", "2026-11-02", "Nov 02-05, 2026", "07:30 AM", "06:00 PM", "Main Sports Arena", "Athletics Complex", "Department of Physical Education", 1200, 980, 910, "Published", 0, "Free", "Sports Council", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Coach Henderson (Olympics Trainer)"]),
         json.dumps([{"time": "07:30 AM", "title": "Torch Relay & March Past"}, {"time": "09:30 AM", "title": "Track Events 100m, 400m, Relay"}, {"time": "02:00 PM", "title": "Team Quarter-Finals"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": False}), 88.0, "Open to all students across all faculties."),
        
        ("evt_cultural_07", "Vibrance 2026: Spring Cultural Festival", "Celebrating arts, acoustic concerts, battle of the bands, classical dances, theater production, and street food carnivals across campus lawns.", "Cultural", "2026-11-10", "Nov 10-12, 2026", "04:00 PM", "10:00 PM", "Auditorium A", "Tech Center", "Student Cultural Union", 800, 760, 720, "Published", 0, "₹350", "Student Affairs", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Tanya Sen (Cultural Secretary)"]),
         json.dumps([{"time": "04:00 PM", "title": "Battle of the Bands"}, {"time": "06:30 PM", "title": "Classical & Contemporary Dance"}, {"time": "08:30 PM", "title": "Celebrity Headliner Concert"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": False}), 93.6, "Highly anticipated campus-wide annual flagship event."),
        
        ("evt_cloud_08", "Cloud Native & DevOps Masterclass", "Hands-on architectural guidance covering Docker containerization, Kubernetes cluster orchestration, GitOps with ArgoCD, and automated cloud deployments.", "Technical", "2026-11-15", "Nov 15, 2026", "10:00 AM", "03:00 PM", "Lab 4B", "Innovation Hub", "Cloud Architecture Club", 120, 115, 104, "Published", 0, "Free", "Computer Science", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
         json.dumps(["Rohit Verma (DevOps Architect)", "Dr. Eleanor Vance"]),
         json.dumps([{"time": "10:00 AM", "title": "Kubernetes Control Plane Overview"}, {"time": "11:30 AM", "title": "Multi-cluster GitOps Architecture"}, {"time": "01:30 PM", "title": "Zero-Downtime Deployments Demo"}]),
         json.dumps({"enableQR": True, "enableCertificate": True, "enableFeedback": True, "enableNotifications": True, "enableAICopilot": True}), 90.2, "Matches your Cloud Computing interest tag.")
    ]

    for ev in events:
        cursor.execute("""
        INSERT INTO events (id, title, description, category, date, display_date, start_time, end_time, venue, building, organizer, capacity, registered_count, attendance_count, status, is_live, price, department, image, speakers_json, agenda_json, features_json, success_score, match_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ev)

    # 4. Seed Registrations
    registrations = [
        ("reg_01", "evt_tech_fest_01", "usr_alex_01", "confirmed"),
        ("reg_02", "evt_ai_workshop_02", "usr_alex_01", "confirmed"),
        ("reg_03", "evt_hackathon_03", "usr_alex_01", "confirmed"),
        ("reg_04", "evt_cloud_08", "usr_alex_01", "confirmed"),
        ("reg_05", "evt_tech_fest_01", "usr_sarah_02", "confirmed"),
        ("reg_06", "evt_webdev_04", "usr_sarah_02", "confirmed"),
        ("reg_07", "evt_cybersec_05", "usr_sarah_02", "confirmed"),
        ("reg_08", "evt_tech_fest_01", "usr_marcus_03", "confirmed"),
        ("reg_09", "evt_ai_workshop_02", "usr_marcus_03", "confirmed"),
        ("reg_10", "evt_tech_fest_01", "usr_priya_04", "confirmed"),
        ("reg_11", "evt_ai_workshop_02", "usr_priya_04", "confirmed"),
        ("reg_12", "evt_hackathon_03", "usr_priya_04", "confirmed"),
        ("reg_13", "evt_tech_fest_01", "usr_david_05", "confirmed"),
        ("reg_14", "evt_sports_06", "usr_david_05", "confirmed"),
        ("reg_15", "evt_tech_fest_01", "usr_elena_06", "confirmed"),
        ("reg_16", "evt_ai_workshop_02", "usr_elena_06", "confirmed"),
        ("reg_17", "evt_hackathon_03", "usr_elena_06", "confirmed"),
        ("reg_18", "evt_tech_fest_01", "usr_rohit_07", "confirmed"),
        ("reg_19", "evt_cloud_08", "usr_rohit_07", "confirmed"),
        ("reg_20", "evt_tech_fest_01", "usr_ananya_08", "confirmed"),
        ("reg_21", "evt_tech_fest_01", "usr_jason_09", "confirmed"),
        ("reg_22", "evt_cybersec_05", "usr_jason_09", "confirmed"),
        ("reg_23", "evt_tech_fest_01", "usr_tanya_10", "confirmed"),
        ("reg_24", "evt_cultural_07", "usr_tanya_10", "confirmed"),
        ("reg_25", "evt_sports_06", "usr_tanya_10", "confirmed")
    ]
    for r in registrations:
        cursor.execute("INSERT INTO registrations (id, event_id, student_id, status) VALUES (?, ?, ?, ?)", r)

    # 5. Seed Attendance
    attendance_records = [
        ("att_01", "usr_alex_01", "Alexander Wright", "1MS22CS042", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:12 AM", "Present", "Dynamic QR", "Admin Scanner 1", 1),
        ("att_02", "usr_sarah_02", "Sarah Jenkins", "1MS22IS019", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:14 AM", "Present", "Dynamic QR", "Admin Scanner 1", 1),
        ("att_03", "usr_marcus_03", "Marcus Brody", "1MS22EC088", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:38 AM", "Late", "Manual Entry", "Admin Desk", 1),
        ("att_04", "usr_priya_04", "Priya Sharma", "1MS22CS112", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:05 AM", "Present", "Dynamic QR", "Admin Scanner 2", 1),
        ("att_05", "usr_david_05", "David Chen", "1MS22ME034", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:18 AM", "Present", "Dynamic QR", "Admin Scanner 2", 1),
        ("att_06", "usr_elena_06", "Elena Rostova", "1MS22AI015", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:08 AM", "Present", "Dynamic QR", "Admin Scanner 1", 1),
        ("att_07", "usr_rohit_07", "Rohit Verma", "1MS22CS075", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:21 AM", "Present", "Dynamic QR", "Admin Scanner 3", 1),
        ("att_08", "usr_jason_09", "Jason Miller", "1MS22IS055", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "09:25 AM", "Present", "Dynamic QR", "Admin Scanner 1", 1),
        ("att_09", "usr_tanya_10", "Tanya Sen", "1MS22EC041", "evt_tech_fest_01", "Annual Tech Fest 2026", "2026-10-15", "08:58 AM", "Present", "Dynamic QR", "Admin Scanner 2", 1),
        ("att_10", "usr_alex_01", "Alexander Wright", "1MS22CS042", "evt_hackathon_03", "Global FinTech Hackathon", "2026-09-20", "08:15 AM", "Present", "Dynamic QR", "Main Gate", 1),
        ("att_11", "usr_alex_01", "Alexander Wright", "1MS22CS042", "evt_cloud_08", "Cloud Computing Workshop", "2026-09-12", "10:04 AM", "Present", "Dynamic QR", "Lab Scanner", 1)
    ]
    for a in attendance_records:
        cursor.execute("""
        INSERT INTO attendance (id, student_id, student_name, usn, event_id, event_name, date, time, status, method, device_info, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, a)

    # 6. Seed Anti-fraud Logs
    fraud_logs = [
        ("log_01", "evt_tech_fest_01", "Alexander Wright", "1MS22CS042", "10:14:22 AM", "Valid", "Token authenticated within 15s window", "192.168.1.104"),
        ("log_02", "evt_tech_fest_01", "Sarah Jenkins", "1MS22IS019", "10:14:35 AM", "Valid", "Token authenticated within 15s window", "192.168.1.112"),
        ("log_03", "evt_tech_fest_01", "Unknown / Device #91", "1MS22EC012", "10:15:02 AM", "Rejected", "Expired token rotation (age: 42s)", "10.0.4.19"),
        ("log_04", "evt_tech_fest_01", "Marcus Brody", "1MS22EC088", "10:15:18 AM", "Duplicate", "Already marked Present at 09:38 AM", "192.168.1.108"),
        ("log_05", "evt_tech_fest_01", "Priya Sharma", "1MS22CS112", "10:15:40 AM", "Valid", "Token authenticated within 15s window", "192.168.1.125"),
        ("log_06", "evt_tech_fest_01", "Device Spoofing #03", "1MS22CS999", "10:16:01 AM", "Fraud Attempt", "Invalid cryptographic HMAC signature", "45.33.32.156")
    ]
    for f in fraud_logs:
        cursor.execute("INSERT INTO anti_fraud_logs (id, event_id, student, usn, timestamp, result, reason, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", f)

    # 7. Seed Certificates
    certs = [
        ("cert_01", "CERT-894201-ET25", "evt_tech_fest_01", "Annual Tech Fest 2026", "usr_alex_01", "Alexander Wright", "student@eventora.demo", "1MS22CS042", "October 16, 2026", "Dr. Eleanor Vance", "Chief Academic Officer", "Marcus Sterling", "Event Director, ET26", "Verified", "For successfully completing and actively participating in the premier technology conference Annual Tech Fest 2026, demonstrating exceptional engagement in AI architectures and enterprise scalability.", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "http://localhost:5173/verify/CERT-894201-ET25"),
        ("cert_02", "CERT-772109-ML26", "evt_ai_workshop_02", "AI & ML Workshop: LLMs in Production", "usr_alex_01", "Alexander Wright", "student@eventora.demo", "1MS22CS042", "September 18, 2026", "Dr. Eleanor Vance", "Chief Academic Officer", "Priya Sharma", "Lead AI Researcher", "Verified", "Demonstrated mastery in deploying Retrieval-Augmented Generation (RAG) pipelines and fine-tuning open-weights models.", "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", "http://localhost:5173/verify/CERT-772109-ML26"),
        ("cert_03", "CERT-661204-FH26", "evt_hackathon_03", "Global FinTech Hackathon 2026", "usr_alex_01", "Alexander Wright", "student@eventora.demo", "1MS22CS042", "September 24, 2026", "Dr. Eleanor Vance", "Chief Academic Officer", "Vikramaditya Rao", "Head of FinTech Cell", "Verified", "Awarded for Outstanding Technical Innovation and 36-hour sprint completion in decentralized payment routing.", "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce", "http://localhost:5173/verify/CERT-661204-FH26"),
        ("cert_04", "CERT-552011-CC26", "evt_cloud_08", "Cloud Native & DevOps Masterclass", "usr_alex_01", "Alexander Wright", "student@eventora.demo", "1MS22CS042", "August 29, 2026", "Dr. Eleanor Vance", "Chief Academic Officer", "Rohit Verma", "DevOps Lead", "Verified", "Demonstrated excellence in container orchestration and zero-downtime blue/green deployment pipelines.", "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a", "http://localhost:5173/verify/CERT-552011-CC26"),
        ("cert_05", "CERT-441092-WD26", "evt_webdev_04", "Web Development Bootcamp", "usr_sarah_02", "Sarah Jenkins", "sarah.j@eventora.demo", "1MS22IS019", "July 15, 2026", "Dr. Eleanor Vance", "Chief Academic Officer", "Marcus Sterling", "Director", "Verified", "High distinction in modern full-stack application development with React 19.", "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d", "http://localhost:5173/verify/CERT-441092-WD26")
    ]
    for c in certs:
        cursor.execute("""
        INSERT INTO certificates (id, certificate_id, event_id, event_name, recipient_id, recipient_name, recipient_email, usn, issue_date, issuer, issuer_title, co_issuer, co_issuer_title, status, description, cryptographic_hash, qr_verification_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, c)

    # 8. Seed Feedback
    feedback_entries = [
        ("fb_01", "evt_tech_fest_01", "Annual Tech Fest 2026", "usr_alex_01", "Alexander Wright", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400", 5, 5, 4, 5, 5, "Exceptional symposium! The keynote by Sundar Raman was deeply insightful, and check-in via the dynamic QR scanner was instant with zero waiting lines.", "Positive"),
        ("fb_02", "evt_tech_fest_01", "Annual Tech Fest 2026", "usr_sarah_02", "Sarah Jenkins", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400", 5, 5, 5, 5, 5, "The automated certificate vault issuing certificates right after the event was unbelievable. Truly professional SaaS experience.", "Positive"),
        ("fb_03", "evt_ai_workshop_02", "AI & ML Workshop", "usr_marcus_03", "Marcus Brody", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400", 4, 5, 4, 5, 4, "High quality hands-on code examples for RAG pipelines. Would love a 2-day extended session next semester!", "Positive"),
        ("fb_04", "evt_hackathon_03", "Global FinTech Hackathon", "usr_priya_04", "Priya Sharma", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400", 5, 4, 5, 5, 5, "Best collegiate hackathon organization I have seen. Mentorship support was responsive 24/7.", "Positive")
    ]
    for fb in feedback_entries:
        cursor.execute("""
        INSERT INTO feedback (id, event_id, event_name, student_id, student_name, student_avatar, organization_rating, speaker_rating, venue_rating, content_rating, overall_rating, comment, sentiment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, fb)

    # 9. Seed Notifications
    notifs = [
        ("notif_01", "usr_alex_01", "Registration Confirmed", "You are registered for 'Annual Tech Fest 2026'. Your dynamic QR pass is ready in your dashboard.", "registration", 0),
        ("notif_02", "usr_alex_01", "Event Starts Soon", "'Annual Tech Fest 2026' starts in 14 hours at Auditorium A. Check in early to reserve priority front seating.", "event", 0),
        ("notif_03", "usr_alex_01", "Certificate Generated", "Your verified credential for 'Global FinTech Hackathon' has been cryptographically signed and stored in your vault.", "certificate", 1),
        ("notif_04", "usr_alex_01", "New AI Recommendation", "'AI & ML Workshop: LLMs in Production' matches 98% of your computer science interest profile.", "recommendation", 1)
    ]
    for n in notifs:
        cursor.execute("INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)", n)

    conn.commit()

def seed_competition_data(conn: sqlite3.Connection):
    """Ensure competition teams, team-level registrations, and audited results exist for testing."""
    cursor = conn.cursor()
    hackathon_id = "evt_hackathon_03"

    # 1. Seed Teams
    teams_data = [
        ("team_codecrafters", hackathon_id, "CodeCrafters", "Autonomous Agentic IDE", json.dumps(["usr_alex_01", "usr_sarah_02"])),
        ("team_cyberknights", hackathon_id, "CyberKnights", "Quantum Intrusion Defense", json.dumps(["usr_david_05", "usr_priya_04"])),
        ("team_datadynamos", hackathon_id, "DataDynamos", "Predictive Agro Analytics", json.dumps(["usr_rohit_07", "usr_ananya_08"])),
    ]
    for tid, eid, tname, ptitle, members in teams_data:
        cursor.execute("""
        INSERT OR IGNORE INTO teams (id, event_id, name, project_title, members_json)
        VALUES (?, ?, ?, ?, ?)
        """, (tid, eid, tname, ptitle, members))

    # 2. Update Registrations with Team Affiliations
    team_member_mappings = [
        ("usr_alex_01", "CodeCrafters", "Autonomous Agentic IDE"),
        ("usr_sarah_02", "CodeCrafters", "Autonomous Agentic IDE"),
        ("usr_david_05", "CyberKnights", "Quantum Intrusion Defense"),
        ("usr_priya_04", "CyberKnights", "Quantum Intrusion Defense"),
        ("usr_rohit_07", "DataDynamos", "Predictive Agro Analytics"),
        ("usr_ananya_08", "DataDynamos", "Predictive Agro Analytics"),
        ("usr_elena_06", None, "AI Health Diagnostics"),
        ("usr_marcus_03", None, "Decentralized Energy Grid"),
    ]

    for sid, tname, ptitle in team_member_mappings:
        cursor.execute("SELECT id FROM registrations WHERE event_id = ? AND student_id = ?", (hackathon_id, sid))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE registrations SET team_name = ?, project_title = ? WHERE id = ?", (tname, ptitle, row[0]))
        else:
            reg_id = f"reg_hk_{sid}"
            cursor.execute("""
            INSERT OR REPLACE INTO registrations (id, event_id, student_id, status, team_name, project_title)
            VALUES (?, ?, ?, 'confirmed', ?, ?)
            """, (reg_id, hackathon_id, sid, tname, ptitle))

    # 3. Ensure Verified Attendance for Hackathon Participants
    student_details = {
        "usr_alex_01": ("Alexander Wright", "1MS22CS042"),
        "usr_sarah_02": ("Sarah Jenkins", "1MS22IS019"),
        "usr_david_05": ("David Chen", "1MS22ME034"),
        "usr_priya_04": ("Priya Sharma", "1MS22CS112"),
        "usr_rohit_07": ("Rohit Verma", "1MS22CS075"),
        "usr_ananya_08": ("Ananya Iyer", "1MS22BT022"),
        "usr_elena_06": ("Elena Rostova", "1MS22AI015"),
        "usr_marcus_03": ("Marcus Brody", "1MS22EC088"),
    }
    for sid, (sname, susn) in student_details.items():
        cursor.execute("SELECT id FROM attendance WHERE event_id = ? AND student_id = ?", (hackathon_id, sid))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT OR REPLACE INTO attendance (id, student_id, student_name, usn, event_id, event_name, date, time, status, method, verified)
            VALUES (?, ?, ?, ?, ?, 'Global FinTech Hackathon 2026', '2026-10-22', '08:30 AM', 'Present', 'Dynamic QR', 1)
            """, (f"att_hk_{sid}", sid, sname, susn, hackathon_id))

    # 4. Ensure Competition Results exist with audit trail & scores if table empty for hackathon
    cursor.execute("SELECT COUNT(*) FROM event_results WHERE event_id = ?", (hackathon_id,))
    if cursor.fetchone()[0] == 0:
        initial_audit = json.dumps([{
            "timestamp": "2026-10-24T18:00:00Z",
            "actor": "Dr. Eleanor Vance (Chief Academic Officer)",
            "action": "created_and_approved",
            "notes": "Official judging panel score compilation and podium verification."
        }])
        initial_results = [
            ("res_hk_01", hackathon_id, "winner", "1st Place (Champion)", 1, 1, "CodeCrafters",
             json.dumps(["usr_alex_01", "usr_sarah_02"]), json.dumps(["Alexander Wright", "Sarah Jenkins"]),
             "Autonomous Agentic IDE", 98.5, "Flawless architecture, autonomous tool execution, outstanding presentation.",
             "approved", "Dr. Eleanor Vance", "2026-10-24T18:00:00Z", initial_audit),

            ("res_hk_02", hackathon_id, "winner", "2nd Place (Runner-Up)", 2, 1, "CyberKnights",
             json.dumps(["usr_david_05", "usr_priya_04"]), json.dumps(["David Chen", "Priya Sharma"]),
             "Quantum Intrusion Defense", 94.0, "Robust cryptographic primitives, solid threat prevention simulation.",
             "approved", "Dr. Eleanor Vance", "2026-10-24T18:00:00Z", initial_audit),

            ("res_hk_03", hackathon_id, "winner", "3rd Place", 3, 1, "DataDynamos",
             json.dumps(["usr_rohit_07", "usr_ananya_08"]), json.dumps(["Rohit Verma", "Ananya Iyer"]),
             "Predictive Agro Analytics", 90.5, "Impressive data pipeline and intuitive farmer dashboard.",
             "approved", "Dr. Eleanor Vance", "2026-10-24T18:00:00Z", initial_audit),

            ("res_hk_04", hackathon_id, "achievement", "Best Innovation", None, 0, None,
             json.dumps(["usr_elena_06"]), json.dumps(["Elena Rostova"]),
             "AI Health Diagnostics", 92.0, "Groundbreaking edge-vision model with real-time inference.",
             "approved", "Dr. Eleanor Vance", "2026-10-24T18:00:00Z", initial_audit),
        ]
        for r in initial_results:
            cursor.execute("""
            INSERT INTO event_results (
                id, event_id, award_category, award_title, rank, is_team, team_name,
                student_ids_json, student_names_json, project_title, score, judge_notes,
                status, approved_by, approved_at, audit_trail_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, r)

    conn.commit()
