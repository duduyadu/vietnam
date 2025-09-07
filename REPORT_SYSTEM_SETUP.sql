-- 베트남 유학생 상담 보고서 시스템 - Supabase PostgreSQL 설정
-- 실행 순서: 이 SQL을 Supabase SQL Editor에서 실행

-- 1. 시험 성적 테이블
CREATE TABLE exam_results (
    exam_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    
    -- 시험 기본 정보
    exam_name VARCHAR(100) NOT NULL,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'academic',
    subject VARCHAR(100),
    exam_date DATE NOT NULL,
    semester VARCHAR(20),
    
    -- 점수 정보
    score NUMERIC(5,2),
    max_score NUMERIC(5,2),
    percentage NUMERIC(5,2),
    grade VARCHAR(10),
    rank INTEGER,
    total_students INTEGER,
    
    -- 상세 정보
    detailed_scores JSONB,
    notes TEXT,
    certificate_path VARCHAR(500),
    
    -- 메타데이터
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 외래키 (나중에 추가)
    CONSTRAINT fk_exam_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 2. 학습 진도 테이블
CREATE TABLE learning_progress (
    progress_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    
    -- 학습 기본 정보
    subject VARCHAR(100) NOT NULL,
    course_name VARCHAR(150),
    level VARCHAR(50),
    record_date DATE NOT NULL,
    semester VARCHAR(20),
    
    -- 진도 정보
    total_lessons INTEGER,
    completed_lessons INTEGER,
    completion_percentage NUMERIC(5,2),
    attendance_count INTEGER,
    absence_count INTEGER,
    attendance_rate NUMERIC(5,2),
    
    -- 성과 정보
    quiz_average NUMERIC(5,2),
    assignment_average NUMERIC(5,2),
    participation_score NUMERIC(5,2),
    strengths TEXT,
    weaknesses TEXT,
    improvement_areas TEXT,
    
    -- 목표 및 계획
    monthly_goals TEXT,
    action_plan TEXT,
    target_completion_date DATE,
    
    -- 교사 평가
    overall_performance VARCHAR(20) CHECK (overall_performance IN ('excellent', 'good', 'average', 'below_average', 'poor')),
    teacher_comments TEXT,
    skill_assessment JSONB,
    
    -- 메타데이터
    teacher_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_teacher FOREIGN KEY (teacher_id) REFERENCES users(user_id)
);

-- 3. 학업 목표 테이블
CREATE TABLE academic_goals (
    goal_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    
    -- 목표 기본 정보
    goal_type VARCHAR(50) NOT NULL,
    goal_category VARCHAR(100),
    goal_description TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    
    -- 기간 정보
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'delayed', 'cancelled')),
    
    -- 성과 지표
    target_score NUMERIC(5,2),
    current_score NUMERIC(5,2),
    progress_percentage NUMERIC(5,2),
    milestones JSONB,
    
    -- 상세 계획
    action_steps TEXT,
    required_resources TEXT,
    potential_obstacles TEXT,
    support_needed TEXT,
    
    -- 평가 및 피드백
    teacher_feedback TEXT,
    student_reflection TEXT,
    adjustment_notes TEXT,
    
    -- 메타데이터
    created_by INTEGER,
    assigned_teacher INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_goal_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_creator FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT fk_goal_teacher FOREIGN KEY (assigned_teacher) REFERENCES users(user_id)
);

-- 4. 보고서 템플릿 테이블
CREATE TABLE report_templates (
    template_id SERIAL PRIMARY KEY,
    
    -- 템플릿 기본 정보
    template_name VARCHAR(100) NOT NULL,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('consultation', 'academic_progress', 'comprehensive', 'performance_analysis', 'goal_tracking')),
    
    -- 템플릿 구성
    template_config JSONB,
    html_template TEXT,
    css_styles TEXT,
    data_sources JSONB,
    chart_configs JSONB,
    
    -- 다국어 지원
    labels_ko JSONB,
    labels_vi JSONB,
    
    -- 권한 및 가시성
    allowed_roles JSONB,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- 버전 관리
    version VARCHAR(20) DEFAULT '1.0',
    parent_template_id INTEGER,
    
    -- 메타데이터
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_template_parent FOREIGN KEY (parent_template_id) REFERENCES report_templates(template_id),
    CONSTRAINT fk_template_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 5. 생성된 보고서 테이블
CREATE TABLE generated_reports (
    report_id SERIAL PRIMARY KEY,
    
    -- 보고서 기본 정보
    student_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    report_title VARCHAR(200) NOT NULL,
    report_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    
    -- 보고서 데이터
    report_data JSONB,
    chart_data JSONB,
    summary_text TEXT,
    recommendations TEXT,
    
    -- 파일 정보
    pdf_path VARCHAR(500),
    html_path VARCHAR(500),
    file_size INTEGER,
    file_hash VARCHAR(64),
    
    -- 상태 및 메타데이터
    status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'archived')),
    error_message TEXT,
    generation_time_ms INTEGER,
    
    -- 접근 권한
    shared_with JSONB,
    is_public BOOLEAN DEFAULT false,
    expires_at DATE,
    
    -- 메타데이터
    generated_by INTEGER NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 외래키
    CONSTRAINT fk_report_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_template FOREIGN KEY (template_id) REFERENCES report_templates(template_id),
    CONSTRAINT fk_report_generator FOREIGN KEY (generated_by) REFERENCES users(user_id)
);

-- 인덱스 생성
CREATE INDEX idx_exam_results_student_date ON exam_results(student_id, exam_date);
CREATE INDEX idx_exam_results_type ON exam_results(exam_name, exam_type);
CREATE INDEX idx_exam_results_semester ON exam_results(semester);

CREATE INDEX idx_learning_progress_student_date ON learning_progress(student_id, record_date);
CREATE INDEX idx_learning_progress_subject ON learning_progress(subject, level);
CREATE INDEX idx_learning_progress_semester ON learning_progress(semester);
CREATE INDEX idx_learning_progress_teacher ON learning_progress(teacher_id);

CREATE INDEX idx_academic_goals_student_status ON academic_goals(student_id, status);
CREATE INDEX idx_academic_goals_type ON academic_goals(goal_type, goal_category);
CREATE INDEX idx_academic_goals_target_date ON academic_goals(target_date);
CREATE INDEX idx_academic_goals_teacher ON academic_goals(assigned_teacher);

CREATE INDEX idx_report_templates_code ON report_templates(template_code);
CREATE INDEX idx_report_templates_type ON report_templates(report_type);
CREATE INDEX idx_report_templates_active ON report_templates(is_active);

CREATE INDEX idx_generated_reports_student_date ON generated_reports(student_id, report_date);
CREATE INDEX idx_generated_reports_template ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);
CREATE INDEX idx_generated_reports_generator ON generated_reports(generated_by);
CREATE INDEX idx_generated_reports_generated_at ON generated_reports(generated_at);

-- 기본 보고서 템플릿 데이터 삽입
INSERT INTO report_templates (
    template_name, template_code, description, report_type, 
    allowed_roles, is_active, is_default, display_order, version,
    labels_ko, labels_vi, data_sources, chart_configs, created_by,
    css_styles, html_template
) VALUES (
    '종합 상담 보고서',
    'consultation_comprehensive',
    '학생의 학업 성과, 상담 기록, 학습 진도를 종합한 전문적인 상담 보고서',
    'consultation',
    '["admin", "teacher", "korean_branch"]',
    true,
    true,
    1,
    '1.0',
    '{"title": "종합 상담 보고서", "student_info": "학생 기본 정보", "academic_performance": "학업 성과", "learning_progress": "학습 진도", "consultation_records": "상담 기록", "recommendations": "향후 계획 및 추천사항"}',
    '{"title": "Báo cáo tư vấn toàn diện", "student_info": "Thông tin cơ bản sinh viên", "academic_performance": "Kết quả học tập", "learning_progress": "Tiến độ học tập", "consultation_records": "Hồ sơ tư vấn", "recommendations": "Kế hoạch và khuyến nghị tương lai"}',
    '["student_basic_info", "exam_results", "learning_progress", "consultations", "academic_goals"]',
    '{"score_trend": {"type": "line", "title": "성적 추이", "data_source": "exam_results"}}',
    1,
    -- CSS 스타일
    'body { font-family: "Malgun Gothic", "Noto Sans KR", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
    .report-container { max-width: 210mm; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .report-header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
    .report-title { font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0; }
    .report-subtitle { font-size: 16px; color: #7f8c8d; margin: 10px 0 0 0; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section-title { font-size: 20px; font-weight: bold; color: #34495e; border-left: 4px solid #3498db; padding-left: 15px; margin-bottom: 15px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-item { display: flex; margin-bottom: 8px; }
    .info-label { font-weight: bold; min-width: 120px; color: #5d6d7e; }
    .info-value { flex: 1; color: #2c3e50; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { font-size: 14px; opacity: 0.9; }
    .chart-container { text-align: center; margin: 20px 0; page-break-inside: avoid; }
    .chart-image { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
    .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .table th { background-color: #f8f9fa; color: #495057; font-weight: bold; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #dee2e6; }
    .table tbody tr:hover { background-color: #f8f9fa; }
    .grade-excellent { color: #27ae60; font-weight: bold; }
    .grade-good { color: #f39c12; font-weight: bold; }
    .grade-average { color: #e67e22; font-weight: bold; }
    .grade-poor { color: #e74c3c; font-weight: bold; }
    .consultation-item { background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin-bottom: 15px; border-radius: 0 4px 4px 0; }
    .consultation-date { font-weight: bold; color: #2c3e50; margin-bottom: 8px; }
    .consultation-content { line-height: 1.6; color: #5d6d7e; }
    .recommendation-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .recommendation-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
    .recommendation-list { list-style: none; padding: 0; }
    .recommendation-list li { margin-bottom: 10px; padding-left: 20px; position: relative; }
    .recommendation-list li:before { content: "▶"; position: absolute; left: 0; color: #f1c40f; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px; }
    @media print { body { background: white; } .report-container { box-shadow: none; margin: 0; } .section { page-break-inside: avoid; } }',
    -- HTML 템플릿
    '<div class="report-container">
        <div class="report-header">
            <h1 class="report-title">종합 상담 보고서</h1>
            <p class="report-subtitle">보고서 생성일</p>
        </div>
        <div class="section">
            <h2 class="section-title">학생 기본 정보</h2>
            <div class="info-grid">
                <div>
                    <div class="info-item"><span class="info-label">이름:</span><span class="info-value">학생 이름</span></div>
                    <div class="info-item"><span class="info-label">학생코드:</span><span class="info-value">학생 코드</span></div>
                    <div class="info-item"><span class="info-label">연락처:</span><span class="info-value">연락처</span></div>
                </div>
                <div>
                    <div class="info-item"><span class="info-label">유학원:</span><span class="info-value">유학원명</span></div>
                    <div class="info-item"><span class="info-label">상태:</span><span class="info-value">상태</span></div>
                </div>
            </div>
        </div>
        <div class="section">
            <h2 class="section-title">학업 성과</h2>
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-value">평균점수</div><div class="stat-label">평균 점수</div></div>
                <div class="stat-card"><div class="stat-value">시험횟수</div><div class="stat-label">총 시험 횟수</div></div>
                <div class="stat-card"><div class="stat-value">출석률</div><div class="stat-label">출석률</div></div>
                <div class="stat-card"><div class="stat-value">상담횟수</div><div class="stat-label">상담 횟수</div></div>
            </div>
        </div>
        <div class="footer">
            <p>본 보고서는 베트남 유학생 통합 관리 시스템에서 자동 생성되었습니다.</p>
        </div>
    </div>'
);

INSERT INTO report_templates (
    template_name, template_code, description, report_type, 
    allowed_roles, is_active, is_default, display_order, version,
    labels_ko, labels_vi, data_sources, created_by,
    css_styles, html_template
) VALUES (
    '학업 진도 보고서',
    'academic_progress',
    '학습 진도와 성과를 중심으로 한 분석 보고서',
    'academic_progress',
    '["admin", "teacher"]',
    true,
    false,
    2,
    '1.0',
    '{"title": "학업 진도 보고서", "progress_overview": "진도 현황", "performance_analysis": "성과 분석", "goal_tracking": "목표 달성도"}',
    '{"title": "Báo cáo tiến độ học tập", "progress_overview": "Tổng quan tiến độ", "performance_analysis": "Phân tích kết quả", "goal_tracking": "Theo dõi mục tiêu"}',
    '["learning_progress", "academic_goals", "exam_results"]',
    1,
    'body { font-family: "Malgun Gothic", "Noto Sans KR", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .report-container { max-width: 210mm; margin: 0 auto; background: white; padding: 30px; }
    .report-header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
    .report-title { font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0; }',
    '<div class="report-container">
        <div class="report-header">
            <h1 class="report-title">학업 진도 보고서</h1>
        </div>
        <div class="section">
            <h2>진도 현황</h2>
            <p>학습 진도 정보가 표시됩니다.</p>
        </div>
    </div>'
);

-- 완료 메시지
SELECT 'Supabase 보고서 시스템 테이블 생성 완료!' as status;