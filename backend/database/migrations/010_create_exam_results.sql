-- 시험 결과 테이블 생성
CREATE TABLE IF NOT EXISTS exam_results (
    exam_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    exam_date DATE NOT NULL,
    exam_type VARCHAR(50) DEFAULT 'TOPIK',
    reading_score INTEGER,
    listening_score INTEGER,
    writing_score INTEGER,
    speaking_score INTEGER,
    total_score INTEGER,
    level VARCHAR(20),
    percentile DECIMAL(5,2),
    exam_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_exam_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_exam_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 인덱스 생성
CREATE INDEX idx_exam_student ON exam_results(student_id);
CREATE INDEX idx_exam_date ON exam_results(exam_date);
CREATE INDEX idx_exam_type ON exam_results(exam_type);

-- 학습 진도 테이블 생성  
CREATE TABLE IF NOT EXISTS learning_progress (
    progress_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    attendance_rate DECIMAL(5,2),
    homework_completion_rate DECIMAL(5,2),
    class_participation VARCHAR(10),
    current_level VARCHAR(50),
    target_level VARCHAR(50),
    vocabulary_score INTEGER,
    grammar_score INTEGER,
    speaking_score INTEGER,
    listening_score INTEGER,
    reading_score INTEGER,
    writing_score INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_progress_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 인덱스 생성
CREATE INDEX idx_progress_student ON learning_progress(student_id);
CREATE INDEX idx_progress_date ON learning_progress(record_date);

-- 학업 목표 테이블 생성
CREATE TABLE IF NOT EXISTS academic_goals (
    goal_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    goal_type VARCHAR(50),
    goal_description TEXT,
    target_date DATE,
    target_score INTEGER,
    current_score INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress',
    achievement_rate DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_goal_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_goal_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 인덱스 생성
CREATE INDEX idx_goal_student ON academic_goals(student_id);
CREATE INDEX idx_goal_status ON academic_goals(status);

-- 보고서 생성 이력 테이블
CREATE TABLE IF NOT EXISTS generated_reports (
    report_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    consultation_id INTEGER,
    report_type VARCHAR(50),
    report_title VARCHAR(200),
    file_path TEXT,
    file_size INTEGER,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INTEGER,
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    
    CONSTRAINT fk_report_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_report_consultation FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id),
    CONSTRAINT fk_report_generated_by FOREIGN KEY (generated_by) REFERENCES users(user_id)
);

-- 인덱스 생성
CREATE INDEX idx_report_student ON generated_reports(student_id);
CREATE INDEX idx_report_type ON generated_reports(report_type);
CREATE INDEX idx_report_date ON generated_reports(generated_at);

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO exam_results (student_id, exam_date, exam_type, reading_score, listening_score, writing_score, total_score, level, created_by)
SELECT 
    student_id,
    CURRENT_DATE - INTERVAL '30 days',
    'TOPIK',
    60 + FLOOR(RANDOM() * 40),
    60 + FLOOR(RANDOM() * 40),
    50 + FLOOR(RANDOM() * 30),
    0,
    'TOPIK 3급',
    1
FROM students
LIMIT 5;

-- total_score 업데이트
UPDATE exam_results 
SET total_score = reading_score + listening_score + COALESCE(writing_score, 0);

-- level 자동 계산
UPDATE exam_results
SET level = CASE
    WHEN total_score >= 230 THEN 'TOPIK 6급'
    WHEN total_score >= 190 THEN 'TOPIK 5급'
    WHEN total_score >= 150 THEN 'TOPIK 4급'
    WHEN total_score >= 120 THEN 'TOPIK 3급'
    WHEN total_score >= 80 THEN 'TOPIK 2급'
    WHEN total_score >= 40 THEN 'TOPIK 1급'
    ELSE '미취득'
END;