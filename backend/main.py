"""
Eventora - End-to-End Event Management Automation Platform
FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

def load_env_files():
    """Load variables from backend/.env and root .env into os.environ."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, ".env"),
        os.path.join(base_dir, "..", ".env")
    ]
    for env_path in candidates:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip("'\"")
                        if key and key not in os.environ:
                            os.environ[key] = val
            except Exception:
                pass

load_env_files()

from backend.database import init_db
from backend.routes.auth_routes import router as auth_router
from backend.routes.events_routes import router as events_router
from backend.routes.qr_routes import router as qr_router
from backend.routes.attendance_routes import router as attendance_router
from backend.routes.certificates_routes import router as certificates_router
from backend.routes.feedback_routes import router as feedback_router
from backend.routes.analytics_routes import router as analytics_router
from backend.routes.ai_routes import router as ai_router
from backend.routes.venues_routes import router as venues_router
from backend.routes.settings_routes import router as settings_router

app = FastAPI(
    title="Eventora Backend API",
    version="1.0.0",
    description="End-to-End Event Management Automation Platform for Colleges, Universities, and Organizations."
)

# Enable CORS for all frontend origins (React / Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all module routers
app.include_router(auth_router)
app.include_router(events_router)
app.include_router(qr_router)
app.include_router(attendance_router)
app.include_router(certificates_router)
app.include_router(feedback_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(venues_router)
app.include_router(settings_router)

@app.on_event("startup")
def on_startup():
    """Ensure database schema is created and demo data is seeded."""
    init_db()

@app.get("/")
def root():
    return {
        "service": "Eventora API",
        "tagline": "Plan. Automate. Manage. Celebrate.",
        "version": "1.0.0",
        "status": "Operational",
        "docsUrl": "/docs"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "database": "SQLite (Dual Supabase Ready)",
        "modules": [
            "Auth & RBAC",
            "Event Management",
            "15s Dynamic Anti-Fraud QR",
            "Attendance Telemetry",
            "Cryptographic Certificate Studio",
            "5-Criterion Feedback Rubric",
            "30/40/30 Success Score Engine",
            "AI Event Copilot",
            "Campus Venues & Live Map"
        ]
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
