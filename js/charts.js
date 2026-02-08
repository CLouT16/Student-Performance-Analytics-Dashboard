// Charts Module
const ChartsManager = {
    charts: {},
    colors: {
        primary: '#0066cc',
        secondary: '#004499',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        palette: [
            '#0066cc', '#00cc66', '#cc6600', '#6600cc',
            '#cc0066', '#66cc00', '#0066ff', '#ff6600',
            '#6600ff', '#ff0066', '#00ff66', '#66ff00'
        ]
    },

    // Initialize all charts
    initializeCharts() {
        this.createEnrollmentTrendChart();
        this.createEnrollmentSchoolChart();
        this.createEnrollmentProgrammeChart();
        this.createEnrollmentGrowthChart();
        this.createGPADistributionChart();
        this.createPassFailSchoolChart();
        this.createGPAProgrammeChart();
        this.createGradeDistributionChart();
        this.createPerformanceTrendChart();
        this.createCompletionProgrammeChart();
        this.createGPAComparisonChart();
        this.createProgrammeMatrixChart();
        this.createRetentionTrendChart();
        this.createAttritionSchoolChart();
        this.createCompletionCohortChart();
        this.createGenderChart();
        this.createNationalityChart();
        this.createAgeChart();
        this.createDisabilityChart();
        this.createEnglishProficiencyChart();
        this.createEducationalSystemChart();
        this.createDemographicsProgrammeChart();
    },

    // Update all charts with filtered data
    updateAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
        this.initializeCharts();
    },

    // Helper to get chart context
    getCtx(chartId) {
        return document.getElementById(chartId)?.getContext('2d');
    },

    // Enrollment Trend Over Time
    createEnrollmentTrendChart() {
        const data = DataLoader.getData();
        const yearCounts = {};

        data.enrollments.forEach(e => {
            yearCounts[e.academic_year] = (yearCounts[e.academic_year] || 0) + 1;
        });

        const years = Object.keys(yearCounts).sort();
        const counts = years.map(y => yearCounts[y]);

        const ctx = this.getCtx('enrollmentTrendChart');
        if (!ctx) return;

        this.charts.enrollmentTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Total Enrollments',
                    data: counts,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '33',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Enrollments' } },
                    x: { title: { display: true, text: 'Academic Year' } }
                }
            }
        });
    },

    // Enrollment by School
    createEnrollmentSchoolChart() {
        const data = DataLoader.getData();
        const schoolCounts = {};

        data.students.forEach(s => {
            schoolCounts[s.school] = (schoolCounts[s.school] || 0) + 1;
        });

        const schools = Object.keys(schoolCounts);
        const counts = schools.map(s => schoolCounts[s]);

        const ctx = this.getCtx('enrollmentSchoolChart');
        if (!ctx) return;

        this.charts.enrollmentSchool = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: schools,
                datasets: [{
                    label: 'Students',
                    data: counts,
                    backgroundColor: this.colors.palette
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Students' } } }
            }
        });
    },

    // Enrollment by Programme
    createEnrollmentProgrammeChart() {
        const data = DataLoader.getData();
        const programmeCounts = {};

        data.students.forEach(s => {
            programmeCounts[s.programme] = (programmeCounts[s.programme] || 0) + 1;
        });

        const programmes = Object.keys(programmeCounts);
        const counts = programmes.map(p => programmeCounts[p]);

        const ctx = this.getCtx('enrollmentProgrammeChart');
        if (!ctx) return;

        this.charts.enrollmentProgramme = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: programmes,
                datasets: [{
                    data: counts,
                    backgroundColor: this.colors.palette
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    },

    // Year-on-Year Growth Rate
    createEnrollmentGrowthChart() {
        const data = DataLoader.getData();
        const yearCounts = {};

        data.enrollments.forEach(e => {
            yearCounts[e.academic_year] = (yearCounts[e.academic_year] || 0) + 1;
        });

        const years = Object.keys(yearCounts).sort();
        const growthRates = [];

        for (let i = 1; i < years.length; i++) {
            const current = yearCounts[years[i]];
            const previous = yearCounts[years[i-1]];
            const growth = ((current - previous) / previous * 100).toFixed(1);
            growthRates.push(parseFloat(growth));
        }

        const ctx = this.getCtx('enrollmentGrowthChart');
        if (!ctx) return;

        this.charts.enrollmentGrowth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years.slice(1),
                datasets: [{
                    label: 'Growth Rate (%)',
                    data: growthRates,
                    backgroundColor: growthRates.map(g => g >= 0 ? this.colors.success : this.colors.danger)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { title: { display: true, text: 'Growth Rate (%)' } }
                }
            }
        });
    },

    // GPA Distribution
    createGPADistributionChart() {
        const data = DataLoader.getData();
        const gpaBins = { '0-1': 0, '1-2': 0, '2-3': 0, '3-4': 0 };

        data.students.forEach(s => {
            const gpa = parseFloat(DataLoader.calculateStudentGPA(s.student_id));
            if (gpa < 1) gpaBins['0-1']++;
            else if (gpa < 2) gpaBins['1-2']++;
            else if (gpa < 3) gpaBins['2-3']++;
            else gpaBins['3-4']++;
        });

        const ctx = this.getCtx('gpaDistributionChart');
        if (!ctx) return;

        this.charts.gpaDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(gpaBins),
                datasets: [{
                    label: 'Number of Students',
                    data: Object.values(gpaBins),
                    backgroundColor: this.colors.primary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    x: { title: { display: true, text: 'GPA Range' } }
                }
            }
        });
    },

    // Pass/Fail Rates by School
    createPassFailSchoolChart() {
        const data = DataLoader.getData();
        const schoolStats = {};

        data.students.forEach(s => {
            if (!schoolStats[s.school]) {
                schoolStats[s.school] = { passed: 0, failed: 0 };
            }
            const studentGrades = data.grades.filter(g => g.student_id === s.student_id);
            const passedCount = studentGrades.filter(g => g.is_passed).length;
            const failedCount = studentGrades.length - passedCount;
            schoolStats[s.school].passed += passedCount;
            schoolStats[s.school].failed += failedCount;
        });

        const schools = Object.keys(schoolStats);
        const passRates = schools.map(s => {
            const total = schoolStats[s].passed + schoolStats[s].failed;
            return total > 0 ? (schoolStats[s].passed / total * 100).toFixed(1) : 0;
        });

        const ctx = this.getCtx('passFailSchoolChart');
        if (!ctx) return;

        this.charts.passFailSchool = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: schools,
                datasets: [{
                    label: 'Pass Rate (%)',
                    data: passRates,
                    backgroundColor: this.colors.success
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Pass Rate (%)' } }
                }
            }
        });
    },

    // Average GPA by Programme
    createGPAProgrammeChart() {
        const data = DataLoader.getData();
        const programmeGPAs = {};

        data.students.forEach(s => {
            if (!programmeGPAs[s.programme]) {
                programmeGPAs[s.programme] = [];
            }
            const gpa = parseFloat(DataLoader.calculateStudentGPA(s.student_id));
            programmeGPAs[s.programme].push(gpa);
        });

        const programmes = Object.keys(programmeGPAs);
        const avgGPAs = programmes.map(p => {
            const gpas = programmeGPAs[p];
            return (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2);
        });

        const ctx = this.getCtx('gpaProgrammeChart');
        if (!ctx) return;

        this.charts.gpaProgramme = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: programmes,
                datasets: [{
                    label: 'Average GPA',
                    data: avgGPAs,
                    backgroundColor: this.colors.info
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: { beginAtZero: true, max: 4, title: { display: true, text: 'Average GPA' } }
                }
            }
        });
    },

    // Grade Distribution (CGS)
    createGradeDistributionChart() {
        const data = DataLoader.getData();
        const gradeCounts = {};
        const gradeOrder = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'F'];

        gradeOrder.forEach(g => gradeCounts[g] = 0);
        data.grades.forEach(g => {
            if (g.cgs_grade) gradeCounts[g.cgs_grade]++;
        });

        const ctx = this.getCtx('gradeDistributionChart');
        if (!ctx) return;

        this.charts.gradeDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: gradeOrder,
                datasets: [{
                    label: 'Number of Grades',
                    data: gradeOrder.map(g => gradeCounts[g]),
                    backgroundColor: this.colors.palette
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Frequency' } },
                    x: { title: { display: true, text: 'CGS Grade' } }
                }
            }
        });
    },

    // Performance Trends Over Time
    createPerformanceTrendChart() {
        const data = DataLoader.getData();
        const yearGPAs = {};

        data.enrollments.forEach(e => {
            if (!yearGPAs[e.academic_year]) yearGPAs[e.academic_year] = [];
            const gpa = parseFloat(DataLoader.calculateStudentGPA(e.student_id));
            if (gpa > 0) yearGPAs[e.academic_year].push(gpa);
        });

        const years = Object.keys(yearGPAs).sort();
        const avgGPAs = years.map(y => {
            const gpas = yearGPAs[y];
            return (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2);
        });

        const ctx = this.getCtx('performanceTrendChart');
        if (!ctx) return;

        this.charts.performanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Average GPA',
                    data: avgGPAs,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '33',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 4, title: { display: true, text: 'Average GPA' } },
                    x: { title: { display: true, text: 'Academic Year' } }
                }
            }
        });
    },

    // Completion Rates by Programme
    createCompletionProgrammeChart() {
        const data = DataLoader.getData();
        const programmeStats = {};

        data.students.forEach(s => {
            if (!programmeStats[s.programme]) {
                programmeStats[s.programme] = { total: 0, completed: 0 };
            }
            const yearsSinceEntry = 2025 - parseInt(s.entry_year);
            if (yearsSinceEntry >= 4) {
                programmeStats[s.programme].total++;
                if (s.status === 'Graduated') programmeStats[s.programme].completed++;
            }
        });

        const programmes = Object.keys(programmeStats);
        const completionRates = programmes.map(p => {
            const stats = programmeStats[p];
            return stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) : 0;
        });

        const ctx = this.getCtx('completionProgrammeChart');
        if (!ctx) return;

        this.charts.completionProgramme = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: programmes,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: completionRates,
                    backgroundColor: this.colors.success
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Completion Rate (%)' } }
                }
            }
        });
    },

    // Programme GPA Comparison
    createGPAComparisonChart() {
        const data = DataLoader.getData();
        const programmeGPAs = {};

        data.students.forEach(s => {
            if (!programmeGPAs[s.programme]) programmeGPAs[s.programme] = [];
            const gpa = parseFloat(DataLoader.calculateStudentGPA(s.student_id));
            programmeGPAs[s.programme].push(gpa);
        });

        const programmes = Object.keys(programmeGPAs);
        const avgGPAs = programmes.map(p => {
            const gpas = programmeGPAs[p];
            return (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2);
        });

        const ctx = this.getCtx('gpaComparisonChart');
        if (!ctx) return;

        this.charts.gpaComparison = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: programmes,
                datasets: [{
                    label: 'Average GPA',
                    data: avgGPAs,
                    backgroundColor: this.colors.primary + '33',
                    borderColor: this.colors.primary,
                    pointBackgroundColor: this.colors.primary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: { beginAtZero: true, max: 4 }
                }
            }
        });
    },

    // Programme Performance Matrix
    createProgrammeMatrixChart() {
        const data = DataLoader.getData();
        const programmeStats = {};

        data.students.forEach(s => {
            if (!programmeStats[s.programme]) {
                programmeStats[s.programme] = { gpa: [], enrollment: 0 };
            }
            programmeStats[s.programme].enrollment++;
            const gpa = parseFloat(DataLoader.calculateStudentGPA(s.student_id));
            programmeStats[s.programme].gpa.push(gpa);
        });

        const scatterData = Object.keys(programmeStats).map(p => {
            const stats = programmeStats[p];
            const avgGPA = stats.gpa.reduce((a, b) => a + b, 0) / stats.gpa.length;
            return {
                x: stats.enrollment,
                y: avgGPA,
                label: p
            };
        });

        const ctx = this.getCtx('programmeMatrixChart');
        if (!ctx) return;

        this.charts.programmeMatrix = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Programmes',
                    data: scatterData,
                    backgroundColor: this.colors.palette
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = scatterData[context.dataIndex];
                                return `${point.label}: ${point.x} students, ${point.y.toFixed(2)} GPA`;
                            }
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Enrollment Size' } },
                    y: { title: { display: true, text: 'Average GPA' }, beginAtZero: true, max: 4 }
                }
            }
        });
    },

    // Retention Trend Over Time
    createRetentionTrendChart() {
        const years = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        const retentionRates = years.map(y => DataLoader.calculateRetentionRate(y));

        const ctx = this.getCtx('retentionTrendChart');
        if (!ctx) return;

        this.charts.retentionTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Retention Rate (%)',
                    data: retentionRates,
                    borderColor: this.colors.info,
                    backgroundColor: this.colors.info + '33',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Retention Rate (%)' } },
                    x: { title: { display: true, text: 'Academic Year' } }
                }
            }
        });
    },

    // Attrition Rate by School
    createAttritionSchoolChart() {
        const data = DataLoader.getData();
        const schoolStats = {};

        data.students.forEach(s => {
            if (!schoolStats[s.school]) {
                schoolStats[s.school] = { total: 0, dropped: 0 };
            }
            schoolStats[s.school].total++;
            if (s.status === 'Dropped') schoolStats[s.school].dropped++;
        });

        const schools = Object.keys(schoolStats);
        const attritionRates = schools.map(s => {
            const stats = schoolStats[s];
            return (stats.dropped / stats.total * 100).toFixed(1);
        });

        const ctx = this.getCtx('attritionSchoolChart');
        if (!ctx) return;

        this.charts.attritionSchool = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: schools,
                datasets: [{
                    label: 'Attrition Rate (%)',
                    data: attritionRates,
                    backgroundColor: this.colors.danger
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Attrition Rate (%)' } }
                }
            }
        });
    },

    // Completion Rate by Cohort
    createCompletionCohortChart() {
        const data = DataLoader.getData();
        const cohortStats = {};

        data.students.forEach(s => {
            const cohort = s.entry_year;
            if (!cohortStats[cohort]) {
                cohortStats[cohort] = { total: 0, completed: 0 };
            }
            const yearsSinceEntry = 2025 - parseInt(cohort);
            if (yearsSinceEntry >= 4) {
                cohortStats[cohort].total++;
                if (s.status === 'Graduated') cohortStats[cohort].completed++;
            }
        });

        const cohorts = Object.keys(cohortStats).sort();
        const completionRates = cohorts.map(c => {
            const stats = cohortStats[c];
            return stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) : 0;
        });

        const ctx = this.getCtx('completionCohortChart');
        if (!ctx) return;

        this.charts.completionCohort = new Chart(ctx, {
            type: 'line',
            data: {
                labels: cohorts,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: completionRates,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '33',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Completion Rate (%)' } },
                    x: { title: { display: true, text: 'Entry Year' } }
                }
            }
        });
    },

    // Gender Distribution
    createGenderChart() {
        const data = DataLoader.getData();
        const genderCounts = {};

        data.students.forEach(s => {
            genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
        });

        const ctx = this.getCtx('genderChart');
        if (!ctx) return;

        this.charts.gender = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(genderCounts),
                datasets: [{
                    data: Object.values(genderCounts),
                    backgroundColor: [this.colors.primary, this.colors.success, this.colors.warning]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    // Nationality Distribution
    createNationalityChart() {
        const data = DataLoader.getData();
        const nationalityCounts = {};

        data.students.forEach(s => {
            nationalityCounts[s.nationality] = (nationalityCounts[s.nationality] || 0) + 1;
        });

        // Get top 10 nationalities
        const sorted = Object.entries(nationalityCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const nationalities = sorted.map(x => x[0]);
        const counts = sorted.map(x => x[1]);

        const ctx = this.getCtx('nationalityChart');
        if (!ctx) return;

        this.charts.nationality = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: nationalities,
                datasets: [{
                    label: 'Number of Students',
                    data: counts,
                    backgroundColor: this.colors.palette
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } }
            }
        });
    },

    // Age Distribution
    createAgeChart() {
        const data = DataLoader.getData();
        const ageBins = { '17-20': 0, '21-24': 0, '25-28': 0, '29+': 0 };

        data.students.forEach(s => {
            const age = parseInt(s.age);
            if (age <= 20) ageBins['17-20']++;
            else if (age <= 24) ageBins['21-24']++;
            else if (age <= 28) ageBins['25-28']++;
            else ageBins['29+']++;
        });

        const ctx = this.getCtx('ageChart');
        if (!ctx) return;

        this.charts.age = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ageBins),
                datasets: [{
                    label: 'Number of Students',
                    data: Object.values(ageBins),
                    backgroundColor: this.colors.info
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    x: { title: { display: true, text: 'Age Range' } }
                }
            }
        });
    },

    // Disability Status
    createDisabilityChart() {
        const data = DataLoader.getData();
        const disabilityCounts = { 'No Disability': 0, 'With Disability': 0 };

        data.students.forEach(s => {
            if (s.is_disabled) disabilityCounts['With Disability']++;
            else disabilityCounts['No Disability']++;
        });

        const ctx = this.getCtx('disabilityChart');
        if (!ctx) return;

        this.charts.disability = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(disabilityCounts),
                datasets: [{
                    data: Object.values(disabilityCounts),
                    backgroundColor: [this.colors.success, this.colors.warning]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    // English Proficiency Levels
    createEnglishProficiencyChart() {
        const data = DataLoader.getData();
        const proficiencyCounts = {};

        data.students.forEach(s => {
            const level = s.english_proficiency || 'Not Specified';
            proficiencyCounts[level] = (proficiencyCounts[level] || 0) + 1;
        });

        const ctx = this.getCtx('englishProficiencyChart');
        if (!ctx) return;

        this.charts.englishProficiency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(proficiencyCounts),
                datasets: [{
                    label: 'Number of Students',
                    data: Object.values(proficiencyCounts),
                    backgroundColor: this.colors.palette
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    // Educational System Background
    createEducationalSystemChart() {
        const data = DataLoader.getData();
        const systemCounts = {};

        data.students.forEach(s => {
            const system = s.education_system || 'Not Specified';
            systemCounts[system] = (systemCounts[system] || 0) + 1;
        });

        const ctx = this.getCtx('educationalSystemChart');
        if (!ctx) return;

        this.charts.educationalSystem = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(systemCounts),
                datasets: [{
                    data: Object.values(systemCounts),
                    backgroundColor: this.colors.palette
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    // Demographics by Programme
    createDemographicsProgrammeChart() {
        const data = DataLoader.getData();
        const programmes = [...new Set(data.students.map(s => s.programme))];
        const genders = [...new Set(data.students.map(s => s.gender))];

        const datasets = genders.map((gender, idx) => {
            return {
                label: gender,
                data: programmes.map(p => {
                    return data.students.filter(s => s.programme === p && s.gender === gender).length;
                }),
                backgroundColor: this.colors.palette[idx]
            };
        });

        const ctx = this.getCtx('demographicsProgrammeChart');
        if (!ctx) return;

        this.charts.demographicsProgramme = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: programmes,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Students' } }
                }
            }
        });
    }
};
