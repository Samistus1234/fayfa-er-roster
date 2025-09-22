// Export utility functions for ER Roster Management System
// Fayfa General Hospital

// CSV Export Functions
function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," + data;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function arrayToCSV(array) {
    if (!array || array.length === 0) return '';
    
    const headers = Object.keys(array[0]);
    const csvArray = [headers.join(',')];
    
    array.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvArray.push(values.join(','));
    });
    
    return csvArray.join('\n');
}

// PDF Export Functions - Enhanced with Unified PDF Service
function createPDF(title, subtitle) {
    // Use unified PDF service if available
    if (window.unifiedPDFService) {
        return window.unifiedPDFService.exportToPDF({
            title: title,
            subtitle: subtitle,
            type: 'generic'
        });
    }

    // Fallback to legacy method
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Fayfa General Hospital', 20, 20);

    pdf.setFontSize(16);
    pdf.text(title, 20, 35);

    if (subtitle) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text(subtitle, 20, 45);
    }

    // Date and time
    const now = new Date();
    pdf.setFontSize(10);
    pdf.text(`Generated: ${now.toLocaleString()}`, 20, pdf.internal.pageSize.height - 20);

    return pdf;
}

// Analytics Export Functions
function exportAnalytics(format) {
    if (!currentAnalytics || Object.keys(currentAnalytics).length === 0) {
        showAlert('No analytics data to export', 'warning');
        return;
    }
    
    const monthYear = document.getElementById('monthYear').value;
    const [year, month] = monthYear.split('-');
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (format === 'csv') {
        exportAnalyticsCSV(monthName);
    } else if (format === 'pdf') {
        exportAnalyticsPDF(monthName);
    }
}

function exportAnalyticsCSV(monthName) {
    const data = [];
    
    Object.values(currentAnalytics).forEach(analytics => {
        data.push({
            'Doctor': analytics.doctor.name,
            'Morning Shifts': analytics.counts.morning,
            'Evening Shifts': analytics.counts.evening,
            'Night Shifts': analytics.counts.night,
            'Referral Duties': analytics.counts.referral,
            'Total Duties': analytics.total,
            'Morning %': analytics.percentages.morning + '%',
            'Evening %': analytics.percentages.evening + '%',
            'Night %': analytics.percentages.night + '%'
        });
    });
    
    const csvContent = arrayToCSV(data);
    const filename = `analytics_${monthName.replace(' ', '_')}.csv`;
    exportToCSV(csvContent, filename);
    showAlert('Analytics exported to CSV successfully', 'success');
}

async function exportAnalyticsPDF(monthName) {
    // Use unified PDF service with progress indicator
    if (window.unifiedPDFService) {
        const progressElement = showProgressIndicator('Generating Analytics PDF...');

        window.unifiedPDFService.setProgressCallback((message, percentage) => {
            updateProgressIndicator(progressElement, message, percentage);
        });

        try {
            await window.unifiedPDFService.exportToPDF({
                type: 'analytics',
                title: 'ER Duty Analytics Report',
                subtitle: `Period: ${monthName}`,
                filename: `analytics_${monthName.replace(' ', '_')}.pdf`,
                data: { doctors: currentAnalytics, summary: { period: monthName } }
            });
        } finally {
            hideProgressIndicator(progressElement);
        }
        return;
    }

    // Legacy fallback
    const pdf = createPDF('ER Duty Analytics Report', `Period: ${monthName}`);

    const tableData = [];
    Object.values(currentAnalytics).forEach(analytics => {
        tableData.push([
            analytics.doctor.name,
            analytics.counts.morning.toString(),
            analytics.counts.evening.toString(),
            analytics.counts.night.toString(),
            analytics.counts.referral.toString(),
            analytics.total.toString(),
            analytics.percentages.morning + '%',
            analytics.percentages.evening + '%',
            analytics.percentages.night + '%'
        ]);
    });

    pdf.autoTable({
        head: [['Doctor', 'Morning', 'Evening', 'Night', 'Referral', 'Total', 'Morning %', 'Evening %', 'Night %']],
        body: tableData,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        alternateRowStyles: { fillColor: [248, 249, 250] }
    });

    pdf.save(`analytics_${monthName.replace(' ', '_')}.pdf`);
    showAlert('Analytics exported to PDF successfully', 'success');
}

// Roster Export Functions
function exportRoster(format) {
    if (!currentRoster || currentRoster.length === 0) {
        showAlert('No roster data to export', 'warning');
        return;
    }
    
    const monthYear = document.getElementById('monthYear').value;
    const [year, month] = monthYear.split('-');
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (format === 'csv') {
        exportRosterCSV(monthName);
    } else if (format === 'pdf') {
        exportRosterPDF(monthName);
    }
}

function exportRosterCSV(monthName) {
    const sortedRoster = currentRoster.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const data = sortedRoster.map(entry => {
        const doctor = doctors.find(d => d.id === entry.doctorId);
        return {
            'Date': new Date(entry.date).toLocaleDateString(),
            'Doctor': doctor ? doctor.name : 'Unknown Doctor',
            'Shift': entry.shift.charAt(0).toUpperCase() + entry.shift.slice(1),
            'Type': entry.isReferralDuty ? 'Referral' : 'Regular',
            'Referral': entry.isReferralDuty ? 'Yes' : 'No'
        };
    });
    
    const csvContent = arrayToCSV(data);
    const filename = `roster_${monthName.replace(' ', '_')}.csv`;
    exportToCSV(csvContent, filename);
    showAlert('Roster exported to CSV successfully', 'success');
}

async function exportRosterPDF(monthName) {
    // Use unified PDF service with progress indicator
    if (window.unifiedPDFService) {
        const progressElement = showProgressIndicator('Generating Roster PDF...');

        window.unifiedPDFService.setProgressCallback((message, percentage) => {
            updateProgressIndicator(progressElement, message, percentage);
        });

        try {
            const rosterData = currentRoster.map(entry => {
                const doctor = doctors.find(d => d.id === entry.doctorId);
                return {
                    ...entry,
                    doctorName: doctor ? doctor.name : 'Unknown Doctor'
                };
            });

            await window.unifiedPDFService.exportToPDF({
                type: 'roster',
                title: 'ER Monthly Roster',
                subtitle: `Period: ${monthName}`,
                filename: `roster_${monthName.replace(' ', '_')}.pdf`,
                data: rosterData
            });
        } finally {
            hideProgressIndicator(progressElement);
        }
        return;
    }

    // Legacy fallback
    const pdf = createPDF('ER Monthly Roster', `Period: ${monthName}`);

    const sortedRoster = currentRoster.sort((a, b) => new Date(a.date) - new Date(b.date));

    const tableData = sortedRoster.map(entry => {
        const doctor = doctors.find(d => d.id === entry.doctorId);
        return [
            new Date(entry.date).toLocaleDateString(),
            doctor ? doctor.name : 'Unknown Doctor',
            entry.shift.charAt(0).toUpperCase() + entry.shift.slice(1),
            entry.isReferralDuty ? 'Referral' : 'Regular'
        ];
    });

    pdf.autoTable({
        head: [['Date', 'Doctor', 'Shift', 'Type']],
        body: tableData,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        alternateRowStyles: { fillColor: [248, 249, 250] }
    });

    pdf.save(`roster_${monthName.replace(' ', '_')}.pdf`);
    showAlert('Roster exported to PDF successfully', 'success');
}

// Workload Export Functions
function exportWorkload(format) {
    const monthYear = document.getElementById('monthYear').value;
    if (!monthYear) {
        showAlert('Please select a month first', 'warning');
        return;
    }
    
    const [year, month] = monthYear.split('-');
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get workload data from API
    fetch(`/api/workload/${year}/${month}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                if (format === 'csv') {
                    exportWorkloadCSV(result.data, monthName);
                } else if (format === 'pdf') {
                    exportWorkloadPDF(result.data, monthName);
                }
            } else {
                showAlert('Error loading workload data for export', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error exporting workload data', 'danger');
        });
}

function exportWorkloadCSV(data, monthName) {
    const csvData = [];
    
    Object.values(data.doctorAnalysis).forEach(analysis => {
        csvData.push({
            'Doctor': analysis.doctor.name,
            'Regular Hours': analysis.hours.regular,
            'Weighted Hours': analysis.hours.weighted,
            'Total Duties': analysis.workload.total_duties,
            'Morning Shifts': analysis.shifts.morning,
            'Evening Shifts': analysis.shifts.evening,
            'Night Shifts': analysis.shifts.night,
            'Referral Duties': analysis.shifts.referral,
            'Work Percentage': analysis.workload.work_percentage + '%',
            'Max Consecutive Days': analysis.consecutive.max_consecutive,
            'Weekend Duties': analysis.weekend.total_weekend_duties,
            'Intensity Level': analysis.intensity.level,
            'Intensity Score': analysis.intensity.score
        });
    });
    
    const csvContent = arrayToCSV(csvData);
    const filename = `workload_analysis_${monthName.replace(' ', '_')}.csv`;
    exportToCSV(csvContent, filename);
    showAlert('Workload analysis exported to CSV successfully', 'success');
}

function exportWorkloadPDF(data, monthName) {
    const pdf = createPDF('Workload Distribution Analysis', `Period: ${monthName}`);
    
    // Summary stats
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Department Summary:', 20, 65);
    
    pdf.setFont(undefined, 'normal');
    pdf.text(`Total Hours: ${data.departmentStats.total_hours}`, 30, 75);
    pdf.text(`Average Hours per Doctor: ${data.departmentStats.averages.hours}`, 30, 85);
    pdf.text(`Balance Score: ${data.balanceScore.score}%`, 30, 95);
    pdf.text(`Balance Rating: ${data.departmentStats.distribution.balance_rating}`, 30, 105);
    
    // Workload table
    const tableData = Object.values(data.doctorAnalysis).map(analysis => [
        analysis.doctor.name,
        analysis.hours.weighted.toString(),
        analysis.workload.total_duties.toString(),
        analysis.shifts.morning.toString(),
        analysis.shifts.evening.toString(),
        analysis.shifts.night.toString(),
        analysis.shifts.referral.toString(),
        analysis.intensity.level
    ]);
    
    pdf.autoTable({
        head: [['Doctor', 'Weighted Hours', 'Total Duties', 'Morning', 'Evening', 'Night', 'Referral', 'Intensity']],
        body: tableData,
        startY: 120,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        alternateRowStyles: { fillColor: [248, 249, 250] }
    });
    
    pdf.save(`workload_analysis_${monthName.replace(' ', '_')}.pdf`);
    showAlert('Workload analysis exported to PDF successfully', 'success');
}

// Fairness Export Functions
function exportFairness(format) {
    const monthYear = document.getElementById('monthYear').value;
    if (!monthYear) {
        showAlert('Please select a month first', 'warning');
        return;
    }
    
    const [year, month] = monthYear.split('-');
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get fairness data from API
    fetch(`/api/fairness/${year}/${month}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                if (format === 'csv') {
                    exportFairnessCSV(result.data, monthName);
                } else if (format === 'pdf') {
                    exportFairnessPDF(result.data, monthName);
                }
            } else {
                showAlert('Error loading fairness data for export', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error exporting fairness data', 'danger');
        });
}

function exportFairnessCSV(data, monthName) {
    const csvData = [];
    
    Object.values(data.doctorStats || {}).forEach(stats => {
        csvData.push({
            'Doctor': stats.doctor.name,
            'Total Shifts': stats.totals.shifts,
            'Weekend Duties': stats.totals.weekend,
            'Night Shifts': stats.shifts.night,
            'Referral Duties': stats.shifts.referral,
            'Workload %': stats.percentages.workload + '%',
            'Morning %': stats.percentages.morning + '%',
            'Evening %': stats.percentages.evening + '%',
            'Night %': stats.percentages.night + '%'
        });
    });
    
    // Add fairness scores
    const fairnessScores = data.fairnessScores?.scores || {};
    csvData.push({
        'Doctor': '--- FAIRNESS METRICS ---',
        'Total Shifts': '',
        'Weekend Duties': '',
        'Night Shifts': '',
        'Referral Duties': '',
        'Workload %': '',
        'Morning %': '',
        'Evening %': '',
        'Night %': ''
    });
    
    csvData.push({
        'Doctor': 'Overall Fairness Score',
        'Total Shifts': Math.round(fairnessScores.overall || 0),
        'Weekend Duties': '',
        'Night Shifts': '',
        'Referral Duties': '',
        'Workload %': '',
        'Morning %': '',
        'Evening %': '',
        'Night %': ''
    });
    
    const csvContent = arrayToCSV(csvData);
    const filename = `fairness_metrics_${monthName.replace(' ', '_')}.csv`;
    exportToCSV(csvContent, filename);
    showAlert('Fairness metrics exported to CSV successfully', 'success');
}

function exportFairnessPDF(data, monthName) {
    const pdf = createPDF('Fairness & Equity Metrics Report', `Period: ${monthName}`);
    
    // Fairness scores summary
    const fairnessScores = data.fairnessScores?.scores || {};
    const overallRating = data.overallFairnessRating || {};
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Fairness Summary:', 20, 65);
    
    pdf.setFont(undefined, 'normal');
    pdf.text(`Overall Fairness Score: ${Math.round(fairnessScores.overall || 0)} (${overallRating.rating || 'N/A'})`, 30, 75);
    pdf.text(`Workload Fairness: ${Math.round(fairnessScores.workload || 0)}%`, 30, 85);
    pdf.text(`Night Shift Equity: ${Math.round(fairnessScores.night || 0)}%`, 30, 95);
    pdf.text(`Weekend Fairness: ${Math.round(fairnessScores.weekend || 0)}%`, 30, 105);
    
    // Doctor equity table
    const tableData = Object.values(data.doctorStats || {}).map(stats => [
        stats.doctor.name,
        stats.totals.shifts.toString(),
        stats.totals.weekend.toString(),
        stats.shifts.night.toString(),
        stats.shifts.referral.toString(),
        stats.percentages.workload + '%'
    ]);
    
    pdf.autoTable({
        head: [['Doctor', 'Total Shifts', 'Weekend Duties', 'Night Shifts', 'Referral Duties', 'Workload %']],
        body: tableData,
        startY: 120,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        alternateRowStyles: { fillColor: [248, 249, 250] }
    });
    
    // Add alerts if any
    const alerts = data.inequityAlerts || [];
    if (alerts.length > 0) {
        const finalY = pdf.lastAutoTable.finalY + 20;
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Equity Alerts:', 20, finalY);
        
        pdf.setFont(undefined, 'normal');
        alerts.slice(0, 5).forEach((alert, index) => {
            pdf.text(`• ${alert.type.replace('_', ' ').toUpperCase()}: ${alert.message}`, 30, finalY + 10 + (index * 10));
        });
    }
    
    pdf.save(`fairness_metrics_${monthName.replace(' ', '_')}.pdf`);
    showAlert('Fairness metrics exported to PDF successfully', 'success');
}

// Consultation Log Export Functions
function exportConsultation(format) {
    const consultDate = document.getElementById('consultDate').value;
    const consultShift = document.getElementById('consultShift').value;
    const erDoctor = document.getElementById('erDoctor').value;
    const recordedBy = document.getElementById('recordedBy').value;
    
    // Collect consultation data
    const consultations = [];
    const rows = document.querySelectorAll('#consultationTableBody tr');
    
    rows.forEach(row => {
        const timeCalled = row.querySelector('input[name="timeCalled[]"]').value;
        const specialistName = row.querySelector('input[name="specialistName[]"]').value;
        const specialty = row.querySelector('select[name="specialty[]"]').value;
        const response = row.querySelector('select[name="response[]"]').value;
        const arrivalTime = row.querySelector('input[name="arrivalTime[]"]').value;
        const patientId = row.querySelector('input[name="patientId[]"]').value;
        const reasonConsult = row.querySelector('input[name="reasonConsult[]"]').value;
        const urgent = row.querySelector('input[name="urgent[]"]').checked;
        
        // Only include rows with data
        if (timeCalled || specialistName) {
            consultations.push({
                timeCalled,
                specialistName,
                specialty,
                response,
                arrivalTime,
                patientId,
                reasonConsult,
                urgent: urgent ? 'Yes' : 'No'
            });
        }
    });
    
    if (consultations.length === 0) {
        showAlert('No consultation data to export', 'warning');
        return;
    }
    
    if (format === 'csv') {
        exportConsultationCSV(consultations, consultDate, consultShift, erDoctor, recordedBy);
    } else if (format === 'pdf') {
        exportConsultationPDF(consultations, consultDate, consultShift, erDoctor, recordedBy);
    }
}

function exportConsultationCSV(consultations, date, shift, erDoctor, recordedBy) {
    // Add header information
    const headerData = [
        { Field: 'Date', Value: date },
        { Field: 'Shift', Value: shift },
        { Field: 'ER Doctor', Value: erDoctor },
        { Field: 'Recorded By', Value: recordedBy },
        { Field: '', Value: '' }, // Empty row
        { Field: '--- CONSULTATIONS ---', Value: '' }
    ];
    
    const consultationData = consultations.map(consultation => ({
        'Time Called': consultation.timeCalled,
        'Specialist Name': consultation.specialistName,
        'Specialty': consultation.specialty,
        'Response': consultation.response,
        'Arrival Time': consultation.arrivalTime,
        'Patient ID': consultation.patientId,
        'Reason for Consult': consultation.reasonConsult,
        'Urgent': consultation.urgent
    }));
    
    const headerCSV = arrayToCSV(headerData);
    const consultationCSV = arrayToCSV(consultationData);
    const csvContent = headerCSV + '\n' + consultationCSV;
    
    const filename = `consultation_log_${date.replace(/-/g, '_')}.csv`;
    exportToCSV(csvContent, filename);
    showAlert('Consultation log exported to CSV successfully', 'success');
}

async function exportConsultationPDF(consultations, date, shift, erDoctor, recordedBy) {
    // Use unified PDF service with progress indicator
    if (window.unifiedPDFService) {
        const progressElement = showProgressIndicator('Generating Consultation PDF...');

        window.unifiedPDFService.setProgressCallback((message, percentage) => {
            updateProgressIndicator(progressElement, message, percentage);
        });

        try {
            await window.unifiedPDFService.exportToPDF({
                type: 'consultation',
                title: 'Emergency Room Specialist Consultation Log',
                subtitle: `Form ID: ERL-001 | Version: 1.0 | Date: ${date}`,
                filename: `consultation_log_${date.replace(/-/g, '_')}.pdf`,
                data: consultations.map(c => ({
                    ...c,
                    date: date,
                    shift: shift,
                    erDoctor: erDoctor,
                    recordedBy: recordedBy
                }))
            });
        } finally {
            hideProgressIndicator(progressElement);
        }
        return;
    }

    // Legacy fallback
    const pdf = createPDF('Emergency Room Specialist Consultation Log', `Form ID: ERL-001 | Version: 1.0`);

    // Meta information
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Consultation Details:', 20, 65);

    pdf.setFont(undefined, 'normal');
    pdf.text(`Date: ${date}`, 30, 75);
    pdf.text(`Shift: ${shift}`, 30, 85);
    pdf.text(`ER Doctor on Duty: ${erDoctor}`, 30, 95);
    pdf.text(`Recorded By: ${recordedBy}`, 30, 105);

    // Consultation table
    const tableData = consultations.map(consultation => [
        consultation.timeCalled,
        consultation.specialistName,
        consultation.specialty,
        consultation.response,
        consultation.arrivalTime,
        consultation.patientId,
        consultation.reasonConsult || '',
        consultation.urgent
    ]);

    pdf.autoTable({
        head: [['Time Called', 'Specialist', 'Specialty', 'Response', 'Arrival', 'Patient ID', 'Reason', 'Urgent']],
        body: tableData,
        startY: 120,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        styles: { fontSize: 8 },
        columnStyles: {
            6: { cellWidth: 30 } // Reason column wider
        }
    });

    pdf.save(`consultation_log_${date.replace(/-/g, '_')}.pdf`);
    showAlert('Consultation log exported to PDF successfully', 'success');
}

// Progress Indicator Helper Functions
function showProgressIndicator(message) {
    const progressElement = document.createElement('div');
    progressElement.className = 'pdf-progress-indicator';
    progressElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #3b82f6;
        border-radius: 12px;
        padding: 30px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        min-width: 300px;
        text-align: center;
    `;

    progressElement.innerHTML = `
        <div class="progress-content">
            <div class="progress-spinner" style="
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            "></div>
            <div class="progress-message" style="
                color: #1f2937;
                font-weight: 600;
                margin-bottom: 10px;
                font-size: 14px;
            ">${message}</div>
            <div class="progress-bar" style="
                width: 100%;
                height: 6px;
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 10px;
            ">
                <div class="progress-fill" style="
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.3s ease;
                    border-radius: 3px;
                "></div>
            </div>
            <div class="progress-percentage" style="
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
            ">0%</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    document.body.appendChild(progressElement);
    return progressElement;
}

function updateProgressIndicator(element, message, percentage) {
    if (!element) return;

    const messageEl = element.querySelector('.progress-message');
    const fillEl = element.querySelector('.progress-fill');
    const percentageEl = element.querySelector('.progress-percentage');

    if (messageEl) messageEl.textContent = message;
    if (fillEl) fillEl.style.width = percentage + '%';
    if (percentageEl) percentageEl.textContent = Math.round(percentage) + '%';
}

function hideProgressIndicator(element) {
    if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => element.remove(), 300);
    }
}