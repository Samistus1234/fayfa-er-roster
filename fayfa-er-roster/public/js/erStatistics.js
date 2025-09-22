// ER Statistics Management Functions
let currentERStats = [];
let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth() + 1;

// Show ER Statistics Section
async function showERStatistics() {
    // Hide all other dynamic sections
    const dynamicSections = document.querySelectorAll('#dynamicSections > section');
    dynamicSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show ER Statistics section
    document.getElementById('erStatisticsSection').style.display = 'block';
    
    // Animate entrance
    gsap.from('#erStatisticsSection', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        ease: 'power2.out'
    });
    
    await loadERStatistics();
}

// Hide ER Statistics Section
function hideERStatistics() {
    gsap.to('#erStatisticsSection', {
        duration: 0.3,
        y: -20,
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => {
            document.getElementById('erStatisticsSection').style.display = 'none';
        }
    });
}

// Load ER Statistics
async function loadERStatistics() {
    const contentDiv = document.getElementById('erStatisticsContent');
    
    // Show loading state
    contentDiv.innerHTML = `
        <div class="loading-state">
            <div class="loader-modern">
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
            </div>
            <p class="loading-text">Loading ER statistics...</p>
        </div>
    `;
    
    try {
        // Fetch summary for current month
        const response = await fetch(`/api/er-statistics/summary/${selectedYear}/${selectedMonth}`);
        const data = await response.json();
        
        if (data.success) {
            currentERStats = data.data.hospitals;
            renderERStatistics(data.data);
        } else {
            if (typeof showToast === 'function') {
                showToast('Failed to load ER statistics', 'error');
            }
            contentDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load ER statistics. Please try again.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading ER statistics:', error);
        if (typeof showToast === 'function') {
            showToast('Error loading ER statistics', 'error');
        }
        contentDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error loading ER statistics. Please check console for details.
            </div>
        `;
    }
}

// Render ER Statistics
function renderERStatistics(summary) {
    const contentDiv = document.getElementById('erStatisticsContent');
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const arabicMonthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                             'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    contentDiv.innerHTML = `
        <!-- Controls Section -->
        <div class="er-stats-controls glass-effect p-4 mb-4">
            <div class="row align-items-end">
                <div class="col-md-3">
                    <label class="form-label">Year</label>
                    <select class="form-control modern-input" id="erStatsYear" onchange="changeERStatsPeriod()">
                        ${generateYearOptions()}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Month</label>
                    <select class="form-control modern-input" id="erStatsMonth" onchange="changeERStatsPeriod()">
                        ${monthNames.map((month, index) => 
                            `<option value="${index + 1}" ${selectedMonth === index + 1 ? 'selected' : ''}>
                                ${month}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-6 text-end">
                    <button class="modern-btn primary-btn me-2" onclick="showAddERStatisticsModal()">
                        <i class="fas fa-plus me-2"></i>Add Daily Data
                    </button>
                    <button class="modern-btn success-btn me-2" onclick="exportERStatistics()">
                        <i class="fas fa-file-excel me-2"></i>Export Excel
                    </button>
                    <button class="modern-btn info-btn" onclick="generatePDFReport()">
                        <i class="fas fa-file-pdf me-2"></i>PDF Report
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card glass-effect danger-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-ambulance"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${summary.totals.critical.toLocaleString()}</h3>
                        <p>Critical Cases (CTAS 1&2)</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card glass-effect warning-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${summary.totals.urgent.toLocaleString()}</h3>
                        <p>Urgent Cases (CTAS 3)</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card glass-effect info-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-user-injured"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${summary.totals.nonUrgent.toLocaleString()}</h3>
                        <p>Non-Urgent (CTAS 4&5)</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card glass-effect success-gradient text-white">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${summary.totals.total.toLocaleString()}</h3>
                        <p>Total Visits</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Statistics Table -->
        <div class="table-container glass-effect">
            <div class="table-header">
                <h4>
                    <i class="fas fa-table me-2"></i>
                    Fayfa General Hospital - Emergency Department Statistics - ${monthNames[selectedMonth - 1]} ${selectedYear}
                </h4>
            </div>
            
            ${summary.hospitals.length > 0 ? `
                <div class="table-responsive">
                    <table class="table modern-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th class="text-center">
                                    <span class="badge bg-danger">Critical</span>
                                    <br><small>CTAS 1&2</small>
                                </th>
                                <th class="text-center">
                                    <span class="badge bg-warning">Urgent</span>
                                    <br><small>CTAS 3</small>
                                </th>
                                <th class="text-center">
                                    <span class="badge bg-info">Non-Urgent</span>
                                    <br><small>CTAS 4&5</small>
                                </th>
                                <th class="text-center">
                                    <span class="badge bg-success">Total</span>
                                </th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summary.hospitals.map(hospital => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="hospital-icon me-2">
                                                <i class="fas fa-hospital text-primary"></i>
                                            </div>
                                            <div>
                                                <strong>${hospital.hospitalName}</strong>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span class="stat-number text-danger">${hospital.statistics.critical.toLocaleString()}</span>
                                    </td>
                                    <td class="text-center">
                                        <span class="stat-number text-warning">${hospital.statistics.urgent.toLocaleString()}</span>
                                    </td>
                                    <td class="text-center">
                                        <span class="stat-number text-info">${hospital.statistics.nonUrgent.toLocaleString()}</span>
                                    </td>
                                    <td class="text-center">
                                        <span class="stat-number text-success fw-bold">${hospital.statistics.total.toLocaleString()}</span>
                                    </td>
                                    <td class="text-center">
                                        <button class="btn btn-sm btn-primary me-1" onclick="editERStatistic('${hospital.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteERStatistic('${hospital.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="table-active">
                                <th>Total</th>
                                <th class="text-center text-danger">${summary.totals.critical.toLocaleString()}</th>
                                <th class="text-center text-warning">${summary.totals.urgent.toLocaleString()}</th>
                                <th class="text-center text-info">${summary.totals.nonUrgent.toLocaleString()}</th>
                                <th class="text-center text-success fw-bold">${summary.totals.total.toLocaleString()}</th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ` : `
                <div class="empty-state p-5 text-center">
                    <i class="fas fa-hospital fa-4x text-muted mb-3"></i>
                    <h4>No Statistics Available</h4>
                    <p class="text-muted">No emergency department statistics found for ${monthNames[selectedMonth - 1]} ${selectedYear}</p>
                    <button class="modern-btn primary-btn mt-3" onclick="showAddERStatisticsModal()">
                        <i class="fas fa-plus me-2"></i>Add Daily Data
                    </button>
                </div>
            `}
        </div>
        
        <!-- Charts Section -->
        ${summary.hospitals.length > 0 ? `
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="chart-container glass-effect p-4">
                        <h5 class="mb-3">Distribution by Triage Level</h5>
                        <canvas id="erStatsPieChart"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-container glass-effect p-4">
                        <h5 class="mb-3">Daily Trend</h5>
                        <canvas id="erStatsBarChart"></canvas>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    // Set current period in dropdowns
    document.getElementById('erStatsYear').value = selectedYear;
    document.getElementById('erStatsMonth').value = selectedMonth;
    
    // Render charts if data exists
    if (summary.hospitals.length > 0) {
        renderERStatsCharts(summary);
    }
}

// Generate year options
function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= currentYear - 5; year--) {
        years.push(`<option value="${year}" ${selectedYear === year ? 'selected' : ''}>${year}</option>`);
    }
    return years.join('');
}

// Change ER Stats Period
async function changeERStatsPeriod() {
    selectedYear = parseInt(document.getElementById('erStatsYear').value);
    selectedMonth = parseInt(document.getElementById('erStatsMonth').value);
    await loadERStatistics();
}

// Render Charts
function renderERStatsCharts(summary) {
    // Pie Chart - Distribution by Triage Level
    const pieCtx = document.getElementById('erStatsPieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Critical (CTAS 1&2)', 'Urgent (CTAS 3)', 'Non-Urgent (CTAS 4&5)'],
            datasets: [{
                data: [summary.totals.critical, summary.totals.urgent, summary.totals.nonUrgent],
                backgroundColor: ['#dc3545', '#ffc107', '#17a2b8'],
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
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Bar Chart - Daily Trend
    const barCtx = document.getElementById('erStatsBarChart').getContext('2d');
    
    // Get daily stats from the first (and only) hospital
    const hospital = summary.hospitals[0];
    const dailyStats = hospital.dailyStats || [];
    
    new Chart(barCtx, {
        type: 'line',
        data: {
            labels: dailyStats.map(d => `Day ${d.day}`),
            datasets: [
                {
                    label: 'Total Visits',
                    data: dailyStats.map(d => d.total),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Critical',
                    data: dailyStats.map(d => d.statistics.critical),
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Urgent',
                    data: dailyStats.map(d => d.statistics.urgent),
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Non-Urgent',
                    data: dailyStats.map(d => d.statistics.nonUrgent),
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Export ER Statistics
async function exportERStatistics() {
    try {
        if (typeof showToast === 'function') {
            showToast('Generating Excel file...', 'info');
        }
        
        // Download the Excel file
        window.location.href = `/api/er-statistics/export/${selectedYear}/${selectedMonth}`;
        
        if (typeof showToast === 'function') {
            showToast('Excel file downloaded successfully', 'success');
        }
    } catch (error) {
        console.error('Error exporting ER statistics:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to export statistics', 'error');
        }
    }
}

// Generate PDF Report
async function generatePDFReport() {
    try {
        if (typeof showToast === 'function') {
            showToast('Generating PDF report...', 'info');
        }
        
        // Download the PDF file
        window.location.href = `/api/er-statistics/pdf/${selectedYear}/${selectedMonth}`;
        
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast('PDF report generated successfully', 'success');
            }
        }, 2000);
    } catch (error) {
        console.error('Error generating PDF:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to generate PDF report', 'error');
        }
    }
}

// Show Add ER Statistics Modal
function showAddERStatisticsModal() {
    // You can implement a modal for adding new hospital statistics
    if (typeof showToast === 'function') {
        showToast('Add statistics feature coming soon', 'info');
    }
    console.log('Add statistics modal - coming soon');
}

// Edit ER Statistic
function editERStatistic(id) {
    // You can implement edit functionality
    if (typeof showToast === 'function') {
        showToast('Edit feature coming soon', 'info');
    }
    console.log('Edit statistic:', id);
}

// Delete ER Statistic
async function deleteERStatistic(id) {
    if (!confirm('Are you sure you want to delete this statistic?')) return;
    
    try {
        const response = await fetch(`/api/er-statistics/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (typeof showToast === 'function') {
                showToast('Statistic deleted successfully', 'success');
            }
            await loadERStatistics();
        } else {
            if (typeof showToast === 'function') {
                showToast('Failed to delete statistic', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting statistic:', error);
        if (typeof showToast === 'function') {
            showToast('Error deleting statistic', 'error');
        }
    }
}

// Export functions to global scope
window.showERStatistics = showERStatistics;
window.hideERStatistics = hideERStatistics;
window.changeERStatsPeriod = changeERStatsPeriod;
window.exportERStatistics = exportERStatistics;
window.generatePDFReport = generatePDFReport;
window.showAddERStatisticsModal = showAddERStatisticsModal;
window.editERStatistic = editERStatistic;
window.deleteERStatistic = deleteERStatistic;