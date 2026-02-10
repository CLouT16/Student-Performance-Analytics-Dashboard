// Tables Manager — summary data tables below charts
const TablesManager = {
    sortState: {},  // tableId → { col, asc }

    // Render all tables
    renderAllTables() {
        this.renderRecruitmentTable();
        this.renderEnrollmentTable();
        this.renderPerformanceTable();
        this.renderComparisonTable();
        this.renderRetentionTable();
        this.renderDemographicsTable();
    },

    // Generic table builder
    buildTable(containerId, title, columns, rows) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const state = this.sortState[containerId] || { col: 0, asc: true };

        // Sort rows
        const sorted = [...rows].sort((a, b) => {
            const av = a[state.col];
            const bv = b[state.col];
            const an = parseFloat(av);
            const bn = parseFloat(bv);
            if (!isNaN(an) && !isNaN(bn)) {
                return state.asc ? an - bn : bn - an;
            }
            return state.asc
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });

        const headerHTML = columns.map((col, i) => {
            const isActive = state.col === i;
            const arrow = isActive ? (state.asc ? '\u25B2' : '\u25BC') : '\u25B4';
            const cls = isActive ? 'sort-arrow active' : 'sort-arrow';
            return `<th data-col="${i}">${col} <span class="${cls}">${arrow}</span></th>`;
        }).join('');

        const bodyHTML = sorted.map(row =>
            '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
        ).join('');

        container.innerHTML = `
            <div class="data-table-wrap">
                <h3>${title}</h3>
                <table class="data-table" id="${containerId}Table">
                    <thead><tr>${headerHTML}</tr></thead>
                    <tbody>${bodyHTML}</tbody>
                </table>
            </div>
        `;

        // Attach sort listeners
        container.querySelectorAll('th').forEach(th => {
            th.addEventListener('click', () => {
                const col = parseInt(th.dataset.col);
                if (state.col === col) {
                    state.asc = !state.asc;
                } else {
                    state.col = col;
                    state.asc = true;
                }
                this.sortState[containerId] = state;
                this.buildTable(containerId, title, columns, rows);
            });
        });
    },

    // --- Enrollment Table ---
    renderEnrollmentTable() {
        const enrollment = DataStore.getEnrollmentByYear();
        const years = Object.keys(enrollment).sort();
        const data = DataStore.getData();

        const rows = years.map((year, i) => {
            const count = enrollment[year];
            // Count by school for this year
            const schoolCounts = {};
            data.currentStudents.forEach(cs => {
                if (cs.academic_year === year) {
                    schoolCounts[cs.school] = (schoolCounts[cs.school] || 0) + 1;
                }
            });
            const schoolStr = Object.entries(schoolCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([s, c]) => `${s}: ${c}`)
                .join(', ');

            const prev = i > 0 ? enrollment[years[i - 1]] : null;
            const change = prev ? (((count - prev) / prev) * 100).toFixed(1) + '%' : '-';

            return [year, count.toLocaleString(), schoolStr, change];
        });

        this.buildTable('enrollmentTable', 'Enrollment Summary',
            ['Year', 'Students', 'By School', 'YoY Change'], rows);
    },

    // --- Performance Table ---
    renderPerformanceTable() {
        const data = DataStore.getData();

        // Group by programme
        const progStats = {};
        data.classifications.forEach(c => {
            if (!progStats[c.programme]) progStats[c.programme] = { gpaSum: 0, count: 0 };
            progStats[c.programme].gpaSum += c.final_gpa;
            progStats[c.programme].count++;
        });

        // Pass rates by programme from course results
        const progPass = {};
        data.courseResults.forEach(g => {
            const student = DataLoader.studentIndex.get(g.student_id);
            const prog = student ? student.programme : 'Unknown';
            if (!progPass[prog]) progPass[prog] = { passed: 0, total: 0 };
            progPass[prog].total++;
            if (g.is_passed) progPass[prog].passed++;
        });

        const programmes = [...new Set([...Object.keys(progStats), ...Object.keys(progPass)])].sort();
        const rows = programmes.map(p => {
            const gpa = progStats[p] ? (progStats[p].gpaSum / progStats[p].count).toFixed(1) : 'N/A';
            const passRate = progPass[p] ? ((progPass[p].passed / progPass[p].total) * 100).toFixed(1) + '%' : 'N/A';
            const sampleSize = (progStats[p] ? progStats[p].count : 0) + (progPass[p] ? progPass[p].total : 0);
            return [p, gpa, passRate, sampleSize.toLocaleString()];
        });

        this.buildTable('performanceTable', 'Performance by Programme',
            ['Programme', 'Avg GPA', 'Pass Rate', 'Sample Size'], rows);
    },

    // --- Comparison Table ---
    renderComparisonTable() {
        const data = DataStore.getData();
        const allYears = DataStore.getAcademicYears();
        if (allYears.length < 4) return;
        const latestStartYear = parseInt(allYears[allYears.length - 1].split('/')[0]);

        const progData = {};
        data.students.forEach(s => {
            const entryStartYear = parseInt((s.entry_year || '').split('/')[0]);
            if (isNaN(entryStartYear) || (latestStartYear - entryStartYear) < 4) return;
            if (!progData[s.programme]) progData[s.programme] = { enrolled: 0, completed: 0, gpaSum: 0, gpaCount: 0 };
            progData[s.programme].enrolled++;
        });

        data.classifications.forEach(c => {
            if (progData[c.programme]) {
                progData[c.programme].completed++;
                progData[c.programme].gpaSum += c.final_gpa;
                progData[c.programme].gpaCount++;
            }
        });

        const rows = Object.keys(progData).sort().map(p => {
            const d = progData[p];
            const rate = d.enrolled > 0 ? ((d.completed / d.enrolled) * 100).toFixed(1) + '%' : 'N/A';
            const avgGpa = d.gpaCount > 0 ? (d.gpaSum / d.gpaCount).toFixed(1) : 'N/A';
            return [p, d.enrolled.toLocaleString(), d.completed.toLocaleString(), rate, avgGpa];
        });

        this.buildTable('comparisonTable', 'Programme Comparison',
            ['Programme', 'Enrolled', 'Completed', 'Rate', 'Avg GPA'], rows);
    },

    // --- Retention Table ---
    renderRetentionTable() {
        const years = DataStore.getAcademicYears();
        const data = DataStore.getData();
        const calcYears = years.slice(0, -1);

        const rows = calcYears.map(year => {
            const nextYear = years[years.indexOf(year) + 1];
            let yr1Count = 0;
            let yr2Count = 0;
            const yr1Ids = new Set();

            data.currentStudents.forEach(cs => {
                if (cs.academic_year === year && cs.prog_yr === 1) {
                    yr1Ids.add(cs.student_id);
                    yr1Count++;
                }
            });

            data.currentStudents.forEach(cs => {
                if (cs.academic_year === nextYear && cs.prog_yr >= 2 && yr1Ids.has(cs.student_id)) {
                    yr2Count++;
                }
            });

            const rate = yr1Count > 0 ? ((yr2Count / yr1Count) * 100).toFixed(1) + '%' : 'N/A';
            return [year, yr1Count.toLocaleString(), yr2Count.toLocaleString(), (yr1Count - yr2Count).toLocaleString(), rate];
        });

        this.buildTable('retentionTable', 'Retention by Cohort',
            ['Cohort Year', 'Y1 Count', 'Y2 Count', 'Lost', 'Retention Rate'], rows);
    },

    // --- Demographics Table ---
    renderDemographicsTable() {
        const data = DataStore.getData();
        const total = data.students.length;
        if (total === 0) return;

        const rows = [];

        // Gender
        const genderCounts = {};
        data.students.forEach(s => { genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1; });
        Object.entries(genderCounts).sort((a, b) => b[1] - a[1]).forEach(([g, c]) => {
            rows.push(['Gender: ' + g, c.toLocaleString(), ((c / total) * 100).toFixed(1) + '%']);
        });

        // Top 5 nationalities
        const natCounts = {};
        data.students.forEach(s => { natCounts[s.nationality] = (natCounts[s.nationality] || 0) + 1; });
        Object.entries(natCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([n, c]) => {
            rows.push(['Nationality: ' + n, c.toLocaleString(), ((c / total) * 100).toFixed(1) + '%']);
        });

        // Proficiency
        const profCounts = {};
        data.students.forEach(s => { profCounts[s.english_proficiency] = (profCounts[s.english_proficiency] || 0) + 1; });
        Object.entries(profCounts).sort((a, b) => b[1] - a[1]).forEach(([p, c]) => {
            rows.push(['Proficiency: ' + p, c.toLocaleString(), ((c / total) * 100).toFixed(1) + '%']);
        });

        this.buildTable('demographicsTable', 'Demographics Summary',
            ['Category', 'Count', 'Percentage'], rows);
    },

    // --- Recruitment Source Summary Table (Management Overview) ---
    renderRecruitmentTable() {
        const effectiveness = DataStore.getRecruitmentEffectiveness();
        if (effectiveness.length === 0) return;

        const rows = effectiveness.map(e => {
            // Conversion: applicants who became registered students (from current_students)
            const conversionRate = e.total > 0 ? ((e.registered / e.total) * 100).toFixed(1) + '%' : 'N/A';
            // Graduation rate: of those registered, how many graduated
            const gradRate = e.registered > 0 ? ((e.graduated / e.registered) * 100).toFixed(1) + '%' : 'N/A';
            return [
                e.source,
                e.total.toLocaleString(),
                e.rejected.toLocaleString(),
                e.notInterested.toLocaleString(),
                e.registered.toLocaleString(),
                e.graduated.toLocaleString(),
                e.dropped.toLocaleString(),
                conversionRate,
                gradRate
            ];
        });

        this.buildTable('recruitmentTable', 'Recruitment Source Summary',
            ['Source', 'Applicants', 'Rejected', 'Not Interested', 'Registered', 'Graduated', 'Dropped', 'Conversion Rate', 'Graduation Rate'], rows);
    }
};
