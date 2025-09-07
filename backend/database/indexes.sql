-- 인덱스 생성 스크립트
-- SQLite용 성능 최적화 인덱스

-- 학생 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_students_agency_id ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- 학생 속성 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_student_attributes_student_id ON student_attributes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attributes_key ON student_attributes(attribute_key);
CREATE INDEX IF NOT EXISTS idx_student_attributes_student_key ON student_attributes(student_id, attribute_key);

-- 유학원 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_agencies_agency_code ON agencies(agency_code);
CREATE INDEX IF NOT EXISTS idx_agencies_agency_name ON agencies(agency_name);

-- 사용자 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 상담 기록 인덱스
CREATE INDEX IF NOT EXISTS idx_consultations_student_id ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_consultations_teacher_id ON consultations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);

-- 감사 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);