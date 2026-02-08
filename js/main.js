// Main Application Entry Point
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Student Performance Analytics Dashboard...');

    try {
        // Show loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');

        // Load all data
        await DataLoader.loadAllData();
        console.log('Data loaded successfully');

        // Initialize query builder
        QueryBuilder.initialize();
        console.log('Query builder initialized');

        // Update header statistics
        QueryBuilder.updateHeaderStats();

        // Initialize all charts
        ChartsManager.initializeCharts();
        console.log('Charts initialized');

        // Generate insights
        InsightsGenerator.generateAllInsights();
        console.log('Insights generated');

        // Setup tab navigation
        setupTabNavigation();
        console.log('Tab navigation setup complete');

        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
        console.log('Dashboard ready!');

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        
        // Show error message
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.innerHTML = `
            <div style="text-align: center; color: #dc3545;">
                <h2>⚠️ Error Loading Dashboard</h2>
                <p style="margin: 20px 0;">Failed to load data. Please check:</p>
                <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
                    <li>CSV files are in the correct location (data/ folder)</li>
                    <li>CSV files are named correctly (students.csv, enrollments.csv, grades.csv)</li>
                    <li>The dashboard is being served from a web server (not opened directly as a file)</li>
                </ul>
                <p style="margin-top: 30px;">Error details: ${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
});

// Setup tab navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Log analytics (optional)
            console.log(`Switched to ${targetTab} tab`);
        });
    });
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Export functionality for external use
window.DashboardAPI = {
    // Get current filtered data
    getData: () => DataLoader.getData(),
    
    // Apply custom filters programmatically
    applyFilters: (filters) => {
        DataLoader.applyFilters(filters);
        QueryBuilder.updateHeaderStats();
        ChartsManager.updateAllCharts();
        InsightsGenerator.generateAllInsights();
    },
    
    // Export data
    exportData: () => DataLoader.exportToCSV(),
    
    // Get specific chart data
    getChartData: (chartName) => {
        const chart = ChartsManager.charts[chartName];
        return chart ? chart.data : null;
    },
    
    // Refresh all visualizations
    refresh: () => {
        QueryBuilder.updateHeaderStats();
        ChartsManager.updateAllCharts();
        InsightsGenerator.generateAllInsights();
    },
    
    // Get summary statistics
    getSummaryStats: () => {
        const data = DataLoader.getData();
        const allGPAs = data.students.map(s => parseFloat(DataLoader.calculateStudentGPA(s.student_id)));
        const avgGPA = (allGPAs.reduce((a, b) => a + b, 0) / allGPAs.length).toFixed(2);
        const completionRate = DataLoader.calculateCompletionRate();
        
        return {
            totalStudents: data.students.length,
            totalEnrollments: data.enrollments.length,
            totalGrades: data.grades.length,
            averageGPA: parseFloat(avgGPA),
            completionRate: parseFloat(completionRate),
            schools: [...new Set(data.students.map(s => s.school))],
            programmes: [...new Set(data.students.map(s => s.programme))],
            yearRange: {
                earliest: Math.min(...data.students.map(s => parseInt(s.entry_year))),
                latest: Math.max(...data.students.map(s => parseInt(s.entry_year)))
            }
        };
    }
};

// Print functionality
window.print = function() {
    window.print();
};

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + E for export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        DataLoader.exportToCSV();
    }
    
    // Ctrl/Cmd + R for refresh (default behavior is fine)
    // Ctrl/Cmd + P for print (default behavior is fine)
});

// Responsive handling
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Redraw charts on resize for better responsiveness
        Object.values(ChartsManager.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }, 250);
});

// Log dashboard info to console
console.log('%c Student Performance Analytics Dashboard ', 'background: #0066cc; color: white; font-size: 16px; padding: 10px;');
console.log('%c AFG College with University of Aberdeen ', 'background: #004499; color: white; font-size: 12px; padding: 5px;');
console.log('%c MSc Data Science Project 2025-2026 ', 'background: #28a745; color: white; font-size: 12px; padding: 5px;');
console.log('');
console.log('Dashboard API available via window.DashboardAPI');
console.log('');
console.log('Keyboard Shortcuts:');
console.log('- Ctrl/Cmd + E: Export filtered data');
console.log('- Ctrl/Cmd + P: Print dashboard');
console.log('- Ctrl/Cmd + R: Refresh page');
