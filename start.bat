@echo off
setlocal

echo =========================================
echo       KavachPay - Launcher
echo =========================================
echo.

:: 1. Check if setup has been run
if not exist "backend\venv" (
    echo [NOTICE] Setup has not been run yet.
    echo Running setup.bat first...
    echo.
    call setup.bat
)

:: 2. Start services
echo Starting KavachPay Services...
echo.

:: 2a. Mock Platform API (Port 5001)
echo [1/3] Launching Mock Platform API...
cd backend
start "KavachPay - Mock API (5001)" cmd /k "venv\Scripts\activate.bat && python mock_platform_api.py"
cd ..

:: 2b. Flask Backend (Port 5000)
echo [2/3] Launching Flask Backend...
cd backend
start "KavachPay - Backend (5000)" cmd /k "venv\Scripts\activate.bat && python app.py"
cd ..

:: 2c. React Frontend (Port 3000)
echo [3/3] Launching React Frontend...
cd frontend
start "KavachPay - Frontend (3000)" cmd /k "npm start"
cd ..

echo.
echo =========================================
echo       All services are starting!
echo =========================================
echo.
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo - Mock API: http://localhost:5001
echo.
echo Press any key to exit this launcher window.
echo (The service windows will remain open)
pause >nul
