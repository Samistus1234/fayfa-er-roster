// Modern Dashboard JavaScript with Animations
let currentAnalytics = null;
let currentRoster = null;
let doctors = [];
let charts = {};
let currentView = 'table';

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupAnimations();
    setupKeyboardShortcuts();
});

// Initialize Application
async function initializeApp() {
    // Load saved theme first
    loadTheme();
    
    // Show loading animation
    showGlobalLoader();
    
    // Load initial data
    await loadDoctors();
    setDefaultMonth();
    
    // Animate entrance
    animatePageEntrance();
    
    // Hide loader
    hideGlobalLoader();
    
    // Update stats
    updateQuickStats();
    
    // Load specialists available today
    loadSpecialistsToday();
    
    // Refresh specialists every 5 minutes
    setInterval(loadSpecialistsToday, 5 * 60 * 1000);
}

// Load Specialists Available Today
async function loadSpecialistsToday() {
    try {
        const response = await fetch('/api/roster/specialists/today');
        const data = await response.json();
        
        if (data.success && data.data) {
            updateSpecialistsDisplay(data.data);
        }
    } catch (error) {
        console.error('Error loading specialists:', error);
    }
}

// Update Specialists Display
function updateSpecialistsDisplay(specialistsData) {
    const countElement = document.getElementById('specialistsTodayCount');
    const previewElement = document.getElementById('specialistsPreview');
    
    if (countElement) {
        const totalCount = specialistsData.totalOnCall || 0;
        countElement.dataset.value = totalCount;
        animateStatCounter(countElement, totalCount);
    }
    
    if (previewElement) {
        const specialists = specialistsData.specialists || [];
        let previewHTML = '';
        
        if (specialists.length > 0) {
            previewHTML = `
                <div class="specialists-preview">
                    <div class="shift-indicator">On-Call Today (24hrs)</div>
                    <div class="specialists-list-mini">
                        ${specialists.slice(0, 3).map(spec => `
                            <span class="specialist-badge">
                                <i class="fas fa-user-md"></i>
                                ${spec.name.replace('Dr. ', '')}
                            </span>
                        `).join('')}
                        ${specialists.length > 3 ? `<span class="more-badge">+${specialists.length - 3}</span>` : ''}
                    </div>
                </div>
            `;
        } else {
            previewHTML = 'No specialists on call today';
        }
        
        previewElement.innerHTML = previewHTML;
    }
    
    // Store data globally for details view
    window.currentSpecialistsData = specialistsData;
}

// Show Specialists Details
function showSpecialistsDetails() {
    if (!window.currentSpecialistsData) return;
    
    const data = window.currentSpecialistsData;
    const departments = Object.keys(data.byDepartment || {}).sort();
    
    const modalContent = `
        <div class="specialists-details">
            <h4>Specialists On-Call Today</h4>
            <p class="text-muted mb-4">On-Call Period: ${data.onCallPeriod}</p>
            
            ${departments.length > 0 ? departments.map(dept => {
                const specialists = data.byDepartment[dept] || [];
                const deptIcons = {
                    'General Surgery': 'fa-procedures',
                    'Pediatrics': 'fa-baby',
                    'Internal Medicine': 'fa-stethoscope',
                    'Ophthalmology': 'fa-eye',
                    'ENT': 'fa-head-side-cough',
                    'Anesthesia': 'fa-lungs',
                    'Obstetrics & Gynaecology': 'fa-female',
                    'Nephrology': 'fa-kidneys'
                };
                
                return `
                    <div class="department-section">
                        <h5 class="department-title">
                            <i class="fas ${deptIcons[dept] || 'fa-stethoscope'}"></i>
                            ${dept}
                        </h5>
                        <div class="specialists-list">
                            ${specialists.map(spec => `
                                <div class="specialist-info">
                                    <h6>${spec.name}</h6>
                                    <div class="contact-info text-muted">${spec.phone}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('') : '<div class="text-center text-muted"><p>No specialists on call today</p></div>'}
            
            <div class="summary-footer">
                <strong>Total Specialists On-Call: ${data.totalOnCall}</strong><br>
                <small class="text-muted">24-hour coverage from 8 AM to 8 AM next day</small>
            </div>
        </div>
    `;
    
    showModal('Specialists On-Call Today', modalContent);
}

// Simple Modal Function
function showModal(title, content) {
    // Remove any existing modal
    const existingModal = document.getElementById('dynamicModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="dynamicModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('dynamicModal'));
    modal.show();
    
    // Clean up on hide
    document.getElementById('dynamicModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle - handle multiple toggle buttons if any
    const themeToggleButtons = document.querySelectorAll('.theme-toggle');
    themeToggleButtons.forEach(button => {
        button.addEventListener('click', toggleTheme);
    });
    
    // Global search with debounce
    const debouncedSearch = debounce(handleGlobalSearch, 300);
    document.getElementById('globalSearch').addEventListener('input', debouncedSearch);
    
    // Command palette trigger
    document.querySelector('.search-shortcut').addEventListener('click', openCommandPalette);
    
    // View toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const view = this.getAttribute('data-view');
            if (view) {
                window.setRosterView(view);
            }
        });
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('.modern-btn, .action-card').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
}

// GSAP Animations Setup
function setupAnimations() {
    // Navbar scroll effect - removed hiding on scroll for better UX
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const navbar = document.querySelector('.navbar-modern');
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Page Entrance Animation
function animatePageEntrance() {
    const timeline = gsap.timeline();
    
    timeline
        .from('.navbar-modern', {
            y: -100,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        })
        .from('.sidebar-modern', {
            x: -50,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.4')
        .from('.dashboard-section', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power3.out'
        }, '-=0.4')
        .from('.action-card', {
            scale: 0.8,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            onComplete: function() {
                document.querySelectorAll('.action-card').forEach(card => {
                    card.style.opacity = '1';
                    card.style.visibility = 'visible';
                    card.style.transform = 'scale(1)';
                });
            }
        }, '-=0.2');
}

// Set Light Mode
function setLightMode() {
    const body = document.body;
    console.log('Setting light mode');
    
    // Remove dark mode class
    body.classList.remove('dark-mode');
    
    // Update button states
    updateThemeButtons('light');
    
    // Save preference
    localStorage.setItem('theme', 'light');
    
    // Show toast
    showToast('Light mode activated', 'info');
}

// Set Dark Mode
function setDarkMode() {
    const body = document.body;
    console.log('Setting dark mode');
    
    // Add dark mode class
    body.classList.add('dark-mode');
    
    // Update button states
    updateThemeButtons('dark');
    
    // Save preference
    localStorage.setItem('theme', 'dark');
    
    // Show toast
    showToast('Dark mode activated', 'info');
}

// Update theme button states
function updateThemeButtons(theme) {
    const lightBtn = document.getElementById('lightModeBtn');
    const darkBtn = document.getElementById('darkModeBtn');

    if (theme === 'dark') {
        darkBtn?.classList.add('active');
        lightBtn?.classList.remove('active');
    } else {
        lightBtn?.classList.add('active');
        darkBtn?.classList.remove('active');
    }
}

// Load Roster Data
async function loadRosterData() {
    const monthYear = document.getElementById('monthYear').value;
    const [year, month] = monthYear.split('-');

    try {
        showGlobalLoader();

        // Load roster data
        const rosterResponse = await fetch(`/api/roster/${year}/${month}`);
        const rosterData = await rosterResponse.json();

        // Load doctors data
        const doctorsResponse = await fetch('/api/doctors');
        const doctorsData = await doctorsResponse.json();

        if (rosterData.success && doctorsData.success) {
            currentRoster = rosterData.data;
            doctors = doctorsData.data;

            // Update stats
            updateDashboardStats();

            // Render calendar
            renderCalendar(year, month);

            showToast('Roster loaded successfully', 'success');
        } else {
            showToast('Failed to load roster data', 'error');
        }
    } catch (error) {
        console.error('Error loading roster:', error);
        showToast('Error loading roster data', 'error');
    } finally {
        hideGlobalLoader();
    }
}

// Update Dashboard Stats
function updateDashboardStats() {
    if (!currentRoster || !doctors) return;

    const activeDoctors = doctors.filter(d => d.isAvailable).length;
    const totalShifts = currentRoster.length;
    const referralDuties = currentRoster.filter(r => r.isReferralDuty).length;
    const avgWorkload = Math.round(totalShifts / activeDoctors);

    // Update sidebar stats
    document.getElementById('activeDoctorsCount').textContent = activeDoctors;
    document.getElementById('totalShiftsCount').textContent = totalShifts;
    document.getElementById('avgWorkloadCount').textContent = avgWorkload;

    // Update main stats cards
    document.getElementById('totalShiftsDisplay').textContent = totalShifts;
    document.getElementById('activeDoctorsDisplay').textContent = activeDoctors;
    document.getElementById('referralDutiesDisplay').textContent = referralDuties;

    // Update roster info
    const monthYear = document.getElementById('monthYear').value;
    const [year, month] = monthYear.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();

    document.getElementById('monthDays').textContent = daysInMonth;
    document.getElementById('totalShiftsInfo').textContent = totalShifts;
    document.getElementById('activeDoctorsInfo').textContent = activeDoctors;
}

// Render Calendar
function renderCalendar(year, month) {
    const calendarContainer = document.getElementById('calendarContainer');
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    let calendarHTML = '';

    // Create calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dateString = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // Get shifts for this day
        const dayShifts = currentRoster.filter(r =>
            r.date.split('T')[0] === dateString
        );

        // Group shifts by type
        const morningShifts = dayShifts.filter(s => s.shift === 'morning');
        const eveningShifts = dayShifts.filter(s => s.shift === 'evening');
        const nightShifts = dayShifts.filter(s => s.shift === 'night');

        calendarHTML += `
            <div class="calendar-day ${isWeekend ? 'weekend' : ''}">
                <div class="day-header">
                    <div>
                        <div class="day-number">${day}</div>
                        <div class="day-name">${dayName}</div>
                    </div>
                    ${isWeekend ? '<div class="weekend-indicator">Weekend</div>' : ''}
                </div>

                <div class="shifts-container">
                    ${morningShifts.length > 0 ? `
                        <div class="shift-section">
                            <div class="shift-header">
                                <i class="fas fa-sun"></i>
                                <span>Morning</span>
                                <div class="shift-count">${morningShifts.length}</div>
                            </div>
                            <div class="doctors-list">
                                ${morningShifts.map(shift => renderDoctorAvatar(shift, 'morning')).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${eveningShifts.length > 0 ? `
                        <div class="shift-section">
                            <div class="shift-header">
                                <i class="fas fa-cloud-sun"></i>
                                <span>Evening</span>
                                <div class="shift-count">${eveningShifts.length}</div>
                            </div>
                            <div class="doctors-list">
                                ${eveningShifts.map(shift => renderDoctorAvatar(shift, 'evening')).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${nightShifts.length > 0 ? `
                        <div class="shift-section">
                            <div class="shift-header">
                                <i class="fas fa-moon"></i>
                                <span>Evening</span>
                                <div class="shift-count">${nightShifts.length}</div>
                            </div>
                            <div class="doctors-list">
                                ${nightShifts.map(shift => renderDoctorAvatar(shift, 'night')).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    calendarContainer.innerHTML = calendarHTML;
}

// Render Doctor Avatar
function renderDoctorAvatar(shift, shiftType) {
    const doctor = doctors.find(d => d.name === shift.doctorName);
    const initials = shift.doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('');
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f5a0', '#ffc947', '#ff6b6b', '#9d4edd'];
    const colorIndex = shift.doctorId % colors.length;

    return `
        <div class="doctor-avatar ${shiftType}" title="${shift.doctorName}">
            <div class="avatar-circle" style="background: ${colors[colorIndex]};">
                ${initials}
            </div>
            <div class="doctor-name">${shift.doctorName.replace('Dr. ', '')}</div>
            ${shift.isReferralDuty ? '<div class="referral-badge">R</div>' : ''}
        </div>
    `;
}
