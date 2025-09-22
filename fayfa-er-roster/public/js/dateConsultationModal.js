// Date-specific consultation modal functionality
class DateConsultationModal {
    constructor() {
        this.isOpen = false;
        this.selectedDate = null;
        this.consultationLogs = [];
        this.doctors = [];
        this.filteredLogs = [];
        this.searchTerm = '';
        this.shiftFilter = 'all';
        this.specialtyFilter = 'all';

        this.specialists = [
            { id: 'fathi', name: 'Dr. Fathi', specialty: 'Internal Medicine' },
            { id: 'joseph', name: 'Dr. Joseph', specialty: 'Orthopedics' },
            { id: 'mahasen', name: 'Dr. Mahasen', specialty: 'ENT' },
            { id: 'mammoun', name: 'Dr. Mammoun', specialty: 'General Surgery' },
            { id: 'yanelis', name: 'Dr. Yanelis', specialty: 'Ophthalmology' },
            { id: 'specialist1', name: 'Dr. Sarah Al-Rashid', specialty: 'Surgery' },
            { id: 'specialist2', name: 'Dr. Omar Hassan', specialty: 'Psychiatry' },
            { id: 'specialist3', name: 'Dr. Fatima Al-Zahra', specialty: 'Radiology' },
            { id: 'specialist4', name: 'Dr. Khalid Mansour', specialty: 'Anesthesiology' }
        ];

        this.shifts = [
            { value: 'all', label: 'All Shifts' },
            { value: 'morning', label: 'Morning' },
            { value: 'evening', label: 'Evening' },
            { value: 'night', label: 'Night' }
        ];

        this.outcomes = [
            { value: 'routine', label: 'Routine' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'emergency', label: 'Emergency' },
            { value: 'admitted', label: 'Admitted' },
            { value: 'dama', label: 'Patient Discharged' },
            { value: 'patient_referred', label: 'Patient Referred' },
            { value: 'completed', label: 'Completed' },
            { value: 'declined', label: 'Declined' }
        ];

        this.createModal();
        this.attachEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="dateConsultationModal" class="modal-overlay" style="display: none;">
                <div class="date-consultation-modal glass-card">
                    <div class="modal-header">
                        <div class="header-content">
                            <div class="header-icon">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div>
                                <h2>CONSULTATION LOGS</h2>
                                <p id="selectedDateDisplay">Select a date</p>
                            </div>
                        </div>
                        <button class="close-btn" onclick="window.dateConsultationModal.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body">
                        <!-- Filter Controls -->
                        <div class="filter-controls glass-card">
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Search</label>
                                    <div class="search-input-container">
                                        <i class="fas fa-search"></i>
                                        <input
                                            type="text"
                                            id="searchInput"
                                            placeholder="Search by patient, doctor, specialty..."
                                            class="search-input"
                                        />
                                    </div>
                                </div>

                                <div class="filter-group">
                                    <label>Shift</label>
                                    <select id="shiftFilter" class="filter-select">
                                        <option value="all">All Shifts</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                        <option value="night">Night</option>
                                    </select>
                                </div>

                                <div class="filter-group">
                                    <label>Specialty</label>
                                    <select id="specialtyFilter" class="filter-select">
                                        <option value="all">All Specialties</option>
                                    </select>
                                </div>

                                <button class="clear-filters-btn" onclick="window.dateConsultationModal.clearFilters()">
                                    <i class="fas fa-times"></i>
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        <!-- Summary Stats -->
                        <div class="day-summary glass-card">
                            <div class="summary-stats">
                                <div class="stat-item">
                                    <div class="stat-value" id="totalConsultations">0</div>
                                    <div class="stat-label">Total Consultations</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value" id="urgentCases">0</div>
                                    <div class="stat-label">Urgent Cases</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value" id="admissions">0</div>
                                    <div class="stat-label">Admissions</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value" id="specialtiesInvolved">0</div>
                                    <div class="stat-label">Specialties Involved</div>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="action-buttons" style="margin-top: 20px; display: flex; gap: 12px; justify-content: center;">
                                <button class="action-btn" onclick="window.dateConsultationModal.exportToPDF()">
                                    <i class="fas fa-file-pdf"></i>
                                    Export to PDF
                                </button>
                                <button class="action-btn" onclick="window.dateConsultationModal.addNewConsultation()">
                                    <i class="fas fa-plus"></i>
                                    Add New Log
                                </button>
                                <button class="action-btn" onclick="window.dateConsultationModal.refreshData()">
                                    <i class="fas fa-sync-alt"></i>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <!-- Add New Consultation Form -->
                        <div id="addConsultationForm" class="add-consultation-form glass-card" style="display: none;">
                            <div class="form-header">
                                <h3><i class="fas fa-plus"></i> Add New Consultation Log</h3>
                                <button class="close-form-btn" onclick="window.dateConsultationModal.closeAddForm()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="form-content">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Date</label>
                                        <input type="date" id="newLogDate" class="form-input" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>Shift</label>
                                        <select id="newLogShift" class="form-input" required>
                                            <option value="">Select Shift</option>
                                            <option value="morning">Morning</option>
                                            <option value="evening">Evening</option>
                                            <option value="night">Night</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Time Called</label>
                                        <input type="time" id="newLogTimeCalled" class="form-input" required>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>ER Doctor</label>
                                        <select id="newLogErDoctor" class="form-input" required>
                                            <option value="">Select ER Doctor</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Specialist</label>
                                        <select id="newLogSpecialist" class="form-input" required>
                                            <option value="">Select Specialist</option>
                                            <option value="fathi">Dr. Fathi</option>
                                            <option value="joseph">Dr. Joseph</option>
                                            <option value="mahasen">Dr. Mahasen</option>
                                            <option value="mammoun">Dr. Mammoun</option>
                                            <option value="yanelis">Dr. Yanelis</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Specialty</label>
                                        <select id="newLogSpecialty" class="form-input" required>
                                            <option value="">Select Specialty</option>
                                            <option value="Internal Medicine">Internal Medicine</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="ENT">ENT</option>
                                            <option value="General Surgery">General Surgery</option>
                                            <option value="Ophthalmology">Ophthalmology</option>
                                            <option value="Surgery">Surgery</option>
                                            <option value="Psychiatry">Psychiatry</option>
                                            <option value="Radiology">Radiology</option>
                                            <option value="Anesthesiology">Anesthesiology</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Arrival Time</label>
                                        <input type="time" id="newLogArrivalTime" class="form-input">
                                    </div>
                                    <div class="form-group">
                                        <label>Patient ID</label>
                                        <input type="text" id="newLogPatientId" class="form-input" placeholder="P001234" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Outcome</label>
                                        <select id="newLogOutcome" class="form-input" required>
                                            <option value="">Select Outcome</option>
                                            <option value="routine">Routine</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="emergency">Emergency</option>
                                            <option value="admitted">Admitted</option>
                                            <option value="dama">Patient Discharged</option>
                                            <option value="patient_referred">Patient Referred</option>
                                            <option value="completed">Completed</option>
                                            <option value="declined">Declined</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group checkbox-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="newLogUrgent">
                                            <span class="checkmark"></span>
                                            Mark as Urgent Case
                                        </label>
                                    </div>
                                </div>

                                <div class="form-actions">
                                    <button type="button" class="btn-secondary" onclick="window.dateConsultationModal.closeAddForm()">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                    <button type="button" class="btn-primary" onclick="window.dateConsultationModal.saveNewConsultation()">
                                        <i class="fas fa-save"></i> Save Consultation
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Data Table -->
                        <div id="consultationTableContainer" class="consultation-table-container">
                            <!-- Content will be populated dynamically -->
                        </div>

                        <!-- No Data Message -->
                        <div id="noDataMessage" class="no-data-message glass-card" style="display: none;">
                            <div class="no-data-icon">
                                <i class="fas fa-calendar-times"></i>
                            </div>
                            <h3>No Consultations Found</h3>
                            <p id="noDataText">No consultation logs found for the selected date.</p>
                            <button class="clear-filters-btn" onclick="window.dateConsultationModal.clearFilters()" style="display: none;" id="clearFiltersBtn">
                                <i class="fas fa-times"></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    attachEventListeners() {
        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.filterLogs();
        });

        // Shift filter
        document.getElementById('shiftFilter').addEventListener('change', (e) => {
            this.shiftFilter = e.target.value;
            this.filterLogs();
        });

        // Specialty filter
        document.getElementById('specialtyFilter').addEventListener('change', (e) => {
            this.specialtyFilter = e.target.value;
            this.filterLogs();
        });

        // Close modal when clicking overlay
        document.getElementById('dateConsultationModal').addEventListener('click', (e) => {
            if (e.target.id === 'dateConsultationModal') {
                this.close();
            }
        });
    }

    open(date, consultationLogs, doctors) {
        this.selectedDate = date;
        this.consultationLogs = consultationLogs || [];
        this.doctors = doctors || [];

        document.getElementById('selectedDateDisplay').textContent = this.formatDate(date);
        this.populateSpecialtyFilter();
        this.filterLogs();
        this.isOpen = true;

        document.getElementById('dateConsultationModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        document.getElementById('dateConsultationModal').style.display = 'none';
        document.body.style.overflow = '';
        this.clearFilters();
    }

    filterLogs() {
        if (!this.consultationLogs || !this.selectedDate) {
            this.filteredLogs = [];
            this.updateDisplay();
            return;
        }

        let filtered = this.consultationLogs.filter(log => log.date === this.selectedDate);

        // Apply filters
        if (this.shiftFilter !== 'all') {
            filtered = filtered.filter(log => log.shift === this.shiftFilter);
        }

        if (this.specialtyFilter !== 'all') {
            filtered = filtered.filter(log => log.specialty === this.specialtyFilter);
        }

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(log =>
                log.patientId.toLowerCase().includes(term) ||
                log.specialty.toLowerCase().includes(term) ||
                log.outcome.toLowerCase().includes(term) ||
                this.getERDoctorName(log.erDoctorId).toLowerCase().includes(term) ||
                this.getSpecialistName(log.specialistId).toLowerCase().includes(term)
            );
        }

        this.filteredLogs = filtered;
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateSummaryStats();
        this.updateTable();
    }

    updateSummaryStats() {
        const total = this.filteredLogs.length;
        const urgent = this.filteredLogs.filter(log => log.urgent).length;
        const admitted = this.filteredLogs.filter(log => log.outcome === 'admitted').length;
        const specialties = [...new Set(this.filteredLogs.map(log => log.specialty))].length;

        document.getElementById('totalConsultations').textContent = total;
        document.getElementById('urgentCases').textContent = urgent;
        document.getElementById('admissions').textContent = admitted;
        document.getElementById('specialtiesInvolved').textContent = specialties;
    }

    updateTable() {
        const container = document.getElementById('consultationTableContainer');
        const noDataMsg = document.getElementById('noDataMessage');
        const clearBtn = document.getElementById('clearFiltersBtn');

        if (this.filteredLogs.length > 0) {
            container.style.display = 'block';
            noDataMsg.style.display = 'none';
            this.renderTable(container);
        } else {
            container.style.display = 'none';
            noDataMsg.style.display = 'block';

            const hasFilters = this.shiftFilter !== 'all' || this.specialtyFilter !== 'all' || this.searchTerm;
            clearBtn.style.display = hasFilters ? 'block' : 'none';

            document.getElementById('noDataText').textContent =
                this.selectedDate ?
                `No consultation logs found for ${this.formatDate(this.selectedDate)} with the current filters.` :
                'Please select a date to view consultation logs.';
        }
    }

    renderTable(container) {
        const tableHTML = `
            <div class="table-header">
                <div>Time</div>
                <div>Shift</div>
                <div>ER Doctor</div>
                <div>Specialist</div>
                <div>Specialty</div>
                <div>Response Time</div>
                <div>Patient ID</div>
                <div>Outcome</div>
                <div>Priority</div>
            </div>
            <div class="table-body">
                ${this.filteredLogs.map(log => this.renderTableRow(log)).join('')}
            </div>
        `;
        container.innerHTML = tableHTML;
    }

    renderTableRow(log) {
        const urgent = log.urgent ? 'urgent-row' : '';
        const responseTimeClass = this.getResponseTimeClass(log.responseTime);

        return `
            <div class="table-row ${urgent}">
                <div class="time-cell">
                    <div class="call-time">${log.timeCalled}</div>
                    ${log.arrivalTime ? `<div class="arrival-time">→ ${log.arrivalTime}</div>` : ''}
                </div>
                <div>
                    <span class="shift-badge shift-${log.shift}">
                        ${this.getShiftLabel(log.shift)}
                    </span>
                </div>
                <div class="doctor-cell">
                    <div class="doctor-name">${this.getERDoctorName(log.erDoctorId)}</div>
                </div>
                <div class="specialist-cell">
                    <div class="specialist-name">${this.getSpecialistName(log.specialistId)}</div>
                </div>
                <div>
                    <span class="specialty-tag">${log.specialty}</span>
                </div>
                <div class="response-time-cell">
                    ${log.responseTime ?
                        `<span class="response-time ${responseTimeClass}">${log.responseTime}</span>` :
                        '<span class="no-response">Pending</span>'
                    }
                </div>
                <div class="patient-id">${log.patientId}</div>
                <div>
                    <span class="outcome-badge outcome-${log.outcome}">
                        ${this.getOutcomeLabel(log.outcome)}
                    </span>
                </div>
                <div class="priority-cell">
                    ${log.urgent ? '<i class="fas fa-exclamation-triangle urgent-icon"></i>' : ''}
                </div>
            </div>
        `;
    }

    populateSpecialtyFilter() {
        const specialtySelect = document.getElementById('specialtyFilter');
        const specialties = [...new Set(this.consultationLogs.map(log => log.specialty))];

        specialtySelect.innerHTML = '<option value="all">All Specialties</option>';
        specialties.forEach(specialty => {
            specialtySelect.innerHTML += `<option value="${specialty}">${specialty}</option>`;
        });
    }

    clearFilters() {
        this.searchTerm = '';
        this.shiftFilter = 'all';
        this.specialtyFilter = 'all';

        document.getElementById('searchInput').value = '';
        document.getElementById('shiftFilter').value = 'all';
        document.getElementById('specialtyFilter').value = 'all';

        this.filterLogs();
    }

    // Utility functions
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getERDoctorName(doctorId) {
        const doctor = this.doctors.find(d => d.id === parseInt(doctorId));
        return doctor ? doctor.name : 'Unknown Doctor';
    }

    getSpecialistName(specialistId) {
        const specialist = this.specialists.find(s => s.id === specialistId);
        return specialist ? specialist.name : 'Unknown Specialist';
    }

    getShiftLabel(shift) {
        const shiftObj = this.shifts.find(s => s.value === shift);
        return shiftObj ? shiftObj.label : shift;
    }

    getOutcomeLabel(outcome) {
        const outcomeObj = this.outcomes.find(o => o.value === outcome);
        return outcomeObj ? outcomeObj.label : outcome;
    }

    getResponseTimeClass(responseTime) {
        if (!responseTime) return '';
        const minutes = parseInt(responseTime);
        if (minutes > 60) return 'slow';
        if (minutes > 30) return 'moderate';
        return 'fast';
    }

    // Action methods
    exportToPDF() {
        try {
            if (!this.selectedDate || this.filteredLogs.length === 0) {
                alert('No data available to export');
                return;
            }

            // Check if jsPDF is available
            if (!window.jsPDF) {
                alert('PDF library not loaded. Please try again later.');
                return;
            }

            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();

            // Set up document
            doc.setFontSize(20);
            doc.text('Consultation Logs Report', 20, 30);

            doc.setFontSize(14);
            doc.text(`Date: ${this.formatDate(this.selectedDate)}`, 20, 45);

            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 55);
            doc.text(`Total Consultations: ${this.filteredLogs.length}`, 20, 65);

            // Add summary stats
            const urgent = this.filteredLogs.filter(log => log.urgent).length;
            const admitted = this.filteredLogs.filter(log => log.outcome === 'admitted').length;
            const specialties = [...new Set(this.filteredLogs.map(log => log.specialty))].length;

            doc.text(`Urgent Cases: ${urgent}`, 120, 55);
            doc.text(`Admissions: ${admitted}`, 120, 65);
            doc.text(`Specialties Involved: ${specialties}`, 20, 75);

            // Add table headers
            let yPosition = 95;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text('Time', 20, yPosition);
            doc.text('Shift', 40, yPosition);
            doc.text('ER Doctor', 65, yPosition);
            doc.text('Specialist', 105, yPosition);
            doc.text('Specialty', 140, yPosition);
            doc.text('Patient', 175, yPosition);

            // Add consultation logs
            yPosition += 10;
            doc.setFont(undefined, 'normal');

            this.filteredLogs.forEach((log) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                const erDoctor = this.getERDoctorName(log.erDoctorId);
                const specialist = this.getSpecialistName(log.specialistId);
                const shiftLabel = this.getShiftLabel(log.shift);

                doc.text(log.timeCalled, 20, yPosition);
                doc.text(shiftLabel, 40, yPosition);
                doc.text(erDoctor.substring(0, 15), 65, yPosition);
                doc.text(specialist.substring(0, 15), 105, yPosition);
                doc.text(log.specialty.substring(0, 15), 140, yPosition);
                doc.text(log.patientId, 175, yPosition);

                yPosition += 8;
            });

            // Save the PDF
            const fileName = `consultation-logs-${this.selectedDate}.pdf`;
            doc.save(fileName);

            console.log('PDF exported successfully:', fileName);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    }

    addNewConsultation() {
        // Show the add consultation form
        const form = document.getElementById('addConsultationForm');
        const tableContainer = document.getElementById('consultationTableContainer');
        const noDataMessage = document.getElementById('noDataMessage');

        // Hide other elements and show form
        tableContainer.style.display = 'none';
        noDataMessage.style.display = 'none';
        form.style.display = 'block';

        // Pre-fill the date
        document.getElementById('newLogDate').value = this.selectedDate;

        // Populate ER doctors dropdown
        this.populateERDoctorsDropdown();

        // Clear form
        this.clearAddForm();

        console.log('Opening add consultation form for date:', this.selectedDate);
    }

    closeAddForm() {
        const form = document.getElementById('addConsultationForm');
        form.style.display = 'none';

        // Show the table again
        this.updateDisplay();

        // Clear form
        this.clearAddForm();
    }

    clearAddForm() {
        document.getElementById('newLogShift').value = '';
        document.getElementById('newLogTimeCalled').value = '';
        document.getElementById('newLogErDoctor').value = '';
        document.getElementById('newLogSpecialist').value = '';
        document.getElementById('newLogSpecialty').value = '';
        document.getElementById('newLogArrivalTime').value = '';
        document.getElementById('newLogPatientId').value = '';
        document.getElementById('newLogOutcome').value = '';
        document.getElementById('newLogUrgent').checked = false;
    }

    populateERDoctorsDropdown() {
        const dropdown = document.getElementById('newLogErDoctor');
        dropdown.innerHTML = '<option value="">Select ER Doctor</option>';

        this.doctors.forEach(doctor => {
            dropdown.innerHTML += `<option value="${doctor.id}">${doctor.name}</option>`;
        });
    }

    async saveNewConsultation() {
        try {
            // Get form values
            const formData = {
                date: document.getElementById('newLogDate').value,
                shift: document.getElementById('newLogShift').value,
                erDoctorId: document.getElementById('newLogErDoctor').value,
                timeCalled: document.getElementById('newLogTimeCalled').value,
                specialistId: document.getElementById('newLogSpecialist').value,
                specialty: document.getElementById('newLogSpecialty').value,
                arrivalTime: document.getElementById('newLogArrivalTime').value,
                patientId: document.getElementById('newLogPatientId').value,
                outcome: document.getElementById('newLogOutcome').value,
                urgent: document.getElementById('newLogUrgent').checked
            };

            // Calculate response time if arrival time is provided
            if (formData.timeCalled && formData.arrivalTime) {
                const callTime = new Date(`2000-01-01 ${formData.timeCalled}`);
                const arrivalTime = new Date(`2000-01-01 ${formData.arrivalTime}`);
                const diffMinutes = Math.round((arrivalTime - callTime) / (1000 * 60));
                formData.responseTime = `${diffMinutes} min`;
            }

            // Validate required fields
            if (!formData.date || !formData.shift || !formData.erDoctorId ||
                !formData.timeCalled || !formData.specialistId || !formData.specialty ||
                !formData.patientId || !formData.outcome) {
                alert('Please fill in all required fields.');
                return;
            }

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

                // Refresh data
                await this.refreshData();

                // Close form and show updated table
                this.closeAddForm();

                alert('Consultation log saved successfully!');
            } else {
                const error = await response.text();
                console.error('Error saving consultation log:', error);
                alert('Error saving consultation log. Please try again.');
            }
        } catch (error) {
            console.error('Error saving consultation log:', error);
            alert('Error saving consultation log. Please try again.');
        }
    }

    async refreshData() {
        try {
            // Refresh consultation logs from API
            const response = await fetch('/api/consultation-logs');
            this.consultationLogs = await response.json();

            // Refresh doctors data
            const doctorsResponse = await fetch('/api/doctors');
            const doctorsData = await doctorsResponse.json();
            this.doctors = doctorsData.data || doctorsData;

            // Re-filter and update display
            this.filterLogs();
            console.log('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            alert('Error refreshing data. Please try again.');
        }
    }
}

// Initialize the modal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dateConsultationModal = new DateConsultationModal();
});

// Function to open date modal from consultation logs table
window.openDateModal = (date, consultationLogs, doctors) => {
    if (window.dateConsultationModal) {
        window.dateConsultationModal.open(date, consultationLogs, doctors);
    }
};