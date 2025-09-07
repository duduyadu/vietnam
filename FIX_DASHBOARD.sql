-- 대시보드 통계 뷰 재생성
DROP VIEW IF EXISTS dashboard_stats CASCADE;
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM students WHERE status = 'studying') as active_students,
    (SELECT COUNT(*) FROM consultations WHERE DATE(consultation_date) >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_consultations,
    (SELECT COUNT(*) FROM students WHERE status = 'graduated') as graduated_students;

-- 학생 목록 뷰 재생성
DROP VIEW IF EXISTS student_list_view CASCADE;
CREATE VIEW student_list_view AS
SELECT 
    s.student_id,
    s.student_code,
    s.status,
    s.agency_id,
    COALESCE(a.agency_name, '미지정') as agency_name,
    COALESCE(
        MAX(CASE WHEN sa.attribute_name = 'korean_name' THEN sa.attribute_value END),
        MAX(CASE WHEN sa.attribute_name = 'vietnamese_name' THEN sa.attribute_value END),
        s.student_code
    ) as name,
    MAX(CASE WHEN sa.attribute_name = 'phone' THEN sa.attribute_value END) as phone,
    MAX(CASE WHEN sa.attribute_name = 'email' THEN sa.attribute_value END) as email
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN student_attributes sa ON s.student_id = sa.student_id
GROUP BY s.student_id, s.student_code, s.status, s.agency_id, a.agency_name
ORDER BY s.student_id DESC;