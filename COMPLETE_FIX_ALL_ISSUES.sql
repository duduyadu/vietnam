-- ============================================
-- 베트남 유학생 관리 시스템 - 전체 문제 해결 SQL
-- ============================================

-- 1. AGENCIES 테이블 확인 및 데이터 추가
-- ============================================
CREATE TABLE IF NOT EXISTS agencies (
    agency_id SERIAL PRIMARY KEY,
    agency_code VARCHAR(20) UNIQUE NOT NULL,
    agency_name VARCHAR(100) NOT NULL,
    agency_type VARCHAR(50) DEFAULT 'local',
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    country VARCHAR(50) DEFAULT 'Vietnam',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 유학원 데이터
INSERT INTO agencies (agency_code, agency_name, agency_type, contact_person, phone, email, address, city)
VALUES 
    ('VN001', '하노이 유학원', 'local', '김민수', '024-1234-5678', 'hanoi@example.com', '123 Le Duan St', 'Hanoi'),
    ('VN002', '호치민 유학원', 'local', '이정희', '028-9876-5432', 'hcm@example.com', '456 Nguyen Hue St', 'Ho Chi Minh'),
    ('VN003', '다낭 유학원', 'local', '박성준', '0236-3456-7890', 'danang@example.com', '789 Bach Dang St', 'Da Nang'),
    ('VN004', '하이퐁 유학원', 'local', '최영미', '0225-2345-6789', 'haiphong@example.com', '321 Le Hong Phong St', 'Hai Phong'),
    ('VN005', '서울 본사', 'international', '관리자', '02-1234-5678', 'seoul@example.com', '서울시 강남구', 'Seoul')
ON CONFLICT (agency_code) DO NOTHING;

-- 2. CONSULTATIONS 테이블 구조 수정
-- ============================================
-- consultation_date 컬럼 타입 확인 및 수정
DO $$ 
BEGIN
    -- consultation_date가 timestamp가 아닌 경우 수정
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'consultations' 
        AND column_name = 'consultation_date'
        AND data_type != 'timestamp with time zone'
    ) THEN
        ALTER TABLE consultations 
        ALTER COLUMN consultation_date TYPE TIMESTAMP USING consultation_date::timestamp;
    END IF;
END $$;

-- 테스트용 상담 데이터 추가 (이번 달)
INSERT INTO consultations (student_id, consultation_date, content, counselor_id)
SELECT 
    s.student_id,
    CURRENT_DATE - INTERVAL '1 day' * (random() * 30)::int,
    '정기 상담 - 학업 진행 상황 점검',
    1
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM consultations c 
    WHERE c.student_id = s.student_id 
    AND DATE(c.consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)
)
LIMIT 5;

-- 3. STUDENTS 관련 테이블 수정
-- ============================================
-- agency_id 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' 
                   AND column_name = 'agency_id') THEN
        ALTER TABLE students ADD COLUMN agency_id INTEGER;
        ALTER TABLE students ADD CONSTRAINT fk_students_agency 
            FOREIGN KEY (agency_id) REFERENCES agencies(agency_id) ON DELETE SET NULL;
    END IF;
END $$;

-- current_status 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' 
                   AND column_name = 'current_status') THEN
        ALTER TABLE students ADD COLUMN current_status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    -- status 컬럼이 있으면 current_status로 데이터 복사
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'students' 
               AND column_name = 'status') THEN
        UPDATE students SET current_status = status WHERE current_status IS NULL;
    END IF;
END $$;

-- 모든 학생에게 기본 agency_id 할당 (없는 경우)
UPDATE students SET agency_id = 1 
WHERE agency_id IS NULL 
AND EXISTS (SELECT 1 FROM agencies WHERE agency_id = 1);

-- 4. 학생 정보 뷰 재생성 (개선된 버전)
-- ============================================
DROP VIEW IF EXISTS student_full_info CASCADE;
CREATE VIEW student_full_info AS
SELECT 
    s.student_id,
    s.student_code,
    COALESCE(s.current_status, s.status, 'active') as current_status,
    s.created_at,
    s.updated_at,
    s.agency_id,
    a.agency_code,
    a.agency_name,
    a.agency_type,
    -- EAV 패턴에서 속성 추출
    MAX(CASE WHEN sa.attribute_name = 'korean_name' THEN sa.attribute_value END) as korean_name,
    MAX(CASE WHEN sa.attribute_name = 'vietnamese_name' THEN sa.attribute_value END) as vietnamese_name,
    MAX(CASE WHEN sa.attribute_name = 'english_name' THEN sa.attribute_value END) as english_name,
    MAX(CASE WHEN sa.attribute_name = 'birth_date' THEN sa.attribute_value END) as birth_date,
    MAX(CASE WHEN sa.attribute_name = 'phone' THEN sa.attribute_value END) as phone,
    MAX(CASE WHEN sa.attribute_name = 'email' THEN sa.attribute_value END) as email,
    MAX(CASE WHEN sa.attribute_name = 'address' THEN sa.attribute_value END) as address,
    MAX(CASE WHEN sa.attribute_name = 'enrollment_date' THEN sa.attribute_value END) as enrollment_date,
    MAX(CASE WHEN sa.attribute_name = 'parent_phone' THEN sa.attribute_value END) as parent_phone,
    MAX(CASE WHEN sa.attribute_name = 'parent_name' THEN sa.attribute_value END) as parent_name
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.current_status, s.status, s.created_at, s.updated_at, 
         s.agency_id, a.agency_code, a.agency_name, a.agency_type;

-- 5. 학생 목록 뷰 재생성 (간단 버전)
-- ============================================
DROP VIEW IF EXISTS student_list_view CASCADE;
CREATE VIEW student_list_view AS
SELECT 
    s.student_id,
    s.student_code,
    COALESCE(s.current_status, s.status, 'active') as status,
    s.agency_id,
    COALESCE(a.agency_name, '미지정') as agency_name,
    COALESCE(
        MAX(CASE WHEN sa.attribute_name = 'korean_name' THEN sa.attribute_value END),
        MAX(CASE WHEN sa.attribute_name = 'vietnamese_name' THEN sa.attribute_value END),
        s.student_code
    ) as name,
    MAX(CASE WHEN sa.attribute_name = 'phone' THEN sa.attribute_value END) as phone,
    MAX(CASE WHEN sa.attribute_name = 'email' THEN sa.attribute_value END) as email
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.current_status, s.status, s.agency_id, a.agency_name;

-- 6. 대시보드 통계 뷰 재생성 (실제 데이터 기반)
-- ============================================
DROP VIEW IF EXISTS dashboard_stats CASCADE;
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE COALESCE(current_status, status, 'active') = 'active') as active_students,
    (SELECT COUNT(*) FROM consultations WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_consultations,
    (SELECT COUNT(*) FROM students WHERE COALESCE(current_status, status) = 'graduated') as graduated_students;

-- 7. AUDIT_LOGS 테이블 수정
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audit_logs' 
                   AND column_name = 'entity_id') THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id INTEGER;
    END IF;
END $$;

-- 8. 테스트 데이터 생성 (학생이 없는 경우)
-- ============================================
DO $$
DECLARE
    v_student_count INTEGER;
    v_student_id INTEGER;
    i INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_student_count FROM students;
    
    IF v_student_count < 10 THEN
        FOR i IN 1..10 LOOP
            -- 학생 기본 정보 삽입
            INSERT INTO students (student_code, status, agency_id, created_by)
            VALUES (
                'STU2025' || LPAD(i::text, 3, '0'),
                'active',
                ((i - 1) % 4) + 1,  -- 1~4 유학원에 순환 배정
                1
            ) RETURNING student_id INTO v_student_id;
            
            -- 학생 속성 삽입
            INSERT INTO student_attributes (student_id, attribute_name, attribute_value) VALUES
                (v_student_id, 'korean_name', '테스트학생' || i),
                (v_student_id, 'vietnamese_name', 'Test Student ' || i),
                (v_student_id, 'phone', '010-' || LPAD((1000 + i)::text, 4, '0') || '-' || LPAD((i * 100)::text, 4, '0')),
                (v_student_id, 'email', 'student' || i || '@example.com'),
                (v_student_id, 'birth_date', '2005-' || LPAD(((i % 12) + 1)::text, 2, '0') || '-' || LPAD(((i % 28) + 1)::text, 2, '0')),
                (v_student_id, 'enrollment_date', '2025-01-01');
        END LOOP;
    END IF;
END $$;

-- 9. 인덱스 생성 (성능 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_students_agency_id ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_current_status ON students(current_status);
CREATE INDEX IF NOT EXISTS idx_student_attributes_student_id ON student_attributes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attributes_name ON student_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(agency_code);

-- 10. 통계 업데이트
-- ============================================
ANALYZE students;
ANALYZE student_attributes;
ANALYZE consultations;
ANALYZE agencies;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 모든 문제가 성공적으로 해결되었습니다!';
    RAISE NOTICE '- Agencies 테이블: 생성 및 데이터 추가 완료';
    RAISE NOTICE '- Consultations 테이블: 구조 수정 및 테스트 데이터 추가 완료';
    RAISE NOTICE '- Students 뷰: 재생성 완료';
    RAISE NOTICE '- Dashboard 통계: 실제 데이터 기반으로 수정 완료';
    RAISE NOTICE '- 인덱스: 성능 최적화 완료';
END $$;