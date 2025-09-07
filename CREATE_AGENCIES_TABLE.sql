-- Agencies 테이블 생성
CREATE TABLE IF NOT EXISTS agencies (
    agency_id SERIAL PRIMARY KEY,
    agency_code VARCHAR(20) UNIQUE NOT NULL,
    agency_name VARCHAR(100) NOT NULL,
    agency_type VARCHAR(50) DEFAULT 'local', -- local, international
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

-- Students 테이블에 agency_id 컬럼 추가 (존재하지 않는 경우)
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

-- Students 테이블에 enrollment_date 컬럼 추가 (유학원 등록년월)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' 
                   AND column_name = 'enrollment_date') THEN
        ALTER TABLE students ADD COLUMN enrollment_date DATE;
    END IF;
END $$;

-- audit_logs 테이블 수정 (entity_id 컬럼 추가)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audit_logs' 
                   AND column_name = 'entity_id') THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id INTEGER;
    END IF;
END $$;

-- 학생 정보를 보여주는 뷰 생성
CREATE OR REPLACE VIEW student_full_info AS
SELECT 
    s.student_id,
    s.student_code,
    s.korean_name,
    s.vietnamese_name,
    s.birth_date,
    s.phone,
    s.email,
    s.address,
    s.current_status,
    s.enrollment_date,
    s.created_at,
    s.updated_at,
    a.agency_id,
    a.agency_code,
    a.agency_name,
    a.agency_type
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id;

-- 대시보드 통계를 위한 뷰 생성
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE current_status = 'active') as active_students,
    (SELECT COUNT(*) FROM consultations WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_consultations,
    (SELECT COUNT(*) FROM students WHERE current_status = 'graduated') as graduated_students;

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_students_agency_id ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(current_status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);

COMMENT ON TABLE agencies IS '유학원 정보 테이블';
COMMENT ON COLUMN agencies.agency_code IS '유학원 코드 (고유값)';
COMMENT ON COLUMN agencies.agency_name IS '유학원명';
COMMENT ON COLUMN agencies.agency_type IS '유학원 유형 (local: 현지, international: 국제)';