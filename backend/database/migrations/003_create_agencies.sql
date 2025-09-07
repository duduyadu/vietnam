-- 유학원 테이블 생성
CREATE TABLE IF NOT EXISTS agencies (
  agency_id INTEGER PRIMARY KEY AUTOINCREMENT,
  agency_name VARCHAR(100) NOT NULL,
  agency_code VARCHAR(20) UNIQUE NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 기본 유학원 데이터 추가
INSERT INTO agencies (agency_name, agency_code, contact_person, phone, email, address, created_by) VALUES
('하노이 유학원', 'HANOI001', '김철수', '024-1234-5678', 'hanoi@edu.vn', '하노이시 동다구', 1),
('호치민 유학원', 'HCMC001', '이영희', '028-9876-5432', 'hcmc@edu.vn', '호치민시 1군', 1),
('다낭 유학원', 'DANANG001', '박민수', '0236-456-7890', 'danang@edu.vn', '다낭시 해안구', 1);

-- students 테이블에 agency_id 컬럼 추가 (이미 있을 수 있음)
-- ALTER TABLE students ADD COLUMN agency_id INTEGER REFERENCES agencies(agency_id);