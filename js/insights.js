// Insights Generator — all 5 insight sections re-enabled with fixed field names and 0-22 GPA scale
const InsightsGenerator = {

    generateAllInsights() {
        this.generateEnrollmentInsights();
        this.generatePerformanceInsights();
        this.generateRetentionInsights();
        this.generateDemographicInsights();
        this.generateStrategicRecommendations();
    },

    // Helper to create insight HTML
    createInsightHTML(title, description, metric, type = 'positive') {
        return `
            <div class="insight-item ${type}">
                <h4>${title}</h4>
                <p>${description}</p>
                ${metric ? `<span class="insight-metric">${metric}</span>` : ''}
            </div>
        `;
    },

    // --- Enrollment Insights ---
    generateEnrollmentInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('enrollmentInsights');
        if (!container) return;
        let insights = '';

        // Enrollment growth from unique students per year
        const enrollment = DataStore.getEnrollmentByYear();
        const years = Object.keys(enrollment).sort();
        if (years.length >= 2) {
            const latest = enrollment[years[years.length - 1]];
            const previous = enrollment[years[years.length - 2]];
            const growth = ((latest - previous) / previous * 100).toFixed(1);
            const growthType = growth > 0 ? 'positive' : (growth < 0 ? 'critical' : 'warning');
            insights += this.createInsightHTML(
                'Enrollment Growth Trend',
                `Enrollment ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth)}% from ${years[years.length - 2]} to ${years[years.length - 1]}. ${growth > 0 ? 'Recruitment strategies are working effectively.' : 'Review marketing and recruitment strategies.'}`,
                `${growth > 0 ? '+' : ''}${growth}% Change`,
                growthType
            );
        }

        // Highest enrollment school
        const schoolCounts = {};
        data.students.forEach(s => { schoolCounts[s.school] = (schoolCounts[s.school] || 0) + 1; });
        const topSchool = Object.entries(schoolCounts).sort((a, b) => b[1] - a[1])[0];
        if (topSchool) {
            const pct = (topSchool[1] / data.students.length * 100).toFixed(1);
            insights += this.createInsightHTML(
                'Highest Enrollment School',
                `${topSchool[0]} has the highest enrollment with ${topSchool[1]} students (${pct}% of total).`,
                `${topSchool[1]} Students`,
                'positive'
            );
        }

        // Programme count
        const uniqueProgs = new Set(data.students.map(s => s.programme)).size;
        insights += this.createInsightHTML(
            'Programme Diversity',
            `The institution offers ${uniqueProgs} programmes, providing diverse academic pathways.`,
            `${uniqueProgs} Programmes`,
            uniqueProgs >= 5 ? 'positive' : 'warning'
        );

        container.innerHTML = insights;
    },

    // --- Performance Insights ---
    generatePerformanceInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('performanceInsights');
        if (!container) return;
        let insights = '';

        // Overall pass rate from course results
        const totalGrades = data.courseResults.length;
        if (totalGrades > 0) {
            const passed = data.courseResults.filter(g => g.is_passed).length;
            const passRate = (passed / totalGrades * 100).toFixed(1);
            const passType = passRate >= 80 ? 'positive' : (passRate >= 70 ? 'warning' : 'critical');
            insights += this.createInsightHTML(
                'Overall Pass Rate',
                `Current pass rate is ${passRate}%. ${passRate >= 80 ? 'Excellent academic performance across programmes.' : passRate >= 70 ? 'Performance is acceptable but has room for improvement.' : 'Pass rate below threshold — immediate intervention required.'}`,
                `${passRate}% Pass Rate`,
                passType
            );
        }

        // Average GPA (0-22 scale) from classifications using index
        const grads = data.classifications.filter(c => c.final_gpa > 0);
        if (grads.length > 0) {
            const avgGPA = (grads.reduce((sum, c) => sum + c.final_gpa, 0) / grads.length).toFixed(1);
            // 0-22 scale: ~14+ is good, ~11-14 moderate, <11 concerning
            const gpaType = avgGPA >= 14 ? 'positive' : (avgGPA >= 11 ? 'warning' : 'critical');
            insights += this.createInsightHTML(
                'Average Graduate GPA',
                `Average GPA across graduates is ${avgGPA} (0-22 scale). ${avgGPA >= 14 ? 'Strong academic achievement.' : avgGPA >= 11 ? 'Moderate performance — targeted support could improve outcomes.' : 'Low GPA requires intervention strategies.'}`,
                `${avgGPA} / 22 GPA`,
                gpaType
            );
        }

        // Top performing school by average GPA using classification index
        const schoolGPA = {};
        data.classifications.forEach(c => {
            if (!schoolGPA[c.school]) schoolGPA[c.school] = { sum: 0, count: 0 };
            schoolGPA[c.school].sum += c.final_gpa;
            schoolGPA[c.school].count++;
        });
        const schoolAvgs = Object.entries(schoolGPA)
            .map(([school, d]) => ({ school, avg: (d.sum / d.count).toFixed(1) }))
            .sort((a, b) => b.avg - a.avg);
        if (schoolAvgs.length > 0) {
            insights += this.createInsightHTML(
                'Top Performing School',
                `${schoolAvgs[0].school} leads with average GPA of ${schoolAvgs[0].avg}. Share best practices to elevate overall performance.`,
                `${schoolAvgs[0].avg} / 22 GPA`,
                'positive'
            );
        }

        // Grade distribution — A grades (A2-A5 in CGS)
        if (totalGrades > 0) {
            const gradeCounts = {};
            data.courseResults.forEach(g => {
                gradeCounts[g.overall_grade] = (gradeCounts[g.overall_grade] || 0) + 1;
            });
            const aGrades = (gradeCounts['A2'] || 0) + (gradeCounts['A3'] || 0) +
                            (gradeCounts['A4'] || 0) + (gradeCounts['A5'] || 0);
            const aPct = (aGrades / totalGrades * 100).toFixed(1);
            insights += this.createInsightHTML(
                'Excellence Rate (A Grades)',
                `${aPct}% of all grades are A-level (A2-A5). ${aPct >= 15 ? 'Strong proportion of high achievers.' : 'Consider enrichment activities to increase excellence rate.'}`,
                `${aPct}% A Grades`,
                aPct >= 15 ? 'positive' : (aPct >= 10 ? 'warning' : 'critical')
            );
        }

        // Degree classification analysis
        if (data.classifications.length > 0) {
            const firstClass = data.classifications.filter(c => c.classification === 'First Class Honours').length;
            const upperSecond = data.classifications.filter(c => c.classification === 'Upper Second Class Honours').length;
            const excellenceRate = ((firstClass + upperSecond) / data.classifications.length * 100).toFixed(1);
            insights += this.createInsightHTML(
                'Degree Classification Analysis',
                `${excellenceRate}% of graduates achieved First Class or Upper Second Class Honours.`,
                `${firstClass} First Class | ${upperSecond} Upper Second`,
                excellenceRate >= 60 ? 'positive' : (excellenceRate >= 40 ? 'warning' : 'critical')
            );
        }

        container.innerHTML = insights;
    },

    // --- Retention Insights ---
    generateRetentionInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('retentionInsights');
        if (!container) return;
        let insights = '';

        // Average retention rate — dynamic years
        const years = DataStore.getAcademicYears();
        const calcYears = years.slice(0, -1);
        const rates = calcYears.map(y => parseFloat(DataStore.calculateRetentionRate(y))).filter(r => r > 0);
        const avgRetention = rates.length > 0 ? (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1) : 0;
        const retType = avgRetention >= 85 ? 'positive' : (avgRetention >= 75 ? 'warning' : 'critical');
        insights += this.createInsightHTML(
            'Average Retention Rate',
            `Average Y1→Y2 retention rate is ${avgRetention}%. ${avgRetention >= 85 ? 'Excellent student retention.' : avgRetention >= 75 ? 'Retention could be improved with enhanced support.' : 'Critical retention issue — conduct exit interviews.'}`,
            `${avgRetention}% Retention`,
            retType
        );

        // Completion rate
        const completionRate = parseFloat(DataStore.calculateCompletionRate());
        const compType = completionRate >= 70 ? 'positive' : (completionRate >= 60 ? 'warning' : 'critical');
        insights += this.createInsightHTML(
            'Programme Completion Rate',
            `${completionRate}% of eligible students have completed their degrees.`,
            `${completionRate}% Completion`,
            compType
        );

        // Attrition
        const statusCounts = {};
        data.students.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
        const droppedCount = statusCounts['Dropped'] || 0;
        const attritionRate = data.students.length > 0 ? (droppedCount / data.students.length * 100).toFixed(1) : 0;
        insights += this.createInsightHTML(
            'Student Attrition Rate',
            `${attritionRate}% of students have dropped out. ${attritionRate < 10 ? 'Low attrition.' : attritionRate < 20 ? 'Implement early warning systems.' : 'High attrition requires comprehensive review.'}`,
            `${attritionRate}% Attrition`,
            attritionRate < 10 ? 'positive' : (attritionRate < 20 ? 'warning' : 'critical')
        );

        container.innerHTML = insights;
    },

    // --- Demographic Insights ---
    generateDemographicInsights() {
        const data = DataStore.getData();
        const container = document.getElementById('demographicInsights');
        if (!container) return;
        let insights = '';

        // Gender balance
        const genderCounts = {};
        data.students.forEach(s => { genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1; });
        const genderEntries = Object.entries(genderCounts).sort((a, b) => b[1] - a[1]);
        if (genderEntries.length > 0) {
            const dominant = genderEntries[0];
            const pct = (dominant[1] / data.students.length * 100).toFixed(1);
            insights += this.createInsightHTML(
                'Gender Distribution',
                `${dominant[0]} students represent ${pct}% of the student body. ${pct >= 60 ? 'Consider targeted recruitment to improve balance.' : 'Good gender balance.'}`,
                `${pct}% ${dominant[0]}`,
                pct >= 60 ? 'warning' : 'positive'
            );
        }

        // Nationality diversity
        const natCounts = {};
        data.students.forEach(s => { natCounts[s.nationality] = (natCounts[s.nationality] || 0) + 1; });
        const uniqueNats = Object.keys(natCounts).length;
        insights += this.createInsightHTML(
            'International Diversity',
            `Students represent ${uniqueNats} nationalities. ${uniqueNats > 20 ? 'Excellent international diversity.' : 'Consider expanding international recruitment.'}`,
            `${uniqueNats} Nationalities`,
            uniqueNats > 20 ? 'positive' : 'warning'
        );

        // Age distribution — exclude nulls
        const ages = data.students.map(s => s.age).filter(a => a != null);
        if (ages.length > 0) {
            const avgAge = (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
            const traditionalPct = ((ages.filter(a => a <= 24).length / ages.length) * 100).toFixed(1);
            insights += this.createInsightHTML(
                'Student Age Profile',
                `Average student age is ${avgAge} years with ${traditionalPct}% being traditional college age (<=24).`,
                `${avgAge} Average Age`,
                'positive'
            );
        }

        // Disability
        const disabledCount = data.students.filter(s => s.is_disabled).length;
        const disabPct = data.students.length > 0 ? (disabledCount / data.students.length * 100).toFixed(1) : 0;
        insights += this.createInsightHTML(
            'Accessibility & Support',
            `${disabPct}% of students have disclosed disabilities. Ensure adequate accommodations are available.`,
            `${disabledCount} Students`,
            'positive'
        );

        container.innerHTML = insights;
    },

    // --- Strategic Recommendations ---
    generateStrategicRecommendations() {
        const data = DataStore.getData();
        const container = document.getElementById('strategicRecommendations');
        if (!container) return;
        let recommendations = '';

        // Enrollment growth check
        const enrollment = DataStore.getEnrollmentByYear();
        const years = Object.keys(enrollment).sort();
        if (years.length >= 2) {
            const latest = enrollment[years[years.length - 1]];
            const previous = enrollment[years[years.length - 2]];
            const growth = ((latest - previous) / previous * 100).toFixed(1);
            if (growth < 0) {
                recommendations += this.createInsightHTML(
                    'Boost Enrollment Growth',
                    'Develop targeted marketing campaigns for underperforming programmes. Partner with local schools for recruitment.',
                    'Priority: High',
                    'critical'
                );
            }
        }

        // Academic support (0-22 scale: < 11 is concerning)
        const grads = data.classifications.filter(c => c.final_gpa > 0);
        if (grads.length > 0) {
            const avgGPA = grads.reduce((sum, c) => sum + c.final_gpa, 0) / grads.length;
            if (avgGPA < 11) {
                recommendations += this.createInsightHTML(
                    'Enhance Academic Support',
                    'Implement peer tutoring, expand office hours, and create study skills workshops. Consider mandatory advising for students with GPA below 8.',
                    'Priority: Critical',
                    'critical'
                );
            }
        }

        // Retention check
        const completionRate = parseFloat(DataStore.calculateCompletionRate());
        if (completionRate < 70) {
            recommendations += this.createInsightHTML(
                'Improve Retention & Completion',
                'Establish early warning system for at-risk students. Create bridge programmes and enhance career counseling.',
                'Priority: High',
                'warning'
            );
        }

        // Programme performance — find lowest-performing school
        const schoolGPA = {};
        data.classifications.forEach(c => {
            if (!schoolGPA[c.school]) schoolGPA[c.school] = { sum: 0, count: 0 };
            schoolGPA[c.school].sum += c.final_gpa;
            schoolGPA[c.school].count++;
        });
        const schoolAvgs = Object.entries(schoolGPA)
            .map(([school, d]) => ({ school, avg: d.sum / d.count }))
            .sort((a, b) => a.avg - b.avg);
        if (schoolAvgs.length > 0 && schoolAvgs[0].avg < 11) {
            recommendations += this.createInsightHTML(
                'Programme Review & Enhancement',
                `${schoolAvgs[0].school} shows lower performance (avg GPA ${schoolAvgs[0].avg.toFixed(1)}). Conduct curriculum review and enhance faculty development.`,
                'Priority: Medium',
                'warning'
            );
        }

        // Gender balance
        const genderCounts = {};
        data.students.forEach(s => { genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1; });
        const genderEntries = Object.entries(genderCounts).sort((a, b) => b[1] - a[1]);
        if (genderEntries.length > 0) {
            const pct = (genderEntries[0][1] / data.students.length * 100).toFixed(1);
            if (pct > 65) {
                recommendations += this.createInsightHTML(
                    'Promote Diversity & Inclusion',
                    'Develop targeted recruitment for underrepresented groups. Create mentorship programmes and review admission criteria.',
                    'Priority: Medium',
                    'warning'
                );
            }
        }

        // Always include data-driven recommendation
        recommendations += this.createInsightHTML(
            'Leverage Analytics for Strategy',
            'Regularly monitor this dashboard to identify trends early. Use predictive analytics to forecast enrollment and identify at-risk students.',
            'Priority: Ongoing',
            'positive'
        );

        container.innerHTML = recommendations;
    }
};
