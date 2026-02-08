// Data Loader Module
const DataLoader = {
    students: [],
    enrollments: [],
    grades: [],
    filteredData: null,
    
    // Configuration for CSV file paths (adjust based on your repository structure)
    csvPaths: {
        students: 'data/students.csv',
        enrollments: 'data/enrollments.csv',
        grades: 'data/grades.csv'
    },

    // Load all CSV files
    async loadAllData() {
        try {
            console.log('Starting data load...');
            
            const [studentsData, enrollmentsData, gradesData] = await Promise.all([
                this.loadCSV(this.csvPaths.students),
                this.loadCSV(this.csvPaths.enrollments),
                this.loadCSV(this.csvPaths.grades)
            ]);

            this.students = this.processStudentsData(studentsData);
            this.enrollments = this.processEnrollmentsData(enrollmentsData);
            this.grades = this.processGradesData(gradesData);

            console.log(`Loaded ${this.students.length} students`);
            console.log(`Loaded ${this.enrollments.length} enrollments`);
            console.log(`Loaded ${this.grades.length} grades`);

            // Initialize filtered data with all data
            this.filteredData = {
                students: this.students,
                enrollments: this.enrollments,
                grades: this.grades
            };

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
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    },

    // Process students data
    processStudentsData(data) {
        return data.map(student => ({
            ...student,
            student_id: String(student.student_id),
            entry_year: parseInt(student.entry_year),
            age: parseInt(student.age),
            is_disabled: Boolean(student.is_disabled || student.disability === 'Yes'),
            // Add calculated fields
            expected_graduation_year: parseInt(student.entry_year) + 4
        }));
    },

    // Process enrollments data
    processEnrollmentsData(data) {
        return data.map(enrollment => ({
            ...enrollment,
            student_id: String(enrollment.student_id),
            academic_year: String(enrollment.academic_year),
            year_of_study: parseInt(enrollment.year_of_study)
        }));
    },

    // Process grades data with CGS conversion
    processGradesData(data) {
        return data.map(grade => ({
            ...grade,
            student_id: String(grade.student_id),
            numeric_grade: parseFloat(grade.numeric_grade || grade.grade),
            cgs_grade: grade.cgs_grade || this.convertToCGS(grade.numeric_grade || grade.grade),
            is_passed: this.isPassingGrade(grade.cgs_grade || this.convertToCGS(grade.numeric_grade || grade.grade))
        }));
    },

    // Convert numeric grade to CGS grade
    convertToCGS(numericGrade) {
        const grade = parseFloat(numericGrade);
        if (grade >= 18) return 'A1';
        if (grade >= 16) return 'A2';
        if (grade >= 14) return 'A3';
        if (grade >= 12) return 'B1';
        if (grade >= 10) return 'B2';
        if (grade >= 8) return 'B3';
        if (grade >= 6) return 'C1';
        if (grade >= 4) return 'C2';
        if (grade >= 2) return 'C3';
        if (grade >= 1) return 'D1';
        if (grade >= 0) return 'D2';
        return 'F';
    },

    // Check if grade is passing
    isPassingGrade(cgsGrade) {
        const passingGrades = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2'];
        return passingGrades.includes(cgsGrade);
    },

    // Calculate GPA from CGS grade
    calculateGPA(cgsGrade) {
        const gradePoints = {
            'A1': 4.0, 'A2': 3.7, 'A3': 3.3,
            'B1': 3.0, 'B2': 2.7, 'B3': 2.3,
            'C1': 2.0, 'C2': 1.7, 'C3': 1.3,
            'D1': 1.0, 'D2': 0.7, 'F': 0.0
        };
        return gradePoints[cgsGrade] || 0.0;
    },

    // Get unique values for filter dropdowns
    getUniqueValues(field, dataset = 'students') {
        const data = this[dataset];
        const values = [...new Set(data.map(item => item[field]))].filter(v => v != null);
        return values.sort();
    },

    // Apply filters to data
    applyFilters(filters) {
        let filteredStudents = [...this.students];
        let filteredEnrollments = [...this.enrollments];
        let filteredGrades = [...this.grades];

        // Filter students
        if (filters.year && !filters.year.includes('all')) {
            const studentIds = new Set(
                this.enrollments
                    .filter(e => filters.year.includes(e.academic_year))
                    .map(e => e.student_id)
            );
            filteredStudents = filteredStudents.filter(s => studentIds.has(s.student_id));
        }

        if (filters.school && !filters.school.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.school.includes(s.school));
        }

        if (filters.programme && !filters.programme.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.programme.includes(s.programme));
        }

        if (filters.gender && !filters.gender.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.gender.includes(s.gender));
        }

        if (filters.nationality && !filters.nationality.includes('all')) {
            filteredStudents = filteredStudents.filter(s => filters.nationality.includes(s.nationality));
        }

        // Filter enrollments and grades based on filtered students
        const studentIds = new Set(filteredStudents.map(s => s.student_id));
        filteredEnrollments = filteredEnrollments.filter(e => studentIds.has(e.student_id));
        filteredGrades = filteredGrades.filter(g => studentIds.has(g.student_id));

        this.filteredData = {
            students: filteredStudents,
            enrollments: filteredEnrollments,
            grades: filteredGrades
        };

        return this.filteredData;
    },

    // Get current filtered data
    getData() {
        return this.filteredData || {
            students: this.students,
            enrollments: this.enrollments,
            grades: this.grades
        };
    },

    // Calculate student GPA
    calculateStudentGPA(studentId) {
        const studentGrades = this.grades.filter(g => g.student_id === studentId);
        if (studentGrades.length === 0) return 0;

        const totalGPA = studentGrades.reduce((sum, grade) => {
            return sum + this.calculateGPA(grade.cgs_grade);
        }, 0);

        return (totalGPA / studentGrades.length).toFixed(2);
    },

    // Calculate completion rate
    calculateCompletionRate() {
        const data = this.getData();
        const eligibleStudents = data.students.filter(s => {
            const yearsSinceEntry = 2025 - parseInt(s.entry_year);
            return yearsSinceEntry >= 4; // Should have graduated by now
        });

        if (eligibleStudents.length === 0) return 0;

        const completedStudents = eligibleStudents.filter(s => s.status === 'Graduated').length;
        return ((completedStudents / eligibleStudents.length) * 100).toFixed(1);
    },

    // Calculate retention rate
    calculateRetentionRate(year) {
        const yearEnrollments = this.enrollments.filter(e => e.academic_year === year);
        const nextYearEnrollments = this.enrollments.filter(e => e.academic_year === String(parseInt(year) + 1));

        const year1Students = new Set(yearEnrollments.filter(e => e.year_of_study === 1).map(e => e.student_id));
        const year2Students = new Set(nextYearEnrollments.filter(e => e.year_of_study === 2).map(e => e.student_id));

        const retained = [...year1Students].filter(id => year2Students.has(id)).length;
        return year1Students.size > 0 ? ((retained / year1Students.size) * 100).toFixed(1) : 0;
    },

    // Export filtered data to CSV
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
