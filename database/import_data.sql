-- ============================================================================
-- Student Performance Analytics Database - Data Import
-- ============================================================================
-- Purpose: Load CSV data into database tables
-- Database: MySQL 8.0+
-- Note: Update file paths to match your local directory structure
-- ============================================================================

USE student_performance_db;

-- Enable local file loading
SET GLOBAL local_infile = 1;

-- ============================================================================
-- Import Students Data
-- ============================================================================

LOAD DATA LOCAL INFILE '/path/to/COMBINED_Current_Students_All_Years.csv'
INTO TABLE current_students
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(academic_year, student_id, surname, forename, gender, @date_of_birth, nationality, 
 username, email, prog_yr, stud_yr, @aims_start, @aims_expend, category, programme_name)
SET 
    date_of_birth = STR_TO_DATE(@date_of_birth, '%Y-%m-%d'),
    aims_start = STR_TO_DATE(@aims_start, '%Y-%m-%d'),
    aims_expend = STR_TO_DATE(@aims_expend, '%Y-%m-%d');

-- ============================================================================
-- Import Course Enrolments
-- ============================================================================

LOAD DATA LOCAL INFILE '/path/to/COMBINED_Course_Enrolments_All_Years.csv'
INTO TABLE course_enrolments
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(academic_year, student_id, course_code, credits, semester);

-- ============================================================================
-- Import Attendance Data
-- ============================================================================

LOAD DATA LOCAL INFILE '/path/to/COMBINED_Attendance_All_Years.csv'
INTO TABLE attendance
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(academic_year, semester, student_id, course_code, total_sessions, 
 sessions_attended, attendance_percentage, attendance_status);

-- ============================================================================
-- Import Degree Classifications
-- ============================================================================

LOAD DATA LOCAL INFILE '/path/to/Degree_Classifications.csv'
INTO TABLE degree_classifications
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(student_id, programme, entry_level, entry_year, total_credits, 
 year_3_gpa, year_4_gpa, final_gpa, degree_classification, 
 @graduation_date, graduation_status)
SET graduation_date = STR_TO_DATE(@graduation_date, '%Y-%m-%d');

-- ============================================================================
-- Verify Import
-- ============================================================================

SELECT 'Students' AS Table_Name, COUNT(*) AS Records FROM current_students
UNION ALL
SELECT 'Enrolments', COUNT(*) FROM course_enrolments
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'Graduates', COUNT(*) FROM degree_classifications;
