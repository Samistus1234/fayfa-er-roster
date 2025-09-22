// Duty Analytics Management Functions
let currentAnalyticsData = null;
let selectedAnalyticsYear = new Date().getFullYear();
let selectedAnalyticsMonth = new Date().getMonth() + 1;

// Month names array
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];

// Show Duty Analytics Section
async function showDutyAnalytics() {
    // Hide all other dynamic sections
    const dynamicSections = document.querySelectorAll('#dynamicSections > section');
    dynamicSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show Duty Analytics section
    document.getElementById('dutyAnalyticsSection').style.display = 'block';
    
    // Animate entrance
    gsap.from('#dutyAnalyticsSection', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        ease: 'power2.out'
    });
    
    await loadDutyAnalytics();
}

// Hide Duty Analytics Section
function hideDutyAnalytics() {
    gsap.to('#dutyAnalyticsSection', {
        duration: 0.3,
        y: -20,
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => {
            document.getElementById('dutyAnalyticsSection').style.display = 'none';
        }
    });
}

// Load Duty Analytics
async function loadDutyAnalytics() {
    const contentDiv = document.getElementById('dutyAnalyticsContent');
    
    // Show loading state
    contentDiv.innerHTML = `
        <div class="loading-state">
            <div class="loader-modern">
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
            </div>
            <p class="loading-text">Loading duty analytics...</p>
        </div>
    `;
    
    try {
        // Fetch analytics data
        const response = await fetch(`/api/roster/analytics/${selectedAnalyticsYear}/${selectedAnalyticsMonth}`);
        const data = await response.json();
        
        if (data.success) {
            currentAnalyticsData = data.data;
            renderDutyAnalytics(data.data);
        } else {
            if (typeof showToast === 'function') {
                showToast('Failed to load duty analytics', 'error');
            }
            contentDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load duty analytics. Please try again.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading duty analytics:', error);
        if (typeof showToast === 'function') {
            showToast('Error loading duty analytics', 'error');
        }
        contentDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error loading duty analytics. Please check console for details.
            </div>
        `;
    }
}

// Render Duty Analytics
function renderDutyAnalytics(analytics) {
    const contentDiv = document.getElementById('dutyAnalyticsContent');
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Convert doctor analysis object to array and sort by total duties
    const doctorStats = Object.values(analytics.doctorAnalysis || {})
        .sort((a, b) => b.total - a.total);
    
    contentDiv.innerHTML = `
        <!-- Controls Section -->
        <div class="analytics-controls glass-effect p-4 mb-4">
            <div class="row align-items-end">
                <div class="col-md-3">
                    <label class="form-label">Year</label>
                    <select class="form-control modern-input" id="analyticsYear" onchange="changeAnalyticsPeriod()">
                        ${generateYearOptions()}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Month</label>
                    <select class="form-control modern-input" id="analyticsMonth" onchange="changeAnalyticsPeriod()">
                        ${monthNames.map((month, index) => 
                            `<option value="${index + 1}" ${selectedAnalyticsMonth === index + 1 ? 'selected' : ''}>
                                ${month}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-6 text-end">
                    <button class="modern-btn success-btn me-2" onclick="exportDutyAnalytics()">
                        <i class="fas fa-file-excel me-2"></i>Export Excel
                    </button>
                    <button class="modern-btn danger-btn" onclick="exportDutyAnalyticsPDF()">
                        <i class="fas fa-file-pdf me-2"></i>Export PDF
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card glass-effect primary-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${analytics.activeDoctors || 0}</h3>
                        <p>Active Doctors</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card glass-effect success-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${analytics.totalShifts || 0}</h3>
                        <p>Total Shifts</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card glass-effect warning-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${analytics.referralDuties || 0}</h3>
                        <p>Referral Duties</p>
                        <small>${analytics.referralPercentage || 0}% of total</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card glass-effect info-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${analytics.averageWorkload || 0}</h3>
                        <p>Avg Workload</p>
                        <small>Per doctor</small>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Doctor Analytics Cards -->
        <div class="doctor-analytics-section">
            <div class="section-header mb-4">
                <h4>
                    <i class="fas fa-user-md me-2"></i>
                    Doctor Duty Analysis - ${monthNames[selectedAnalyticsMonth - 1]} ${selectedAnalyticsYear}
                </h4>
            </div>
            
            ${doctorStats.length > 0 ? `
                <div class="doctor-cards-grid">
                    ${doctorStats.map(stat => {
                        const { doctor, counts, total, percentages } = stat;
                        const maxCount = Math.max(counts.morning, counts.evening, counts.night, counts.referral);
                        const isBalanced = maxCount - Math.min(counts.morning, counts.evening, counts.night) <= 2;
                        
                        return `
                        <div class="doctor-stat-card glass-effect">
                            <div class="doctor-header">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=667eea&color=fff" 
                                     alt="${doctor.name}" class="doctor-avatar-large">
                                <div class="doctor-info">
                                    <h5>${doctor.name}</h5>
                                    <small class="text-muted">${doctor.specialization}</small>
                                </div>
                                <div class="total-duties">
                                    <span class="badge bg-success">${total} Duties</span>
                                </div>
                            </div>
                            
                            <div class="duty-breakdown">
                                <div class="duty-item">
                                    <div class="duty-label">
                                        <i class="fas fa-sun text-primary"></i>
                                        <span>Morning</span>
                                    </div>
                                    <div class="duty-value">
                                        <span class="count">${counts.morning}</span>
                                        <span class="percentage">${percentages.morning}%</span>
                                    </div>
                                </div>
                                
                                <div class="duty-item">
                                    <div class="duty-label">
                                        <i class="fas fa-cloud-sun text-info"></i>
                                        <span>Evening</span>
                                    </div>
                                    <div class="duty-value">
                                        <span class="count">${counts.evening}</span>
                                        <span class="percentage">${percentages.evening}%</span>
                                    </div>
                                </div>
                                
                                <div class="duty-item">
                                    <div class="duty-label">
                                        <i class="fas fa-moon text-dark"></i>
                                        <span>Night</span>
                                    </div>
                                    <div class="duty-value">
                                        <span class="count">${counts.night}</span>
                                        <span class="percentage">${percentages.night}%</span>
                                    </div>
                                </div>
                                
                                <div class="duty-item">
                                    <div class="duty-label">
                                        <i class="fas fa-exchange-alt text-warning"></i>
                                        <span>Referral</span>
                                    </div>
                                    <div class="duty-value">
                                        <span class="count">${counts.referral}</span>
                                        <span class="percentage">${percentages.referral}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="distribution-visual">
                                <div class="distribution-bar">
                                    ${counts.morning > 0 ? `<div class="bar-segment morning" style="width: ${percentages.morning}%" title="Morning: ${percentages.morning}%"></div>` : ''}
                                    ${counts.evening > 0 ? `<div class="bar-segment evening" style="width: ${percentages.evening}%" title="Evening: ${percentages.evening}%"></div>` : ''}
                                    ${counts.night > 0 ? `<div class="bar-segment night" style="width: ${percentages.night}%" title="Night: ${percentages.night}%"></div>` : ''}
                                    ${counts.referral > 0 ? `<div class="bar-segment referral" style="width: ${percentages.referral}%" title="Referral: ${percentages.referral}%"></div>` : ''}
                                </div>
                                <div class="balance-indicator">
                                    ${isBalanced ? 
                                        '<span class="text-success"><i class="fas fa-check-circle"></i> Balanced</span>' : 
                                        '<span class="text-warning"><i class="fas fa-exclamation-circle"></i> Unbalanced</span>'
                                    }
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Summary Table (Collapsible) -->
                <div class="summary-section mt-4">
                    <button class="modern-btn secondary-btn mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#summaryTable">
                        <i class="fas fa-table me-2"></i>View Summary Table
                    </button>
                    <div class="collapse" id="summaryTable">
                        <div class="table-container glass-effect">
                            <div class="table-responsive">
                                <table class="table modern-table">
                                    <thead>
                                        <tr>
                                            <th>Doctor</th>
                                            <th class="text-center">Morning</th>
                                            <th class="text-center">Evening</th>
                                            <th class="text-center">Night</th>
                                            <th class="text-center">Referral</th>
                                            <th class="text-center">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${doctorStats.map(stat => `
                                            <tr>
                                                <td>${stat.doctor.name}</td>
                                                <td class="text-center">${stat.counts.morning}</td>
                                                <td class="text-center">${stat.counts.evening}</td>
                                                <td class="text-center">${stat.counts.night}</td>
                                                <td class="text-center">${stat.counts.referral}</td>
                                                <td class="text-center fw-bold">${stat.total}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-active">
                                            <th>Total</th>
                                            <th class="text-center">${doctorStats.reduce((sum, s) => sum + s.counts.morning, 0)}</th>
                                            <th class="text-center">${doctorStats.reduce((sum, s) => sum + s.counts.evening, 0)}</th>
                                            <th class="text-center">${doctorStats.reduce((sum, s) => sum + s.counts.night, 0)}</th>
                                            <th class="text-center">${doctorStats.reduce((sum, s) => sum + s.counts.referral, 0)}</th>
                                            <th class="text-center fw-bold">${doctorStats.reduce((sum, s) => sum + s.total, 0)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ` : `
                <div class="empty-state glass-effect p-5 text-center">
                    <i class="fas fa-chart-pie fa-4x text-muted mb-3"></i>
                    <h4>No Analytics Data Available</h4>
                    <p class="text-muted">No duty data found for ${monthNames[selectedAnalyticsMonth - 1]} ${selectedAnalyticsYear}</p>
                </div>
            `}
        </div>
        
        <!-- Charts Section -->
        ${doctorStats.length > 0 ? `
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="chart-container glass-effect p-4">
                        <h5 class="mb-3">Shift Distribution Overview</h5>
                        <canvas id="shiftDistributionChart"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-container glass-effect p-4">
                        <h5 class="mb-3">Doctor Workload Comparison</h5>
                        <canvas id="workloadComparisonChart"></canvas>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    // Set current period in dropdowns
    document.getElementById('analyticsYear').value = selectedAnalyticsYear;
    document.getElementById('analyticsMonth').value = selectedAnalyticsMonth;
    
    // Render charts if data exists
    if (doctorStats.length > 0) {
        renderAnalyticsCharts(analytics, doctorStats);
    }
}

// Generate year options
function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= currentYear - 5; year--) {
        years.push(`<option value="${year}" ${selectedAnalyticsYear === year ? 'selected' : ''}>${year}</option>`);
    }
    return years.join('');
}

// Change Analytics Period
async function changeAnalyticsPeriod() {
    selectedAnalyticsYear = parseInt(document.getElementById('analyticsYear').value);
    selectedAnalyticsMonth = parseInt(document.getElementById('analyticsMonth').value);
    await loadDutyAnalytics();
}

// Render Analytics Charts
function renderAnalyticsCharts(analytics, doctorStats) {
    // Calculate totals for shift distribution
    const shiftTotals = {
        morning: doctorStats.reduce((sum, s) => sum + s.counts.morning, 0),
        evening: doctorStats.reduce((sum, s) => sum + s.counts.evening, 0),
        night: doctorStats.reduce((sum, s) => sum + s.counts.night, 0),
        referral: doctorStats.reduce((sum, s) => sum + s.counts.referral, 0)
    };
    
    // Shift Distribution Pie Chart
    const pieCtx = document.getElementById('shiftDistributionChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Morning', 'Evening', 'Night', 'Referral'],
            datasets: [{
                data: [shiftTotals.morning, shiftTotals.evening, shiftTotals.night, shiftTotals.referral],
                backgroundColor: ['#0d6efd', '#0dcaf0', '#212529', '#ffc107'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Workload Comparison Bar Chart
    const barCtx = document.getElementById('workloadComparisonChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: doctorStats.slice(0, 10).map(s => s.doctor.name),
            datasets: [
                {
                    label: 'Morning',
                    data: doctorStats.slice(0, 10).map(s => s.counts.morning),
                    backgroundColor: '#0d6efd'
                },
                {
                    label: 'Evening',
                    data: doctorStats.slice(0, 10).map(s => s.counts.evening),
                    backgroundColor: '#0dcaf0'
                },
                {
                    label: 'Night',
                    data: doctorStats.slice(0, 10).map(s => s.counts.night),
                    backgroundColor: '#212529'
                },
                {
                    label: 'Referral',
                    data: doctorStats.slice(0, 10).map(s => s.counts.referral),
                    backgroundColor: '#ffc107'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Duties'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// Export Duty Analytics
async function exportDutyAnalytics() {
    try {
        if (typeof showToast === 'function') {
            showToast('Generating Excel file...', 'info');
        }
        
        // Prepare data for export
        const doctorStats = Object.values(currentAnalyticsData.doctorAnalysis || {})
            .sort((a, b) => b.total - a.total);
        
        const worksheetData = [
            ['Fayfa General Hospital - Duty Analytics Report'],
            [`Period: ${selectedAnalyticsMonth}/${selectedAnalyticsYear}`],
            [''],
            ['Doctor Name', 'Morning', 'Evening', 'Night', 'Referral', 'Total', 'Morning %', 'Evening %', 'Night %', 'Referral %']
        ];
        
        // Add doctor data
        doctorStats.forEach(stat => {
            worksheetData.push([
                stat.doctor.name,
                stat.counts.morning,
                stat.counts.evening,
                stat.counts.night,
                stat.counts.referral,
                stat.total,
                stat.percentages.morning + '%',
                stat.percentages.evening + '%',
                stat.percentages.night + '%',
                stat.percentages.referral + '%'
            ]);
        });
        
        // Add totals
        worksheetData.push([
            'TOTAL',
            doctorStats.reduce((sum, s) => sum + s.counts.morning, 0),
            doctorStats.reduce((sum, s) => sum + s.counts.evening, 0),
            doctorStats.reduce((sum, s) => sum + s.counts.night, 0),
            doctorStats.reduce((sum, s) => sum + s.counts.referral, 0),
            doctorStats.reduce((sum, s) => sum + s.total, 0),
            '', '', '', ''
        ]);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
            { wch: 10 }, { wch: 10 }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Duty Analytics');
        
        // Download
        XLSX.writeFile(wb, `Duty_Analytics_${selectedAnalyticsYear}_${selectedAnalyticsMonth}.xlsx`);
        
        if (typeof showToast === 'function') {
            showToast('Excel file downloaded successfully', 'success');
        }
    } catch (error) {
        console.error('Error exporting duty analytics:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to export analytics', 'error');
        }
    }
}

// Export Duty Analytics to PDF
function exportDutyAnalyticsPDF() {
    try {
        // Check if analytics data is available
        if (!currentAnalyticsData || !currentAnalyticsData.doctorAnalysis) {
            alert('No analytics data available. Please load analytics first.');
            return;
        }
        
        // Create PDF using the same pattern as exportUtils.js
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Get doctor stats
        const doctorStats = Object.values(currentAnalyticsData.doctorAnalysis || {})
            .sort((a, b) => b.total - a.total);
        
        // Add header
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('Fayfa General Hospital', 20, 20);
        
        pdf.setFontSize(16);
        pdf.text('Duty Analytics Report', 20, 35);
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const monthName = monthNames[selectedAnalyticsMonth - 1];
        pdf.text(`Period: ${monthName} ${selectedAnalyticsYear}`, 20, 45);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 52);
        
        // Summary statistics
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Summary Statistics:', 20, 65);
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        let yPos = 72;
        pdf.text(`Active Doctors: ${currentAnalyticsData.activeDoctors || 0}`, 25, yPos);
        pdf.text(`Total Shifts: ${currentAnalyticsData.totalShifts || 0}`, 25, yPos + 7);
        pdf.text(`Referral Duties: ${currentAnalyticsData.referralDuties || 0} (${currentAnalyticsData.referralPercentage || 0}%)`, 25, yPos + 14);
        pdf.text(`Average Workload: ${currentAnalyticsData.averageWorkload || 0} duties/doctor`, 25, yPos + 21);
        
        // Doctor analytics table
        const tableData = doctorStats.map(stat => [
            stat.doctor.name,
            `${stat.counts.morning} (${stat.percentages.morning}%)`,
            `${stat.counts.evening} (${stat.percentages.evening}%)`,
            `${stat.counts.night} (${stat.percentages.night}%)`,
            `${stat.counts.referral} (${stat.percentages.referral}%)`,
            stat.total.toString()
        ]);
        
        // Add totals row
        const totals = doctorStats.reduce((acc, stat) => ({
            morning: acc.morning + stat.counts.morning,
            evening: acc.evening + stat.counts.evening,
            night: acc.night + stat.counts.night,
            referral: acc.referral + stat.counts.referral,
            total: acc.total + stat.total
        }), { morning: 0, evening: 0, night: 0, referral: 0, total: 0 });
        
        tableData.push([
            'TOTAL',
            totals.morning.toString(),
            totals.evening.toString(),
            totals.night.toString(),
            totals.referral.toString(),
            totals.total.toString()
        ]);
        
        // Generate table
        pdf.autoTable({
            head: [['Doctor Name', 'Morning', 'Evening', 'Night', 'Referral', 'Total']],
            body: tableData,
            startY: 100,
            theme: 'grid',
            headStyles: { 
                fillColor: [44, 62, 80],
                textColor: 255,
                fontSize: 10
            },
            bodyStyles: {
                fontSize: 9
            },
            alternateRowStyles: { 
                fillColor: [248, 249, 250] 
            },
            didDrawRow: function(data) {
                // Style the total row
                if (data.row.index === tableData.length - 1) {
                    data.row.cells.forEach(cell => {
                        cell.styles.fontStyle = 'bold';
                        cell.styles.fillColor = [240, 240, 240];
                    });
                }
            }
        });
        
        // Save the PDF
        const filename = `Duty_Analytics_${monthName}_${selectedAnalyticsYear}.pdf`;
        pdf.save(filename);
        
        if (typeof showAlert === 'function') {
            showAlert('PDF report generated successfully', 'success');
        } else if (typeof showToast === 'function') {
            showToast('PDF report generated successfully', 'success');
        }
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF report: ' + error.message);
    }
}

// Export functions to global scope
window.showDutyAnalytics = showDutyAnalytics;
window.hideDutyAnalytics = hideDutyAnalytics;
window.changeAnalyticsPeriod = changeAnalyticsPeriod;
window.exportDutyAnalytics = exportDutyAnalytics;
window.exportDutyAnalyticsPDF = exportDutyAnalyticsPDF;