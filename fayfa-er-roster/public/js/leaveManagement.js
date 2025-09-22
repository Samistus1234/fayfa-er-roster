// Show Leave Management Section
async function showLeaveManagement() {
    // Hide all other dynamic sections
    const dynamicSections = document.querySelectorAll('#dynamicSections > section');
    dynamicSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show Leave Management section
    const leaveSection = document.getElementById('leaveManagementSection');
    if (leaveSection) {
        leaveSection.style.display = 'block';
    }
    
    // Animate entrance if gsap is available
    if (typeof gsap !== 'undefined') {
        gsap.from('#leaveManagementSection', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        });
    }
    
    // Initialize leave manager if not already initialized
    if (!window.leaveManager) {
        window.leaveManager = new LeaveManager();
    }
}

// Leave Management Module
class LeaveManager {
    constructor() {
        this.leaves = [];
        this.leaveBalance = null;
        this.currentView = 'my-leaves';
        this.calendarMonth = new Date().getMonth() + 1;
        this.calendarYear = new Date().getFullYear();
        this.isAdmin = false;
        this.init();
    }

    async init() {
        try {
            // Check if user is admin
            const userRole = document.querySelector('[data-user-role]')?.dataset.userRole;
            this.isAdmin = userRole === 'admin';
            
            await this.loadLeaveRequests();
            await this.loadLeaveBalance();
            this.setupEventListeners();
            await this.renderLeaveSection();
            
            // Initialize leave balance for all doctors if admin
            if (this.isAdmin) {
                await this.initializeAllDoctorBalances();
            }
        } catch (error) {
            console.error('Error initializing LeaveManager:', error);
        }
    }

    async initializeAllDoctorBalances() {
        try {
            const response = await fetch('/api/doctors');
            const doctors = await response.json();
            
            if (doctors.success) {
                for (const doctor of doctors.data) {
                    const balanceResponse = await fetch(`/api/leaves/balance/${doctor.id}`);
                    const balanceData = await balanceResponse.json();
                    
                    // If balance is not initialized, initialize it
                    if (!balanceData.success) {
                        await fetch(`/api/leaves/balance/${doctor.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ balance: 45 }) // Default 45 days
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error initializing doctor balances:', error);
        }
    }

    setupEventListeners() {
        // Calendar navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.leave-prev-month')) {
                this.changeMonth(-1);
            } else if (e.target.matches('.leave-next-month')) {
                this.changeMonth(1);
            } else if (e.target.matches('.leave-tab')) {
                this.switchView(e.target.dataset.view);
            }
        });
    }

    async loadLeaveRequests() {
        try {
            const endpoint = this.isAdmin ? '/api/leaves/all' : '/api/leaves/my-leaves';
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                console.warn('Failed to load leave requests:', response.status);
                this.leaves = [];
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                if (this.isAdmin) {
                    this.leaves = data.data || [];
                } else {
                    this.leaves = data.data?.requests || [];
                    this.leaveBalance = data.data?.leaveBalance;
                }
            } else {
                this.leaves = [];
            }
        } catch (error) {
            console.error('Error loading leave requests:', error);
            this.leaves = [];
        }
    }

    async loadLeaveBalance() {
        if (this.isAdmin) return;
        
        try {
            const response = await fetch('/api/leaves/balance');
            
            if (!response.ok) {
                console.warn('Failed to load leave balance:', response.status);
                // Set default balance if API fails
                this.leaveBalance = {
                    total: 45,
                    used: 0,
                    remaining: 45
                };
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.leaveBalance = data.data.annualLeave;
            } else {
                // Set default balance
                this.leaveBalance = {
                    total: 45,
                    used: 0,
                    remaining: 45
                };
            }
        } catch (error) {
            console.error('Error loading leave balance:', error);
            // Set default balance on error
            this.leaveBalance = {
                total: 45,
                used: 0,
                remaining: 45
            };
        }
    }

    async renderLeaveSection() {
        const container = document.getElementById('leaveContent');
        if (!container) return;

        // Show loading state
        container.innerHTML = '<div class="leave-content loading"></div>';
        
        try {
            const viewContent = await this.getViewContent();
            
            container.innerHTML = `
                <div class="leave-management-container">
                    <div class="leave-help-section">
                        <button class="btn-help glass-effect" onclick="window.showLeaveHelp()">
                            <i class="fas fa-question-circle"></i> How to Use Leave Management
                        </button>
                    </div>
                    ${!this.isAdmin ? this.renderLeaveBalance() : ''}
                    ${this.renderLeaveTabs()}
                    <div class="leave-content">
                        ${viewContent}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering leave section:', error);
            container.innerHTML = `
                <div class="leave-management-container">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading leave management. Please refresh the page.</p>
                    </div>
                </div>
            `;
        }
    }

    renderLeaveBalance() {
        if (!this.leaveBalance) return '';
        
        const percentage = (this.leaveBalance.remaining / this.leaveBalance.total) * 100;
        const statusClass = percentage > 50 ? 'good' : percentage > 25 ? 'warning' : 'critical';
        
        return `
            <div class="leave-balance-card glass-effect">
                <div class="balance-header">
                    <h3>Annual Leave Balance</h3>
                    <button class="btn-modern btn-primary" onclick="leaveManager.showRequestModal()">
                        <i class="fas fa-plus"></i> Request Leave
                    </button>
                </div>
                <div class="balance-content">
                    <div class="balance-stats">
                        <div class="stat">
                            <span class="stat-value">${this.leaveBalance.total}</span>
                            <span class="stat-label">Total Days</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.leaveBalance.used}</span>
                            <span class="stat-label">Used</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value ${statusClass}">${this.leaveBalance.remaining}</span>
                            <span class="stat-label">Remaining</span>
                        </div>
                    </div>
                    <div class="balance-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${statusClass}" style="width: ${100 - percentage}%"></div>
                        </div>
                        <span class="progress-label">${Math.round(percentage)}% Available</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLeaveTabs() {
        return `
            <div class="leave-tabs">
                <button class="leave-tab ${this.currentView === 'my-leaves' ? 'active' : ''}" 
                        data-view="my-leaves">
                    My Leaves
                </button>
                ${this.isAdmin ? `
                    <button class="leave-tab ${this.currentView === 'all-leaves' ? 'active' : ''}" 
                            data-view="all-leaves">
                        All Requests
                    </button>
                ` : ''}
                <button class="leave-tab ${this.currentView === 'calendar' ? 'active' : ''}" 
                        data-view="calendar">
                    Calendar View
                </button>
                ${this.isAdmin ? `
                    <button class="leave-tab ${this.currentView === 'statistics' ? 'active' : ''}" 
                            data-view="statistics">
                        Statistics
                    </button>
                    <button class="leave-tab ${this.currentView === 'annual-planning' ? 'active' : ''}" 
                            data-view="annual-planning">
                        Annual Planning
                    </button>
                ` : ''}
            </div>
        `;
    }

    async getViewContent() {
        switch (this.currentView) {
            case 'calendar':
                return this.renderCalendarView();
            case 'statistics':
                return this.renderStatisticsView();
            case 'annual-planning':
                return await this.renderAnnualPlanningView();
            default:
                return this.renderListView();
        }
    }

    renderListView() {
        const leaves = this.currentView === 'all-leaves' ? (this.leaves || []) : 
                       (this.leaves || []).filter(l => l.status === 'pending' || l.status === 'approved');
        
        if (!leaves || leaves.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No leave requests found</p>
                </div>
            `;
        }

        return `
            <div class="leave-list">
                ${leaves.map(leave => this.renderLeaveCard(leave)).join('')}
            </div>
        `;
    }

    renderLeaveCard(leave) {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const statusClass = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            cancelled: 'secondary'
        }[leave.status];

        return `
            <div class="leave-card glass-effect">
                <div class="leave-card-header">
                    <div class="leave-type-badge ${leave.type}">
                        ${this.getLeaveTypeIcon(leave.type)}
                        ${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave
                    </div>
                    <span class="badge badge-${statusClass}">${leave.status}</span>
                </div>
                <div class="leave-card-body">
                    ${leave.doctor ? `
                        <div class="doctor-info">
                            <i class="fas fa-user-md"></i>
                            <span>${leave.doctor.name}</span>
                        </div>
                    ` : ''}
                    <div class="leave-dates">
                        <i class="fas fa-calendar"></i>
                        <span>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
                        <span class="duration">(${leave.duration} days)</span>
                    </div>
                    ${leave.reason ? `
                        <div class="leave-reason">
                            <i class="fas fa-comment"></i>
                            <span>${leave.reason}</span>
                        </div>
                    ` : ''}
                    ${leave.adminNotes && leave.status !== 'pending' ? `
                        <div class="admin-notes">
                            <i class="fas fa-clipboard-check"></i>
                            <span>${leave.adminNotes}</span>
                        </div>
                    ` : ''}
                </div>
                ${this.renderLeaveActions(leave)}
            </div>
        `;
    }

    renderLeaveActions(leave) {
        const actions = [];

        if (leave.status === 'pending') {
            if (this.isAdmin) {
                actions.push(`
                    <button class="btn-modern btn-success" onclick="leaveManager.approveLeave('${leave.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-modern btn-danger" onclick="leaveManager.rejectLeave('${leave.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                `);
            } else if (!leave.doctor) { // It's the user's own request
                actions.push(`
                    <button class="btn-modern btn-secondary" onclick="leaveManager.cancelLeave('${leave.id}')">
                        <i class="fas fa-ban"></i> Cancel
                    </button>
                `);
            }
        }

        return actions.length > 0 ? `
            <div class="leave-card-actions">
                ${actions.join('')}
            </div>
        ` : '';
    }

    async renderCalendarView() {
        try {
            const response = await fetch(`/api/leaves/calendar/${this.calendarYear}/${this.calendarMonth}`);
            const data = await response.json();
            
            if (!data.success) return '<div class="error">Error loading calendar data</div>';

            const calendarData = data.data.calendar;
            const monthLeaves = data.data.leaves;

            return `
                <div class="leave-calendar">
                    ${this.renderCalendarHeader()}
                    ${this.renderCalendarGrid(calendarData)}
                    ${this.renderUpcomingLeaves(monthLeaves)}
                </div>
            `;
        } catch (error) {
            console.error('Error rendering calendar:', error);
            return '<div class="error">Error loading calendar</div>';
        }
    }

    renderCalendarHeader() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        return `
            <div class="calendar-header">
                <button class="btn-icon leave-prev-month">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3>${monthNames[this.calendarMonth - 1]} ${this.calendarYear}</h3>
                <button class="btn-icon leave-next-month">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    renderCalendarGrid(calendarData) {
        const firstDay = new Date(this.calendarYear, this.calendarMonth - 1, 1).getDay();
        const daysInMonth = new Date(this.calendarYear, this.calendarMonth, 0).getDate();
        
        let grid = '<div class="calendar-grid">';
        
        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            grid += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            grid += '<div class="calendar-day empty"></div>';
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.calendarYear}-${String(this.calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const leaves = calendarData[dateStr] || [];
            const hasLeaves = leaves.length > 0;
            const isToday = this.isToday(dateStr);
            
            grid += `
                <div class="calendar-day ${hasLeaves ? 'has-leaves' : ''} ${isToday ? 'today' : ''}"
                     ${hasLeaves ? `title="${leaves.length} doctor(s) on leave"` : ''}>
                    <span class="day-number">${day}</span>
                    ${hasLeaves ? `
                        <div class="leave-indicators">
                            ${leaves.slice(0, 3).map(l => `
                                <div class="leave-indicator ${l.type}" 
                                     title="${l.doctorName} - ${l.type} leave"></div>
                            `).join('')}
                            ${leaves.length > 3 ? `<span class="more">+${leaves.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        grid += '</div>';
        return grid;
    }

    renderUpcomingLeaves(leaves) {
        const upcoming = leaves.filter(l => new Date(l.startDate) >= new Date());
        
        if (upcoming.length === 0) return '';
        
        return `
            <div class="upcoming-leaves">
                <h4>Upcoming Leaves This Month</h4>
                <div class="upcoming-list">
                    ${upcoming.map(leave => `
                        <div class="upcoming-item">
                            <i class="${this.getLeaveTypeIcon(leave.type)}"></i>
                            <span class="doctor-name">${leave.doctorName}</span>
                            <span class="dates">
                                ${new Date(leave.startDate).toLocaleDateString()} - 
                                ${new Date(leave.endDate).toLocaleDateString()}
                            </span>
                            <span class="badge badge-${leave.type}">${leave.type}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async renderStatisticsView() {
        try {
            const response = await fetch('/api/leaves/statistics');
            const data = await response.json();
            
            if (!data.success) return '<div class="error">Error loading statistics</div>';
            
            const stats = data.data;
            
            return `
                <div class="leave-statistics">
                    <div class="stats-grid">
                        <div class="stat-card glass-effect">
                            <i class="fas fa-calendar-check"></i>
                            <h4>Total Requests</h4>
                            <span class="stat-value">${stats.total}</span>
                        </div>
                        <div class="stat-card glass-effect">
                            <i class="fas fa-clock"></i>
                            <h4>Pending</h4>
                            <span class="stat-value warning">${stats.pending}</span>
                        </div>
                        <div class="stat-card glass-effect">
                            <i class="fas fa-check-circle"></i>
                            <h4>Approved</h4>
                            <span class="stat-value success">${stats.approved}</span>
                        </div>
                        <div class="stat-card glass-effect">
                            <i class="fas fa-percentage"></i>
                            <h4>Approval Rate</h4>
                            <span class="stat-value">${stats.approvalRate}%</span>
                        </div>
                    </div>
                    
                    <div class="leave-type-breakdown">
                        <h4>Leave Types (This Year)</h4>
                        <div class="type-stats">
                            ${Object.entries(stats.byType).map(([type, count]) => `
                                <div class="type-stat">
                                    <i class="${this.getLeaveTypeIcon(type)}"></i>
                                    <span class="type-name">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                    <span class="type-count">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${stats.upcoming && stats.upcoming.length > 0 ? `
                        <div class="upcoming-leaves">
                            <h4>Upcoming Leaves (Next 30 Days)</h4>
                            <div class="upcoming-list">
                                ${stats.upcoming.map(leave => `
                                    <div class="upcoming-item">
                                        <span class="doctor-name">${leave.doctorName}</span>
                                        <span class="dates">
                                            ${new Date(leave.startDate).toLocaleDateString()} - 
                                            ${new Date(leave.endDate).toLocaleDateString()}
                                        </span>
                                        <span class="badge badge-${leave.type}">${leave.type}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('Error loading statistics:', error);
            return '<div class="error">Error loading statistics</div>';
        }
    }

    showRequestModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Request Leave</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <form id="leaveRequestForm">
                            <div class="mb-3">
                                <label class="form-label">Leave Type</label>
                                <select class="form-select" name="type" required>
                                    <option value="">Select type...</option>
                                    <option value="annual">Annual Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="emergency">Emergency Leave</option>
                                    <option value="personal">Personal Leave</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Start Date</label>
                                <input type="date" class="form-control" name="startDate" 
                                       min="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">End Date</label>
                                <input type="date" class="form-control" name="endDate" 
                                       min="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Reason (Optional)</label>
                                <textarea class="form-control" name="reason" rows="3"></textarea>
                            </div>
                            <div class="conflict-warning" style="display: none;">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span class="warning-text"></span>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="leaveManager.submitLeaveRequest()">
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Add date change listeners for conflict checking
        const form = modal.querySelector('#leaveRequestForm');
        const startDate = form.querySelector('[name="startDate"]');
        const endDate = form.querySelector('[name="endDate"]');
        
        const checkConflicts = async () => {
            if (startDate.value && endDate.value) {
                await this.checkConflicts(startDate.value, endDate.value, modal);
            }
        };
        
        startDate.addEventListener('change', checkConflicts);
        endDate.addEventListener('change', checkConflicts);
    }

    async checkConflicts(startDate, endDate, modal) {
        try {
            const response = await fetch('/api/leaves/check-conflicts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate })
            });
            
            const data = await response.json();
            const warningDiv = modal.querySelector('.conflict-warning');
            
            if (data.success && data.data.hasConflict) {
                warningDiv.style.display = 'block';
                warningDiv.querySelector('.warning-text').textContent = data.data.message;
            } else {
                warningDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking conflicts:', error);
        }
    }

    async submitLeaveRequest() {
        const form = document.getElementById('leaveRequestForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/api/leaves/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Leave request submitted successfully', 'success');
                document.querySelector('.modal').remove();
                await this.loadLeaveRequests();
                await this.loadLeaveBalance();
                await this.renderLeaveSection();
            } else {
                showNotification(result.message || 'Error submitting leave request', 'error');
            }
        } catch (error) {
            console.error('Error submitting leave request:', error);
            showNotification('Error submitting leave request', 'error');
        }
    }

    async approveLeave(leaveId) {
        const notes = prompt('Admin notes (optional):');
        
        try {
            const response = await fetch(`/api/leaves/${leaveId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes: notes || '' })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Leave request approved', 'success');
                await this.loadLeaveRequests();
                await this.renderLeaveSection();
            } else {
                showNotification(result.message || 'Error approving leave', 'error');
            }
        } catch (error) {
            console.error('Error approving leave:', error);
            showNotification('Error approving leave', 'error');
        }
    }

    async rejectLeave(leaveId) {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;
        
        try {
            const response = await fetch(`/api/leaves/${leaveId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Leave request rejected', 'success');
                await this.loadLeaveRequests();
                await this.renderLeaveSection();
            } else {
                showNotification(result.message || 'Error rejecting leave', 'error');
            }
        } catch (error) {
            console.error('Error rejecting leave:', error);
            showNotification('Error rejecting leave', 'error');
        }
    }

    async cancelLeave(leaveId) {
        if (!confirm('Are you sure you want to cancel this leave request?')) return;
        
        try {
            const response = await fetch(`/api/leaves/${leaveId}/cancel`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Leave request cancelled', 'success');
                await this.loadLeaveRequests();
                await this.loadLeaveBalance();
                await this.renderLeaveSection();
            } else {
                showNotification(result.message || 'Error cancelling leave', 'error');
            }
        } catch (error) {
            console.error('Error cancelling leave:', error);
            showNotification('Error cancelling leave', 'error');
        }
    }

    async changeMonth(direction) {
        this.calendarMonth += direction;
        
        if (this.calendarMonth > 12) {
            this.calendarMonth = 1;
            this.calendarYear++;
        } else if (this.calendarMonth < 1) {
            this.calendarMonth = 12;
            this.calendarYear--;
        }
        
        await this.renderLeaveSection();
    }

    async switchView(view) {
        this.currentView = view;
        
        if (view === 'statistics') {
            const content = document.querySelector('.leave-content');
            content.innerHTML = await this.renderStatisticsView();
        } else {
            await this.renderLeaveSection();
        }
    }

    getLeaveTypeIcon(type) {
        const icons = {
            annual: 'fas fa-umbrella-beach',
            sick: 'fas fa-thermometer-half',
            emergency: 'fas fa-exclamation-circle',
            personal: 'fas fa-user-clock'
        };
        return icons[type] || 'fas fa-calendar';
    }

    isToday(dateStr) {
        const today = new Date();
        const date = new Date(dateStr);
        return date.toDateString() === today.toDateString();
    }

    async renderAnnualPlanningView() {
        try {
            const currentYear = new Date().getFullYear();
            const response = await fetch(`/api/leaves/yearly-plan/${currentYear}`);
            const data = await response.json();
            
            if (!data.success) {
                return `<div class="error-state">Error loading annual plan</div>`;
            }
            
            const yearData = data.data;
            
            return `
                <div class="annual-planning-container">
                    <div class="annual-header">
                        <h3>Annual Leave Planning ${currentYear}</h3>
                        <div class="year-navigation">
                            <button onclick="leaveManager.changeYear(${currentYear - 1})" class="btn-icon">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span class="current-year">${currentYear}</span>
                            <button onclick="leaveManager.changeYear(${currentYear + 1})" class="btn-icon">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="annual-summary">
                        <div class="summary-card">
                            <span class="summary-value">${yearData.totalLeaves}</span>
                            <span class="summary-label">Total Approved Leaves</span>
                        </div>
                    </div>
                    
                    <div class="months-grid">
                        ${Object.entries(yearData.months).map(([month, monthData]) => `
                            <div class="month-card glass-effect">
                                <div class="month-header">
                                    <h4>${monthData.monthName}</h4>
                                    <span class="leave-count">${monthData.doctorsOnLeave.length} on leave</span>
                                </div>
                                
                                ${monthData.doctorsOnLeave.length > 0 ? `
                                    <div class="doctors-on-leave">
                                        ${monthData.summaryArray.map(doctor => `
                                            <div class="doctor-leave-item">
                                                <span class="doctor-name">${doctor.name}</span>
                                                <span class="leave-days">${doctor.days} days</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="month-total">
                                        <strong>Total Days:</strong> ${monthData.totalDays}
                                    </div>
                                ` : `
                                    <div class="no-leaves">
                                        <i class="fas fa-check-circle"></i>
                                        <span>No leaves scheduled</span>
                                    </div>
                                `}
                                
                                <button onclick="leaveManager.viewMonthDetails(${currentYear}, ${month})" 
                                        class="btn-link view-details">
                                    View Details <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering annual planning view:', error);
            return `<div class="error-state">Error loading annual plan</div>`;
        }
    }

    async changeYear(year) {
        try {
            const response = await fetch(`/api/leaves/yearly-plan/${year}`);
            const data = await response.json();
            
            if (data.success) {
                document.querySelector('.annual-planning-container').outerHTML = 
                    await this.renderAnnualPlanningView();
            }
        } catch (error) {
            console.error('Error changing year:', error);
        }
    }

    showHelpModal() {
        // Remove any existing modal
        const existingModal = document.querySelector('.leave-help-modal');
        if (existingModal) existingModal.remove();
        
        // Remove any existing backdrop
        const existingBackdrop = document.querySelector('.modal-backdrop');
        if (existingBackdrop) existingBackdrop.remove();
        
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
        
        const modal = document.createElement('div');
        modal.className = 'modal fade show leave-help-modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">How to Use Leave Management</h5>
                        <button type="button" class="btn-close" onclick="document.querySelector('.modal-backdrop')?.remove(); this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="help-content">
                            ${this.isAdmin ? `
                                <h6>Administrator Features:</h6>
                                <ul>
                                    <li><strong>Annual Planning Tab:</strong> View all doctors' leaves for the entire year</li>
                                    <li><strong>All Requests Tab:</strong> Approve or reject leave requests</li>
                                    <li><strong>Statistics Tab:</strong> View leave analytics and trends</li>
                                    <li><strong>Conflict Detection:</strong> System prevents more than 2 doctors on leave simultaneously</li>
                                </ul>
                                
                                <h6>Planning Workflow:</h6>
                                <ol>
                                    <li>Click "Annual Planning" to see yearly overview</li>
                                    <li>Each month shows who's on leave and for how many days</li>
                                    <li>Click "View Details" on any month for detailed breakdown</li>
                                    <li>Review pending requests in "All Requests" tab</li>
                                    <li>Check for conflicts before approving</li>
                                </ol>
                            ` : `
                                <h6>Your Leave Management:</h6>
                                <ul>
                                    <li><strong>Leave Balance:</strong> You have 45 days annual leave per year</li>
                                    <li><strong>Request Leave:</strong> Click the button to submit a new request</li>
                                    <li><strong>My Leaves Tab:</strong> View your pending and approved leaves</li>
                                    <li><strong>Calendar View:</strong> See your leaves on a monthly calendar</li>
                                </ul>
                            `}
                            
                            <h6>Leave Types:</h6>
                            <ul>
                                <li><span class="badge bg-success">Annual</span> - Planned vacation (counts against 45-day limit)</li>
                                <li><span class="badge bg-danger">Sick</span> - Medical leave (doesn't count against annual limit)</li>
                                <li><span class="badge bg-warning">Emergency</span> - Urgent situations</li>
                                <li><span class="badge bg-info">Personal</span> - Personal matters</li>
                            </ul>
                            
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-info-circle"></i> 
                                Maximum 2 doctors can be on leave simultaneously to ensure ER coverage.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async viewMonthDetails(year, month) {
        try {
            const response = await fetch(`/api/leaves/monthly-summary/${year}/${month}`);
            const data = await response.json();
            
            if (!data.success) {
                showNotification('Error loading month details', 'error');
                return;
            }
            
            const monthData = data.data;
            
            // Create modal for month details
            const modal = document.createElement('div');
            modal.className = 'modal modal-lg';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${monthData.monthName} ${year} - Leave Details</h3>
                        <button onclick="this.closest('.modal').remove()" class="close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="month-stats">
                            <div class="stat-item">
                                <span class="stat-value">${monthData.totalLeaves}</span>
                                <span class="stat-label">Total Leaves</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${monthData.daysWithLeaves}</span>
                                <span class="stat-label">Days with Leaves</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${monthData.summary.length}</span>
                                <span class="stat-label">Doctors on Leave</span>
                            </div>
                        </div>
                        
                        ${monthData.summary.length > 0 ? `
                            <div class="doctor-leave-details">
                                <h4>Leave Summary by Doctor</h4>
                                ${monthData.summary.map(doctorData => `
                                    <div class="doctor-detail-card">
                                        <div class="doctor-info">
                                            <h5>${doctorData.doctor.name}</h5>
                                            <span class="department">${doctorData.doctor.department}</span>
                                        </div>
                                        <div class="leave-info">
                                            <div class="leave-balance">
                                                Annual Leave Balance: <strong>${doctorData.balance} days</strong>
                                            </div>
                                            <div class="leave-list">
                                                ${doctorData.leaves.map(leave => `
                                                    <div class="leave-item">
                                                        <span class="leave-type ${leave.type}">${leave.type}</span>
                                                        <span class="leave-dates">
                                                            ${new Date(leave.startDate).toLocaleDateString()} - 
                                                            ${new Date(leave.endDate).toLocaleDateString()}
                                                        </span>
                                                        <span class="leave-duration">${leave.duration} days</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-calendar-check"></i>
                                <p>No leaves scheduled for this month</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error viewing month details:', error);
            showNotification('Error loading month details', 'error');
        }
    }
}

// Initialize leave manager when DOM is ready
let leaveManager;

// Make functions globally accessible
window.showLeaveManagement = showLeaveManagement;

// Global help function
window.showLeaveHelp = function() {
    console.log('showLeaveHelp called');
    
    // Remove any existing modal
    document.querySelectorAll('.leave-help-modal, .modal-backdrop').forEach(el => el.remove());
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.onclick = function() {
        backdrop.remove();
        document.querySelector('.leave-help-modal')?.remove();
    };
    document.body.appendChild(backdrop);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade show leave-help-modal';
    modal.style.display = 'block';
    
    const isAdmin = document.querySelector('[data-user-role]')?.dataset.userRole === 'admin';
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">How to Use Leave Management</h5>
                    <button type="button" class="btn-close" onclick="document.querySelectorAll('.leave-help-modal, .modal-backdrop').forEach(el => el.remove())"></button>
                </div>
                <div class="modal-body">
                    <div class="help-content">
                        ${isAdmin ? `
                            <h6>Administrator Features:</h6>
                            <ul>
                                <li><strong>Annual Planning Tab:</strong> View all doctors' leaves for the entire year</li>
                                <li><strong>All Requests Tab:</strong> Approve or reject leave requests</li>
                                <li><strong>Statistics Tab:</strong> View leave analytics and trends</li>
                                <li><strong>Conflict Detection:</strong> System prevents more than 2 doctors on leave simultaneously</li>
                            </ul>
                            
                            <h6>Planning Workflow:</h6>
                            <ol>
                                <li>Click "Annual Planning" to see yearly overview</li>
                                <li>Each month shows who's on leave and for how many days</li>
                                <li>Click "View Details" on any month for detailed breakdown</li>
                                <li>Review pending requests in "All Requests" tab</li>
                                <li>Check for conflicts before approving</li>
                            </ol>
                        ` : `
                            <h6>Your Leave Management:</h6>
                            <ul>
                                <li><strong>Leave Balance:</strong> You have 45 days annual leave per year</li>
                                <li><strong>Request Leave:</strong> Click the button to submit a new request</li>
                                <li><strong>My Leaves Tab:</strong> View your pending and approved leaves</li>
                                <li><strong>Calendar View:</strong> See your leaves on a monthly calendar</li>
                            </ul>
                        `}
                        
                        <h6>Leave Types:</h6>
                        <ul>
                            <li><span class="badge bg-success">Annual</span> - Planned vacation (counts against 45-day limit)</li>
                            <li><span class="badge bg-danger">Sick</span> - Medical leave (doesn't count against annual limit)</li>
                            <li><span class="badge bg-warning">Emergency</span> - Urgent situations</li>
                            <li><span class="badge bg-info">Personal</span> - Personal matters</li>
                        </ul>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle"></i> 
                            Maximum 2 doctors can be on leave simultaneously to ensure ER coverage.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

document.addEventListener('DOMContentLoaded', () => {
    // Leave manager will be initialized when the section is shown
});