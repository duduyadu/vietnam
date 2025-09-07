@echo off
echo ========================================
echo  Vietnam Student Management System Setup
echo ========================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download from https://nodejs.org/
    pause
    exit
)

echo.
echo ========================================
echo [1/2] Installing backend packages...
echo ========================================
cd backend
call npm install

echo.
echo ========================================
echo [2/2] Installing frontend packages...
echo ========================================
cd ../frontend
call npm install

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create backend/.env file (see .env.example)
echo 2. Create frontend/.env file
echo 3. Run start-all.bat
echo ========================================

cd ..
pause