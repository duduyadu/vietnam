@echo off
echo ========================================
echo  베트남 학생 관리 시스템 - 초기 설치
echo ========================================
echo.

:: Node.js 확인
echo Node.js 버전 확인중...
node --version
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다!
    echo https://nodejs.org/ 에서 다운로드하세요.
    pause
    exit
)

echo.
echo ========================================
echo [1/2] 백엔드 패키지 설치중...
echo ========================================
cd backend
call npm install

echo.
echo ========================================
echo [2/2] 프론트엔드 패키지 설치중...
echo ========================================
cd ../frontend
call npm install

echo.
echo ========================================
echo  설치 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. backend/.env 파일 생성 (LOCAL_SETUP.md 참조)
echo 2. frontend/.env 파일 생성 (LOCAL_SETUP.md 참조)
echo 3. start-all.bat 실행
echo ========================================

cd ..
pause