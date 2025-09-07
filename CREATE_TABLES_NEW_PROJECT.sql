-- ========================================
-- Vietnam Student Management System
-- 새 Supabase 프로젝트 테이블 생성 SQL
-- Project: duyang2's Project (bbehhfndfwtxvqllfnvp)
-- ========================================

-- 1. users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'korean_branch')),
  agency_name VARCHAR(100),
  branch_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. agencies 테이블
CREATE TABLE IF NOT EXISTS agencies (
  agency_id SERIAL PRIMARY KEY,
  agency_name VARCHAR(100) NOT NULL,
  agency_code VARCHAR(20) UNIQUE NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(user_id)
);

-- 3. students 테이블
CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  student_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'studying',
  agency_id INTEGER,
  agency_enrollment_date VARCHAR(10),
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- students 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_students_agency_id ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);

-- 4. attribute_definitions 테이블
CREATE TABLE IF NOT EXISTS attribute_definitions (
  attribute_key VARCHAR(50) PRIMARY KEY,
  attribute_name_ko VARCHAR(100),
  attribute_name_vi VARCHAR(100),
  data_type VARCHAR(20),
  category VARCHAR(50),
  is_sensitive BOOLEAN DEFAULT FALSE,
  is_encrypted BOOLEAN DEFAULT FALSE,
  display_order INTEGER
);

-- 5. student_attributes 테이블
CREATE TABLE IF NOT EXISTS student_attributes (
  attribute_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  attribute_key VARCHAR(50) NOT NULL REFERENCES attribute_definitions(attribute_key),
  attribute_value TEXT,
  file_path VARCHAR(255),
  is_encrypted BOOLEAN DEFAULT FALSE,
  updated_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, attribute_key)
);

-- student_attributes 인덱스
CREATE INDEX IF NOT EXISTS idx_student_attr_student ON student_attributes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attr_key ON student_attributes(attribute_key);

-- 6. consultations 테이블
CREATE TABLE IF NOT EXISTS consultations (
  consultation_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(user_id),
  consultation_date DATE NOT NULL,
  consultation_type VARCHAR(50),
  consultation_content TEXT,
  action_items TEXT,
  notes TEXT,
  attachments TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- consultations 인덱스
CREATE INDEX IF NOT EXISTS idx_consult_student ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_consult_teacher ON consultations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_consult_date ON consultations(consultation_date);

-- 7. 기본 속성 정의 추가
INSERT INTO attribute_definitions (attribute_key, attribute_name_ko, attribute_name_vi, data_type, category, is_sensitive, is_encrypted, display_order) VALUES
-- 기본 정보
('name_ko', '이름(한글)', 'Tên (Tiếng Hàn)', 'text', 'basic', FALSE, FALSE, 1),
('name_vi', '이름(베트남어)', 'Tên (Tiếng Việt)', 'text', 'basic', FALSE, FALSE, 2),
('name_en', '이름(영어)', 'Tên (Tiếng Anh)', 'text', 'basic', FALSE, FALSE, 3),
('gender', '성별', 'Giới tính', 'text', 'basic', FALSE, FALSE, 4),
('birth_date', '생년월일', 'Ngày sinh', 'date', 'basic', FALSE, FALSE, 5),
('nationality', '국적', 'Quốc tịch', 'text', 'basic', FALSE, FALSE, 6),
('phone', '연락처', 'Số điện thoại', 'text', 'basic', FALSE, FALSE, 7),
('email', '이메일', 'Email', 'email', 'basic', FALSE, FALSE, 8),

-- 가족 정보
('parent1_name', '부모1 이름', 'Tên phụ huynh 1', 'text', 'family', FALSE, FALSE, 10),
('parent1_phone', '부모1 연락처', 'SĐT phụ huynh 1', 'text', 'family', FALSE, FALSE, 11),
('parent1_job', '부모1 직업', 'Nghề nghiệp PH 1', 'text', 'family', FALSE, FALSE, 12),
('parent2_name', '부모2 이름', 'Tên phụ huynh 2', 'text', 'family', FALSE, FALSE, 13),
('parent2_phone', '부모2 연락처', 'SĐT phụ huynh 2', 'text', 'family', FALSE, FALSE, 14),
('parent2_job', '부모2 직업', 'Nghề nghiệp PH 2', 'text', 'family', FALSE, FALSE, 15),
('family_income', '가족 수입', 'Thu nhập gia đình', 'text', 'family', TRUE, TRUE, 16),

-- 학업 정보
('korean_level', '한국어 레벨', 'Trình độ tiếng Hàn', 'text', 'academic', FALSE, FALSE, 20),
('high_school', '고등학교', 'Trường THPT', 'text', 'academic', FALSE, FALSE, 21),
('graduation_year', '졸업년도', 'Năm tốt nghiệp', 'text', 'academic', FALSE, FALSE, 22),
('gpa', '내신 성적', 'Điểm GPA', 'text', 'academic', FALSE, FALSE, 23),
('desired_major', '희망 전공', 'Ngành học mong muốn', 'text', 'academic', FALSE, FALSE, 24),
('desired_university', '희망 대학', 'Trường mong muốn', 'text', 'academic', FALSE, FALSE, 25),

-- 비자 정보
('visa_type', '비자 종류', 'Loại visa', 'text', 'visa', FALSE, FALSE, 30),
('visa_expiry', '비자 만료일', 'Ngày hết hạn visa', 'date', 'visa', FALSE, FALSE, 31),
('passport_number', '여권 번호', 'Số hộ chiếu', 'text', 'visa', TRUE, TRUE, 32),
('passport_expiry', '여권 만료일', 'Ngày hết hạn hộ chiếu', 'date', 'visa', FALSE, FALSE, 33),

-- 행정 정보
('sim_number', '유심 번호', 'Số điện thoại Hàn', 'text', 'admin', FALSE, FALSE, 40),
('bank_account', '은행 계좌', 'Tài khoản ngân hàng', 'text', 'admin', TRUE, TRUE, 41),
('address_korea', '한국 주소', 'Địa chỉ tại Hàn', 'text', 'admin', FALSE, FALSE, 42),
('address_vietnam', '베트남 주소', 'Địa chỉ tại Việt Nam', 'text', 'admin', FALSE, FALSE, 43)
ON CONFLICT (attribute_key) DO NOTHING;

-- 8. 테스트 계정 생성
-- 관리자 계정 (비밀번호: admin123)
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
('admin@example.com', '$2b$10$YFgJXLV3UgO2fqPjvLrZ5.qKHzPqJLYL8cXvRqLkYvXHYHq0Jm.1a', '시스템 관리자', 'admin', TRUE)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$YFgJXLV3UgO2fqPjvLrZ5.qKHzPqJLYL8cXvRqLkYvXHYHq0Jm.1a',
    full_name = '시스템 관리자',
    role = 'admin',
    is_active = TRUE;

-- 교사 계정 (비밀번호: teacher123)
INSERT INTO users (email, password_hash, full_name, role, agency_name, is_active) VALUES
('teacher@example.com', '$2b$10$k1ePAm/L2vPQxFH1gPGdB.8c8GlNqQqYHvLxfJMVqT6x3LJz/LQdm', '김선생', 'teacher', '서울유학원', TRUE)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$k1ePAm/L2vPQxFH1gPGdB.8c8GlNqQqYHvLxfJMVqT6x3LJz/LQdm',
    full_name = '김선생',
    role = 'teacher',
    agency_name = '서울유학원',
    is_active = TRUE;

-- 한국지점 계정 (비밀번호: branch123)
INSERT INTO users (email, password_hash, full_name, role, branch_name, is_active) VALUES
('branch@example.com', '$2b$10$jWy.hTnD4aG0g/sLGKH8J.LjXGH3jEFY3K2cEy/WGzOvmwLiPjkvi', '이지점장', 'korean_branch', '서울지점', TRUE)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$jWy.hTnD4aG0g/sLGKH8J.LjXGH3jEFY3K2cEy/WGzOvmwLiPjkvi',
    full_name = '이지점장',
    role = 'korean_branch',
    branch_name = '서울지점',
    is_active = TRUE;

-- 9. 확인 쿼리
SELECT user_id, email, full_name, role, 
       password_hash IS NOT NULL as has_password,
       agency_name, branch_name
FROM users 
WHERE email IN ('admin@example.com', 'teacher@example.com', 'branch@example.com');

-- 10. 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;