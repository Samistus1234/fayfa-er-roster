// Consultation Log Table Enhancer - Makes dates clickable
class ConsultationLogTableEnhancer {
    constructor() {
        this.consultationLogs = [];
        this.doctors = [];
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Fetch consultation logs and doctors data
            await this.loadData();
            this.isInitialized = true;
            console.log('Consultation Log Table Enhancer initialized');
        } catch (error) {
            console.error('Error initializing Consultation Log Table Enhancer:', error);
        }
    }

    async loadData() {
        try {
            // Load consultation logs
            const logsResponse = await fetch('/api/consultation-logs');
            this.consultationLogs = await logsResponse.json();

            // Load doctors
            const doctorsResponse = await fetch('/api/doctors');
            this.doctors = await doctorsResponse.json();

            console.log('Loaded consultation logs:', this.consultationLogs.length);
            console.log('Loaded doctors:', this.doctors.length);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Function to enhance any table by making dates clickable
    enhanceTable(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (!table) {
            console.warn('Table not found:', tableSelector);
            return;
        }

        // Find all date cells and make them clickable
        const dateCells = table.querySelectorAll('td, div');
        dateCells.forEach(cell => {
            const text = cell.textContent.trim();
            // Check if the text matches a date pattern (YYYY-MM-DD)
            if (this.isDateFormat(text)) {
                this.makeDateClickable(cell, text);
            }
        });
    }

    // Check if text is in date format
    isDateFormat(text) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        return datePattern.test(text);
    }

    // Make a date cell clickable
    makeDateClickable(cell, date) {
        // Don't enhance if already enhanced
        if (cell.classList.contains('date-enhanced')) {
            return;
        }

        cell.classList.add('date-enhanced');
        cell.style.cursor = 'pointer';
        cell.style.color = '#3b82f6';
        cell.style.textDecoration = 'underline';
        cell.style.transition = 'all 0.3s ease';

        // Add hover effect
        cell.addEventListener('mouseenter', () => {
            cell.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            cell.style.transform = 'translateX(4px)';
        });

        cell.addEventListener('mouseleave', () => {
            cell.style.backgroundColor = '';
            cell.style.transform = '';
        });

        // Add click handler
        cell.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openDateModal(date);
        });

        // Add icon
        if (!cell.querySelector('.date-icon')) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-calendar-day date-icon';
            icon.style.marginRight = '6px';
            icon.style.fontSize = '12px';
            icon.style.opacity = '0.7';
            cell.insertBefore(icon, cell.firstChild);
        }
    }

    // Open the date modal with filtered data
    openDateModal(selectedDate) {
        if (!this.isInitialized) {
            console.warn('Enhancer not initialized yet');
            return;
        }

        if (window.dateConsultationModal) {
            window.dateConsultationModal.open(selectedDate, this.consultationLogs, this.doctors);
        } else {
            console.error('Date consultation modal not available');
        }
    }

    // Auto-enhance tables based on common selectors
    autoEnhanceTables() {
        const commonSelectors = [
            '.consultation-table-container',
            '.table-container',
            'table',
            '.data-table',
            '.consultation-logs-table'
        ];

        commonSelectors.forEach(selector => {
            this.enhanceTable(selector);
        });
    }

    // Watch for dynamically added tables
    startWatching() {
        // Use MutationObserver to watch for new tables
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node contains tables
                        const tables = node.querySelectorAll ?
                            node.querySelectorAll('table, .table-container, .consultation-table-container') :
                            [];

                        tables.forEach(table => {
                            this.enhanceTable(`#${table.id}` || table.className);
                        });

                        // Also check if the node itself is a table
                        if (node.matches && node.matches('table, .table-container, .consultation-table-container')) {
                            this.enhanceTable(`#${node.id}` || `.${node.className.split(' ')[0]}`);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Started watching for new tables');
    }

    // Method to refresh data
    async refreshData() {
        await this.loadData();
        this.autoEnhanceTables();
    }
}

// Global function to enhance consultation logs table
window.enhanceConsultationLogsTable = function() {
    if (window.consultationLogEnhancer) {
        window.consultationLogEnhancer.autoEnhanceTables();
    }
};

// Global function to make a specific date clickable
window.makeDateClickable = function(date) {
    if (window.consultationLogEnhancer) {
        window.consultationLogEnhancer.openDateModal(date);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.consultationLogEnhancer = new ConsultationLogTableEnhancer();
    await window.consultationLogEnhancer.initialize();

    // Start watching for new tables
    window.consultationLogEnhancer.startWatching();

    // Initial enhancement of existing tables
    setTimeout(() => {
        window.consultationLogEnhancer.autoEnhanceTables();
    }, 1000); // Wait a bit for other scripts to load
});

// Also try to enhance tables when modals are opened
document.addEventListener('click', (e) => {
    // If a modal or tab is opened, try to enhance tables after a short delay
    if (e.target.closest('[data-toggle="modal"], .tab-btn, .nav-btn')) {
        setTimeout(() => {
            if (window.consultationLogEnhancer) {
                window.consultationLogEnhancer.autoEnhanceTables();
            }
        }, 500);
    }
});