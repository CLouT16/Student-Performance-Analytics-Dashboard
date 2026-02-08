-- ============================================================================
-- Student Performance Analytics Database - Schema Creation
-- ============================================================================
-- Purpose: Create database tables for student performance analytics
-- Database: MySQL 8.0+
-- ============================================================================

USE student_performance_db;

-- Clean slate: Drop existing tables
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS course_results;
DROP TABLE IF EXISTS course_enrolments;
DROP TABLE IF EXISTS degree_classifications;
DROP TABLE IF EXISTS current_students;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS programmes;

-- ============================================================================
-- Reference Tables
-- ============================================================================

-- Programmes table: Stores programme metadata
CREATE TABLE programmes (
    programme_id INT AUTO_INCREMENT PRIMARY KEY,
    programme_code VARCHAR(10) NOT NULL UNIQUE,
    programme_name VARCHAR(100) NOT NULL,
    launch_year VARCHAR(7) NOT NULL,
    status VARCHAR(20) NOT NULL,
    duration_years INT NOT NULL DEFAULT 4,
    total_credits INT NOT NULL DEFAULT 480,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_programme_code (programme_code),
    INDEX idx_programme_name (programme_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert programme data
INSERT INTO programmes (programme_code, programme_name, launch_year, status, duration_years, total_credits) VALUES
('BM', 'Business Management', '2017/18', 'Active', 4, 480),
('AF', 'Accountancy & Finance', '2017/18', 'Active', 4, 480),
('BM-IS', 'Business Management and Information Systems', '2020/21', 'Active', 4, 480),
('BM-IR', 'Business Management and International Relations', '2020/21', 'Active', 4, 480),
('BM-LS', 'Business Management – Legal Studies', '2022/23', 'Discontinued', 4, 480),
('CS', 'Computing Science', '2023/24', 'Active', 4, 480),
('PIR', 'Politics and International Relations', '2023/24', 'Active', 4, 480);

-- Courses table: Course catalogue
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(10) NOT NULL UNIQUE,
    course_title VARCHAR(200),
    school VARCHAR(100),
    programme_codes VARCHAR(100),
    prog_year INT,
    credits INT NOT NULL,
    session VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_course_code (course_code),
    INDEX idx_prog_year (prog_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- Operational Tables
-- ============================================================================

-- Current Students: Student enrollment records
CREATE TABLE current_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(7) NOT NULL,
    student_id VARCHAR(8) NOT NULL,
    surname VARCHAR(100),
    forename VARCHAR(100),
    gender CHAR(1),
    date_of_birth DATE,
    nationality VARCHAR(100),
    username VARCHAR(50),
    email VARCHAR(100),
    prog_yr INT,
    stud_yr INT,
    aims_start DATE,
    aims_expend DATE,
    category VARCHAR(10) DEFAULT 'UG',
    programme_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_programme_name (programme_name),
    UNIQUE KEY unique_student_year (student_id, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Course Enrolments: Student course registrations
CREATE TABLE course_enrolments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(7) NOT NULL,
    student_id VARCHAR(8) NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    credits INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_course_code (course_code),
    INDEX idx_academic_year (academic_year),
    UNIQUE KEY unique_enrolment (student_id, course_code, academic_year, semester),
    FOREIGN KEY (student_id, academic_year) 
        REFERENCES current_students(student_id, academic_year) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Course Results: Student grades
CREATE TABLE course_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(7) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    student_id VARCHAR(8) NOT NULL,
    course_grade_point DECIMAL(5,2),
    overall_grade VARCHAR(5),
    is_np BOOLEAN DEFAULT FALSE,
    warning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_course_code (course_code),
    INDEX idx_academic_year (academic_year),
    UNIQUE KEY unique_result (student_id, course_code, academic_year, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance: Student attendance tracking
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(7) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    student_id VARCHAR(8) NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    total_sessions INT NOT NULL DEFAULT 20,
    sessions_attended INT NOT NULL,
    attendance_percentage DECIMAL(5,2) NOT NULL,
    attendance_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_course_code (course_code),
    INDEX idx_academic_year (academic_year),
    UNIQUE KEY unique_attendance (student_id, course_code, academic_year, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Degree Classifications: Graduate outcomes
CREATE TABLE degree_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(8) NOT NULL UNIQUE,
    programme VARCHAR(100) NOT NULL,
    entry_level INT NOT NULL,
    entry_year VARCHAR(7) NOT NULL,
    total_credits INT NOT NULL,
    year_3_gpa VARCHAR(10),
    year_4_gpa VARCHAR(10),
    final_gpa DECIMAL(5,2) NOT NULL,
    degree_classification VARCHAR(50) NOT NULL,
    graduation_date DATE NOT NULL,
    graduation_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_programme (programme),
    INDEX idx_final_gpa (final_gpa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify table creation
SHOW TABLES;
