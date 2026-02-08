// Query Builder Module
const QueryBuilder = {
    currentFilters: {
        year: ['all'],
        school: ['all'],
        programme: ['all'],
        gender: ['all'],
        nationality: ['all']
    },

    // Initialize query builder
    initialize() {
        this.populateFilterOptions();
        this.attachEventListeners();
    },

    // Populate filter dropdowns with options from data
    populateFilterOptions() {
        // Years
        const years = DataLoader.getUniqueValues('academic_year', 'enrollments');
        const yearSelect = document.getElementById('filterYear');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        // Schools
        const schools = DataLoader.getUniqueValues('school', 'students');
        const schoolSelect = document.getElementById('filterSchool');
        schools.forEach(school => {
            const option = document.createElement('option');
            option.value = school;
            option.textContent = school;
            schoolSelect.appendChild(option);
        });

        // Programmes
        const programmes = DataLoader.getUniqueValues('programme', 'students');
        const programmeSelect = document.getElementById('filterProgramme');
        programmes.forEach(programme => {
            const option = document.createElement('option');
            option.value = programme;
            option.textContent = programme;
            programmeSelect.appendChild(option);
        });

        // Gender
        const genders = DataLoader.getUniqueValues('gender', 'students');
        const genderSelect = document.getElementById('filterGender');
        genders.forEach(gender => {
            const option = document.createElement('option');
            option.value = gender;
            option.textContent = gender;
            genderSelect.appendChild(option);
        });

        // Nationality
        const nationalities = DataLoader.getUniqueValues('nationality', 'students');
        const nationalitySelect = document.getElementById('filterNationality');
        nationalities.forEach(nationality => {
            const option = document.createElement('option');
            option.value = nationality;
            option.textContent = nationality;
            nationalitySelect.appendChild(option);
        });
    },

    // Attach event listeners
    attachEventListeners() {
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            DataLoader.exportToCSV();
        });
    },

    // Get selected values from multi-select
    getSelectedValues(selectId) {
        const select = document.getElementById(selectId);
        const selected = Array.from(select.selectedOptions).map(option => option.value);
        return selected.length === 0 || selected.includes('all') ? ['all'] : selected;
    },

    // Apply filters
    applyFilters() {
        // Get current filter selections
        this.currentFilters = {
            year: this.getSelectedValues('filterYear'),
            school: this.getSelectedValues('filterSchool'),
            programme: this.getSelectedValues('filterProgramme'),
            gender: this.getSelectedValues('filterGender'),
            nationality: this.getSelectedValues('filterNationality')
        };

        // Apply filters to data
        DataLoader.applyFilters(this.currentFilters);

        // Update header statistics
        this.updateHeaderStats();

        // Update all charts
        ChartsManager.updateAllCharts();

        // Generate insights
        InsightsGenerator.generateAllInsights();

        // Show success message
        this.showNotification('Filters applied successfully!', 'success');
    },

    // Reset all filters
    resetFilters() {
        // Reset select elements
        ['filterYear', 'filterSchool', 'filterProgramme', 'filterGender', 'filterNationality'].forEach(id => {
            const select = document.getElementById(id);
            Array.from(select.options).forEach(option => {
                option.selected = option.value === 'all';
            });
        });

        // Reset filters object
        this.currentFilters = {
            year: ['all'],
            school: ['all'],
            programme: ['all'],
            gender: ['all'],
            nationality: ['all']
        };

        // Reset data to show all
        DataLoader.applyFilters(this.currentFilters);

        // Update UI
        this.updateHeaderStats();
        ChartsManager.updateAllCharts();
        InsightsGenerator.generateAllInsights();

        this.showNotification('Filters reset to show all data', 'info');
    },

    // Update header statistics
    updateHeaderStats() {
        const data = DataLoader.getData();

        // Total students
        document.getElementById('totalStudents').textContent = data.students.length.toLocaleString();

        // Total enrollments
        document.getElementById('totalEnrollments').textContent = data.enrollments.length.toLocaleString();

        // Average GPA
        const allGPAs = data.students.map(s => parseFloat(DataLoader.calculateStudentGPA(s.student_id)));
        const avgGPA = allGPAs.reduce((a, b) => a + b, 0) / allGPAs.length;
        document.getElementById('avgGPA').textContent = avgGPA.toFixed(2);

        // Completion rate
        const completionRate = DataLoader.calculateCompletionRate();
        document.getElementById('completionRate').textContent = completionRate + '%';
    },

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
