-- 기존 Supabase 테이블을 백엔드 코드와 맞추기 위한 수정 SQL

-- 1. users 테이블에 password_hash 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. role 체크 제약 조건 수정 (korean_branch → branch)
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'teacher', 'branch'));

-- 3. 기존 korean_branch 역할을 branch로 업데이트
UPDATE users 
SET role = 'branch' 
WHERE role = 'korean_branch';

-- 4. email 컬럼이 없다면 추가 (이미 있을 것)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- 5. attribute_definitions 테이블 구조 확인 및 수정
ALTER TABLE attribute_definitions 
ADD COLUMN IF NOT EXISTS attribute_key VARCHAR(50),
ADD COLUMN IF NOT EXISTS attribute_name_ko VARCHAR(100),
ADD COLUMN IF NOT EXISTS attribute_name_vi VARCHAR(100),
ADD COLUMN IF NOT EXISTS data_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;

-- attribute_key를 기본 키로 설정 (기존 구조와 다를 경우)
-- 먼저 기존 데이터 확인 필요

-- 6. student_attributes 테이블 수정
ALTER TABLE student_attributes
ADD COLUMN IF NOT EXISTS attribute_key VARCHAR(50),
ADD COLUMN IF NOT EXISTS file_path VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(user_id);

-- 7. 테스트 계정 추가 (비밀번호 해시 포함)
-- 관리자 계정 (비밀번호: admin123)
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
('admin@example.com', '$2b$10$YFgJXLV3UgO2fqPjvLrZ5.qKHzPqJLYL8cXvRqLkYvXHYHq0Jm.1a', '시스템 관리자', 'admin', TRUE)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$YFgJXLV3UgO2fqPjvLrZ5.qKHzPqJLYL8cXvRqLkYvXHYHq0Jm.1a';

-- 교사 계정 (비밀번호: teacher123)
INSERT INTO users (email, password_hash, full_name, role, agency_name, is_active) VALUES
('teacher@example.com', '$2b$10$k1ePAm/L2vPQxFH1gPGdB.8c8GlNqQqYHvLxfJMVqT6x3LJz/LQdm', '김선생', 'teacher', '서울유학원', TRUE)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$k1ePAm/L2vPQxFH1gPGdB.8c8GlNqQqYHvLxfJMVqT6x3LJz/LQdm';

-- 한국지점 계정 (비밀번호: branch123)
INSERT INTO users (email, password_hash, full_name, role, branch_name, is_active) VALUES
('branch@example.com', '$2b$10$jWy.hTnD4aG0g/sLGKH8J.LjXGH3jEFY3K2cEy/WGzOvmwLiPjkvi', '이지점장', 'branch', '서울지점', TRUE)
ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2b$10$jWy.hTnD4aG0g/sLGKH8J.LjXGH3jEFY3K2cEy/WGzOvmwLiPjkvi';

-- 8. 확인 쿼리
SELECT user_id, email, full_name, role, password_hash IS NOT NULL as has_password 
FROM users 
WHERE email IN ('admin@example.com', 'teacher@example.com', 'branch@example.com');