@echo off
cd /d "%~dp0"
echo ========================================================
echo EVENTORA - End-to-End Event Management Automation Platform
echo "Plan. Automate. Manage. Celebrate."
echo ========================================================
echo Starting FastAPI Backend (Port 8000)...
start "Eventora Backend" cmd /k "%~dp0run_backend.bat"

echo Starting Vite React Frontend (Port 5173)...
start "Eventora Frontend" cmd /k "%~dp0run_frontend.bat"

echo.
echo ========================================================
echo Platform services launched!
echo - Frontend URL: http://localhost:5173
echo - Backend API:  http://127.0.0.1:8000
echo - Swagger Docs: http://127.0.0.1:8000/docs
echo ========================================================
