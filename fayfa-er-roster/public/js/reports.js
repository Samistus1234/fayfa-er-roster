// Reports Management Module
function showReports() {
    // Hide all other dynamic sections
    const dynamicSections = document.querySelectorAll('#dynamicSections > section');
    dynamicSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show Reports section
    const reportsSection = document.getElementById('reportsSection');
    if (reportsSection) {
        reportsSection.style.display = 'block';
    }
    
    // Animate entrance if gsap is available
    if (typeof gsap !== 'undefined') {
        gsap.from('#reportsSection', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        });
    }
    
    // Initialize reports manager if not already initialized
    if (!window.reportsManager) {
        window.reportsManager = new ReportsManager();
    }
}

class ReportsManager {
    constructor() {
        this.currentReportType = 'roster';
        this.selectedFormat = 'pdf';
        this.selectedYear = new Date().getFullYear();
        this.selectedMonth = new Date().getMonth() + 1;
        this.scheduledReports = [];
        this.init();
    }

    async init() {
        this.renderReportsInterface();
        this.setupEventListeners();
        await this.loadScheduledReports();
    }

    renderReportsInterface() {
        const container = document.getElementById('reportsContent');
        if (!container) return;

        container.innerHTML = `
            <div class="reports-interface">
                <!-- Report Type Selection -->
                <div class="report-section glass-effect">
                    <h4 class="section-title">
                        <i class="fas fa-file-alt"></i> Report Type
                    </h4>
                    <div class="report-types">
                        <button class="report-type-btn active" data-type="roster">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Monthly Roster</span>
                            <small>Staff schedule overview</small>
                        </button>
                        <button class="report-type-btn" data-type="leave">
                            <i class="fas fa-plane-departure"></i>
                            <span>Leave Report</span>
                            <small>Leave utilization analysis</small>
                        </button>
                        <button class="report-type-btn" data-type="distribution">
                            <i class="fas fa-chart-pie"></i>
                            <span>Duty Distribution</span>
                            <small>Workload analysis</small>
                        </button>
                        <button class="report-type-btn" data-type="annual">
                            <i class="fas fa-chart-line"></i>
                            <span>Annual Summary</span>
                            <small>Yearly overview</small>
                        </button>
                    </div>
                </div>

                <!-- Date Selection -->
                <div class="report-section glass-effect">
                    <h4 class="section-title">
                        <i class="fas fa-calendar"></i> Time Period
                    </h4>
                    <div class="date-selection">
                        <div class="form-group">
                            <label>Year</label>
                            <select id="reportYear" class="form-select">
                                ${this.generateYearOptions()}
                            </select>
                        </div>
                        <div class="form-group" id="monthGroup">
                            <label>Month</label>
                            <select id="reportMonth" class="form-select">
                                ${this.generateMonthOptions()}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Format Selection -->
                <div class="report-section glass-effect">
                    <h4 class="section-title">
                        <i class="fas fa-file-export"></i> Export Format
                    </h4>
                    <div class="format-selection">
                        <label class="format-option">
                            <input type="radio" name="format" value="pdf" checked>
                            <div class="format-card">
                                <i class="fas fa-file-pdf"></i>
                                <span>PDF</span>
                            </div>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="format" value="excel">
                            <div class="format-card">
                                <i class="fas fa-file-excel"></i>
                                <span>Excel</span>
                            </div>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="format" value="json">
                            <div class="format-card">
                                <i class="fas fa-file-code"></i>
                                <span>JSON</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Actions -->
                <div class="report-section glass-effect">
                    <h4 class="section-title">
                        <i class="fas fa-cog"></i> Actions
                    </h4>
                    <div class="report-actions">
                        <button class="btn btn-primary" onclick="reportsManager.generateReport()">
                            <i class="fas fa-download"></i> Generate & Download
                        </button>
                        <button class="btn btn-secondary" onclick="reportsManager.showEmailModal()">
                            <i class="fas fa-envelope"></i> Email Report
                        </button>
                        <button class="btn btn-outline-secondary" onclick="reportsManager.showScheduleModal()">
                            <i class="fas fa-clock"></i> Schedule Report
                        </button>
                    </div>
                </div>

                <!-- Scheduled Reports -->
                <div class="report-section glass-effect">
                    <h4 class="section-title">
                        <i class="fas fa-history"></i> Scheduled Reports
                    </h4>
                    <div id="scheduledReportsList" class="scheduled-reports-list">
                        <div class="loading-spinner">Loading scheduled reports...</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        let options = '';
        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            options += `<option value="${year}" ${year === this.selectedYear ? 'selected' : ''}>${year}</option>`;
        }
        return options;
    }

    generateMonthOptions() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        let options = '';
        months.forEach((month, index) => {
            options += `<option value="${index + 1}" ${index + 1 === this.selectedMonth ? 'selected' : ''}>${month}</option>`;
        });
        return options;
    }

    setupEventListeners() {
        // Report type selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.report-type-btn')) {
                const btn = e.target.closest('.report-type-btn');
                this.selectReportType(btn.dataset.type);
            }
        });

        // Format selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'format') {
                this.selectedFormat = e.target.value;
            }
        });

        // Date selection
        const yearSelect = document.getElementById('reportYear');
        const monthSelect = document.getElementById('reportMonth');
        
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.selectedYear = parseInt(e.target.value);
            });
        }
        
        if (monthSelect) {
            monthSelect.addEventListener('change', (e) => {
                this.selectedMonth = parseInt(e.target.value);
            });
        }
    }

    selectReportType(type) {
        this.currentReportType = type;
        
        // Update UI
        document.querySelectorAll('.report-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // Show/hide month selector based on report type
        const monthGroup = document.getElementById('monthGroup');
        if (type === 'annual' || (type === 'leave' && !document.getElementById('monthlyLeaveCheckbox')?.checked)) {
            monthGroup.style.display = 'none';
        } else {
            monthGroup.style.display = 'block';
        }
    }

    async generateReport() {
        try {
            // Show loading state
            this.showLoading('Generating report...');

            let url;
            switch (this.currentReportType) {
                case 'roster':
                    url = `/api/reports/roster/${this.selectedYear}/${this.selectedMonth}?format=${this.selectedFormat}`;
                    break;
                case 'leave':
                    url = `/api/reports/leaves/${this.selectedYear}${this.selectedMonth ? '/' + this.selectedMonth : ''}?format=${this.selectedFormat}`;
                    break;
                case 'distribution':
                    url = `/api/reports/duty-distribution/${this.selectedYear}/${this.selectedMonth}?format=${this.selectedFormat}`;
                    break;
                case 'annual':
                    url = `/api/reports/annual-summary/${this.selectedYear}?format=${this.selectedFormat}`;
                    break;
            }

            const response = await fetch(url);
            
            if (this.selectedFormat === 'json') {
                const data = await response.json();
                this.downloadJSON(data, `${this.currentReportType}-report-${this.selectedYear}`);
            } else {
                const blob = await response.blob();
                const filename = this.getFilename(response.headers.get('content-disposition')) || 
                               `${this.currentReportType}-report.${this.selectedFormat}`;
                this.downloadFile(blob, filename);
            }

            this.hideLoading();
            this.showSuccess('Report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            this.hideLoading();
            this.showError('Failed to generate report');
        }
    }

    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        this.downloadFile(blob, `${filename}.json`);
    }

    getFilename(contentDisposition) {
        if (!contentDisposition) return null;
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
            return matches[1].replace(/['"]/g, '');
        }
        return null;
    }

    showEmailModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Email Report</h5>
                        <button type="button" class="btn-close" onclick="reportsManager.closeModal(this)"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group mb-3">
                            <label>Recipients (comma-separated emails)</label>
                            <textarea id="emailRecipients" class="form-control" rows="3" 
                                placeholder="doctor1@hospital.com, doctor2@hospital.com"></textarea>
                        </div>
                        <div class="form-group mb-3">
                            <label>Additional Message (optional)</label>
                            <textarea id="emailMessage" class="form-control" rows="3" 
                                placeholder="Any additional notes..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="reportsManager.closeModal(this)">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="reportsManager.sendEmailReport()">
                            <i class="fas fa-paper-plane"></i> Send Report
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showScheduleModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Schedule Automatic Report</h5>
                        <button type="button" class="btn-close" onclick="reportsManager.closeModal(this)"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group mb-3">
                            <label>Schedule</label>
                            <select id="scheduleFrequency" class="form-select">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly (Every Monday)</option>
                                <option value="monthly">Monthly (1st of each month)</option>
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <label>Recipients (comma-separated emails)</label>
                            <textarea id="scheduleRecipients" class="form-control" rows="3" 
                                placeholder="admin@hospital.com, manager@hospital.com"></textarea>
                        </div>
                        <div class="form-group mb-3">
                            <label>Report Format</label>
                            <select id="scheduleFormat" class="form-select">
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="reportsManager.closeModal(this)">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="reportsManager.scheduleReport()">
                            <i class="fas fa-clock"></i> Schedule Report
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async sendEmailReport() {
        try {
            const recipients = document.getElementById('emailRecipients').value
                .split(',')
                .map(email => email.trim())
                .filter(email => email);

            if (recipients.length === 0) {
                this.showError('Please enter at least one recipient email');
                return;
            }

            this.showLoading('Sending report...');

            const response = await fetch('/api/reports/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: this.currentReportType,
                    year: this.selectedYear,
                    month: this.selectedMonth,
                    recipients: recipients,
                    format: this.selectedFormat,
                    message: document.getElementById('emailMessage').value
                })
            });

            const result = await response.json();
            
            this.hideLoading();
            
            if (result.success) {
                this.showSuccess('Report sent successfully!');
                this.closeModal(document.querySelector('.modal'));
            } else {
                this.showError(result.message || 'Failed to send report');
            }
        } catch (error) {
            console.error('Error sending email report:', error);
            this.hideLoading();
            this.showError('Failed to send report');
        }
    }

    async scheduleReport() {
        try {
            const frequency = document.getElementById('scheduleFrequency').value;
            const recipients = document.getElementById('scheduleRecipients').value
                .split(',')
                .map(email => email.trim())
                .filter(email => email);

            if (recipients.length === 0) {
                this.showError('Please enter at least one recipient email');
                return;
            }

            // Convert frequency to cron expression
            const scheduleMap = {
                'daily': '0 6 * * *',      // Daily at 6 AM
                'weekly': '0 6 * * 1',     // Weekly on Monday at 6 AM
                'monthly': '0 6 1 * *'     // Monthly on 1st at 6 AM
            };

            this.showLoading('Scheduling report...');

            const response = await fetch('/api/reports/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: this.currentReportType,
                    schedule: scheduleMap[frequency],
                    recipients: recipients,
                    format: document.getElementById('scheduleFormat').value
                })
            });

            const result = await response.json();
            
            this.hideLoading();
            
            if (result.success) {
                this.showSuccess('Report scheduled successfully!');
                this.closeModal(document.querySelector('.modal'));
                await this.loadScheduledReports();
            } else {
                this.showError(result.message || 'Failed to schedule report');
            }
        } catch (error) {
            console.error('Error scheduling report:', error);
            this.hideLoading();
            this.showError('Failed to schedule report');
        }
    }

    async loadScheduledReports() {
        try {
            const response = await fetch('/api/reports/scheduled');
            const result = await response.json();
            
            if (result.success) {
                this.scheduledReports = result.data;
                this.renderScheduledReports();
            }
        } catch (error) {
            console.error('Error loading scheduled reports:', error);
        }
    }

    renderScheduledReports() {
        const container = document.getElementById('scheduledReportsList');
        if (!container) return;

        if (this.scheduledReports.length === 0) {
            container.innerHTML = '<p class="text-muted">No scheduled reports</p>';
            return;
        }

        container.innerHTML = this.scheduledReports.map(report => `
            <div class="scheduled-report-item">
                <div class="report-info">
                    <h6>${this.getReportTypeName(report.type)}</h6>
                    <small>${this.getScheduleDescription(report.schedule)}</small>
                    <div class="recipients">${report.recipients.join(', ')}</div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="reportsManager.cancelScheduledReport('${report.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    getReportTypeName(type) {
        const names = {
            'roster': 'Monthly Roster Report',
            'leave': 'Leave Report',
            'distribution': 'Duty Distribution Report',
            'annual': 'Annual Summary Report'
        };
        return names[type] || type;
    }

    getScheduleDescription(cron) {
        const descriptions = {
            '0 6 * * *': 'Daily at 6:00 AM',
            '0 6 * * 1': 'Weekly on Monday at 6:00 AM',
            '0 6 1 * *': 'Monthly on 1st at 6:00 AM'
        };
        return descriptions[cron] || cron;
    }

    async cancelScheduledReport(id) {
        if (!confirm('Are you sure you want to cancel this scheduled report?')) {
            return;
        }

        try {
            const response = await fetch(`/api/reports/scheduled/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showSuccess('Scheduled report cancelled');
                await this.loadScheduledReports();
            } else {
                this.showError('Failed to cancel scheduled report');
            }
        } catch (error) {
            console.error('Error cancelling scheduled report:', error);
            this.showError('Failed to cancel scheduled report');
        }
    }

    closeModal(modalElement) {
        const modal = modalElement.closest('.modal');
        if (modal) {
            modal.remove();
        }
    }

    showLoading(message) {
        const loader = document.createElement('div');
        loader.id = 'reportLoader';
        loader.className = 'report-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('reportLoader');
        if (loader) {
            loader.remove();
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Make function globally accessible
window.showReports = showReports;