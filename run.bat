@echo off
title GenericSwap - Active Molecule & Generic Medicine Finder
echo ===================================================================
echo   💊 GenericSwap – Active Molecule & Low-Cost Generic Finder
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
echo Starting GenericSwap Full-Stack System...
python run_app.py
pause
