-- 사용자 테이블에 username 필드 추가 및 마이그레이션

-- 1. username 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 2. 기존 이메일을 사용해서 username 생성 (@ 앞부분 사용)
UPDATE users 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL;

-- 3. 중복된 username이 있는 경우 처리 (숫자 추가)
WITH duplicate_usernames AS (
  SELECT username, COUNT(*) as cnt, 
         ROW_NUMBER() OVER (PARTITION BY username ORDER BY user_id) as rn
  FROM users
  WHERE username IS NOT NULL
  GROUP BY username, user_id
)
UPDATE users u
SET username = u.username || '_' || d.rn
FROM duplicate_usernames d
WHERE u.username = d.username 
  AND d.cnt > 1 
  AND d.rn > 1;

-- 4. username을 NOT NULL로 변경
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- 5. 인덱스 생성 (로그인 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 6. 테스트 계정 업데이트
UPDATE users SET username = 'admin' WHERE email = 'admin@example.com';
UPDATE users SET username = 'teacher1' WHERE email = 'teacher@example.com';
UPDATE users SET username = 'korean1' WHERE email = 'korean@example.com';

-- 확인
SELECT user_id, username, email, role FROM users ORDER BY user_id;