// Insights Generator — category-based metrics derived directly from imported data
// No narrative text, no AI-generated prose — purely data traceable to dashboard charts
const InsightsGenerator = {

    generateAllInsights() {
        try { this.generateEnrollmentInsights(); } catch(e) { console.warn('Enrollment insights error:', e); }
        try { this.generatePerformanceInsights(); } catch(e) { console.warn('Performance insights error:', e); }
        try { this.generateRetentionInsights(); } catch(e) { console.warn('Retention insights error:', e); }
        try { this.generateDemographicInsights(); } catch(e) { console.warn('Demographic insights error:', e); }
        try { this.generateStrategicSummary(); } catch(e) { console.warn('Strategic insights error:', e); }
    },

    // Metric card: category label + large metric + supporting details
    _metric(label, value, details, type = 'positive') {
        const detailsHtml = details.map(d => `<span class="metric-detail">${d}</span>`).join('');
        return `
            <div class="insight-item ${type}">
                <h4>${label}</h4>
                <span class="insight-metric">${value}</span>
                <div class="metric-details">${detailsHtml}</div>
            </div>
        `;
    },

    // Section heading
    _heading(title) {
        return `<h3 class="insights-heading">${title}</h3>`;
    },

    // Data source disclaimer
    _disclaimer(data) {
        return `<p class="insights-disclaimer">All metrics calculated from ${data.students.length.toLocaleString()} student records, ${data.courseResults.length.toLocaleString()} course results, and ${data.attendance.length.toLocaleString()} attendance records in the imported data.</p>`;
    },

    // --- Enrollment & Recruitment ---
    generateEnrollmentInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('enrollmentInsights');
        if (!container) return;
        let html = this._heading('Enrollment & Recruitment');
        html += this._disclaimer(data);

        // Enrollment growth
        const enrollment = DataStore.getEnrollmentByYear();
        const years = Object.keys(enrollment).sort();
        if (years.length >= 2) {
            const latest = enrollment[years[years.length - 1]];
            const previous = enrollment[years[years.length - 2]];
            const growth = ((latest - previous) / previous * 100).toFixed(1);
            html += this._metric(
                'Enrollment Growth',
                `${growth > 0 ? '+' : ''}${growth}%`,
                [
                    `${years[years.length - 2]}: ${previous.toLocaleString()}`,
                    `${years[years.length - 1]}: ${latest.toLocaleString()}`
                ],
                growth > 0 ? 'positive' : (growth < -5 ? 'critical' : 'warning')
            );
        }

        // Applicant conversion
        const totalApplicants = DataStore.getTotalApplicants();
        const registeredStudents = DataStore.getUniqueRegisteredStudents();
        if (totalApplicants > 0) {
            const conversionRate = ((registeredStudents / totalApplicants) * 100).toFixed(1);
            html += this._metric(
                'Applicant Conversion',
                `${conversionRate}%`,
                [
                    `Applicants: ${totalApplicants.toLocaleString()}`,
                    `Registered: ${registeredStudents.toLocaleString()}`
                ],
                conversionRate >= 50 ? 'positive' : (conversionRate >= 30 ? 'warning' : 'critical')
            );
        }

        // Top recruitment source
        const sources = DataStore.getRecruitmentBySource();
        if (sources.length > 0) {
            const top = sources[0];
            const totalSrc = sources.reduce((s, r) => s + r.count, 0);
            const pct = ((top.count / totalSrc) * 100).toFixed(1);
            html += this._metric(
                'Top Recruitment Channel',
                top.source,
                [
                    `${top.count.toLocaleString()} applicants (${pct}%)`,
                    `${sources.length} channels total`
                ],
                'positive'
            );
        }

        // Largest school
        const schoolCounts = {};
        data.students.forEach(s => { schoolCounts[s.school] = (schoolCounts[s.school] || 0) + 1; });
        const topSchool = Object.entries(schoolCounts).sort((a, b) => b[1] - a[1])[0];
        if (topSchool) {
            const pct = (topSchool[1] / data.students.length * 100).toFixed(1);
            html += this._metric(
                'Largest School',
                topSchool[0],
                [
                    `n=${topSchool[1].toLocaleString()} (${pct}%)`,
                    `${Object.keys(schoolCounts).length} schools total`
                ],
                'positive'
            );
        }

        container.innerHTML = html;
    },

    // --- Academic Performance ---
    generatePerformanceInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('performanceInsights');
        if (!container) return;
        let html = this._heading('Academic Performance *');
        html += `<p class="insights-disclaimer" style="border-left:2px solid #d4a843;font-style:italic;">* Subject to Board of Examiners\u2019 recommendations. Figures based on recorded data.</p>`;

        // Overall pass rate
        const totalGrades = data.courseResults.length;
        if (totalGrades > 0) {
            const passed = data.courseResults.filter(g => g.is_passed).length;
            const failed = totalGrades - passed;
            const passRate = (passed / totalGrades * 100).toFixed(1);
            html += this._metric(
                'Overall Pass Rate',
                `${passRate}%`,
                [
                    `Passed: ${passed.toLocaleString()}`,
                    `Failed: ${failed.toLocaleString()}`,
                    `Total: ${totalGrades.toLocaleString()} results`
                ],
                passRate >= 80 ? 'positive' : (passRate >= 70 ? 'warning' : 'critical')
            );
        }

        // Average GPA (graduated only)
        const grads = data.classifications.filter(c => c.graduation_status === 'Graduated' && c.final_gpa > 0);
        if (grads.length > 0) {
            const avgGPA = (grads.reduce((sum, c) => sum + c.final_gpa, 0) / grads.length).toFixed(1);
            html += this._metric(
                'Average Graduate GPA',
                `${avgGPA} / 22`,
                [
                    `n=${grads.length.toLocaleString()} graduates`,
                    `CGS scale 0\u201322`
                ],
                avgGPA >= 14 ? 'positive' : (avgGPA >= 11 ? 'warning' : 'critical')
            );
        }

        // Good honours rate (graduated only)
        const graduated = data.classifications.filter(c => c.graduation_status === 'Graduated');
        if (graduated.length > 0) {
            const counts = {};
            graduated.forEach(c => { counts[c.classification] = (counts[c.classification] || 0) + 1; });
            const firstClass = counts['First Class Honours'] || 0;
            const upperSecond = counts['Upper Second Class Honours'] || 0;
            const goodHons = firstClass + upperSecond;
            const goodPct = ((goodHons / graduated.length) * 100).toFixed(1);
            html += this._metric(
                'Good Honours (1st + 2:1)',
                `${goodPct}%`,
                [
                    `First: ${firstClass}`,
                    `Upper Second: ${upperSecond}`,
                    `Total graduates: ${graduated.length.toLocaleString()}`
                ],
                goodPct >= 60 ? 'positive' : (goodPct >= 40 ? 'warning' : 'critical')
            );
        }

        // Programme performance spread (graduated only)
        const progGPA = {};
        graduated.forEach(c => {
            if (!progGPA[c.programme]) progGPA[c.programme] = { sum: 0, count: 0 };
            progGPA[c.programme].sum += c.final_gpa;
            progGPA[c.programme].count++;
        });
        const progAvgs = Object.entries(progGPA)
            .map(([prog, d]) => ({ prog, avg: (d.sum / d.count).toFixed(1), count: d.count }))
            .sort((a, b) => b.avg - a.avg);
        if (progAvgs.length >= 2) {
            const best = progAvgs[0];
            const worst = progAvgs[progAvgs.length - 1];
            html += this._metric(
                'Programme GPA Spread',
                `${best.avg} \u2014 ${worst.avg}`,
                [
                    `Highest: ${CONFIG.abbrevProgramme(best.prog)} (${best.avg}, n=${best.count})`,
                    `Lowest: ${CONFIG.abbrevProgramme(worst.prog)} (${worst.avg}, n=${worst.count})`
                ],
                'warning'
            );
        }

        // A-grade rate
        if (totalGrades > 0) {
            const gradeCounts = {};
            data.courseResults.forEach(g => { gradeCounts[g.overall_grade] = (gradeCounts[g.overall_grade] || 0) + 1; });
            const aGrades = (gradeCounts['A1'] || 0) + (gradeCounts['A2'] || 0) + (gradeCounts['A3'] || 0) +
                            (gradeCounts['A4'] || 0) + (gradeCounts['A5'] || 0);
            const aPct = (aGrades / totalGrades * 100).toFixed(1);
            html += this._metric(
                'A-Grade Rate (A1\u2013A5)',
                `${aPct}%`,
                [
                    `${aGrades.toLocaleString()} of ${totalGrades.toLocaleString()} results`
                ],
                aPct >= 15 ? 'positive' : (aPct >= 10 ? 'warning' : 'critical')
            );
        }

        container.innerHTML = html;
    },

    // --- Retention & Completion ---
    generateRetentionInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('retentionInsights');
        if (!container) return;
        let html = this._heading('Retention & Completion');

        // Use status-based counts — consistent with Retention Cohort Summary table
        const counts = DataStore.getRetentionAttritionCounts();
        const programmes = Object.keys(counts).sort();

        // Overall retention (graduated / (graduated + dropped))
        let totalRetained = 0, totalDropped = 0, totalStudents = 0;
        for (const p of programmes) {
            totalRetained += counts[p].retained;
            totalDropped += counts[p].dropped;
            totalStudents += counts[p].total;
        }
        const overallRetention = (totalRetained + totalDropped) > 0
            ? ((totalRetained / (totalRetained + totalDropped)) * 100).toFixed(1) : 0;

        html += this._metric(
            'Overall Retention',
            `${overallRetention}%`,
            [
                `Graduated: ${totalRetained.toLocaleString()}`,
                `Dropped: ${totalDropped.toLocaleString()}`,
                `Of ${(totalRetained + totalDropped).toLocaleString()} with known outcomes`
            ],
            overallRetention >= 85 ? 'positive' : (overallRetention >= 75 ? 'warning' : 'critical')
        );

        // Programme with lowest retention
        const progRetention = programmes.map(p => {
            const c = counts[p];
            const known = c.retained + c.dropped;
            return { prog: p, rate: known > 0 ? (c.retained / known * 100) : 100, dropped: c.dropped, total: c.total };
        }).filter(p => (counts[p.prog].retained + counts[p.prog].dropped) > 10)
          .sort((a, b) => a.rate - b.rate);

        if (progRetention.length > 0 && progRetention[0].rate < 95) {
            const worst = progRetention[0];
            html += this._metric(
                'Lowest Programme Retention',
                `${worst.rate.toFixed(1)}%`,
                [
                    `${CONFIG.abbrevProgramme(worst.prog)}`,
                    `${worst.dropped} dropped of ${worst.total}`
                ],
                worst.rate >= 85 ? 'warning' : 'critical'
            );
        }

        // Completion rate
        const completionRate = parseFloat(DataStore.calculateCompletionRate());
        html += this._metric(
            'Programme Completion',
            `${completionRate}%`,
            [
                `Students entered 4+ years ago`
            ],
            completionRate >= 70 ? 'positive' : (completionRate >= 60 ? 'warning' : 'critical')
        );

        // Attrition
        const attritionRate = totalStudents > 0 ? (totalDropped / totalStudents * 100).toFixed(1) : 0;
        html += this._metric(
            'Overall Attrition',
            `${attritionRate}%`,
            [
                `${totalDropped.toLocaleString()} dropped of ${totalStudents.toLocaleString()}`
            ],
            attritionRate < 10 ? 'positive' : (attritionRate < 20 ? 'warning' : 'critical')
        );

        container.innerHTML = html;
    },

    // --- Demographics ---
    generateDemographicInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('demographicInsights');
        if (!container) return;
        let html = this._heading('Demographics');

        // Gender balance
        const genderCounts = {};
        data.students.forEach(s => { genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1; });
        const genderEntries = Object.entries(genderCounts).sort((a, b) => b[1] - a[1]);
        if (genderEntries.length > 0) {
            const dominant = genderEntries[0];
            const pct = (dominant[1] / data.students.length * 100).toFixed(1);
            html += this._metric(
                'Gender Balance',
                `${pct}% ${dominant[0]}`,
                genderEntries.map(([g, c]) => `${g}: ${c.toLocaleString()} (${(c / data.students.length * 100).toFixed(1)}%)`),
                pct >= 60 ? 'warning' : 'positive'
            );
        }

        // Nationality diversity
        const natCounts = {};
        data.students.forEach(s => { natCounts[s.nationality] = (natCounts[s.nationality] || 0) + 1; });
        const uniqueNats = Object.keys(natCounts).length;
        const topNats = Object.entries(natCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        html += this._metric(
            'International Diversity',
            `${uniqueNats} Nationalities`,
            topNats.map(([n, c]) => `${n}: ${c.toLocaleString()}`),
            uniqueNats > 20 ? 'positive' : 'warning'
        );

        // Age profile
        const ages = data.students.map(s => s.age).filter(a => a != null);
        if (ages.length > 0) {
            const avgAge = (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
            const under25 = ages.filter(a => a <= 24).length;
            const under25Pct = ((under25 / ages.length) * 100).toFixed(1);
            html += this._metric(
                'Age Profile',
                `${avgAge} avg`,
                [
                    `Under 25: ${under25Pct}% (n=${under25})`,
                    `25+: ${(100 - under25Pct).toFixed(1)}% (n=${ages.length - under25})`
                ],
                'positive'
            );
        }

        // English proficiency
        const profCounts = {};
        data.students.forEach(s => { profCounts[s.english_proficiency] = (profCounts[s.english_proficiency] || 0) + 1; });
        const advanced = profCounts['Advanced'] || 0;
        const proficient = profCounts['Proficient'] || 0;
        const strongPct = data.students.length > 0 ? (((advanced + proficient) / data.students.length) * 100).toFixed(1) : 0;
        html += this._metric(
            'English Proficiency',
            `${strongPct}% Advanced/Proficient`,
            Object.entries(profCounts).sort((a, b) => b[1] - a[1]).map(([l, c]) => `${l}: ${c.toLocaleString()}`),
            strongPct >= 60 ? 'positive' : 'warning'
        );

        // Attendance health
        const attRisk = DataStore.getAttendanceRiskOverview();
        const goodAtt = attRisk['Good'] || 0;
        const totalAtt = Object.values(attRisk).reduce((a, b) => a + b, 0);
        if (totalAtt > 0) {
            const goodPct = ((goodAtt / totalAtt) * 100).toFixed(1);
            html += this._metric(
                'Attendance Status',
                `${goodPct}% Good`,
                Object.entries(attRisk).sort((a, b) => b[1] - a[1]).map(([s, c]) => `${s}: ${c.toLocaleString()}`),
                goodPct >= 70 ? 'positive' : (goodPct >= 50 ? 'warning' : 'critical')
            );
        }

        container.innerHTML = html;
    },

    // --- Strategic Summary (flagged metrics only) ---
    generateStrategicSummary() {
        const data = DataStore.getData();
        const container = document.getElementById('dataFlags');
        if (!container) return;
        let html = this._heading('Flagged Metrics');
        let flagCount = 0;

        // Enrollment decline
        const enrollment = DataStore.getEnrollmentByYear();
        const years = Object.keys(enrollment).sort();
        if (years.length >= 2) {
            const latest = enrollment[years[years.length - 1]];
            const previous = enrollment[years[years.length - 2]];
            const growth = ((latest - previous) / previous * 100).toFixed(1);
            if (growth < 0) {
                html += this._metric(
                    'Enrollment Decline',
                    `${growth}%`,
                    [
                        `${years[years.length - 2]}: ${previous}`,
                        `${years[years.length - 1]}: ${latest}`
                    ],
                    'critical'
                );
                flagCount++;
            }
        }

        // Low-performing programme
        const progGPA = {};
        data.classifications.forEach(c => {
            if (!progGPA[c.programme]) progGPA[c.programme] = { sum: 0, count: 0 };
            progGPA[c.programme].sum += c.final_gpa;
            progGPA[c.programme].count++;
        });
        const progAvgs = Object.entries(progGPA)
            .map(([prog, d]) => ({ prog, avg: d.sum / d.count }))
            .sort((a, b) => a.avg - b.avg);
        if (progAvgs.length > 0 && progAvgs[0].avg < 12) {
            html += this._metric(
                'Lowest Programme GPA',
                `${progAvgs[0].avg.toFixed(1)}`,
                [
                    `${CONFIG.abbrevProgramme(progAvgs[0].prog)}`,
                    `Below C1 threshold (12.0)`
                ],
                'warning'
            );
            flagCount++;
        }

        // Completion below target
        const completionRate = parseFloat(DataStore.calculateCompletionRate());
        if (completionRate < 70) {
            html += this._metric(
                'Completion Below Target',
                `${completionRate}%`,
                [
                    `Target: 70%`,
                    `Gap: ${(70 - completionRate).toFixed(1)}pp`
                ],
                'critical'
            );
            flagCount++;
        }

        // Attendance concerns
        const attRisk = DataStore.getAttendanceRiskOverview();
        const concernStudents = (attRisk['Concern'] || 0);
        if (concernStudents > 0) {
            html += this._metric(
                'Attendance Concern',
                `${concernStudents} students`,
                [
                    `Status: "Concern"`,
                    `Warning: ${attRisk['Warning'] || 0}`
                ],
                'warning'
            );
            flagCount++;
        }

        // Gender imbalance
        const genderCounts = {};
        data.students.forEach(s => { genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1; });
        const genderEntries = Object.entries(genderCounts).sort((a, b) => b[1] - a[1]);
        if (genderEntries.length > 0) {
            const pct = (genderEntries[0][1] / data.students.length * 100).toFixed(1);
            if (pct > 65) {
                html += this._metric(
                    'Gender Imbalance',
                    `${pct}% ${genderEntries[0][0]}`,
                    genderEntries.map(([g, c]) => `${g}: ${c}`),
                    'warning'
                );
                flagCount++;
            }
        }

        if (flagCount === 0) {
            html += this._metric(
                'No Flags',
                'All Clear',
                [`All key metrics within acceptable thresholds`],
                'positive'
            );
        }

        // Data summary
        html += this._metric(
            'Data Coverage',
            `${data.students.length.toLocaleString()} Students`,
            [
                `${data.courseResults.length.toLocaleString()} course results`,
                `${data.attendance.length.toLocaleString()} attendance records`,
                `${data.classifications.length.toLocaleString()} classifications`
            ],
            'positive'
        );

        container.innerHTML = html;
    }
};
