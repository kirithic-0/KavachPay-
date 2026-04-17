@echo off
echo =========================================
echo       Starting KavachPay...
echo =========================================
echo.

:: 1. Start the Backend
echo [1/2] Starting Flask Backend...
cd backend

:: Check if virtual environment exists, if not create it
if not exist "venv\Scripts\activate.bat" (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Activate venv and install dependencies quietly
call venv\Scripts\activate.bat
echo Installing backend requirements (if any missing)...
pip install -r requirements.txt >nul 2>&1

:: Start the backend in a new cmd window
start "KavachPay Backend (Port 5000)" cmd /k "venv\Scripts\activate.bat && python app.py"

cd ..

:: 2. Start the Frontend
echo [2/2] Starting React Frontend...
cd frontend

:: Install npm dependencies quietly
echo Installing frontend dependencies (if any missing)...
call npm install --no-audit --no-fund >nul 2>&1

:: Start the frontend in a new cmd window
start "KavachPay Frontend (Port 3000)" cmd /k "npm start"

cd ..

:: 3. Completion Message
echo.
echo =========================================
echo Both servers are starting in separate windows!
echo - Backend will run on: http://localhost:5000
echo - Frontend will run on: http://localhost:3000
echo =========================================
echo.
pause
