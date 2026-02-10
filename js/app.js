// App Entry Point — initialization with progress feedback
let dashboardInitialized = false;

// First-time dashboard setup (creates charts, tables, query panel)
function initializeDashboard() {
    DataStore.initialize();
    ChartsManager.initializeCharts();
    TablesManager.renderAllTables();
    QueryPanel.initialize();
    InsightsGenerator.generateAllInsights();
    QueryPanel.updateHeaderStats();
    dashboardInitialized = true;
}

// Reimport — update existing charts/tables with new data (no duplicate Chart.js instances)
function reinitializeDashboard() {
    DataStore.initialize();
    ChartsManager.updateAllCharts();
    TablesManager.renderAllTables();
    QueryPanel.populateFilters();
    InsightsGenerator.generateAllInsights();
    QueryPanel.updateHeaderStats();
    QueryPanel.updateFilterCount();
}

// Wire up import panel events
function setupImportPanel() {
    const toggleBtn = document.getElementById('importToggleBtn');
    const toggleHeader = document.getElementById('importToggle');
    const body = document.getElementById('importBody');
    const loadBtn = document.getElementById('loadImportedData');
    const resetBtn = document.getElementById('resetToDefault');
    const errorEl = document.getElementById('importError');
    const progressEl = document.getElementById('importProgress');
    const progressFill = document.getElementById('importProgressFill');
    const progressText = document.getElementById('importProgressText');

    // New dropdown-based import UI
    const fileTypeSelect = document.getElementById('importFileType');
    const fileInput = document.getElementById('importFileInput');

    // Track imported files by type
    const importedFiles = {};
    const allKeys = ['admissions', 'currentStudents', 'enrollments', 'attendance', 'classifications', 'courseResults'];

    // Toggle panel
    toggleHeader.addEventListener('click', () => {
        body.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed');
    });

    // Check if all 6 files are loaded and enable button
    function checkAllFiles() {
        loadBtn.disabled = !allKeys.every(k => importedFiles[k]);
    }

    // Mark loaded options in the dropdown
    function updateDropdownLabels() {
        const options = fileTypeSelect.querySelectorAll('option');
        options.forEach(opt => {
            if (opt.value && importedFiles[opt.value]) {
                if (!opt.textContent.endsWith(' \u2714')) opt.textContent += ' \u2714';
            }
        });
    }

    // When a file is selected, store it for the chosen type
    fileInput.addEventListener('change', () => {
        const selectedType = fileTypeSelect.value;
        if (!selectedType) {
            showNotification('Please select a file type first.');
            fileInput.value = '';
            return;
        }
        if (fileInput.files.length > 0) {
            importedFiles[selectedType] = fileInput.files[0];
            updateDropdownLabels();
            checkAllFiles();
            const loaded = allKeys.filter(k => importedFiles[k]).length;
            showNotification(`${selectedType} loaded (${loaded}/6).`);
            // Reset for next file
            fileTypeSelect.value = '';
            fileInput.value = '';
        }
    });

    // Load imported data
    loadBtn.addEventListener('click', async () => {
        errorEl.style.display = 'none';
        progressEl.style.display = 'block';
        progressFill.style.width = '0%';
        loadBtn.disabled = true;

        try {
            await DataLoader.loadAllDataFromFiles(importedFiles, (current, total, name) => {
                const pct = Math.round((current / total) * 100);
                progressFill.style.width = pct + '%';
                progressText.textContent = `Validating & loading ${name} (${current}/${total})...`;
            });

            progressText.textContent = 'Rebuilding dashboard...';

            if (dashboardInitialized) {
                reinitializeDashboard();
            } else {
                initializeDashboard();
            }

            progressEl.style.display = 'none';
            showNotification('Custom data loaded successfully.');
        } catch (err) {
            progressEl.style.display = 'none';
            errorEl.textContent = err.message || 'Failed to load imported data.';
            errorEl.style.display = 'block';
            loadBtn.disabled = false;
        }
    });

    // Reset to default bundled data
    resetBtn.addEventListener('click', async () => {
        errorEl.style.display = 'none';
        progressEl.style.display = 'block';
        progressFill.style.width = '0%';

        // Clear imported files
        Object.keys(importedFiles).forEach(k => delete importedFiles[k]);
        fileTypeSelect.value = '';
        fileInput.value = '';
        checkAllFiles();
        loadBtn.disabled = true;

        try {
            await DataLoader.loadAllData((current, total, name) => {
                const pct = Math.round((current / total) * 100);
                progressFill.style.width = pct + '%';
                progressText.textContent = `Loading default ${name} (${current}/${total})...`;
            });

            progressText.textContent = 'Rebuilding dashboard...';

            if (dashboardInitialized) {
                reinitializeDashboard();
            } else {
                initializeDashboard();
            }

            progressEl.style.display = 'none';
            showNotification('Default data restored.');
        } catch (err) {
            progressEl.style.display = 'none';
            errorEl.textContent = err.message || 'Failed to reload default data.';
            errorEl.style.display = 'block';
        }
    });
}

// Wire up Management Overview collapsible toggle
function setupManagementOverviewToggle() {
    const toggleHeader = document.getElementById('managementOverviewToggle');
    const toggleBtn = document.getElementById('managementOverviewToggleBtn');
    const body = document.getElementById('managementOverviewBody');
    if (!toggleHeader || !body) return;

    toggleHeader.addEventListener('click', () => {
        body.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed');
    });
}

// Simple notification helper
function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'notification';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}


// Wire up chart toggle buttons (year toggles, normalize toggles)
function setupChartToggles() {
    // Normalize toggle buttons (Count / 100%)
    document.querySelectorAll('.chart-toggles [data-chart]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartKey = btn.dataset.chart;
            const mode = btn.dataset.mode;
            // Update active state within this toggle group
            btn.closest('.chart-toggles').querySelectorAll('.chart-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const normalized = mode === 'normalized';
            if (chartKey === 'recruitmentEffectiveness') {
                ChartsManager.updateRecruitmentEffectivenessChart(normalized);
            } else if (chartKey === 'classificationByProg') {
                ChartsManager.updateClassificationByProgChart(normalized);
            } else if (chartKey === 'passRate') {
                ChartsManager.updatePassFailSchoolChart(normalized);
            } else if (chartKey === 'performanceMatrix') {
                ChartsManager.updatePerformanceMatrixChart(normalized);
            } else if (chartKey === 'proficiency') {
                ChartsManager.updateProficiencyChart(normalized);
            } else if (chartKey === 'gpaDistribution') {
                ChartsManager.updateGPADistributionChart(mode);
            } else if (chartKey === 'coursePassRate') {
                ChartsManager.updateCoursePassRateChart(mode);
            } else if (chartKey === 'programmeComparison') {
                ChartsManager.updateProgrammeComparisonChart(normalized);
            } else if (chartKey === 'cohortCompletion') {
                ChartsManager.updateCohortCompletionChart(normalized);
            } else if (chartKey === 'retentionRate') {
                ChartsManager.updateRetentionRateChart(mode === 'normalized' ? 'normalized' : 'absolute');
            } else if (chartKey === 'genderDist') {
                ChartsManager.updateGenderDistChart(normalized);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    try {
        overlay.style.display = 'flex';

        // Load all CSV data with progress
        await DataLoader.loadAllData((current, total, name) => {
            if (loadingText) {
                loadingText.textContent = `Loading file ${current} of ${total} (${name})...`;
            }
        });

        if (loadingText) loadingText.textContent = 'Initializing dashboard...';

        initializeDashboard();

        // Wire up import panel
        setupImportPanel();

        // Wire up Management Overview toggle
        setupManagementOverviewToggle();

        // Wire up chart toggle buttons
        setupChartToggles();

        // AI Assistant
        Assistant.initialize();

        // Export PDF button
        const exportPDFBtn = document.getElementById('exportPDF');
        if (exportPDFBtn) {
            exportPDFBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Hide loading overlay
        overlay.style.display = 'none';

        console.log('Dashboard initialized successfully.');

    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        overlay.innerHTML = `
            <div style="text-align: center; color: #e53e3e; max-width: 500px; padding: 40px;">
                <h2 style="margin-bottom: 12px; font-size: 22px;">Error Loading Dashboard</h2>
                <p style="margin-bottom: 16px; color: #4a5568;">Failed to load data files. Please check:</p>
                <ul style="text-align: left; margin: 0 auto 24px; max-width: 400px; color: #4a5568; line-height: 2;">
                    <li>CSV files are in the <code>data/</code> directory</li>
                    <li>File 06 has been generated (run <code>scripts/combine_course_results.py</code>)</li>
                    <li>The dashboard is served from a web server (not file://)</li>
                </ul>
                <p style="font-size: 12px; color: #a0aec0; margin-bottom: 16px;">Error: ${error.message || error}</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
});
