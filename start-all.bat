@echo off
echo ========================================
echo  Vietnam Student Management System
echo ========================================
echo.

echo Current Directory: %CD%
echo.

if not exist "backend" (
    echo [ERROR] backend folder not found!
    echo Please run from vietnam project folder
    pause
    exit
)

if not exist "frontend" (
    echo [ERROR] frontend folder not found!
    echo Please run from vietnam project folder
    pause
    exit
)

echo Starting backend server...
cd backend
start "Backend Server" cmd /k npm start

timeout /t 3 /nobreak > nul

echo Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k npm start

cd ..

echo.
echo ========================================
echo  Servers started!
echo ========================================
echo  Backend: http://localhost:5000
echo  Frontend: http://localhost:3000
echo ========================================
echo.
pause