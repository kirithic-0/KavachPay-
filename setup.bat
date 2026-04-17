@echo off
setlocal enabledelayedexpansion

echo =========================================
echo       KavachPay - Environment Setup
echo =========================================
echo.

:: 1. Check Prerequisites
echo [1/5] Checking Prerequisites...

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Please install Python 3.x and add it to PATH.
    pause
    exit /b 1
)
echo - Python found.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js and add it to PATH.
    pause
    exit /b 1
)
echo - Node.js found.

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found! Please ensure Node.js is installed correctly.
    pause
    exit /b 1
)
echo - npm found.

:: 2. Setup Environment Variables
echo.
echo [2/5] Setting up Environment Variables...

if not exist "backend\.env" (
    echo - Creating backend/.env from example...
    copy "backend\.env.example" "backend\.env" >nul
) else (
    echo - backend/.env already exists.
)

if not exist "frontend\.env" (
    echo - Creating frontend/.env from example...
    copy "frontend\.env.example" "frontend\.env" >nul
) else (
    echo - frontend/.env already exists.
)

:: 3. Setup Backend (Python)
echo.
echo [3/5] Setting up Flask Backend...

cd backend
if not exist "venv\Scripts\activate.bat" (
    echo - Creating virtual environment...
    python -m venv venv
)

echo - Installing backend requirements...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
cd ..

:: 4. Setup Frontend (Node)
echo.
echo [4/5] Setting up React Frontend...

cd frontend
echo - Installing frontend dependencies (this may take a minute)...
call npm install --no-audit --no-fund --quiet
cd ..

:: 5. Verification
echo.
echo [5/5] Final Checks...

if not exist "backend\firebase-credentials.json" (
    echo.
    echo [IMPORTANT] Missing 'backend/firebase-credentials.json'!
    echo Please place your Firebase service account key in the backend folder
    echo and rename it to 'firebase-credentials.json' before running start.bat.
)

echo.
echo =========================================
echo       Setup Complete!
echo =========================================
echo You can now run 'start.bat' to launch the application.
echo.
pause
