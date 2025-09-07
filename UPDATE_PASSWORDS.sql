-- 올바른 비밀번호 해시로 업데이트
-- 모든 비밀번호를 다시 생성하여 업데이트

-- 관리자 계정 (비밀번호: admin123)
UPDATE users 
SET password_hash = '$2b$10$ZRBgeOaaPkG6KZDwbl5ak.BbZz6kamc3l4yY18WCiUAnBcu5IHYwC'
WHERE email = 'admin@example.com';

-- 교사 계정 (비밀번호: teacher123)  
UPDATE users
SET password_hash = '$2b$10$SAxqD0kxMj5Wc0kVXG4Lx.KM2qCdtpEnTyIhE/hCzxmZhZbJNlBn6'
WHERE email = 'teacher@example.com';

-- 한국지점 계정 (비밀번호: branch123)
UPDATE users
SET password_hash = '$2b$10$YiCv6aK5lRHxSQAZg6Dnn.HLyZfM2jX8sJ8nSJVmz.0iWCHXTfYhe'
WHERE email = 'branch@example.com';

-- 확인
SELECT email, full_name, role, 
       password_hash IS NOT NULL as has_password
FROM users 
WHERE email IN ('admin@example.com', 'teacher@example.com', 'branch@example.com');