-- Supabase 최소 수정 SQL (안전 버전)
-- 기존 테이블 구조를 유지하면서 필요한 것만 추가

-- 1. password_hash 컬럼 추가 (자체 로그인용)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. 테스트 계정 생성/업데이트
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

-- 3. 확인 쿼리
SELECT user_id, email, full_name, role, 
       password_hash IS NOT NULL as has_password,
       agency_name, branch_name
FROM users 
WHERE email IN ('admin@example.com', 'teacher@example.com', 'branch@example.com');