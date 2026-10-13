@echo off
echo ==========================================================
echo        GenericSwap: Active Molecule & Generic Finder
echo ==========================================================
echo.
echo Checking python environment...
python --version
if errorlevel 1 (
    echo Python not found. Please install Python 3.10+ and add to PATH.
    pause
    exit /b 1
)

echo Starting FastAPI Backend and Streamlit Frontend...
python run_app.py
pause
