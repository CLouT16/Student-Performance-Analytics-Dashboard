-- ============================================================================
-- Student Performance Analytics Database - Analytics Views
-- ============================================================================
-- Purpose: Create views for dashboard analytics and reporting
-- Database: MySQL 8.0+
-- ============================================================================

USE student_performance_db;

-- Drop existing views
DROP VIEW IF EXISTS vw_student_summary;
DROP VIEW IF EXISTS vw_programme_performance;
DROP VIEW IF EXISTS vw_attendance_analysis;
DROP VIEW IF EXISTS vw_graduation_outcomes;
DROP VIEW IF EXISTS vw_enrollment_trends;

-- ============================================================================
-- Student Summary View
-- Complete student profile with current academic status
-- ============================================================================

CREATE VIEW vw_student_summary AS
SELECT 
    cs.student_id,
    cs.forename,
    cs.surname,
    cs.gender,
    cs.nationality,
    cs.programme_name,
    cs.academic_year AS current_year,
    cs.prog_yr AS current_level,
    cs.stud_yr AS years_enrolled,
    cs.aims_start AS start_date,
    COUNT(DISTINCT ce.course_code) AS courses_enrolled,
    AVG(a.attendance_percentage) AS avg_attendance,
    dc.final_gpa,
    dc.degree_classification,
    dc.graduation_status
FROM current_students cs
LEFT JOIN course_enrolments ce 
    ON cs.student_id = ce.student_id 
    AND cs.academic_year = ce.academic_year
LEFT JOIN attendance a 
    ON cs.student_id = a.student_id 
    AND cs.academic_year = a.academic_year
LEFT JOIN degree_classifications dc 
    ON cs.student_id = dc.student_id
GROUP BY cs.student_id, cs.academic_year
ORDER BY cs.student_id, cs.academic_year DESC;

-- ============================================================================
-- Programme Performance View
-- Programme-level analytics and key metrics
-- ============================================================================

CREATE VIEW vw_programme_performance AS
SELECT 
    cs.programme_name,
    cs.academic_year,
    COUNT(DISTINCT cs.student_id) AS total_students,
    AVG(a.attendance_percentage) AS avg_attendance,
    COUNT(DISTINCT CASE 
        WHEN dc.graduation_status = 'Graduated' 
        THEN dc.student_id 
    END) AS graduates,
    AVG(dc.final_gpa) AS avg_final_gpa,
    COUNT(DISTINCT CASE 
        WHEN dc.degree_classification LIKE '%First%' 
        THEN dc.student_id 
    END) AS first_class_count,
    COUNT(DISTINCT CASE 
        WHEN dc.degree_classification LIKE '%Upper Second%' 
        THEN dc.student_id 
    END) AS upper_second_count,
    ROUND(COUNT(DISTINCT CASE 
        WHEN dc.graduation_status = 'Graduated' 
        THEN dc.student_id 
    END) * 100.0 / NULLIF(COUNT(DISTINCT cs.student_id), 0), 2) AS graduation_rate
FROM current_students cs
LEFT JOIN attendance a 
    ON cs.student_id = a.student_id 
    AND cs.academic_year = a.academic_year
LEFT JOIN degree_classifications dc 
    ON cs.student_id = dc.student_id
GROUP BY cs.programme_name, cs.academic_year
ORDER BY cs.academic_year DESC, cs.programme_name;

-- ============================================================================
-- Attendance Analysis View
-- Attendance patterns and correlations with performance
-- ============================================================================

CREATE VIEW vw_attendance_analysis AS
SELECT 
    a.academic_year,
    a.semester,
    cs.programme_name,
    cs.prog_yr,
    a.attendance_status,
    COUNT(DISTINCT a.student_id) AS student_count,
    AVG(a.attendance_percentage) AS avg_attendance,
    MIN(a.attendance_percentage) AS min_attendance,
    MAX(a.attendance_percentage) AS max_attendance
FROM attendance a
JOIN current_students cs 
    ON a.student_id = cs.student_id 
    AND a.academic_year = cs.academic_year
GROUP BY a.academic_year, a.semester, cs.programme_name, cs.prog_yr, a.attendance_status
ORDER BY a.academic_year DESC, a.semester, cs.programme_name;

-- ============================================================================
-- Graduation Outcomes View
-- Degree classification distribution and GPA statistics
-- ============================================================================

CREATE VIEW vw_graduation_outcomes AS
SELECT 
    dc.programme,
    dc.entry_year,
    YEAR(dc.graduation_date) AS graduation_year,
    dc.degree_classification,
    dc.graduation_status,
    COUNT(*) AS student_count,
    AVG(dc.final_gpa) AS avg_gpa,
    MIN(dc.final_gpa) AS min_gpa,
    MAX(dc.final_gpa) AS max_gpa
FROM degree_classifications dc
WHERE dc.year_3_gpa != 'N/A' AND dc.year_4_gpa != 'N/A'
GROUP BY dc.programme, dc.entry_year, 
         YEAR(dc.graduation_date), dc.degree_classification, dc.graduation_status
ORDER BY graduation_year DESC, dc.programme;

-- ============================================================================
-- Enrollment Trends View
-- Student enrollment patterns over time
-- ============================================================================

CREATE VIEW vw_enrollment_trends AS
SELECT 
    cs.academic_year,
    cs.programme_name,
    COUNT(DISTINCT cs.student_id) AS total_enrolled,
    COUNT(DISTINCT CASE WHEN cs.prog_yr = 1 THEN cs.student_id END) AS year_1,
    COUNT(DISTINCT CASE WHEN cs.prog_yr = 2 THEN cs.student_id END) AS year_2,
    COUNT(DISTINCT CASE WHEN cs.prog_yr = 3 THEN cs.student_id END) AS year_3,
    COUNT(DISTINCT CASE WHEN cs.prog_yr = 4 THEN cs.student_id END) AS year_4,
    COUNT(DISTINCT CASE WHEN cs.gender = 'M' THEN cs.student_id END) AS male,
    COUNT(DISTINCT CASE WHEN cs.gender = 'F' THEN cs.student_id END) AS female
FROM current_students cs
GROUP BY cs.academic_year, cs.programme_name
ORDER BY cs.academic_year DESC, cs.programme_name;

-- Verify views created
SHOW FULL TABLES WHERE Table_type = 'VIEW';
