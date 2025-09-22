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
                <div class="shift-indicator">
                    <i class="fas fa-phone-alt"></i> On-Call Today (24hrs)
                </div>
                <div class="specialists-list-mini">
                    ${specialists.slice(0, 3).map(spec => `
                        <span class="specialist-badge" title="${spec.department}">
                            ${spec.name.replace('Dr. ', '')}
                        </span>
                    `).join('')}
                    ${specialists.length > 3 ? `<span class="more-badge">+${specialists.length - 3}</span>` : ''}
                </div>
            `;
        } else {
            previewHTML = '<span class="text-muted">No specialists on call today</span>';
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
            <h4 class="mb-4">
                <i class="fas fa-user-md me-2"></i>Specialists On-Call Today
            </h4>
            <p class="text-muted mb-4">
                <i class="fas fa-clock"></i> On-Call Period: ${data.onCallPeriod}
            </p>
            
            <div class="departments-grid">
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
                                <i class="fas ${deptIcons[dept] || 'fa-user-md'}"></i>
                                ${dept}
                            </h5>
                            <div class="specialists-list">
                                ${specialists.map(spec => `
                                    <div class="specialist-card glass-effect">
                                        <div class="specialist-info">
                                            <h6>${spec.name}</h6>
                                            <div class="contact-info">
                                                <small class="text-muted">
                                                    <i class="fas fa-phone"></i> ${spec.phone}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('') : '<p class="text-center text-muted">No specialists on call today</p>'}
            </div>
            
            <div class="summary-footer mt-4">
                <strong>Total Specialists On-Call:</strong> ${data.totalOnCall}
                <br>
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
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content glass-effect">
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

// Theme Toggle (kept for backward compatibility)
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        setLightMode();
    } else {
        setDarkMode();
    }
    
    // Animate icon change with smooth rotation
    if (themeIcon) {
        gsap.to(themeIcon, {
            rotationY: 180,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                gsap.set(themeIcon, { rotationY: 0 });
            }
        });
    }
    
    // Add a subtle scale animation to the toggle button
    gsap.to('.theme-toggle', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
    });
    
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Show toast with theme-appropriate styling
    showToast(`${isDark ? 'Dark' : 'Light'} mode activated`, 'info');
    
    // Remove transition after animation
    setTimeout(() => {
        body.style.transition = '';
    }, 300);
    
    console.log(`Theme switched to: ${isDark ? 'dark' : 'light'} mode`);
    console.log('Background color applied:', body.style.backgroundColor);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    
    console.log('Loading theme:', savedTheme);
    
    // Remove any inline styles that might override CSS
    body.style.backgroundColor = '';
    body.style.color = '';
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateThemeButtons('dark');
        console.log('Dark theme loaded from localStorage');
        console.log('Body classes:', body.className);
    } else {
        // Ensure light theme is set by default
        body.classList.remove('dark-mode');
        updateThemeButtons('light');
        console.log('Light theme loaded (default)');
        console.log('Body classes:', body.className);
    }
}

// Modern Loading States
function showGlobalLoader() {
    const loader = document.createElement('div');
    loader.className = 'global-loader';
    loader.innerHTML = `
        <div class="loader-modern">
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideGlobalLoader() {
    const loader = document.querySelector('.global-loader');
    if (loader) {
        gsap.to(loader, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => loader.remove()
        });
    }
}

// Create Ripple Effect
function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.className = 'ripple';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Set Default Month
function setDefaultMonth() {
    // Set to June 2025 as that's where the data is
    const year = 2025;
    const month = '06';
    document.getElementById('monthYear').value = `${year}-${month}`;
    // Update the current month display
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonth').textContent = `${monthNames[5]} ${year}`;
    loadRosterData();
}

// Load Doctors
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors');
        const result = await response.json();
        if (result.success) {
            doctors = result.data;
            populateDoctorSelect();
            animateStatCounter('totalDoctors', doctors.length);
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        showToast('Error loading doctors', 'danger');
    }
}

// Populate Doctor Select with Animation
function populateDoctorSelect(doctorsList = null) {
    const select = document.getElementById('rosterDoctor');
    if (!select) return;
    
    const doctorsToShow = doctorsList || doctors;
    select.innerHTML = '<option value="">Select a doctor...</option>';
    
    doctorsToShow.forEach((doctor, index) => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        if (doctor.specialization) {
            option.textContent += ` (${doctor.specialization})`;
        }
        select.appendChild(option);
    });
}

// Load Roster Data with Animation
async function loadRosterData() {
    const monthYear = document.getElementById('monthYear').value;
    if (!monthYear) return;

    const [year, month] = monthYear.split('-');
    // Get the button properly - it might be called from different places
    const loadBtn = document.querySelector('.modern-btn.primary-btn[onclick*="loadRosterData"]');
    
    if (loadBtn && loadBtn.classList) {
        loadBtn.classList.add('loading');
    }
    
    // Show skeleton loaders
    showSkeletonLoaders();
    
    try {
        await Promise.all([
            loadAnalytics(year, month),
            loadRoster(year, month)
        ]);
        
        document.getElementById('currentMonth').textContent = 
            new Date(year, month - 1).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
        // Update quick stats
        updateQuickStats();
        
    } catch (error) {
        console.error('Error loading roster data:', error);
        showToast('Error loading roster data', 'danger');
    } finally {
        if (loadBtn) {
            loadBtn.classList.remove('loading');
        }
        hideSkeletonLoaders();
    }
}

// Show Skeleton Loaders
function showSkeletonLoaders() {
    // Analytics skeleton
    document.getElementById('analyticsContent').innerHTML = `
        <div class="skeleton-grid">
            ${[1,2,3,4].map(() => `
                <div class="skeleton-card glass-effect">
                    <div class="skeleton-icon"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Roster skeleton
    document.getElementById('rosterContent').innerHTML = `
        <div class="skeleton-table glass-effect">
            ${[1,2,3,4,5].map(() => `
                <div class="skeleton-row">
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                </div>
            `).join('')}
        </div>
    `;
}

function hideSkeletonLoaders() {
    // Handled by render functions
}

// Load Analytics with Charts
async function loadAnalytics(year, month) {
    try {
        const response = await fetch(`/api/roster/analytics/${year}/${month}`);
        const result = await response.json();
        if (result.success) {
            currentAnalytics = result.data;
            renderModernAnalytics();
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Render Modern Analytics with Charts
function renderModernAnalytics() {
    const container = document.getElementById('analyticsContent');
    
    if (!currentAnalytics || Object.keys(currentAnalytics).length === 0) {
        container.innerHTML = `
            <div class="empty-state glass-effect">
                <div class="empty-icon">
                    <i class="fas fa-chart-pie"></i>
                </div>
                <h3>No analytics data available</h3>
                <p>Select a month with roster data to view analytics</p>
            </div>
        `;
        return;
    }

    // Create analytics cards with animations
    container.innerHTML = `
        <div class="stat-card glass-effect animate-in">
            <div class="stat-header">
                <div class="stat-icon primary-gradient">
                    <i class="fas fa-users"></i>
                </div>
                <h3>Total Shifts</h3>
            </div>
            <div class="stat-body">
                <div class="stat-number" data-value="${currentAnalytics.totalShifts || 0}">0</div>
                <canvas id="shiftsChart" width="200" height="100"></canvas>
            </div>
        </div>
        
        <div class="stat-card glass-effect animate-in">
            <div class="stat-header">
                <div class="stat-icon success-gradient">
                    <i class="fas fa-user-md"></i>
                </div>
                <h3>Active Doctors</h3>
            </div>
            <div class="stat-body">
                <div class="stat-number" data-value="${currentAnalytics.activeDoctors || 0}">0</div>
                <canvas id="doctorsChart" width="200" height="100"></canvas>
            </div>
        </div>
        
        <div class="stat-card glass-effect animate-in">
            <div class="stat-header">
                <div class="stat-icon warning-gradient">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <h3>Referral Duties</h3>
            </div>
            <div class="stat-body">
                <div class="stat-number" data-value="${currentAnalytics.referralDuties || 0}">0</div>
                <div class="stat-percentage">${currentAnalytics.referralPercentage || 0}%</div>
            </div>
        </div>
        
        <div class="stat-card glass-effect animate-in" id="specialistsToday" onclick="showSpecialistsDetails()" style="cursor: pointer;">
            <div class="stat-header">
                <div class="stat-icon info-gradient">
                    <i class="fas fa-user-md"></i>
                </div>
                <h3>Specialists Available Today</h3>
            </div>
            <div class="stat-body">
                <div class="stat-number" id="specialistsTodayCount" data-value="0">0</div>
                <div class="specialists-preview" id="specialistsPreview">
                    <span class="loading-text">Loading...</span>
                </div>
            </div>
        </div>
    `;
    
    // Animate numbers
    document.querySelectorAll('.stat-number').forEach(el => {
        animateStatCounter(el, parseInt(el.dataset.value));
    });
    
    // Animate cards entrance
    gsap.from('.stat-card', {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out'
    });
    
    // Create mini charts
    setTimeout(() => {
        createMiniCharts();
    }, 500);
    
    // Load specialists data after rendering analytics
    loadSpecialistsToday();
}

// Animate Stat Counter
function animateStatCounter(element, endValue) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (!element) return;
    
    const duration = 1500;
    const start = 0;
    const increment = endValue / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= endValue) {
            current = endValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Create Mini Charts
function createMiniCharts() {
    // Shifts distribution chart
    const shiftsCtx = document.getElementById('shiftsChart');
    if (shiftsCtx && currentAnalytics.shiftDistribution) {
        charts.shifts = new Chart(shiftsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Morning', 'Evening', 'Night'],
                datasets: [{
                    data: [
                        currentAnalytics.shiftDistribution.morning || 0,
                        currentAnalytics.shiftDistribution.evening || 0,
                        currentAnalytics.shiftDistribution.night || 0
                    ],
                    backgroundColor: [
                        'rgba(255, 193, 71, 0.8)',
                        'rgba(79, 172, 254, 0.8)',
                        'rgba(157, 78, 221, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Doctors workload chart
    const doctorsCtx = document.getElementById('doctorsChart');
    if (doctorsCtx && currentAnalytics.doctorStats) {
        const topDoctors = Object.entries(currentAnalytics.doctorStats)
            .sort((a, b) => b[1].totalDuties - a[1].totalDuties)
            .slice(0, 5);
            
        charts.doctors = new Chart(doctorsCtx, {
            type: 'bar',
            data: {
                labels: topDoctors.map(([name]) => name.split(' ')[0]),
                datasets: [{
                    data: topDoctors.map(([, stats]) => stats.totalDuties),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        display: false
                    },
                    x: {
                        display: false
                    }
                }
            }
        });
    }
}

// Load Roster
async function loadRoster(year, month) {
    try {
        console.log(`Loading roster for ${year}/${month}`);
        const response = await fetch(`/api/roster/${year}/${month}`);
        const result = await response.json();
        console.log('Roster API response:', result);
        if (result.success) {
            currentRoster = result.data;
            console.log('Loaded roster entries:', currentRoster.length);
            renderModernRoster();
        }
    } catch (error) {
        console.error('Error loading roster:', error);
    }
}

// Render Modern Roster
function renderModernRoster() {
    const container = document.getElementById('rosterContent');
    
    if (!container) {
        console.error('Roster content container not found');
        return;
    }
    
    if (!currentRoster || currentRoster.length === 0) {
        container.innerHTML = `
            <div class="empty-state glass-effect">
                <div class="empty-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <h3>No roster entries found</h3>
                <p>Add roster entries for this month to see them here</p>
                <button class="modern-btn primary-btn" onclick="showAddRosterModal()">
                    <i class="fas fa-plus me-2"></i>Add First Entry
                </button>
            </div>
        `;
        return;
    }

    // Store current scroll position
    const scrollPos = window.scrollY;
    
    // Render immediately without clearing
    if (currentView === 'table') {
        renderRosterTable(currentRoster, container);
    } else if (currentView === 'calendar') {
        renderCalendarView(container);
    } else if (currentView === 'timeline') {
        renderTimelineView(container);
    }
    
    // Restore scroll position
    window.scrollTo(0, scrollPos);
    
    // Update stats
    animateStatCounter('totalShifts', currentRoster.length);
}

// Render Roster Table - Modern Card Layout
function renderRosterTable(roster, container) {
    const groupedByDate = groupRosterByDate(roster);
    const dates = Object.keys(groupedByDate).sort();
    
    let html = `
        <div class="roster-cards-container">
            <div class="roster-summary glass-effect mb-4">
                <div class="summary-stats">
                    <div class="summary-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${dates.length} Days</span>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-clipboard-list"></i>
                        <span>${roster.length} Total Shifts</span>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-user-md"></i>
                        <span>${[...new Set(roster.map(r => r.doctorId))].length} Active Doctors</span>
                    </div>
                </div>
            </div>
            
            <div class="roster-grid">
    `;
    
    dates.forEach((date, dateIndex) => {
        const entries = groupedByDate[date];
        const dateObj = new Date(date);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const isToday = new Date().toDateString() === dateObj.toDateString();
        
        // Group by shift type for this date
        const shiftGroups = {
            morning: entries.filter(e => e.shift === 'morning'),
            evening: entries.filter(e => e.shift === 'evening'),
            night: entries.filter(e => e.shift === 'night')
        };
        
        html += `
            <div class="day-card glass-effect ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}" 
                 style="animation-delay: ${dateIndex * 0.05}s">
                <div class="day-header">
                    <div class="date-info">
                        <div class="date-number">${dateObj.getDate()}</div>
                        <div class="date-details">
                            <div class="date-weekday">${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div class="date-month">${dateObj.toLocaleDateString('en-US', { month: 'short' })}</div>
                        </div>
                    </div>
                    ${isToday ? '<span class="today-badge">Today</span>' : ''}
                    ${isWeekend ? '<span class="weekend-badge">Weekend</span>' : ''}
                </div>
                
                <div class="shifts-container">
        `;
        
        // Render each shift type
        ['morning', 'evening', 'night'].forEach(shiftType => {
            const shiftEntries = shiftGroups[shiftType];
            if (shiftEntries.length > 0) {
                html += `
                    <div class="shift-group">
                        <div class="shift-header">
                            <i class="fas fa-${getShiftIcon(shiftType)}"></i>
                            <span class="shift-label">${shiftType}</span>
                            <span class="shift-count">${shiftEntries.length}</span>
                        </div>
                        <div class="shift-doctors">
                `;
                
                shiftEntries.forEach(entry => {
                    const doctorInitials = entry.doctorName ? 
                        entry.doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('') : 'D';
                    
                    html += `
                        <div class="doctor-chip ${entry.isReferralDuty ? 'referral' : ''}" 
                             title="${entry.doctorName}${entry.isReferralDuty ? ' (Referral Duty)' : ''}">
                            <div class="doctor-avatar-mini ${getRandomGradient()}">
                                ${doctorInitials}
                            </div>
                            <span class="doctor-name-mini">${entry.doctorName ? entry.doctorName.replace('Dr. ', '') : 'Unknown'}</span>
                            ${entry.isReferralDuty ? '<i class="fas fa-exchange-alt referral-icon"></i>' : ''}
                            <button class="delete-mini" onclick="deleteRosterEntry(${entry._id || entry.id})" title="Delete">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        });
        
        // Show empty state if no shifts
        if (entries.length === 0) {
            html += `
                <div class="no-shifts">
                    <i class="fas fa-calendar-times"></i>
                    <span>No shifts scheduled</span>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add entrance animations with safeguard
    const dayCards = document.querySelectorAll('.day-card');
    if (dayCards.length > 0 && typeof gsap !== 'undefined') {
        // Ensure cards are visible first
        dayCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        });
        
        // Then animate
        gsap.fromTo('.day-card', 
            {
                scale: 0.9,
                opacity: 0
            },
            {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                stagger: 0.03,
                ease: 'power2.out',
                clearProps: 'all' // Clear inline styles after animation
            }
        );
    }
}

// Get random gradient for avatars
function getRandomGradient() {
    const gradients = [
        'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 
        'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

// Get Shift Icon
function getShiftIcon(shift) {
    const icons = {
        morning: 'sun',
        evening: 'cloud-sun',
        night: 'moon'
    };
    return icons[shift] || 'clock';
}

// Group Roster by Date
function groupRosterByDate(roster) {
    return roster.reduce((groups, entry) => {
        const date = entry.date.split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(entry);
        return groups;
    }, {});
}

// Set Roster View - Make globally accessible
window.setRosterView = function(view) {
    console.log('[setRosterView] Called with view:', view);
    
    if (!view) {
        console.error('[setRosterView] No view provided');
        return false;
    }
    
    currentView = view;
    console.log('[setRosterView] Current view set to:', currentView);
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        }
    });
    
    // Re-render roster
    if (currentRoster && currentRoster.length > 0) {
        console.log('[setRosterView] Rendering roster with', currentRoster.length, 'entries');
        try {
            renderModernRoster();
        } catch (error) {
            console.error('[setRosterView] Error rendering roster:', error);
        }
    } else {
        console.warn('[setRosterView] No roster data available');
    }
    
    showToast(`Switched to ${view} view`, 'info');
    return false; // Prevent any default behavior
}

// Update Quick Stats
function updateQuickStats() {
    if (currentAnalytics) {
        animateStatCounter('totalDoctors', doctors.length);
        animateStatCounter('totalShifts', currentAnalytics.totalShifts || 0);
        animateStatCounter('avgWorkload', Math.round(currentAnalytics.averageWorkload || 0));
    }
}

// Show Modern Modals
function showAddDoctorModal() {
    const modal = new bootstrap.Modal(document.getElementById('addDoctorModal'));
    modal.show();
    
    // Animate modal entrance
    gsap.from('.modal-content', {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.out'
    });
}

function showAddRosterModal() {
    populateDoctorSelect();
    const modal = new bootstrap.Modal(document.getElementById('addRosterModal'));
    modal.show();
    
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('rosterDate').value = today;
    
    // Animate modal entrance
    gsap.from('.modal-content', {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.out'
    });
}

// Add Doctor with Animation
async function addDoctor() {
    const form = document.getElementById('addDoctorForm');
    if (!form.reportValidity()) return;
    
    const button = event.target;
    button.classList.add('loading');
    
    const doctorData = {
        name: document.getElementById('doctorName').value,
        email: document.getElementById('doctorEmail').value,
        phone: document.getElementById('doctorPhone').value,
        specialization: document.getElementById('doctorSpecialization').value
    };
    
    try {
        const response = await fetch('/api/doctors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctorData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Doctor added successfully!', 'success');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addDoctorModal')).hide();
            await loadDoctors();
        } else {
            showToast(result.message || 'Error adding doctor', 'danger');
        }
    } catch (error) {
        console.error('Error adding doctor:', error);
        showToast('Error adding doctor', 'danger');
    } finally {
        button.classList.remove('loading');
    }
}

// Add Roster Entry with Animation
async function addRosterEntry() {
    const form = document.getElementById('addRosterForm');
    if (!form.reportValidity()) return;
    
    const button = event.target;
    button.classList.add('loading');
    
    const selectedDoctor = doctors.find(d => d.id === parseInt(document.getElementById('rosterDoctor').value));
    if (!selectedDoctor) {
        showToast('Please select a doctor', 'warning');
        button.classList.remove('loading');
        return;
    }
    
    const entryData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        shift: document.getElementById('rosterShift').value,
        date: document.getElementById('rosterDate').value,
        isReferralDuty: document.getElementById('isReferralDuty').checked
    };
    
    try {
        const response = await fetch('/api/roster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entryData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Roster entry added successfully!', 'success');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addRosterModal')).hide();
            await loadRosterData();
        } else {
            showToast(result.message || 'Error adding roster entry', 'danger');
        }
    } catch (error) {
        console.error('Error adding roster entry:', error);
        showToast('Error adding roster entry', 'danger');
    } finally {
        button.classList.remove('loading');
    }
}

// Delete Roster Entry with Confirmation
async function deleteRosterEntry(id) {
    if (!confirm('Are you sure you want to delete this roster entry?')) return;
    
    try {
        const response = await fetch(`/api/roster/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Roster entry deleted successfully!', 'success');
            
            // Animate row removal
            const row = event.target.closest('tr');
            gsap.to(row, {
                opacity: 0,
                x: -50,
                duration: 0.3,
                onComplete: () => {
                    loadRosterData();
                }
            });
        } else {
            showToast(result.message || 'Error deleting roster entry', 'danger');
        }
    } catch (error) {
        console.error('Error deleting roster entry:', error);
        showToast('Error deleting roster entry', 'danger');
    }
}

// Modern Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast glass-effect ${type}`;
    
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${icons[type]} me-2"></i>
        <span>${message}</span>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    // Animate entrance
    gsap.from(toast, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.out'
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        gsap.to(toast, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            onComplete: () => toast.remove()
        });
    }, 3000);
}

// Command Palette
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K for command palette
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
        
        // ESC to close command palette
        if (e.key === 'Escape') {
            closeCommandPalette();
        }
    });
}

function openCommandPalette() {
    const palette = document.getElementById('commandPalette');
    palette.classList.add('active');
    document.getElementById('commandInput').focus();
    
    // Load commands
    loadCommands();
}

function closeCommandPalette() {
    const palette = document.getElementById('commandPalette');
    palette.classList.remove('active');
    document.getElementById('commandInput').value = '';
}

function loadCommands() {
    const commands = [
        { icon: 'user-plus', label: 'Add Doctor', action: showAddDoctorModal },
        { icon: 'calendar-plus', label: 'Add Roster Entry', action: showAddRosterModal },
        { icon: 'chart-line', label: 'Show Workload Analysis', action: showWorkloadAnalysis },
        { icon: 'balance-scale', label: 'Show Fairness Metrics', action: showFairnessMetrics },
        { icon: 'moon', label: 'Toggle Dark Mode', action: toggleTheme },
        { icon: 'download', label: 'Export Data', action: showExportMenu }
    ];
    
    const container = document.getElementById('commandResults');
    container.innerHTML = commands.map(cmd => `
        <div class="command-item" onclick="${cmd.action.name}(); closeCommandPalette();">
            <i class="fas fa-${cmd.icon}"></i>
            <span>${cmd.label}</span>
        </div>
    `).join('');
}

// Handle Global Search
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    console.log('Searching for:', query, 'Current roster length:', currentRoster ? currentRoster.length : 0);
    
    if (!query) {
        // If search is empty, show all data
        if (currentRoster && currentRoster.length > 0) {
            renderModernRoster();
        }
        // Remove any search highlights
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });
        return;
    }
    
    // Check if data is loaded
    if (!currentRoster || currentRoster.length === 0) {
        showToast('Please wait for roster data to load or click "Load Roster"', 'warning');
        return;
    }
    
    // Search in roster data
    const filteredRoster = currentRoster.filter(entry => {
        return (
            (entry.doctorName && entry.doctorName.toLowerCase().includes(query)) ||
            (entry.shift && entry.shift.toLowerCase().includes(query)) ||
            (entry.date && entry.date.includes(query)) ||
            (entry.isReferralDuty && 'referral'.includes(query))
        );
    });
    
    console.log('Filtered results:', filteredRoster.length);
    
    // Render filtered results
    if (filteredRoster.length > 0) {
        renderRosterTable(filteredRoster, document.getElementById('rosterContent'));
        highlightSearchTerms(query);
        showToast(`Found ${filteredRoster.length} result${filteredRoster.length > 1 ? 's' : ''} for "${query}"`, 'info');
    } else {
        document.getElementById('rosterContent').innerHTML = `
            <div class="empty-state glass-effect">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No results found for "${query}"</h3>
                <p>Try searching for doctor names, shifts, or dates</p>
                <button class="modern-btn secondary-btn" onclick="document.getElementById('globalSearch').value=''; handleGlobalSearch({target: {value: ''}})">
                    <i class="fas fa-times me-2"></i>Clear Search
                </button>
            </div>
        `;
    }
    
    // Search in doctors list for dropdowns
    if (doctors.length > 0) {
        const filteredDoctors = doctors.filter(doctor => 
            doctor.name.toLowerCase().includes(query) ||
            (doctor.specialization && doctor.specialization.toLowerCase().includes(query))
        );
        
        // Update any open doctor dropdowns
        const doctorSelect = document.getElementById('rosterDoctor');
        if (doctorSelect && doctorSelect.offsetParent !== null) {
            populateDoctorSelect(filteredDoctors);
        }
    }
}

// Highlight search terms in results
function highlightSearchTerms(query) {
    setTimeout(() => {
        const elements = document.querySelectorAll('.roster-table td');
        elements.forEach(el => {
            const text = el.textContent;
            if (text.toLowerCase().includes(query)) {
                el.classList.add('search-highlight');
            }
        });
    }, 100);
}

// Workload Analysis
async function showWorkloadAnalysis() {
    const section = document.getElementById('workloadSection');
    section.style.display = 'block';
    
    gsap.from(section, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
    });
    
    const monthYear = document.getElementById('monthYear').value;
    if (!monthYear) {
        showToast('Please select a month first', 'warning');
        return;
    }
    
    const [year, month] = monthYear.split('-');
    
    try {
        const response = await fetch(`/api/workload/${year}/${month}`);
        const result = await response.json();
        
        if (result.success) {
            renderWorkloadAnalysis(result.data);
        }
    } catch (error) {
        console.error('Error loading workload analysis:', error);
        showToast('Error loading workload analysis', 'danger');
    }
}

function hideWorkloadAnalysis() {
    const section = document.getElementById('workloadSection');
    gsap.to(section, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            section.style.display = 'none';
        }
    });
}

// Fairness Metrics
async function showFairnessMetrics() {
    const section = document.getElementById('fairnessSection');
    section.style.display = 'block';
    
    gsap.from(section, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
    });
    
    const monthYear = document.getElementById('monthYear').value;
    if (!monthYear) {
        showToast('Please select a month first', 'warning');
        return;
    }
    
    const [year, month] = monthYear.split('-');
    
    try {
        const response = await fetch(`/api/fairness/${year}/${month}`);
        const result = await response.json();
        
        if (result.success) {
            renderFairnessMetrics(result.data);
        }
    } catch (error) {
        console.error('Error loading fairness metrics:', error);
        showToast('Error loading fairness metrics', 'danger');
    }
}

function hideFairnessMetrics() {
    const section = document.getElementById('fairnessSection');
    gsap.to(section, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            section.style.display = 'none';
        }
    });
}

// Show Export Menu
function showExportMenu() {
    // Create a modern export modal
    const modal = document.createElement('div');
    modal.className = 'export-modal-overlay';
    modal.innerHTML = `
        <div class="export-modal glass-effect">
            <div class="export-modal-header">
                <h3><i class="fas fa-download me-2"></i>Export Data</h3>
                <button class="close-btn" onclick="closeExportModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="export-modal-body">
                <div class="export-options">
                    <div class="export-option" onclick="exportRoster('csv'); closeExportModal();">
                        <div class="export-icon csv">
                            <i class="fas fa-file-csv"></i>
                        </div>
                        <div class="export-info">
                            <h4>Roster Data (CSV)</h4>
                            <p>Export monthly roster schedule</p>
                        </div>
                    </div>
                    <div class="export-option" onclick="exportRoster('pdf'); closeExportModal();">
                        <div class="export-icon pdf">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="export-info">
                            <h4>Roster Data (PDF)</h4>
                            <p>Export monthly roster schedule</p>
                        </div>
                    </div>
                    <div class="export-option" onclick="exportAnalytics('csv'); closeExportModal();">
                        <div class="export-icon csv">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="export-info">
                            <h4>Analytics (CSV)</h4>
                            <p>Export duty analytics and statistics</p>
                        </div>
                    </div>
                    <div class="export-option" onclick="exportAnalytics('pdf'); closeExportModal();">
                        <div class="export-icon pdf">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="export-info">
                            <h4>Analytics (PDF)</h4>
                            <p>Export duty analytics and statistics</p>
                        </div>
                    </div>
                    <div class="export-option" onclick="exportWorkload('csv'); closeExportModal();">
                        <div class="export-icon csv">
                            <i class="fas fa-weight"></i>
                        </div>
                        <div class="export-info">
                            <h4>Workload Analysis (CSV)</h4>
                            <p>Export workload distribution data</p>
                        </div>
                    </div>
                    <div class="export-option" onclick="exportWorkload('pdf'); closeExportModal();">
                        <div class="export-icon pdf">
                            <i class="fas fa-weight"></i>
                        </div>
                        <div class="export-info">
                            <h4>Workload Analysis (PDF)</h4>
                            <p>Export workload distribution report</p>
                        </div>
                    </div>
                    <div class="export-option" onclick="exportFairness('csv'); closeExportModal();">
                        <div class="export-icon csv">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <div class="export-info">
                            <h4>Fairness Metrics (CSV)</h4>
                            <p>Export equity and fairness data</p>
                        </div>
                    </div>
                    <div class="export-option" onclick="exportFairness('pdf'); closeExportModal();">
                        <div class="export-icon pdf">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <div class="export-info">
                            <h4>Fairness Metrics (PDF)</h4>
                            <p>Export equity and fairness report</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate entrance
    gsap.from('.export-modal', {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.out'
    });
}

function closeExportModal() {
    const modal = document.querySelector('.export-modal-overlay');
    if (modal) {
        gsap.to('.export-modal', {
            scale: 0.9,
            opacity: 0,
            duration: 0.2,
            onComplete: () => modal.remove()
        });
    }
}

// Consultation Log
function showConsultationLog() {
    const section = document.getElementById('consultationSection');
    section.style.display = 'block';
    
    gsap.from(section, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
    });
    
    initializeConsultationForm();
}

function hideConsultationLog() {
    const section = document.getElementById('consultationSection');
    gsap.to(section, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            section.style.display = 'none';
        }
    });
}

// Referral Statistics Functions
async function showReferralStats() {
    const section = document.getElementById('referralSection');
    section.style.display = 'block';
    
    gsap.from(section, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
    });
    
    await initializeReferralStats();
}

function hideReferralStats() {
    const section = document.getElementById('referralSection');
    gsap.to(section, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            section.style.display = 'none';
        }
    });
}

// Show referral entry form
function showReferralEntry() {
    const referralEntrySection = document.getElementById('referralEntrySection');
    referralEntrySection.style.display = 'block';
    
    const content = document.getElementById('referralEntryContent');
    content.innerHTML = `
        <div class="referral-entry-form">
            <form id="referralEntryForm" class="glass-effect p-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="referralDoctor" class="form-label">Doctor</label>
                        <select class="form-select" id="referralDoctor" required>
                            <option value="">Select Doctor</option>
                            ${doctors.map(doc => `
                                <option value="${doc.id}">${doc.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="referralDate" class="form-label">Date</label>
                        <input type="date" class="form-control" id="referralDate" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                
                <div class="row g-3 mt-2">
                    <div class="col-md-6">
                        <label for="referralType" class="form-label">Type</label>
                        <select class="form-select" id="referralType" required>
                            <option value="">Select Type</option>
                            <option value="emergency">Emergency</option>
                            <option value="life-saving">Life-Saving</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="patientName" class="form-label">Patient Name</label>
                        <input type="text" class="form-control" id="patientName" placeholder="Enter patient name" required>
                    </div>
                </div>
                
                <div class="mt-3">
                    <label for="referralDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="referralDescription" rows="3" placeholder="Describe the reason for referral"></textarea>
                </div>
                
                <div class="mt-4 d-flex gap-2">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Save Referral
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="clearReferralForm()">
                        <i class="fas fa-redo me-2"></i>Clear
                    </button>
                </div>
            </form>
            
            <div class="mt-4">
                <h5 class="mb-3">Recent Referrals</h5>
                <div id="recentReferrals" class="table-responsive">
                    <!-- Recent referrals will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Load recent referrals
    loadRecentReferrals();
    
    // Setup form submission
    document.getElementById('referralEntryForm').addEventListener('submit', handleReferralSubmit);
    
    // Animate section appearance
    gsap.fromTo(referralEntrySection, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
}

// Hide referral entry form
function hideReferralEntry() {
    const section = document.getElementById('referralEntrySection');
    gsap.to(section, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            section.style.display = 'none';
        }
    });
}

// Handle referral form submission
async function handleReferralSubmit(e) {
    e.preventDefault();
    
    const formData = {
        doctorId: parseInt(document.getElementById('referralDoctor').value),
        type: document.getElementById('referralType').value,
        patientName: document.getElementById('patientName').value,
        description: document.getElementById('referralDescription').value,
        date: document.getElementById('referralDate').value
    };
    
    try {
        const response = await fetch('/api/referrals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Referral logged successfully', 'success');
            clearReferralForm();
            loadRecentReferrals();
            // Update referral statistics if visible
            if (document.getElementById('referralSection').style.display !== 'none') {
                showReferralStats();
            }
        } else {
            showToast(result.message || 'Error logging referral', 'danger');
        }
    } catch (error) {
        console.error('Error submitting referral:', error);
        showToast('Error logging referral', 'danger');
    }
}

// Clear referral form
function clearReferralForm() {
    document.getElementById('referralEntryForm').reset();
    document.getElementById('referralDate').value = new Date().toISOString().split('T')[0];
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Load recent referrals
async function loadRecentReferrals() {
    try {
        // Get current month/year from the month selector or use default
        const monthYear = document.getElementById('monthYear')?.value || '2025-06';
        const [year, month] = monthYear.split('-');
        
        const response = await fetch(`/api/referrals/month/${year}/${month}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            // Sort by date descending and take last 5
            const recentReferrals = result.data
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);
            
            const tableHtml = `
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Doctor</th>
                            <th>Patient</th>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentReferrals.map(ref => `
                            <tr>
                                <td>${formatDate(ref.date)}</td>
                                <td>${ref.doctorName}</td>
                                <td>${ref.patientName}</td>
                                <td><span class="badge ${ref.type === 'emergency' ? 'bg-warning' : 'bg-danger'}">${ref.type}</span></td>
                                <td>${ref.description || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            document.getElementById('recentReferrals').innerHTML = tableHtml;
        } else {
            document.getElementById('recentReferrals').innerHTML = 
                '<p class="text-muted">No referrals recorded for this month</p>';
        }
    } catch (error) {
        console.error('Error loading recent referrals:', error);
        document.getElementById('recentReferrals').innerHTML = 
            '<p class="text-danger">Error loading recent referrals</p>';
    }
}

async function initializeReferralStats() {
    const content = document.getElementById('referralContent');
    
    // Calculate referral statistics from roster data
    const referralStats = await calculateReferralStatistics();
    
    content.innerHTML = `
        <div class="referral-stats-container">
            <!-- Summary Cards -->
            <div class="referral-summary-grid">
                <div class="stat-card glass-effect">
                    <div class="stat-icon emergency-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-details">
                        <h4>${referralStats.emergency}</h4>
                        <p>Emergency Referrals</p>
                    </div>
                </div>
                <div class="stat-card glass-effect">
                    <div class="stat-icon life-saving-icon">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                    <div class="stat-details">
                        <h4>${referralStats.lifeSaving}</h4>
                        <p>Life-Saving Referrals</p>
                    </div>
                </div>
                <div class="stat-card glass-effect">
                    <div class="stat-icon total-icon">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <div class="stat-details">
                        <h4>${referralStats.total}</h4>
                        <p>Total Referrals</p>
                    </div>
                </div>
            </div>
            
            <!-- Doctor-wise Breakdown -->
            <div class="doctor-referral-stats glass-effect mt-4">
                <h4 class="section-subtitle mb-3">
                    <i class="fas fa-user-md me-2"></i>Doctor-wise Referral Breakdown
                </h4>
                <div class="table-responsive">
                    <table class="table referral-table">
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Total Referrals</th>
                                <th>Emergency</th>
                                <th>Life-Saving</th>
                                <th>Emergency %</th>
                                <th>Life-Saving %</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${referralStats.doctorBreakdown.map(doc => `
                                <tr>
                                    <td>${doc.name}</td>
                                    <td>${doc.total}</td>
                                    <td>${doc.emergency}</td>
                                    <td>${doc.lifeSaving}</td>
                                    <td><span class="badge bg-warning">${doc.emergencyPercentage}%</span></td>
                                    <td><span class="badge bg-danger">${doc.lifeSavingPercentage}%</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="referral-charts-grid mt-4">
                <div class="chart-container glass-effect">
                    <h5>Referral Type Distribution</h5>
                    <canvas id="referralTypeChart"></canvas>
                </div>
                <div class="chart-container glass-effect">
                    <h5>Monthly Trend</h5>
                    <canvas id="referralTrendChart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Create charts
    setTimeout(() => createReferralCharts(referralStats), 100);
}

// Calculate referral statistics
async function calculateReferralStatistics() {
    try {
        // Get current month/year from the month selector or use default
        const monthYear = document.getElementById('monthYear')?.value || '2025-06';
        const [year, month] = monthYear.split('-');
        
        const response = await fetch(`/api/referrals/stats/${year}/${month}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            // Return default stats if API fails
            return {
                total: 0,
                emergency: 0,
                lifeSaving: 0,
                doctorBreakdown: []
            };
        }
    } catch (error) {
        console.error('Error fetching referral statistics:', error);
        // Return default stats if API fails
        return {
            total: 0,
            emergency: 0,
            lifeSaving: 0,
            doctorBreakdown: []
        };
    }
}

// Create referral charts
function createReferralCharts(stats) {
    // Pie chart for referral types
    const typeCtx = document.getElementById('referralTypeChart');
    if (typeCtx) {
        new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Emergency', 'Life-Saving'],
                datasets: [{
                    data: [stats.emergency, stats.lifeSaving],
                    backgroundColor: ['#ffc107', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            padding: 10
                        }
                    }
                }
            }
        });
    }
    
    // Line chart for trend (sample data)
    const trendCtx = document.getElementById('referralTrendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Urgent',
                    data: [5, 7, 8, 8],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Life-Saving',
                    data: [3, 4, 5, 5],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
    }
}

// Saudi Crescent Functions
function showSaudiCrescent() {
    const section = document.getElementById('saudiCrescentSection');
    section.style.display = 'block';
    
    gsap.from(section, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
    });
    
    initializeSaudiCrescent();
}

function hideSaudiCrescent() {
    const section = document.getElementById('saudiCrescentSection');
    gsap.to(section, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            section.style.display = 'none';
        }
    });
}

// License Management Functions
async function showLicenseManager() {
    const section = document.getElementById('licenseSection');
    section.style.display = 'block';
    
    gsap.from(section, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
    });
    
    await initializeLicenseManager();
}

function hideLicenseManager() {
    const section = document.getElementById('licenseSection');
    gsap.to(section, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            section.style.display = 'none';
        }
    });
}

async function initializeLicenseManager() {
    const content = document.getElementById('licenseContent');
    
    // Load license status
    const statusResponse = await fetch('/api/licenses/status');
    const statusResult = await statusResponse.json();
    const status = statusResult.success ? statusResult.data : null;
    
    content.innerHTML = `
        <div class="license-manager-container">
            <!-- License Status Overview -->
            <div class="license-status-overview mb-4">
                <h4 class="mb-3"><i class="fas fa-chart-pie me-2"></i>License Status Overview</h4>
                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="stat-card glass-effect">
                            <div class="stat-icon primary-gradient">
                                <i class="fas fa-certificate"></i>
                            </div>
                            <div class="stat-details">
                                <h4>${status ? status.total : 0}</h4>
                                <p>Total Licenses</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card glass-effect">
                            <div class="stat-icon success-gradient">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-details">
                                <h4>${status ? status.active : 0}</h4>
                                <p>Active</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card glass-effect">
                            <div class="stat-icon warning-gradient">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="stat-details">
                                <h4>${status ? status.expiringSoon : 0}</h4>
                                <p>Expiring Soon</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card glass-effect">
                            <div class="stat-icon danger-gradient">
                                <i class="fas fa-times-circle"></i>
                            </div>
                            <div class="stat-details">
                                <h4>${status ? status.expired : 0}</h4>
                                <p>Expired</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add License Button -->
            <div class="mb-4">
                <button class="btn btn-primary" onclick="showAddLicenseModal()">
                    <i class="fas fa-plus me-2"></i>Add New License
                </button>
                <button class="btn btn-warning ms-2" onclick="checkLicenseExpiry()">
                    <i class="fas fa-bell me-2"></i>Check Expiry Alerts
                </button>
            </div>
            
            <!-- License Alerts -->
            ${status && status.doctorSummary.length > 0 ? `
                <div class="license-alerts mb-4">
                    <h4 class="mb-3"><i class="fas fa-bell me-2"></i>License Alerts</h4>
                    <div class="alerts-container">
                        ${status.doctorSummary.map(doc => `
                            <div class="alert ${doc.expiredLicenses.length > 0 ? 'alert-danger' : 'alert-warning'} alert-dismissible fade show" role="alert">
                                <strong>Dr. ${doc.doctorName}</strong>
                                ${doc.expiredLicenses.length > 0 ? `
                                    <span class="badge bg-danger ms-2">${doc.expiredLicenses.length} Expired</span>
                                ` : ''}
                                ${doc.expiringLicenses.length > 0 ? `
                                    <span class="badge bg-warning ms-2">${doc.expiringLicenses.length} Expiring Soon</span>
                                ` : ''}
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- License List -->
            <div class="license-list">
                <h4 class="mb-3"><i class="fas fa-list me-2"></i>All Licenses</h4>
                <div class="table-responsive">
                    <table class="table table-hover" id="licenseTable">
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Type</th>
                                <th>License Number</th>
                                <th>Issue Date</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Days Until Expiry</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Licenses will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Load all licenses
    await loadAllLicenses();
}

async function loadAllLicenses() {
    try {
        const response = await fetch('/api/licenses');
        const result = await response.json();
        
        if (result.success) {
            const tbody = document.querySelector('#licenseTable tbody');
            const License = { getDaysUntilExpiry: (date) => {
                const now = new Date();
                const expiry = new Date(date);
                const diff = expiry - now;
                return Math.ceil(diff / (1000 * 60 * 60 * 24));
            }};
            
            tbody.innerHTML = result.data.map(license => {
                const doctor = doctors.find(d => d.id === license.doctorId);
                const daysUntilExpiry = License.getDaysUntilExpiry(license.expiryDate);
                const statusClass = license.status === 'expired' ? 'danger' : 
                                  license.status === 'expiring_soon' ? 'warning' : 'success';
                const statusText = license.status === 'expired' ? 'Expired' : 
                                 license.status === 'expiring_soon' ? 'Expiring Soon' : 'Active';
                
                return `
                    <tr>
                        <td>${doctor ? doctor.name : 'Unknown'}</td>
                        <td><span class="badge bg-primary">${license.type}</span></td>
                        <td>${license.licenseNumber}</td>
                        <td>${formatDate(license.issueDate)}</td>
                        <td>${formatDate(license.expiryDate)}</td>
                        <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                        <td>
                            ${daysUntilExpiry > 0 ? 
                                `<span class="text-${statusClass}">${daysUntilExpiry} days</span>` : 
                                `<span class="text-danger">${Math.abs(daysUntilExpiry)} days ago</span>`
                            }
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editLicense(${license.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteLicense(${license.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading licenses:', error);
        showToast('Error loading licenses', 'danger');
    }
}

function showAddLicenseModal() {
    const modalHtml = `
        <div class="modal fade" id="addLicenseModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New License/Certificate</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addLicenseForm">
                            <div class="mb-3">
                                <label for="licenseDoctor" class="form-label">Doctor</label>
                                <select class="form-select" id="licenseDoctor" required>
                                    <option value="">Select Doctor</option>
                                    ${doctors.map(doc => `
                                        <option value="${doc.id}">${doc.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="licenseType" class="form-label">License Type</label>
                                <select class="form-select" id="licenseType" required>
                                    <option value="">Select Type</option>
                                    <option value="SCFHS">SCFHS License</option>
                                    <option value="BLS">BLS Certificate</option>
                                    <option value="ACLS">ACLS Certificate</option>
                                    <option value="PALS">PALS Certificate</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="licenseNumber" class="form-label">License/Certificate Number</label>
                                <input type="text" class="form-control" id="licenseNumber" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="issueDate" class="form-label">Issue Date</label>
                                        <input type="date" class="form-control" id="issueDate" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="expiryDate" class="form-label">Expiry Date</label>
                                        <input type="date" class="form-control" id="expiryDate" required>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveLicense()">Save License</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addLicenseModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addLicenseModal'));
    modal.show();
}

async function saveLicense() {
    const form = document.getElementById('addLicenseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const licenseData = {
        doctorId: parseInt(document.getElementById('licenseDoctor').value),
        type: document.getElementById('licenseType').value,
        licenseNumber: document.getElementById('licenseNumber').value,
        issueDate: document.getElementById('issueDate').value,
        expiryDate: document.getElementById('expiryDate').value
    };
    
    try {
        const response = await fetch('/api/licenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(licenseData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('License added successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addLicenseModal')).hide();
            await loadAllLicenses();
            await initializeLicenseManager(); // Refresh the whole view
        } else {
            showToast(result.message || 'Error adding license', 'danger');
        }
    } catch (error) {
        console.error('Error saving license:', error);
        showToast('Error saving license', 'danger');
    }
}

async function deleteLicense(licenseId) {
    if (!confirm('Are you sure you want to delete this license?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/licenses/${licenseId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('License deleted successfully', 'success');
            await loadAllLicenses();
            await initializeLicenseManager(); // Refresh the whole view
        } else {
            showToast(result.message || 'Error deleting license', 'danger');
        }
    } catch (error) {
        console.error('Error deleting license:', error);
        showToast('Error deleting license', 'danger');
    }
}

async function checkLicenseExpiry() {
    try {
        const response = await fetch('/api/licenses/check-expiry');
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            if (data.notifications.length === 0) {
                showToast('No license expiry alerts at this time', 'info');
                return;
            }
            
            // Show a modal with all notifications
            const modalHtml = `
                <div class="modal fade" id="expiryAlertsModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-warning text-dark">
                                <h5 class="modal-title">
                                    <i class="fas fa-bell me-2"></i>License Expiry Alerts
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-info">
                                    <strong>Summary:</strong> ${data.expiredCount} expired, ${data.expiringCount} expiring soon
                                </div>
                                
                                <div class="notifications-list">
                                    ${data.notifications.map(notif => `
                                        <div class="alert alert-${notif.priority === 'critical' ? 'danger' : notif.priority === 'high' ? 'warning' : 'info'} mb-3">
                                            <h6 class="alert-heading">
                                                <i class="fas fa-user-md me-2"></i>${notif.doctor.name}
                                            </h6>
                                            <p class="mb-1">
                                                <strong>${notif.license.type}</strong> - License #${notif.license.licenseNumber}
                                            </p>
                                            <p class="mb-0">${notif.message}</p>
                                            <small class="text-muted">
                                                Expires: ${formatDate(notif.license.expiryDate)}
                                            </small>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <div class="alert alert-warning mt-3">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Email notifications have been sent to the affected doctors.
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing modal if any
            const existingModal = document.getElementById('expiryAlertsModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('expiryAlertsModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error checking license expiry:', error);
        showToast('Error checking license expiry', 'danger');
    }
}

function initializeSaudiCrescent() {
    const content = document.getElementById('saudiCrescentContent');
    content.innerHTML = `
        <!-- Action Buttons -->
        <div class="saudi-actions mb-3">
            <button class="btn btn-success btn-sm" onclick="addSaudiCrescentRow()">
                <i class="fas fa-plus me-2"></i>Add Entry
            </button>
            <button class="btn btn-primary btn-sm" onclick="saveSaudiCrescentLog()">
                <i class="fas fa-save me-2"></i>Save
            </button>
            <button class="btn btn-secondary btn-sm" onclick="clearSaudiCrescentForm()">
                <i class="fas fa-eraser me-2"></i>Clear Form
            </button>
            <div class="btn-group ms-2" role="group">
                <button type="button" class="btn btn-sm btn-info" onclick="exportSaudiCrescent('csv')" title="Export to CSV">
                    <i class="fas fa-file-csv me-1"></i>CSV
                </button>
                <button type="button" class="btn btn-sm btn-info" onclick="exportSaudiCrescent('pdf')" title="Export to PDF">
                    <i class="fas fa-file-pdf me-1"></i>PDF
                </button>
            </div>
        </div>
        
        <!-- Saudi Crescent Table -->
        <div class="table-responsive">
            <table class="table saudi-crescent-table" id="saudiCrescentTable">
                <thead class="table-success sticky-header">
                    <tr>
                        <th>Date</th>
                        <th>Time Received</th>
                        <th>Case Type</th>
                        <th>Patient Details</th>
                        <th>Receiving Doctor</th>
                        <th>Handover Time</th>
                        <th>Duration (min)</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="saudiCrescentTableBody">
                    <!-- Rows will be generated by JavaScript -->
                </tbody>
            </table>
        </div>
        
        <!-- Statistics Summary -->
        <div class="saudi-statistics glass-effect mt-4">
            <h5>Handover Statistics</h5>
            <div class="stat-row">
                <span>Average Handover Time: <strong id="avgHandoverTime">0 min</strong></span>
                <span class="ms-4">Total Cases Today: <strong id="totalCasesToday">0</strong></span>
            </div>
        </div>
    `;
    
    // Load saved data if available
    loadSavedSaudiCrescentData();
}

// Load saved Saudi Crescent data from localStorage
function loadSavedSaudiCrescentData() {
    try {
        const savedData = localStorage.getItem('saudiCrescentLog');
        if (savedData) {
            const saudiCrescentData = JSON.parse(savedData);
            const tbody = document.getElementById('saudiCrescentTableBody');
            
            if (saudiCrescentData.length > 0) {
                tbody.innerHTML = ''; // Clear default row
                
                saudiCrescentData.forEach(data => {
                    const rowId = Date.now() + Math.random();
                    const row = document.createElement('tr');
                    row.id = `saudi-row-${rowId}`;
                    
                    // Get ER doctor options
                    const erDoctorOptions = doctors.map(d => 
                        `<option value="${d.name}" ${d.name === data.receivingDoctor ? 'selected' : ''}>${d.name}</option>`
                    ).join('');
                    
                    row.innerHTML = `
                        <td><input type="date" class="form-control form-control-sm" value="${data.date || ''}" required></td>
                        <td><input type="time" class="form-control form-control-sm time-received" value="${data.timeReceived || ''}" onchange="calculateHandoverDuration(${rowId})" required></td>
                        <td>
                            <select class="form-control form-control-sm" required>
                                <option value="">Select Case Type</option>
                                <option value="RTA" ${data.caseType === 'RTA' ? 'selected' : ''}>RTA (Road Traffic Accident)</option>
                                <option value="Cardiac" ${data.caseType === 'Cardiac' ? 'selected' : ''}>Cardiac Emergency</option>
                                <option value="Stroke" ${data.caseType === 'Stroke' ? 'selected' : ''}>Stroke</option>
                                <option value="Trauma" ${data.caseType === 'Trauma' ? 'selected' : ''}>Trauma</option>
                                <option value="Medical" ${data.caseType === 'Medical' ? 'selected' : ''}>Medical Emergency</option>
                                <option value="Pediatric" ${data.caseType === 'Pediatric' ? 'selected' : ''}>Pediatric Emergency</option>
                                <option value="OB/GYN" ${data.caseType === 'OB/GYN' ? 'selected' : ''}>OB/GYN Emergency</option>
                                <option value="Other" ${data.caseType === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </td>
                        <td><input type="text" class="form-control form-control-sm" value="${data.patientDetails || ''}" placeholder="Age/Gender/Brief"></td>
                        <td>
                            <select class="form-control form-control-sm" required>
                                <option value="">Select Doctor</option>
                                ${erDoctorOptions}
                            </select>
                        </td>
                        <td><input type="time" class="form-control form-control-sm handover-time" value="${data.handoverTime || ''}" onchange="calculateHandoverDuration(${rowId})"></td>
                        <td><input type="text" class="form-control form-control-sm duration-field" value="${data.duration || ''}" readonly></td>
                        <td><input type="text" class="form-control form-control-sm" value="${data.notes || ''}" placeholder="Notes"></td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="removeSaudiCrescentRow('${rowId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    
                    tbody.appendChild(row);
                });
                
                // Update statistics
                updateSaudiCrescentStats();
                
                // Update last saved time  
                const timestamp = localStorage.getItem('saudiCrescentLogTimestamp');
                if (timestamp) {
                    showToast('Previous Saudi Crescent data loaded', 'info');
                }
            } else {
                // No data, add default row
                addSaudiCrescentRow();
            }
        } else {
            // No saved data, add default row
            addSaudiCrescentRow();
        }
    } catch (error) {
        console.error('Error loading saved Saudi Crescent data:', error);
        // On error, add default row
        addSaudiCrescentRow();
    }
}

// Add Saudi Crescent Row
function addSaudiCrescentRow() {
    const tbody = document.getElementById('saudiCrescentTableBody');
    const rowId = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    // Get ER doctors for dropdown
    const erDoctorOptions = doctors.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    
    const row = document.createElement('tr');
    row.id = `saudi-row-${rowId}`;
    row.innerHTML = `
        <td><input type="date" class="form-control form-control-sm" value="${today}" required></td>
        <td><input type="time" class="form-control form-control-sm time-received" value="${currentTime}" onchange="calculateHandoverDuration(${rowId})" required></td>
        <td>
            <select class="form-control form-control-sm" required>
                <option value="">Select Case Type</option>
                <option value="RTA">RTA (Road Traffic Accident)</option>
                <option value="Cardiac">Cardiac Emergency</option>
                <option value="Stroke">Stroke</option>
                <option value="Trauma">Trauma</option>
                <option value="Medical">Medical Emergency</option>
                <option value="Pediatric">Pediatric Emergency</option>
                <option value="OB/GYN">OB/GYN Emergency</option>
                <option value="Other">Other</option>
            </select>
        </td>
        <td><input type="text" class="form-control form-control-sm" placeholder="Age/Gender/Brief"></td>
        <td>
            <select class="form-control form-control-sm" required>
                <option value="">Select Doctor</option>
                ${erDoctorOptions}
            </select>
        </td>
        <td><input type="time" class="form-control form-control-sm handover-time" onchange="calculateHandoverDuration(${rowId})"></td>
        <td><input type="text" class="form-control form-control-sm duration-field" readonly></td>
        <td><input type="text" class="form-control form-control-sm" placeholder="Notes"></td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="removeSaudiCrescentRow('${rowId}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// Calculate handover duration
function calculateHandoverDuration(rowId) {
    const row = document.getElementById(`saudi-row-${rowId}`);
    const timeReceived = row.querySelector('.time-received').value;
    const handoverTime = row.querySelector('.handover-time').value;
    const durationField = row.querySelector('.duration-field');
    
    if (timeReceived && handoverTime) {
        const [receivedHours, receivedMinutes] = timeReceived.split(':').map(Number);
        const [handoverHours, handoverMinutes] = handoverTime.split(':').map(Number);
        
        let receivedTotalMinutes = receivedHours * 60 + receivedMinutes;
        let handoverTotalMinutes = handoverHours * 60 + handoverMinutes;
        
        // Handle case where handover is next day
        if (handoverTotalMinutes < receivedTotalMinutes) {
            handoverTotalMinutes += 24 * 60;
        }
        
        const diffMinutes = handoverTotalMinutes - receivedTotalMinutes;
        durationField.value = diffMinutes + ' min';
        
        // Update statistics
        updateSaudiCrescentStats();
    } else {
        durationField.value = '';
    }
}

// Update Saudi Crescent statistics
function updateSaudiCrescentStats() {
    const rows = document.querySelectorAll('#saudiCrescentTableBody tr');
    let totalDuration = 0;
    let count = 0;
    let todayCount = 0;
    const today = new Date().toISOString().split('T')[0];
    
    rows.forEach(row => {
        const dateInput = row.querySelector('input[type="date"]');
        const durationField = row.querySelector('.duration-field');
        
        if (dateInput && dateInput.value === today) {
            todayCount++;
        }
        
        if (durationField && durationField.value) {
            const minutes = parseInt(durationField.value);
            if (!isNaN(minutes)) {
                totalDuration += minutes;
                count++;
            }
        }
    });
    
    const avgDuration = count > 0 ? Math.round(totalDuration / count) : 0;
    document.getElementById('avgHandoverTime').textContent = avgDuration + ' min';
    document.getElementById('totalCasesToday').textContent = todayCount;
}

// Remove Saudi Crescent Row
function removeSaudiCrescentRow(rowId) {
    const row = document.getElementById(`saudi-row-${rowId}`);
    if (row) {
        row.remove();
        updateSaudiCrescentStats();
    }
}

// Save Saudi Crescent Log
function saveSaudiCrescentLog() {
    try {
        const table = document.getElementById('saudiCrescentTable');
        if (!table) {
            showToast('Error: Saudi Crescent table not found', 'danger');
            return;
        }
        
        const rows = table.querySelectorAll('tbody tr');
        const saudiCrescentData = [];
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('input, select');
            const rowData = {
                date: cells[0].value,
                timeReceived: cells[1].value,
                caseType: cells[2].value,
                patientDetails: cells[3].value,
                receivingDoctor: cells[4].value,
                handoverTime: cells[5].value,
                duration: cells[6].value,
                notes: cells[7].value
            };
            
            // Only save rows with some data
            if (rowData.date || rowData.caseType || rowData.timeReceived) {
                saudiCrescentData.push(rowData);
            }
        });
        
        if (saudiCrescentData.length === 0) {
            showToast('No data to save', 'warning');
            return;
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('saudiCrescentLog', JSON.stringify(saudiCrescentData));
        localStorage.setItem('saudiCrescentLogTimestamp', new Date().toISOString());
        
        showToast('Saudi Red Crescent log saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving Saudi Crescent log:', error);
        showToast('Error saving Saudi Crescent log', 'danger');
    }
}

// Clear Saudi Crescent Form
function clearSaudiCrescentForm() {
    try {
        if (confirm('Are you sure you want to clear the form? All unsaved data will be lost.')) {
            const tbody = document.getElementById('saudiCrescentTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                addSaudiCrescentRow();
                updateSaudiCrescentStats();
                showToast('Form cleared successfully', 'info');
            } else {
                showToast('Error: Table body not found', 'danger');
            }
        }
    } catch (error) {
        console.error('Error clearing form:', error);
        showToast('Error clearing form', 'danger');
    }
}

// Export Saudi Crescent
function exportSaudiCrescent(format) {
    // Collect Saudi Crescent data from the table
    const saudiCrescentData = [];
    const rows = document.querySelectorAll('#saudiCrescentTableBody tr');
    
    if (rows.length === 0) {
        showToast('No Saudi Red Crescent data to export', 'warning');
        return;
    }
    
    rows.forEach(row => {
        try {
            const cells = row.querySelectorAll('input, select');
            if (cells.length < 8) return; // Skip if row doesn't have all fields
            
            const date = cells[0]?.value || '';
            const timeReceived = cells[1]?.value || '';
            const caseType = cells[2]?.value || '';
            const patientDetails = cells[3]?.value || '';
            const receivingDoctor = cells[4]?.value || '';
            const handoverTime = cells[5]?.value || '';
            const duration = cells[6]?.value || '';
            const notes = cells[7]?.value || '';
            
            // Only include rows with data
            if (date || timeReceived || caseType) {
                saudiCrescentData.push({
                    date,
                    timeReceived,
                    caseType,
                    patientDetails,
                    receivingDoctor,
                    handoverTime,
                    duration,
                    notes
                });
            }
        } catch (error) {
            console.error('Error processing row:', error);
        }
    });
    
    if (saudiCrescentData.length === 0) {
        showToast('No Saudi Red Crescent data to export', 'warning');
        return;
    }
    
    if (format === 'csv') {
        exportSaudiCrescentCSV(saudiCrescentData);
    } else if (format === 'pdf') {
        exportSaudiCrescentPDF(saudiCrescentData);
    }
}

// Export Saudi Crescent to CSV
function exportSaudiCrescentCSV(data) {
    const csvData = data.map(entry => ({
        'Date': entry.date,
        'Time Received': entry.timeReceived,
        'Case Type': entry.caseType,
        'Patient Details': entry.patientDetails,
        'Receiving Doctor': entry.receivingDoctor,
        'Handover Time': entry.handoverTime,
        'Duration': entry.duration,
        'Notes': entry.notes
    }));
    
    const csvContent = arrayToCSV(csvData);
    const today = new Date().toISOString().split('T')[0];
    const filename = `saudi_red_crescent_${today.replace(/-/g, '_')}.csv`;
    exportToCSV(csvContent, filename);
    showToast('Saudi Red Crescent data exported to CSV successfully', 'success');
}

// Export Saudi Crescent to PDF
function exportSaudiCrescentPDF(data) {
    const pdf = createPDF('Saudi Red Crescent Ambulance Log', `Form ID: SRC-001 | Version: 1.0`);
    
    // Get statistics
    const avgHandoverTime = document.getElementById('avgHandoverTime').textContent;
    const totalCasesToday = document.getElementById('totalCasesToday').textContent;
    
    // Meta information
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Summary Statistics:', 20, 65);
    
    pdf.setFont(undefined, 'normal');
    pdf.text(`Average Handover Time: ${avgHandoverTime}`, 30, 75);
    pdf.text(`Total Cases Today: ${totalCasesToday}`, 30, 85);
    
    // Saudi Crescent table
    const tableData = data.map(entry => [
        entry.date,
        entry.timeReceived,
        entry.caseType,
        entry.patientDetails,
        entry.receivingDoctor,
        entry.handoverTime,
        entry.duration,
        entry.notes
    ]);
    
    pdf.autoTable({
        head: [['Date', 'Time Received', 'Case Type', 'Patient Details', 'Receiving Doctor', 'Handover Time', 'Duration', 'Notes']],
        body: tableData,
        startY: 100,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        styles: { fontSize: 8 },
        columnStyles: {
            2: { cellWidth: 25 }, // Case Type
            3: { cellWidth: 30 }, // Patient Details
            7: { cellWidth: 25 }  // Notes
        }
    });
    
    const today = new Date().toISOString().split('T')[0];
    pdf.save(`saudi_red_crescent_${today.replace(/-/g, '_')}.pdf`);
    showToast('Saudi Red Crescent data exported to PDF successfully', 'success');
}

// Initialize theme on load
loadTheme();

// Make theme functions globally accessible
window.setLightMode = setLightMode;
window.setDarkMode = setDarkMode;
window.toggleTheme = toggleTheme;

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar-modern');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar) return;
    
    // Toggle sidebar
    sidebar.classList.toggle('active');
    
    // Create/toggle overlay
    if (sidebar.classList.contains('active')) {
        if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.id = 'sidebarOverlay';
            newOverlay.className = 'sidebar-overlay';
            newOverlay.onclick = toggleSidebar;
            document.body.appendChild(newOverlay);
            setTimeout(() => newOverlay.classList.add('active'), 10);
        }
    } else {
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }
}

// Make sidebar toggle globally accessible
window.toggleSidebar = toggleSidebar;

// Global test function for debugging (accessible from browser console)
window.testDarkMode = function() {
    console.log('=== DARK MODE TEST ===');
    const body = document.body;
    body.classList.add('dark-mode');
    body.style.backgroundColor = '#0f0f23';
    body.style.color = '#ffffff';
    console.log('Dark mode applied. Body classes:', body.className);
    console.log('Background color:', window.getComputedStyle(body).backgroundColor);
};

window.testLightMode = function() {
    console.log('=== LIGHT MODE TEST ===');
    const body = document.body;
    body.classList.remove('dark-mode');
    body.style.backgroundColor = '#f0f4f8';
    body.style.color = '#1a202c';
    console.log('Light mode applied. Body classes:', body.className);
    console.log('Background color:', window.getComputedStyle(body).backgroundColor);
};

// Make toggleTheme globally accessible for debugging
window.toggleTheme = toggleTheme;

// Add styles for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .skeleton-card {
        padding: 2rem;
        border-radius: 24px;
    }
    
    .skeleton-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 16px;
        margin-bottom: 1rem;
    }
    
    .skeleton-text {
        height: 20px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }
    
    .skeleton-text.short {
        width: 60%;
    }
    
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    .animate-in {
        animation: fadeInUp 0.5s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .doctor-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .doctor-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 0.875rem;
    }
    
    .stat-card {
        padding: 1.5rem;
        border-radius: 24px;
    }
    
    .stat-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.25rem;
    }
    
    .stat-body {
        position: relative;
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
    }
    
    .stat-percentage {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
    }
    
    .progress-ring {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
    }
    
    .navbar-modern.scrolled {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .global-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    
    .command-item {
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: var(--transition-fast);
        border-radius: 12px;
    }
    
    .command-item:hover {
        background: rgba(0, 0, 0, 0.05);
    }
    
    .command-item i {
        width: 24px;
        color: var(--text-muted);
    }
`;
document.head.appendChild(style);

// Add missing implementations

// Render Workload Analysis
function renderWorkloadAnalysis(data) {
    const container = document.getElementById('workloadContent');
    
    if (!data || !data.doctorAnalysis) {
        container.innerHTML = `
            <div class="empty-state glass-effect">
                <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                <p class="text-muted">No workload data available</p>
            </div>
        `;
        return;
    }
    
    // Transform the data to the expected format
    const analysis = Object.values(data.doctorAnalysis).map(doctorData => ({
        name: doctorData.doctor.name,
        totalShifts: doctorData.workload.total_duties,
        weekendShifts: doctorData.weekend.total_weekend_duties,
        workloadScore: (doctorData.workload.work_percentage / data.departmentStats.averages.percentage) * 100,
        shiftBreakdown: {
            morning: doctorData.shifts.morning,
            evening: doctorData.shifts.evening,
            night: doctorData.shifts.night
        }
    }));
    
    data.analysis = analysis;
    
    let html = `
        <div class="workload-analysis-container">
            <!-- Export Buttons -->
            <div class="analysis-header mb-3">
                <h4 class="section-subtitle">
                    <i class="fas fa-chart-bar me-2"></i>Workload Analysis
                </h4>
                <div class="export-buttons">
                    <button class="modern-btn btn-sm secondary-btn" onclick="exportWorkload('csv')" title="Export to CSV">
                        <i class="fas fa-file-csv me-1"></i>CSV
                    </button>
                    <button class="modern-btn btn-sm secondary-btn" onclick="exportWorkload('pdf')" title="Export to PDF">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </button>
                </div>
            </div>
            
            <!-- Chart Section -->
            <div class="chart-section glass-effect mb-4">
                <h4 class="section-subtitle mb-3">
                    <i class="fas fa-chart-bar me-2"></i>Monthly Workload Distribution
                </h4>
                <div class="chart-wrapper">
                    <canvas id="workloadChart"></canvas>
                </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="workload-stats-grid">
    `;
    
    // Create stat cards for each doctor
    data.analysis.forEach(doctor => {
        const score = doctor.workloadScore || 0;
        const scoreClass = score > 120 ? 'high' : score > 100 ? 'medium' : 'low';
        const badgeColor = score > 120 ? 'danger' : score > 100 ? 'warning' : 'success';
        
        html += `
            <div class="workload-card glass-effect">
                <div class="workload-card-header">
                    <div class="doctor-info">
                        <div class="doctor-avatar ${getRandomGradient()}">
                            ${doctor.name.replace('Dr. ', '').charAt(0)}
                        </div>
                        <h5 class="doctor-name">${doctor.name}</h5>
                    </div>
                    <div class="workload-badge ${badgeColor}">
                        ${score.toFixed(0)}%
                    </div>
                </div>
                
                <div class="workload-stats">
                    <div class="stat-row">
                        <span class="stat-label">Total Shifts</span>
                        <span class="stat-value">${doctor.totalShifts}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Weekend Shifts</span>
                        <span class="stat-value">${doctor.weekendShifts}</span>
                    </div>
                </div>
                
                <div class="shift-breakdown">
                    <div class="shift-item morning">
                        <i class="fas fa-sun"></i>
                        <span>${doctor.shiftBreakdown.morning || 0}</span>
                    </div>
                    <div class="shift-item evening">
                        <i class="fas fa-cloud-sun"></i>
                        <span>${doctor.shiftBreakdown.evening || 0}</span>
                    </div>
                    <div class="shift-item night">
                        <i class="fas fa-moon"></i>
                        <span>${doctor.shiftBreakdown.night || 0}</span>
                    </div>
                </div>
                
                <div class="workload-meter">
                    <div class="meter-fill ${scoreClass}" style="width: ${Math.min(score, 100)}%"></div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <!-- Detailed Analysis -->
            <div class="analysis-summary glass-effect mt-4">
                <h4 class="section-subtitle mb-3">
                    <i class="fas fa-info-circle me-2"></i>Workload Analysis Summary
                </h4>
                <div class="summary-content">
                    <p>Average workload: <strong>${(data.analysis.reduce((sum, d) => sum + d.workloadScore, 0) / data.analysis.length).toFixed(1)}%</strong></p>
                    <p>Most loaded: <strong>${data.analysis.reduce((max, d) => d.workloadScore > max.score ? {name: d.name, score: d.workloadScore} : max, {score: 0}).name}</strong></p>
                    <p>Total shifts this month: <strong>${data.analysis.reduce((sum, d) => sum + d.totalShifts, 0)}</strong></p>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Create enhanced workload chart
    setTimeout(() => {
        const ctx = document.getElementById('workloadChart');
        if (ctx && charts.workload) {
            charts.workload.destroy();
        }
        
        if (ctx) {
            charts.workload = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.analysis.map(d => d.name.replace('Dr. ', '')),
                    datasets: [
                        {
                            label: 'Morning',
                            data: data.analysis.map(d => d.shiftBreakdown.morning || 0),
                            backgroundColor: 'rgba(255, 193, 71, 0.8)',
                            borderRadius: 5
                        },
                        {
                            label: 'Evening',
                            data: data.analysis.map(d => d.shiftBreakdown.evening || 0),
                            backgroundColor: 'rgba(79, 172, 254, 0.8)',
                            borderRadius: 5
                        },
                        {
                            label: 'Night',
                            data: data.analysis.map(d => d.shiftBreakdown.night || 0),
                            backgroundColor: 'rgba(157, 78, 221, 0.8)',
                            borderRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: true,
                            callbacks: {
                                footer: (tooltipItems) => {
                                    let sum = 0;
                                    tooltipItems.forEach(item => {
                                        sum += item.parsed.y;
                                    });
                                    return 'Total: ' + sum + ' shifts';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.8)'
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.8)'
                            }
                        }
                    }
                }
            });
        }
    }, 100);
}

// Render Fairness Metrics
function renderFairnessMetrics(data) {
    const container = document.getElementById('fairnessContent');
    
    console.log('Fairness data received:', data);
    
    if (!container) {
        console.error('Fairness content container not found!');
        return;
    }
    
    if (!data) {
        container.innerHTML = `
            <div class="empty-state glass-effect">
                <i class="fas fa-balance-scale fa-3x text-muted mb-3"></i>
                <p class="text-muted">No fairness data available</p>
            </div>
        `;
        return;
    }
    
    try {
    
    // Transform the data to match expected format
    const overallScore = data.fairnessScores?.scores?.overall || 75;
    const workloadScore = data.fairnessScores?.scores?.workload || 0;
    const nightScore = data.fairnessScores?.scores?.night || 0;
    const weekendScore = data.fairnessScores?.scores?.weekend || 0;
    
    console.log('Fairness scores:', { overallScore, workloadScore, nightScore, weekendScore });
    
    // Create doctor metrics from doctorStats
    const doctorMetrics = Object.values(data.doctorStats || {}).map(stats => ({
        name: stats.doctor.name,
        totalDuties: stats.totals.shifts,
        weekendDuties: stats.totals.weekend,
        nightShifts: stats.shifts.night,
        nightShiftPercentage: stats.percentages.night || 0,
        weekendPercentage: stats.percentages.weekend || 0,
        workloadPercentage: stats.percentages.workload,
        individualFairnessScore: 100 - Math.abs(100 - stats.percentages.workload),
        deviationFromAverage: stats.percentages.workload - 100
    }));
    
    console.log('Doctor metrics:', doctorMetrics);
    
    // Simple test to ensure rendering works
    if (!doctorMetrics || doctorMetrics.length === 0) {
        container.innerHTML = `
            <div class="empty-state glass-effect">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <p class="text-muted">No doctor statistics available for this period</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="fairness-analysis-container">
            <!-- Export Buttons -->
            <div class="analysis-header mb-3">
                <h4 class="section-subtitle">
                    <i class="fas fa-balance-scale me-2"></i>Fairness & Equity Analysis
                </h4>
                <div class="export-buttons">
                    <button class="modern-btn btn-sm secondary-btn" onclick="exportFairness('csv')" title="Export to CSV">
                        <i class="fas fa-file-csv me-1"></i>CSV
                    </button>
                    <button class="modern-btn btn-sm secondary-btn" onclick="exportFairness('pdf')" title="Export to PDF">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </button>
                </div>
            </div>
            
            <!-- Overall Metrics -->
            <div class="fairness-metrics-grid mb-4">
                <div class="fairness-metric-card glass-effect">
                    <div class="metric-icon">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <div class="metric-content">
                        <h6>Overall Fairness Score</h6>
                        <div class="metric-value ${overallScore > 80 ? 'success' : overallScore > 60 ? 'warning' : 'danger'}">
                            ${overallScore.toFixed(1)}%
                        </div>
                        <div class="metric-bar">
                            <div class="bar-fill ${overallScore > 80 ? 'success' : overallScore > 60 ? 'warning' : 'danger'}" 
                                 style="width: ${overallScore}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="fairness-metric-card glass-effect">
                    <div class="metric-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="metric-content">
                        <h6>Workload Fairness</h6>
                        <div class="metric-value">${workloadScore.toFixed(1)}%</div>
                        <p class="metric-desc">Lower is better</p>
                    </div>
                </div>
                
                <div class="fairness-metric-card glass-effect">
                    <div class="metric-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="metric-content">
                        <h6>Night Shift Equity</h6>
                        <div class="metric-value">${nightScore.toFixed(1)}%</div>
                        <p class="metric-desc">Balance across shifts</p>
                    </div>
                </div>
                
                <div class="fairness-metric-card glass-effect">
                    <div class="metric-icon">
                        <i class="fas fa-calendar-week"></i>
                    </div>
                    <div class="metric-content">
                        <h6>Weekend Fairness</h6>
                        <div class="metric-value">${weekendScore.toFixed(1)}%</div>
                        <p class="metric-desc">Weekend distribution</p>
                    </div>
                </div>
            </div>
            
            <!-- Chart Section -->
            <div class="chart-section glass-effect mb-4">
                <h4 class="section-subtitle mb-3">
                    <i class="fas fa-chart-radar me-2"></i>Individual Fairness Analysis
                </h4>
                <div class="chart-wrapper">
                    <canvas id="fairnessChart"></canvas>
                </div>
            </div>
            
            <!-- Doctor Cards -->
            <div class="fairness-doctor-grid">
    `;
    
    doctorMetrics.forEach(doctor => {
        const deviationClass = Math.abs(doctor.deviationFromAverage) > 20 ? 'danger' : 
                              Math.abs(doctor.deviationFromAverage) > 10 ? 'warning' : 'success';
        
        html += `
            <div class="fairness-doctor-card glass-effect">
                <div class="doctor-header">
                    <div class="doctor-avatar ${getRandomGradient()}">
                        ${doctor.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div class="doctor-info">
                        <h5>${doctor.name}</h5>
                        <span class="fairness-score">${doctor.individualFairnessScore.toFixed(1)} score</span>
                    </div>
                </div>
                
                <div class="doctor-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Total Duties</span>
                        <span class="metric-value">${doctor.totalDuties}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Deviation</span>
                        <span class="metric-value ${deviationClass}">
                            ${doctor.deviationFromAverage > 0 ? '+' : ''}${doctor.deviationFromAverage.toFixed(1)}%
                        </span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Night Shifts</span>
                        <span class="metric-value">${doctor.nightShiftPercentage.toFixed(1)}%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Weekends</span>
                        <span class="metric-value">${doctor.weekendPercentage.toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="fairness-visual">
                    <div class="fairness-gauge">
                        <div class="gauge-fill ${deviationClass}" 
                             style="transform: rotate(${(doctor.individualFairnessScore / 100) * 180}deg)"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            ${data.recommendations && data.recommendations.length > 0 ? `
            <!-- Recommendations -->
            <div class="recommendations-section glass-effect mt-4">
                <h4 class="section-subtitle mb-3">
                    <i class="fas fa-lightbulb me-2"></i>Recommendations for Improvement
                </h4>
                <div class="recommendations-list">
                    ${data.recommendations.map((rec, index) => `
                        <div class="recommendation-item">
                            <div class="rec-number">${index + 1}</div>
                            <div class="rec-content">
                                <h6 class="rec-title">${rec.title || rec}</h6>
                                ${rec.description ? `<p class="rec-description">${rec.description}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = html;
    
    // Create fairness radar chart
    setTimeout(() => {
        try {
            const chartContainer = document.getElementById('fairnessChart');
            console.log('Chart container found:', chartContainer);
            
            if (!chartContainer) {
                console.error('Fairness chart container not found!');
                return;
            }
            
            const ctx = chartContainer.getContext('2d');
            if (charts.fairness) {
                charts.fairness.destroy();
            }
            
            if (ctx) {
                charts.fairness = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: doctorMetrics.map(d => d.name.replace('Dr. ', '')),
                    datasets: [
                        {
                            label: 'Fairness Score',
                            data: doctorMetrics.map(d => d.individualFairnessScore),
                            backgroundColor: 'rgba(79, 172, 254, 0.2)',
                            borderColor: 'rgba(79, 172, 254, 0.8)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(79, 172, 254, 0.8)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(79, 172, 254, 0.8)'
                        },
                        {
                            label: 'Target (100)',
                            data: doctorMetrics.map(() => 100),
                            backgroundColor: 'rgba(255, 193, 71, 0.1)',
                            borderColor: 'rgba(255, 193, 71, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                padding: 15
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                            padding: 10
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 120,
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.6)',
                                backdropColor: 'transparent'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            pointLabels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }
        } catch (error) {
            console.error('Error creating fairness chart:', error);
        }
    }, 100);
    
    } catch (error) {
        console.error('Error rendering fairness metrics:', error);
        container.innerHTML = `
            <div class="empty-state glass-effect">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <p class="text-muted">Error loading fairness data</p>
                <p class="text-muted small">${error.message}</p>
            </div>
        `;
    }
}

// Initialize Consultation Form
function initializeConsultationForm() {
    const content = document.getElementById('consultationContent');
    content.innerHTML = `
        <!-- Action Buttons -->
        <div class="consultation-actions mb-3">
            <button class="btn btn-success btn-sm" onclick="addConsultationRow()">
                <i class="fas fa-plus me-2"></i>Add Row
            </button>
            <button class="btn btn-primary btn-sm" onclick="saveConsultationLog()">
                <i class="fas fa-save me-2"></i>Save
            </button>
            <button class="btn btn-secondary btn-sm" onclick="clearConsultationForm()">
                <i class="fas fa-eraser me-2"></i>Clear Form
            </button>
            <div class="btn-group ms-2" role="group">
                <button type="button" class="btn btn-sm btn-info" onclick="exportConsultation('csv')" title="Export to CSV">
                    <i class="fas fa-file-csv me-1"></i>CSV
                </button>
                <button type="button" class="btn btn-sm btn-info" onclick="exportConsultation('pdf')" title="Export to PDF">
                    <i class="fas fa-file-pdf me-1"></i>PDF
                </button>
            </div>
            <span id="lastSaved" class="ms-3 text-muted"></span>
        </div>

        <!-- Consultation Table -->
        <div class="table-responsive">
            <table class="table consultation-table" id="consultationTable">
                <thead class="table-dark sticky-header">
                    <tr>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>ER Doctor</th>
                        <th>Time Called</th>
                        <th>Specialist</th>
                        <th>Specialty</th>
                        <th>Response</th>
                        <th>Arrival Time</th>
                        <th>Response Time</th>
                        <th>Patient ID</th>
                        <th>Outcome</th>
                        <th>Urgent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="consultationTableBody">
                    <!-- Rows will be generated by JavaScript -->
                </tbody>
            </table>
        </div>
    `;
    
    // Load saved data if available
    loadSavedConsultationData();
}

// Load saved consultation data from localStorage
function loadSavedConsultationData() {
    try {
        const savedData = localStorage.getItem('consultationLog');
        if (savedData) {
            const consultationData = JSON.parse(savedData);
            const tbody = document.getElementById('consultationTableBody');
            
            if (consultationData.length > 0) {
                tbody.innerHTML = ''; // Clear default row
                
                consultationData.forEach(data => {
                    const rowId = Date.now() + Math.random();
                    const row = document.createElement('tr');
                    row.id = `consult-row-${rowId}`;
                    
                    // Get ER doctor options
                    const erDoctorOptions = doctors.map(d => 
                        `<option value="${d.name}" ${d.name === data.erDoctor ? 'selected' : ''}>${d.name}</option>`
                    ).join('');
                    
                    // Build specialist options
                    const specialistOptions = Object.entries(specialists).map(([dept, docs]) => 
                        `<optgroup label="${dept}">
                            ${docs.map(doc => 
                                `<option value="${doc}" data-specialty="${dept}" ${doc === data.specialist ? 'selected' : ''}>${doc}</option>`
                            ).join('')}
                        </optgroup>`
                    ).join('');
                    
                    row.innerHTML = `
                        <td><input type="date" class="form-control form-control-sm" value="${data.date || ''}" required></td>
                        <td>
                            <select class="form-control form-control-sm" required>
                                <option value="">Select Shift</option>
                                <option value="Morning" ${data.shift === 'Morning' ? 'selected' : ''}>Morning (7AM-3PM)</option>
                                <option value="Evening" ${data.shift === 'Evening' ? 'selected' : ''}>Evening (3PM-11PM)</option>
                                <option value="Night" ${data.shift === 'Night' ? 'selected' : ''}>Night (11PM-7AM)</option>
                            </select>
                        </td>
                        <td>
                            <select class="form-control form-control-sm" required>
                                <option value="">Select ER Doctor</option>
                                ${erDoctorOptions}
                            </select>
                        </td>
                        <td><input type="time" class="form-control form-control-sm time-called" value="${data.timeCalled || ''}" onchange="calculateResponseTime(${rowId})" required></td>
                        <td>
                            <select class="form-control form-control-sm specialist-select" onchange="updateSpecialty(${rowId})" required>
                                <option value="">Select Specialist</option>
                                ${specialistOptions}
                            </select>
                        </td>
                        <td><input type="text" class="form-control form-control-sm specialty-field" value="${data.specialty || ''}" readonly></td>
                        <td>
                            <select class="form-control form-control-sm response-status" onchange="handleResponseChange(${rowId})" required>
                                <option value="">Select</option>
                                <option value="Responded" ${data.response === 'Responded' ? 'selected' : ''}>Responded</option>
                                <option value="No Response" ${data.response === 'No Response' ? 'selected' : ''}>No Response</option>
                                <option value="Delayed" ${data.response === 'Delayed' ? 'selected' : ''}>Delayed</option>
                            </select>
                        </td>
                        <td><input type="time" class="form-control form-control-sm arrival-time" value="${data.arrivalTime || ''}" onchange="calculateResponseTime(${rowId})"></td>
                        <td><input type="text" class="form-control form-control-sm response-time" value="${data.responseTime || ''}" readonly></td>
                        <td><input type="text" class="form-control form-control-sm" value="${data.patientId || ''}" placeholder="Patient ID"></td>
                        <td><input type="text" class="form-control form-control-sm" value="${data.outcome || ''}" placeholder="Outcome"></td>
                        <td>
                            <input type="checkbox" class="form-check-input" ${data.urgent ? 'checked' : ''}>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="removeConsultationRow('${rowId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    
                    tbody.appendChild(row);
                });
                
                // Update last saved time
                const timestamp = localStorage.getItem('consultationLogTimestamp');
                if (timestamp) {
                    const lastSaved = document.getElementById('lastSaved');
                    if (lastSaved) {
                        lastSaved.textContent = `Last saved: ${new Date(timestamp).toLocaleString()}`;
                    }
                }
                
                showToast('Previous consultation data loaded', 'info');
            } else {
                // No data, add default row
                addConsultationRow();
            }
        } else {
            // No saved data, add default row
            addConsultationRow();
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
        // On error, add default row
        addConsultationRow();
    }
}

// Specialist data
const specialists = {
    'General Surgery': ['Renaldo', 'Mammoun'],
    'Orthopedics': ['Mahmud', 'Joseph'],
    'Pediatrics': ['Mahmoud Badawy'],
    'Obstetrics & Gynaecology': ['Frazana', 'Asma'],
    'Internal Medicine': ['Fathi'],
    'Ophthalmology': ['Yanelis'],
    'ENT': ['Mahasen'],
    'Anesthesia': ['Julio'],
    'Nephrology': ['Abdulraouf']
};

// Add Consultation Row
function addConsultationRow() {
    const tbody = document.getElementById('consultationTableBody');
    const rowId = Date.now();
    
    // Get current date and ER doctors from loaded doctors
    const today = new Date().toISOString().split('T')[0];
    const erDoctorOptions = doctors.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    
    const row = document.createElement('tr');
    row.id = `consult-row-${rowId}`;
    row.innerHTML = `
        <td><input type="date" class="form-control form-control-sm" value="${today}" required></td>
        <td>
            <select class="form-control form-control-sm" required>
                <option value="">Select Shift</option>
                <option value="Morning">Morning (7AM-3PM)</option>
                <option value="Evening">Evening (3PM-11PM)</option>
                <option value="Night">Night (11PM-7AM)</option>
            </select>
        </td>
        <td>
            <select class="form-control form-control-sm" required>
                <option value="">Select ER Doctor</option>
                ${erDoctorOptions}
            </select>
        </td>
        <td><input type="time" class="form-control form-control-sm time-called" onchange="calculateResponseTime(${rowId})" required></td>
        <td>
            <select class="form-control form-control-sm specialist-select" onchange="updateSpecialty(${rowId})" required>
                <option value="">Select Specialist</option>
                ${Object.entries(specialists).map(([dept, docs]) => 
                    `<optgroup label="${dept}">
                        ${docs.map(doc => `<option value="${doc}" data-specialty="${dept}">${doc}</option>`).join('')}
                    </optgroup>`
                ).join('')}
            </select>
        </td>
        <td><input type="text" class="form-control form-control-sm specialty-field" readonly></td>
        <td>
            <select class="form-control form-control-sm response-status" onchange="handleResponseChange(${rowId})" required>
                <option value="">Select</option>
                <option value="Responded">Responded</option>
                <option value="No Response">No Response</option>
                <option value="Delayed">Delayed</option>
            </select>
        </td>
        <td><input type="time" class="form-control form-control-sm arrival-time" onchange="calculateResponseTime(${rowId})"></td>
        <td><input type="text" class="form-control form-control-sm response-time" readonly></td>
        <td><input type="text" class="form-control form-control-sm" placeholder="Patient ID"></td>
        <td><input type="text" class="form-control form-control-sm" placeholder="Outcome"></td>
        <td>
            <input type="checkbox" class="form-check-input">
        </td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="removeConsultationRow('${rowId}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// Update specialty field when specialist is selected
function updateSpecialty(rowId) {
    const row = document.getElementById(`consult-row-${rowId}`);
    const specialistSelect = row.querySelector('.specialist-select');
    const specialtyField = row.querySelector('.specialty-field');
    
    const selectedOption = specialistSelect.options[specialistSelect.selectedIndex];
    const specialty = selectedOption.getAttribute('data-specialty') || '';
    specialtyField.value = specialty;
}

// Handle response status change
function handleResponseChange(rowId) {
    const row = document.getElementById(`consult-row-${rowId}`);
    const responseStatus = row.querySelector('.response-status').value;
    const arrivalTimeInput = row.querySelector('.arrival-time');
    const responseTimeInput = row.querySelector('.response-time');
    
    if (responseStatus === 'No Response') {
        arrivalTimeInput.value = '';
        arrivalTimeInput.disabled = true;
        responseTimeInput.value = 'N/A';
    } else {
        arrivalTimeInput.disabled = false;
        calculateResponseTime(rowId);
    }
}

// Calculate response time
function calculateResponseTime(rowId) {
    const row = document.getElementById(`consult-row-${rowId}`);
    const timeCalled = row.querySelector('.time-called').value;
    const arrivalTime = row.querySelector('.arrival-time').value;
    const responseTimeField = row.querySelector('.response-time');
    const responseStatus = row.querySelector('.response-status').value;
    
    if (responseStatus === 'No Response') {
        responseTimeField.value = 'N/A';
        return;
    }
    
    if (timeCalled && arrivalTime) {
        // Convert times to minutes
        const [calledHours, calledMinutes] = timeCalled.split(':').map(Number);
        const [arrivalHours, arrivalMinutes] = arrivalTime.split(':').map(Number);
        
        let calledTotalMinutes = calledHours * 60 + calledMinutes;
        let arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes;
        
        // Handle case where arrival is next day
        if (arrivalTotalMinutes < calledTotalMinutes) {
            arrivalTotalMinutes += 24 * 60;
        }
        
        const diffMinutes = arrivalTotalMinutes - calledTotalMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        responseTimeField.value = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } else {
        responseTimeField.value = '';
    }
}

// Remove Consultation Row
function removeConsultationRow(rowId) {
    const row = document.getElementById(`consult-row-${rowId}`);
    if (row) {
        row.remove();
    }
}

// Save Consultation Log
function saveConsultationLog() {
    try {
        const table = document.getElementById('consultationTable');
        if (!table) {
            showToast('Error: Consultation table not found', 'danger');
            return;
        }
        
        const rows = table.querySelectorAll('tbody tr');
        const consultationData = [];
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('input, select');
            const rowData = {
                date: cells[0].value,
                shift: cells[1].value,
                erDoctor: cells[2].value,
                timeCalled: cells[3].value,
                specialist: cells[4].value,
                specialty: cells[5].value,
                response: cells[6].value,
                arrivalTime: cells[7].value,
                responseTime: cells[8].value,
                patientId: cells[9].value,
                outcome: cells[10].value,
                urgent: cells[11].checked
            };
            
            // Only save rows with some data
            if (rowData.date || rowData.specialist || rowData.patientId) {
                consultationData.push(rowData);
            }
        });
        
        if (consultationData.length === 0) {
            showToast('No data to save', 'warning');
            return;
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('consultationLog', JSON.stringify(consultationData));
        localStorage.setItem('consultationLogTimestamp', new Date().toISOString());
        
        showToast('Consultation log saved successfully!', 'success');
        const lastSaved = document.getElementById('lastSaved');
        if (lastSaved) {
            lastSaved.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error('Error saving consultation log:', error);
        showToast('Error saving consultation log', 'danger');
    }
}

// Clear Consultation Form
function clearConsultationForm() {
    try {
        if (confirm('Are you sure you want to clear the form? All unsaved data will be lost.')) {
            initializeConsultationForm();
            showToast('Form cleared successfully', 'info');
        }
    } catch (error) {
        console.error('Error clearing form:', error);
        showToast('Error clearing form', 'danger');
    }
}

// Export Consultation
function exportConsultation(format) {
    try {
        const table = document.getElementById('consultationTable');
        if (!table) {
            console.error('Consultation table not found');
            showToast('Error: Consultation table not found', 'danger');
            return;
        }
        
        const rows = table.querySelectorAll('tbody tr');
        
        if (rows.length === 0) {
            showToast('No consultation data to export', 'warning');
            return;
        }
    
    // Collect data from table
    const consultationData = [];
    rows.forEach(row => {
        const cells = row.querySelectorAll('input, select');
        const rowData = {
            date: cells[0].value,
            shift: cells[1].value,
            erDoctor: cells[2].value,
            timeCalled: cells[3].value,
            specialist: cells[4].value,
            specialty: cells[5].value,
            response: cells[6].value,
            arrivalTime: cells[7].value,
            responseTime: cells[8].value,
            patientId: cells[9].value,
            outcome: cells[10].value,
            urgent: cells[11].checked ? 'Yes' : 'No'
        };
        
        // Only include rows with at least some data
        if (rowData.date || rowData.specialist || rowData.patientId) {
            consultationData.push(rowData);
        }
    });
    
    if (consultationData.length === 0) {
        showToast('No valid consultation data to export', 'warning');
        return;
    }
    
    if (format === 'csv') {
        exportConsultationCSV(consultationData);
    } else if (format === 'pdf') {
        exportConsultationPDF(consultationData);
    }
    } catch (error) {
        console.error('Error exporting consultation:', error);
        showToast('Error exporting consultation data', 'danger');
    }
}

// Export Consultation as CSV
function exportConsultationCSV(data) {
    try {
        const csvData = data.map(row => ({
            'Date': row.date || '',
            'Shift': row.shift || '',
            'ER Doctor': row.erDoctor || '',
            'Time Called': row.timeCalled || '',
            'Specialist': row.specialist || '',
            'Specialty': row.specialty || '',
            'Response': row.response || '',
            'Arrival Time': row.arrivalTime || '',
            'Response Time': row.responseTime || '',
            'Patient ID': row.patientId || '',
            'Outcome': row.outcome || '',
            'Urgent': row.urgent || ''
        }));
        
        const csv = arrayToCSV(csvData);
        exportToCSV(csv, `consultation_log_${new Date().toISOString().split('T')[0]}.csv`);
        
        showToast('Consultation log exported as CSV', 'success');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showToast('Error exporting to CSV', 'danger');
    }
}

// Export Consultation as PDF
function exportConsultationPDF(data) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        
        // Title
        doc.setFontSize(16);
        doc.text('Specialist Consultation Log', 14, 15);
        
        // Date
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
        
        // Table headers
        const headers = [['Date', 'Shift', 'ER Doctor', 'Time Called', 'Specialist', 'Specialty', 
                         'Response', 'Arrival', 'Response Time', 'Patient ID', 'Outcome', 'Urgent']];
        
        // Table data
        const tableData = data.map(row => [
            row.date || '',
            row.shift || '',
            row.erDoctor || '',
            row.timeCalled || '',
            row.specialist || '',
            row.specialty || '',
            row.response || '',
            row.arrivalTime || '',
            row.responseTime || '',
            row.patientId || '',
            row.outcome || '',
            row.urgent || ''
        ]);
        
        // Generate table
        doc.autoTable({
            head: headers,
            body: tableData,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [220, 53, 69], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 20 },  // Date
                1: { cellWidth: 25 },  // Shift
                2: { cellWidth: 25 },  // ER Doctor
                3: { cellWidth: 18 },  // Time Called
                4: { cellWidth: 25 },  // Specialist
                5: { cellWidth: 25 },  // Specialty
                6: { cellWidth: 20 },  // Response
                7: { cellWidth: 18 },  // Arrival
                8: { cellWidth: 22 },  // Response Time
                9: { cellWidth: 20 },  // Patient ID
                10: { cellWidth: 35 }, // Outcome
                11: { cellWidth: 15 }  // Urgent
            }
        });
        
        // Summary
        const totalConsults = data.length;
        const responded = data.filter(d => d.response === 'Responded').length;
        const noResponse = data.filter(d => d.response === 'No Response').length;
        const urgent = data.filter(d => d.urgent === 'Yes').length;
        
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Summary: Total Consultations: ${totalConsults} | Responded: ${responded} | No Response: ${noResponse} | Urgent: ${urgent}`, 14, finalY);
        
        // Save PDF
        doc.save(`consultation_log_${new Date().toISOString().split('T')[0]}.pdf`);
        
        showToast('Consultation log exported as PDF', 'success');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showToast('Error exporting to PDF', 'danger');
    }
}

// Placeholder implementations for missing views
function renderCalendarView(container) {
    container.innerHTML = `
        <div class="calendar-view glass-effect">
            <div class="text-center p-5">
                <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                <h4>Calendar View</h4>
                <p class="text-muted">Calendar view coming soon!</p>
            </div>
        </div>
    `;
}

function renderTimelineView(container) {
    console.log('[Timeline] Rendering timeline view');
    console.log('[Timeline] Current roster:', currentRoster);
    
    if (!currentRoster || currentRoster.length === 0) {
        console.log('[Timeline] No roster data available');
        container.innerHTML = `
            <div class="empty-state glass-effect">
                <div class="empty-icon">
                    <i class="fas fa-stream"></i>
                </div>
                <h3>No timeline data available</h3>
                <p>Load roster data to see the timeline view</p>
            </div>
        `;
        return;
    }
    
    const groupedByDate = groupRosterByDate(currentRoster);
    const dates = Object.keys(groupedByDate).sort();
    console.log('[Timeline] Grouped dates:', dates.length);
    
    // Calculate timeline statistics
    const timelineStats = calculateTimelineStats(groupedByDate);
    
    let html = `
        <div class="timeline-container">
            <!-- Timeline Header -->
            <div class="timeline-header glass-effect">
                <div class="timeline-stats">
                    <div class="stat-item">
                        <i class="fas fa-calendar-week"></i>
                        <span>${dates.length} Days</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>${timelineStats.totalDoctors} Doctors</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <span>${timelineStats.totalShifts} Shifts</span>
                    </div>
                </div>
                <div class="timeline-controls">
                    <button class="timeline-btn" onclick="return scrollTimeline('start')" type="button">
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button class="timeline-btn" onclick="return scrollTimeline('today')" type="button">
                        <i class="fas fa-calendar-day"></i> Today
                    </button>
                    <button class="timeline-btn" onclick="return scrollTimeline('end')" type="button">
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                </div>
            </div>
            
            <!-- Timeline Content -->
            <div class="timeline-wrapper" id="timelineWrapper">
                <div class="timeline-track">
    `;
    
    // Process each date
    dates.forEach((date, index) => {
        const entries = groupedByDate[date];
        const dateObj = new Date(date);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const isToday = new Date().toDateString() === dateObj.toDateString();
        
        // Group by shift for this date
        const shiftGroups = {
            morning: entries.filter(e => e.shift === 'morning'),
            evening: entries.filter(e => e.shift === 'evening'),
            night: entries.filter(e => e.shift === 'night')
        };
        
        html += `
            <div class="timeline-day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}" 
                 id="timeline-day-${index}" data-date="${date}">
                <div class="timeline-date">
                    <div class="date-badge ${isToday ? 'pulse' : ''}">
                        <div class="day-num">${dateObj.getDate()}</div>
                        <div class="day-info">
                            <span class="day-name">${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span class="month-name">${dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>
                    </div>
                    ${isToday ? '<div class="today-indicator">TODAY</div>' : ''}
                </div>
                
                <div class="timeline-content">
        `;
        
        // Render shifts in timeline format
        ['morning', 'evening', 'night'].forEach(shiftType => {
            const shiftEntries = shiftGroups[shiftType];
            if (shiftEntries.length > 0) {
                html += `
                    <div class="timeline-shift shift-${shiftType}">
                        <div class="shift-time">
                            <i class="fas fa-${getShiftIcon(shiftType)}"></i>
                            <span>${getShiftTime(shiftType)}</span>
                        </div>
                        <div class="shift-doctors-timeline">
                `;
                
                shiftEntries.forEach(entry => {
                    const initials = entry.doctorName ? 
                        entry.doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('') : 'D';
                    
                    html += `
                        <div class="doctor-timeline-chip ${entry.isReferralDuty ? 'referral' : ''}"
                             title="${entry.doctorName}${entry.isReferralDuty ? ' (Referral Duty)' : ''}">
                            <div class="doctor-avatar-timeline ${getRandomGradient()}">
                                ${initials}
                            </div>
                            <div class="doctor-info-timeline">
                                <span class="doctor-name">${entry.doctorName ? entry.doctorName.replace('Dr. ', '') : 'Unknown'}</span>
                                ${entry.isReferralDuty ? '<span class="referral-badge">R</span>' : ''}
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        });
        
        // Show if no shifts
        if (entries.length === 0) {
            html += `
                <div class="timeline-empty">
                    <i class="fas fa-calendar-times"></i>
                    <span>No shifts</span>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <!-- Timeline Navigation -->
            <div class="timeline-nav glass-effect">
                <div class="timeline-minimap" id="timelineMinimap">
                    ${dates.map((date, index) => {
                        const dateObj = new Date(date);
                        const isToday = new Date().toDateString() === dateObj.toDateString();
                        return `<div class="minimap-day ${isToday ? 'today' : ''}" 
                                     onclick="return scrollToTimelineDay(${index})" 
                                     title="${dateObj.toLocaleDateString()}"></div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('[Timeline] HTML set, container innerHTML length:', container.innerHTML.length);
    console.log('[Timeline] Timeline days found:', document.querySelectorAll('.timeline-day').length);
    
    // Add animations with safeguard
    const timelineDays = document.querySelectorAll('.timeline-day');
    if (timelineDays.length > 0 && typeof gsap !== 'undefined') {
        // Ensure timeline days are visible first
        timelineDays.forEach(day => {
            day.style.opacity = '1';
            day.style.transform = 'translateX(0)';
        });
        
        // Then animate
        gsap.fromTo('.timeline-day', 
            {
                x: -50,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power2.out',
                clearProps: 'all'
            }
        );
    }
    
    // Scroll to today if exists
    setTimeout(() => {
        const todayElement = document.querySelector('.timeline-day.today');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    }, 500);
}

// Calculate timeline statistics
function calculateTimelineStats(groupedByDate) {
    const allDoctors = new Set();
    let totalShifts = 0;
    
    Object.values(groupedByDate).forEach(entries => {
        entries.forEach(entry => {
            allDoctors.add(entry.doctorId);
            totalShifts++;
        });
    });
    
    return {
        totalDoctors: allDoctors.size,
        totalShifts: totalShifts
    };
}

// Get shift time display
function getShiftTime(shift) {
    const times = {
        morning: '7:00 AM - 3:00 PM',
        evening: '3:00 PM - 11:00 PM',
        night: '11:00 PM - 7:00 AM'
    };
    return times[shift] || '';
}

// Scroll timeline controls
window.scrollTimeline = function(position) {
    const wrapper = document.getElementById('timelineWrapper');
    if (!wrapper) return false;
    
    if (position === 'start') {
        wrapper.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (position === 'end') {
        wrapper.scrollTo({ left: wrapper.scrollWidth, behavior: 'smooth' });
    } else if (position === 'today') {
        const todayElement = document.querySelector('.timeline-day.today');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
    return false;
}

// Scroll to specific timeline day
window.scrollToTimelineDay = function(index) {
    const dayElement = document.getElementById(`timeline-day-${index}`);
    if (dayElement) {
        dayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    return false;
}

// Missing functions
function refreshAnalytics() {
    loadRosterData();
}

function showNotificationCenter() {
    showToast('Notification center coming soon!', 'info');
}

// Add metric card styles
const metricStyle = document.createElement('style');
metricStyle.textContent = `
    .metric-card {
        padding: 1.5rem;
        border-radius: 16px;
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .metric-card h6 {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
    }
    
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
    }
    
    .workload-chart-container {
        position: relative;
        height: 300px;
    }
    
    .consultation-table input[type="checkbox"] {
        width: 20px;
        height: 20px;
    }
    
    .sticky-header {
        position: sticky;
        top: 0;
        z-index: 10;
    }
`;
document.head.appendChild(metricStyle);

// Import Roster Functions
let importedData = [];
let importModal = null;

function showImportRoster() {
    if (!importModal) {
        importModal = new bootstrap.Modal(document.getElementById('importRosterModal'));
    }
    
    // Reset form
    document.getElementById('importRosterForm').reset();
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('previewBtn').style.display = 'inline-block';
    document.getElementById('importBtn').style.display = 'none';
    
    // Set default month to current
    document.getElementById('importMonth').value = document.getElementById('monthYear').value;
    
    importModal.show();
}

function previewImport() {
    const fileInput = document.getElementById('rosterFile');
    const monthInput = document.getElementById('importMonth');
    
    if (!fileInput.files[0]) {
        showToast('Please select a file', 'warning');
        return;
    }
    
    if (!monthInput.value) {
        showToast('Please select a month', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size exceeds 5MB limit', 'danger');
        return;
    }
    
    reader.onload = function(e) {
        try {
            const data = e.target.result;
            let parsedData = [];
            
            if (file.name.endsWith('.csv')) {
                parsedData = parseCSV(data);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                parsedData = parseExcel(data);
            } else {
                showToast('Unsupported file format', 'danger');
                return;
            }
            
            if (parsedData.length === 0) {
                showToast('No data found in file', 'warning');
                return;
            }
            
            // Validate and process data
            const validated = validateRosterData(parsedData);
            if (validated.errors.length > 0) {
                showToast(`Validation errors: ${validated.errors.join(', ')}`, 'danger');
                return;
            }
            
            importedData = validated.data;
            displayPreview(importedData);
            
        } catch (error) {
            console.error('Error parsing file:', error);
            showToast('Error parsing file: ' + error.message, 'danger');
        }
    };
    
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function parseCSV(data) {
    const lines = data.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        rows.push(row);
    }
    
    return rows;
}

function parseExcel(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) return [];
    
    const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
    const rows = [];
    
    for (let i = 1; i < jsonData.length; i++) {
        const row = {};
        headers.forEach((header, index) => {
            row[header] = jsonData[i][index] || '';
        });
        rows.push(row);
    }
    
    return rows;
}

function validateRosterData(data) {
    const errors = [];
    const validatedData = [];
    const monthYear = document.getElementById('importMonth').value;
    const [year, month] = monthYear.split('-');
    
    // Check required columns
    const requiredColumns = ['date', 'doctor', 'shift'];
    const columns = Object.keys(data[0] || {});
    
    // Map common column variations
    const columnMappings = {
        'doctor name': 'doctor',
        'doctor_name': 'doctor',
        'name': 'doctor',
        'date': 'date',
        'shift': 'shift',
        'area': 'area',
        'referral duty': 'referral_duty',
        'referral': 'referral_duty'
    };
    
    // Normalize column names
    data = data.map(row => {
        const normalizedRow = {};
        Object.entries(row).forEach(([key, value]) => {
            const normalizedKey = columnMappings[key.toLowerCase()] || key.toLowerCase();
            normalizedRow[normalizedKey] = value;
        });
        return normalizedRow;
    });
    
    // Validate required columns
    const normalizedColumns = Object.keys(data[0] || {});
    const missingColumns = requiredColumns.filter(col => !normalizedColumns.includes(col));
    if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        return { data: [], errors };
    }
    
    // Validate each row
    data.forEach((row, index) => {
        try {
            // Parse date
            let date = row.date;
            if (!date) {
                errors.push(`Row ${index + 2}: Missing date`);
                return;
            }
            
            // Handle different date formats
            if (date.includes('/')) {
                // DD/MM/YYYY format
                const parts = date.split('/');
                if (parts.length === 3) {
                    date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            
            // Ensure date is in correct month
            const rowDate = new Date(date);
            if (rowDate.getFullYear() !== parseInt(year) || rowDate.getMonth() + 1 !== parseInt(month)) {
                // Skip rows not in selected month
                return;
            }
            
            // Validate doctor name
            const doctorName = row.doctor?.trim();
            if (!doctorName) {
                errors.push(`Row ${index + 2}: Missing doctor name`);
                return;
            }
            
            // Validate shift
            const shift = row.shift?.toLowerCase();
            const validShifts = ['morning', 'evening', 'night'];
            if (!validShifts.includes(shift)) {
                errors.push(`Row ${index + 2}: Invalid shift '${row.shift}' (must be Morning, Evening, or Night)`);
                return;
            }
            
            validatedData.push({
                date: date,
                doctorName: doctorName,
                shift: shift.charAt(0).toUpperCase() + shift.slice(1),
                area: row.area || 'Main ER',
                isReferralDuty: row.referral_duty?.toLowerCase() === 'yes' || row.referral_duty === '1' || row.referral_duty === true
            });
            
        } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
        }
    });
    
    // Limit errors to first 5
    if (errors.length > 5) {
        errors.splice(5);
        errors.push(`... and ${errors.length - 5} more errors`);
    }
    
    return { data: validatedData, errors: errors.slice(0, 5) };
}

function displayPreview(data) {
    const previewDiv = document.getElementById('importPreview');
    const previewTable = document.getElementById('previewTable');
    const thead = previewTable.querySelector('thead');
    const tbody = previewTable.querySelector('tbody');
    
    // Clear previous content
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Create header
    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Doctor</th>
            <th>Shift</th>
            <th>Area</th>
            <th>Referral Duty</th>
        </tr>
    `;
    
    // Show first 5 rows
    const previewData = data.slice(0, 5);
    previewData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(row.date).toLocaleDateString()}</td>
            <td>${row.doctorName}</td>
            <td>${row.shift}</td>
            <td>${row.area}</td>
            <td>${row.isReferralDuty ? 'Yes' : 'No'}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Show statistics
    const stats = document.getElementById('importStats');
    const shiftCounts = data.reduce((acc, row) => {
        acc[row.shift] = (acc[row.shift] || 0) + 1;
        return acc;
    }, {});
    
    const uniqueDoctors = [...new Set(data.map(row => row.doctorName))];
    const referralDuties = data.filter(row => row.isReferralDuty).length;
    
    stats.innerHTML = `
        <div class="alert alert-success">
            <strong>Import Summary:</strong>
            <ul class="mb-0 mt-2">
                <li>Total entries: ${data.length}</li>
                <li>Unique doctors: ${uniqueDoctors.length}</li>
                <li>Morning shifts: ${shiftCounts.Morning || 0}</li>
                <li>Evening shifts: ${shiftCounts.Evening || 0}</li>
                <li>Night shifts: ${shiftCounts.Night || 0}</li>
                <li>Referral duties: ${referralDuties}</li>
            </ul>
        </div>
    `;
    
    previewDiv.style.display = 'block';
    document.getElementById('previewBtn').style.display = 'none';
    document.getElementById('importBtn').style.display = 'inline-block';
}

function confirmImport() {
    if (importedData.length === 0) {
        showToast('No data to import', 'warning');
        return;
    }
    
    const monthYear = document.getElementById('importMonth').value;
    const replaceExisting = document.getElementById('replaceExisting').checked;
    
    // Show loading
    const importBtn = document.getElementById('importBtn');
    importBtn.disabled = true;
    importBtn.querySelector('.btn-loader').style.display = 'inline-block';
    
    // Prepare data for API
    const [year, month] = monthYear.split('-');
    const requestData = {
        year: parseInt(year),
        month: parseInt(month),
        replaceExisting: replaceExisting,
        entries: importedData
    };
    
    // Send to API
    fetch('/api/roster/import', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`Successfully imported ${data.imported} roster entries`, 'success');
            importModal.hide();
            
            // Reload roster if same month
            if (monthYear === document.getElementById('monthYear').value) {
                loadRosterData();
            }
        } else {
            showToast(data.message || 'Import failed', 'danger');
        }
    })
    .catch(error => {
        console.error('Import error:', error);
        showToast('Error importing roster data', 'danger');
    })
    .finally(() => {
        importBtn.disabled = false;
        importBtn.querySelector('.btn-loader').style.display = 'none';
    });
}

// Download Roster Template
function downloadRosterTemplate(format) {
    try {
        // Hide any previous error messages
        const errorDiv = document.getElementById('templateError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        // Simple direct download for both formats
        const url = `/api/roster/template/download?format=${format}`;
        
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = format === 'csv' ? 'roster-template.csv' : 'roster-template.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showToast(`Downloading ${format.toUpperCase()} template...`, 'info');
        
    } catch (error) {
        console.error('Template download error:', error);
        showToast('Error downloading template', 'danger');
        
        // Show error message in modal
        const errorDiv = document.getElementById('templateError');
        if (errorDiv) {
            errorDiv.style.display = 'block';
        }
    }
}