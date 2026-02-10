// Charts Manager — create once, update in-place
const ChartsManager = {
    charts: {},

    // Create all charts (called once)
    initializeCharts() {
        // Management Overview
        this.createRecruitmentSourceChart();
        this.createRecruitmentEffectivenessChart();
        this.createOfferFunnelChart();
        this.createClassificationByProgChart();
        this.createAttendanceRiskChart();
        this.createEducationPerformanceChart();
        this.createNewReturningChart();
        // Tab charts
        this.createEnrollmentTrendChart();
        this.createEnrollmentBySchoolChart();
        this.createEnrollmentByProgrammeChart();
        this.createGPADistributionChart();
        this.createPassFailSchoolChart();
        this.createAvgGPAByProgrammeChart();
        this.createGradeDistributionChart();
        this.createCompletionRatesChart();
        this.createPerformanceMatrixChart();
        this.createRetentionRateChart();
        this.createAttritionRateChart();
        this.createCohortCompletionChart();
        this.createGenderDistChart();
        this.createNationalityChart();
        this.createAgeDistChart();
        this.createProficiencyChart();
    },

    // Update all charts with current DataStore data
    updateAllCharts() {
        // Management Overview
        this.updateRecruitmentSourceChart();
        this.updateRecruitmentEffectivenessChart();
        this.updateOfferFunnelChart();
        this.updateClassificationByProgChart();
        this.updateAttendanceRiskChart();
        this.updateEducationPerformanceChart();
        this.updateNewReturningChart();
        // Tab charts
        this.updateEnrollmentTrendChart();
        this.updateEnrollmentBySchoolChart();
        this.updateEnrollmentByProgrammeChart();
        this.updateGPADistributionChart();
        this.updatePassFailSchoolChart();
        this.updateAvgGPAByProgrammeChart();
        this.updateGradeDistributionChart();
        this.updateCompletionRatesChart();
        this.updatePerformanceMatrixChart();
        this.updateRetentionRateChart();
        this.updateAttritionRateChart();
        this.updateCohortCompletionChart();
        this.updateGenderDistChart();
        this.updateNationalityChart();
        this.updateAgeDistChart();
        this.updateProficiencyChart();
    },

    getCtx(id) {
        return document.getElementById(id)?.getContext('2d');
    },

    // Y-axis ticks: abbreviate programme names or truncate long labels
    _yLabelTicks(maxLen = 24, useProgrammeAbbrev = false) {
        return {
            autoSkip: false,
            callback: function(value) {
                const label = this.getLabelForValue(value);
                if (useProgrammeAbbrev && CONFIG.programmeAbbreviations[label]) {
                    return CONFIG.abbrevProgramme(label);
                }
                return label.length > maxLen ? label.substring(0, maxLen) + '...' : label;
            },
            font: { size: 11 }
        };
    },

    // Helper: update chart data in place
    _update(key, labels, datasets) {
        const chart = this.charts[key];
        if (!chart) return;
        chart.data.labels = labels;
        chart.data.datasets.forEach((ds, i) => {
            if (datasets[i]) Object.assign(ds, datasets[i]);
        });
        chart.update();
    },

    // =========== ENROLLMENT ===========

    createEnrollmentTrendChart() {
        const ctx = this.getCtx('enrollmentTrendChart');
        if (!ctx) return;
        this.charts.enrollmentTrend = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'Students Enrolled',
                data: [],
                borderColor: CONFIG.colors.primary,
                backgroundColor: CONFIG.colors.primary + '33',
                fill: true, tension: 0.4
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Unique Students' } },
                    x: { title: { display: true, text: 'Academic Year' } }
                }
            }
        });
        this.updateEnrollmentTrendChart();
    },

    updateEnrollmentTrendChart() {
        const enrollment = DataStore.getEnrollmentByYear();
        const years = Object.keys(enrollment).sort();
        this._update('enrollmentTrend', years, [{ data: years.map(y => enrollment[y]) }]);
    },

    createEnrollmentBySchoolChart() {
        const ctx = this.getCtx('enrollmentBySchoolChart');
        if (!ctx) return;
        this.charts.enrollmentBySchool = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{
                data: [],
                backgroundColor: ['#4b7baa', '#5a9e8f', '#8b7eb8', '#c5885a', '#6aab8e', '#b56e8a']
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
        this.updateEnrollmentBySchoolChart();
    },

    updateEnrollmentBySchoolChart() {
        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => { counts[s.school] = (counts[s.school] || 0) + 1; });
        const schools = Object.keys(counts).sort();
        this._update('enrollmentBySchool', schools, [{ data: schools.map(s => counts[s]) }]);
    },

    createEnrollmentByProgrammeChart() {
        const ctx = this.getCtx('enrollmentByProgrammeChart');
        if (!ctx) return;
        this.charts.enrollmentByProgramme = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Students', data: [],
                backgroundColor: CONFIG.colors.secondary,
                borderRadius: 4
            }]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    y: { ticks: this._yLabelTicks(24, true) }
                }
            }
        });
        this.updateEnrollmentByProgrammeChart();
    },

    updateEnrollmentByProgrammeChart() {
        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => { counts[s.programme] = (counts[s.programme] || 0) + 1; });
        const programmes = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        this._update('enrollmentByProgramme', programmes, [{ data: programmes.map(p => counts[p]) }]);
    },

    // =========== PERFORMANCE ===========

    createGPADistributionChart() {
        const ctx = this.getCtx('gpaDistributionChart');
        if (!ctx) return;
        this.charts.gpaDistribution = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Number of Graduates', data: [],
                backgroundColor: CONFIG.classificationColors,
                borderRadius: 4
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const idx = items[0].dataIndex;
                                return CONFIG.classificationOrder[idx] || items[0].label;
                            },
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.raw} graduates (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Graduates' } },
                    x: {
                        title: { display: true, text: 'Degree Classification' },
                        ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 30 }
                    }
                }
            }
        });
        this.updateGPADistributionChart();
    },

    updateGPADistributionChart() {
        const data = DataStore.getData();
        const counts = {};
        CONFIG.classificationOrder.forEach(c => { counts[c] = 0; });
        data.classifications.forEach(c => {
            if (counts[c.classification] !== undefined) {
                counts[c.classification]++;
            }
        });
        this._update('gpaDistribution',
            CONFIG.classificationLabels,
            [{ data: CONFIG.classificationOrder.map(c => counts[c]) }]
        );
    },

    createPassFailSchoolChart() {
        const ctx = this.getCtx('passRateChart');
        if (!ctx) return;
        this.charts.passRate = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [
                { label: 'Pass Rate (%)', data: [], backgroundColor: CONFIG.colors.success, borderRadius: 3 },
                { label: 'Fail Rate (%)', data: [], backgroundColor: CONFIG.colors.danger, borderRadius: 3 }
            ]},
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`
                        }
                    }
                },
                scales: {
                    x: { stacked: true, beginAtZero: true, max: 100, title: { display: true, text: 'Percentage' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24, true) }
                }
            }
        });
        this.updatePassFailSchoolChart();
    },

    updatePassFailSchoolChart() {
        const data = DataStore.getData();
        const stats = {};
        data.courseResults.forEach(g => {
            const student = DataLoader.studentIndex.get(g.student_id);
            const programme = student ? student.programme : 'Unknown';
            if (!stats[programme]) stats[programme] = { passed: 0, total: 0 };
            stats[programme].total++;
            if (g.is_passed) stats[programme].passed++;
        });
        const programmes = Object.keys(stats).sort();
        const passRates = programmes.map(p => ((stats[p].passed / stats[p].total) * 100).toFixed(1));
        const failRates = programmes.map(p => (((stats[p].total - stats[p].passed) / stats[p].total) * 100).toFixed(1));
        this._update('passRate', programmes, [{ data: passRates }, { data: failRates }]);
    },

    createAvgGPAByProgrammeChart() {
        const ctx = this.getCtx('avgGPAChart');
        if (!ctx) return;
        this.charts.avgGPA = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Average GPA', data: [],
                backgroundColor: CONFIG.colors.secondary,
                borderRadius: 4
            }]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true } },
                scales: {
                    x: { beginAtZero: true, max: 22, title: { display: true, text: 'Average GPA (0-22)' } },
                    y: { ticks: this._yLabelTicks(24, true) }
                }
            }
        });
        this.updateAvgGPAByProgrammeChart();
    },

    updateAvgGPAByProgrammeChart() {
        const data = DataStore.getData();
        const progGPA = {};
        data.classifications.forEach(c => {
            if (!progGPA[c.programme]) progGPA[c.programme] = { total: 0, count: 0 };
            progGPA[c.programme].total += c.final_gpa;
            progGPA[c.programme].count++;
        });
        const programmes = Object.keys(progGPA).sort();
        const avgGPAs = programmes.map(p => (progGPA[p].total / progGPA[p].count).toFixed(1));
        this._update('avgGPA', programmes, [{ data: avgGPAs }]);
    },

    createGradeDistributionChart() {
        const ctx = this.getCtx('gradeDistChart');
        if (!ctx) return;
        this.charts.gradeDist = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Number of Grades', data: [],
                backgroundColor: CONFIG.colors.primary,
                borderRadius: 3
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Frequency' } },
                    x: { title: { display: true, text: 'CGS Grade' } }
                }
            }
        });
        this.updateGradeDistributionChart();
    },

    updateGradeDistributionChart() {
        const data = DataStore.getData();
        const gradeCounts = {};
        data.courseResults.forEach(g => {
            gradeCounts[g.overall_grade] = (gradeCounts[g.overall_grade] || 0) + 1;
        });
        // Use CONFIG grade order, only show grades that exist
        const grades = CONFIG.gradeOrder.filter(g => gradeCounts[g] > 0);
        this._update('gradeDist', grades, [{ data: grades.map(g => gradeCounts[g] || 0) }]);
    },

    // =========== COMPARISON ===========

    createCompletionRatesChart() {
        const ctx = this.getCtx('completionRatesChart');
        if (!ctx) return;
        this.charts.completionRates = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Completion Rate (%)', data: [],
                backgroundColor: CONFIG.colors.success,
                borderRadius: 4
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
        this.updateCompletionRatesChart();
    },

    updateCompletionRatesChart() {
        const data = DataStore.getData();
        const allYears = DataStore.getAcademicYears();
        if (allYears.length < 4) return;
        const latestStartYear = parseInt(allYears[allYears.length - 1].split('/')[0]);

        const progData = {};
        // Count eligible by programme
        data.students.forEach(s => {
            const entryStartYear = parseInt((s.entry_year || '').split('/')[0]);
            if (isNaN(entryStartYear) || (latestStartYear - entryStartYear) < 4) return;
            if (!progData[s.programme]) progData[s.programme] = { eligible: 0, completed: 0 };
            progData[s.programme].eligible++;
        });
        // Count completed by programme
        data.classifications.forEach(c => {
            if (progData[c.programme]) progData[c.programme].completed++;
        });

        const programmes = Object.keys(progData).filter(p => progData[p].eligible > 0).sort();
        const rates = programmes.map(p =>
            ((progData[p].completed / progData[p].eligible) * 100).toFixed(1)
        );
        this._update('completionRates', programmes, [{ data: rates }]);
    },

    createPerformanceMatrixChart() {
        const ctx = this.getCtx('performanceMatrixChart');
        if (!ctx) return;
        this.charts.performanceMatrix = new Chart(ctx, {
            type: 'scatter',
            data: { datasets: [{
                label: 'Programmes', data: [],
                backgroundColor: CONFIG.colors.palette,
                pointRadius: 8
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const point = ctx.raw;
                                return `${point.label}: ${point.x} students, GPA ${point.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Enrollment Size' } },
                    y: { title: { display: true, text: 'Average GPA (0-22)' }, max: 22 }
                }
            }
        });
        this.updatePerformanceMatrixChart();
    },

    updatePerformanceMatrixChart() {
        const data = DataStore.getData();
        const progData = {};
        data.students.forEach(s => {
            if (!progData[s.programme]) progData[s.programme] = { count: 0, gpaSum: 0, gpaCount: 0 };
            progData[s.programme].count++;
        });
        data.classifications.forEach(c => {
            if (progData[c.programme]) {
                progData[c.programme].gpaSum += c.final_gpa;
                progData[c.programme].gpaCount++;
            }
        });
        const scatterData = Object.keys(progData).map(p => ({
            x: progData[p].count,
            y: progData[p].gpaCount > 0 ? parseFloat((progData[p].gpaSum / progData[p].gpaCount).toFixed(1)) : 0,
            label: p
        }));
        this.charts.performanceMatrix.data.datasets[0].data = scatterData;
        this.charts.performanceMatrix.update();
    },

    // =========== RETENTION ===========

    createRetentionRateChart() {
        const ctx = this.getCtx('retentionRateChart');
        if (!ctx) return;
        this.charts.retentionRate = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'Retention Rate (%)', data: [],
                borderColor: CONFIG.colors.secondary,
                backgroundColor: CONFIG.colors.secondary + '33',
                fill: true, tension: 0.4
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true } },
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Retention Rate (%)' } },
                    x: { title: { display: true, text: 'Academic Year' } }
                }
            }
        });
        this.updateRetentionRateChart();
    },

    updateRetentionRateChart() {
        const years = DataStore.getAcademicYears();
        // Can only calculate retention for years that have a next year
        const calcYears = years.slice(0, -1);
        const rates = calcYears.map(y => parseFloat(DataStore.calculateRetentionRate(y)) || 0);
        this._update('retentionRate', calcYears, [{ data: rates }]);
    },

    createAttritionRateChart() {
        const ctx = this.getCtx('attritionRateChart');
        if (!ctx) return;
        this.charts.attritionRate = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Attrition Rate (%)', data: [],
                backgroundColor: CONFIG.colors.danger,
                borderRadius: 4
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Attrition Rate (%)' } } }
            }
        });
        this.updateAttritionRateChart();
    },

    updateAttritionRateChart() {
        const data = DataStore.getData();
        const stats = {};
        data.students.forEach(s => {
            if (!stats[s.school]) stats[s.school] = { total: 0, dropped: 0 };
            stats[s.school].total++;
            if (s.status === 'Dropped') stats[s.school].dropped++;
        });
        const schools = Object.keys(stats).sort();
        const rates = schools.map(s => ((stats[s].dropped / stats[s].total) * 100).toFixed(1));
        this._update('attritionRate', schools, [{ data: rates }]);
    },

    createCohortCompletionChart() {
        const ctx = this.getCtx('cohortCompletionChart');
        if (!ctx) return;
        this.charts.cohortCompletion = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'Completion Rate (%)', data: [],
                borderColor: CONFIG.colors.success,
                backgroundColor: CONFIG.colors.success + '33',
                fill: true, tension: 0.4
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true } },
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Completion Rate (%)' } },
                    x: { title: { display: true, text: 'Entry Cohort' } }
                }
            }
        });
        this.updateCohortCompletionChart();
    },

    updateCohortCompletionChart() {
        const data = DataStore.getData();
        // Group students by entry year and check graduation via classifications
        const cohorts = {};
        data.students.forEach(s => {
            if (!s.entry_year) return;
            if (!cohorts[s.entry_year]) cohorts[s.entry_year] = { total: 0, graduated: 0 };
            cohorts[s.entry_year].total++;
        });
        // Use classifications graduation_status
        data.classifications.forEach(c => {
            if (c.graduation_status === 'Graduated') {
                // Find this student's entry year
                const student = DataLoader.studentIndex.get(c.student_id);
                if (student && cohorts[student.entry_year]) {
                    cohorts[student.entry_year].graduated++;
                }
            }
        });
        // Only show cohorts that had time to complete (4+ years)
        const allYears = DataStore.getAcademicYears();
        const latestStartYear = parseInt((allYears[allYears.length - 1] || '').split('/')[0]);
        const cohortYears = Object.keys(cohorts).sort().filter(y => {
            const startYear = parseInt(y.split('/')[0]);
            return (latestStartYear - startYear) >= 4;
        });
        const rates = cohortYears.map(y =>
            cohorts[y].total > 0 ? ((cohorts[y].graduated / cohorts[y].total) * 100).toFixed(1) : 0
        );
        this._update('cohortCompletion', cohortYears, [{ data: rates }]);
    },

    // =========== DEMOGRAPHICS ===========

    createGenderDistChart() {
        const ctx = this.getCtx('genderDistChart');
        if (!ctx) return;
        this.charts.genderDist = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{
                data: [],
                backgroundColor: ['#4b7baa', '#5a9e8f', '#d4a843', '#b56e8a']
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
        this.updateGenderDistChart();
    },

    updateGenderDistChart() {
        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => { counts[s.gender] = (counts[s.gender] || 0) + 1; });
        const labels = Object.keys(counts).sort();
        this._update('genderDist', labels, [{ data: labels.map(l => counts[l]) }]);
    },

    createNationalityChart() {
        const ctx = this.getCtx('nationalityChart');
        if (!ctx) return;
        this.charts.nationality = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Students', data: [],
                backgroundColor: CONFIG.colors.palette
            }]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true } }
            }
        });
        this.updateNationalityChart();
    },

    updateNationalityChart() {
        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => { counts[s.nationality] = (counts[s.nationality] || 0) + 1; });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        this._update('nationality', sorted.map(n => n[0]), [{ data: sorted.map(n => n[1]) }]);
    },

    createAgeDistChart() {
        const ctx = this.getCtx('ageDistChart');
        if (!ctx) return;
        this.charts.ageDist = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Students', data: [],
                backgroundColor: CONFIG.colors.info,
                borderRadius: 4
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    x: { title: { display: true, text: 'Age Range' } }
                }
            }
        });
        this.updateAgeDistChart();
    },

    updateAgeDistChart() {
        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => {
            if (s.age == null) return; // Exclude null ages
            const group = Math.floor(s.age / 5) * 5;
            const label = `${group}-${group + 4}`;
            counts[label] = (counts[label] || 0) + 1;
        });
        const labels = Object.keys(counts).sort((a, b) => parseInt(a) - parseInt(b));
        this._update('ageDist', labels, [{ data: labels.map(l => counts[l]) }]);
    },

    createProficiencyChart() {
        const ctx = this.getCtx('proficiencyChart');
        if (!ctx) return;
        this.charts.proficiency = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{
                data: [],
                backgroundColor: CONFIG.colors.palette
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
        this.updateProficiencyChart();
    },

    updateProficiencyChart() {
        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => {
            counts[s.english_proficiency] = (counts[s.english_proficiency] || 0) + 1;
        });
        const labels = Object.keys(counts).sort();
        this._update('proficiency', labels, [{ data: labels.map(l => counts[l]) }]);
    },

    // =========== MANAGEMENT OVERVIEW ===========

    // 1. Recruitment Sources (horizontal bar)
    createRecruitmentSourceChart() {
        const ctx = this.getCtx('recruitmentSourceChart');
        if (!ctx) return;
        this.charts.recruitmentSource = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Applicants', data: [],
                backgroundColor: CONFIG.colors.primary,
                borderRadius: 4
            }]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Number of Applicants' } },
                    y: { ticks: this._yLabelTicks(24) }
                }
            }
        });
        this.updateRecruitmentSourceChart();
    },

    updateRecruitmentSourceChart() {
        const sources = DataStore.getRecruitmentBySource();
        this._update('recruitmentSource',
            sources.map(s => s.source),
            [{ data: sources.map(s => s.count) }]
        );
    },

    // 2. Recruitment Source Effectiveness (grouped bar)
    createRecruitmentEffectivenessChart() {
        const ctx = this.getCtx('recruitmentEffectivenessChart');
        if (!ctx) return;
        this.charts.recruitmentEffectiveness = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [
                { label: 'Graduated', data: [], backgroundColor: '#6aab8e' },
                { label: 'Registered', data: [], backgroundColor: '#4b7baa' },
                { label: 'Dropped', data: [], backgroundColor: '#c05c5c' },
                { label: 'Rejected', data: [], backgroundColor: '#b0b8c1' },
                { label: 'Not Interested', data: [], backgroundColor: '#d4a843' }
            ]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                scales: {
                    x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Applicants' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24) }
                }
            }
        });
        this.updateRecruitmentEffectivenessChart();
    },

    updateRecruitmentEffectivenessChart() {
        const effectiveness = DataStore.getRecruitmentEffectiveness();
        const labels = effectiveness.map(e => e.source);
        this._update('recruitmentEffectiveness', labels, [
            { data: effectiveness.map(e => e.graduated) },
            { data: effectiveness.map(e => e.registered) },
            { data: effectiveness.map(e => e.dropped) },
            { data: effectiveness.map(e => e.rejected) },
            { data: effectiveness.map(e => e.notInterested) }
        ]);
    },

    // 3. Offer Conversion Funnel (horizontal bar)
    createOfferFunnelChart() {
        const ctx = this.getCtx('offerFunnelChart');
        if (!ctx) return;
        this.charts.offerFunnel = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Count', data: [],
                backgroundColor: [
                    '#4b7baa', '#c05c5c', '#d4a843',
                    '#8b7eb8', '#5a9e8f', '#6b8db5',
                    '#6aab8e', '#c5885a'
                ]
            }]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    y: { ticks: this._yLabelTicks(24) }
                }
            }
        });
        this.updateOfferFunnelChart();
    },

    updateOfferFunnelChart() {
        const funnel = DataStore.getOfferFunnel();
        const labels = [
            'Total Applicants',
            'Rejected',
            'Not Interested',
            'Offers Given',
            'Conditional Offers',
            'Unconditional Offers',
            'Registered Students',
            'Graduated'
        ];
        const data = [
            funnel.total,
            funnel.rejected,
            funnel.notInterested,
            funnel.offersGiven,
            funnel.conditional,
            funnel.unconditional,
            funnel.registered,
            funnel.graduated
        ];
        this._update('offerFunnel', labels, [{ data }]);
    },

    // 4. Degree Classification by Programme (stacked horizontal bar)
    createClassificationByProgChart() {
        const ctx = this.getCtx('classificationByProgChart');
        if (!ctx) return;
        const bandColors = {
            'First': '#4b7baa',
            'Upper Second': '#5a9e8f',
            'Lower Second': '#d4a843',
            'Third': '#c5885a',
            'Fail': '#c05c5c'
        };
        const bands = ['First', 'Upper Second', 'Lower Second', 'Third', 'Fail'];
        this.charts.classificationByProg = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: bands.map(band => ({
                    label: band,
                    data: [],
                    backgroundColor: bandColors[band],
                    borderRadius: 2
                }))
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.chart.data.datasets.reduce((sum, ds) => sum + (ds.data[ctx.dataIndex] || 0), 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.dataset.label}: ${ctx.raw} (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Graduates' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24, true) }
                }
            }
        });
        this.updateClassificationByProgChart();
    },

    updateClassificationByProgChart() {
        const result = DataStore.getClassificationByProgramme();
        this.charts.classificationByProg.data.labels = result.programmes;
        result.bands.forEach((band, i) => {
            this.charts.classificationByProg.data.datasets[i].data =
                result.programmes.map(p => result.data[p][band] || 0);
        });
        this.charts.classificationByProg.update();
    },

    // 5. Attendance Risk Overview (doughnut)
    createAttendanceRiskChart() {
        const ctx = this.getCtx('attendanceRiskChart');
        if (!ctx) return;
        this.charts.attendanceRisk = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{
                data: [],
                backgroundColor: ['#6aab8e', '#d4a843', '#c05c5c', '#b0b8c1']
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
        this.updateAttendanceRiskChart();
    },

    updateAttendanceRiskChart() {
        const counts = DataStore.getAttendanceRiskOverview();
        // Order: Good, Warning, Concern, then any others
        const order = ['Good', 'Warning', 'Concern'];
        const orderedLabels = order.filter(k => counts[k] != null);
        Object.keys(counts).forEach(k => { if (!orderedLabels.includes(k)) orderedLabels.push(k); });
        this._update('attendanceRisk', orderedLabels, [{ data: orderedLabels.map(l => counts[l] || 0) }]);
    },

    // 6. Education System Performance (horizontal bar)
    createEducationPerformanceChart() {
        const ctx = this.getCtx('educationPerformanceChart');
        if (!ctx) return;
        this.charts.educationPerformance = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Average GPA', data: [],
                backgroundColor: CONFIG.colors.palette
            }]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Avg GPA: ${ctx.raw} (n=${DataStore.getEducationSystemPerformance()[ctx.dataIndex]?.count || '?'})`
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, max: 22, title: { display: true, text: 'Average GPA (0-22)' } },
                    y: { ticks: this._yLabelTicks(20) }
                }
            }
        });
        this.updateEducationPerformanceChart();
    },

    updateEducationPerformanceChart() {
        const systems = DataStore.getEducationSystemPerformance();
        this._update('educationPerformance',
            systems.map(s => s.system),
            [{ data: systems.map(s => s.avgGPA) }]
        );
    },

    // 7. New vs Returning Students (stacked bar)
    createNewReturningChart() {
        const ctx = this.getCtx('newReturningChart');
        if (!ctx) return;
        this.charts.newReturning = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [
                { label: 'New Students', data: [], backgroundColor: '#4b7baa' },
                { label: 'Returning Students', data: [], backgroundColor: '#5a9e8f' }
            ]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: {
                        callbacks: {
                            afterBody: (items) => {
                                const idx = items[0].dataIndex;
                                const data = DataStore.getNewVsReturningByYear()[idx];
                                if (!data) return '';
                                return `Total: ${data.total}`;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, title: { display: true, text: 'Academic Year', font: { size: 11 } } },
                    y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Students', font: { size: 11 } } }
                }
            }
        });
        this.updateNewReturningChart();
    },

    updateNewReturningChart() {
        const data = DataStore.getNewVsReturningByYear();
        this._update('newReturning',
            data.map(d => d.year),
            [
                { data: data.map(d => d.new) },
                { data: data.map(d => d.returning) }
            ]
        );
    }
};
