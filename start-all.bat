@echo off
echo ========================================
echo  베트남 학생 관리 시스템 시작
echo ========================================
echo.

:: 백엔드 서버 시작
echo [1/2] 백엔드 서버를 시작합니다...
cd backend
start cmd /k "title Backend Server - Port 5000 && npm start"

:: 잠시 대기 (백엔드가 먼저 시작되도록)
timeout /t 3 /nobreak > nul

:: 프론트엔드 서버 시작
echo [2/2] 프론트엔드 서버를 시작합니다...
cd ../frontend
start cmd /k "title Frontend Server - Port 3000 && npm start"

echo.
echo ========================================
echo  모든 서버가 시작되었습니다!
echo ========================================
echo.
echo  백엔드: http://localhost:5000
echo  프론트엔드: http://localhost:3000
echo.
echo  브라우저가 자동으로 열립니다...
echo.
echo  종료하려면 각 터미널 창을 닫으세요.
echo ========================================

:: 메인 디렉토리로 돌아가기
cd ..

pause