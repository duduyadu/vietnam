-- Students 테이블에 이름 필드 추가
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS name_ko VARCHAR(100),
ADD COLUMN IF NOT EXISTS name_vi VARCHAR(100);

-- 기존 학생들에 임시 이름 설정
UPDATE students 
SET name_ko = '학생' || student_id,
    name_vi = 'Học sinh ' || student_id
WHERE name_ko IS NULL;

-- 샘플 데이터 업데이트
UPDATE students SET name_ko = '김민수', name_vi = 'Kim Min Su' WHERE student_code = 'TEST_1755439289410';
UPDATE students SET name_ko = '이영희', name_vi = 'Lee Young Hee' WHERE student_code = 'STU1755439337936';
UPDATE students SET name_ko = '박철수', name_vi = 'Park Chul Soo' WHERE student_code = 'VN2024001';
UPDATE students SET name_ko = '최지원', name_vi = 'Choi Ji Won' WHERE student_code = 'STU1755604327419';