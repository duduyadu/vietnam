-- ================================
-- 1. 유학원 테이블 재설계
-- ================================

-- agencies 테이블에 agency_code 필드 추가 (3자리)
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS agency_code VARCHAR(3) UNIQUE;

-- 기존 유학원에 코드 할당
UPDATE agencies 
SET agency_code = LPAD(agency_id::text, 3, '0')
WHERE agency_code IS NULL;

-- 시퀀스 생성 (새 유학원 코드 자동 생성용)
CREATE SEQUENCE IF NOT EXISTS agency_code_seq 
START WITH 1 
INCREMENT BY 1;

-- ================================
-- 2. 학생 ID 자동 생성 함수
-- ================================

CREATE OR REPLACE FUNCTION generate_student_code(
    p_agency_code VARCHAR(3)
) RETURNS VARCHAR(9) AS $$
DECLARE
    v_year VARCHAR(2);
    v_sequence_number INTEGER;
    v_student_code VARCHAR(9);
BEGIN
    -- 현재 년도 2자리 추출
    v_year := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- 해당 유학원의 현재 년도 최대 순번 찾기
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(student_code FROM 6 FOR 4) AS INTEGER)
    ), 0) + 1
    INTO v_sequence_number
    FROM students
    WHERE student_code LIKE v_year || p_agency_code || '%'
    AND LENGTH(student_code) = 9;
    
    -- 학생 코드 생성
    v_student_code := v_year || p_agency_code || LPAD(v_sequence_number::text, 4, '0');
    
    RETURN v_student_code;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 3. 인덱스 추가 (성능 최적화)
-- ================================

CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_agency_id ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_name_ko ON students(name_ko);
CREATE INDEX IF NOT EXISTS idx_consultations_student_id ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date DESC);
CREATE INDEX IF NOT EXISTS idx_agencies_agency_code ON agencies(agency_code);

-- ================================
-- 4. 뷰 생성 (빠른 조회용)
-- ================================

CREATE OR REPLACE VIEW v_students_full AS
SELECT 
    s.student_id,
    s.student_code,
    s.name_ko,
    s.name_vi,
    s.status,
    s.created_at,
    a.agency_name,
    a.agency_code,
    u.full_name as created_by_name
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN users u ON s.created_by = u.user_id;

CREATE OR REPLACE VIEW v_consultations_full AS
SELECT 
    c.*,
    s.student_code,
    s.name_ko as student_name_ko,
    s.name_vi as student_name_vi,
    u.full_name as teacher_name,
    a.agency_name
FROM consultations c
LEFT JOIN students s ON c.student_id = s.student_id
LEFT JOIN users u ON c.teacher_id = u.user_id
LEFT JOIN agencies a ON s.agency_id = a.agency_id;