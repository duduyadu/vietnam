# 🚀 로컬 개발 환경 설정 가이드

## 📋 필수 설치 프로그램

### 1. Node.js (필수)
- **다운로드**: https://nodejs.org/
- **버전**: 16.x 이상 (LTS 버전 권장)
- 설치 확인: `node --version`

### 2. PostgreSQL (필수)
- **다운로드**: https://www.postgresql.org/download/
- **또는 Supabase 사용** (클라우드 DB - 무료): https://supabase.com/
- 설치 확인: `psql --version`

### 3. Git (이미 설치됨)
- 설치 확인: `git --version`

### 4. VS Code (권장)
- **다운로드**: https://code.visualstudio.com/

## 🔧 프로젝트 설정

### 1단계: 프로젝트 클론 (이미 완료)
```bash
cd C:\Users\dudu\Documents\GitHub\vietnam
```

### 2단계: 백엔드 설정

#### 1. 백엔드 폴더로 이동
```bash
cd backend
```

#### 2. 패키지 설치
```bash
npm install
```

#### 3. 환경 변수 파일 생성
`backend/.env` 파일을 만들고 아래 내용 입력:

```env
# 데이터베이스 설정 (둘 중 하나 선택)

# 옵션 1: 로컬 PostgreSQL 사용시
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/vietnam_students

# 옵션 2: Supabase 사용시 (무료)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT 설정
JWT_SECRET=your-secret-key-change-this-in-production

# 서버 포트
PORT=5000

# Supabase 설정 (Supabase 사용시만)
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

#### 4. 데이터베이스 초기화
```bash
# 마이그레이션 실행
npm run migrate

# 초기 데이터 생성
npm run seed
```

### 3단계: 프론트엔드 설정

#### 1. 새 터미널 열고 프론트엔드 폴더로 이동
```bash
cd C:\Users\dudu\Documents\GitHub\vietnam\frontend
```

#### 2. 패키지 설치
```bash
npm install
```

#### 3. 환경 변수 파일 생성
`frontend/.env` 파일을 만들고:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 🎯 프로젝트 실행

### 방법 1: 각각 실행 (2개 터미널 필요)

**터미널 1 - 백엔드:**
```bash
cd backend
npm start
```
백엔드가 http://localhost:5000 에서 실행됩니다.

**터미널 2 - 프론트엔드:**
```bash
cd frontend
npm start
```
프론트엔드가 http://localhost:3000 에서 실행됩니다.

### 방법 2: 일괄 실행 스크립트 (Windows)

프로젝트 루트에서 `start-all.bat` 실행:
```bash
start-all.bat
```

## 🔑 초기 로그인 정보

### 관리자 계정
- **아이디**: admin
- **비밀번호**: admin123 (특수문자 없음!)

### 테스트 교사 계정
- **아이디**: teacher1
- **비밀번호**: teacher123

## 📁 폴더 구조

```
vietnam/
├── backend/               # 백엔드 서버
│   ├── routes/           # API 라우트
│   ├── services/         # 비즈니스 로직
│   ├── database/         # DB 마이그레이션
│   └── templates/        # PDF 템플릿
├── frontend/             # React 프론트엔드
│   ├── src/
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── components/  # 재사용 컴포넌트
│   │   └── services/    # API 호출
│   └── public/          # 정적 파일
└── database/            # SQL 스크립트
```

## 🛠️ 자주 사용하는 명령어

### 백엔드
```bash
npm start          # 서버 시작
npm run dev        # 개발 모드 (자동 재시작)
npm run migrate    # DB 마이그레이션
npm run seed       # 샘플 데이터 생성
```

### 프론트엔드
```bash
npm start          # 개발 서버 시작
npm run build      # 배포용 빌드
npm test          # 테스트 실행
```

## ❗ 문제 해결

### 포트 충돌 (이미 사용 중)
```bash
# Windows에서 포트 확인
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID [프로세스ID] /F
```

### npm 패키지 설치 오류
```bash
# 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### 데이터베이스 연결 오류
1. PostgreSQL 서비스 실행 확인
2. `.env` 파일의 DATABASE_URL 확인
3. 방화벽 설정 확인

## 📝 개발 팁

1. **VS Code 확장 프로그램 추천**:
   - ESLint
   - Prettier
   - Thunder Client (API 테스트)
   - PostgreSQL

2. **브라우저 개발자 도구**:
   - F12로 콘솔 확인
   - Network 탭에서 API 호출 확인

3. **Git 작업**:
   ```bash
   git pull              # 최신 코드 받기
   git add .             # 변경사항 추가
   git commit -m "설명"   # 커밋
   git push              # GitHub에 올리기
   ```

## 📞 추가 도움말

문제가 생기면:
1. 콘솔 에러 메시지 확인
2. `backend/logs` 폴더의 로그 파일 확인
3. GitHub Issues에 문의

---
**준비 완료!** 이제 http://localhost:3000 에서 시스템을 사용할 수 있습니다.