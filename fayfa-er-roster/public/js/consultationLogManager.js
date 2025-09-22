// Consultation Log Manager - Handles consultation log modal and table functionality
class ConsultationLogManager {
    constructor() {
        this.consultationLogs = [];
        this.doctors = [];
        this.currentLog = {
            id: null,
            date: new Date().toISOString().split('T')[0],
            shift: '',
            erDoctorId: '',
            timeCalled: '',
            specialistId: '',
            specialty: '',
            arrivalTime: '',
            responseTime: '',
            patientId: '',
            outcome: '',
            urgent: false
        };
        this.isModalOpen = false;
        this.currentCalendarDate = new Date();
    }

    async initialize() {
        await this.loadData();
        this.setupModal();
    }

    async loadData() {
        try {
            // Load consultation logs
            const logsResponse = await fetch('/api/consultation-logs');
            this.consultationLogs = await logsResponse.json();

            // Load doctors
            const doctorsResponse = await fetch('/api/doctors');
            const doctorsData = await doctorsResponse.json();
            // Handle different response formats
            this.doctors = doctorsData.data || doctorsData;

            console.log('Consultation Log Manager: Loaded', this.consultationLogs.length, 'logs and', this.doctors.length, 'doctors');
        } catch (error) {
            console.error('Error loading consultation log data:', error);
        }
    }

    setupModal() {
        const modalBody = document.getElementById('consultationLogModalBody');
        if (!modalBody) {
            console.error('Consultation log modal body not found');
            return;
        }

        modalBody.innerHTML = this.generateModalContent();
        this.attachEventListeners();
    }

    generateModalContent() {
        const currentDate = new Date();
        return `
            <div class="clean-calendar-widget">
                <div class="calendar-widget-header">
                    <h2 class="calendar-title">📅 Consultation Calendar</h2>
                    <p class="calendar-subtitle">Click on any date to view and manage consultations</p>
                </div>

                <div class="calendar-navigation">
                    <button class="nav-btn" onclick="consultationLogManager.previousMonth()" title="Previous Month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 class="current-month" id="currentMonth">${this.formatMonthYear(currentDate)}</h3>
                    <button class="nav-btn" onclick="consultationLogManager.nextMonth()" title="Next Month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="clean-calendar-container">
                    <div class="calendar-weekdays">
                        <div class="weekday">Sun</div>
                        <div class="weekday">Mon</div>
                        <div class="weekday">Tue</div>
                        <div class="weekday">Wed</div>
                        <div class="weekday">Thu</div>
                        <div class="weekday">Fri</div>
                        <div class="weekday">Sat</div>
                    </div>
                    <div class="calendar-days" id="calendarDays">
                        ${this.generateCleanCalendarDays(currentDate)}
                    </div>
                </div>

                <div class="calendar-legend">
                    <div class="legend-item">
                        <div class="legend-dot"></div>
                        <span>No consultations</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot has-consultations"></div>
                        <span>Has consultations</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot urgent-consultations"></div>
                        <span>Urgent cases</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTableRows() {
        return this.consultationLogs.map(log => this.renderTableRow(log)).join('');
    }

    renderTableRow(log) {
        const doctorName = this.getDoctorName(log.erDoctorId);
        const specialistName = this.getSpecialistName(log.specialistId);
        const shiftLabel = this.getShiftLabel(log.shift);
        const outcomeLabel = this.getOutcomeLabel(log.outcome);

        return `
            <div class="table-row ${log.urgent ? 'urgent-row' : ''}">
                <div class="date-cell">
                    <button
                        class="date-link"
                        onclick="consultationLogManager.openDateModal('${log.date}')"
                        title="View all consultations for ${log.date}"
                    >
                        <i class="fas fa-calendar-day"></i>
                        ${log.date}
                    </button>
                </div>
                <div>
                    <span class="shift-badge shift-${log.shift}">
                        ${shiftLabel}
                    </span>
                </div>
                <div class="doctor-cell">${doctorName}</div>
                <div class="time-cell">${log.timeCalled}</div>
                <div class="specialist-cell">${specialistName}</div>
                <div class="specialty-cell">
                    <span class="specialty-tag">${log.specialty}</span>
                </div>
                <div class="arrival-time-cell">${log.arrivalTime || '--:--'}</div>
                <div class="response-time-cell">
                    ${log.responseTime ?
                        `<span class="response-time ${this.getResponseTimeClass(log.responseTime)}">${log.responseTime}</span>` :
                        '<span class="no-response">Pending</span>'
                    }
                </div>
                <div class="patient-id">${log.patientId}</div>
                <div>
                    <span class="outcome-badge outcome-${log.outcome}">
                        ${outcomeLabel}
                    </span>
                </div>
                <div class="urgent-cell">
                    ${log.urgent ? '<i class="fas fa-exclamation-triangle urgent-icon"></i>' : ''}
                </div>
                <div class="action-cell">
                    <button class="action-btn-small edit-btn" onclick="consultationLogManager.editLog(${log.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn-small delete-btn" onclick="consultationLogManager.deleteLog(${log.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Event listeners are attached via onclick attributes in the HTML
        console.log('Consultation log event listeners attached');
    }

    openDateModal(date) {
        console.log('openDateModal called for:', date);
        try {
            if (window.dateConsultationModal) {
                console.log('Using window.dateConsultationModal');
                window.dateConsultationModal.open(date, this.consultationLogs, this.doctors);
            } else {
                console.error('Date consultation modal not available, using fallback');
                this.createSimpleDateModal(date);
            }
        } catch (error) {
            console.error('Error in openDateModal:', error);
            this.createSimpleDateModal(date);
        }
    }

    async addNewRow() {
        // This would open a form modal or inline editing
        console.log('Add new consultation log row');
        // For now, just refresh to show any new data
        await this.refreshData();
    }

    async editLog(logId) {
        console.log('Edit log:', logId);
        // This would open an edit form
    }

    async deleteLog(logId) {
        if (confirm('Are you sure you want to delete this consultation log entry?')) {
            try {
                const response = await fetch(`/api/consultation-logs/${logId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.refreshData();
                    console.log('Consultation log deleted successfully');
                } else {
                    console.error('Failed to delete consultation log');
                }
            } catch (error) {
                console.error('Error deleting consultation log:', error);
            }
        }
    }

    async exportToPDF() {
        try {
            const response = await fetch('/api/consultation-logs/export/pdf');
            const data = await response.json();

            // Generate PDF using the data
            if (window.pdfLibrariesReady && window.jsPDF) {
                this.generatePDF(data);
            } else {
                console.error('PDF libraries not ready');
            }
        } catch (error) {
            console.error('Error exporting to PDF:', error);
        }
    }

    generatePDF(data) {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('Consultation Log Report', 20, 30);

        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
        doc.text(`Total Entries: ${data.data.length}`, 20, 55);

        // Simple table of consultation logs
        let yPosition = 75;
        data.data.forEach((log, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            doc.text(`${log.date} - ${log.patientId} - ${log.outcome}`, 20, yPosition);
            yPosition += 10;
        });

        doc.save('consultation-logs.pdf');
    }

    async refreshData() {
        await this.loadData();
        this.updateTable();
        this.updateSummaryStats();
    }

    updateTable() {
        const tableBody = document.getElementById('consultationTableBody');
        if (tableBody) {
            tableBody.innerHTML = this.renderTableRows();
        }
    }

    updateSummaryStats() {
        const totalElement = document.getElementById('totalLogs');
        const urgentElement = document.getElementById('urgentLogs');
        const admittedElement = document.getElementById('admittedLogs');
        const datesElement = document.getElementById('uniqueDates');

        if (totalElement) totalElement.textContent = this.consultationLogs.length;
        if (urgentElement) urgentElement.textContent = this.consultationLogs.filter(log => log.urgent).length;
        if (admittedElement) admittedElement.textContent = this.consultationLogs.filter(log => log.outcome === 'admitted').length;
        if (datesElement) datesElement.textContent = [...new Set(this.consultationLogs.map(log => log.date))].length;
    }

    // Utility functions
    getDoctorName(doctorId) {
        const doctor = this.doctors.find(d => d.id === parseInt(doctorId));
        return doctor ? doctor.name : 'Unknown Doctor';
    }

    getSpecialistName(specialistId) {
        const specialists = [
            { id: 'fathi', name: 'Dr. Fathi' },
            { id: 'joseph', name: 'Dr. Joseph' },
            { id: 'mahasen', name: 'Dr. Mahasen' },
            { id: 'mammoun', name: 'Dr. Mammoun' },
            { id: 'yanelis', name: 'Dr. Yanelis' }
        ];
        const specialist = specialists.find(s => s.id === specialistId);
        return specialist ? specialist.name : 'Unknown Specialist';
    }

    getShiftLabel(shift) {
        const shifts = {
            'morning': 'Morning',
            'evening': 'Evening',
            'night': 'Night'
        };
        return shifts[shift] || shift;
    }

    getOutcomeLabel(outcome) {
        const outcomes = {
            'routine': 'Routine',
            'urgent': 'Urgent',
            'emergency': 'Emergency',
            'admitted': 'Admitted',
            'dama': 'Patient Discharged',
            'patient_referred': 'Patient Referred',
            'completed': 'Completed',
            'declined': 'Declined'
        };
        return outcomes[outcome] || outcome;
    }

    getResponseTimeClass(responseTime) {
        if (!responseTime) return '';
        const minutes = parseInt(responseTime);
        if (minutes > 60) return 'slow';
        if (minutes > 30) return 'moderate';
        return 'fast';
    }

    // Calendar methods
    formatMonthYear(date) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    generateCalendarDays(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let daysHTML = '';

        // Empty cells for days before the month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysHTML += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const logsForDay = this.consultationLogs.filter(log => log.date === dateStr);
            const hasUrgent = logsForDay.some(log => log.urgent);
            const hasLogs = logsForDay.length > 0;

            let dayClass = 'calendar-day';
            if (hasLogs) dayClass += ' has-logs';
            if (hasUrgent) dayClass += ' urgent-logs';

            daysHTML += `
                <div class="${dayClass}" onclick="openDatePopup('${dateStr}', ${logsForDay.length})" title="${logsForDay.length} consultation(s)" style="cursor: pointer !important;">
                    <span class="day-number">${day}</span>
                    ${hasLogs ? `<span class="log-count">${logsForDay.length}</span>` : ''}
                </div>
            `;
        }

        return daysHTML;
    }

    generateCleanCalendarDays(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let daysHTML = '';

        // Add empty cells for days before the month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysHTML += `<div class="clean-calendar-day empty-day"></div>`;
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const logsForDay = this.consultationLogs.filter(log => log.date === dateStr);
            const hasLogs = logsForDay.length > 0;
            const hasUrgent = logsForDay.some(log => log.urgent);

            let dayClass = 'clean-calendar-day';
            if (hasLogs) dayClass += ' has-consultations';
            if (hasUrgent) dayClass += ' urgent-consultations';

            // Check if it's today
            const today = new Date();
            const isToday = (
                year === today.getFullYear() &&
                month === today.getMonth() &&
                day === today.getDate()
            );
            if (isToday) dayClass += ' today';

            daysHTML += `
                <div class="${dayClass}" onclick="openDateConsultationInterface('${dateStr}')" title="Click to manage consultations for ${dateStr}">
                    <span class="day-number">${day}</span>
                    ${hasLogs ? `<div class="consultation-indicator">${logsForDay.length}</div>` : ''}
                </div>
            `;
        }

        return daysHTML;
    }

    selectDate(dateStr) {
        console.log('selectDate called for:', dateStr);
        try {
            if (window.dateConsultationModal) {
                console.log('Opening date consultation modal');
                window.dateConsultationModal.open(dateStr, this.consultationLogs, this.doctors);
            } else {
                console.error('window.dateConsultationModal not available');
                // Fallback - create a simple modal
                this.createSimpleDateModal(dateStr);
            }
        } catch (error) {
            console.error('Error in selectDate:', error);
            this.createSimpleDateModal(dateStr);
        }
    }

    createSimpleDateModal(dateStr) {
        // Create a simple fallback modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(20, 25, 35, 0.95);
            padding: 30px;
            border-radius: 15px;
            color: white;
            max-width: 500px;
            text-align: center;
        `;

        const logsForDate = this.consultationLogs.filter(log => log.date === dateStr);

        content.innerHTML = `
            <h2>Consultation Logs for ${dateStr}</h2>
            <p>Found ${logsForDate.length} consultation(s) for this date</p>
            ${logsForDate.length > 0 ?
                `<div style="text-align: left; margin: 20px 0;">
                    ${logsForDate.map(log => `
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 10px; margin: 10px 0; border-radius: 8px;">
                            <strong>Patient ${log.patientId}</strong> - ${log.timeCalled}<br>
                            Specialist: ${this.getSpecialistName(log.specialistId)}<br>
                            Outcome: ${log.outcome}
                        </div>
                    `).join('')}
                </div>` :
                '<p>No consultations logged for this date.</p>'
            }
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 10px 20px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin: 10px;
            ">Close</button>
            <button onclick="alert('Add consultation functionality will be implemented here')" style="
                padding: 10px 20px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin: 10px;
            ">Add Consultation</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Remove modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        console.log('Simple date modal created for:', dateStr);
    }

    previousMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
        this.updateCalendar();
    }

    nextMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
        this.updateCalendar();
    }

    updateCalendar() {
        const monthElement = document.getElementById('currentMonth');
        const calendarDaysElement = document.getElementById('calendarDays');

        if (monthElement) {
            monthElement.textContent = this.formatMonthYear(this.currentCalendarDate);
        }

        if (calendarDaysElement) {
            calendarDaysElement.innerHTML = this.generateCleanCalendarDays(this.currentCalendarDate);
        }
    }

    open() {
        this.isModalOpen = true;
        const modal = document.getElementById('consultationLogModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '9999';
            modal.style.background = 'rgba(0, 0, 0, 0.8)';
            // Add show class for proper CSS animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            document.body.style.overflow = 'hidden';
            console.log('Consultation Log Modal opened successfully');
        } else {
            console.error('consultationLogModal element not found');
        }
    }

    close() {
        this.isModalOpen = false;
        const modal = document.getElementById('consultationLogModal');
        modal.classList.remove('show');
        // Wait for animation before hiding
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
}

// Global functions for modal interaction
window.showConsultationLog = async function() {
    try {
        console.log('showConsultationLog called');
        if (!window.consultationLogManager) {
            console.log('Creating new ConsultationLogManager');
            window.consultationLogManager = new ConsultationLogManager();
            await window.consultationLogManager.initialize();
        } else {
            console.log('Using existing ConsultationLogManager');
            await window.consultationLogManager.refreshData();
        }
        console.log('Opening consultation log modal');
        window.consultationLogManager.open();
    } catch (error) {
        console.error('Error in showConsultationLog:', error);
        alert('Error opening consultation log: ' + error.message);
    }
};

window.closeConsultationLogModal = function() {
    if (window.consultationLogManager) {
        window.consultationLogManager.close();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Consultation Log Manager script loaded');

    // Ensure the modal exists and is properly configured
    const modal = document.getElementById('consultationLogModal');
    if (modal) {
        console.log('consultationLogModal found in DOM');

        // Force ensure it has the right classes
        modal.classList.add('modal-overlay');

        // Add some basic styles as fallback
        modal.style.position = 'fixed';
        modal.style.zIndex = '9999';
        modal.style.display = 'none';

        console.log('Modal configured successfully');
    } else {
        console.error('consultationLogModal not found in DOM');
    }

    // Test if showConsultationLog function is available
    if (typeof window.showConsultationLog === 'function') {
        console.log('showConsultationLog function is available');
    } else {
        console.error('showConsultationLog function is NOT available');
    }

    // Emergency fallback - create a simple working function
    window.emergencyShowConsultationLog = function() {
        console.log('Emergency consultation log function called');
        const modal = document.getElementById('consultationLogModal');
        if (modal) {
            // Force show the modal with calendar content
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '9999';
            modal.style.background = 'rgba(0, 0, 0, 0.8)';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';

            // Add basic calendar content
            const modalBody = document.getElementById('consultationLogModalBody');
            if (modalBody && modalBody.innerHTML.trim() === '') {
                modalBody.innerHTML = `
                    <div style="padding: 20px; color: white;">
                        <h3>Calendar Loading...</h3>
                        <p>Please wait while the calendar loads.</p>
                        <button onclick="window.emergencyShowConsultationLog(); window.showConsultationLog();" style="
                            padding: 10px 20px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            margin: 10px 5px;
                        ">Retry with Full Calendar</button>
                        <button onclick="document.getElementById('consultationLogModal').style.display='none';" style="
                            padding: 10px 20px;
                            background: #ef4444;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            margin: 10px 5px;
                        ">Close</button>
                    </div>
                `;
            }

            document.body.style.overflow = 'hidden';
            console.log('Emergency modal opened');
        } else {
            alert('Modal element not found. Please refresh the page.');
        }
    };

    console.log('Emergency fallback function created');
});

// GUARANTEED WORKING GLOBAL FUNCTION
window.openDatePopup = function(dateStr, logCount) {
    console.log('openDatePopup called for:', dateStr, 'with', logCount, 'logs');

    // Create and show a simple popup immediately
    const popup = document.createElement('div');
    popup.id = 'simpleDatePopup';
    popup.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.9) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 999999 !important;
        font-family: Arial, sans-serif !important;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #1e293b !important;
        color: white !important;
        padding: 40px !important;
        border-radius: 15px !important;
        max-width: 600px !important;
        width: 90% !important;
        text-align: center !important;
        border: 2px solid #3b82f6 !important;
    `;

    // Get consultation logs for this date
    let consultationsHtml = '';
    if (window.consultationLogManager && window.consultationLogManager.consultationLogs) {
        const logsForDate = window.consultationLogManager.consultationLogs.filter(log => log.date === dateStr);
        if (logsForDate.length > 0) {
            consultationsHtml = `
                <div style="text-align: left; margin: 20px 0; background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 8px;">
                    <h4 style="margin-top: 0; color: #3b82f6;">Existing Consultations:</h4>
                    ${logsForDate.map(log => `
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 10px; margin: 8px 0; border-radius: 5px;">
                            <strong>Patient ${log.patientId}</strong> - ${log.timeCalled}<br>
                            <small>Specialist: ${log.specialistId} | Outcome: ${log.outcome}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    content.innerHTML = `
        <h2 style="color: #3b82f6; margin-bottom: 20px;">📅 ${dateStr}</h2>
        <p style="font-size: 18px; margin-bottom: 20px;">
            ${logCount > 0 ? `Found ${logCount} consultation(s) for this date` : 'No consultations logged for this date'}
        </p>
        ${consultationsHtml}
        <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="showAddConsultationForm('${dateStr}')" style="
                padding: 12px 24px;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            ">➕ Add Consultation</button>
            <button onclick="document.getElementById('simpleDatePopup').remove()" style="
                padding: 12px 24px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            ">❌ Close</button>
        </div>
    `;

    popup.appendChild(content);
    document.body.appendChild(popup);

    // Close when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });

    console.log('Date popup created and displayed for:', dateStr);
};

console.log('Global openDatePopup function created and ready!');

// GENERATE CONSULTATION LOGS TABLE
function generateConsultationLogsTable(dateStr) {
    let tableHTML = '';

    if (window.consultationLogManager && window.consultationLogManager.consultationLogs) {
        const logsForDate = window.consultationLogManager.consultationLogs.filter(log => log.date === dateStr);

        if (logsForDate.length > 0) {
            logsForDate.forEach(log => {
                const shiftBadge = getShiftBadge(log.shift);
                const outcomeBadge = getOutcomeBadge(log.outcome);
                const urgentIcon = log.urgent ? '<span style="color: #ef4444;">⚠️</span>' : '';

                tableHTML += `
                    <div style="padding: 15px; border-bottom: 1px solid #4a5568; display: grid; grid-template-columns: 100px 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px 80px 100px; gap: 10px; align-items: center; font-size: 14px;">
                        <div>${log.date}</div>
                        <div>${shiftBadge}</div>
                        <div>${getDoctorName(log.erDoctorId)}</div>
                        <div style="font-weight: bold;">${log.timeCalled}</div>
                        <div>${getSpecialistName(log.specialistId)}</div>
                        <div>${log.specialty}</div>
                        <div style="color: #a0aec0;">--:--</div>
                        <div>${log.arrivalTime || '--:--'}</div>
                        <div style="color: #22c55e;">${log.responseTime || '--'}</div>
                        <div style="font-family: monospace; font-weight: bold;">${log.patientId}</div>
                        <div>${outcomeBadge}</div>
                        <div style="text-align: center;">${urgentIcon}</div>
                        <div style="display: flex; gap: 5px;">
                            <button style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" onclick="editLog(${log.id})">✏️</button>
                            <button style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" onclick="deleteLog(${log.id})">🗑️</button>
                        </div>
                    </div>
                `;
            });
        } else {
            tableHTML = `
                <div style="padding: 40px; text-align: center; color: #a0aec0;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📅</div>
                    <h3>No consultations for ${dateStr}</h3>
                    <p>Use the form above to add the first consultation for this date.</p>
                </div>
            `;
        }
    } else {
        tableHTML = `
            <div style="padding: 40px; text-align: center; color: #a0aec0;">
                <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
                <h3>Loading consultations...</h3>
            </div>
        `;
    }

    return tableHTML;
}

function getShiftBadge(shift) {
    const colors = {
        'morning': '#22c55e',
        'evening': '#f59e0b',
        'night': '#8b5cf6'
    };
    const color = colors[shift] || '#6b7280';
    return `<span style="padding: 4px 8px; background: ${color}; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${shift}</span>`;
}

function getOutcomeBadge(outcome) {
    const colors = {
        'admitted': '#22c55e',
        'patient_referred': '#3b82f6',
        'patient_discharged': '#f59e0b',
        'completed': '#6b7280'
    };
    const labels = {
        'admitted': 'ADMITTED',
        'patient_referred': 'PATIENT REFERRED',
        'patient_discharged': 'PATIENT DISCHARGED',
        'completed': 'COMPLETED'
    };
    const color = colors[outcome] || '#6b7280';
    const label = labels[outcome] || outcome.toUpperCase();
    return `<span style="padding: 4px 8px; background: ${color}; color: white; border-radius: 4px; font-size: 11px; font-weight: bold;">${label}</span>`;
}

function getDoctorName(doctorId) {
    const doctors = {
        '1': 'Dr. Ahmed',
        '2': 'Dr. Hagah',
        '3': 'Dr. Shafi',
        '4': 'Dr. Hasan'
    };
    return doctors[doctorId] || 'Unknown Doctor';
}

function getSpecialistName(specialistId) {
    const specialists = {
        'fathi': 'Dr. Fathi',
        'joseph': 'Dr. Joseph',
        'mahasen': 'Dr. Mahasen',
        'mammoun': 'Dr. Mammoun',
        'yanelis': 'Dr. Yanelis'
    };
    return specialists[specialistId] || 'Unknown Specialist';
}

// Edit and Delete functions
window.editLog = function(logId) {
    alert(`Edit functionality for log ID ${logId} will be implemented here.`);
};

window.deleteLog = function(logId) {
    if (confirm('Are you sure you want to delete this consultation log?')) {
        // Implementation for delete
        alert(`Delete functionality for log ID ${logId} will be implemented here.`);
    }
};

// ADD CONSULTATION FORM FUNCTION
window.showAddConsultationForm = function(dateStr) {
    console.log('Opening add consultation form for:', dateStr);

    // Remove existing popup
    const existingPopup = document.getElementById('simpleDatePopup');
    if (existingPopup) existingPopup.remove();

    // Create form popup
    const popup = document.createElement('div');
    popup.id = 'addConsultationPopup';
    popup.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.9) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 999999 !important;
        font-family: Arial, sans-serif !important;
        overflow-y: auto !important;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #1e293b !important;
        color: white !important;
        padding: 30px !important;
        border-radius: 15px !important;
        max-width: 800px !important;
        width: 95% !important;
        margin: 20px !important;
        border: 2px solid #3b82f6 !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
    `;

    content.innerHTML = `
        <h2 style="color: #3b82f6; margin-bottom: 25px; text-align: center;">
            ➕ Add New Consultation - ${dateStr}
        </h2>

        <!-- Top Form Section (Like Screenshot) -->
        <div style="background: #2d3748; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <form id="consultationForm">
                <!-- Row 1: Date, Shift, ER Doctor, Time Called -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Date</label>
                        <input type="date" id="consultDate" value="${dateStr}" readonly style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Shift</label>
                        <select id="consultShift" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            <option value="">Select Shift</option>
                            <option value="morning">Morning (7:00 AM - 3:00 PM)</option>
                            <option value="evening">Evening (3:00 PM - 11:00 PM)</option>
                            <option value="night">Night (11:00 PM - 7:00 AM)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">ER Doctor</label>
                        <select id="consultErDoctor" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            <option value="">Select ER Doctor</option>
                            <option value="1">Dr. Ahmed</option>
                            <option value="2">Dr. Hagah</option>
                            <option value="3">Dr. Shafi</option>
                            <option value="4">Dr. Hasan</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Time Called</label>
                        <input type="time" id="consultTimeCalled" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                </div>

                <!-- Row 2: Specialist, Specialty, Arrival Time, Response Time -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Specialist</label>
                        <select id="consultSpecialist" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            <option value="">Select Specialist</option>
                            <option value="fathi">Dr. Fathi</option>
                            <option value="joseph">Dr. Joseph</option>
                            <option value="mahasen">Dr. Mahasen</option>
                            <option value="mammoun">Dr. Mammoun</option>
                            <option value="yanelis">Dr. Yanelis</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Specialty</label>
                        <select id="consultSpecialty" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            <option value="">Select Specialty</option>
                            <option value="Internal Medicine">Internal Medicine</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="ENT">ENT</option>
                            <option value="General Surgery">General Surgery</option>
                            <option value="Ophthalmology">Ophthalmology</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Arrival Time</label>
                        <input type="time" id="consultArrivalTime" style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Response Time</label>
                        <input type="text" id="consultResponseTime" placeholder="45 min" readonly style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: #a0aec0; font-size: 14px;
                        ">
                    </div>
                </div>

                <!-- Row 3: Patient ID, Outcome, Urgent -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 200px; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Patient ID</label>
                        <input type="text" id="consultPatientId" placeholder="P001" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Outcome</label>
                        <select id="consultOutcome" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            <option value="">Select Outcome</option>
                            <option value="admitted">Admitted</option>
                            <option value="patient_referred">Patient Referred</option>
                            <option value="patient_discharged">Patient Discharged</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: end; padding-bottom: 12px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #a0aec0;">
                            <input type="checkbox" id="consultUrgent" style="width: 18px; height: 18px;">
                            <span style="font-weight: bold;">Urgent</span>
                        </label>
                    </div>
                </div>

                <!-- Buttons -->
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button type="button" onclick="saveConsultationForm('${dateStr}')" style="
                        padding: 12px 30px; background: #22c55e; color: white; border: none;
                        border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    ">💾 Save Consultation</button>
                    <button type="button" onclick="document.getElementById('addConsultationPopup').remove()" style="
                        padding: 12px 30px; background: #6b7280; color: white; border: none;
                        border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    ">❌ Cancel</button>
                </div>
            </form>
        </div>

        <!-- Consultation Logs Table -->
        <div style="background: #2d3748; border-radius: 12px; overflow: hidden;">
            <div style="background: #4a5568; padding: 15px; font-weight: bold; text-transform: uppercase; font-size: 12px; color: #a0aec0; display: grid; grid-template-columns: 100px 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px; gap: 10px;">
                <div>DATE</div>
                <div>SHIFT</div>
                <div>ER DOCTOR</div>
                <div>TIME CALLED</div>
                <div>SPECIALIST</div>
                <div>SPECIALTY</div>
                <div>RESPONSE</div>
                <div>ARRIVAL TIME</div>
                <div>RESPONSE TIME</div>
                <div>PATIENT ID</div>
                <div>OUTCOME</div>
                <div>URGENT</div>
                <div>ACTIONS</div>
            </div>
            <div id="consultationLogsTableBody" style="max-height: 300px; overflow-y: auto;">
                ${generateConsultationLogsTable(dateStr)}
            </div>
        </div>
    `;

    // Add event listener for automatic response time calculation
    const arrivalTimeInput = document.getElementById('consultArrivalTime');
    const timeCalledInput = document.getElementById('consultTimeCalled');
    const responseTimeInput = document.getElementById('consultResponseTime');

    function calculateResponseTime() {
        const timeCalled = timeCalledInput.value;
        const arrivalTime = arrivalTimeInput.value;

        if (timeCalled && arrivalTime) {
            const callTime = new Date(\`2000-01-01 \${timeCalled}\`);
            const arrTime = new Date(\`2000-01-01 \${arrivalTime}\`);
            const diffMinutes = Math.round((arrTime - callTime) / (1000 * 60));
            responseTimeInput.value = \`\${diffMinutes} min\`;
        }
    }

    arrivalTimeInput.addEventListener('change', calculateResponseTime);
    timeCalledInput.addEventListener('change', calculateResponseTime);

    popup.appendChild(content);
    document.body.appendChild(popup);

    // Close when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });

    console.log('Add consultation form displayed for:', dateStr);
};

// SAVE CONSULTATION FORM FUNCTION
window.saveConsultationForm = async function(dateStr) {
    console.log('Saving consultation form for:', dateStr);

    try {
        // Get form values
        const formData = {
            date: document.getElementById('consultDate').value,
            shift: document.getElementById('consultShift').value,
            erDoctorId: document.getElementById('consultErDoctor').value,
            timeCalled: document.getElementById('consultTimeCalled').value,
            specialistId: document.getElementById('consultSpecialist').value,
            specialty: document.getElementById('consultSpecialty').value,
            arrivalTime: document.getElementById('consultArrivalTime').value,
            patientId: document.getElementById('consultPatientId').value,
            outcome: document.getElementById('consultOutcome').value,
            urgent: document.getElementById('consultUrgent').checked
        };

        // Calculate response time if arrival time is provided
        if (formData.timeCalled && formData.arrivalTime) {
            const callTime = new Date(\`2000-01-01 \${formData.timeCalled}\`);
            const arrivalTime = new Date(\`2000-01-01 \${formData.arrivalTime}\`);
            const diffMinutes = Math.round((arrivalTime - callTime) / (1000 * 60));
            formData.responseTime = \`\${diffMinutes} min\`;
        }

        // Validate required fields
        const requiredFields = ['date', 'shift', 'erDoctorId', 'timeCalled', 'specialistId', 'specialty', 'patientId', 'outcome'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert('Please fill in all required fields: ' + missingFields.join(', '));
            return;
        }

        console.log('Submitting consultation data:', formData);

        // Show saving indicator
        const saveButton = document.querySelector('button[onclick*="saveConsultationForm"]');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '⏳ Saving...';
        saveButton.disabled = true;

        // Save to server
        const response = await fetch('/api/consultation-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Consultation log saved successfully:', result);

            // Close form
            document.getElementById('addConsultationPopup').remove();

            // Show success message
            alert('✅ Consultation saved successfully!');

            // Refresh the consultation log manager if available
            if (window.consultationLogManager) {
                await window.consultationLogManager.refreshData();
                console.log('Consultation data refreshed');
            }

            // Reopen the date popup to show the new consultation
            setTimeout(() => {
                openDatePopup(dateStr, 'updated');
            }, 500);

        } else {
            const errorText = await response.text();
            console.error('Error saving consultation log:', errorText);
            alert('❌ Error saving consultation: ' + errorText);

            // Restore button
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }

    } catch (error) {
        console.error('Error in saveConsultationForm:', error);
        alert('❌ Error saving consultation: ' + error.message);

        // Restore button
        const saveButton = document.querySelector('button[onclick*="saveConsultationForm"]');
        if (saveButton) {
            saveButton.innerHTML = '💾 Save Consultation';
            saveButton.disabled = false;
        }
    }
};

// CLEAN CALENDAR DATE CLICK HANDLER
window.openDateConsultationInterface = function(dateStr) {
    console.log('Opening consultation interface for date:', dateStr);

    // Create a full-screen modal with the consultation management interface
    const modal = document.createElement('div');
    modal.id = 'dateConsultationInterface';
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.95) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 999999 !important;
        font-family: Arial, sans-serif !important;
        overflow-y: auto !important;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #1e293b !important;
        color: white !important;
        padding: 30px !important;
        border-radius: 15px !important;
        max-width: 1200px !important;
        width: 95% !important;
        margin: 20px !important;
        border: 2px solid #3b82f6 !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
    `;

    // Get existing consultation logs for this date
    const consultationLogs = window.consultationLogManager ?
        window.consultationLogManager.consultationLogs.filter(log => log.date === dateStr) : [];

    content.innerHTML = `
        <div class="consultation-interface-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
            <div>
                <h2 style="color: #3b82f6; margin: 0; font-size: 28px;">
                    📅 Consultations for ${dateStr}
                </h2>
                <p style="margin: 5px 0 0 0; color: #a0aec0; font-size: 16px;">
                    ${consultationLogs.length} consultation${consultationLogs.length === 1 ? '' : 's'} recorded
                </p>
            </div>
            <button onclick="document.getElementById('dateConsultationInterface').remove()" style="
                padding: 12px 24px; background: #ef4444; color: white; border: none;
                border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
            ">❌ Close</button>
        </div>

        <div class="consultation-interface-content">
            <!-- Add New Consultation Section -->
            <div style="background: #2d3748; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #22c55e; margin-bottom: 20px; text-align: center;">
                    ➕ Add New Consultation
                </h3>
                <button onclick="showAddConsultationForm('${dateStr}')" style="
                    width: 100%; padding: 15px; background: #22c55e; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: bold;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='#16a34a'" onmouseout="this.style.background='#22c55e'">
                    📝 Open Consultation Form
                </button>
            </div>

            <!-- Existing Consultations Table -->
            <div style="background: #2d3748; border-radius: 12px; overflow: hidden;">
                <div style="background: #4a5568; padding: 15px; font-weight: bold; text-transform: uppercase; font-size: 14px; color: #a0aec0;">
                    <h3 style="margin: 0; color: white;">Existing Consultations for ${dateStr}</h3>
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${generateDateConsultationTable(dateStr, consultationLogs)}
                </div>
            </div>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    console.log('Date consultation interface opened for:', dateStr);
};

// Helper function to generate consultation table for a specific date
function generateDateConsultationTable(dateStr, consultationLogs) {
    if (consultationLogs.length === 0) {
        return `
            <div style="padding: 40px; text-align: center; color: #a0aec0;">
                <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                <h4 style="margin: 0 0 10px 0; color: #6b7280;">No consultations recorded</h4>
                <p style="margin: 0; font-size: 14px;">Click "Open Consultation Form" above to add the first consultation for this date.</p>
            </div>
        `;
    }

    let tableHTML = `
        <div style="padding: 15px; background: #4a5568; font-weight: bold; text-transform: uppercase; font-size: 12px; color: #a0aec0; display: grid; grid-template-columns: 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px 80px 100px; gap: 10px;">
            <div>SHIFT</div>
            <div>ER DOCTOR</div>
            <div>TIME CALLED</div>
            <div>SPECIALIST</div>
            <div>SPECIALTY</div>
            <div>ARRIVAL TIME</div>
            <div>RESPONSE TIME</div>
            <div>PATIENT ID</div>
            <div>OUTCOME</div>
            <div>URGENT</div>
            <div>ACTIONS</div>
        </div>
    `;

    consultationLogs.forEach(log => {
        const shiftBadge = getShiftBadge(log.shift);
        const outcomeBadge = getOutcomeBadge(log.outcome);
        const urgentIcon = log.urgent ? '<span style="color: #ef4444;">⚠️</span>' : '';

        tableHTML += `
            <div style="padding: 15px; border-bottom: 1px solid #4a5568; display: grid; grid-template-columns: 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px 80px 100px; gap: 10px; align-items: center; font-size: 14px;">
                <div>${shiftBadge}</div>
                <div>${getDoctorName(log.erDoctorId)}</div>
                <div style="font-weight: bold;">${log.timeCalled}</div>
                <div>${getSpecialistName(log.specialistId)}</div>
                <div>${log.specialty}</div>
                <div>${log.arrivalTime || '--:--'}</div>
                <div style="color: #22c55e;">${log.responseTime || '--'}</div>
                <div style="font-family: monospace; font-weight: bold;">${log.patientId}</div>
                <div>${outcomeBadge}</div>
                <div style="text-align: center;">${urgentIcon}</div>
                <div>
                    <button onclick="editConsultation(${log.id})" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;">✏️</button>
                    <button onclick="deleteConsultation(${log.id})" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️</button>
                </div>
            </div>
        `;
    });

    return tableHTML;
}

// Initialize ConsultationLogManager when DOM is ready
document.addEventListener("DOMContentLoaded", async function() {
    console.log("Initializing ConsultationLogManager...");
    try {
        window.consultationLogManager = new ConsultationLogManager();
        await window.consultationLogManager.initialize();
        console.log("ConsultationLogManager initialized successfully");
    } catch (error) {
        console.error("Failed to initialize ConsultationLogManager:", error);
    }
});
