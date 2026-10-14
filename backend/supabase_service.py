"""
Eventora Supabase Cloud Integration Service
Connects FastAPI backend to Supabase PostgreSQL and Storage buckets.
"""

import os
from pathlib import Path
from typing import Dict, Optional

# Load environment variables from backend/.env or root .env
ENV_FILE = Path(__file__).resolve().parent / ".env"
ROOT_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

def _load_env_file(path: Path):
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip("'\"")
                        if key not in os.environ:
                            os.environ[key] = val
        except Exception:
            pass

_load_env_file(ENV_FILE)
_load_env_file(ROOT_ENV_FILE)

SUPABASE_URL = (os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL") or "https://buznsltebeqmzilreeak.supabase.co").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY") or "sb_publishable_YMiJNAApHXijfMatUvqy0A_XJVV933v"

def get_headers(auth_token: Optional[str] = None) -> Dict[str, str]:
    """Return authorization headers for Supabase REST requests."""
    key = auth_token or SUPABASE_KEY
    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    if key:
        headers["Authorization"] = f"Bearer {key}"
    return headers
