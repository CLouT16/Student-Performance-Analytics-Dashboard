// Global Chart.js defaults — Lectures 5-7: reduce clutter, consistent styling
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.font.size = 11;
Chart.defaults.color = '#6b7280';
Chart.defaults.scale.grid.color = 'rgba(0,0,0,0.06)';
Chart.defaults.scale.border.display = false;
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.legend.labels.font = { size: 10 };

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
        this.createCohortCompletionChart();
        this.createGenderDistChart();
        this.createNationalityChart();
        this.createAgeDistChart();
        this.createProficiencyChart();
        // Plotly charts
        this.createSankeyChart();
        this.createSunburstChart();
        // Additional Chart.js
        this.createProgrammeComparisonChart();
        this.createCoursePassRateChart();
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
        this.updateCohortCompletionChart();
        this.updateGenderDistChart();
        this.updateNationalityChart();
        this.updateAgeDistChart();
        this.updateProficiencyChart();
        // Plotly charts
        this.updateSankeyChart();
        this.updateSunburstChart();
        // Additional Chart.js
        this.updateProgrammeComparisonChart();
        this.updateCoursePassRateChart();
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
                plugins: { legend: { display: false } },
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
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Students',
                data: [],
                backgroundColor: ['#4b7baa', '#5a9e8f', '#8b7eb8', '#c5885a', '#6aab8e', '#b56e8a']
            }]},
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.raw.toLocaleString()} students (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    y: { ticks: { font: { size: 11 } } }
                }
            }
        });
        this.updateEnrollmentBySchoolChart();
    },

    updateEnrollmentBySchoolChart() {
        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => { counts[s.school] = (counts[s.school] || 0) + 1; });
        // Lecture 7: sort bars by value for visual regularity
        const schools = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
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

    updateGPADistributionChart(mode) {
        if (mode !== undefined) this._gpaDistMode = mode;
        const currentMode = this._gpaDistMode || 'absolute';
        const chart = this.charts.gpaDistribution;
        if (!chart) return;

        if (currentMode === 'absolute') {
            // Original bar chart of classification counts
            const data = DataStore.getData();
            const counts = {};
            CONFIG.classificationOrder.forEach(c => { counts[c] = 0; });
            data.classifications.forEach(c => {
                if (counts[c.classification] !== undefined) counts[c.classification]++;
            });

            // Reset to vertical bar
            chart.config.type = 'bar';
            chart.options.indexAxis = 'x';
            chart.options.scales = {
                y: { beginAtZero: true, stacked: false, title: { display: true, text: 'Number of Graduates' } },
                x: { stacked: false, title: { display: true, text: 'Degree Classification' }, ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 30 } }
            };
            chart.options.plugins.legend = { display: false };
            chart.data.labels = CONFIG.classificationLabels;
            chart.data.datasets = [{
                label: 'Number of Graduates',
                data: CONFIG.classificationOrder.map(c => counts[c]),
                backgroundColor: CONFIG.classificationColors,
                borderRadius: 4
            }];
            chart.update();
        } else {
            // byProgramme or normalized — stacked horizontal bar
            const result = DataStore.getClassificationByProgramme();
            const bandColors = {
                'First': '#1a5276', 'Upper Second': '#4b7baa',
                'Lower Second': '#d4a843', 'Third': '#c5885a', 'Fail': '#c27c7c'
            };
            const isNorm = currentMode === 'normalized';

            chart.config.type = 'bar';
            chart.options.indexAxis = 'y';
            chart.options.plugins.legend = { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } };

            const programmes = result.programmes;
            chart.data.labels = programmes;

            if (isNorm) {
                const totals = programmes.map(p =>
                    result.bands.reduce((sum, band) => sum + (result.data[p][band] || 0), 0)
                );
                chart.data.datasets = result.bands.map(band => ({
                    label: band,
                    data: programmes.map((p, j) => totals[j] > 0 ? parseFloat(((result.data[p][band] || 0) / totals[j] * 100).toFixed(1)) : 0),
                    backgroundColor: bandColors[band],
                    borderRadius: 2
                }));
                chart.options.scales = {
                    x: { stacked: true, beginAtZero: true, max: 100, title: { display: true, text: 'Percentage (%)' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24, true) }
                };
            } else {
                chart.data.datasets = result.bands.map(band => ({
                    label: band,
                    data: programmes.map(p => result.data[p][band] || 0),
                    backgroundColor: bandColors[band],
                    borderRadius: 2
                }));
                chart.options.scales = {
                    x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Graduates' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24, true) }
                };
            }
            chart.update();
        }
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

    updatePassFailSchoolChart(normalized) {
        if (normalized !== undefined) this._passRateNormalized = normalized;
        const isNorm = this._passRateNormalized !== undefined ? this._passRateNormalized : true;

        const data = DataStore.getData();
        const stats = {};
        data.courseResults.forEach(g => {
            const student = DataLoader.studentIndex.get(g.student_id);
            const programme = student ? student.programme : 'Unknown';
            if (!stats[programme]) stats[programme] = { passed: 0, total: 0 };
            stats[programme].total++;
            if (g.is_passed) stats[programme].passed++;
        });
        const chart = this.charts.passRate;
        if (!chart) return;

        const programmes = Object.keys(stats).sort();

        if (isNorm) {
            const passRates = programmes.map(p => ((stats[p].passed / stats[p].total) * 100).toFixed(1));
            const failRates = programmes.map(p => (((stats[p].total - stats[p].passed) / stats[p].total) * 100).toFixed(1));
            chart.data.labels = programmes;
            chart.data.datasets[0].data = passRates;
            chart.data.datasets[1].data = failRates;
            chart.options.scales.x.max = 100;
            chart.options.scales.x.title.text = 'Percentage (%)';
            // Update tooltip to show count context
            chart.options.plugins.tooltip.callbacks.label = (ctx) => {
                const prog = ctx.label;
                const s = stats[prog];
                const count = ctx.datasetIndex === 0 ? s.passed : (s.total - s.passed);
                return `${ctx.dataset.label}: ${ctx.raw}% (n=${count})`;
            };
        } else {
            const passCounts = programmes.map(p => stats[p].passed);
            const failCounts = programmes.map(p => stats[p].total - stats[p].passed);
            chart.data.labels = programmes;
            chart.data.datasets[0].data = passCounts;
            chart.data.datasets[1].data = failCounts;
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.title.text = 'Number of Results';
            chart.options.plugins.tooltip.callbacks.label = (ctx) => {
                const prog = ctx.label;
                const s = stats[prog];
                const pct = ctx.datasetIndex === 0
                    ? ((s.passed / s.total) * 100).toFixed(1)
                    : (((s.total - s.passed) / s.total) * 100).toFixed(1);
                return `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
            };
        }

        chart.update();
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
                plugins: { legend: { display: false } },
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

        // Plugin: draw vertical pass/fail divider line
        const passFailDivider = {
            id: 'passFailDivider',
            afterDraw(chart) {
                const labels = chart.data.labels;
                // First grade that is NOT a pass
                const firstFailIdx = labels.findIndex(l => !CONFIG.isPass(l));
                if (firstFailIdx <= 0) return;

                const xScale = chart.scales.x;
                const yScale = chart.scales.y;
                // Position between last pass bar and first fail bar
                const x = (xScale.getPixelForValue(firstFailIdx - 1) + xScale.getPixelForValue(firstFailIdx)) / 2;

                const ctxDraw = chart.ctx;
                ctxDraw.save();
                ctxDraw.beginPath();
                ctxDraw.setLineDash([4, 3]);
                ctxDraw.strokeStyle = '#9ca3af';
                ctxDraw.lineWidth = 1.5;
                ctxDraw.moveTo(x, yScale.top);
                ctxDraw.lineTo(x, yScale.bottom);
                ctxDraw.stroke();

                // Labels with background for readability
                const labelY = yScale.top - 6;
                ctxDraw.font = '10px Inter, sans-serif';

                // "Pass" label — right-aligned before divider
                ctxDraw.textAlign = 'right';
                const passWidth = ctxDraw.measureText('Pass').width;
                ctxDraw.fillStyle = 'rgba(255,255,255,0.8)';
                ctxDraw.fillRect(x - 8 - passWidth - 2, labelY - 9, passWidth + 4, 12);
                ctxDraw.fillStyle = '#6b7280';
                ctxDraw.fillText('Pass', x - 8, labelY);

                // "Fail" label — left-aligned after divider
                ctxDraw.textAlign = 'left';
                const failWidth = ctxDraw.measureText('Fail').width;
                ctxDraw.fillStyle = 'rgba(255,255,255,0.8)';
                ctxDraw.fillRect(x + 8 - 2, labelY - 9, failWidth + 4, 12);
                ctxDraw.fillStyle = '#c27c7c';
                ctxDraw.fillText('Fail', x + 8, labelY);
                ctxDraw.restore();
            }
        };

        this.charts.gradeDist = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Number of Grades', data: [],
                backgroundColor: [],
                borderRadius: 3
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                layout: { padding: { top: 20 } },
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Frequency' } },
                    x: { title: { display: true, text: 'CGS Grade' }, ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 30 } }
                }
            },
            plugins: [passFailDivider]
        });
        this.updateGradeDistributionChart();
    },

    updateGradeDistributionChart() {
        const data = DataStore.getData();
        const gradeCounts = {};
        data.courseResults.forEach(g => {
            gradeCounts[g.overall_grade] = (gradeCounts[g.overall_grade] || 0) + 1;
        });
        // Show ALL CGS grades (A1 through G3) so the full scale is visible
        const grades = CONFIG.gradeOrder;
        const colors = grades.map(g => CONFIG.isPass(g) ? '#4b7baa' : '#c27c7c');
        this._update('gradeDist', grades, [{ data: grades.map(g => gradeCounts[g] || 0), backgroundColor: colors }]);
    },

    // =========== COMPARISON ===========

    createCompletionRatesChart() {
        const ctx = this.getCtx('completionRatesChart');
        if (!ctx) return;

        // Custom plugin: draw percentage labels on bars + average line
        const completionLabels = {
            id: 'completionLabels',
            afterDraw(chart) {
                const ctxDraw = chart.ctx;
                const ds = chart.data.datasets[0];
                if (!ds || !ds.data.length) return;

                const avg = ds.data.reduce((a, b) => a + parseFloat(b), 0) / ds.data.length;
                const xScale = chart.scales.x;
                const yScale = chart.scales.y;

                // Average dashed line
                const xAvg = xScale.getPixelForValue(avg);
                if (xAvg < chart.chartArea.left || xAvg > chart.chartArea.right) { ctxDraw.restore?.(); }
                else {
                    ctxDraw.save();
                    ctxDraw.beginPath();
                    ctxDraw.setLineDash([4, 3]);
                    ctxDraw.strokeStyle = '#6b7280';
                    ctxDraw.lineWidth = 1.5;
                    ctxDraw.moveTo(xAvg, yScale.top);
                    ctxDraw.lineTo(xAvg, yScale.bottom);
                    ctxDraw.stroke();
                    ctxDraw.fillStyle = '#6b7280';
                    ctxDraw.font = '10px Inter, sans-serif';
                    ctxDraw.textAlign = 'center';
                    ctxDraw.fillText(`Avg ${avg.toFixed(1)}%`, xAvg, yScale.top - 6);
                    ctxDraw.restore();
                }

                // Percentage labels on bars
                ctxDraw.save();
                ctxDraw.font = 'bold 11px Inter, sans-serif';
                ctxDraw.textBaseline = 'middle';
                const meta = chart.getDatasetMeta(0);
                meta.data.forEach((bar, i) => {
                    const val = parseFloat(ds.data[i]);
                    ctxDraw.fillStyle = val >= 40 ? '#ffffff' : '#374151';
                    ctxDraw.textAlign = val >= 40 ? 'right' : 'left';
                    const x = val >= 40 ? bar.x - 6 : bar.x + 4;
                    ctxDraw.fillText(val + '%', x, bar.y);
                });
                ctxDraw.restore();
            }
        };

        this.charts.completionRates = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Completion Rate (%)', data: [],
                backgroundColor: [],
                borderRadius: 3
            }]},
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                layout: { padding: { top: 20 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                return `Completion Rate: ${ctx.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, max: 100, title: { display: true, text: 'Completion Rate (%)' } },
                    y: { ticks: this._yLabelTicks(24, true) }
                }
            },
            plugins: [completionLabels]
        });
        this.updateCompletionRatesChart();
    },

    updateCompletionRatesChart() {
        const data = DataStore.getData();
        const allYears = DataStore.getAcademicYears();
        if (allYears.length < 4) return;
        const latestStartYear = parseInt(allYears[allYears.length - 1].split('/')[0]);

        const progData = {};
        const eligibleIds = new Set();
        data.students.forEach(s => {
            const entryStartYear = parseInt((s.entry_year || '').split('/')[0]);
            if (isNaN(entryStartYear) || (latestStartYear - entryStartYear) < 4) return;
            if (!progData[s.programme]) progData[s.programme] = { eligible: 0, completed: 0 };
            progData[s.programme].eligible++;
            eligibleIds.add(s.student_id);
        });
        data.classifications.forEach(c => {
            if (progData[c.programme] && eligibleIds.has(c.student_id)) progData[c.programme].completed++;
        });

        const programmes = Object.keys(progData).filter(p => progData[p].eligible > 0).sort();
        const rates = programmes.map(p =>
            parseFloat(((progData[p].completed / progData[p].eligible) * 100).toFixed(1))
        );
        // Lecture 6: blue >=70%, amber 50-70%, pastel red <50% (colour-blind friendly)
        const colors = rates.map(r => r >= 70 ? '#4b7baa' : (r >= 50 ? '#d4a843' : '#c27c7c'));

        const chart = this.charts.completionRates;
        if (!chart) return;
        chart.data.labels = programmes;
        chart.data.datasets[0].data = rates;
        chart.data.datasets[0].backgroundColor = colors;
        chart.update();
    },

    createPerformanceMatrixChart() {
        const ctx = this.getCtx('performanceMatrixChart');
        if (!ctx) return;
        // Lecture 6: blue-to-red spectrum (colour-blind friendly)
        const bandColors = {
            'A (Excellent)': '#1a5276',
            'B (Very Good)': '#2e86c1',
            'C (Good)': '#5dade2',
            'D (Pass)': '#d4a843',
            'E-F (Marginal Fail)': '#b58070',
            'G (Clear Fail)': '#c27c7c'
        };
        const bands = Object.keys(bandColors);
        this.charts.performanceMatrix = new Chart(ctx, {
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
                                return `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Course Results' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24, true) }
                }
            }
        });
        this.updatePerformanceMatrixChart();
    },

    // Programme filter state for performance matrix
    _perfMatrixProgFilter: null,

    _buildPerfMatrixProgFilter() {
        const container = document.getElementById('perfMatrixProgFilter');
        if (!container || container.children.length > 0) return;
        const programmes = DataStore.getProgrammes();
        let html = '<select class="chart-prog-select"><option value="all">All Programmes</option>';
        programmes.forEach(p => {
            html += `<option value="${p}">${p}</option>`;
        });
        html += '</select>';
        container.innerHTML = html;

        container.querySelector('select').addEventListener('change', (e) => {
            const val = e.target.value;
            this._perfMatrixProgFilter = val === 'all' ? null : val;
            this.updatePerformanceMatrixChart();
        });
    },

    updatePerformanceMatrixChart(normalized) {
        const result = DataStore.getGradeBandByProgramme();
        const chart = this.charts.performanceMatrix;
        if (!chart) return;

        this._buildPerfMatrixProgFilter();

        if (normalized !== undefined) this._perfMatrixNormalized = normalized;
        const isNorm = this._perfMatrixNormalized || false;

        let programmes = result.programmes;
        if (this._perfMatrixProgFilter) {
            programmes = programmes.filter(p => p === this._perfMatrixProgFilter);
        }

        chart.data.labels = programmes;

        if (isNorm) {
            const totals = programmes.map(p =>
                result.bands.reduce((sum, band) => sum + (result.data[p][band] || 0), 0)
            );
            result.bands.forEach((band, i) => {
                chart.data.datasets[i].data = programmes.map((p, j) =>
                    totals[j] > 0 ? parseFloat(((result.data[p][band] || 0) / totals[j] * 100).toFixed(1)) : 0
                );
            });
            chart.options.scales.x.max = 100;
            chart.options.scales.x.title.text = 'Percentage (%)';
        } else {
            result.bands.forEach((band, i) => {
                chart.data.datasets[i].data = programmes.map(p => result.data[p][band] || 0);
            });
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.title.text = 'Number of Course Results';
        }
        chart.update();
    },

    // =========== RETENTION ===========

    createRetentionRateChart() {
        const ctx = this.getCtx('retentionRateChart');
        if (!ctx) return;
        this.charts.retentionRate = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [
                {
                    label: 'Retained', data: [],
                    backgroundColor: '#4b7baa',
                    borderRadius: 4,
                    borderSkipped: false
                },
                {
                    label: 'Attrition', data: [],
                    backgroundColor: '#c27c7c',
                    borderRadius: 4,
                    borderSkipped: false
                }
            ]},
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                layout: { padding: { right: 10 } },
                plugins: {
                    legend: {
                        display: true, position: 'top',
                        labels: {
                            boxWidth: 14, boxHeight: 14, borderRadius: 3,
                            useBorderRadius: true,
                            font: { size: 11, weight: '500' },
                            padding: 16
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30,58,95,0.95)',
                        titleFont: { size: 12, weight: '600' },
                        bodyFont: { size: 11 },
                        cornerRadius: 8,
                        padding: 10,
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true, beginAtZero: true, max: 100,
                        title: { display: true, text: 'Rate (%)', font: { size: 11 } },
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: { callback: (v) => v + '%' }
                    },
                    y: {
                        stacked: true,
                        ticks: this._yLabelTicks(24, true),
                        grid: { display: false }
                    }
                }
            }
        });
        this.updateRetentionRateChart('all');
    },

    updateRetentionRateChart(modeOrYear) {
        if (modeOrYear === 'normalized') {
            this._retentionNormalized = true;
        } else if (modeOrYear === 'all' || modeOrYear === 'absolute') {
            this._retentionNormalized = false;
        }
        const isNorm = this._retentionNormalized || false;
        const counts = DataStore.getRetentionAttritionCounts();
        const programmes = Object.keys(counts).sort();
        const chart = this.charts.retentionRate;
        if (!chart) return;

        if (isNorm) {
            // 100% stacked — retained + dropped as % of total
            chart.data.labels = programmes;
            chart.data.datasets[0].data = programmes.map(p => {
                const t = counts[p].retained + counts[p].dropped;
                return t > 0 ? parseFloat((counts[p].retained / t * 100).toFixed(1)) : 0;
            });
            chart.data.datasets[1].data = programmes.map(p => {
                const t = counts[p].retained + counts[p].dropped;
                return t > 0 ? parseFloat((counts[p].dropped / t * 100).toFixed(1)) : 0;
            });
            chart.options.scales.x.max = 100;
            chart.options.scales.x.stacked = true;
            chart.options.scales.y.stacked = true;
            chart.options.scales.x.title.text = 'Percentage (%)';
            chart.options.scales.x.ticks = { callback: (v) => v + '%' };
            chart.options.plugins.tooltip.callbacks.label = (ctx) => {
                const prog = ctx.label;
                const c = counts[prog];
                const count = ctx.datasetIndex === 0 ? c.retained : c.dropped;
                return ` ${ctx.dataset.label}: ${ctx.raw}% (n=${count})`;
            };
        } else {
            // Count mode — actual student numbers
            chart.data.labels = programmes;
            chart.data.datasets[0].data = programmes.map(p => counts[p].retained);
            chart.data.datasets[1].data = programmes.map(p => counts[p].dropped);
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.stacked = true;
            chart.options.scales.y.stacked = true;
            chart.options.scales.x.title.text = 'Number of Students';
            chart.options.scales.x.ticks = {};
            chart.options.plugins.tooltip.callbacks.label = (ctx) => {
                const prog = ctx.label;
                const c = counts[prog];
                const total = c.retained + c.dropped;
                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
            };
        }
        chart.update();
    },

    createCohortCompletionChart() {
        const ctx = this.getCtx('cohortCompletionChart');
        if (!ctx) return;
        this.charts.cohortCompletion = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [
                { label: 'Graduated', data: [], backgroundColor: '#4b7baa', borderRadius: 2 },
                { label: 'Dropped', data: [], backgroundColor: '#c27c7c', borderRadius: 2 },
                { label: 'Active', data: [], backgroundColor: '#b0b8c1', borderRadius: 2 }
            ]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            afterBody: (items) => {
                                const idx = items[0].dataIndex;
                                const datasets = items[0].chart.data.datasets;
                                const total = datasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0);
                                const grad = datasets[0].data[idx] || 0;
                                const pct = total > 0 ? ((grad / total) * 100).toFixed(1) : 0;
                                return `Completion Rate: ${pct}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, title: { display: true, text: 'Entry Cohort' } },
                    y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Students' } }
                }
            }
        });
        this.updateCohortCompletionChart();
    },

    updateCohortCompletionChart(normalized) {
        if (normalized !== undefined) this._cohortNormalized = normalized;
        const isNorm = this._cohortNormalized || false;
        const chart = this.charts.cohortCompletion;
        if (!chart) return;

        const data = DataStore.getData();
        // Group students by entry year with outcome breakdown
        const cohorts = {};
        data.students.forEach(s => {
            if (!s.entry_year) return;
            if (!cohorts[s.entry_year]) cohorts[s.entry_year] = { graduated: 0, dropped: 0, active: 0 };
            if (s.status === 'Dropped') cohorts[s.entry_year].dropped++;
            else cohorts[s.entry_year].active++;
        });
        // Mark graduated students
        const graduatedIds = new Set();
        data.classifications.forEach(c => {
            if (c.graduation_status === 'Graduated') {
                graduatedIds.add(c.student_id);
            }
        });
        // Move graduated from active to graduated
        data.students.forEach(s => {
            if (!s.entry_year || !cohorts[s.entry_year]) return;
            if (graduatedIds.has(s.student_id) && s.status !== 'Dropped') {
                cohorts[s.entry_year].active--;
                cohorts[s.entry_year].graduated++;
            }
        });

        // Show all cohorts that have at least 1 graduated student
        const cohortYears = Object.keys(cohorts).sort().filter(y => {
            return cohorts[y].graduated > 0;
        });

        if (isNorm) {
            chart.data.labels = cohortYears;
            const totals = cohortYears.map(y => cohorts[y].graduated + cohorts[y].dropped + cohorts[y].active);
            chart.data.datasets[0].data = cohortYears.map((y, i) => totals[i] > 0 ? parseFloat((cohorts[y].graduated / totals[i] * 100).toFixed(1)) : 0);
            chart.data.datasets[1].data = cohortYears.map((y, i) => totals[i] > 0 ? parseFloat((cohorts[y].dropped / totals[i] * 100).toFixed(1)) : 0);
            chart.data.datasets[2].data = cohortYears.map((y, i) => totals[i] > 0 ? parseFloat((cohorts[y].active / totals[i] * 100).toFixed(1)) : 0);
            chart.options.scales.y.max = 100;
            chart.options.scales.y.title.text = 'Percentage (%)';
        } else {
            chart.data.labels = cohortYears;
            chart.data.datasets[0].data = cohortYears.map(y => cohorts[y].graduated);
            chart.data.datasets[1].data = cohortYears.map(y => cohorts[y].dropped);
            chart.data.datasets[2].data = cohortYears.map(y => cohorts[y].active);
            chart.options.scales.y.max = undefined;
            chart.options.scales.y.title.text = 'Number of Students';
        }
        chart.update();
    },

    // =========== DEMOGRAPHICS ===========

    // Centre text plugin for doughnut
    _genderCentreTextPlugin: {
        id: 'genderCentreText',
        afterDraw(chart) {
            if (chart.config.type !== 'doughnut') return;
            const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            if (!total) return;
            const { ctx, chartArea: { left, right, top, bottom } } = chart;
            const cx = (left + right) / 2;
            const cy = (top + bottom) / 2;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.fillText(total.toLocaleString(), cx, cy - 6);
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#9ca3af';
            ctx.fillText('Total', cx, cy + 12);
            ctx.restore();
        }
    },

    createGenderDistChart() {
        const ctx = this.getCtx('genderDistChart');
        if (!ctx) return;
        this.charts.genderDist = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{
                label: 'Students',
                data: [],
                backgroundColor: ['#4b7baa', '#5a9e8f', '#d4a843', '#b56e8a'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]},
            options: {
                responsive: true, maintainAspectRatio: true,
                cutout: '55%',
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
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
            },
            plugins: [this._genderCentreTextPlugin]
        });
        this.updateGenderDistChart();
    },

    updateGenderDistChart(normalized) {
        if (normalized !== undefined) this._genderNormalized = normalized;
        const isNorm = this._genderNormalized || false;
        const chart = this.charts.genderDist;
        if (!chart) return;

        const data = DataStore.getData();
        const counts = {};
        data.students.forEach(s => { counts[s.gender] = (counts[s.gender] || 0) + 1; });
        const labels = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
        const total = labels.reduce((sum, l) => sum + counts[l], 0);

        chart.data.labels = labels;
        if (isNorm) {
            chart.data.datasets[0].data = labels.map(l => total > 0 ? parseFloat((counts[l] / total * 100).toFixed(1)) : 0);
        } else {
            chart.data.datasets[0].data = labels.map(l => counts[l]);
        }
        chart.update();
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

    _proficiencyNormalized: false,

    createProficiencyChart() {
        const ctx = this.getCtx('proficiencyChart');
        if (!ctx) return;
        // Lecture 6: blue-to-red spectrum (colour-blind friendly)
        const profColors = {
            'Advanced': '#1a5276', 'Proficient': '#4b7baa', 'Intermediate': '#d4a843',
            'Basic': '#b58070', 'Beginner': '#c27c7c'
        };
        this.charts.proficiency = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                if (this._proficiencyNormalized) {
                                    return `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`;
                                }
                                const total = ctx.chart.data.datasets.reduce((sum, ds) => sum + (ds.data[ctx.dataIndex] || 0), 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24, true) }
                }
            }
        });
        this._proficiencyColors = profColors;
        this.updateProficiencyChart();
    },

    updateProficiencyChart(normalized) {
        if (normalized !== undefined) this._proficiencyNormalized = normalized;
        const result = DataStore.getProficiencyByProgramme();
        const chart = this.charts.proficiency;
        if (!chart) return;

        chart.data.labels = result.programmes;

        const rawDatasets = result.levels.map(level => ({
            label: level,
            data: result.programmes.map(p => (result.data[p] && result.data[p][level]) || 0),
            backgroundColor: this._proficiencyColors[level] || '#8b7eb8',
            borderRadius: 2
        }));

        if (this._proficiencyNormalized) {
            const totals = result.programmes.map((_, j) => rawDatasets.reduce((sum, ds) => sum + ds.data[j], 0));
            chart.data.datasets = rawDatasets.map(ds => ({
                ...ds,
                data: ds.data.map((v, j) => totals[j] > 0 ? (v / totals[j]) * 100 : 0)
            }));
            chart.options.scales.x.max = 100;
            chart.options.scales.x.title.text = '% of Students';
        } else {
            chart.data.datasets = rawDatasets;
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.title.text = 'Number of Students';
        }
        chart.update();
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
                { label: 'Graduated', data: [], backgroundColor: '#4b7baa' },
                { label: 'Registered', data: [], backgroundColor: '#5dade2' },
                { label: 'Dropped', data: [], backgroundColor: '#c27c7c' },
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

    updateRecruitmentEffectivenessChart(normalized) {
        const effectiveness = DataStore.getRecruitmentEffectiveness();
        const chart = this.charts.recruitmentEffectiveness;
        if (!chart) return;
        const labels = effectiveness.map(e => e.source);

        const rawData = [
            effectiveness.map(e => e.graduated),
            effectiveness.map(e => e.registered),
            effectiveness.map(e => e.dropped),
            effectiveness.map(e => e.rejected),
            effectiveness.map(e => e.notInterested)
        ];

        if (normalized) {
            const totals = labels.map((_, j) => rawData.reduce((sum, ds) => sum + ds[j], 0));
            chart.data.labels = labels;
            rawData.forEach((ds, i) => {
                chart.data.datasets[i].data = ds.map((v, j) =>
                    totals[j] > 0 ? parseFloat((v / totals[j] * 100).toFixed(1)) : 0
                );
            });
            chart.options.scales.x.max = 100;
            chart.options.scales.x.title.text = 'Percentage (%)';
        } else {
            chart.data.labels = labels;
            rawData.forEach((ds, i) => {
                chart.data.datasets[i].data = ds;
            });
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.title.text = 'Applicants';
        }
        chart.update();
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
                    '#4b7baa', '#c27c7c', '#d4a843',
                    '#8b7eb8', '#5dade2', '#6b8db5',
                    '#5a9e8f', '#c5885a'
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
            'Registered Students',
            'Graduated'
        ];
        const data = [
            funnel.total,
            funnel.rejected,
            funnel.notInterested,
            funnel.registered,
            funnel.graduated
        ];
        this._update('offerFunnel', labels, [{ data }]);
    },

    // 4. Degree Classification by Programme (stacked horizontal bar)
    createClassificationByProgChart() {
        const ctx = this.getCtx('classificationByProgChart');
        if (!ctx) return;
        // Lecture 6: blue-to-red (colour-blind friendly)
        const bandColors = {
            'First': '#1a5276',
            'Upper Second': '#4b7baa',
            'Lower Second': '#d4a843',
            'Third': '#c5885a',
            'Fail': '#c27c7c'
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

    // Programme filter state for classification chart
    _classificationProgFilter: null,

    // Populate programme filter buttons dynamically
    _buildClassificationProgFilter() {
        const container = document.getElementById('classificationProgFilter');
        if (!container || container.children.length > 0) return;
        const programmes = DataStore.getProgrammes();
        let html = '<select class="chart-prog-select"><option value="all">All Programmes</option>';
        programmes.forEach(p => {
            html += `<option value="${p}">${p}</option>`;
        });
        html += '</select>';
        container.innerHTML = html;

        container.querySelector('select').addEventListener('change', (e) => {
            const val = e.target.value;
            this._classificationProgFilter = val === 'all' ? null : val;
            this.updateClassificationByProgChart();
        });
    },

    updateClassificationByProgChart(normalized) {
        const result = DataStore.getClassificationByProgramme();
        const chart = this.charts.classificationByProg;
        if (!chart) return;

        // Build programme filter buttons on first call
        this._buildClassificationProgFilter();

        // Store normalized state if passed
        if (normalized !== undefined) this._classificationNormalized = normalized;
        const isNorm = this._classificationNormalized || false;

        // Filter to selected programme if set
        let programmes = result.programmes;
        if (this._classificationProgFilter) {
            programmes = programmes.filter(p => p === this._classificationProgFilter);
        }

        chart.data.labels = programmes;

        if (isNorm) {
            const totals = programmes.map(p =>
                result.bands.reduce((sum, band) => sum + (result.data[p][band] || 0), 0)
            );
            result.bands.forEach((band, i) => {
                chart.data.datasets[i].data = programmes.map((p, j) =>
                    totals[j] > 0 ? parseFloat(((result.data[p][band] || 0) / totals[j] * 100).toFixed(1)) : 0
                );
            });
            chart.options.scales.x.max = 100;
            chart.options.scales.x.title.text = 'Percentage (%)';
        } else {
            result.bands.forEach((band, i) => {
                chart.data.datasets[i].data = programmes.map(p => result.data[p][band] || 0);
            });
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.title.text = 'Number of Graduates';
        }
        chart.update();
    },

    // 5. Attendance Risk Overview (horizontal bar)
    createAttendanceRiskChart() {
        const ctx = this.getCtx('attendanceRiskChart');
        if (!ctx) return;
        this.charts.attendanceRisk = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Students',
                data: [],
                backgroundColor: ['#4b7baa', '#d4a843', '#c27c7c', '#b0b8c1']
            }]},
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.raw.toLocaleString()} students (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
                    y: { ticks: { font: { size: 11 } } }
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

    // 6. Education System — Student Count (horizontal bar)
    createEducationPerformanceChart() {
        const ctx = this.getCtx('educationPerformanceChart');
        if (!ctx) return;
        this.charts.educationPerformance = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [{
                label: 'Number of Students', data: [],
                backgroundColor: CONFIG.colors.palette
            }]},
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.raw.toLocaleString()} students (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Number of Students' } },
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
            [{ data: systems.map(s => s.count) }]
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
    },

    // =========== SANKEY (Plotly) ===========

    createSankeyChart() {
        const el = document.getElementById('sankeyChart');
        if (!el) return;
        this.updateSankeyChart();
    },

    updateSankeyChart() {
        const el = document.getElementById('sankeyChart');
        if (!el) return;
        const sankey = DataStore.getSankeyData();
        // Lecture 6: colour-blind friendly — no red+green pairs
        const nodeColors = ['#4b7baa', '#c27c7c', '#d4a843', '#5a9e8f', '#2e86c1', '#b56e8a', '#6b8db5'];
        const linkColors = ['rgba(194,124,124,0.35)', 'rgba(212,168,67,0.35)', 'rgba(90,158,143,0.35)',
                            'rgba(46,134,193,0.35)', 'rgba(181,110,138,0.35)', 'rgba(107,141,181,0.35)'];

        // Nodes: Applicants(0), Rejected(1), Not Interested(2), Registered(3), Graduated(4), Dropped(5), Active(6)
        // Left: Applicants | Middle: Registered | Right: all final outcomes (gap between non-enrolled and enrolled outcomes)
        const trace = {
            type: 'sankey',
            orientation: 'h',
            arrangement: 'fixed',
            node: {
                pad: 25,
                thickness: 24,
                line: { color: 'rgba(0,0,0,0.1)', width: 0.5 },
                label: sankey.nodes,
                color: nodeColors,
                x: [0.001, 0.999, 0.999, 0.5,   0.999, 0.999, 0.999],
                y: [0.35,  0.01,  0.15,  0.55,   0.50,  0.80,  0.93]
            },
            link: {
                source: sankey.links.source,
                target: sankey.links.target,
                value: sankey.links.value,
                color: linkColors
            }
        };

        const layout = {
            font: { family: 'Inter, sans-serif', size: 12, color: '#374151' },
            margin: { l: 10, r: 10, t: 10, b: 10 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
    },

    // =========== SUNBURST (Plotly) ===========

    createSunburstChart() {
        const el = document.getElementById('sunburstChart');
        if (!el) return;
        this.updateSunburstChart();
    },

    updateSunburstChart() {
        const el = document.getElementById('sunburstChart');
        if (!el) return;
        const sun = DataStore.getSunburstData();

        // Semantic color mapping for clear readability
        const schoolColors = {
            'Business': '#3b7dd8',
            'Social Science': '#2a9d8f',
            'Natural & Computing Sciences': '#7c5bbf',
            'Legal Studies': '#d4813b'
        };
        // Lecture 6: blue-to-red classification colours (colour-blind friendly)
        const classColors = {
            'First Class Honours': '#1a5276',
            'Borderline 2.1/1st': '#2471a3',
            'Upper Second Class Honours': '#4b7baa',
            'Borderline 2.2/2.1': '#7fb3d3',
            'Lower Second Class Honours': '#d4a843',
            'Borderline 3rd/2.2': '#c5885a',
            'Third Class Honours': '#b07840',
            'Borderline Fail/3rd': '#b58070',
            'Fail': '#c27c7c'
        };

        // Build color array matching each node
        const colors = sun.ids.map((id, i) => {
            const label = sun.labels[i];
            if (id === 'root') return '#d6e8f5';
            // School level — vivid saturated colors
            if (id.startsWith('S_') && !id.includes('_P_')) {
                return schoolColors[label] || '#6b8db5';
            }
            // Programme level — slightly lighter shade of parent school
            if (id.includes('_P_') && !id.includes('_C_')) {
                const schoolId = id.split('_P_')[0];
                const schoolIdx = sun.ids.indexOf(schoolId);
                const schoolLabel = schoolIdx >= 0 ? sun.labels[schoolIdx] : '';
                const base = schoolColors[schoolLabel] || '#6b8db5';
                return base + 'cc'; // Lighter but still readable
            }
            // Classification level
            if (id.includes('_C_')) {
                return classColors[label] || '#b0b8c1';
            }
            return '#b0b8c1';
        });

        // Compute total for center annotation
        const grandTotal = sun.values.length > 0 ? sun.values[0] : 0;

        // Root label: just "All Graduates" — count shown on hover
        const displayLabels = sun.labels.map((lbl, i) => {
            if (sun.ids[i] === 'root') return 'All Graduates';
            return lbl;
        });

        const trace = {
            type: 'sunburst',
            ids: sun.ids,
            labels: displayLabels,
            parents: sun.parents,
            values: sun.values,
            branchvalues: 'total',
            maxdepth: 3,
            textinfo: 'label+percent parent',
            insidetextorientation: 'horizontal',
            hoverinfo: 'label+value+percent parent',
            textfont: { size: 12, color: '#1e3a5f' },
            leaf: { opacity: 0.85 },
            marker: {
                colors,
                line: { width: 2, color: '#ffffff' }
            }
        };

        const layout = {
            font: { family: 'Inter, sans-serif', size: 11, color: '#374151' },
            margin: { l: 10, r: 10, t: 10, b: 10 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
    },

    // =========== PROGRAMME COMPARISON (Chart.js) ===========

    createProgrammeComparisonChart() {
        const ctx = this.getCtx('programmeComparisonChart');
        if (!ctx) return;
        this.charts.programmeComparison = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [
                { label: 'Avg GPA (scaled %)', data: [], backgroundColor: '#4b7baa', borderRadius: 2 },
                { label: 'Pass Rate (%)', data: [], backgroundColor: '#5a9e8f', borderRadius: 2 },
                { label: 'Completion Rate (%)', data: [], backgroundColor: '#d4a843', borderRadius: 2 },
                { label: 'Avg Attendance (%)', data: [], backgroundColor: '#8b7eb8', borderRadius: 2 }
            ]},
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                // Show the original value, not scaled
                                const comp = DataStore.getProgrammeComparison();
                                const prog = ctx.label;
                                const pi = comp.programmes.indexOf(prog);
                                if (ctx.datasetIndex === 0 && pi >= 0) {
                                    return `Avg GPA: ${comp.avgGPA[pi]} / 22 (${ctx.raw.toFixed(1)}%)`;
                                }
                                return `${ctx.dataset.label}: ${ctx.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Composite Score (%)' } },
                    y: { stacked: true, ticks: this._yLabelTicks(24, true) }
                }
            }
        });
        this.updateProgrammeComparisonChart();
    },

    updateProgrammeComparisonChart(normalized) {
        if (normalized !== undefined) this._progCompNormalized = normalized;
        const isNorm = this._progCompNormalized || false;
        const comp = DataStore.getProgrammeComparison();
        const chart = this.charts.programmeComparison;
        if (!chart) return;
        chart.data.labels = comp.programmes;

        // Scale GPA from 0-22 to 0-100% for stacking
        const gpaScaled = comp.avgGPA.map(g => parseFloat((g / 22 * 100).toFixed(1)));

        if (isNorm) {
            // Each programme's 4 metrics as proportion of their combined total
            const totals = comp.programmes.map((_, i) =>
                gpaScaled[i] + comp.passRate[i] + comp.completionRate[i] + comp.avgAttendance[i]
            );
            chart.data.datasets[0].data = gpaScaled.map((v, i) => totals[i] > 0 ? parseFloat((v / totals[i] * 100).toFixed(1)) : 0);
            chart.data.datasets[1].data = comp.passRate.map((v, i) => totals[i] > 0 ? parseFloat((v / totals[i] * 100).toFixed(1)) : 0);
            chart.data.datasets[2].data = comp.completionRate.map((v, i) => totals[i] > 0 ? parseFloat((v / totals[i] * 100).toFixed(1)) : 0);
            chart.data.datasets[3].data = comp.avgAttendance.map((v, i) => totals[i] > 0 ? parseFloat((v / totals[i] * 100).toFixed(1)) : 0);
            chart.options.scales.x.max = 100;
            chart.options.scales.x.title.text = 'Proportion (%)';
        } else {
            chart.data.datasets[0].data = gpaScaled;
            chart.data.datasets[1].data = comp.passRate;
            chart.data.datasets[2].data = comp.completionRate;
            chart.data.datasets[3].data = comp.avgAttendance;
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.title.text = 'Composite Score (%)';
        }
        chart.update();
    },

    // =========== COURSE PASS RATES ===========

    createCoursePassRateChart() {
        const ctx = this.getCtx('coursePassRateChart');
        if (!ctx) return;
        this.charts.coursePassRate = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [
                { label: 'Pass', data: [], backgroundColor: '#4b7baa', borderRadius: 2 },
                { label: 'Fail', data: [], backgroundColor: '#c27c7c', borderRadius: 2 }
            ]},
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const courses = DataStore.getPassRateByCourse();
                                const course = courses.find(c => c.course === ctx.label);
                                if (!course) return `${ctx.dataset.label}: ${ctx.raw}`;
                                const pct = ctx.datasetIndex === 0
                                    ? course.passRate + '%'
                                    : (100 - course.passRate).toFixed(1) + '%';
                                return `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} (${pct})`;
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Results' } },
                    y: { stacked: true, ticks: { font: { size: 10 } } }
                }
            }
        });
        this.updateCoursePassRateChart();
    },

    _coursePassRateFilterCourse: null,

    _buildCoursePassRateFilter() {
        const container = document.getElementById('coursePassRateFilter');
        if (!container || container.children.length > 0) return;
        const allCourses = DataStore.getPassRateByCourse();
        let html = '<select class="chart-prog-select" id="coursePassRateSelect">';
        html += '<option value="all">All Courses</option>';
        allCourses.forEach(c => {
            html += `<option value="${c.course}">${c.course} (${c.passRate}% pass)</option>`;
        });
        html += '</select>';
        container.innerHTML = html;

        container.querySelector('select').addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'all') {
                this._coursePassRateFilterCourse = null;
                // Keep current toggle mode (bottom10/top10/normalized)
            } else {
                this._coursePassRateFilterCourse = val;
                this._coursePassRateMode = 'single';
            }
            this.updateCoursePassRateChart();
        });
    },

    updateCoursePassRateChart(mode) {
        // Track the display mode (normalized) and selection mode (bottom10/top10) separately
        if (mode === 'normalized') {
            this._coursePassRateNormalized = true;
        } else if (mode === 'bottom10' || mode === 'top10') {
            this._coursePassRateNormalized = false;
            this._coursePassRateSelection = mode;
        }
        const isNorm = this._coursePassRateNormalized || false;
        const selection = this._coursePassRateSelection || 'bottom10';
        const chart = this.charts.coursePassRate;
        if (!chart) return;

        this._buildCoursePassRateFilter();

        const allCourses = DataStore.getPassRateByCourse();

        // Determine which courses to show
        let courses;
        if (this._coursePassRateFilterCourse) {
            courses = allCourses.filter(c => c.course === this._coursePassRateFilterCourse);
        } else if (selection === 'top10') {
            courses = allCourses.slice(-10).reverse();
        } else {
            // bottom10 (default)
            courses = allCourses.slice(0, 10);
        }

        // Reset dropdown when toggle buttons are used
        if (mode === 'bottom10' || mode === 'top10' || mode === 'normalized') {
            this._coursePassRateFilterCourse = null;
            const select = document.getElementById('coursePassRateSelect');
            if (select) select.value = 'all';
        }

        if (isNorm) {
            chart.data.labels = courses.map(c => c.course);
            chart.data.datasets[0].data = courses.map(c => c.total > 0 ? parseFloat((c.passed / c.total * 100).toFixed(1)) : 0);
            chart.data.datasets[1].data = courses.map(c => c.total > 0 ? parseFloat((c.failed / c.total * 100).toFixed(1)) : 0);
            chart.options.scales.x.max = 100;
            chart.options.scales.x.title.text = 'Percentage (%)';
        } else {
            chart.data.labels = courses.map(c => c.course);
            chart.data.datasets[0].data = courses.map(c => c.passed);
            chart.data.datasets[1].data = courses.map(c => c.failed);
            chart.options.scales.x.max = undefined;
            chart.options.scales.x.title.text = 'Number of Results';
        }
        chart.update();
    }
};
