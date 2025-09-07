-- ========================================
-- Supabase 데이터베이스 설정 SQL
-- 이 SQL을 Supabase 대시보드의 SQL Editor에 붙여넣고 실행하세요
-- https://supabase.com/dashboard/project/wtajfzjqypegjjkiuhti/sql
-- ========================================

-- 1. users 테이블
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'korean_branch')),
  agency_id INTEGER,
  agency_name VARCHAR(100),
  contact VARCHAR(50),
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
  agency_id INTEGER REFERENCES agencies(agency_id),
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

-- 7. desired_major_history 테이블 (희망 학과 변경 이력)
CREATE TABLE IF NOT EXISTS desired_major_history (
  history_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  major VARCHAR(100),
  university VARCHAR(100),
  change_date DATE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. audit_logs 테이블
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  action VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id INTEGER,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- audit_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- ========================================
-- 초기 데이터 삽입
-- ========================================

-- attribute_definitions 초기 데이터
INSERT INTO attribute_definitions (attribute_key, attribute_name_ko, attribute_name_vi, data_type, category, is_sensitive, is_encrypted, display_order) VALUES
('name', '이름', 'Họ tên', 'string', 'basic', false, false, 1),
('birth_date', '생년월일', 'Ngày sinh', 'date', 'basic', false, false, 2),
('gender', '성별', 'Giới tính', 'string', 'basic', false, false, 3),
('phone', '연락처', 'Số điện thoại', 'string', 'basic', false, false, 4),
('email', '이메일', 'Email', 'string', 'basic', false, false, 5),
('address_vietnam', '베트남 주소', 'Địa chỉ tại Việt Nam', 'string', 'basic', false, false, 6),
('address_korea', '한국 주소', 'Địa chỉ tại Hàn Quốc', 'string', 'basic', false, false, 7),
('agency_enrollment_date', '유학원 등록 년월', 'Tháng năm đăng ký', 'date', 'basic', false, false, 8),
('parent_name', '부모님 성함', 'Tên phụ huynh', 'string', 'family', false, false, 10),
('parent_phone', '부모님 연락처', 'SĐT phụ huynh', 'string', 'family', false, false, 11),
('parent_income', '가족 연소득', 'Thu nhập gia đình', 'string', 'family', true, true, 12),
('high_school', '출신 고등학교', 'Trường THPT', 'string', 'academic', false, false, 20),
('gpa', '고등학교 성적', 'Điểm GPA', 'number', 'academic', false, false, 21),
('desired_major', '희망 전공', 'Ngành học mong muốn', 'string', 'academic', false, false, 22),
('desired_university', '희망 대학', 'Trường đại học mong muốn', 'string', 'academic', false, false, 23),
('visa_type', '비자 종류', 'Loại visa', 'string', 'visa', false, false, 30),
('visa_expiry', '비자 만료일', 'Ngày hết hạn visa', 'date', 'visa', false, false, 31),
('alien_registration', '외국인등록번호', 'Số đăng ký người nước ngoài', 'string', 'visa', true, true, 32)
ON CONFLICT (attribute_key) DO NOTHING;

-- 관리자 계정 (비밀번호: admin123을 bcrypt로 해시)
-- $2b$10$... 는 bcrypt 해시된 'admin123'입니다
INSERT INTO users (username, password, full_name, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', '시스템 관리자', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 샘플 유학원 데이터
INSERT INTO agencies (agency_name, agency_code, contact_person, phone, email, address) VALUES
('하노이 유학원', 'HANOI001', '김철수', '024-1234-5678', 'hanoi@edu.vn', '하노이시 동다구'),
('호치민 유학원', 'HCMC001', '이영희', '028-9876-5432', 'hcmc@edu.vn', '호치민시 1군'),
('다낭 유학원', 'DANANG001', '박민수', '0236-456-7890', 'danang@edu.vn', '다낭시 해안구')
ON CONFLICT (agency_code) DO NOTHING;

-- ========================================
-- 실행 완료 메시지
-- ========================================
-- 모든 테이블과 초기 데이터가 생성되었습니다!
-- 이제 애플리케이션을 실행할 수 있습니다.