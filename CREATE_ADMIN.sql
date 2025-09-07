-- 초기 관리자 계정 생성 스크립트
-- 비밀번호: admin123 (bcrypt로 해시됨)

-- 기존 admin@example.com 계정이 있다면 삭제
DELETE FROM users WHERE email = 'admin@example.com';

-- 관리자 계정 생성
INSERT INTO users (
    email,
    password_hash,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@example.com',
    '$2b$10$YFgJXLV3UgO2fqPjvLrZ5.qKHzPqJLYL8cXvRqLkYvXHYHq0Jm.1a', -- admin123
    '시스템 관리자',
    'admin',
    true,
    NOW(),
    NOW()
);

-- 생성된 계정 확인
SELECT user_id, email, full_name, role, is_active 
FROM users 
WHERE email = 'admin@example.com';

-- 사용 방법:
-- 1. Supabase SQL Editor에서 이 스크립트 실행
-- 2. 로그인 정보:
--    이메일: admin@example.com
--    비밀번호: admin123
-- 3. 로그인 후 반드시 비밀번호를 변경하세요!