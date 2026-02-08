-- ============================================================================
-- Student Performance Analytics Database - Dashboard Queries
-- ============================================================================
-- Purpose: Ready-to-use queries for dashboard visualizations
-- Database: MySQL 8.0+
-- ============================================================================

USE student_performance_db;

-- ============================================================================
-- QUERY 1: Key Performance Indicators
-- Dashboard homepage metrics
-- ============================================================================

SELECT 
    (SELECT COUNT(DISTINCT student_id) FROM current_students) AS total_students,
    (SELECT COUNT(*) FROM degree_classifications WHERE graduation_status = 'Graduated') AS graduates,
    (SELECT COUNT(DISTINCT programme_name) FROM current_students) AS programmes,
    (SELECT ROUND(AVG(final_gpa), 2) FROM degree_classifications) AS avg_gpa,
    (SELECT ROUND(AVG(attendance_percentage), 2) FROM attendance) AS avg_attendance;

-- ============================================================================
-- QUERY 2: Enrollment Trends (Time Series)
-- Line chart: Student enrollment over academic years
-- ============================================================================

SELECT 
    academic_year,
    SUM(total_enrolled) AS total_students
FROM vw_enrollment_trends
GROUP BY academic_year
ORDER BY academic_year;

-- ============================================================================
-- QUERY 3: Programme Comparison
-- Bar chart: Compare programmes by key metrics
-- ============================================================================

SELECT 
    programme_name,
    SUM(total_students) AS students,
    ROUND(AVG(avg_attendance), 2) AS attendance,
    ROUND(AVG(avg_final_gpa), 2) AS gpa,
    ROUND(AVG(graduation_rate), 2) AS graduation_rate
FROM vw_programme_performance
WHERE academic_year >= '2020/21'
GROUP BY programme_name
ORDER BY students DESC;

-- ============================================================================
-- QUERY 4: Degree Classification Distribution
-- Pie chart: Breakdown of degree classes
-- ============================================================================

SELECT 
    degree_classification,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM degree_classifications), 2) AS percentage
FROM degree_classifications
GROUP BY degree_classification
ORDER BY count DESC;

-- ============================================================================
-- QUERY 5: Attendance vs Performance
-- Scatter plot: Correlation analysis
-- ============================================================================

SELECT 
    ROUND(a.attendance_percentage, -1) AS attendance_bracket,
    ROUND(AVG(dc.final_gpa), 2) AS avg_gpa,
    COUNT(DISTINCT a.student_id) AS student_count
FROM attendance a
JOIN degree_classifications dc ON a.student_id = dc.student_id
GROUP BY attendance_bracket
HAVING student_count >= 10
ORDER BY attendance_bracket;

-- ============================================================================
-- QUERY 6: Year-on-Year Performance
-- Line chart: GPA trends over time
-- ============================================================================

SELECT 
    graduation_year,
    programme,
    ROUND(AVG(avg_gpa), 2) AS avg_gpa,
    COUNT(*) AS graduates
FROM vw_graduation_outcomes
WHERE graduation_status = 'Graduated'
GROUP BY graduation_year, programme
ORDER BY graduation_year, programme;

-- ============================================================================
-- QUERY 7: Gender Distribution
-- Stacked bar chart: Gender by programme
-- ============================================================================

SELECT 
    programme_name,
    SUM(male) AS male,
    SUM(female) AS female,
    SUM(total_enrolled) AS total
FROM vw_enrollment_trends
WHERE academic_year = '2024/25'
GROUP BY programme_name
ORDER BY total DESC;

-- ============================================================================
-- QUERY 8: Attendance Status Distribution
-- Pie chart: Attendance categories
-- ============================================================================

SELECT 
    attendance_status,
    COUNT(DISTINCT student_id) AS count,
    ROUND(COUNT(DISTINCT student_id) * 100.0 / 
          (SELECT COUNT(DISTINCT student_id) FROM attendance 
           WHERE academic_year = '2024/25'), 2) AS percentage
FROM attendance
WHERE academic_year = '2024/25'
GROUP BY attendance_status
ORDER BY count DESC;

-- ============================================================================
-- QUERY 9: Top Performing Students
-- Leaderboard table
-- ============================================================================

SELECT 
    cs.student_id,
    CONCAT(cs.forename, ' ', cs.surname) AS name,
    cs.programme_name,
    dc.final_gpa,
    dc.degree_classification
FROM current_students cs
JOIN degree_classifications dc ON cs.student_id = dc.student_id
WHERE dc.graduation_status = 'Graduated'
ORDER BY dc.final_gpa DESC
LIMIT 10;

-- ============================================================================
-- QUERY 10: Programme Growth Analysis
-- Bar chart: Programme success metrics
-- ============================================================================

SELECT 
    p.programme_name,
    p.launch_year,
    COUNT(DISTINCT cs.student_id) AS all_time_students,
    COUNT(DISTINCT CASE 
        WHEN cs.academic_year = '2024/25' 
        THEN cs.student_id 
    END) AS current_students
FROM programmes p
LEFT JOIN current_students cs ON p.programme_name = cs.programme_name
WHERE p.status = 'Active'
GROUP BY p.programme_name, p.launch_year
ORDER BY all_time_students DESC;

-- ============================================================================
-- QUERY 11: Student Progression
-- Flow diagram: Students moving through year levels
-- ============================================================================

SELECT 
    academic_year,
    programme_name,
    prog_yr AS year_level,
    COUNT(DISTINCT student_id) AS students
FROM current_students
WHERE academic_year IN ('2022/23', '2023/24', '2024/25')
GROUP BY academic_year, programme_name, prog_yr
ORDER BY academic_year, programme_name, prog_yr;

-- ============================================================================
-- QUERY 12: Current Year Dashboard
-- Real-time metrics for homepage
-- ============================================================================

SELECT 
    '2024/25' AS current_year,
    COUNT(DISTINCT cs.student_id) AS current_students,
    COUNT(DISTINCT cs.programme_name) AS active_programmes,
    ROUND(AVG(a.attendance_percentage), 2) AS avg_attendance,
    COUNT(DISTINCT CASE 
        WHEN a.attendance_status = 'Concern' 
        THEN cs.student_id 
    END) AS at_risk_students
FROM current_students cs
LEFT JOIN attendance a 
    ON cs.student_id = a.student_id 
    AND cs.academic_year = a.academic_year
WHERE cs.academic_year = '2024/25';
