-- ============================================
-- 베트남 유학생 관리 시스템 - 전체 문제 해결 (최종 작동 버전)
-- ============================================

-- 1. 유학원 데이터 추가
INSERT INTO agencies (agency_code, agency_name, agency_type, contact_person, phone, email, address, city)
VALUES 
    ('VN007', '인천 지점', 'international', '박관리자', '032-1234-5678', 'incheon@example.com', '인천시 남동구', 'Incheon')
ON CONFLICT (agency_code) DO NOTHING;

-- 2. 상담 테스트 데이터 (올바른 타입 사용)
INSERT INTO consultations (student_id, consultation_date, consultation_type, notes, status, created_by)
SELECT 
    s.student_id,
    CURRENT_DATE - INTERVAL '1 day' * (random() * 25)::int,
    (ARRAY['phone', 'video', 'in_person', 'email'])[floor(random() * 4 + 1)],
    '월간 정기 상담 - 학업 및 생활 상담',
    'completed',
    1
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM consultations c 
    WHERE c.student_id = s.student_id 
    AND DATE(c.consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)
)
LIMIT 15;

-- 3. current_status 컬럼 추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' 
                   AND column_name = 'current_status') THEN
        ALTER TABLE students ADD COLUMN current_status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    UPDATE students 
    SET current_status = COALESCE(status, 'active') 
    WHERE current_status IS NULL;
END $$;

-- 4. 학생에게 agency_id 할당
UPDATE students 
SET agency_id = (SELECT agency_id FROM agencies ORDER BY agency_id LIMIT 1)
WHERE agency_id IS NULL;

-- 5. 학생 정보 뷰
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
    MAX(CASE WHEN sa.attribute_name = 'korean_name' THEN sa.attribute_value END) as korean_name,
    MAX(CASE WHEN sa.attribute_name = 'vietnamese_name' THEN sa.attribute_value END) as vietnamese_name,
    MAX(CASE WHEN sa.attribute_name = 'birth_date' THEN sa.attribute_value END) as birth_date,
    MAX(CASE WHEN sa.attribute_name = 'phone' THEN sa.attribute_value END) as phone,
    MAX(CASE WHEN sa.attribute_name = 'email' THEN sa.attribute_value END) as email,
    MAX(CASE WHEN sa.attribute_name = 'address' THEN sa.attribute_value END) as address
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.current_status, s.status, s.created_at, s.updated_at, 
         s.agency_id, a.agency_code, a.agency_name, a.agency_type;

-- 6. 학생 목록 뷰
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
GROUP BY s.student_id, s.student_code, s.current_status, s.status, s.agency_id, a.agency_name
ORDER BY s.student_id DESC;

-- 7. 대시보드 통계 뷰
DROP VIEW IF EXISTS dashboard_stats CASCADE;
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE COALESCE(current_status, status, 'active') = 'active') as active_students,
    (SELECT COUNT(*) FROM consultations WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_consultations,
    (SELECT COUNT(*) FROM students WHERE COALESCE(current_status, status) = 'graduated') as graduated_students;

-- 8. 테스트 학생 데이터 생성
DO $$
DECLARE
    v_student_count INTEGER;
    v_student_id INTEGER;
    i INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_student_count FROM students;
    
    IF v_student_count < 5 THEN
        FOR i IN 1..5 LOOP
            INSERT INTO students (student_code, status, agency_id, created_by)
            VALUES (
                'NEW2025' || LPAD(i::text, 3, '0'),
                'active',
                (SELECT agency_id FROM agencies ORDER BY random() LIMIT 1),
                1
            ) RETURNING student_id INTO v_student_id;
            
            INSERT INTO student_attributes (student_id, attribute_name, attribute_value) VALUES
                (v_student_id, 'korean_name', '신입생' || i),
                (v_student_id, 'vietnamese_name', 'Sinh Vien ' || i),
                (v_student_id, 'phone', '010-2025-' || LPAD((i * 1000)::text, 4, '0')),
                (v_student_id, 'email', 'new' || i || '@student.com');
        END LOOP;
    END IF;
END $$;

-- 9. 통계 업데이트
ANALYZE students;
ANALYZE student_attributes;
ANALYZE consultations;
ANALYZE agencies;