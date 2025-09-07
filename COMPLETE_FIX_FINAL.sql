-- ============================================
-- 베트남 유학생 관리 시스템 - 전체 문제 해결 SQL (최종)
-- ============================================

-- 1. AGENCIES 테이블 (이미 생성됨)
-- ============================================
-- Agencies 테이블은 이미 생성되었으므로 데이터만 추가
INSERT INTO agencies (agency_code, agency_name, agency_type, contact_person, phone, email, address, city)
VALUES 
    ('VN005', '서울 본사', 'international', '관리자', '02-1234-5678', 'seoul@example.com', '서울시 강남구', 'Seoul'),
    ('VN006', '부산 지점', 'international', '김지점장', '051-1234-5678', 'busan@example.com', '부산시 해운대구', 'Busan')
ON CONFLICT (agency_code) DO NOTHING;

-- 2. CONSULTATIONS 테이블에 테스트 데이터 추가
-- ============================================
-- 이번 달 상담 데이터 추가 (실제 컬럼명 사용)
INSERT INTO consultations (student_id, consultation_date, consultation_type, notes, status, created_by)
SELECT 
    s.student_id,
    CURRENT_DATE - INTERVAL '1 day' * (random() * 30)::int,
    '정기상담',
    '학업 진행 상황 점검 및 진로 상담',
    'completed',
    1
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM consultations c 
    WHERE c.student_id = s.student_id 
    AND DATE(c.consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)
)
LIMIT 10;

-- 3. STUDENTS 테이블 수정
-- ============================================
-- current_status 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' 
                   AND column_name = 'current_status') THEN
        ALTER TABLE students ADD COLUMN current_status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    -- status 컬럼이 있고 current_status가 NULL인 경우 데이터 복사
    UPDATE students 
    SET current_status = COALESCE(status, 'active') 
    WHERE current_status IS NULL;
END $$;

-- 모든 학생에게 기본 agency_id 할당 (없는 경우)
UPDATE students 
SET agency_id = (SELECT agency_id FROM agencies LIMIT 1)
WHERE agency_id IS NULL;

-- 4. 학생 전체 정보 뷰 재생성
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
    MAX(CASE WHEN sa.attribute_name = 'parent_name' THEN sa.attribute_value END) as parent_name,
    MAX(CASE WHEN sa.attribute_name = 'economic_status' THEN sa.attribute_value END) as economic_status,
    MAX(CASE WHEN sa.attribute_name = 'high_school_score' THEN sa.attribute_value END) as high_school_score
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.current_status, s.status, s.created_at, s.updated_at, 
         s.agency_id, a.agency_code, a.agency_name, a.agency_type;

-- 5. 학생 목록 간단 뷰 재생성
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
        MAX(CASE WHEN sa.attribute_name = 'name' THEN sa.attribute_value END),
        s.student_code
    ) as name,
    MAX(CASE WHEN sa.attribute_name = 'phone' THEN sa.attribute_value END) as phone,
    MAX(CASE WHEN sa.attribute_name = 'email' THEN sa.attribute_value END) as email
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.current_status, s.status, s.agency_id, a.agency_name
ORDER BY s.student_id DESC;

-- 6. 대시보드 통계 뷰 재생성 (실제 데이터 기반)
-- ============================================
DROP VIEW IF EXISTS dashboard_stats CASCADE;
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE COALESCE(current_status, status, 'active') IN ('active', 'enrolled')) as active_students,
    (SELECT COUNT(*) FROM consultations WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_consultations,
    (SELECT COUNT(*) FROM students WHERE COALESCE(current_status, status) = 'graduated') as graduated_students;

-- 7. 테스트 데이터 생성 (학생 수가 적은 경우)
-- ============================================
DO $$
DECLARE
    v_student_count INTEGER;
    v_student_id INTEGER;
    v_agency_count INTEGER;
    i INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_student_count FROM students;
    SELECT COUNT(*) INTO v_agency_count FROM agencies;
    
    -- 유학원이 없으면 기본 유학원 생성
    IF v_agency_count = 0 THEN
        INSERT INTO agencies (agency_code, agency_name, agency_type)
        VALUES ('DEFAULT', '기본 유학원', 'local');
    END IF;
    
    -- 학생이 5명 미만이면 테스트 데이터 추가
    IF v_student_count < 5 THEN
        FOR i IN 1..10 LOOP
            -- 학생 기본 정보 삽입
            INSERT INTO students (student_code, status, agency_id, created_by)
            VALUES (
                'TEST2025' || LPAD(i::text, 3, '0'),
                CASE WHEN i % 3 = 0 THEN 'graduated' ELSE 'active' END,
                (SELECT agency_id FROM agencies ORDER BY agency_id LIMIT 1 OFFSET (i % GREATEST(v_agency_count, 1))),
                1
            ) RETURNING student_id INTO v_student_id;
            
            -- 학생 속성 삽입
            INSERT INTO student_attributes (student_id, attribute_name, attribute_value) VALUES
                (v_student_id, 'korean_name', '테스트학생' || i),
                (v_student_id, 'vietnamese_name', 'Nguyen Test ' || i),
                (v_student_id, 'phone', '010-' || LPAD((1000 + i)::text, 4, '0') || '-' || LPAD((i * 111)::text, 4, '0')),
                (v_student_id, 'email', 'test' || i || '@example.com'),
                (v_student_id, 'birth_date', (2005 + (i % 3)) || '-' || LPAD(((i % 12) + 1)::text, 2, '0') || '-' || LPAD(((i % 28) + 1)::text, 2, '0')),
                (v_student_id, 'enrollment_date', '2025-01-' || LPAD(((i % 28) + 1)::text, 2, '0')),
                (v_student_id, 'address', '베트남 하노이 ' || i || '번지'),
                (v_student_id, 'parent_name', '학부모' || i),
                (v_student_id, 'parent_phone', '010-9' || LPAD((i * 100)::text, 3, '0') || '-' || LPAD((i * 111)::text, 4, '0'));
                
            -- 이번 달 상담 기록 추가
            IF i <= 5 THEN
                INSERT INTO consultations (student_id, consultation_date, consultation_type, notes, status, created_by)
                VALUES (
                    v_student_id,
                    CURRENT_DATE - INTERVAL '1 day' * i,
                    '정기상담',
                    '월간 학업 상담 - 진행 상황 양호',
                    'completed',
                    1
                );
            END IF;
        END LOOP;
    END IF;
END $$;

-- 8. 인덱스 생성 (성능 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_students_agency_id ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_current_status ON students(current_status);
CREATE INDEX IF NOT EXISTS idx_student_attributes_student_id ON student_attributes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attributes_name ON student_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(agency_code);

-- 9. 통계 업데이트
-- ============================================
ANALYZE students;
ANALYZE student_attributes;
ANALYZE consultations;
ANALYZE agencies;

-- 10. 결과 확인
-- ============================================
DO $$
DECLARE
    v_student_count INTEGER;
    v_agency_count INTEGER;
    v_consultation_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_student_count FROM students;
    SELECT COUNT(*) INTO v_agency_count FROM agencies;
    SELECT COUNT(*) INTO v_consultation_count FROM consultations 
    WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE);
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ 시스템 상태 확인 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '총 학생 수: %', v_student_count;
    RAISE NOTICE '총 유학원 수: %', v_agency_count;
    RAISE NOTICE '이번 달 상담 수: %', v_consultation_count;
    RAISE NOTICE '========================================';
END $$;