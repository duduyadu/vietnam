# 베트남 유학생 통합 관리 시스템 - 프로젝트 히스토리

## 📋 프로젝트 개요

### 프로그램명
베트남 유학생 통합 관리 시스템

### 목표
베트남 유학생의 학업, 상담, 행정 정보를 체계적으로 관리하고 지원하는 웹 플랫폼

### 교육 과정 현실
- **교육 기간**: 3-5개월 (베트남 현지 유학원)
- **평가 체계**: 
  - 1차 평가: 입학 후 2-3주 (초기 적응)
  - 2차 평가: 2개월차 (중간)
  - 3차 평가: 3-4개월차 (후반)
  - 최종 평가: 한국 출국 전

### 대상 사용자 (권한별)
- **관리자 (Admin)**: 모든 기능 사용 가능, 시스템 전체 관리
- **유학원 교사 (Teacher)**: 소속 유학원 학생 정보만 생성/수정/조회
- **한국 지점 (Branch)**: 모든 학생 정보 조회 및 상담/시험 기록 추가

## 🏗️ 시스템 아키텍처

### 기술 스택 (CLAUDE.md 권장사항 기반)
- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase)
- **PDF Generation**: HTML to PDF
- **Excel Processing**: XLSX library
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel (Frontend) + Railway (Backend)

### 모놀리식 아키텍처
'작은 식당'처럼 하나의 통합된 시스템으로 구성
- 초보자가 이해하고 관리하기 쉬움
- 모든 기능이 하나의 코드베이스에 포함
- 단순한 배포 및 유지보수

## 📁 프로젝트 구조

```
vietnam-student-management/
├── frontend/                      # React 프론트엔드
│   ├── src/
│   │   ├── components/           # 재사용 가능한 컴포넌트
│   │   │   ├── EnhancedConsultationModal.tsx      # 일반 상담 모달
│   │   │   ├── ReportFocusedConsultationModal.tsx # 보고서용 평가 모달
│   │   │   └── StudentSelectionDialog.tsx         # 학생 선택 다이얼로그
│   │   ├── pages/                # 페이지 컴포넌트
│   │   │   ├── Dashboard.tsx     # 대시보드
│   │   │   ├── Students.tsx      # 학생 관리
│   │   │   ├── StudentDetail.tsx # 학생 상세 (읽기 전용)
│   │   │   ├── Consultations.tsx # 상담 관리
│   │   │   └── Reports.tsx       # 보고서 생성
│   │   └── services/             # API 서비스
│   │       └── api.ts            # API 통신 로직
├── backend/                       # Express 백엔드
│   ├── routes/
│   │   ├── auth.js              # 인증 라우트
│   │   ├── students.js          # 학생 CRUD
│   │   ├── consultations.js     # 상담 관리
│   │   ├── topik-scores-upload.js # TOPIK 엑셀 업로드
│   │   ├── excel-export.js      # 엑셀 다운로드
│   │   └── pdf-reports-v2.js    # PDF 보고서 생성
│   ├── middleware/
│   │   ├── auth.js              # JWT 인증
│   │   └── upload.js            # 파일 업로드
│   ├── config/
│   │   └── database.js          # DB 연결
│   └── database/
│       └── migrations/          # DB 마이그레이션
├── 샘플2.xlsx                    # TOPIK 점수 엑셀 샘플
└── CLAUDE.md                     # 프로젝트 설계 문서
```

## 💾 데이터베이스 설계

### 핵심 테이블 구조

#### Users (사용자)
```sql
- user_id (PK)
- email
- password_hash (bcrypt 암호화)
- role (admin/teacher/branch)
- agency_id (FK)
- created_at
```

#### Students (학생 기본 정보)
```sql
- student_id (PK)
- student_code (unique)
- name_ko (한국 이름)
- name_vi (베트남 이름)
- birth_date
- address
- parent_info (JSON)
- financial_info (암호화)
- agency_id (FK)
- enrollment_date
- created_by (FK)
```

#### Consultations (상담 기록)
```sql
- consultation_id (PK)
- student_id (FK)
- consultation_type
- consultation_date
- counselor_id (FK)
- summary
- improvements
- next_goals
- evaluation_data (JSON)
- created_at
```

#### ExamResults (시험 결과)
```sql
- exam_id (PK)
- student_id (FK)
- exam_type (TOPIK/mock)
- exam_date
- listening_score
- reading_score
- writing_score
- total_score
- grade
- created_by (FK)
```

### 데이터 보안
- **비밀번호**: bcrypt로 해시화
- **민감 정보**: AES-256 암호화
- **JWT 토큰**: 세션 관리
- **역할 기반 접근 제어**: RBAC 구현

## 🔄 개발 히스토리

### Phase 1: 초기 설계 문제 해결
**문제**: StudentDetail 페이지에서 모든 동적 데이터를 입력받아 복잡함
**해결**: 
- StudentDetail을 읽기 전용으로 변경
- 동적 데이터 입력을 상담 시스템으로 이동
- 정적 데이터와 동적 데이터 분리

### Phase 2: TypeScript 오류 해결
**문제**: RadioGroup disabled 속성 TypeScript 오류 (TS2322)
**해결**:
```tsx
// 수정 전
<RadioGroup value={value} disabled>

// 수정 후
<RadioGroup value={value}>
  <FormControlLabel value="x" control={<Radio />} label="Label" disabled />
```

### Phase 3: 상담 시스템 재구성
**문제**: 상담 기록이 저장되지 않음
**해결**:
1. EnhancedConsultationModal 구현
2. 학생 선택 다이얼로그 추가
3. DB constraint 제거 (migration 024)
4. consultation_id 구조 분해 오류 수정

### Phase 4: 보고서 중심 UI 최적화
**문제**: 너무 많은 불필요한 입력 필드
**해결**:
- ReportFocusedConsultationModal 신규 생성
- 보고서에 필요한 필드만 포함
- 5개 탭 구조 (학업, 생활, 특별활동, TOPIK, 종합)

### Phase 5: 베트남 유학원 현실 반영
**문제**: 월간/분기/연간 평가가 현실과 맞지 않음
**해결**: 3-5개월 과정에 맞는 평가 체계 구축

## 📊 상담 시스템 구조

### 이원화된 상담 체계

#### 1. 일반 상담 (EnhancedConsultationModal)
- **목적**: 일상적인 상담 기록
- **종류**: 진로상담, 적응상담, 비자상담, TOPIK 상담 등
- **빈도**: 수시
- **용도**: 내부 참고용

#### 2. 보고서용 평가 (ReportFocusedConsultationModal)
- **목적**: PDF 보고서 생성용 종합 평가
- **구성**: 
  - Tab 1: 학업 평가
  - Tab 2: 생활 평가
  - Tab 3: 특별활동
  - Tab 4: TOPIK 성적
  - Tab 5: 종합 평가
- **빈도**: 3-4회 (정기)
- **용도**: 대학 제출용 공식 문서

## 📈 주요 기능 구현

### 1. 사용자 인증
- JWT 기반 토큰 인증
- 역할별 접근 제어 (Admin/Teacher/Branch)
- bcrypt 비밀번호 암호화

### 2. 학생 정보 CRUD
- 생성 (Create): 신규 학생 등록
- 읽기 (Read): 학생 정보 조회
- 수정 (Update): 정보 업데이트
- 삭제 (Delete): 졸업생 처리

### 3. 엑셀 처리
- **업로드**: TOPIK 점수 일괄 입력
- **다운로드**: 학생 데이터 내보내기
- **샘플 파일**: 샘플2.xlsx 제공

### 4. PDF 보고서 생성
- HTML to PDF 변환
- 종합 생활기록부 생성
- 전문적인 디자인 템플릿

### 5. 다국어 지원
- 한국어/베트남어 UI 전환
- i18n 라이브러리 활용

## 🚀 실행 방법

### 개발 환경 설정
```bash
# Node.js 18+ 설치 필요
# PostgreSQL 또는 Supabase 계정 필요
```

### Backend 실행
```bash
cd backend
npm install
npm start  # 포트 5000
```

### Frontend 실행
```bash
cd frontend
npm install
npm start  # 포트 3001
```

## 🔑 핵심 개념 정리

### 데이터 구조 분리
- **정적 데이터**: 학생 기본 정보 (StudentDetail에서 읽기 전용)
- **동적 데이터**: 평가, 상담 내용 (Consultation 시스템에서 입력)

### 상담 유형 구분
| 구분 | 일반 상담 | 보고서용 평가 |
|------|----------|--------------|
| 목적 | 일상 기록 | 공식 평가 문서 |
| 빈도 | 수시 | 3-4회 (정기) |
| 내용 | 간단한 메모 | 체계적 평가 |
| 용도 | 내부 참고용 | 대학 제출용 |

## ⚠️ 한국 개인정보보호법(PIPA) 준수

### 필수 구현 사항
1. **개인정보 수집 동의**
   - 회원가입 시 명시적 동의 획득
   - 동의 철회 기능 제공

2. **데이터 암호화**
   - 비밀번호: bcrypt 해시
   - 민감 정보: AES-256 암호화
   - 전송 구간: HTTPS 적용

3. **접근 권한 관리**
   - 역할 기반 접근 제어
   - 최소 권한 원칙 적용
   - 접근 로그 기록

4. **데이터 보관 정책**
   - 졸업생 데이터: 5년 보관 후 파기
   - 탈퇴 회원: 즉시 삭제 또는 익명화
   - 백업 데이터: 암호화 보관

## 📝 개발 로드맵 (10단계)

### 1단계: 개발 환경 설정
- Node.js, React 설치
- Supabase 프로젝트 생성
- Git 저장소 초기화

### 2단계: 데이터베이스 설계
- 테이블 생성 (Users, Students, Consultations, ExamResults)
- 관계 설정 및 인덱스 생성
- 마이그레이션 스크립트 작성

### 3단계: 인증 시스템 구축
- JWT 토큰 인증 구현
- 역할 기반 로그인/회원가입
- 비밀번호 암호화 (bcrypt)

### 4단계: 학생 정보 CRUD
- 학생 등록/조회/수정/삭제 API
- Frontend 학생 관리 페이지
- 권한별 접근 제어

### 5단계: 상담 시스템 구현
- 일반 상담 모달 개발
- 보고서용 평가 모달 개발
- 상담 기록 저장/조회

### 6단계: TOPIK 점수 관리
- 엑셀 업로드 기능
- 점수 입력/수정 화면
- 성적 추이 그래프

### 7단계: PDF 보고서 생성
- HTML 템플릿 작성
- PDF 변환 기능
- 다운로드 구현

### 8단계: 엑셀 내보내기
- 학생 데이터 엑셀 변환
- 필터링 및 정렬
- 일괄 다운로드

### 9단계: 다국어 지원
- i18n 설정
- 한국어/베트남어 번역
- 언어 전환 UI

### 10단계: 배포 및 최적화
- Vercel 프론트엔드 배포
- Railway 백엔드 배포
- 성능 최적화 및 보안 점검

## 🤖 AI(Claude) 활용법

### 초급 질문
```
"React에서 버튼 클릭하면 alert 띄우는 코드 보여줘"
```

### 기능 개발 질문
```
"Express로 JWT 인증 미들웨어 만드는 방법 알려줘. 
역할별(admin, teacher, branch) 접근 제어도 포함해줘"
```

### 데이터베이스 질문
```
"PostgreSQL에서 학생 테이블과 상담 테이블을 
1:N 관계로 연결하는 SQL 쿼리 작성해줘"
```

### 에러 해결 질문
```
"RadioGroup에서 disabled 속성 사용하니까 
TypeScript 에러 TS2322가 발생해. 어떻게 해결해?"
```

### 최적화 질문
```
"React 컴포넌트가 너무 자주 리렌더링돼. 
useMemo와 useCallback으로 최적화하는 방법 보여줘"
```

## 🚨 Phase 6: 상담 기록 보고서 반영 문제 (2025-08-27)

### 문제 상황
**증상**: 상담 기록을 작성해도 PDF 보고서에 전혀 반영되지 않음 (심지어 학생 이름조차 안 나옴)

### 문제 분석 과정 (UltraThink 방법론)

#### 1. 데이터 흐름 추적
```
[Frontend] ConsultationModal → [API] POST /consultations → [DB] consultations 테이블
    ↓                              ↓                           ↓
 action_items 객체              그대로 전달                 JSON으로 저장
    
[Report] PDF 생성 요청 → [Backend] reportService → [DB] consultations 조회
    ↓                        ↓                         ↓
 PDF 다운로드           데이터 파싱/병합           action_items 필드
```

#### 2. 발견된 문제들

##### 문제 1: 상담 통합 과정의 혼선
- **이전**: 일반 상담과 보고서용 상담 분리
- **변경**: 하나의 통합 상담 시스템으로 통일
- **문제**: `evaluation_category` 필드 값 불일치
  ```javascript
  // Frontend: 'unified'로 전송
  evaluation_category: 'unified'
  
  // Backend: 'report'를 기대
  if (latestConsultation.evaluation_category === 'report')
  ```

##### 문제 2: JSON 데이터 타입 불일치
- **Frontend**: `action_items`를 JavaScript 객체로 전송
- **Backend (초기)**: 문자열만 파싱 가능
- **증상**: 데이터가 저장은 되지만 보고서 생성 시 무시됨

##### 문제 3: 데이터 필드 혼동
- `evaluation_data` vs `action_items` 필드 혼용
- 실제로는 모든 평가 데이터가 `action_items`에 저장됨

### 시도한 해결 방법들

#### 시도 1: Frontend JSON.stringify 추가
```javascript
// ConsultationModal.tsx
action_items: JSON.stringify(actionItems)  // 객체를 문자열로 변환
```

#### 시도 2: Backend 호환성 개선
```javascript
// reportService.js
if (consultation.action_items) {
  let actionItemsData;
  if (typeof consultation.action_items === 'string') {
    actionItemsData = JSON.parse(consultation.action_items);
  } else if (typeof consultation.action_items === 'object') {
    actionItemsData = consultation.action_items;
  }
  // 데이터 병합...
}
```

#### 시도 3: Category 조건 수정
```javascript
// 'unified' 카테고리도 처리하도록 수정
if (latestConsultation.evaluation_category === 'report' || 
    latestConsultation.evaluation_category === 'unified') {
  // 데이터 병합 로직
}
```

### 현재 상황 (2025-08-27)
- **문제 지속**: 위 수정사항에도 불구하고 여전히 보고서에 반영 안 됨
- **심각도**: 학생 이름조차 표시되지 않음 (더 근본적인 문제 의심)

### 의심되는 추가 원인들

#### 1. 하드코딩된 샘플 데이터
- 개발 중 테스트용으로 추가한 샘플 데이터가 실제 데이터를 오버라이드
- `reportService.js` 또는 템플릿에 하드코딩된 값 존재 가능성

#### 2. 서버 재시작 문제
- Node.js 서버가 코드 변경사항을 반영하지 않음
- `start-servers-fixed.bat` 파일 사용 시 캐시 문제 가능성

#### 3. PDF 템플릿 매핑 오류
- `consultation-report.html` 템플릿의 플레이스홀더 불일치
- 데이터 키 이름과 템플릿 변수명 불일치

#### 4. 데이터베이스 쿼리 문제
- 상담 데이터 조회 시 잘못된 조건 사용
- JOIN 또는 정렬 순서 문제

### 확인 필요 사항

#### 1. 데이터베이스 직접 확인
```sql
SELECT student_id, action_items, evaluation_category, created_at 
FROM consultations 
WHERE student_id = [특정 학생 ID]
ORDER BY created_at DESC;
```

#### 2. Backend 로그 분석
- `console.log` 출력 확인
- 데이터 파싱 과정 추적
- 최종 PDF 데이터 확인

#### 3. 네트워크 요청 확인
- 브라우저 개발자 도구에서 API 요청/응답 확인
- 실제 전송되는 데이터 형식 검증

#### 4. PDF 템플릿 검증
```javascript
// reportService.js에 디버깅 코드 추가
console.log('🔴 학생 정보:', student);
console.log('🔴 평가 데이터:', evaluationData);
console.log('🔴 최종 PDF 데이터:', dataForTemplate);
```

### 교훈 및 개선점

1. **데이터 흐름 문서화**: 전체 데이터 흐름을 명확히 문서화 필요
2. **통합 테스트**: 상담 입력부터 PDF 생성까지 End-to-End 테스트 필요
3. **디버깅 로그**: 각 단계별 상세한 로그 추가
4. **버전 관리**: 코드 변경 시 서버 재시작 자동화 (nodemon 사용)

## 🔄 Phase 7: 시스템 재구성 및 최적화 (2025-09-07)

### 주요 작업 내용

#### 1. GitHub 배포 준비
- **완료**: `.gitignore` 파일 생성 및 최적화
  - 불필요한 파일 제외 (PDF, Excel, 배치 파일 등)
  - 핵심 소스 코드와 문서만 포함
  - 중요 SQL 파일은 예외 처리

#### 2. 로그인 시스템 개선 (완료)
- **목표**: 이메일 기반에서 일반 ID 기반으로 전환
- **완료된 변경 사항**:
  - ✅ Users 테이블: username 필드 추가 (ADD_USERNAME_FIELD.sql)
  - ✅ Frontend: Login.tsx에서 email을 username으로 변경
  - ✅ Backend: auth.js 라우트에서 username 기반 인증으로 수정
  - ✅ AuthContext: username 기반 로그인 로직으로 변경
  - ✅ API 서비스: username 파라미터로 수정
  - ✅ 다국어 지원: ko.json, vi.json에 username 번역 추가

#### 3. PDF 보고서 형식 전면 개편 (완료)
- **목표**: 테스트학생1.pdf와 동일한 전문적인 형식 구현
- **완료된 작업**:
  - ✅ 새로운 템플릿 파일 생성: professional-report.html
  - ✅ 5페이지 구성의 전문적인 보고서 템플릿 완성
- **새로운 구성**:
  - **페이지 1 (표지)**: 학생 사진, 기본 정보, TOPIK 성적 요약
  - **페이지 2 (학업성취도)**: TOPIK 성적 추이 그래프, 학습 분석, 특별활동
  - **페이지 3 (진학목표)**: 희망 대학/전공 변경 이력, 상담 타임라인
  - **페이지 4 (종합평가)**: 생활 및 인성평가, 상담사 종합 의견
  - **페이지 5 (교육기관평가)**: 학업 성취도 평가, 한국어 능력 평가, 추천서

#### 4. 프론트엔드 구조 참고 및 적용
- **참고 경로**: `C:\Users\dudu\Documents\GitHub\vietnam-student-complete\frontend`
- **적용 예정 사항**:
  - 컴포넌트 구조
  - 라우팅 설정
  - 상태 관리 패턴
  - UI/UX 디자인 패턴

### 기술적 개선 사항

#### 데이터베이스 스키마 변경 (예정)
```sql
-- Users 테이블 수정
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 기존 이메일 데이터를 username으로 마이그레이션
UPDATE users SET username = SPLIT_PART(email, '@', 1) WHERE username IS NULL;
```

#### PDF 템플릿 재설계
- HTML/CSS 기반 새로운 템플릿 생성
- Chart.js를 활용한 그래프 렌더링
- 전문적인 디자인 요소 추가
- 다국어 지원 강화

### 해결해야 할 과제

1. **로그인 시스템 마이그레이션**
   - 기존 사용자 데이터 보존
   - 중복 ID 처리 방안
   - 보안 강화 (bcrypt 해싱 유지)

2. **PDF 생성 최적화**
   - 한글 폰트 처리
   - 이미지 및 그래프 렌더링
   - 대용량 데이터 처리

3. **프론트엔드 통합**
   - 기존 코드와의 호환성
   - 점진적 마이그레이션 전략
   - 테스트 커버리지 확보

## 📅 업데이트 기록
- 2025-08-24: 초기 프로젝트 구조 완성
- 2025-08-24: 상담 시스템 전면 개편
- 2025-08-24: 베트남 유학원 현실 반영 (3-5개월 과정)
- 2025-08-24: 보고서 중심 UI 최적화
- 2025-08-24: CLAUDE.md 기반 프로젝트 히스토리 재작성
- 2025-08-27: 상담 기록 보고서 반영 문제 발생 및 디버깅 중
- 2025-09-07: GitHub 배포 준비 및 시스템 재구성 완료
  - ✅ .gitignore 파일 생성 및 불필요한 파일 제외
  - ✅ 로그인 시스템을 이메일에서 username(ID) 기반으로 전환
  - ✅ PDF 보고서 템플릿을 전문적인 5페이지 형식으로 개편
  - ✅ 참고 프론트엔드 구조 분석 및 적용
- 2025-09-13: 프로젝트 상태 점검 및 서버 실행
  - ✅ 프로젝트 구조 파악 완료
  - ✅ Backend 포트: 5000 (실제 실행 포트, server.js: const PORT = process.env.PORT || 5001)
  - ✅ Frontend 포트: 3000 (React 기본 설정)
  - ✅ Git 상태: 클린 (main branch, 최신 상태)
  - ✅ 서버 실행 및 테스트 완료
    - Backend: http://localhost:5000 (정상 작동 확인)
    - Frontend: http://localhost:3000 (컴파일 및 실행 중)
    - Supabase PostgreSQL 연결 성공
  - ✅ PROJECT_HISTORY.md 업데이트 및 GitHub 푸쉬 완료

- 2025-09-13: 주요 UI/UX 개선 및 기능 수정
  - ✅ **학생 등록 시 사진 업로드 기능 추가**
    - StudentAddModal.tsx에 프로필 이미지 업로드 기능 구현
    - 5MB 파일 크기 제한 및 이미지 타입 검증
    - FormData를 사용한 multipart/form-data 전송
    - api.ts에 createWithFile 메소드 추가
  - ✅ **상담 UI 간소화**
    - Consultations.tsx: 상담유형, 다음상담 컬럼 제거 (8열 → 6열)
    - ConsultationModal.tsx: 상담유형 필드 제거, 기본값 '정기 상담'으로 고정
    - ConsultationModal.tsx: 포트폴리오 관련 필드 제거 (portfolio_status)
  - ✅ **PDF 보고서 최적화**
    - consultation-report.html: 특별활동 섹션 완전 제거
    - consultation-report-v3.html: 특별활동 및 포트폴리오 섹션 제거
    - 페이지 제목 변경: "학업성취도 및 특별활동" → "학업성취도"
  - ✅ **학생 목록 갱신 버그 수정**
    - Students.tsx: loadStudents() 호출 시 await 추가로 동기화 문제 해결
    - 학생 추가 후 즉시 목록에 반영되도록 수정
  - ✅ **TypeScript 컴파일 오류 수정**
    - ConsultationModal.tsx: 누락된 쉼표 추가 (lines 73, 95)
    - StudentAddModal.tsx: 폼 초기화 시 profile_image 필드 추가

---

**참고**: 이 문서는 CLAUDE.md의 설계 사양과 실제 구현 내용을 통합하여 작성되었습니다.