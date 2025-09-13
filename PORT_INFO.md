# 포트 정보 (PORT INFORMATION)

## 현재 실행 중인 포트

### Backend Server
- **실행 포트**: `5000`
- **설정 위치**:
  - `/backend/.env` 파일: `PORT=5000`
  - `/backend/server.js`: `const PORT = process.env.PORT || 5001`
- **접속 URL**: http://localhost:5000
- **상태**: ✅ 정상 작동

### Frontend Server
- **실행 포트**: `3001`
- **설정 위치**: React 기본 설정
- **접속 URL**: http://localhost:3001
- **상태**: ✅ 정상 작동

## 포트 확인 방법

### Windows
```bash
# 사용 중인 포트 확인
netstat -an | findstr "LISTENING" | findstr ":5000 :3001"
```

### 서버 실행 방법

#### Backend
```bash
cd backend
npm start
# 포트 5000에서 실행됨
```

#### Frontend
```bash
cd frontend
npm start
# 포트 3001에서 실행됨
```

## 주의사항
- Backend의 경우 .env 파일의 PORT 환경변수가 우선 적용됩니다
- Frontend는 3001 포트를 사용합니다 (3000이 아님)
- 두 서버 모두 실행되어야 정상적으로 애플리케이션이 작동합니다

---
*최종 업데이트: 2025-09-13*