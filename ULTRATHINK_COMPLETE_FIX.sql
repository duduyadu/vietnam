-- ==============================================
-- 베트남 유학생 관리 시스템 - ULTRATHINK 종합 해결
-- ==============================================

-- 1. 테스트 학생 데이터 보완 (속성 추가)
-- ==============================================
DO $$
DECLARE
    v_student RECORD;
    v_counter INTEGER := 1;
BEGIN
    -- 모든 학생에게 기본 속성 추가
    FOR v_student IN SELECT student_id, student_code FROM students LOOP
        -- 속성이 없는 학생에게만 추가
        IF NOT EXISTS (
            SELECT 1 FROM student_attributes 
            WHERE student_id = v_student.student_id 
            AND attribute_name = 'korean_name'
        ) THEN
            INSERT INTO student_attributes (student_id, attribute_name, attribute_value) VALUES
                (v_student.student_id, 'korean_name', '학생' || v_counter),
                (v_student.student_id, 'vietnamese_name', 'Sinh Vien ' || v_counter),
                (v_student.student_id, 'phone', '010-' || LPAD((1000 + v_counter)::text, 4, '0') || '-' || LPAD((v_counter * 111)::text, 4, '0')),
                (v_student.student_id, 'email', 'student' || v_counter || '@example.com'),
                (v_student.student_id, 'birth_date', '2005-' || LPAD(((v_counter % 12) + 1)::text, 2, '0') || '-15'),
                (v_student.student_id, 'address', '베트남 하노이 ' || v_counter || '번지'),
                (v_student.student_id, 'enrollment_date', '2025-01-01');
            v_counter := v_counter + 1;
        END IF;
    END LOOP;
END $$;

-- 2. 추가 테스트 학생 생성 (최소 10명 보장)
-- ==============================================
DO $$
DECLARE
    v_student_count INTEGER;
    v_student_id INTEGER;
    v_agency_count INTEGER;
    i INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_student_count FROM students;
    SELECT COUNT(*) INTO v_agency_count FROM agencies;
    
    IF v_student_count < 10 THEN
        FOR i IN (v_student_count + 1)..10 LOOP
            -- 학생 기본 정보 삽입
            INSERT INTO students (student_code, status, agency_id, created_by)
            VALUES (
                'STD2025' || LPAD(i::text, 3, '0'),
                CASE 
                    WHEN i % 4 = 0 THEN 'graduated'
                    WHEN i % 3 = 0 THEN 'withdrawn'
                    ELSE 'studying'
                END,
                ((i - 1) % GREATEST(v_agency_count, 1)) + 1,
                1
            ) ON CONFLICT (student_code) DO NOTHING
            RETURNING student_id INTO v_student_id;
            
            IF v_student_id IS NOT NULL THEN
                -- 학생 속성 삽입
                INSERT INTO student_attributes (student_id, attribute_name, attribute_value) VALUES
                    (v_student_id, 'korean_name', '홍길동' || i),
                    (v_student_id, 'vietnamese_name', 'Nguyen Van ' || chr(65 + (i % 26))),
                    (v_student_id, 'phone', '010-' || LPAD((2000 + i)::text, 4, '0') || '-' || LPAD((i * 123)::text, 4, '0')),
                    (v_student_id, 'email', 'student' || i || '@vsms.com'),
                    (v_student_id, 'birth_date', (2004 + (i % 3)) || '-' || LPAD(((i % 12) + 1)::text, 2, '0') || '-' || LPAD(((i % 28) + 1)::text, 2, '0')),
                    (v_student_id, 'address', '베트남 ' || CASE i % 4 
                        WHEN 0 THEN '하노이'
                        WHEN 1 THEN '호치민'
                        WHEN 2 THEN '다낭'
                        ELSE '하이퐁'
                    END || ' ' || i || '번지'),
                    (v_student_id, 'enrollment_date', '2025-01-' || LPAD(((i % 28) + 1)::text, 2, '0')),
                    (v_student_id, 'parent_name', '부모' || i),
                    (v_student_id, 'parent_phone', '010-9' || LPAD((i * 100)::text, 3, '0') || '-' || LPAD((i * 99)::text, 4, '0'));
            END IF;
        END LOOP;
    END IF;
END $$;

-- 3. 학생 목록 뷰 재생성 (최적화)
-- ==============================================
DROP VIEW IF EXISTS student_list_view CASCADE;
CREATE VIEW student_list_view AS
SELECT 
    s.student_id,
    s.student_code,
    s.status,
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
GROUP BY s.student_id, s.student_code, s.status, s.agency_id, a.agency_name
ORDER BY s.student_id DESC;

-- 4. 학생 상세 정보 뷰 재생성
-- ==============================================
DROP VIEW IF EXISTS student_full_info CASCADE;
CREATE VIEW student_full_info AS
SELECT 
    s.student_id,
    s.student_code,
    s.status as current_status,
    s.created_at,
    s.updated_at,
    s.agency_id,
    a.agency_code,
    a.agency_name,
    a.agency_type,
    MAX(CASE WHEN sa.attribute_name = 'korean_name' THEN sa.attribute_value END) as korean_name,
    MAX(CASE WHEN sa.attribute_name = 'vietnamese_name' THEN sa.attribute_value END) as vietnamese_name,
    MAX(CASE WHEN sa.attribute_name = 'english_name' THEN sa.attribute_value END) as english_name,
    MAX(CASE WHEN sa.attribute_name = 'birth_date' THEN sa.attribute_value END) as birth_date,
    MAX(CASE WHEN sa.attribute_name = 'phone' THEN sa.attribute_value END) as phone,
    MAX(CASE WHEN sa.attribute_name = 'email' THEN sa.attribute_value END) as email,
    MAX(CASE WHEN sa.attribute_name = 'address' THEN sa.attribute_value END) as address,
    MAX(CASE WHEN sa.attribute_name = 'enrollment_date' THEN sa.attribute_value END) as enrollment_date,
    MAX(CASE WHEN sa.attribute_name = 'parent_name' THEN sa.attribute_value END) as parent_name,
    MAX(CASE WHEN sa.attribute_name = 'parent_phone' THEN sa.attribute_value END) as parent_phone,
    MAX(CASE WHEN sa.attribute_name = 'economic_status' THEN sa.attribute_value END) as economic_status,
    MAX(CASE WHEN sa.attribute_name = 'high_school_score' THEN sa.attribute_value END) as high_school_score,
    MAX(CASE WHEN sa.attribute_name = 'desired_major' THEN sa.attribute_value END) as desired_major
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.status, s.created_at, s.updated_at, 
         s.agency_id, a.agency_code, a.agency_name, a.agency_type;

-- 5. 상담 기록 뷰 생성
-- ==============================================
DROP VIEW IF EXISTS consultation_view CASCADE;
CREATE VIEW consultation_view AS
SELECT 
    c.consultation_id,
    c.student_id,
    c.consultation_date,
    c.consultation_type,
    c.notes,
    c.status,
    c.created_by,
    c.created_at,
    s.student_code,
    COALESCE(
        sa_name.attribute_value,
        s.student_code
    ) as student_name,
    u.full_name as counselor_name
FROM consultations c
JOIN students s ON c.student_id = s.student_id
LEFT JOIN student_attributes sa_name ON s.student_id = sa_name.student_id 
    AND sa_name.attribute_name = 'korean_name'
LEFT JOIN users u ON c.created_by = u.user_id
ORDER BY c.consultation_date DESC;

-- 6. 더 많은 상담 기록 추가
-- ==============================================
INSERT INTO consultations (student_id, consultation_date, consultation_type, notes, status, created_by)
SELECT 
    s.student_id,
    CURRENT_DATE - (INTERVAL '1 day' * (10 - (ROW_NUMBER() OVER (ORDER BY s.student_id)))),
    (ARRAY['phone', 'video', 'in_person', 'email'])[(s.student_id % 4) + 1],
    CASE (s.student_id % 3)
        WHEN 0 THEN '진로 상담 - 대학 선택 및 전공 결정'
        WHEN 1 THEN '학업 상담 - 한국어 능력 향상 방안'
        ELSE '생활 상담 - 기숙사 및 생활 적응'
    END,
    'completed',
    1
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM consultations c 
    WHERE c.student_id = s.student_id 
    AND DATE(c.consultation_date) = CURRENT_DATE - (INTERVAL '1 day' * (10 - s.student_id))
)
LIMIT 20;

-- 7. 대시보드 통계 뷰 재생성
-- ==============================================
DROP VIEW IF EXISTS dashboard_stats CASCADE;
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE status = 'studying') as active_students,
    (SELECT COUNT(*) FROM consultations WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_consultations,
    (SELECT COUNT(*) FROM students WHERE status = 'graduated') as graduated_students;

-- 8. 유학원 선택을 위한 뷰
-- ==============================================
DROP VIEW IF EXISTS agency_list CASCADE;
CREATE VIEW agency_list AS
SELECT 
    agency_id,
    agency_code,
    agency_name,
    agency_type,
    city,
    country,
    is_active,
    (SELECT COUNT(*) FROM students WHERE students.agency_id = agencies.agency_id) as student_count
FROM agencies
WHERE is_active = true
ORDER BY agency_name;

-- 9. 인덱스 최적화
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_agency ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_attributes_student ON student_attributes(student_id);
CREATE INDEX IF NOT EXISTS idx_attributes_name_value ON student_attributes(attribute_name, attribute_value);
CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date DESC);

-- 10. 통계 업데이트
-- ==============================================
ANALYZE students;
ANALYZE student_attributes;
ANALYZE consultations;
ANALYZE agencies;

-- 11. 결과 확인
-- ==============================================
DO $$
DECLARE
    v_student_count INTEGER;
    v_agency_count INTEGER;
    v_consultation_count INTEGER;
    v_attr_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_student_count FROM students;
    SELECT COUNT(*) INTO v_agency_count FROM agencies;
    SELECT COUNT(*) INTO v_consultation_count FROM consultations;
    SELECT COUNT(DISTINCT student_id) INTO v_attr_count FROM student_attributes;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ULTRATHINK 종합 해결 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '총 학생 수: %', v_student_count;
    RAISE NOTICE '속성 있는 학생 수: %', v_attr_count;
    RAISE NOTICE '총 유학원 수: %', v_agency_count;
    RAISE NOTICE '총 상담 기록 수: %', v_consultation_count;
    RAISE NOTICE '========================================';
END $$;