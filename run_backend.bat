@echo off
cd /d "%~dp0"
echo ========================================================
echo EVENTORA - Launching FastAPI Backend Server
echo ========================================================
echo Running on http://127.0.0.1:8000
echo Interactive API Docs at http://127.0.0.1:8000/docs
echo.
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
