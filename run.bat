@echo off
title Eventora - End-to-End Campus Event Management Platform
echo ===================================================================
echo   🎓 Eventora – Campus Event Management, Dynamic QR & Credentials
echo ===================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not recognized in your PATH.
    pause
    exit /b 1
)

:: Launch Full-Stack Web Application (FastAPI + React)
echo Starting Eventora Full-Stack System...
python run_app.py
pause
