// Query Panel — filter management, cascading dropdowns, filter chips
const QueryPanel = {
    searchTimeout: null,

    initialize() {
        this.populateFilters();
        this.attachEventListeners();
        this.updateFilterCount();
    },

    // Populate all filter dropdowns from data
    populateFilters() {
        this.fillSelect('filterYear', DataStore.getAcademicYears());
        this.fillSelect('filterSchool', DataStore.getSchools());
        this.fillSelect('filterProgramme', DataStore.getProgrammes());
        this.fillSelect('filterGender', DataStore.getGenders());
        this.fillSelect('filterNationality', DataStore.getNationalities());
        this.fillSelect('filterAttendance', DataStore.getAttendanceStatuses());
        this.fillSelect('filterClassification', DataStore.getClassifications().map(c => ({
            value: c,
            label: c.startsWith('Borderline') ? c + ' *' : c
        })));
        this.fillSelect('filterEntryLevel', DataStore.getEntryLevels().map(l => ({ value: l, label: 'Level ' + l })));
    },

    fillSelect(id, options) {
        const select = document.getElementById(id);
        if (!select) return;
        // Keep the first "All" option
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);

        options.forEach(opt => {
            const el = document.createElement('option');
            if (typeof opt === 'object' && opt.value !== undefined) {
                el.value = opt.value;
                el.textContent = opt.label;
            } else {
                el.value = opt;
                el.textContent = opt;
            }
            select.appendChild(el);
        });
    },

    attachEventListeners() {
        // Apply filters
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());

        // Reset
        document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());

        // Export
        document.getElementById('exportData').addEventListener('click', () => DataStore.exportToCSV());

        // Toggle filter panel (mobile)
        const toggleBtn = document.getElementById('toggleFilters');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const body = document.getElementById('filtersBody');
                body.classList.toggle('collapsed');
                toggleBtn.classList.toggle('collapsed');
            });
        }

        // Cascading: School → Programme
        document.getElementById('filterSchool').addEventListener('change', (e) => {
            const school = e.target.value || null;
            const programmes = DataStore.getProgrammes(school);
            this.fillSelect('filterProgramme', programmes);
        });

        // Debounced search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.applyFilters(), 400);
            });
        }

        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    },

    // Gather filter values and apply
    applyFilters() {
        const filters = {
            year: this.val('filterYear'),
            school: this.val('filterSchool'),
            programme: this.val('filterProgramme'),
            gender: this.val('filterGender'),
            nationality: this.val('filterNationality'),
            attendanceStatus: this.val('filterAttendance'),
            classification: this.val('filterClassification'),
            entryLevel: this.val('filterEntryLevel'),
            search: (document.getElementById('searchInput')?.value || '').trim() || null
        };

        DataStore.applyFilters(filters);
        this.updateAll();
        this.renderChips(filters);
        this.updateFilterCount();
        this.showNotification('Filters applied');
    },

    resetFilters() {
        ['filterYear', 'filterSchool', 'filterProgramme', 'filterGender',
         'filterNationality', 'filterAttendance', 'filterClassification', 'filterEntryLevel'
        ].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const search = document.getElementById('searchInput');
        if (search) search.value = '';

        // Re-populate programme (remove cascading restriction)
        this.fillSelect('filterProgramme', DataStore.getProgrammes());

        DataStore.resetFilters();
        this.updateAll();
        this.renderChips({});
        this.updateFilterCount();
        this.showNotification('Filters reset');
    },

    // Update all visualizations
    updateAll() {
        this.updateHeaderStats();
        ChartsManager.updateAllCharts();
        TablesManager.renderAllTables();
        InsightsGenerator.generateAllInsights();
    },

    // Update header stat cards
    updateHeaderStats() {
        document.getElementById('totalApplicants').textContent = DataStore.getTotalApplicants().toLocaleString();
        document.getElementById('registeredStudents').textContent = DataStore.getUniqueRegisteredStudents().toLocaleString();

        const avgGPA = DataStore.calculateAverageGPA();
        document.getElementById('avgGPA').textContent = avgGPA > 0 ? avgGPA : 'N/A';

        const avgAtt = DataStore.calculateAverageAttendance();
        document.getElementById('avgAttendance').textContent = avgAtt > 0 ? avgAtt + '%' : 'N/A';

        document.getElementById('completionRate').textContent = DataStore.calculateCompletionRate() + '%';
    },

    // Show filter count
    updateFilterCount() {
        const total = DataLoader.students.length;
        const filtered = DataStore.getData().students.length;
        const el = document.getElementById('filterCount');
        if (el) {
            el.textContent = filtered < total
                ? `Showing ${filtered.toLocaleString()} of ${total.toLocaleString()} students`
                : `${total.toLocaleString()} students`;
        }
    },

    // Render filter chips
    renderChips(filters) {
        const container = document.getElementById('filterChips');
        if (!container) return;
        container.innerHTML = '';

        const chipDefs = [
            { key: 'year', label: 'Year', selectId: 'filterYear' },
            { key: 'school', label: 'School', selectId: 'filterSchool' },
            { key: 'programme', label: 'Programme', selectId: 'filterProgramme' },
            { key: 'gender', label: 'Gender', selectId: 'filterGender' },
            { key: 'nationality', label: 'Nationality', selectId: 'filterNationality' },
            { key: 'attendanceStatus', label: 'Attendance', selectId: 'filterAttendance' },
            { key: 'classification', label: 'Classification', selectId: 'filterClassification' },
            { key: 'entryLevel', label: 'Entry Level', selectId: 'filterEntryLevel' },
        ];

        chipDefs.forEach(def => {
            if (filters[def.key]) {
                this.addChip(container, `${def.label}: ${filters[def.key]}`, () => {
                    document.getElementById(def.selectId).value = '';
                    this.applyFilters();
                });
            }
        });

        if (filters.search) {
            this.addChip(container, `Search: "${filters.search}"`, () => {
                document.getElementById('searchInput').value = '';
                this.applyFilters();
            });
        }
    },

    addChip(container, text, onRemove) {
        const chip = document.createElement('span');
        chip.className = 'filter-chip';
        chip.innerHTML = `${text} <span class="chip-remove">&times;</span>`;
        chip.querySelector('.chip-remove').addEventListener('click', onRemove);
        container.appendChild(chip);
    },

    // Tab switching
    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        const sectionMap = {
            enrollment: 'enrollmentSection',
            performance: 'performanceSection',
            comparison: 'comparisonSection',
            retention: 'retentionSection',
            demographics: 'demographicsSection',
            insights: 'insightsSection',
            assistant: 'assistantSection'
        };
        document.getElementById(sectionMap[tabName]).classList.add('active');
    },

    // Helpers
    val(id) {
        const el = document.getElementById(id);
        return (el && el.value) ? el.value : null;
    },

    numVal(id) {
        const el = document.getElementById(id);
        if (!el || el.value === '') return null;
        const n = parseFloat(el.value);
        return isNaN(n) ? null : n;
    },

    showNotification(message) {
        const n = document.createElement('div');
        n.className = 'notification';
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 2500);
    }
};
