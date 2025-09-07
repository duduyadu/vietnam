# 베트남 유학생 통합 관리 시스템

## 📋 개요
베트남 유학생의 학업, 상담, 행정 정보를 체계적으로 관리하고 지원하는 웹 플랫폼

## 🚀 주요 기능
- **사용자 권한 관리**: 관리자, 교사, 한국 지점별 접근 권한 차별화
- **학생 정보 관리**: 기본 정보, 학업 정보, 재정 정보 통합 관리
- **상담 기록 시스템**: 체계적인 상담 이력 관리 및 평가
- **보고서 생성**: PDF 형식의 종합 생활기록부 생성
- **TOPIK 관리**: 8회차 모의고사 점수 관리 및 진전도 분석
- **다국어 지원**: 한국어/베트남어 UI 지원

## 💻 기술 스택
- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT + bcrypt
- **PDF Generation**: Puppeteer, HTML to PDF
- **Excel Processing**: XLSX library

## 📁 프로젝트 구조
```
vietnam-student-management/
├── frontend/          # React 프론트엔드
├── backend/           # Express 백엔드
├── database/          # 데이터베이스 스키마 및 마이그레이션
└── docs/             # 프로젝트 문서
```

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js 16.x 이상
- PostgreSQL 13.x 이상
- npm 또는 yarn

### 설치 방법
```bash
# 백엔드 설치
cd backend
npm install

# 프론트엔드 설치
cd ../frontend
npm install
```

### 환경 설정
백엔드와 프론트엔드 각각에 `.env` 파일 생성:

**backend/.env**
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000
```

### 실행 방법
```bash
# 백엔드 실행
cd backend
npm start

# 프론트엔드 실행
cd frontend
npm start
```

## 📊 데이터베이스 구조
- `users`: 사용자 계정 정보
- `students`: 학생 기본 정보
- `consultations`: 상담 기록
- `exam_results`: TOPIK 시험 결과
- `teacher_evaluations`: 교사 평가
- `special_activities`: 특별 활동 기록

## 🔒 보안 및 개인정보보호
- 모든 비밀번호는 bcrypt로 암호화
- JWT 기반 인증 시스템
- 역할 기반 접근 제어 (RBAC)
- 민감 정보 암호화 저장

## 📝 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👥 기여
기여를 환영합니다! Pull Request를 보내주세요.

## 📧 문의
프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.