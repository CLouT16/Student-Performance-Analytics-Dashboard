// Comprehensive Data Loader for Student Performance Analytics
const DataLoader = {
    students: [],
    currentStudents: [],
    enrollments: [],
    attendance: [],
    classifications: [],
    filteredData: null,
    
    // Configuration for all CSV file paths
    csvPaths: {
        admissions: 'data/01_Admissions_Synthetic_Data.csv',
        currentStudents: 'data/02_COMBINED_Current_Students_All_Years.csv',
        enrollments: 'data/03_COMBINED_Course_Enrolments_All_Years.csv',
        courseReports: 'data/04_COMBINED_Current_Students_All_Years.csv',
        attendance: 'data/05_COMBINED_Attendance_All_Years.csv',
        classifications: 'data/06_Degree_Classifications.csv'
    },

    // Load all CSV files
    async loadAllData() {
        try {
            console.log('Loading all data files...');
            
            const [admissionsData, currentStudentsData, enrollmentsData, courseReportsData, attendanceData, classificationsData] = await Promise.all([
                this.loadCSV(this.csvPaths.admissions),
                this.loadCSV(this.csvPaths.currentStudents),
                this.loadCSV(this.csvPaths.enrollments),
                this.loadCSV(this.csvPaths.courseReports),
                this.loadCSV(this.csvPaths.attendance),
                this.loadCSV(this.csvPaths.classifications)
            ]);

            this.students = this.processAdmissionsData(admissionsData);
            this.currentStudents = this.processCurrentStudentsData(currentStudentsData);
            this.enrollments = this.processEnrollmentsData(enrollmentsData);
            this.grades = this.processCourseReportsData(courseReportsData);
            this.attendance = this.processAttendanceData(attendanceData);
            this.classifications = this.processClassificationsData(classificationsData);

            console.log(`✓ Loaded ${this.students.length} admissions records`);
            console.log(`✓ Loaded ${this.currentStudents.length} current student records`);
            console.log(`✓ Loaded ${this.enrollments.length} enrollment records`);
            console.log(`✓ Loaded ${this.grades.length} grade records`);
            console.log(`✓ Loaded ${this.attendance.length} attendance records`);
            console.log(`✓ Loaded ${this.classifications.length} degree classifications`);

            // Initialize filtered data
            this.filteredData = this.getData();

            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    },

    // Load individual CSV file using PapaParse
    loadCSV(path) {
        return new Promise((resolve, reject) => {
            Papa.parse(path, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn(`CSV parsing warnings for ${path}:`, results.errors);
                    }
                    resolve(results.data);
                },
                error: (error) => {
                    console.error(`Failed to load ${path}:`, error);
                    reject(error);
                }
            });
        });
    },

    // Process admissions data
    processAdmissionsData(data) {
        return data.map(student => ({
            ...student,
            student_id: String(student.Student_ID),
            gender: student['Gender '] ? student['Gender '].trim() : 'Unknown',
            nationality: student.Nationality,
            age: this.calculateAge(student['Date of Birth']),
            entry_year: this.extractYear(student['Academic Year ']),
            entry_semester: student['Entry Semester '],
            status: this.mapStudentStatus(student['Student Status']),
            school: this.getSchoolFromDegree(student['Course/Degree']),
            programme: student['Course/Degree'],
            level: parseInt(student['Level offered']) || 1,
            is_disabled: student['Disability / Health Issues'] !== '00 No known disability',
            disability: student['Disability / Health Issues'],
            english_proficiency: this.getEnglishProficiency(student.IELTS),
            ielts_score: student.IELTS,
            education_system: student['Recent Education System'],
            marital_status: student['Marital Status'],
            sponsored: student['Sponsored Students (Yes / No)'] === 'Yes',
            entry_level: parseInt(student['Preferred Entry Level']) || 1
        }));
    },

    // Process current students data
    processCurrentStudentsData(data) {
        return data.map(student => ({
            ...student,
            student_id: String(student.Student_ID),
            academic_year: student.Academic_Year,
            current_level: parseInt(student.Current_Level),
            cgpa: parseFloat(student.CGPA) || 0,
            credits_completed: parseInt(student.Credits_Completed) || 0
        }));
    },

    // Process enrollments data  
    processEnrollmentsData(data) {
        return data.map(enrollment => ({
            ...enrollment,
            student_id: String(enrollment.Student_ID),
            academic_year: String(enrollment.Academic_Year),
            course_code: String(enrollment.Course_Code),
            credits: parseInt(enrollment.Credits),
            semester: String(enrollment.Semester)
        }));
    },

    // Process course reports/grades data
    processCourseReportsData(data) {
        return data.map(record => ({
            ...record,
            student_id: String(record.Student_ID),
            course_code: String(record.Course_Code),
            academic_year: String(record.Academic_Year),
            semester: String(record.Semester),
            course_grade_point: parseFloat(record.Course_Grade_Point),
            overall_grade: String(record.Overall_Grade),
            is_passed: this.isPassingGrade(record.Overall_Grade)
        }));
    },

    // Check if grade is passing
    isPassingGrade(grade) {
        const passingGrades = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];
        return passingGrades.includes(grade);
    },

    // Process attendance data
    processAttendanceData(data) {
        return data.map(record => ({
            ...record,
            student_id: String(record.Student_ID),
            academic_year: String(record.Academic_Year),
            course_code: String(record.Course_Code),
            semester: String(record.Semester),
            total_sessions: parseInt(record.Total_Sessions),
            sessions_attended: parseInt(record.Sessions_Attended),
            attendance_percentage: parseFloat(record.Attendance_Percentage),
            attendance_status: record.Attendance_Status
        }));
    },

    // Process degree classifications data
    processClassificationsData(data) {
        return data.map(record => ({
            ...record,
            student_id: String(record.Student_ID),
            programme: record.Programme,
            classification: record.Classification,
            average_grade_point: parseFloat(record.Average_Grade_Point),
            graduation_year: record.Graduation_Year
        }));
    },

    // Helper: Calculate age from date of birth
    calculateAge(dob) {
        if (!dob) return 20;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    // Helper: Extract year from academic year string
    extractYear(academicYear) {
        if (!academicYear) return 2017;
        const match = academicYear.match(/(\d{4})/);
        return match ? parseInt(match[1]) : 2017;
    },

    // Helper: Map student status
    mapStudentStatus(status) {
        if (!status) return 'Active';
        if (status.includes('Graduated')) return 'Graduated';
        if (status.includes('Dropped')) return 'Dropped';
        if (status.includes('Suspended')) return 'Suspended';
        return 'Active';
    },

    // Helper: Get school from degree name
    getSchoolFromDegree(degree) {
        if (!degree) return 'Unknown';
        const degreeUpper = degree.toUpperCase();
        if (degreeUpper.includes('ACCOUNT') || degreeUpper.includes('FINANCE') || 
            degreeUpper.includes('BUSINESS') || degreeUpper.includes('ECONOM')) {
            return 'Business';
        }
        if (degreeUpper.includes('LAW') || degreeUpper.includes('LEGAL')) {
            return 'Legal Studies';
        }
        if (degreeUpper.includes('PSYCHOLOG') || degreeUpper.includes('SOCIOLOG') || 
            degreeUpper.includes('INTERNATIONAL')) {
            return 'Social Science';
        }
        if (degreeUpper.includes('COMPUT') || degreeUpper.includes('INFORMATION') || 
            degreeUpper.includes('DATA')) {
            return 'Natural & Computing Sciences';
        }
        return 'Other';
    },

    // Helper: Get English proficiency from IELTS
    getEnglishProficiency(ielts) {
        if (!ielts) return 'Not Specified';
        const score = parseFloat(ielts);
        if (isNaN(score)) return 'Not Specified';
        if (score >= 7.5) return 'Advanced';
        if (score >= 6.5) return 'Proficient';
        if (score >= 5.5) return 'Intermediate';
        return 'Beginner';
    },

    // Get unique values for filters
    getUniqueValues(field, dataset = 'students') {
        const data = this[dataset];
        const values = [...new Set(data.map(item => item[field]))].filter(v => v != null && v !== '');
        return values.sort();
    },

    // Apply filters to all datasets
    applyFilters(filters) {
        let filteredStudents = [...this.students];

        // Filter by academic year
        if (filters.year && !filters.year.includes('all')) {
            const studentIdsInYear = new Set(
                this.currentStudents
                    .filter(s => filters.year.includes(s.academic_year))
                    .map(s => s.student_id)
            );
            filteredStudents = filteredStudents.filter(s => studentIdsInYear.has(s.student_id));
        }

        // Filter by school
        if (filters.school && !filters.school.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.school.includes(s.school));
        }

        // Filter by programme
        if (filters.programme && !filters.programme.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.programme.includes(s.programme));
        }

        // Filter by gender
        if (filters.gender && !filters.gender.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.gender.includes(s.gender));
        }

        // Filter by nationality
        if (filters.nationality && !filters.nationality.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.nationality.includes(s.nationality));
        }

        // Filter related datasets
        const studentIds = new Set(filteredStudents.map(s => s.student_id));
        
        this.filteredData = {
            students: filteredStudents,
            currentStudents: this.currentStudents.filter(s => studentIds.has(s.student_id)),
            enrollments: this.enrollments.filter(e => studentIds.has(e.student_id)),
            grades: this.grades.filter(g => studentIds.has(g.student_id)),
            attendance: this.attendance.filter(a => studentIds.has(a.student_id)),
            classifications: this.classifications.filter(c => studentIds.has(c.student_id))
        };

        return this.filteredData;
    },

    // Get current data (filtered or all)
    getData() {
        return this.filteredData || {
            students: this.students,
            currentStudents: this.currentStudents,
            enrollments: this.enrollments,
            grades: this.grades,
            attendance: this.attendance,
            classifications: this.classifications
        };
    },

    // Calculate student GPA from current students data
    calculateStudentGPA(studentId) {
        const studentRecord = this.currentStudents.find(s => s.student_id === studentId);
        return studentRecord ? studentRecord.cgpa : 0;
    },

    // Calculate completion rate
    calculateCompletionRate() {
        const data = this.getData();
        const eligibleStudents = data.students.filter(s => {
            const yearsSinceEntry = 2025 - s.entry_year;
            return yearsSinceEntry >= 4;
        });

        if (eligibleStudents.length === 0) return 0;

        const completedStudents = data.classifications.length;
        return ((completedStudents / eligibleStudents.length) * 100).toFixed(1);
    },

    // Export filtered data
    exportToCSV() {
        const data = this.getData();
        const csv = Papa.unparse(data.students);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `filtered_students_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
