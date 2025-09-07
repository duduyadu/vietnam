-- Agencies 테이블 생성
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

-- 기본 유학원 데이터 삽입
INSERT INTO agencies (agency_code, agency_name, agency_type, contact_person, phone, email, address, city)
VALUES 
    ('VN001', '하노이 유학원', 'local', '김민수', '024-1234-5678', 'hanoi@example.com', '123 Le Duan St', 'Hanoi'),
    ('VN002', '호치민 유학원', 'local', '이정희', '028-9876-5432', 'hcm@example.com', '456 Nguyen Hue St', 'Ho Chi Minh'),
    ('VN003', '다낭 유학원', 'local', '박성준', '0236-3456-7890', 'danang@example.com', '789 Bach Dang St', 'Da Nang'),
    ('VN004', '하이퐁 유학원', 'local', '최영미', '0225-2345-6789', 'haiphong@example.com', '321 Le Hong Phong St', 'Hai Phong')
ON CONFLICT (agency_code) DO NOTHING;

-- Students 테이블에 agency_id 컬럼이 없다면 추가
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

-- audit_logs 테이블에 entity_id 컬럼 추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audit_logs' 
                   AND column_name = 'entity_id') THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id INTEGER;
    END IF;
END $$;

-- 학생 전체 정보를 보여주는 뷰 (EAV 패턴 처리)
CREATE OR REPLACE VIEW student_full_info AS
SELECT 
    s.student_id,
    s.student_code,
    s.status as current_status,
    s.created_at,
    s.updated_at,
    a.agency_id,
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
    MAX(CASE WHEN sa.attribute_name = 'high_school_score' THEN sa.attribute_value END) as high_school_score,
    MAX(CASE WHEN sa.attribute_name = 'desired_major' THEN sa.attribute_value END) as desired_major,
    MAX(CASE WHEN sa.attribute_name = 'visa_status' THEN sa.attribute_value END) as visa_status,
    MAX(CASE WHEN sa.attribute_name = 'visa_expiry' THEN sa.attribute_value END) as visa_expiry
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.status, s.created_at, s.updated_at, 
         a.agency_id, a.agency_code, a.agency_name, a.agency_type;

-- 간단한 학생 목록 뷰
CREATE OR REPLACE VIEW student_list_view AS
SELECT 
    s.student_id,
    s.student_code,
    s.status,
    s.agency_id,
    a.agency_name,
    MAX(CASE WHEN sa.attribute_name = 'korean_name' THEN sa.attribute_value END) as name,
    MAX(CASE WHEN sa.attribute_name = 'phone' THEN sa.attribute_value END) as phone,
    MAX(CASE WHEN sa.attribute_name = 'email' THEN sa.attribute_value END) as email
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.status, s.agency_id, a.agency_name;

-- 대시보드 통계 뷰
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE status = 'active' OR status IS NULL) as active_students,
    (SELECT COUNT(*) FROM consultations WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_consultations,
    (SELECT COUNT(*) FROM students WHERE status = 'graduated') as graduated_students;

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_students_agency_id ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_student_attributes_student_id ON student_attributes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attributes_name ON student_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);

-- 테스트용 학생 데이터 업데이트 (agency_id 설정)
UPDATE students SET agency_id = 1 WHERE agency_id IS NULL AND student_id <= 5;
UPDATE students SET agency_id = 2 WHERE agency_id IS NULL AND student_id > 5 AND student_id <= 10;
UPDATE students SET agency_id = 3 WHERE agency_id IS NULL AND student_id > 10 AND student_id <= 15;
UPDATE students SET agency_id = 4 WHERE agency_id IS NULL AND student_id > 15;