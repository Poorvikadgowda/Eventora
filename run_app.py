"""
GenericSwap Full-Stack Web Application Runner:
1. Spawns FastAPI Backend (port 8000)
2. Spawns Vite React Frontend (port 3000)
3. Opens default browser to http://localhost:3000
4. Connects AI/OCR Services, SQLite Database, and Pharmacy Geo Locator
"""

import subprocess
import sys
import os
import time
import requests
import webbrowser
from pathlib import Path


def wait_for_fastapi(timeout=20):
    print("⏳ Waiting for GenericSwap FastAPI backend to initialize...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get("http://127.0.0.1:8000/api/health", timeout=1)
            if r.status_code == 200:
                print("✅ FastAPI REST API is live and healthy on http://127.0.0.1:8000")
                return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def wait_for_frontend(timeout=25):
    print("⏳ Waiting for Vite React frontend to initialize...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get("http://localhost:3000", timeout=1)
            if r.status_code == 200:
                print("✅ React Frontend is live on http://localhost:3000")
                return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def main():
    root_dir = Path(__file__).resolve().parent

    print("=" * 65)
    print("  💊 GENERICSWAP: ACTIVE MOLECULE & LOW-COST GENERIC FINDER")
    print("  Arch: React Frontend -> REST API -> FastAPI -> SQLite DB")
    print("=" * 65)

    # 1. Start FastAPI Backend
    print("🚀 [1/2] Launching FastAPI backend server on port 8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=str(root_dir)
    )

    if not wait_for_fastapi():
        print("❌ Backend failed to start. Terminating.")
        backend_proc.terminate()
        sys.exit(1)

    # 2. Start Vite React Frontend
    print("🚀 [2/2] Launching modern React frontend on port 3000...")
    if os.name == "nt":
        frontend_cmd = ["cmd.exe", "/c", "npm", "run", "dev"]
    else:
        frontend_cmd = ["npm", "run", "dev"]

    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(root_dir)
    )

    # Wait for frontend to be available
    wait_for_frontend()

    print("\n" + "=" * 65)
    print("  🎉 GenericSwap Full-Stack Application is running!")
    print("  👉 Modern React Web App     : http://localhost:3000")
    print("  👉 FastAPI Interactive Docs : http://localhost:8000/docs")
    print("  👉 Alternative Streamlit UI : python -m streamlit run frontend/app.py")
    print("=" * 65)
    print("Press Ctrl+C to terminate all services.\n")

    # Automatically open the browser
    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    try:
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down GenericSwap services...")
    finally:
        frontend_proc.terminate()
        backend_proc.terminate()
        print("GenericSwap services stopped cleanly.")


if __name__ == "__main__":
    main()
