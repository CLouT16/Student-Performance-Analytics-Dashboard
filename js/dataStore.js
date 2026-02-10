// DataStore — filtering, querying, and metric calculations
const DataStore = {
    // Current filtered datasets
    filtered: null,

    // Initialize — set filtered to all data
    initialize() {
        this.resetFilters();
    },

    // Reset filters — show all data
    resetFilters() {
        this.filtered = {
            students: DataLoader.students,
            currentStudents: DataLoader.currentStudents,
            enrollments: DataLoader.enrollments,
            courseResults: DataLoader.courseResults,
            attendance: DataLoader.attendance,
            classifications: DataLoader.classifications
        };
    },

    // Apply filters object { year, school, programme, gender, nationality, attendanceStatus, classification, entryLevel, gpaMin, gpaMax, search }
    applyFilters(filters) {
        let students = [...DataLoader.students];

        // Text search (name or ID)
        if (filters.search) {
            const q = filters.search.toLowerCase();
            students = students.filter(s =>
                s.student_id.toLowerCase().includes(q) ||
                s.first_name.toLowerCase().includes(q) ||
                s.last_name.toLowerCase().includes(q) ||
                (s.first_name + ' ' + s.last_name).toLowerCase().includes(q)
            );
        }

        // Academic year filter — cross-reference with currentStudents
        if (filters.year) {
            const idsInYear = new Set();
            for (const cs of DataLoader.currentStudents) {
                if (cs.academic_year === filters.year) {
                    idsInYear.add(cs.student_id);
                }
            }
            students = students.filter(s => idsInYear.has(s.student_id));
        }

        // School
        if (filters.school) {
            students = students.filter(s => s.school === filters.school);
        }

        // Programme
        if (filters.programme) {
            students = students.filter(s => s.programme === filters.programme);
        }

        // Gender
        if (filters.gender) {
            students = students.filter(s => s.gender === filters.gender);
        }

        // Nationality
        if (filters.nationality) {
            students = students.filter(s => s.nationality === filters.nationality);
        }

        // Entry Level
        if (filters.entryLevel) {
            const lvl = parseInt(filters.entryLevel);
            students = students.filter(s => s.entry_level === lvl);
        }

        // Degree Classification — cross-reference with classifications
        if (filters.classification) {
            const idsWithClassification = new Set();
            for (const c of DataLoader.classifications) {
                if (c.classification === filters.classification) {
                    idsWithClassification.add(c.student_id);
                }
            }
            students = students.filter(s => idsWithClassification.has(s.student_id));
        }

        // GPA range — cross-reference with classifications
        if (filters.gpaMin != null || filters.gpaMax != null) {
            const min = filters.gpaMin != null ? parseFloat(filters.gpaMin) : 0;
            const max = filters.gpaMax != null ? parseFloat(filters.gpaMax) : 22;
            const idsInRange = new Set();
            for (const c of DataLoader.classifications) {
                if (c.final_gpa >= min && c.final_gpa <= max) {
                    idsInRange.add(c.student_id);
                }
            }
            students = students.filter(s => idsInRange.has(s.student_id));
        }

        // Attendance Status — cross-reference with attendance
        if (filters.attendanceStatus) {
            const idsWithStatus = new Set();
            for (const a of DataLoader.attendance) {
                if (a.attendance_status === filters.attendanceStatus) {
                    idsWithStatus.add(a.student_id);
                }
            }
            students = students.filter(s => idsWithStatus.has(s.student_id));
        }

        // Build filtered ID set and filter related datasets
        const studentIds = new Set(students.map(s => s.student_id));

        this.filtered = {
            students,
            currentStudents: DataLoader.currentStudents.filter(s => studentIds.has(s.student_id)),
            enrollments: DataLoader.enrollments.filter(e => studentIds.has(e.student_id)),
            courseResults: DataLoader.courseResults.filter(g => studentIds.has(g.student_id)),
            attendance: DataLoader.attendance.filter(a => studentIds.has(a.student_id)),
            classifications: DataLoader.classifications.filter(c => studentIds.has(c.student_id))
        };

        return this.filtered;
    },

    // Get current (filtered) data
    getData() {
        return this.filtered;
    },

    // --- Dynamic value getters for filter dropdowns ---

    getAcademicYears() {
        const years = new Set();
        for (const cs of DataLoader.currentStudents) {
            if (cs.academic_year) years.add(cs.academic_year);
        }
        return [...years].sort();
    },

    getSchools() {
        const schools = new Set();
        for (const s of DataLoader.students) {
            if (s.school) schools.add(s.school);
        }
        return [...schools].sort();
    },

    getProgrammes(school) {
        const programmes = new Set();
        for (const s of DataLoader.students) {
            if (school && s.school !== school) continue;
            if (s.programme) programmes.add(s.programme);
        }
        return [...programmes].sort();
    },

    getGenders() {
        const genders = new Set();
        for (const s of DataLoader.students) {
            if (s.gender) genders.add(s.gender);
        }
        return [...genders].sort();
    },

    getNationalities() {
        const nats = new Set();
        for (const s of DataLoader.students) {
            if (s.nationality) nats.add(s.nationality);
        }
        return [...nats].sort();
    },

    getAttendanceStatuses() {
        const statuses = new Set();
        for (const a of DataLoader.attendance) {
            if (a.attendance_status) statuses.add(a.attendance_status);
        }
        return [...statuses].sort();
    },

    getClassifications() {
        return CONFIG.classificationOrder.filter(c => {
            return DataLoader.classifications.some(cl => cl.classification === c);
        });
    },

    getEntryLevels() {
        const levels = new Set();
        for (const s of DataLoader.students) {
            if (s.entry_level) levels.add(s.entry_level);
        }
        return [...levels].sort((a, b) => a - b);
    },

    // --- Metric calculations ---

    calculateAverageGPA() {
        const data = this.getData();
        const grads = data.classifications.filter(c => c.final_gpa > 0);
        if (grads.length === 0) return 0;
        const total = grads.reduce((sum, c) => sum + c.final_gpa, 0);
        return (total / grads.length).toFixed(1);
    },

    calculateAverageAttendance() {
        const data = this.getData();
        if (data.attendance.length === 0) return 0;
        const total = data.attendance.reduce((sum, a) => sum + a.attendance_percentage, 0);
        return (total / data.attendance.length).toFixed(1);
    },

    calculatePassRate() {
        const data = this.getData();
        if (data.courseResults.length === 0) return 0;
        const passed = data.courseResults.filter(g => g.is_passed).length;
        return ((passed / data.courseResults.length) * 100).toFixed(1);
    },

    // Retention: % of Year-N students in academic year Y who appear as Year-(N+1) in year Y+1
    // fromYear: programme year to track (1=Yr1→2, 2=Yr2→3, 3=Yr3→4). Default 1.
    calculateRetentionRate(academicYear, fromYear) {
        const progYr = fromYear || 1;
        const allYears = this.getAcademicYears();
        const yearIdx = allYears.indexOf(academicYear);
        if (yearIdx < 0 || yearIdx >= allYears.length - 1) return 0;
        const nextYear = allYears[yearIdx + 1];

        const data = this.getData();

        // Students in prog_yr N in the given year
        const sourceStudents = new Set();
        for (const cs of data.currentStudents) {
            if (cs.academic_year === academicYear && cs.prog_yr === progYr) {
                sourceStudents.add(cs.student_id);
            }
        }
        if (sourceStudents.size === 0) return 0;

        // Count how many appear in the next year with prog_yr >= N+1
        let retained = 0;
        for (const cs of data.currentStudents) {
            if (cs.academic_year === nextYear && cs.prog_yr >= (progYr + 1) && sourceStudents.has(cs.student_id)) {
                retained++;
            }
        }
        return ((retained / sourceStudents.size) * 100).toFixed(1);
    },

    // Attrition rate by academic year — % of students who dropped out per entry cohort year
    calculateAttritionRateByYear(academicYear) {
        const data = this.getData();
        // Students whose entry_year matches
        let total = 0, dropped = 0;
        for (const s of data.students) {
            if (s.entry_year !== academicYear) continue;
            total++;
            if (s.status === 'Dropped') dropped++;
        }
        if (total === 0) return 0;
        return ((dropped / total) * 100).toFixed(1);
    },

    // Completion rate — students who entered >= 4 years ago and graduated
    calculateCompletionRate() {
        const data = this.getData();
        const allYears = this.getAcademicYears();
        if (allYears.length < 4) return 0;

        // Get the latest year for reference
        const latestYear = allYears[allYears.length - 1];
        const latestStartYear = parseInt(latestYear.split('/')[0]);

        // Eligible: entered 4+ years before the latest year
        const eligible = data.students.filter(s => {
            const entryStartYear = parseInt((s.entry_year || '').split('/')[0]);
            if (isNaN(entryStartYear)) return false;
            return (latestStartYear - entryStartYear) >= 4;
        });

        if (eligible.length === 0) return 0;

        const eligibleIds = new Set(eligible.map(s => s.student_id));
        const completed = data.classifications.filter(c => eligibleIds.has(c.student_id)).length;
        return ((completed / eligible.length) * 100).toFixed(1);
    },

    // Enrollment by year — unique students per year from currentStudents
    getEnrollmentByYear() {
        const data = this.getData();
        const yearCounts = {};
        for (const cs of data.currentStudents) {
            if (!yearCounts[cs.academic_year]) {
                yearCounts[cs.academic_year] = new Set();
            }
            yearCounts[cs.academic_year].add(cs.student_id);
        }
        const result = {};
        for (const [year, ids] of Object.entries(yearCounts)) {
            result[year] = ids.size;
        }
        return result;
    },

    // Total applicants (all who applied, including rejected/not interested)
    getTotalApplicants() {
        return DataLoader.allApplicants.length;
    },

    // Unique registered students (distinct IDs from current_students)
    getUniqueRegisteredStudents() {
        const data = this.getData();
        const ids = new Set();
        for (const cs of data.currentStudents) {
            ids.add(cs.student_id);
        }
        return ids.size;
    },

    // New vs Returning students by academic year
    // New = first appearance in current_students; Returning = appeared in a prior year
    getNewVsReturningByYear() {
        const data = this.getData();
        const years = [...new Set(data.currentStudents.map(cs => cs.academic_year))].sort();

        // Build first-seen map
        const firstSeen = new Map();
        for (const yr of years) {
            for (const cs of data.currentStudents) {
                if (cs.academic_year === yr && !firstSeen.has(cs.student_id)) {
                    firstSeen.set(cs.student_id, yr);
                }
            }
        }

        return years.map(yr => {
            const studentsInYear = new Set();
            for (const cs of data.currentStudents) {
                if (cs.academic_year === yr) studentsInYear.add(cs.student_id);
            }
            let newCount = 0, returningCount = 0;
            for (const sid of studentsInYear) {
                if (firstSeen.get(sid) === yr) newCount++;
                else returningCount++;
            }
            return { year: yr, total: studentsInYear.size, new: newCount, returning: returningCount };
        });
    },

    // --- Management Overview Metrics (uses allApplicants — includes Rejected & Not Interested) ---

    // Get the working set of all applicants, respecting school/programme filters only
    _getManagementApplicants() {
        const data = this.getData();
        // If filters are active, limit allApplicants to matching school/programme
        const filteredIds = new Set(data.students.map(s => s.student_id));
        // Use allApplicants but match on school/programme of the filtered set
        const filteredSchools = new Set(data.students.map(s => s.school));
        const filteredProgrammes = new Set(data.students.map(s => s.programme));
        const hasSchoolFilter = data.students.length < DataLoader.students.length;

        if (!hasSchoolFilter) return DataLoader.allApplicants;

        return DataLoader.allApplicants.filter(a =>
            filteredSchools.has(a.school) && filteredProgrammes.has(a.programme)
        );
    },

    // Helper: merge referral source into broader category
    _mergeReferral(source) {
        return CONFIG.referralMerge[source] || source;
    },

    // Recruitment by source — count per referral source (from ALL applicants)
    getRecruitmentBySource() {
        const applicants = this._getManagementApplicants();
        const counts = {};
        for (const a of applicants) {
            if (!a.referral_source) continue;
            const merged = this._mergeReferral(a.referral_source);
            counts[merged] = (counts[merged] || 0) + 1;
        }
        // Sort by count descending
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => ({ source, count }));
    },

    // Recruitment effectiveness — per source: total applicants, registered (in current_students),
    // graduated, dropped, rejected, not interested
    getRecruitmentEffectiveness() {
        const applicants = this._getManagementApplicants();
        // Registered = appeared in current_students at any point
        const registeredIds = new Set();
        for (const cs of DataLoader.currentStudents) registeredIds.add(cs.student_id);
        // Graduated = has a classification record
        const classIds = new Set();
        for (const c of DataLoader.classifications) classIds.add(c.student_id);

        const stats = {};
        for (const a of applicants) {
            if (!a.referral_source) continue;
            const merged = this._mergeReferral(a.referral_source);
            if (!stats[merged]) {
                stats[merged] = { total: 0, registered: 0, graduated: 0, dropped: 0, rejected: 0, notInterested: 0 };
            }
            const s = stats[merged];
            s.total++;
            if (a.status === 'Rejected') { s.rejected++; }
            else if (a.status === 'Not Interested') { s.notInterested++; }
            else {
                // Check if they actually registered (appear in current_students)
                if (registeredIds.has(a.student_id)) s.registered++;
                if (classIds.has(a.student_id)) s.graduated++;
                else if (a.status === 'Dropped') s.dropped++;
            }
        }
        // Sort by total descending
        return Object.entries(stats)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([source, data]) => ({ source, ...data }));
    },

    // Offer conversion funnel — Applicants → Rejected/Not Interested → Offers → Registered (current_students) → Graduated
    getOfferFunnel() {
        const applicants = this._getManagementApplicants();
        // Registered = unique students who appeared in current_students
        const registeredIds = new Set();
        for (const cs of DataLoader.currentStudents) registeredIds.add(cs.student_id);
        // Graduated = has a classification record
        const classIds = new Set();
        for (const c of DataLoader.classifications) classIds.add(c.student_id);

        let total = 0, rejected = 0, notInterested = 0, conditional = 0, unconditional = 0,
            registered = 0, graduated = 0, dropped = 0;

        for (const a of applicants) {
            total++;
            if (a.status === 'Rejected') { rejected++; continue; }
            if (a.status === 'Not Interested') { notInterested++; continue; }
            if (a.offer_type === 'Conditional') conditional++;
            if (a.offer_type === 'Unconditional') unconditional++;
            if (registeredIds.has(a.student_id)) registered++;
            if (classIds.has(a.student_id)) graduated++;
            else if (a.status === 'Dropped') dropped++;
        }

        return {
            total,
            rejected,
            notInterested,
            offersGiven: conditional + unconditional,
            conditional,
            unconditional,
            registered,
            graduated,
            dropped
        };
    },

    // Degree classification by programme — counts per classification band per programme
    getClassificationByProgramme() {
        const data = this.getData();
        const bandMap = {
            'First Class Honours': 'First',
            'Borderline 2.1/1st': 'First',
            'Upper Second Class Honours': 'Upper Second',
            'Borderline 2.2/2.1': 'Upper Second',
            'Lower Second Class Honours': 'Lower Second',
            'Borderline 3rd/2.2': 'Lower Second',
            'Third Class Honours': 'Third',
            'Borderline Fail/3rd': 'Third',
            'Fail': 'Fail'
        };
        const bands = ['First', 'Upper Second', 'Lower Second', 'Third', 'Fail'];

        const progCounts = {};
        for (const c of data.classifications) {
            const band = bandMap[c.classification] || 'Other';
            if (!progCounts[c.programme]) {
                progCounts[c.programme] = {};
                bands.forEach(b => progCounts[c.programme][b] = 0);
            }
            progCounts[c.programme][band] = (progCounts[c.programme][band] || 0) + 1;
        }

        const programmes = Object.keys(progCounts).sort();
        return { programmes, bands, data: progCounts };
    },

    // Attendance risk overview — Good/Warning/Concern distribution
    getAttendanceRiskOverview() {
        const data = this.getData();
        const counts = {};
        // Use latest record per student to avoid double-counting
        const latestByStudent = new Map();
        for (const a of data.attendance) {
            const existing = latestByStudent.get(a.student_id);
            if (!existing || a.academic_year > existing.academic_year ||
                (a.academic_year === existing.academic_year && a.semester > existing.semester)) {
                latestByStudent.set(a.student_id, a);
            }
        }
        for (const [, a] of latestByStudent) {
            const status = a.attendance_status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        }
        return counts;
    },

    // Education system performance — avg GPA by education system
    getEducationSystemPerformance() {
        const data = this.getData();
        const classMap = new Map();
        for (const c of data.classifications) classMap.set(c.student_id, c);

        const systems = {};
        for (const s of data.students) {
            if (!s.education_system) continue;
            const cls = classMap.get(s.student_id);
            if (!cls || cls.final_gpa <= 0) continue;
            if (!systems[s.education_system]) systems[s.education_system] = { gpaSum: 0, count: 0 };
            systems[s.education_system].gpaSum += cls.final_gpa;
            systems[s.education_system].count++;
        }

        return Object.entries(systems)
            .filter(([, d]) => d.count >= 3) // minimum sample size
            .map(([system, d]) => ({
                system,
                avgGPA: parseFloat((d.gpaSum / d.count).toFixed(1)),
                count: d.count
            }))
            .sort((a, b) => b.avgGPA - a.avgGPA);
    },

    // Sankey data: Applicants → Rejected / Not Interested / Registered; Registered → Graduated / Dropped / Active
    getSankeyData() {
        const applicants = this._getManagementApplicants();
        const registeredIds = new Set();
        for (const cs of DataLoader.currentStudents) registeredIds.add(cs.student_id);
        const classIds = new Set();
        for (const c of DataLoader.classifications) classIds.add(c.student_id);

        let rejected = 0, notInterested = 0, registered = 0, graduated = 0, dropped = 0, active = 0;

        for (const a of applicants) {
            if (a.status === 'Rejected') { rejected++; continue; }
            if (a.status === 'Not Interested') { notInterested++; continue; }
            registered++;
            if (classIds.has(a.student_id)) { graduated++; }
            else if (a.status === 'Dropped') { dropped++; }
            else { active++; }
        }

        // Nodes: Applicants(0), Rejected(1), Not Interested(2), Registered(3), Graduated(4), Dropped(5), Active(6)
        return {
            nodes: ['Applicants', 'Rejected', 'Not Interested', 'Registered', 'Graduated', 'Dropped', 'Active'],
            links: {
                source: [0, 0, 0, 3, 3, 3],
                target: [1, 2, 3, 4, 5, 6],
                value: [rejected, notInterested, registered, graduated, dropped, active]
            }
        };
    },

    // Sunburst data: School → Programme → Classification hierarchy
    getSunburstData() {
        const data = this.getData();
        const ids = [];
        const labels = [];
        const parents = [];
        const values = [];

        // Build counts: school → programme → classification
        const tree = {};
        let grandTotal = 0;
        for (const c of data.classifications) {
            const student = DataLoader.studentIndex.get(c.student_id);
            if (!student) continue;
            const school = student.school || 'Unknown';
            const prog = student.programme || 'Unknown';
            const cls = c.classification || 'Unknown';

            if (!tree[school]) tree[school] = {};
            if (!tree[school][prog]) tree[school][prog] = {};
            tree[school][prog][cls] = (tree[school][prog][cls] || 0) + 1;
            grandTotal++;
        }

        if (grandTotal === 0) return { ids: [], labels: [], parents: [], values: [] };

        // Root
        ids.push('root');
        labels.push('All Graduates');
        parents.push('');
        values.push(grandTotal);

        for (const school of Object.keys(tree).sort()) {
            const schoolId = 'S_' + school;
            // Sum all classifications in this school
            let schoolTotal = 0;
            for (const prog of Object.keys(tree[school])) {
                for (const cls of Object.keys(tree[school][prog])) {
                    schoolTotal += tree[school][prog][cls];
                }
            }
            ids.push(schoolId);
            labels.push(school);
            parents.push('root');
            values.push(schoolTotal);

            for (const prog of Object.keys(tree[school]).sort()) {
                const progId = schoolId + '_P_' + prog;
                let progTotal = 0;
                for (const cls of Object.keys(tree[school][prog])) {
                    progTotal += tree[school][prog][cls];
                }
                ids.push(progId);
                labels.push(CONFIG.abbrevProgramme(prog));
                parents.push(schoolId);
                values.push(progTotal);

                for (const cls of Object.keys(tree[school][prog]).sort()) {
                    const clsId = progId + '_C_' + cls;
                    ids.push(clsId);
                    labels.push(cls);
                    parents.push(progId);
                    values.push(tree[school][prog][cls]);
                }
            }
        }

        return { ids, labels, parents, values };
    },

    // Programme Comparison: per programme Avg GPA, Pass Rate %, Completion Rate %, Avg Attendance %
    getProgrammeComparison() {
        const data = this.getData();
        const allYears = this.getAcademicYears();
        const latestStartYear = allYears.length >= 4 ? parseInt(allYears[allYears.length - 1].split('/')[0]) : null;

        const progStats = {};

        // Avg GPA from classifications
        for (const c of data.classifications) {
            if (!progStats[c.programme]) progStats[c.programme] = { gpaSum: 0, gpaCount: 0, passed: 0, totalResults: 0, eligible: 0, completed: 0, attSum: 0, attCount: 0 };
            progStats[c.programme].gpaSum += c.final_gpa;
            progStats[c.programme].gpaCount++;
        }

        // Pass rate from course results
        for (const g of data.courseResults) {
            const student = DataLoader.studentIndex.get(g.student_id);
            if (!student) continue;
            const prog = student.programme;
            if (!progStats[prog]) progStats[prog] = { gpaSum: 0, gpaCount: 0, passed: 0, totalResults: 0, eligible: 0, completed: 0, attSum: 0, attCount: 0 };
            progStats[prog].totalResults++;
            if (g.is_passed) progStats[prog].passed++;
        }

        // Completion rate
        if (latestStartYear) {
            for (const s of data.students) {
                const entryStartYear = parseInt((s.entry_year || '').split('/')[0]);
                if (isNaN(entryStartYear) || (latestStartYear - entryStartYear) < 4) continue;
                if (!progStats[s.programme]) progStats[s.programme] = { gpaSum: 0, gpaCount: 0, passed: 0, totalResults: 0, eligible: 0, completed: 0, attSum: 0, attCount: 0 };
                progStats[s.programme].eligible++;
            }
            for (const c of data.classifications) {
                if (progStats[c.programme] && progStats[c.programme].eligible > 0) {
                    progStats[c.programme].completed++;
                }
            }
        }

        // Avg attendance
        for (const a of data.attendance) {
            const student = DataLoader.studentIndex.get(a.student_id);
            if (!student) continue;
            const prog = student.programme;
            if (!progStats[prog]) continue;
            progStats[prog].attSum += a.attendance_percentage;
            progStats[prog].attCount++;
        }

        const programmes = Object.keys(progStats).sort();
        const avgGPA = programmes.map(p => progStats[p].gpaCount > 0 ? parseFloat((progStats[p].gpaSum / progStats[p].gpaCount).toFixed(1)) : 0);
        const passRate = programmes.map(p => progStats[p].totalResults > 0 ? parseFloat(((progStats[p].passed / progStats[p].totalResults) * 100).toFixed(1)) : 0);
        const completionRate = programmes.map(p => progStats[p].eligible > 0 ? parseFloat(((progStats[p].completed / progStats[p].eligible) * 100).toFixed(1)) : 0);
        const avgAttendance = programmes.map(p => progStats[p].attCount > 0 ? parseFloat((progStats[p].attSum / progStats[p].attCount).toFixed(1)) : 0);

        return { programmes, avgGPA, passRate, completionRate, avgAttendance };
    },

    // Retention rate per programme — aggregated across all academic years for a given transition
    // fromYear: 1, 2, 3, or 'all'
    getRetentionByProgramme(fromYear) {
        const progYr = fromYear || 'all';
        const data = this.getData();
        const allYears = this.getAcademicYears();
        const programmes = this.getProgrammes();

        // Build programme lookup
        const studentProg = new Map();
        for (const s of data.students) {
            studentProg.set(s.student_id, s.programme);
        }

        // For each programme, sum source & retained across all academic-year pairs
        const progStats = {};
        for (const p of programmes) progStats[p] = { source: 0, retained: 0 };

        const transitions = progYr === 'all' ? [1, 2, 3] : [progYr];

        for (let yi = 0; yi < allYears.length - 1; yi++) {
            const year = allYears[yi];
            const nextYear = allYears[yi + 1];

            for (const py of transitions) {
                // Source: students in prog_yr py in this academic year
                const sourceByProg = {};
                for (const cs of data.currentStudents) {
                    if (cs.academic_year === year && cs.prog_yr === py) {
                        const prog = studentProg.get(cs.student_id);
                        if (!prog || !progStats[prog]) continue;
                        if (!sourceByProg[prog]) sourceByProg[prog] = new Set();
                        sourceByProg[prog].add(cs.student_id);
                    }
                }

                // Retained: appear in next year with prog_yr >= py+1
                for (const cs of data.currentStudents) {
                    if (cs.academic_year === nextYear && cs.prog_yr >= (py + 1)) {
                        const prog = studentProg.get(cs.student_id);
                        if (prog && sourceByProg[prog] && sourceByProg[prog].has(cs.student_id)) {
                            progStats[prog].retained++;
                        }
                    }
                }

                // Add source counts
                for (const [prog, ids] of Object.entries(sourceByProg)) {
                    progStats[prog].source += ids.size;
                }
            }
        }

        const result = {};
        for (const p of programmes) {
            result[p] = progStats[p].source > 0
                ? parseFloat(((progStats[p].retained / progStats[p].source) * 100).toFixed(1))
                : 0;
        }
        return result;
    },

    // Pass/fail rate per course — identifies which courses cause failures
    getPassRateByCourse() {
        const data = this.getData();
        const courseStats = {};
        for (const g of data.courseResults) {
            if (!courseStats[g.course_code]) courseStats[g.course_code] = { passed: 0, failed: 0, total: 0 };
            courseStats[g.course_code].total++;
            if (g.is_passed) courseStats[g.course_code].passed++;
            else courseStats[g.course_code].failed++;
        }
        return Object.entries(courseStats)
            .map(([course, s]) => ({
                course,
                passed: s.passed,
                failed: s.failed,
                total: s.total,
                passRate: s.total > 0 ? parseFloat(((s.passed / s.total) * 100).toFixed(1)) : 0
            }))
            .sort((a, b) => a.passRate - b.passRate);
    },

    // Grade band distribution per programme — for stacked performance view
    getGradeBandByProgramme() {
        const data = this.getData();
        const bandDef = {
            'A (Excellent)': ['A1', 'A2', 'A3', 'A4', 'A5'],
            'B (Very Good)': ['B1', 'B2', 'B3'],
            'C (Good)': ['C1', 'C2', 'C3'],
            'D (Pass)': ['D1', 'D2', 'D3'],
            'E-F (Marginal Fail)': ['E1', 'E2', 'E3', 'F1', 'F2', 'F3'],
            'G/NP (Clear Fail)': ['G1', 'G2', 'G3', 'NP']
        };
        const bands = Object.keys(bandDef);

        const progCounts = {};
        for (const g of data.courseResults) {
            const student = DataLoader.studentIndex.get(g.student_id);
            if (!student) continue;
            const prog = student.programme;
            if (!progCounts[prog]) {
                progCounts[prog] = {};
                bands.forEach(b => progCounts[prog][b] = 0);
            }
            for (const [band, grades] of Object.entries(bandDef)) {
                if (grades.includes(g.overall_grade)) {
                    progCounts[prog][band]++;
                    break;
                }
            }
        }

        const programmes = Object.keys(progCounts).sort();
        return { programmes, bands, data: progCounts };
    },

    // English proficiency per programme — for stacked proficiency chart
    getProficiencyByProgramme() {
        const data = this.getData();
        const progProf = {};
        for (const s of data.students) {
            if (!s.english_proficiency) continue;
            if (!progProf[s.programme]) progProf[s.programme] = {};
            progProf[s.programme][s.english_proficiency] = (progProf[s.programme][s.english_proficiency] || 0) + 1;
        }
        const programmes = Object.keys(progProf).sort();
        const levels = [...new Set(data.students.map(s => s.english_proficiency).filter(Boolean))];
        // Sort levels by proficiency order
        const levelOrder = ['Advanced', 'Proficient', 'Intermediate', 'Basic', 'Beginner'];
        levels.sort((a, b) => {
            const ia = levelOrder.indexOf(a);
            const ib = levelOrder.indexOf(b);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
        return { programmes, levels, data: progProf };
    },

    // Gender distribution per programme — for stacked gender chart
    getGenderByProgramme() {
        const data = this.getData();
        const progGender = {};
        for (const s of data.students) {
            if (!progGender[s.programme]) progGender[s.programme] = {};
            progGender[s.programme][s.gender] = (progGender[s.programme][s.gender] || 0) + 1;
        }
        const programmes = Object.keys(progGender).sort();
        const genders = [...new Set(data.students.map(s => s.gender))].sort();
        return { programmes, genders, data: progGender };
    },

    // Attrition rate per programme — % of students who dropped out
    getAttritionByProgramme() {
        const data = this.getData();
        const programmes = this.getProgrammes();
        const progStats = {};
        for (const p of programmes) progStats[p] = { total: 0, dropped: 0 };

        for (const s of data.students) {
            if (!progStats[s.programme]) continue;
            progStats[s.programme].total++;
            if (s.status === 'Dropped') progStats[s.programme].dropped++;
        }

        const result = {};
        for (const p of programmes) {
            result[p] = progStats[p].total > 0
                ? parseFloat(((progStats[p].dropped / progStats[p].total) * 100).toFixed(1))
                : 0;
        }
        return result;
    },

    // Export filtered students to CSV
    exportToCSV() {
        const data = this.getData();
        const csv = Papa.unparse(data.students);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `filtered_students_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
