// Data Loader — loads and processes all CSV files
const DataLoader = {
    // Raw processed arrays
    students: [],
    allApplicants: [],  // ALL applicants including Rejected & Not Interested (for management overview)
    currentStudents: [],
    enrollments: [],
    courseResults: [],
    attendance: [],
    classifications: [],

    // Index Maps for O(1) lookups
    studentIndex: new Map(),        // student_id → admissions record (excludes rejected)
    allApplicantIndex: new Map(),   // student_id → applicant record (includes all)
    classificationIndex: new Map(), // student_id → classification record
    currentStudentIndex: new Map(), // student_id → [currentStudent records]

    // Load all CSV files with progress callback
    async loadAllData(onProgress) {
        const files = [
            { key: 'admissions',      path: CONFIG.csvPaths.admissions },
            { key: 'currentStudents', path: CONFIG.csvPaths.currentStudents },
            { key: 'enrollments',     path: CONFIG.csvPaths.enrollments },
            { key: 'courseResults',    path: CONFIG.csvPaths.courseResults },
            { key: 'attendance',      path: CONFIG.csvPaths.attendance },
            { key: 'classifications', path: CONFIG.csvPaths.classifications }
        ];

        const rawData = {};
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (onProgress) onProgress(i + 1, files.length, f.key);
            rawData[f.key] = await this.loadCSV(f.path);
        }

        this.allApplicants   = this.processAdmissionsData(rawData.admissions, false);
        this.students        = this.processAdmissionsData(rawData.admissions, true);
        this.currentStudents = this.processCurrentStudentsData(rawData.currentStudents);
        this.enrollments     = this.processEnrollmentsData(rawData.enrollments);
        this.courseResults    = this.processCourseResultsData(rawData.courseResults);
        this.attendance      = this.processAttendanceData(rawData.attendance);
        this.classifications = this.processClassificationsData(rawData.classifications);

        // Build indexes
        this.buildIndexes();

        console.log(`Loaded: ${this.allApplicants.length} total applicants, ${this.students.length} admitted students, ${this.currentStudents.length} current students, ${this.enrollments.length} enrollments, ${this.courseResults.length} course results, ${this.attendance.length} attendance, ${this.classifications.length} classifications`);
        return true;
    },

    // PapaParse CSV loader
    loadCSV(path) {
        return new Promise((resolve, reject) => {
            Papa.parse(path, {
                download: true,
                header: true,
                dynamicTyping: false, // we parse manually for safety
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn(`CSV warnings for ${path}:`, results.errors.slice(0, 3));
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

    // PapaParse file loader (for user-uploaded files)
    loadCSVFromFile(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: false,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn(`CSV warnings for ${file.name}:`, results.errors.slice(0, 3));
                    }
                    resolve(results.data);
                },
                error: (error) => {
                    console.error(`Failed to parse ${file.name}:`, error);
                    reject(error);
                }
            });
        });
    },

    // Validate that required columns exist in parsed CSV data
    validateSchema(data, schemaKey) {
        if (!data || data.length === 0) return { valid: false, missing: ['(empty file)'] };
        const required = CONFIG.csvSchemas[schemaKey];
        if (!required) return { valid: true, missing: [] };
        const headers = Object.keys(data[0]).map(h => h.trim());
        const missing = required.filter(col => !headers.includes(col.trim()));
        return { valid: missing.length === 0, missing };
    },

    // Load all data from user-uploaded file objects
    async loadAllDataFromFiles(fileMap, onProgress) {
        const keys = ['admissions', 'currentStudents', 'enrollments', 'courseResults', 'attendance', 'classifications'];
        const rawData = {};

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (onProgress) onProgress(i + 1, keys.length, key);
            rawData[key] = await this.loadCSVFromFile(fileMap[key]);

            // Validate schema
            const result = this.validateSchema(rawData[key], key);
            if (!result.valid) {
                throw new Error(`${fileMap[key].name}: missing required columns — ${result.missing.join(', ')}`);
            }
        }

        this.allApplicants   = this.processAdmissionsData(rawData.admissions, false);
        this.students        = this.processAdmissionsData(rawData.admissions, true);
        this.currentStudents = this.processCurrentStudentsData(rawData.currentStudents);
        this.enrollments     = this.processEnrollmentsData(rawData.enrollments);
        this.courseResults    = this.processCourseResultsData(rawData.courseResults);
        this.attendance      = this.processAttendanceData(rawData.attendance);
        this.classifications = this.processClassificationsData(rawData.classifications);

        this.buildIndexes();

        console.log(`Imported: ${this.allApplicants.length} total applicants, ${this.students.length} admitted students, ${this.currentStudents.length} current students, ${this.enrollments.length} enrollments, ${this.courseResults.length} course results, ${this.attendance.length} attendance, ${this.classifications.length} classifications`);
        return true;
    },

    // Build index Maps for O(1) lookups
    buildIndexes() {
        this.studentIndex.clear();
        this.allApplicantIndex.clear();
        this.classificationIndex.clear();
        this.currentStudentIndex.clear();

        for (const s of this.students) {
            this.studentIndex.set(s.student_id, s);
        }
        for (const a of this.allApplicants) {
            this.allApplicantIndex.set(a.student_id, a);
        }
        for (const c of this.classifications) {
            this.classificationIndex.set(c.student_id, c);
        }
        for (const cs of this.currentStudents) {
            if (!this.currentStudentIndex.has(cs.student_id)) {
                this.currentStudentIndex.set(cs.student_id, []);
            }
            this.currentStudentIndex.get(cs.student_id).push(cs);
        }
    },

    // --- Processors ---

    processAdmissionsData(data, excludeRejected = true) {
        const results = [];
        for (const row of data) {
            const status = (row['Student Status'] || '').trim();
            // When excludeRejected is true, skip rejected/not-interested (for academic analysis)
            if (excludeRejected && CONFIG.excludedStatuses.includes(status)) continue;

            const gender = (row['Gender '] || row['Gender'] || '').trim() || 'Unknown';
            const programme = (row['Course/Degree'] || '').trim();
            const dob = (row['Date of Birth'] || '').trim();
            const ielts = row['IELTS'];

            // Referral source cleanup
            const rawReferral = (row['How did you hear about us ?'] || row['How did you hear about us?'] || '').trim();
            const referral_source = (rawReferral && !CONFIG.referralJunkValues.includes(rawReferral))
                ? rawReferral : null;

            // Offer type
            const offerType = (row['Conditional/ Unconditional '] || row['Conditional/ Unconditional'] || '').trim();

            results.push({
                student_id: String(row['Student_ID'] || '').trim(),
                first_name: (row['First Name'] || '').trim(),
                last_name: (row['Last Name'] || '').trim(),
                gender: gender,
                nationality: (row['Nationality'] || '').trim(),
                age: this.calculateAge(dob),
                entry_year: this.extractAcademicYear(row['Academic Year '] || row['Academic Year']),
                entry_semester: (row['Entry Semester '] || row['Entry Semester'] || '').trim(),
                status: this.mapStudentStatus(status),
                raw_status: status,
                school: CONFIG.getSchool(programme),
                programme: programme,
                level: parseInt(row['Level offered']) || 1,
                entry_level: parseInt(row['Preferred Entry Level']) || 1,
                is_disabled: (row['Disability / Health Issues'] || '') !== '00 No known disability',
                disability: (row['Disability / Health Issues'] || '').trim(),
                english_proficiency: CONFIG.getProficiency(ielts),
                ielts_score: ielts ? parseFloat(ielts) : null,
                education_system: (row['Recent Education System'] || '').trim(),
                marital_status: (row['Marital Status'] || '').trim(),
                sponsored: (row['Sponsored Students (Yes / No)'] || '').trim() === 'Yes',
                degree_type: (row['Degree Type'] || '').trim(),
                referral_source: referral_source,
                offer_type: offerType || null
            });
        }
        return results;
    },

    processCurrentStudentsData(data) {
        return data.map(row => {
            const academicYear = (row['Academic_Year'] || '').trim();
            return {
                student_id: String(row['Student_ID'] || '').trim(),
                academic_year: academicYear,
                surname: (row['Surname'] || '').trim(),
                forename: (row['Forename'] || '').trim(),
                gender: (row['Gender'] || '').trim(),
                date_of_birth: (row['Date_of_Birth'] || '').trim(),
                nationality: (row['Nationality'] || '').trim(),
                prog_yr: parseInt(row['Prog_Yr']) || 0,
                stud_yr: parseInt(row['Stud_Yr']) || 0,
                category: (row['Category'] || '').trim(),
                programme: (row['Programme_Name'] || '').trim(),
                school: CONFIG.getSchool((row['Programme_Name'] || '').trim())
            };
        });
    },

    processEnrollmentsData(data) {
        return data.map(row => ({
            student_id: String(row['Student_ID'] || '').trim(),
            academic_year: (row['Academic_Year'] || '').trim(),
            course_code: (row['Course_Code'] || '').trim(),
            credits: parseInt(row['Credits']) || 0,
            semester: (row['Semester'] || '').trim()
        }));
    },

    processCourseResultsData(data) {
        return data.map(row => {
            const grade = (row['Overall_Grade'] || '').trim();
            return {
                student_id: String(row['Student_ID'] || '').trim(),
                academic_year: (row['Academic_Year'] || '').trim(),
                semester: (row['Semester'] || '').trim(),
                course_code: (row['Course_Code'] || '').trim(),
                course_grade_point: parseFloat(row['Course_Grade_Point']) || 0,
                overall_grade: grade,
                warning: (row['Warning'] || '').trim(),
                is_passed: CONFIG.isPass(grade)
            };
        });
    },

    processAttendanceData(data) {
        return data.map(row => ({
            student_id: String(row['Student_ID'] || '').trim(),
            academic_year: (row['Academic_Year'] || '').trim(),
            semester: (row['Semester'] || '').trim(),
            course_code: (row['Course_Code'] || '').trim(),
            total_sessions: parseInt(row['Total_Sessions']) || 0,
            sessions_attended: parseInt(row['Sessions_Attended']) || 0,
            attendance_percentage: parseFloat(row['Attendance_Percentage']) || 0,
            attendance_status: (row['Attendance_Status'] || '').trim()
        }));
    },

    processClassificationsData(data) {
        return data.map(row => ({
            student_id: String(row['Student_ID'] || '').trim(),
            programme: (row['Programme'] || '').trim(),
            entry_level: parseInt(row['Entry_Level']) || 1,
            entry_year: (row['Entry_Year'] || '').trim(),
            total_credits: parseInt(row['Total_Credits']) || 0,
            year_3_gpa: parseFloat(row['Year_3_GPA']) || 0,
            year_4_gpa: parseFloat(row['Year_4_GPA']) || 0,
            final_gpa: parseFloat(row['Final_GPA']) || 0,
            classification: (row['Degree_Classification'] || '').trim(),
            graduation_date: (row['Graduation_Date'] || '').trim(),
            graduation_status: (row['Graduation_Status'] || '').trim(),
            school: CONFIG.getSchool((row['Programme'] || '').trim())
        }));
    },

    // --- Helpers ---

    calculateAge(dob) {
        if (!dob) return null;
        // Try multiple date formats
        let birthDate;
        if (dob.includes('/')) {
            // DD/MM/YYYY
            const parts = dob.split('/');
            if (parts.length === 3) {
                birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
            }
        } else {
            birthDate = new Date(dob);
        }
        if (!birthDate || isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    },

    extractAcademicYear(str) {
        if (!str) return '';
        return str.trim();
    },

    mapStudentStatus(status) {
        if (!status) return 'Active';
        if (status.includes('Graduated')) return 'Graduated';
        if (status.includes('Dropped')) return 'Dropped';
        if (status.includes('Suspended')) return 'Suspended';
        if (status === 'Attending') return 'Active';
        if (status === 'Rejected') return 'Rejected';
        if (status === 'Not Interested') return 'Not Interested';
        return 'Active';
    }
};
