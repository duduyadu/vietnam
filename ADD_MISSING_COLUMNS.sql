-- users 테이블에 누락된 컬럼 추가

-- 1. last_login 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- 2. phone 컬럼 추가 (옵션)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 3. preferred_language 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'ko';

-- 확인 쿼리
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;