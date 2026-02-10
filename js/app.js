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

    const fileInputs = body.querySelectorAll('input[type="file"]');

    // Toggle panel
    toggleHeader.addEventListener('click', () => {
        body.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed');
    });

    // Enable load button when all 6 files are selected
    function checkAllFiles() {
        const allSelected = Array.from(fileInputs).every(input => input.files.length > 0);
        loadBtn.disabled = !allSelected;
    }
    fileInputs.forEach(input => input.addEventListener('change', checkAllFiles));

    // Load imported data
    loadBtn.addEventListener('click', async () => {
        errorEl.style.display = 'none';
        progressEl.style.display = 'block';
        progressFill.style.width = '0%';
        loadBtn.disabled = true;

        const fileMap = {};
        fileInputs.forEach(input => {
            fileMap[input.dataset.key] = input.files[0];
        });

        try {
            await DataLoader.loadAllDataFromFiles(fileMap, (current, total, name) => {
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

        // Clear file inputs
        fileInputs.forEach(input => { input.value = ''; });
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
