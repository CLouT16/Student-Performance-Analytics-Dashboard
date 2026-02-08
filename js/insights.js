// Insights Generator Module
const InsightsGenerator = {
    
    // Generate all insights
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

    // Generate enrollment insights
    generateEnrollmentInsights() {
        const data = DataLoader.getData();
        const container = document.getElementById('enrollmentInsights');
        let insights = '';

        // Calculate enrollment growth
        const yearCounts = {};
        data.enrollments.forEach(e => {
            yearCounts[e.academic_year] = (yearCounts[e.academic_year] || 0) + 1;
        });

        const years = Object.keys(yearCounts).sort();
        if (years.length >= 2) {
            const latest = yearCounts[years[years.length - 1]];
            const previous = yearCounts[years[years.length - 2]];
            const growth = ((latest - previous) / previous * 100).toFixed(1);
            
            const growthType = growth > 0 ? 'positive' : (growth < 0 ? 'critical' : 'warning');
            insights += this.createInsightHTML(
                'Enrollment Growth Trend',
                `Enrollment has ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth)}% from ${years[years.length - 2]} to ${years[years.length - 1]}. ${growth > 0 ? 'Strong recruitment strategies are working effectively.' : 'Review marketing and recruitment strategies to reverse this trend.'}`,
                `${growth > 0 ? '+' : ''}${growth}% Change`,
                growthType
            );
        }

        // School distribution
        const schoolCounts = {};
        data.students.forEach(s => {
            schoolCounts[s.school] = (schoolCounts[s.school] || 0) + 1;
        });

        const topSchool = Object.entries(schoolCounts).sort((a, b) => b[1] - a[1])[0];
        if (topSchool) {
            const percentage = (topSchool[1] / data.students.length * 100).toFixed(1);
            insights += this.createInsightHTML(
                'Highest Enrollment School',
                `${topSchool[0]} has the highest enrollment with ${topSchool[1]} students (${percentage}% of total). Consider expanding capacity or resources for this school.`,
                `${topSchool[1]} Students`,
                'positive'
            );
        }

        // Programme diversity
        const uniqueProgrammes = new Set(data.students.map(s => s.programme)).size;
        insights += this.createInsightHTML(
            'Programme Diversity',
            `AFG College offers ${uniqueProgrammes} different programmes, providing diverse academic pathways for students. ${uniqueProgrammes > 10 ? 'Strong programme portfolio.' : 'Consider expanding programme offerings to attract more diverse student interests.'}`,
            `${uniqueProgrammes} Programmes`,
            uniqueProgrammes > 10 ? 'positive' : 'warning'
        );

        container.innerHTML = insights;
    },

    // Generate performance insights
    generatePerformanceInsights() {
        const data = DataLoader.getData();
        const container = document.getElementById('performanceInsights');
        let insights = '';

        // Calculate overall pass rate
        const totalGrades = data.grades.length;
        const passedGrades = data.grades.filter(g => g.is_passed).length;
        const passRate = (passedGrades / totalGrades * 100).toFixed(1);

        const passType = passRate >= 80 ? 'positive' : (passRate >= 70 ? 'warning' : 'critical');
        insights += this.createInsightHTML(
            'Overall Pass Rate',
            `Current pass rate is ${passRate}%. ${passRate >= 80 ? 'Excellent academic performance across programmes.' : passRate >= 70 ? 'Performance is acceptable but has room for improvement. Consider additional academic support.' : 'Critical: Pass rate is below acceptable threshold. Immediate intervention required.'}`,
            `${passRate}% Pass Rate`,
            passType
        );

        // Average GPA
        const allGPAs = data.students.map(s => parseFloat(DataLoader.calculateStudentGPA(s.student_id)));
        const avgGPA = (allGPAs.reduce((a, b) => a + b, 0) / allGPAs.length).toFixed(2);

        const gpaType = avgGPA >= 3.0 ? 'positive' : (avgGPA >= 2.5 ? 'warning' : 'critical');
        insights += this.createInsightHTML(
            'Average Student GPA',
            `The average GPA across all students is ${avgGPA}. ${avgGPA >= 3.0 ? 'Strong overall academic achievement.' : avgGPA >= 2.5 ? 'GPA indicates moderate performance. Targeted academic support could improve outcomes.' : 'Low GPA requires comprehensive academic intervention strategies.'}`,
            `${avgGPA} GPA`,
            gpaType
        );

        // School performance comparison
        const schoolPerformance = {};
        data.students.forEach(s => {
            if (!schoolPerformance[s.school]) {
                schoolPerformance[s.school] = [];
            }
            const gpa = parseFloat(DataLoader.calculateStudentGPA(s.student_id));
            schoolPerformance[s.school].push(gpa);
        });

        const schoolAvgs = Object.entries(schoolPerformance).map(([school, gpas]) => ({
            school,
            avgGPA: (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)
        })).sort((a, b) => b.avgGPA - a.avgGPA);

        if (schoolAvgs.length > 0) {
            insights += this.createInsightHTML(
                'Top Performing School',
                `${schoolAvgs[0].school} leads in academic performance with an average GPA of ${schoolAvgs[0].avgGPA}. Share best practices from this school with others to elevate overall performance.`,
                `${schoolAvgs[0].avgGPA} GPA`,
                'positive'
            );
        }

        // Grade distribution analysis
        const gradeCounts = {};
        data.grades.forEach(g => {
            gradeCounts[g.cgs_grade] = (gradeCounts[g.cgs_grade] || 0) + 1;
        });

        const aGrades = (gradeCounts['A1'] || 0) + (gradeCounts['A2'] || 0) + (gradeCounts['A3'] || 0);
        const aPercentage = (aGrades / totalGrades * 100).toFixed(1);

        insights += this.createInsightHTML(
            'Excellence Rate (A Grades)',
            `${aPercentage}% of all grades are A grades (A1, A2, A3). ${aPercentage >= 30 ? 'Exceptional academic excellence.' : aPercentage >= 20 ? 'Good proportion of high achievers. Encourage more students to reach this level.' : 'Low excellence rate suggests need for honors programs or enrichment activities.'}`,
            `${aPercentage}% A Grades`,
            aPercentage >= 30 ? 'positive' : (aPercentage >= 20 ? 'warning' : 'critical')
        );

        container.innerHTML = insights;
    },

    // Generate retention insights
    generateRetentionInsights() {
        const data = DataLoader.getData();
        const container = document.getElementById('retentionInsights');
        let insights = '';

        // Calculate average retention rate
        const years = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        const retentionRates = years.map(y => parseFloat(DataLoader.calculateRetentionRate(y))).filter(r => r > 0);
        const avgRetention = retentionRates.length > 0 ? (retentionRates.reduce((a, b) => a + b, 0) / retentionRates.length).toFixed(1) : 0;

        const retentionType = avgRetention >= 85 ? 'positive' : (avgRetention >= 75 ? 'warning' : 'critical');
        insights += this.createInsightHTML(
            'Average Retention Rate',
            `The average first-year to second-year retention rate is ${avgRetention}%. ${avgRetention >= 85 ? 'Excellent student retention.' : avgRetention >= 75 ? 'Retention is acceptable but could be improved with enhanced student support services.' : 'Critical retention issue. Conduct exit interviews and implement comprehensive student success initiatives.'}`,
            `${avgRetention}% Retention`,
            retentionType
        );

        // Completion rate
        const completionRate = parseFloat(DataLoader.calculateCompletionRate());
        const completionType = completionRate >= 70 ? 'positive' : (completionRate >= 60 ? 'warning' : 'critical');
        
        insights += this.createInsightHTML(
            'Programme Completion Rate',
            `${completionRate}% of eligible students have completed their degrees. ${completionRate >= 70 ? 'Strong completion rates indicate effective academic support.' : completionRate >= 60 ? 'Moderate completion rate. Review barriers to degree completion.' : 'Low completion rate requires urgent attention to degree pathway obstacles.'}`,
            `${completionRate}% Completion`,
            completionType
        );

        // Attrition by status
        const statusCounts = {};
        data.students.forEach(s => {
            statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
        });

        const droppedCount = statusCounts['Dropped'] || 0;
        const attritionRate = (droppedCount / data.students.length * 100).toFixed(1);

        insights += this.createInsightHTML(
            'Student Attrition Rate',
            `${attritionRate}% of students have dropped out. ${attritionRate < 10 ? 'Low attrition rate indicates strong student support systems.' : attritionRate < 20 ? 'Moderate attrition. Implement early warning systems to identify at-risk students.' : 'High attrition rate requires comprehensive review of student support services and academic policies.'}`,
            `${attritionRate}% Attrition`,
            attritionRate < 10 ? 'positive' : (attritionRate < 20 ? 'warning' : 'critical')
        );

        // Time to completion analysis
        const graduates = data.students.filter(s => s.status === 'Graduated');
        const onTimeGraduates = graduates.filter(s => {
            const yearsSinceEntry = 2025 - parseInt(s.entry_year);
            return yearsSinceEntry <= 4;
        }).length;

        const onTimeRate = graduates.length > 0 ? (onTimeGraduates / graduates.length * 100).toFixed(1) : 0;

        insights += this.createInsightHTML(
            'On-Time Graduation Rate',
            `${onTimeRate}% of graduates completed their degree in 4 years or less. ${onTimeRate >= 70 ? 'Excellent progression rates.' : onTimeRate >= 50 ? 'Many students taking longer than expected. Review course availability and academic advising.' : 'Low on-time completion suggests significant barriers to timely graduation.'}`,
            `${onTimeRate}% On-Time`,
            onTimeRate >= 70 ? 'positive' : (onTimeRate >= 50 ? 'warning' : 'critical')
        );

        container.innerHTML = insights;
    },

    // Generate demographic insights
    generateDemographicInsights() {
        const data = DataLoader.getData();
        const container = document.getElementById('demographicInsights');
        let insights = '';

        // Gender balance
        const genderCounts = {};
        data.students.forEach(s => {
            genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
        });

        const genderEntries = Object.entries(genderCounts).sort((a, b) => b[1] - a[1]);
        const dominant = genderEntries[0];
        const dominantPercentage = (dominant[1] / data.students.length * 100).toFixed(1);

        const genderType = dominantPercentage >= 60 ? 'warning' : 'positive';
        insights += this.createInsightHTML(
            'Gender Distribution',
            `${dominant[0]} students represent ${dominantPercentage}% of the student body. ${dominantPercentage >= 60 ? 'Consider targeted recruitment to improve gender diversity.' : 'Good gender balance promotes diverse perspectives and inclusive learning environment.'}`,
            `${dominantPercentage}% ${dominant[0]}`,
            genderType
        );

        // International diversity
        const nationalityCounts = {};
        data.students.forEach(s => {
            nationalityCounts[s.nationality] = (nationalityCounts[s.nationality] || 0) + 1;
        });

        const uniqueNationalities = Object.keys(nationalityCounts).length;
        insights += this.createInsightHTML(
            'International Diversity',
            `Students represent ${uniqueNationalities} different nationalities, creating a rich multicultural learning environment. ${uniqueNationalities > 20 ? 'Excellent international diversity.' : 'Consider expanding international recruitment efforts.'}`,
            `${uniqueNationalities} Nationalities`,
            uniqueNationalities > 20 ? 'positive' : 'warning'
        );

        // Age distribution
        const ages = data.students.map(s => parseInt(s.age));
        const avgAge = (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
        const traditionalAge = ages.filter(a => a <= 24).length;
        const traditionalPercentage = (traditionalAge / ages.length * 100).toFixed(1);

        insights += this.createInsightHTML(
            'Student Age Profile',
            `Average student age is ${avgAge} years, with ${traditionalPercentage}% being traditional college age (≤24). ${traditionalPercentage >= 75 ? 'Predominantly traditional-age students.' : 'Significant non-traditional student population requires flexible scheduling and support services.'}`,
            `${avgAge} Average Age`,
            'positive'
        );

        // Disability support
        const disabledCount = data.students.filter(s => s.is_disabled).length;
        const disabilityPercentage = (disabledCount / data.students.length * 100).toFixed(1);

        insights += this.createInsightHTML(
            'Accessibility & Support',
            `${disabilityPercentage}% of students have disclosed disabilities. Ensure adequate accessibility accommodations and support services are available for all students.`,
            `${disabledCount} Students`,
            'positive'
        );

        container.innerHTML = insights;
    },

    // Generate strategic recommendations
    generateStrategicRecommendations() {
        const data = DataLoader.getData();
        const container = document.getElementById('strategicRecommendations');
        let recommendations = '';

        // Recommendation 1: Enrollment strategy
        const yearCounts = {};
        data.enrollments.forEach(e => {
            yearCounts[e.academic_year] = (yearCounts[e.academic_year] || 0) + 1;
        });

        const years = Object.keys(yearCounts).sort();
        if (years.length >= 2) {
            const latest = yearCounts[years[years.length - 1]];
            const previous = yearCounts[years[years.length - 2]];
            const growth = ((latest - previous) / previous * 100).toFixed(1);

            if (growth < 0) {
                recommendations += this.createInsightHTML(
                    '📈 Boost Enrollment Growth',
                    'Develop targeted marketing campaigns for underperforming programmes. Partner with local schools for recruitment events. Consider offering scholarships for high-achieving students.',
                    'Priority: High',
                    'critical'
                );
            }
        }

        // Recommendation 2: Academic support
        const allGPAs = data.students.map(s => parseFloat(DataLoader.calculateStudentGPA(s.student_id)));
        const avgGPA = (allGPAs.reduce((a, b) => a + b, 0) / allGPAs.length).toFixed(2);

        if (avgGPA < 2.5) {
            recommendations += this.createInsightHTML(
                '📚 Enhance Academic Support',
                'Implement peer tutoring programmes, expand office hours, and create study skills workshops. Consider mandatory academic advising for students with GPA below 2.0.',
                'Priority: Critical',
                'critical'
            );
        }

        // Recommendation 3: Retention initiatives
        const completionRate = parseFloat(DataLoader.calculateCompletionRate());
        if (completionRate < 70) {
            recommendations += this.createInsightHTML(
                '🎓 Improve Retention & Completion',
                'Establish early warning system for at-risk students. Create bridge programmes for transitioning between academic years. Enhance career counseling and internship opportunities.',
                'Priority: High',
                'warning'
            );
        }

        // Recommendation 4: Programme optimization
        const schoolPerformance = {};
        data.students.forEach(s => {
            if (!schoolPerformance[s.school]) {
                schoolPerformance[s.school] = [];
            }
            const gpa = parseFloat(DataLoader.calculateStudentGPA(s.student_id));
            schoolPerformance[s.school].push(gpa);
        });

        const schoolAvgs = Object.entries(schoolPerformance).map(([school, gpas]) => ({
            school,
            avgGPA: gpas.reduce((a, b) => a + b, 0) / gpas.length
        })).sort((a, b) => a.avgGPA - b.avgGPA);

        if (schoolAvgs.length > 0 && schoolAvgs[0].avgGPA < 2.5) {
            recommendations += this.createInsightHTML(
                '🔄 Programme Review & Enhancement',
                `${schoolAvgs[0].school} shows lower performance metrics. Conduct curriculum review, enhance faculty development, and implement quality assurance measures.`,
                'Priority: Medium',
                'warning'
            );
        }

        // Recommendation 5: Diversity initiatives
        const genderCounts = {};
        data.students.forEach(s => {
            genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
        });

        const genderEntries = Object.entries(genderCounts).sort((a, b) => b[1] - a[1]);
        if (genderEntries.length > 0) {
            const dominantPercentage = (genderEntries[0][1] / data.students.length * 100).toFixed(1);
            
            if (dominantPercentage > 65) {
                recommendations += this.createInsightHTML(
                    '👥 Promote Diversity & Inclusion',
                    'Develop targeted recruitment strategies for underrepresented groups. Create mentorship programmes and affinity groups. Review admission criteria for potential bias.',
                    'Priority: Medium',
                    'warning'
                );
            }
        }

        // Recommendation 6: Data-driven decision making
        recommendations += this.createInsightHTML(
            '💡 Leverage Analytics for Strategy',
            'Regularly monitor this dashboard to identify trends early. Use predictive analytics to forecast enrollment and identify at-risk students before they struggle.',
            'Priority: Ongoing',
            'positive'
        );

        container.innerHTML = recommendations;
    }
};
