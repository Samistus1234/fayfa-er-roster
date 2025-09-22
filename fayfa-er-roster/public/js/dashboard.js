// Modern Dashboard JavaScript with Animations
let currentAnalytics = null;
let currentRoster = [];
let doctors = [];
let charts = {};
let currentView = 'table';
let currentTheme = 'light';

// Debug function - accessible from console
window.debugCalendar = function() {
    console.log('Current roster:', currentRoster ? currentRoster.length : 0, 'entries');
    console.log('Doctors:', doctors.length, 'entries');
    if (currentRoster && currentRoster.length > 0) {
        renderCalendar(2025, 6);
    } else {
        console.log('No roster data to render');
    }
};

// Test data filtering for June 1st
window.testJune1 = function() {
    if (!currentRoster || currentRoster.length === 0) {
        console.log('No roster data available');
        return;
    }

    const dateString = '2025-06-01';
    const dayShifts = currentRoster.filter(r =>
        r.date.split('T')[0] === dateString
    );

    console.log('June 1st test:');
    console.log('Date string:', dateString);
    console.log('Total shifts found:', dayShifts.length);
    console.log('Shifts:', dayShifts.map(s => ({
        doctor: s.doctorName,
        shift: s.shift,
        date: s.date,
        dateOnly: s.date.split('T')[0]
    })));

    // Test specialist filtering
    console.log('Specialist test:');
    console.log('Specialists list:', specialists);
    dayShifts.forEach(shift => {
        console.log(`${shift.doctorName} is specialist:`, isSpecialist(shift.doctorName));
    });

    // Test avatar rendering
    if (dayShifts.length > 0) {
        console.log('Testing avatar rendering for first shift:');
        const testAvatar = renderDoctorAvatar(dayShifts[0], dayShifts[0].shift);
        console.log('Generated avatar HTML:', testAvatar);
    }
};

// Test all dates in roster
window.testAllDates = function() {
    if (!currentRoster || currentRoster.length === 0) {
        console.log('No roster data available');
        return;
    }

    const uniqueDates = [...new Set(currentRoster.map(r => r.date.split('T')[0]))].sort();
    console.log('All unique dates in roster:', uniqueDates);
    console.log('First 10 dates:', uniqueDates.slice(0, 10));
    console.log('Last 10 dates:', uniqueDates.slice(-10));
};

// Test July data specifically
window.testJuly = function() {
    if (!currentRoster || currentRoster.length === 0) {
        console.log('No roster data available');
        return;
    }

    const julyShifts = currentRoster.filter(r => r.date.includes('2025-07'));
    console.log('July 2025 shifts found:', julyShifts.length);

    // Test Dr. Hiba's vacation period (should be absent July 1-21)
    const hibaShifts = julyShifts.filter(r => r.doctorName === 'Dr. Hiba');
    console.log('Dr. Hiba shifts in July:', hibaShifts.length);
    console.log('Dr. Hiba shift dates:', hibaShifts.map(s => s.date.split('T')[0]));

    // Test July 22nd when Dr. Hiba returns
    const july22 = julyShifts.filter(r => r.date.includes('2025-07-22'));
    console.log('July 22nd shifts (Dr. Hiba returns):', july22.map(s => ({
        doctor: s.doctorName,
        shift: s.shift,
        referral: s.isReferralDuty
    })));
};

// Test manual calendar population
window.testManualCalendar = function() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) {
        console.log('Calendar container not found');
        return;
    }

    // Create a simple test calendar day
    const testHTML = `
        <div class="calendar-day">
            <div class="day-header">
                <div>
                    <div class="day-number">1</div>
                    <div class="day-name">Sun</div>
                </div>
            </div>
            <div class="shifts-container">
                <div class="shift-section">
                    <div class="shift-header">
                        <i class="fas fa-sun"></i>
                        <span>Morning</span>
                        <div class="shift-count">2</div>
                    </div>
                    <div class="doctors-list">
                        <div class="doctor-avatar morning">
                            <div class="avatar-circle" style="background: #667eea;">
                                AH
                            </div>
                            <div class="doctor-name">Ahmed</div>
                        </div>
                        <div class="doctor-avatar morning">
                            <div class="avatar-circle" style="background: #764ba2;">
                                AK
                            </div>
                            <div class="doctor-name">Akin</div>
                            <div class="referral-badge">R</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    calendarContainer.innerHTML = testHTML;
    console.log('Manual test calendar populated');
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    try {
        initializeApp();
        setupEventListeners();
        setupAnimations();
        setupKeyboardShortcuts();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // Show basic interface even if there's an error
        document.body.style.display = 'block';
    }
});

// Initialize Application
async function initializeApp() {
    try {
        console.log('Starting app initialization...');

        // Load saved theme first
        loadTheme();

        // Show loading animation
        showGlobalLoader();

        // Load initial data
        console.log('Loading doctors...');
        await loadDoctors();

        console.log('Setting default month...');
        setDefaultMonth();

        // Load initial roster data
        console.log('Loading roster data...');
        await loadRosterData();

        // Animate entrance
        console.log('Animating entrance...');
        animatePageEntrance();

        // Hide loader
        hideGlobalLoader();

        // Update stats
        updateQuickStats();

        // Load specialists available today
        try {
            loadSpecialistsToday();
        } catch (specialistError) {
            console.warn('Could not load specialists:', specialistError);
        }

        // Refresh specialists every 5 minutes
        setInterval(() => {
            try {
                loadSpecialistsToday();
            } catch (error) {
                console.warn('Error refreshing specialists:', error);
            }
        }, 5 * 60 * 1000);

        console.log('App initialization completed successfully');
    } catch (error) {
        console.error('Error during app initialization:', error);
        hideGlobalLoader();
        showToast('Error loading application. Some features may not work.', 'error');
    }
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

// Animate Stat Counter
function animateStatCounter(element, targetValue) {
    if (typeof gsap === 'undefined') {
        element.textContent = targetValue;
        return;
    }

    try {
        gsap.fromTo(element,
            { textContent: 0 },
            {
                textContent: targetValue,
                duration: 1.5,
                ease: "power2.out",
                snap: { textContent: 1 },
                onUpdate: function() {
                    element.textContent = Math.round(this.targets()[0].textContent);
                }
            }
        );
    } catch (error) {
        console.warn('Animation error:', error);
        element.textContent = targetValue;
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
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping animations');
        return;
    }

    try {
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
    } catch (error) {
        console.warn('Animation error:', error);
    }
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
    console.log('Loading roster for:', monthYear);

    if (!monthYear) {
        console.error('No month/year selected');
        return;
    }

    const [year, month] = monthYear.split('-');

    try {
        showGlobalLoader();

        // Load roster data
        console.log(`Fetching roster data for ${year}/${month}`);
        const rosterResponse = await fetch(`/api/roster/${year}/${month}`);
        const rosterData = await rosterResponse.json();
        console.log('Roster response:', rosterData);

        // Use existing doctors data if available, otherwise load it
        if (!doctors || doctors.length === 0) {
            const doctorsResponse = await fetch('/api/doctors');
            const doctorsData = await doctorsResponse.json();
            if (doctorsData.success) {
                doctors = doctorsData.data;
            }
        }

        if (rosterData.success) {
            currentRoster = rosterData.data;

            // Fix missing doctorName by resolving doctorId to doctorName
            currentRoster = currentRoster.map(shift => {
                if (!shift.doctorName && shift.doctorId && doctors.length > 0) {
                    const doctor = doctors.find(d => d.id === shift.doctorId);
                    if (doctor) {
                        shift.doctorName = doctor.name;
                    } else {
                        // Fallback: create a generic name based on doctorId
                        shift.doctorName = `Dr. Unknown ${shift.doctorId}`;
                        console.warn('Doctor not found for ID:', shift.doctorId);
                    }
                } else if (!shift.doctorName) {
                    // Last resort fallback
                    shift.doctorName = 'Dr. Unknown';
                }
                return shift;
            });

            // Log successful name resolution
            const resolvedNames = currentRoster.map(s => s.doctorName).filter(Boolean);
            console.log('Resolved doctor names:', [...new Set(resolvedNames)]);

            console.log('Loaded roster data:', currentRoster.length, 'shifts');
            console.log('Fixed roster sample:', currentRoster[0]);

            // Update stats
            updateDashboardStats();

            // Render calendar
            renderCalendar(year, month);

            // Double-check calendar was populated after a short delay
            setTimeout(() => {
                const calendarContainer = document.getElementById('calendarContainer');
                if (calendarContainer && calendarContainer.children.length === 0) {
                    console.warn('Calendar appears empty, retrying...');
                    renderCalendar(year, month);
                }
            }, 500);

            showToast('Roster loaded successfully', 'success');
        } else {
            console.error('Failed to load roster:', rosterData.message);
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

    // Separate ER doctors from specialists
    const erDoctorShifts = currentRoster.filter(r => !isSpecialist(r.doctorName));
    const specialistShifts = currentRoster.filter(r => isSpecialist(r.doctorName));

    // Get unique ER doctors and specialists
    const uniqueERDoctors = [...new Set(erDoctorShifts.map(r => r.doctorName))];
    const uniqueSpecialists = [...new Set(specialistShifts.map(r => r.doctorName))];

    const activeERDoctors = uniqueERDoctors.length;
    const totalShifts = currentRoster.length;
    const erShifts = erDoctorShifts.length;
    const specialistOnCallShifts = specialistShifts.length;
    const referralDuties = currentRoster.filter(r => r.isReferralDuty).length;
    const avgWorkload = activeERDoctors > 0 ? Math.round(erShifts / activeERDoctors) : 0;

    // Update sidebar stats (ER doctors only)
    document.getElementById('activeDoctorsCount').textContent = activeERDoctors;
    document.getElementById('totalShiftsCount').textContent = erShifts;
    document.getElementById('avgWorkloadCount').textContent = avgWorkload;

    // Update main stats cards
    document.getElementById('totalShiftsDisplay').textContent = totalShifts; // All shifts including specialists
    document.getElementById('activeDoctorsDisplay').textContent = activeERDoctors; // ER doctors only
    document.getElementById('referralDutiesDisplay').textContent = referralDuties;
    document.getElementById('specialistsAvailableDisplay').textContent = uniqueSpecialists.length;

    // Update roster info
    const monthYear = document.getElementById('monthYear').value;
    const [year, month] = monthYear.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();

    document.getElementById('monthDays').textContent = daysInMonth;
    document.getElementById('totalShiftsInfo').textContent = totalShifts;
    document.getElementById('activeDoctorsInfo').textContent = activeERDoctors;

    console.log(`Stats Updated: ${activeERDoctors} ER Doctors, ${uniqueSpecialists.length} Specialists, ${totalShifts} Total Shifts`);
}

// Render Calendar
function renderCalendar(year, month) {
    console.log(`Rendering calendar for ${year}/${month}`);
    const calendarContainer = document.getElementById('calendarContainer');

    if (!calendarContainer) {
        console.error('Calendar container not found');
        return;
    }

    console.log('Calendar container found:', calendarContainer);

    if (!currentRoster || currentRoster.length === 0) {
        console.log('No roster data available');
        calendarContainer.innerHTML = '<div class="no-data-message">No roster data available. Click "Load Roster" to fetch data.</div>';
        return;
    }

    console.log('Rendering calendar with roster data:', currentRoster.length, 'shifts');
    console.log('Sample roster entry:', currentRoster[0]);
    console.log('Sample roster entry keys:', Object.keys(currentRoster[0]));
    console.log('Sample roster entry doctorName:', currentRoster[0].doctorName);
    console.log('Sample roster entry date:', currentRoster[0].date);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    console.log(`Days in month: ${daysInMonth}, Current roster entries: ${currentRoster.length}`);

    // Debug: Show sample roster data
    if (currentRoster.length > 0) {
        console.log('Sample roster entries:', currentRoster.slice(0, 3).map(r => ({
            doctor: r.doctorName,
            date: r.date,
            shift: r.shift,
            dateOnly: r.date.split('T')[0]
        })));
    }

    let calendarHTML = '';

    // Create calendar days with proper UTC date handling
    for (let day = 1; day <= daysInMonth; day++) {
        // Use UTC to avoid timezone offset issues
        const date = new Date(Date.UTC(year, month - 1, day));
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;

        // Debug date calculation for first few days
        if (day <= 3) {
            console.log(`Day ${day}: Date string: ${dateString}, Day name: ${dayName}, Weekend: ${isWeekend}`);
        }

        // Get shifts for this day - handle timezone offset
        const dayShifts = currentRoster.filter(r => {
            const shiftDate = new Date(r.date);
            const shiftDateString = `${shiftDate.getFullYear()}-${String(shiftDate.getMonth() + 1).padStart(2, '0')}-${String(shiftDate.getDate()).padStart(2, '0')}`;
            return shiftDateString === dateString;
        });

        // Debug logging for first few days
        if (day <= 3) {
            console.log(`Day ${day} (${dateString}):`, {
                totalShifts: dayShifts.length,
                shifts: dayShifts.map(s => ({ doctor: s.doctorName, shift: s.shift })),
                sampleRosterDates: currentRoster.slice(0, 5).map(r => r.date.split('T')[0])
            });
        }

        // Separate ER doctors from specialists
        const erShifts = dayShifts.filter(s => !isSpecialist(s.doctorName));
        const specialistShifts = dayShifts.filter(s => isSpecialist(s.doctorName));

        // Debug specialist filtering for first day
        if (day === 1) {
            console.log('Day 1 specialist filtering:');
            console.log('All day shifts:', dayShifts.map(s => s.doctorName));
            console.log('Specialists list:', specialists);
            console.log('ER shifts after filtering:', erShifts.map(s => s.doctorName));
            console.log('Specialist shifts after filtering:', specialistShifts.map(s => s.doctorName));
        }

        // Group ER shifts by type with validation
        const morningShifts = erShifts.filter(s => s && s.shift === 'morning' && s.doctorName);
        const eveningShifts = erShifts.filter(s => s && s.shift === 'evening' && s.doctorName);
        const nightShifts = erShifts.filter(s => s && s.shift === 'night' && s.doctorName);

        // Group specialist shifts by type with validation
        const specialistMorning = specialistShifts.filter(s => s && s.shift === 'morning' && s.doctorName);
        const specialistEvening = specialistShifts.filter(s => s && s.shift === 'evening' && s.doctorName);
        const specialistNight = specialistShifts.filter(s => s && s.shift === 'night' && s.doctorName);

        // Debug for first day
        if (day === 1) {
            console.log('Day 1 shifts:', dayShifts);
            console.log('Day 1 ER shifts:', erShifts);
            console.log('Day 1 morning shifts:', morningShifts);
            if (morningShifts.length > 0) {
                console.log('First morning shift structure:', morningShifts[0]);
                console.log('First morning shift keys:', Object.keys(morningShifts[0]));
            }
        }

        calendarHTML += `
            <div class="calendar-day ${isWeekend ? 'weekend' : ''}" onclick="showDayDetails('${dateString}', ${day}, '${dayName}')">
                <div class="day-header">
                    <div>
                        <div class="day-number">${day}</div>
                        <div class="day-name">${dayName}</div>
                    </div>
                    ${isWeekend ? '<div class="weekend-indicator">Weekend</div>' : ''}
                </div>

                <div class="shifts-container">
                    <!-- ER Doctor Shifts -->
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
                                <span>Night</span>
                                <div class="shift-count">${nightShifts.length}</div>
                            </div>
                            <div class="doctors-list">
                                ${nightShifts.map(shift => renderDoctorAvatar(shift, 'night')).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Specialists On-Call Section -->
                    ${specialistShifts.length > 0 ? `
                        <div class="specialists-section">
                            <div class="specialists-header">
                                <i class="fas fa-user-md"></i>
                                <span>Specialists On-Call</span>
                                <div class="shift-count">${specialistShifts.length}</div>
                            </div>
                            <div class="specialists-list">
                                ${specialistMorning.map(shift => renderDoctorAvatar(shift, 'morning')).join('')}
                                ${specialistEvening.map(shift => renderDoctorAvatar(shift, 'evening')).join('')}
                                ${specialistNight.map(shift => renderDoctorAvatar(shift, 'night')).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    calendarContainer.innerHTML = calendarHTML;
    console.log('Calendar HTML set, length:', calendarHTML.length);
    console.log('First 500 chars of HTML:', calendarHTML.substring(0, 500));
}

// Specialists list
const specialists = ['Dr. Fathi', 'Dr. Joseph', 'Dr. Mahasen'];

// Check if doctor is a specialist
function isSpecialist(doctorName) {
    return specialists.includes(doctorName);
}

// Render Doctor Avatar
function renderDoctorAvatar(shift, shiftType) {
    // Robust safety checks
    if (!shift || typeof shift !== 'object') {
        console.warn('Invalid shift object:', shift);
        return '';
    }

    if (!shift.doctorName || typeof shift.doctorName !== 'string') {
        console.warn('Invalid doctorName in shift:', shift);
        return '';
    }

    try {
        const doctor = doctors.find(d => d && d.name === shift.doctorName);
        const doctorName = shift.doctorName;
        const initials = doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('');
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f5a0', '#ffc947', '#ff6b6b', '#9d4edd'];
        const colorIndex = (shift.doctorId || 0) % colors.length;
        const shiftTime = getShiftTime(shiftType);
        const doctorType = isSpecialist(doctorName) ? 'Specialist (On-Call)' : 'ER Doctor';
        const doctorInfo = doctor ? `${doctorName}\n${doctorType}\n${doctor.specialization}\n${doctor.phone}` : `${doctorName}\n${doctorType}`;

        // Different styling for specialists
        const specialistClass = isSpecialist(doctorName) ? 'specialist-avatar' : '';
        const specialistBadge = isSpecialist(doctorName) ? '<div class="specialist-badge" title="Specialist On-Call">S</div>' : '';

        return `
            <div class="doctor-avatar ${shiftType} ${specialistClass}"
                 title="${doctorInfo}\nShift: ${shiftTime}${shift.isReferralDuty ? '\n🚨 Referral Duty' : ''}"
                 onclick="event.stopPropagation(); showDoctorDetails('${doctorName}', '${shiftType}', ${shift.isReferralDuty || false})">
                <div class="avatar-circle" style="background: ${colors[colorIndex]};">
                    ${initials}
                </div>
                <div class="doctor-name">${doctorName.replace('Dr. ', '')}</div>
                ${shift.isReferralDuty ? '<div class="referral-badge" title="Referral Duty">R</div>' : ''}
                ${specialistBadge}
            </div>
        `;
    } catch (error) {
        console.error('Error rendering doctor avatar:', error, shift);
        return '';
    }
}

// Get Shift Time
function getShiftTime(shiftType) {
    switch(shiftType) {
        case 'morning': return '7AM - 3PM';
        case 'evening': return '3PM - 11PM';
        case 'night': return '11PM - 7AM';
        default: return '';
    }
}

// Set Default Month
function setDefaultMonth() {
    const monthInput = document.getElementById('monthYear');
    if (monthInput) {
        // Set to July 2025 where we have the latest data
        monthInput.value = '2025-07';
        console.log('Default month set to July 2025');
    }
}

// Load Doctors
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors');
        const data = await response.json();

        if (data.success) {
            doctors = data.data;
            console.log('Doctors loaded:', doctors.length);
        } else {
            console.error('Failed to load doctors:', data.message);
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Update Quick Stats
function updateQuickStats() {
    // This function can be enhanced later
    console.log('Quick stats updated');
}

// Utility Functions
function showGlobalLoader() {
    console.log('Loading...');
}

function hideGlobalLoader() {
    console.log('Loading complete');
}

function showToast(message, type) {
    console.log(`${type.toUpperCase()}: ${message}`);

    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Load Theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        setDarkMode();
    } else {
        setLightMode();
    }
}

// Toggle Theme
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        setLightMode();
    } else {
        setDarkMode();
    }
}

// Quick Action Functions
async function showConsults() {
    try {
        const modal = document.getElementById('consultationModal');
        const modalBody = document.getElementById('consultationModalBody');

        // Show modal with loading state
        modalBody.innerHTML = `
            <div class="modal-loading">
                <div class="loading-spinner"></div>
                Loading consultations...
            </div>
        `;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        // Fetch data
        const consultationsResponse = await fetch('/api/consultations');
        const consultations = await consultationsResponse.json();

        // Use the global doctors variable that's already loaded
        const doctorsData = doctors; // Use the global doctors variable
        console.log('Doctors data for consultations:', doctorsData);
        console.log('Is doctors array?', Array.isArray(doctorsData));

        // Store globally for tab switching
        globalConsultations = consultations;
        globalDoctors = doctorsData;

        // Render consultation interface
        renderConsultationModal(consultations, doctorsData);

    } catch (error) {
        console.error('Error loading consultations:', error);
        showToast('Failed to load consultations', 'error');
        closeConsultationModal();
    }
}

async function showReferrals() {
    try {
        const modal = document.getElementById('referralModal');
        const modalBody = document.getElementById('referralModalBody');

        // Show modal with loading state
        modalBody.innerHTML = `
            <div class="modal-loading">
                <div class="loading-spinner"></div>
                Loading referrals...
            </div>
        `;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        // Fetch data
        const referralsResponse = await fetch('/api/referrals');
        const referrals = await referralsResponse.json();

        // Use the global doctors variable that's already loaded
        const doctorsData = doctors; // Use the global doctors variable

        // Store globally for tab switching
        globalReferrals = referrals;
        globalDoctors = doctorsData;

        // Render referral interface
        renderReferralModal(referrals, doctorsData);

    } catch (error) {
        console.error('Error loading referrals:', error);
        showToast('Failed to load referrals', 'error');
        closeReferralModal();
    }
}

async function showConsultationLog() {
    try {
        const modal = document.getElementById('consultationLogModal');
        const modalBody = document.getElementById('consultationLogModalBody');

        // Show modal with loading state
        modalBody.innerHTML = `
            <div class="modal-loading">
                <div class="loading-spinner"></div>
                Loading consultation logs...
            </div>
        `;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        // Fetch data
        const [logsResponse, doctorsResponse] = await Promise.all([
            fetch('/api/consultation-logs'),
            fetch('/api/doctors')
        ]);

        const logs = await logsResponse.json();
        const doctorsData = await doctorsResponse.json();

        // Store globally for operations
        globalConsultationLogs = logs;
        globalDoctors = doctorsData.success ? doctorsData.data : doctorsData;

        // Render consultation log interface
        renderConsultationLogModal(logs, globalDoctors);

    } catch (error) {
        console.error('Error loading consultation logs:', error);
        showToast('Failed to load consultation logs', 'error');
        closeConsultationLogModal();
    }
}

function showLogReferral() {
    // This will open the referrals modal and automatically show the new referral form
    showReferrals().then(() => {
        // Auto-open the new referral form
        setTimeout(() => {
            const addBtn = document.querySelector('.add-referral-btn');
            if (addBtn) addBtn.click();
        }, 500);
    });
}

async function showSaudiCrescent() {
    try {
        const modal = document.getElementById('saudiCrescentModal');
        const modalBody = document.getElementById('saudiCrescentModalBody');

        // Show modal with loading state
        modalBody.innerHTML = `
            <div class="modal-loading">
                <div class="loading-spinner"></div>
                Loading Saudi Red Crescent records...
            </div>
        `;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        // Fetch data
        const [recordsResponse, doctorsResponse, unitsResponse] = await Promise.all([
            fetch('/api/saudi-crescent'),
            fetch('/api/doctors'),
            fetch('/api/saudi-crescent/units/list')
        ]);

        const records = await recordsResponse.json();
        const doctorsData = await doctorsResponse.json();
        const ambulanceUnits = await unitsResponse.json();

        // Store globally for operations
        globalSaudiCrescentRecords = records;
        globalDoctors = doctorsData.success ? doctorsData.data : doctorsData;
        globalAmbulanceUnits = ambulanceUnits;

        // Render Saudi Red Crescent interface
        renderSaudiCrescentModal(records, globalDoctors, ambulanceUnits);

    } catch (error) {
        console.error('Error loading Saudi Red Crescent records:', error);
        showToast('Failed to load Saudi Red Crescent records', 'error');
        closeSaudiCrescentModal();
    }
}

// License Center, Data Importer, and Export Hub functions are now defined in their respective modules
// openLicenseCenter() - defined in licenseCenter.js
// openDataImporter() - defined in dataImporter.js
// openExportHub() - defined in exportHub.js

// Global Search
function handleGlobalSearch(event) {
    const query = event.target.value.toLowerCase();
    console.log('Searching for:', query);
}

// Command Palette
function openCommandPalette() {
    console.log('Opening command palette...');
}

// Ripple Effect
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Show Day Details
function showDayDetails(dateString, dayNumber, dayName) {
    const dayShifts = currentRoster.filter(r =>
        r.date.split('T')[0] === dateString
    );

    if (dayShifts.length === 0) {
        showToast('No shifts scheduled for this day', 'info');
        return;
    }

    // Group shifts by type
    const morningShifts = dayShifts.filter(s => s.shift === 'morning');
    const eveningShifts = dayShifts.filter(s => s.shift === 'evening');
    const nightShifts = dayShifts.filter(s => s.shift === 'night');

    const modalContent = `
        <div class="day-details">
            <h4>📅 ${dayName}, ${dayNumber}</h4>
            <p class="text-muted mb-4">${new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</p>

            ${morningShifts.length > 0 ? `
                <div class="shift-details-section">
                    <h5 class="shift-title">
                        <i class="fas fa-sun text-success"></i>
                        Morning Shift (7AM - 3PM)
                        <span class="badge bg-success ms-2">${morningShifts.length}</span>
                    </h5>
                    <div class="doctors-detail-list">
                        ${morningShifts.map(shift => renderDoctorDetailCard(shift)).join('')}
                    </div>
                </div>
            ` : ''}

            ${eveningShifts.length > 0 ? `
                <div class="shift-details-section">
                    <h5 class="shift-title">
                        <i class="fas fa-cloud-sun text-warning"></i>
                        Evening Shift (3PM - 11PM)
                        <span class="badge bg-warning ms-2">${eveningShifts.length}</span>
                    </h5>
                    <div class="doctors-detail-list">
                        ${eveningShifts.map(shift => renderDoctorDetailCard(shift)).join('')}
                    </div>
                </div>
            ` : ''}

            ${nightShifts.length > 0 ? `
                <div class="shift-details-section">
                    <h5 class="shift-title">
                        <i class="fas fa-moon text-info"></i>
                        Night Shift (11PM - 7AM)
                        <span class="badge bg-info ms-2">${nightShifts.length}</span>
                    </h5>
                    <div class="doctors-detail-list">
                        ${nightShifts.map(shift => renderDoctorDetailCard(shift)).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="summary-footer">
                <strong>Total Staff: ${dayShifts.length}</strong><br>
                <small class="text-muted">
                    Referral Duties: ${dayShifts.filter(s => s.isReferralDuty).length}
                </small>
            </div>
        </div>
    `;

    showModal(`Day Schedule - ${dayName} ${dayNumber}`, modalContent);
}

// Render Doctor Detail Card
function renderDoctorDetailCard(shift) {
    const doctor = doctors.find(d => d.name === shift.doctorName);
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f5a0', '#ffc947', '#ff6b6b', '#9d4edd'];
    const colorIndex = shift.doctorId % colors.length;
    const initials = shift.doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('');

    return `
        <div class="doctor-detail-card">
            <div class="doctor-avatar-large">
                <div class="avatar-circle-large" style="background: ${colors[colorIndex]};">
                    ${initials}
                </div>
            </div>
            <div class="doctor-info-detailed">
                <h6 class="doctor-name-full">${shift.doctorName}</h6>
                <div class="doctor-specialization">${doctor ? doctor.specialization : 'Emergency Medicine'}</div>
                <div class="doctor-contact">${doctor ? doctor.phone : 'Contact not available'}</div>
                ${shift.isReferralDuty ? '<div class="referral-duty-badge">🚨 Referral Duty</div>' : ''}
            </div>
        </div>
    `;
}

// Show Doctor Details
function showDoctorDetails(doctorName, shiftType, isReferralDuty) {
    const doctor = doctors.find(d => d.name === doctorName);
    const shiftTime = getShiftTime(shiftType);

    const modalContent = `
        <div class="doctor-profile">
            <div class="doctor-header">
                <div class="doctor-avatar-profile">
                    <div class="avatar-circle-profile">
                        ${doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                    </div>
                </div>
                <div class="doctor-info-profile">
                    <h4>${doctorName}</h4>
                    <p class="specialization">${doctor ? doctor.specialization : 'Emergency Medicine'}</p>
                    <p class="contact-info">📞 ${doctor ? doctor.phone : 'Contact not available'}</p>
                </div>
            </div>

            <div class="current-shift-info">
                <h5>Current Shift Information</h5>
                <div class="shift-badge ${shiftType}">
                    <i class="fas fa-${shiftType === 'morning' ? 'sun' : shiftType === 'evening' ? 'cloud-sun' : 'moon'}"></i>
                    ${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)} Shift (${shiftTime})
                </div>
                ${isReferralDuty ? '<div class="referral-duty-alert">🚨 Currently on Referral Duty</div>' : ''}
            </div>

            ${doctor ? `
                <div class="doctor-details">
                    <h5>Contact Information</h5>
                    <div class="contact-grid">
                        <div class="contact-item">
                            <strong>Email:</strong> ${doctor.email}
                        </div>
                        <div class="contact-item">
                            <strong>Phone:</strong> ${doctor.phone}
                        </div>
                        <div class="contact-item">
                            <strong>Status:</strong>
                            <span class="status-badge ${doctor.isAvailable ? 'available' : 'unavailable'}">
                                ${doctor.isAvailable ? '✅ Available' : '❌ Unavailable'}
                            </span>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    showModal(`Doctor Profile - ${doctorName}`, modalContent);
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearch').focus();
        }

        // Cmd/Ctrl + D for dark mode toggle
        if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }

        // Escape key to close modals
        if (e.key === 'Escape') {
            closeConsultationModal();
            closeReferralModal();
            closeConsultationLogModal();
            closeSaudiCrescentModal();
        }
    });
}

// Modal Management Functions
function closeConsultationModal() {
    const modal = document.getElementById('consultationModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function closeReferralModal() {
    const modal = document.getElementById('referralModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function closeConsultationLogModal() {
    const modal = document.getElementById('consultationLogModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function closeSaudiCrescentModal() {
    const modal = document.getElementById('saudiCrescentModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Click outside modal to close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeConsultationModal();
        closeReferralModal();
        closeConsultationLogModal();
        closeSaudiCrescentModal();
    }
});

// Consultation Modal Rendering
function renderConsultationModal(consultations, doctors) {
    const modalBody = document.getElementById('consultationModalBody');

    const activeConsultations = consultations.filter(c => ['pending', 'accepted'].includes(c.status));
    const completedConsultations = consultations.filter(c => c.status === 'completed');

    modalBody.innerHTML = `
        <div class="consultation-tabs">
            <button class="tab-btn active" onclick="switchConsultationTab('active')">
                <i class="fas fa-clock"></i>
                Active (${activeConsultations.length})
            </button>
            <button class="tab-btn" onclick="switchConsultationTab('completed')">
                <i class="fas fa-check-circle"></i>
                Completed (${completedConsultations.length})
            </button>
            <button class="tab-btn" onclick="switchConsultationTab('all')">
                <i class="fas fa-list"></i>
                All (${consultations.length})
            </button>
        </div>

        <div class="consultation-actions">
            <button class="add-consultation-btn" onclick="showNewConsultationForm()">
                <i class="fas fa-plus"></i>
                New Consultation
            </button>
        </div>

        <div id="newConsultationForm" class="new-consultation-form glass-card" style="display: none;">
            ${renderNewConsultationForm(doctors)}
        </div>

        <div id="consultationsList" class="consultations-list">
            ${renderConsultationsList(activeConsultations, doctors)}
        </div>
    `;
}

// Referral Modal Rendering
function renderReferralModal(referrals, doctors) {
    const modalBody = document.getElementById('referralModalBody');

    const activeReferrals = referrals.filter(r => ['pending', 'in-transit'].includes(r.status));
    const completedReferrals = referrals.filter(r => r.status === 'completed');
    const stats = calculateReferralStats(referrals, doctors);

    modalBody.innerHTML = `
        <div class="referral-tabs">
            <button class="tab-btn active" onclick="switchReferralTab('statistics')">
                <i class="fas fa-chart-bar"></i>
                Statistics
            </button>
            <button class="tab-btn" onclick="switchReferralTab('active')">
                <i class="fas fa-clock"></i>
                Active (${activeReferrals.length})
            </button>
            <button class="tab-btn" onclick="switchReferralTab('completed')">
                <i class="fas fa-check-circle"></i>
                Completed (${completedReferrals.length})
            </button>
            <button class="tab-btn" onclick="switchReferralTab('all')">
                <i class="fas fa-list"></i>
                All (${referrals.length})
            </button>
        </div>

        <div id="referralContent">
            ${renderReferralStatistics(stats)}
        </div>
    `;
}

// Store data globally for tab switching
let globalConsultations = [];
let globalReferrals = [];
let globalDoctors = [];
let globalConsultationLogs = [];
let globalSaudiCrescentRecords = [];
let globalAmbulanceUnits = [];

// Helper Functions
function getERDoctorName(doctorId) {
    if (!globalDoctors || !Array.isArray(globalDoctors)) {
        return 'Unknown Doctor';
    }
    const doctor = globalDoctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
}

function formatTime(timeString) {
    return new Date(timeString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderNewConsultationForm(doctors) {
    // All doctors in the system are ER doctors (Emergency Medicine specialization)
    const erDoctors = doctors || [];
    const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Surgery', 'Psychiatry', 'Radiology', 'Pathology', 'Anesthesiology', 'Dermatology', 'Ophthalmology'];

    return `
        <h3>Request New Consultation</h3>
        <form onsubmit="submitNewConsultation(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Patient ID</label>
                    <input type="text" name="patientId" placeholder="Enter patient ID" required>
                </div>
                <div class="form-group">
                    <label>ER Doctor</label>
                    <select name="erDoctorId" required>
                        <option value="">Select ER Doctor</option>
                        ${erDoctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Specialty</label>
                    <select name="specialty" required>
                        <option value="">Select Specialty</option>
                        ${specialties.map(specialty => `<option value="${specialty}">${specialty}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Urgency</label>
                    <select name="urgency">
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Clinical Notes</label>
                <textarea name="notes" placeholder="Enter clinical details and reason for consultation" rows="3"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="submit-btn">
                    <i class="fas fa-paper-plane"></i>
                    Send Consultation Request
                </button>
                <button type="button" class="cancel-btn" onclick="hideNewConsultationForm()">
                    Cancel
                </button>
            </div>
        </form>
    `;
}

function renderConsultationsList(consultations, doctors) {
    if (consultations.length === 0) {
        return '<div class="empty-state">No consultations found</div>';
    }

    return consultations.map(consultation => `
        <div class="consultation-item glass-card">
            <div class="consultation-header">
                <div class="consultation-info">
                    <div class="patient-id">Patient: ${consultation.patientId}</div>
                    <div class="specialty-badge" style="background-color: ${getStatusColor(consultation.status)}">
                        ${consultation.specialty}
                    </div>
                    <div class="urgency-badge urgency-${consultation.urgency}">
                        ${consultation.urgency.toUpperCase()}
                    </div>
                </div>
                <div class="consultation-status">
                    <span class="status-badge status-${consultation.status}">
                        ${consultation.status.toUpperCase()}
                    </span>
                </div>
            </div>
            <div class="consultation-details">
                <div class="detail-row">
                    <span class="label">ER Doctor:</span>
                    <span class="value">${getERDoctorName(consultation.erDoctorId)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Requested:</span>
                    <span class="value">${formatTime(consultation.requestTime)}</span>
                </div>
                ${consultation.responseTime ? `
                    <div class="detail-row">
                        <span class="label">Response:</span>
                        <span class="value">${formatTime(consultation.responseTime)}</span>
                    </div>
                ` : ''}
                ${consultation.notes ? `
                    <div class="detail-row">
                        <span class="label">Notes:</span>
                        <span class="value">${consultation.notes}</span>
                    </div>
                ` : ''}
            </div>
            ${renderConsultationActions(consultation)}
        </div>
    `).join('');
}

function renderConsultationActions(consultation) {
    if (consultation.status === 'pending') {
        return `
            <div class="consultation-actions">
                <button class="action-btn accept-btn" onclick="updateConsultationStatus(${consultation.id}, 'accepted')">
                    <i class="fas fa-check"></i>
                    Accept
                </button>
                <button class="action-btn decline-btn" onclick="updateConsultationStatus(${consultation.id}, 'declined')">
                    <i class="fas fa-times"></i>
                    Decline
                </button>
            </div>
        `;
    } else if (consultation.status === 'accepted') {
        return `
            <div class="consultation-actions">
                <button class="action-btn complete-btn" onclick="updateConsultationStatus(${consultation.id}, 'completed')">
                    <i class="fas fa-check-circle"></i>
                    Mark Complete
                </button>
            </div>
        `;
    }
    return '';
}

function getStatusColor(status) {
    const colors = {
        pending: '#f59e0b',
        accepted: '#3b82f6',
        completed: '#10b981',
        declined: '#ef4444'
    };
    return colors[status] || '#6b7280';
}

// Referral Helper Functions
function calculateReferralStats(referrals, doctors) {
    const total = referrals.length;
    const emergency = referrals.filter(r => r.referralType === 'emergency').length;
    const lifeSaving = referrals.filter(r => r.referralType === 'life-saving').length;

    const doctorBreakdown = {};
    referrals.forEach(referral => {
        const doctorName = getERDoctorName(referral.erDoctorId);
        if (!doctorBreakdown[doctorName]) {
            doctorBreakdown[doctorName] = { total: 0, emergency: 0, lifeSaving: 0 };
        }
        doctorBreakdown[doctorName].total++;
        if (referral.referralType === 'emergency') doctorBreakdown[doctorName].emergency++;
        if (referral.referralType === 'life-saving') doctorBreakdown[doctorName].lifeSaving++;
    });

    return { total, emergency, lifeSaving, doctorBreakdown };
}

function renderReferralStatistics(stats) {
    return `
        <div class="referral-statistics">
            <div class="stats-grid">
                <div class="stat-card emergency-card">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.emergency}</div>
                        <div class="stat-label">Emergency Referrals</div>
                    </div>
                </div>
                <div class="stat-card life-saving-card">
                    <div class="stat-icon">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.lifeSaving}</div>
                        <div class="stat-label">Life-Saving Referrals</div>
                    </div>
                </div>
                <div class="stat-card total-card">
                    <div class="stat-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.total}</div>
                        <div class="stat-label">Total Referrals</div>
                    </div>
                </div>
            </div>

            <div class="doctor-breakdown glass-card">
                <h3>Doctor-wise Referral Breakdown</h3>
                <div class="breakdown-table">
                    <div class="table-header">
                        <div>Doctor</div>
                        <div>Total Referrals</div>
                        <div>Emergency</div>
                        <div>Life-Saving</div>
                        <div>Emergency %</div>
                        <div>Life-Saving %</div>
                    </div>
                    ${Object.entries(stats.doctorBreakdown).map(([doctorName, data]) => {
                        const emergencyPercent = data.total > 0 ? Math.round((data.emergency / data.total) * 100) : 0;
                        const lifeSavingPercent = data.total > 0 ? Math.round((data.lifeSaving / data.total) * 100) : 0;

                        return `
                            <div class="table-row">
                                <div class="doctor-name">${doctorName}</div>
                                <div class="total-referrals">${data.total}</div>
                                <div class="emergency-count">${data.emergency}</div>
                                <div class="life-saving-count">${data.lifeSaving}</div>
                                <div class="emergency-percent">${emergencyPercent}%</div>
                                <div class="life-saving-percent">${lifeSavingPercent}%</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// Interactive Functions
function showNewConsultationForm() {
    const form = document.getElementById('newConsultationForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function hideNewConsultationForm() {
    document.getElementById('newConsultationForm').style.display = 'none';
}

async function submitNewConsultation(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const consultationData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/consultations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consultationData)
        });

        if (response.ok) {
            showToast('Consultation request submitted successfully', 'success');
            hideNewConsultationForm();
            // Refresh the consultations
            showConsults();
        } else {
            throw new Error('Failed to submit consultation');
        }
    } catch (error) {
        console.error('Error submitting consultation:', error);
        showToast('Failed to submit consultation request', 'error');
    }
}

async function updateConsultationStatus(consultationId, newStatus) {
    try {
        const response = await fetch(`/api/consultations/${consultationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showToast(`Consultation ${newStatus} successfully`, 'success');
            // Refresh the consultations
            showConsults();
        } else {
            throw new Error('Failed to update consultation');
        }
    } catch (error) {
        console.error('Error updating consultation:', error);
        showToast('Failed to update consultation status', 'error');
    }
}

function switchConsultationTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.consultation-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and display consultations
    let filteredConsultations;
    switch (tabName) {
        case 'active':
            filteredConsultations = globalConsultations.filter(c => ['pending', 'accepted'].includes(c.status));
            break;
        case 'completed':
            filteredConsultations = globalConsultations.filter(c => c.status === 'completed');
            break;
        case 'all':
        default:
            filteredConsultations = globalConsultations;
            break;
    }

    document.getElementById('consultationsList').innerHTML = renderConsultationsList(filteredConsultations, globalDoctors);
}

function switchReferralTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.referral-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const contentDiv = document.getElementById('referralContent');

    switch (tabName) {
        case 'statistics':
            const stats = calculateReferralStats(globalReferrals, globalDoctors);
            contentDiv.innerHTML = renderReferralStatistics(stats);
            break;
        case 'active':
            const activeReferrals = globalReferrals.filter(r => ['pending', 'in-transit'].includes(r.status));
            contentDiv.innerHTML = `
                <div class="referral-actions">
                    <button class="add-referral-btn" onclick="showNewReferralForm()">
                        <i class="fas fa-plus"></i>
                        New Referral
                    </button>
                </div>
                <div id="newReferralForm" class="new-referral-form glass-card" style="display: none;">
                    ${renderNewReferralForm(globalDoctors)}
                </div>
                <div class="referrals-list">
                    ${renderReferralsList(activeReferrals, globalDoctors)}
                </div>
            `;
            break;
        case 'completed':
            const completedReferrals = globalReferrals.filter(r => r.status === 'completed');
            contentDiv.innerHTML = `
                <div class="referrals-list">
                    ${renderReferralsList(completedReferrals, globalDoctors)}
                </div>
            `;
            break;
        case 'all':
            contentDiv.innerHTML = `
                <div class="referral-actions">
                    <button class="add-referral-btn" onclick="showNewReferralForm()">
                        <i class="fas fa-plus"></i>
                        New Referral
                    </button>
                </div>
                <div id="newReferralForm" class="new-referral-form glass-card" style="display: none;">
                    ${renderNewReferralForm(globalDoctors)}
                </div>
                <div class="referrals-list">
                    ${renderReferralsList(globalReferrals, globalDoctors)}
                </div>
            `;
            break;
    }
}

function renderNewReferralForm(doctors) {
    // All doctors in the system are ER doctors (Emergency Medicine specialization)
    const erDoctors = doctors || [];
    const destinations = [
        'King Faisal Specialist Hospital',
        'National Guard Hospital',
        'King Khalid University Hospital',
        'Riyadh Care Hospital',
        'King Saud Medical City',
        'Prince Sultan Military Medical City',
        'King Abdulaziz Medical City'
    ];

    return `
        <h3>Log New Referral</h3>
        <form onsubmit="submitNewReferral(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Patient ID</label>
                    <input type="text" name="patientId" placeholder="Enter patient ID" required>
                </div>
                <div class="form-group">
                    <label>ER Doctor</label>
                    <select name="erDoctorId" required>
                        <option value="">Select ER Doctor</option>
                        ${erDoctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Referral Type</label>
                    <select name="referralType">
                        <option value="emergency">Emergency</option>
                        <option value="life-saving">Life-Saving</option>
                        <option value="routine">Routine</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Urgency</label>
                    <select name="urgency">
                        <option value="immediate">Immediate</option>
                        <option value="urgent">Urgent</option>
                        <option value="routine">Routine</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Destination Hospital</label>
                <select name="destination" required>
                    <option value="">Select Destination</option>
                    ${destinations.map(dest => `<option value="${dest}">${dest}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Clinical Notes</label>
                <textarea name="notes" placeholder="Enter clinical details and reason for referral" rows="3"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="submit-btn">
                    <i class="fas fa-ambulance"></i>
                    Log Referral
                </button>
                <button type="button" class="cancel-btn" onclick="hideNewReferralForm()">
                    Cancel
                </button>
            </div>
        </form>
    `;
}

function renderReferralsList(referrals, doctors) {
    if (referrals.length === 0) {
        return '<div class="empty-state">No referrals found</div>';
    }

    return referrals.map(referral => `
        <div class="referral-item glass-card">
            <div class="referral-header">
                <div class="referral-info">
                    <div class="patient-id">Patient: ${referral.patientId}</div>
                    <div class="type-badge" style="background-color: ${getReferralTypeColor(referral.referralType)}">
                        <i class="${getReferralTypeIcon(referral.referralType)}"></i>
                        ${referral.referralType.replace('-', ' ').toUpperCase()}
                    </div>
                    <div class="urgency-badge urgency-${referral.urgency}">
                        ${referral.urgency.toUpperCase()}
                    </div>
                </div>
                <div class="referral-status">
                    <span class="status-badge status-${referral.status}">
                        ${referral.status.toUpperCase().replace('-', ' ')}
                    </span>
                </div>
            </div>
            <div class="referral-details">
                <div class="detail-row">
                    <span class="label">ER Doctor:</span>
                    <span class="value">${getERDoctorName(referral.erDoctorId)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Destination:</span>
                    <span class="value">${referral.destination}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Referral Time:</span>
                    <span class="value">${formatTime(referral.referralTime)}</span>
                </div>
                ${referral.notes ? `
                    <div class="detail-row">
                        <span class="label">Notes:</span>
                        <span class="value">${referral.notes}</span>
                    </div>
                ` : ''}
                ${referral.outcome ? `
                    <div class="detail-row">
                        <span class="label">Outcome:</span>
                        <span class="value">${referral.outcome}</span>
                    </div>
                ` : ''}
            </div>
            ${renderReferralActions(referral)}
        </div>
    `).join('');
}

function getReferralTypeColor(type) {
    const colors = {
        'emergency': '#ef4444',
        'life-saving': '#dc2626',
        'routine': '#10b981'
    };
    return colors[type] || '#6b7280';
}

function getReferralTypeIcon(type) {
    const icons = {
        'emergency': 'fas fa-exclamation-triangle',
        'life-saving': 'fas fa-heartbeat',
        'routine': 'fas fa-clipboard-list'
    };
    return icons[type] || 'fas fa-clipboard-list';
}

function renderReferralActions(referral) {
    if (['pending', 'in-transit'].includes(referral.status)) {
        let actions = '';
        if (referral.status === 'pending') {
            actions += `
                <button class="action-btn transit-btn" onclick="updateReferralStatus(${referral.id}, 'in-transit')">
                    <i class="fas fa-truck"></i>
                    Mark In Transit
                </button>
            `;
        }
        if (referral.status === 'in-transit') {
            actions += `
                <button class="action-btn complete-btn" onclick="updateReferralStatus(${referral.id}, 'completed')">
                    <i class="fas fa-check-circle"></i>
                    Mark Complete
                </button>
            `;
        }
        actions += `
            <button class="action-btn cancel-btn" onclick="updateReferralStatus(${referral.id}, 'cancelled')">
                <i class="fas fa-times"></i>
                Cancel
            </button>
        `;
        return `<div class="referral-actions">${actions}</div>`;
    }
    return '';
}

// Referral Interactive Functions
function showNewReferralForm() {
    const form = document.getElementById('newReferralForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function hideNewReferralForm() {
    document.getElementById('newReferralForm').style.display = 'none';
}

async function submitNewReferral(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const referralData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(referralData)
        });

        if (response.ok) {
            showToast('Referral logged successfully', 'success');
            hideNewReferralForm();
            // Refresh the referrals
            showReferrals();
        } else {
            throw new Error('Failed to log referral');
        }
    } catch (error) {
        console.error('Error logging referral:', error);
        showToast('Failed to log referral', 'error');
    }
}

async function updateReferralStatus(referralId, newStatus) {
    try {
        const response = await fetch(`/api/referrals/${referralId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showToast(`Referral ${newStatus.replace('-', ' ')} successfully`, 'success');
            // Refresh the referrals
            showReferrals();
        } else {
            throw new Error('Failed to update referral');
        }
    } catch (error) {
        console.error('Error updating referral:', error);
        showToast('Failed to update referral status', 'error');
    }
}

// Consultation Log Functions
function renderConsultationLogModal(logs, doctors) {
    const modalBody = document.getElementById('consultationLogModalBody');

    const shifts = [
        { value: 'morning', label: 'Morning (7:00 AM - 3:00 PM)' },
        { value: 'evening', label: 'Evening (3:00 PM - 11:00 PM)' },
        { value: 'night', label: 'Night (11:00 PM - 7:00 AM)' }
    ];

    const outcomes = [
        { value: 'admitted', label: 'Admitted' },
        { value: 'dama', label: 'Patient discharge against medical advice (DAMA)' },
        { value: 'discharged_ama', label: 'Discharged against medical advice' },
        { value: 'patient_referred', label: 'Patient referred' },
        { value: 'other', label: 'Other' }
    ];

    const specialistsList = [
        { id: 'fathi', name: 'Dr. Fathi', specialty: 'Internal Medicine' },
        { id: 'joseph', name: 'Dr. Joseph', specialty: 'Orthopedics' },
        { id: 'mahasen', name: 'Dr. Mahasen', specialty: 'ENT' },
        { id: 'mahmoud', name: 'Dr. Mahmoud', specialty: 'Orthopedics' },
        { id: 'mammoun', name: 'Dr. Mammoun', specialty: 'General Surgery' },
        { id: 'renaldo', name: 'Dr. Renaldo', specialty: 'General Surgery' },
        { id: 'yanelis', name: 'Dr. Yanelis', specialty: 'Ophthalmology' },
        { id: 'asma', name: 'Dr. Asma', specialty: 'Obstetrics & Gynaecology' },
        { id: 'abdulhakim', name: 'Dr. Abdulhakim', specialty: 'Pediatrics' },
        { id: 'badawy_mahmoud', name: 'Dr. Badawy Mahmoud', specialty: 'Paediatrics' },
        { id: 'badawy', name: 'Dr. Badawy', specialty: 'Dentist' }
    ];

    modalBody.innerHTML = `
        <!-- Action Buttons -->
        <div class="action-buttons">
            <button class="action-btn add-btn" onclick="addNewConsultationLogRow()">
                <i class="fas fa-plus"></i>
                Add Row
            </button>
            <button class="action-btn save-btn" onclick="saveConsultationLog()">
                <i class="fas fa-save"></i>
                Save
            </button>
            <button class="action-btn clear-btn" onclick="clearConsultationLogForm()">
                <i class="fas fa-eraser"></i>
                Clear Form
            </button>
            <button class="action-btn export-btn" onclick="exportConsultationLog('csv')">
                <i class="fas fa-file-csv"></i>
                CSV
            </button>
            <button class="action-btn export-btn" onclick="exportConsultationLog('pdf')">
                <i class="fas fa-file-pdf"></i>
                PDF
            </button>
        </div>

        <!-- Form Fields -->
        <div class="consultation-form glass-card">
            <div class="form-grid">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="logDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>

                <div class="form-group">
                    <label>Shift</label>
                    <select id="logShift" required>
                        <option value="">Select Shift</option>
                        ${shifts.map(shift => `<option value="${shift.value}">${shift.label}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>ER Doctor</label>
                    <select id="logERDoctor" required>
                        <option value="">Select ER Doctor</option>
                        ${doctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Time Called</label>
                    <input type="time" id="logTimeCalled" required>
                </div>

                <div class="form-group">
                    <label>Specialist</label>
                    <select id="logSpecialist" onchange="updateSpecialty()" required>
                        <option value="">Select Specialist</option>
                        ${specialistsList.map(specialist => `<option value="${specialist.id}" data-specialty="${specialist.specialty}">${specialist.name}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Specialty</label>
                    <input type="text" id="logSpecialty" readonly class="readonly-field" placeholder="Auto-populated">
                </div>

                <div class="form-group">
                    <label>Arrival Time</label>
                    <input type="time" id="logArrivalTime" onchange="calculateResponseTime()">
                </div>

                <div class="form-group">
                    <label>Response Time</label>
                    <input type="text" id="logResponseTime" readonly class="readonly-field" placeholder="Auto-calculated">
                </div>

                <div class="form-group">
                    <label>Patient ID</label>
                    <input type="text" id="logPatientId" placeholder="Patient ID" required>
                </div>

                <div class="form-group">
                    <label>Outcome</label>
                    <select id="logOutcome" onchange="toggleOtherOutcome()" required>
                        <option value="">Select</option>
                        ${outcomes.map(outcome => `<option value="${outcome.value}">${outcome.label}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group" id="otherOutcomeGroup" style="display: none;">
                    <label>Other Outcome (specify)</label>
                    <input type="text" id="logOtherOutcome" placeholder="Please specify other outcome">
                </div>

                <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="logUrgent">
                        <span class="checkmark"></span>
                        Urgent
                    </label>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="consultation-table-container">
            <div class="table-header">
                <div>Date</div>
                <div>Shift</div>
                <div>ER Doctor</div>
                <div>Time Called</div>
                <div>Specialist</div>
                <div>Specialty</div>
                <div>Response</div>
                <div>Arrival Time</div>
                <div>Response Time</div>
                <div>Patient ID</div>
                <div>Outcome</div>
                <div>Urgent</div>
                <div>Actions</div>
            </div>

            <div class="table-body" id="consultationLogTableBody">
                ${renderConsultationLogTable(logs, doctors, specialistsList, shifts, outcomes)}
            </div>
        </div>
    `;
}

function renderConsultationLogTable(logs, doctors, specialists, shifts, outcomes) {
    if (!logs || logs.length === 0) {
        return '<div class="empty-state">No consultation logs found</div>';
    }

    return logs.map(log => {
        const doctor = doctors.find(d => d.id === log.erDoctorId);
        const specialist = specialists.find(s => s.id === log.specialistId);
        const shift = shifts.find(s => s.value === log.shift);
        const outcome = outcomes.find(o => o.value === log.outcome);

        return `
            <div class="table-row" data-log-id="${log.id}">
                <div>${log.date}</div>
                <div>${shift ? shift.label.split(' ')[0] : log.shift}</div>
                <div>${doctor ? doctor.name : 'Unknown'}</div>
                <div>${log.timeCalled}</div>
                <div>${specialist ? specialist.name : 'Unknown'}</div>
                <div>${log.specialty}</div>
                <div>--:--</div>
                <div>${log.arrivalTime || '--:--'}</div>
                <div>${log.responseTime || '--'}</div>
                <div>${log.patientId}</div>
                <div>
                    <span class="outcome-badge outcome-${log.outcome}">
                        ${outcome ? outcome.label : log.outcome}
                    </span>
                </div>
                <div>${log.urgent ? '✓' : ''}</div>
                <div class="action-cell">
                    <button class="edit-btn" onclick="editConsultationLog(${log.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteConsultationLog(${log.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Consultation Log Interactive Functions
function updateSpecialty() {
    const specialistSelect = document.getElementById('logSpecialist');
    const specialtyInput = document.getElementById('logSpecialty');
    const selectedOption = specialistSelect.options[specialistSelect.selectedIndex];

    if (selectedOption && selectedOption.dataset.specialty) {
        specialtyInput.value = selectedOption.dataset.specialty;
    } else {
        specialtyInput.value = '';
    }
}

function calculateResponseTime() {
    const timeCalled = document.getElementById('logTimeCalled').value;
    const arrivalTime = document.getElementById('logArrivalTime').value;
    const responseTimeInput = document.getElementById('logResponseTime');

    if (timeCalled && arrivalTime) {
        const [calledHours, calledMinutes] = timeCalled.split(':').map(Number);
        const [arrivalHours, arrivalMinutes] = arrivalTime.split(':').map(Number);

        const calledTotalMinutes = calledHours * 60 + calledMinutes;
        const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes;

        let diffMinutes = arrivalTotalMinutes - calledTotalMinutes;

        // Handle next day scenario
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60;
        }

        responseTimeInput.value = `${diffMinutes} min`;
    } else {
        responseTimeInput.value = '';
    }
}

function toggleOtherOutcome() {
    const outcomeSelect = document.getElementById('logOutcome');
    const otherGroup = document.getElementById('otherOutcomeGroup');
    const otherInput = document.getElementById('logOtherOutcome');

    if (outcomeSelect.value === 'other') {
        otherGroup.style.display = 'block';
        otherInput.required = true;
    } else {
        otherGroup.style.display = 'none';
        otherInput.required = false;
        otherInput.value = '';
    }
}

function addNewConsultationLogRow() {
    clearConsultationLogForm();
}

function clearConsultationLogForm() {
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('logShift').value = '';
    document.getElementById('logERDoctor').value = '';
    document.getElementById('logTimeCalled').value = '';
    document.getElementById('logSpecialist').value = '';
    document.getElementById('logSpecialty').value = '';
    document.getElementById('logArrivalTime').value = '';
    document.getElementById('logResponseTime').value = '';
    document.getElementById('logPatientId').value = '';
    document.getElementById('logOutcome').value = '';
    document.getElementById('logOtherOutcome').value = '';
    document.getElementById('logUrgent').checked = false;

    // Hide the "Other" outcome field
    document.getElementById('otherOutcomeGroup').style.display = 'none';
    document.getElementById('logOtherOutcome').required = false;

    // Remove any edit mode indicators
    document.querySelectorAll('.table-row').forEach(row => row.classList.remove('editing'));
}

async function saveConsultationLog() {
    const outcomeValue = document.getElementById('logOutcome').value;
    const otherOutcome = document.getElementById('logOtherOutcome').value;

    const logData = {
        date: document.getElementById('logDate').value,
        shift: document.getElementById('logShift').value,
        erDoctorId: document.getElementById('logERDoctor').value,
        timeCalled: document.getElementById('logTimeCalled').value,
        specialistId: document.getElementById('logSpecialist').value,
        specialty: document.getElementById('logSpecialty').value,
        arrivalTime: document.getElementById('logArrivalTime').value,
        responseTime: document.getElementById('logResponseTime').value,
        patientId: document.getElementById('logPatientId').value,
        outcome: outcomeValue === 'other' ? otherOutcome : outcomeValue,
        urgent: document.getElementById('logUrgent').checked
    };

    // Validate required fields
    const required = ['date', 'shift', 'erDoctorId', 'timeCalled', 'specialistId', 'patientId', 'outcome'];
    for (let field of required) {
        if (!logData[field]) {
            showToast(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return;
        }
    }

    // Additional validation for "Other" outcome
    if (outcomeValue === 'other' && !otherOutcome.trim()) {
        showToast('Please specify the other outcome.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/consultation-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });

        if (response.ok) {
            const newLog = await response.json();
            showToast('Consultation log saved successfully', 'success');

            // Add to global logs and refresh table
            globalConsultationLogs.push(newLog);
            refreshConsultationLogTable();
            clearConsultationLogForm();
        } else {
            throw new Error('Failed to save consultation log');
        }
    } catch (error) {
        console.error('Error saving consultation log:', error);
        showToast('Failed to save consultation log', 'error');
    }
}

function refreshConsultationLogTable() {
    const tableBody = document.getElementById('consultationLogTableBody');
    const shifts = [
        { value: 'morning', label: 'Morning (7:00 AM - 3:00 PM)' },
        { value: 'evening', label: 'Evening (3:00 PM - 11:00 PM)' },
        { value: 'night', label: 'Night (11:00 PM - 7:00 AM)' }
    ];
    const outcomes = [
        { value: 'admitted', label: 'Admitted' },
        { value: 'dama', label: 'Patient discharge against medical advice (DAMA)' },
        { value: 'discharged_ama', label: 'Discharged against medical advice' },
        { value: 'patient_referred', label: 'Patient referred' },
        { value: 'other', label: 'Other' }
    ];
    const specialistsList = [
        { id: 'fathi', name: 'Dr. Fathi', specialty: 'Internal Medicine' },
        { id: 'joseph', name: 'Dr. Joseph', specialty: 'Orthopedics' },
        { id: 'mahasen', name: 'Dr. Mahasen', specialty: 'ENT' },
        { id: 'mahmoud', name: 'Dr. Mahmoud', specialty: 'Orthopedics' },
        { id: 'mammoun', name: 'Dr. Mammoun', specialty: 'General Surgery' },
        { id: 'renaldo', name: 'Dr. Renaldo', specialty: 'General Surgery' },
        { id: 'yanelis', name: 'Dr. Yanelis', specialty: 'Ophthalmology' },
        { id: 'asma', name: 'Dr. Asma', specialty: 'Obstetrics & Gynaecology' },
        { id: 'abdulhakim', name: 'Dr. Abdulhakim', specialty: 'Pediatrics' },
        { id: 'badawy_mahmoud', name: 'Dr. Badawy Mahmoud', specialty: 'Paediatrics' },
        { id: 'badawy', name: 'Dr. Badawy', specialty: 'Dentist' }
    ];

    tableBody.innerHTML = renderConsultationLogTable(globalConsultationLogs, globalDoctors, specialistsList, shifts, outcomes);
}

function editConsultationLog(logId) {
    const log = globalConsultationLogs.find(l => l.id === logId);
    if (!log) return;

    // Check if outcome is a custom "other" value
    const standardOutcomes = ['admitted', 'dama', 'discharged_ama', 'patient_referred'];
    const isOtherOutcome = !standardOutcomes.includes(log.outcome);

    // Populate form with log data
    document.getElementById('logDate').value = log.date;
    document.getElementById('logShift').value = log.shift;
    document.getElementById('logERDoctor').value = log.erDoctorId;
    document.getElementById('logTimeCalled').value = log.timeCalled;
    document.getElementById('logSpecialist').value = log.specialistId;
    document.getElementById('logSpecialty').value = log.specialty;
    document.getElementById('logArrivalTime').value = log.arrivalTime || '';
    document.getElementById('logResponseTime').value = log.responseTime || '';
    document.getElementById('logPatientId').value = log.patientId;

    if (isOtherOutcome) {
        document.getElementById('logOutcome').value = 'other';
        document.getElementById('logOtherOutcome').value = log.outcome;
        toggleOtherOutcome(); // Show the other field
    } else {
        document.getElementById('logOutcome').value = log.outcome;
        document.getElementById('logOtherOutcome').value = '';
        toggleOtherOutcome(); // Hide the other field if not needed
    }

    document.getElementById('logUrgent').checked = log.urgent;

    // Highlight the row being edited
    document.querySelectorAll('.table-row').forEach(row => row.classList.remove('editing'));
    document.querySelector(`[data-log-id="${logId}"]`).classList.add('editing');

    // Store the ID for updating
    document.getElementById('consultationLogModalBody').dataset.editingId = logId;
}

async function deleteConsultationLog(logId) {
    if (!confirm('Are you sure you want to delete this consultation log entry?')) {
        return;
    }

    try {
        const response = await fetch(`/api/consultation-logs/${logId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Consultation log deleted successfully', 'success');

            // Remove from global logs and refresh table
            globalConsultationLogs = globalConsultationLogs.filter(l => l.id !== logId);
            refreshConsultationLogTable();
        } else {
            throw new Error('Failed to delete consultation log');
        }
    } catch (error) {
        console.error('Error deleting consultation log:', error);
        showToast('Failed to delete consultation log', 'error');
    }
}

async function exportConsultationLog(format) {
    try {
        const response = await fetch(`/api/consultation-logs/export/${format}`);

        if (format === 'csv') {
            const csvContent = await response.text();
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'consultation-logs.csv';
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('CSV export completed', 'success');
        } else if (format === 'pdf') {
            const pdfData = await response.json();
            // For PDF, you would typically use a library like jsPDF
            console.log('PDF data:', pdfData);
            showToast('PDF export data prepared (implement PDF generation)', 'info');
        }
    } catch (error) {
        console.error('Error exporting consultation log:', error);
        showToast('Failed to export consultation log', 'error');
    }
}

// Saudi Red Crescent Functions
function renderSaudiCrescentModal(records, doctors, ambulanceUnits) {
    const modalBody = document.getElementById('saudiCrescentModalBody');

    modalBody.innerHTML = `
        <!-- Action Buttons -->
        <div class="action-buttons">
            <button class="action-btn add-btn" onclick="addNewSaudiCrescentEntry()">
                <i class="fas fa-plus"></i>
                Add Entry
            </button>
            <button class="action-btn save-btn" onclick="saveSaudiCrescentRecord()">
                <i class="fas fa-save"></i>
                Save
            </button>
            <button class="action-btn clear-btn" onclick="clearSaudiCrescentForm()">
                <i class="fas fa-eraser"></i>
                Clear Form
            </button>
            <button class="action-btn export-btn" onclick="exportSaudiCrescentRecords('csv')">
                <i class="fas fa-file-csv"></i>
                CSV
            </button>
            <button class="action-btn export-btn" onclick="exportSaudiCrescentRecords('pdf')">
                <i class="fas fa-file-pdf"></i>
                PDF
            </button>
        </div>

        <!-- Form Fields -->
        <div class="saudi-crescent-form glass-card">
            <div class="form-grid">
                <div class="form-group">
                    <label>Patient ID</label>
                    <input type="text" id="srcPatientId" placeholder="Patient ID" required>
                </div>

                <div class="form-group">
                    <label>Ambulance Unit</label>
                    <select id="srcAmbulanceUnit" required>
                        <option value="">Select Ambulance Unit</option>
                        ${ambulanceUnits.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Receiving Doctor</label>
                    <select id="srcReceivingDoctor" required>
                        <option value="">Select Receiving Doctor</option>
                        ${doctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Time Received</label>
                    <input type="time" id="srcTimeReceived" required>
                </div>

                <div class="form-group">
                    <label>Handover Time</label>
                    <input type="time" id="srcHandoverTime" onchange="calculateHandoverDuration()">
                </div>

                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" id="srcDuration" readonly class="readonly-field" placeholder="Auto-calculated">
                </div>

                <div class="form-group full-width">
                    <label>Additional Notes</label>
                    <textarea id="srcAdditionalNotes" rows="3" placeholder="Any special notes about the patient transfer or condition"></textarea>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="saudi-crescent-table-container">
            <div class="table-header">
                <div>Date</div>
                <div>Time Received</div>
                <div>Case Type</div>
                <div>Patient Details</div>
                <div>Receiving Doctor</div>
                <div>Handover Time</div>
                <div>Duration (min)</div>
                <div>Notes</div>
                <div>Actions</div>
            </div>

            <div class="table-body" id="saudiCrescentTableBody">
                ${renderSaudiCrescentTable(records, doctors, ambulanceUnits)}
            </div>
        </div>

        <!-- Handover Statistics -->
        <div class="handover-statistics glass-card">
            <h3>Handover Statistics</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Average Handover Time:</span>
                    <span class="stat-value" id="avgHandoverTime">0 min</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Cases Today:</span>
                    <span class="stat-value" id="totalCasesToday">0</span>
                </div>
            </div>
        </div>
    `;

    // Update statistics
    updateSaudiCrescentStatistics(records);
}

function renderSaudiCrescentTable(records, doctors, ambulanceUnits) {
    if (!records || records.length === 0) {
        return '<div class="empty-state">No Saudi Red Crescent records found</div>';
    }

    return records.map(record => {
        const doctor = doctors.find(d => d.id === record.receivingDoctorId);
        const recordDate = new Date(record.createdAt).toLocaleDateString();

        return `
            <div class="table-row" data-record-id="${record.id}">
                <div>${recordDate}</div>
                <div>${record.timeReceived}</div>
                <div>Emergency</div>
                <div>${record.patientId}</div>
                <div>${doctor ? doctor.name : 'Unknown'}</div>
                <div>${record.handoverTime || '--:--'}</div>
                <div>${record.duration || '--'}</div>
                <div class="notes-cell" title="${record.additionalNotes}">${record.additionalNotes.substring(0, 30)}${record.additionalNotes.length > 30 ? '...' : ''}</div>
                <div class="action-cell">
                    <button class="edit-btn" onclick="editSaudiCrescentRecord(${record.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteSaudiCrescentRecord(${record.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Saudi Red Crescent Interactive Functions
function calculateHandoverDuration() {
    const timeReceived = document.getElementById('srcTimeReceived').value;
    const handoverTime = document.getElementById('srcHandoverTime').value;
    const durationInput = document.getElementById('srcDuration');

    if (timeReceived && handoverTime) {
        const [receivedHours, receivedMinutes] = timeReceived.split(':').map(Number);
        const [handoverHours, handoverMinutes] = handoverTime.split(':').map(Number);

        const receivedTotalMinutes = receivedHours * 60 + receivedMinutes;
        const handoverTotalMinutes = handoverHours * 60 + handoverMinutes;

        let diffMinutes = handoverTotalMinutes - receivedTotalMinutes;

        // Handle next day scenario
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60;
        }

        durationInput.value = `${diffMinutes} min`;
    } else {
        durationInput.value = '';
    }
}

function addNewSaudiCrescentEntry() {
    clearSaudiCrescentForm();
}

function clearSaudiCrescentForm() {
    document.getElementById('srcPatientId').value = '';
    document.getElementById('srcAmbulanceUnit').value = '';
    document.getElementById('srcReceivingDoctor').value = '';
    document.getElementById('srcTimeReceived').value = '';
    document.getElementById('srcHandoverTime').value = '';
    document.getElementById('srcDuration').value = '';
    document.getElementById('srcAdditionalNotes').value = '';

    // Remove any edit mode indicators
    document.querySelectorAll('.table-row').forEach(row => row.classList.remove('editing'));
}

async function saveSaudiCrescentRecord() {
    const recordData = {
        patientId: document.getElementById('srcPatientId').value,
        ambulanceUnit: document.getElementById('srcAmbulanceUnit').value,
        receivingDoctorId: document.getElementById('srcReceivingDoctor').value,
        timeReceived: document.getElementById('srcTimeReceived').value,
        handoverTime: document.getElementById('srcHandoverTime').value,
        duration: document.getElementById('srcDuration').value,
        additionalNotes: document.getElementById('srcAdditionalNotes').value
    };

    // Validate required fields
    const required = ['patientId', 'ambulanceUnit', 'receivingDoctorId', 'timeReceived'];
    for (let field of required) {
        if (!recordData[field]) {
            showToast(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return;
        }
    }

    try {
        const response = await fetch('/api/saudi-crescent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordData)
        });

        if (response.ok) {
            const newRecord = await response.json();
            showToast('Saudi Red Crescent record saved successfully', 'success');

            // Add to global records and refresh table
            globalSaudiCrescentRecords.push(newRecord);
            refreshSaudiCrescentTable();
            clearSaudiCrescentForm();
            updateSaudiCrescentStatistics(globalSaudiCrescentRecords);
        } else {
            throw new Error('Failed to save Saudi Red Crescent record');
        }
    } catch (error) {
        console.error('Error saving Saudi Red Crescent record:', error);
        showToast('Failed to save Saudi Red Crescent record', 'error');
    }
}

function refreshSaudiCrescentTable() {
    const tableBody = document.getElementById('saudiCrescentTableBody');
    tableBody.innerHTML = renderSaudiCrescentTable(globalSaudiCrescentRecords, globalDoctors, globalAmbulanceUnits);
}

function editSaudiCrescentRecord(recordId) {
    const record = globalSaudiCrescentRecords.find(r => r.id === recordId);
    if (!record) return;

    // Populate form with record data
    document.getElementById('srcPatientId').value = record.patientId;
    document.getElementById('srcAmbulanceUnit').value = record.ambulanceUnit;
    document.getElementById('srcReceivingDoctor').value = record.receivingDoctorId;
    document.getElementById('srcTimeReceived').value = record.timeReceived;
    document.getElementById('srcHandoverTime').value = record.handoverTime || '';
    document.getElementById('srcDuration').value = record.duration || '';
    document.getElementById('srcAdditionalNotes').value = record.additionalNotes || '';

    // Highlight the row being edited
    document.querySelectorAll('.table-row').forEach(row => row.classList.remove('editing'));
    document.querySelector(`[data-record-id="${recordId}"]`).classList.add('editing');

    // Store the ID for updating
    document.getElementById('saudiCrescentModalBody').dataset.editingId = recordId;
}

async function deleteSaudiCrescentRecord(recordId) {
    if (!confirm('Are you sure you want to delete this Saudi Red Crescent record?')) {
        return;
    }

    try {
        const response = await fetch(`/api/saudi-crescent/${recordId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Saudi Red Crescent record deleted successfully', 'success');

            // Remove from global records and refresh table
            globalSaudiCrescentRecords = globalSaudiCrescentRecords.filter(r => r.id !== recordId);
            refreshSaudiCrescentTable();
            updateSaudiCrescentStatistics(globalSaudiCrescentRecords);
        } else {
            throw new Error('Failed to delete Saudi Red Crescent record');
        }
    } catch (error) {
        console.error('Error deleting Saudi Red Crescent record:', error);
        showToast('Failed to delete Saudi Red Crescent record', 'error');
    }
}

async function exportSaudiCrescentRecords(format) {
    try {
        const response = await fetch(`/api/saudi-crescent/export/${format}`);

        if (format === 'csv') {
            const csvContent = await response.text();
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'saudi-crescent-records.csv';
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('CSV export completed', 'success');
        } else if (format === 'pdf') {
            const pdfData = await response.json();
            console.log('PDF data:', pdfData);
            showToast('PDF export data prepared (implement PDF generation)', 'info');
        }
    } catch (error) {
        console.error('Error exporting Saudi Red Crescent records:', error);
        showToast('Failed to export Saudi Red Crescent records', 'error');
    }
}

function updateSaudiCrescentStatistics(records) {
    // Calculate average handover time
    const recordsWithDuration = records.filter(r => r.duration && r.duration !== '');
    let avgTime = 0;
    if (recordsWithDuration.length > 0) {
        const totalMinutes = recordsWithDuration.reduce((sum, record) => {
            const minutes = parseInt(record.duration.replace(' min', ''));
            return sum + (isNaN(minutes) ? 0 : minutes);
        }, 0);
        avgTime = Math.round(totalMinutes / recordsWithDuration.length);
    }

    // Calculate today's records
    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = records.filter(record => {
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        return recordDate === today;
    });

    // Update UI
    const avgElement = document.getElementById('avgHandoverTime');
    const totalElement = document.getElementById('totalCasesToday');

    if (avgElement) avgElement.textContent = `${avgTime} min`;
    if (totalElement) totalElement.textContent = todaysRecords.length;
}
