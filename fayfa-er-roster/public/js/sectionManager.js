// Section Manager - Helper to manage section visibility
class SectionManager {
    static hideAllSections() {
        // Hide all dynamic sections
        const dynamicSections = document.querySelectorAll('#dynamicSections > section');
        dynamicSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Hide all dashboard sections that might be outside dynamicSections
        const allSections = document.querySelectorAll('.dashboard-section');
        allSections.forEach(section => {
            if (section.id !== 'mainDashboard') {
                section.style.display = 'none';
            }
        });
    }
    
    static showSection(sectionId, animateEntrance = true) {
        // First hide all sections
        this.hideAllSections();
        
        // Show the requested section
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            
            // Animate entrance if requested and gsap is available
            if (animateEntrance && typeof gsap !== 'undefined') {
                gsap.from(section, {
                    duration: 0.5,
                    y: 20,
                    opacity: 0,
                    ease: 'power2.out'
                });
            }
            
            return true;
        } else {
            console.error(`Section with id '${sectionId}' not found`);
            return false;
        }
    }
    
    static showMainDashboard() {
        this.hideAllSections();
        const mainDashboard = document.getElementById('mainDashboard');
        if (mainDashboard) {
            mainDashboard.style.display = 'block';
        }
    }
}

// Make it globally available
window.SectionManager = SectionManager;

// Override existing show functions to use SectionManager
if (typeof showWorkloadAnalysis !== 'undefined') {
    const originalShowWorkloadAnalysis = showWorkloadAnalysis;
    window.showWorkloadAnalysis = async function() {
        SectionManager.showSection('workloadSection');
        // Call original function logic
        await originalShowWorkloadAnalysis.call(this);
    };
}

if (typeof showFairnessMetrics !== 'undefined') {
    const originalShowFairnessMetrics = showFairnessMetrics;
    window.showFairnessMetrics = async function() {
        SectionManager.showSection('fairnessSection');
        // Call original function logic
        await originalShowFairnessMetrics.call(this);
    };
}

// Override showConsultationLog to open clean calendar widget
window.showConsultationLog = function() {
    console.log('Opening consultation log calendar widget');

    // Initialize and open the consultation log manager if it exists
    if (window.consultationLogManager) {
        console.log('Using existing consultationLogManager');
        window.consultationLogManager.open();
    } else if (window.ConsultationLogManager) {
        console.log('Creating new consultationLogManager instance');
        // Create instance if not already created
        window.consultationLogManager = new ConsultationLogManager();
        window.consultationLogManager.initialize().then(() => {
            window.consultationLogManager.open();
        });
    } else {
        console.error('ConsultationLogManager not available');
        // Emergency fallback: Create and open modal directly
        window.emergencyShowConsultationLog();
    }
};

// Emergency fallback function - Show immediate calendar
window.emergencyShowConsultationLog = function() {
    console.log('Showing immediate consultation calendar');

    // Remove any existing modals
    const existingModal = document.getElementById('emergencyConsultationModal');
    if (existingModal) existingModal.remove();

    // Create immediate calendar modal
    const modal = document.createElement('div');
    modal.id = 'emergencyConsultationModal';
    modal.style.cssText = `
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

    const currentDate = new Date();
    const calendarHTML = generateSimpleCalendar(currentDate);

    modal.innerHTML = `
        <div style="background: #1e293b; color: white; padding: 30px; border-radius: 15px; max-width: 900px; width: 95%; border: 2px solid #3b82f6; margin: 20px; max-height: 90vh; overflow-y: auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #3b82f6; margin: 0 0 10px 0; font-size: 32px;">📅 Consultation Calendar</h2>
                <p style="color: #a0aec0; margin: 0; font-size: 16px;">Click on any date to manage consultations for that day</p>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 30px;">
                <button onclick="changeCalendarMonth(-1)" style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 18px;">‹</button>
                <h3 id="calendarMonthTitle" style="color: white; font-size: 24px; font-weight: bold; margin: 0; min-width: 250px; text-align: center;">${getMonthYearString(currentDate)}</h3>
                <button onclick="changeCalendarMonth(1)" style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 18px;">›</button>
            </div>

            <div style="background: rgba(30, 41, 59, 0.5); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 10px;">
                    <div style="text-align: center; font-weight: bold; color: #a0aec0; padding: 10px; font-size: 14px;">SUN</div>
                    <div style="text-align: center; font-weight: bold; color: #a0aec0; padding: 10px; font-size: 14px;">MON</div>
                    <div style="text-align: center; font-weight: bold; color: #a0aec0; padding: 10px; font-size: 14px;">TUE</div>
                    <div style="text-align: center; font-weight: bold; color: #a0aec0; padding: 10px; font-size: 14px;">WED</div>
                    <div style="text-align: center; font-weight: bold; color: #a0aec0; padding: 10px; font-size: 14px;">THU</div>
                    <div style="text-align: center; font-weight: bold; color: #a0aec0; padding: 10px; font-size: 14px;">FRI</div>
                    <div style="text-align: center; font-weight: bold; color: #a0aec0; padding: 10px; font-size: 14px;">SAT</div>
                </div>
                <div id="calendarDaysContainer" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
                    ${calendarHTML}
                </div>
            </div>

            <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px; padding: 15px; background: rgba(30, 41, 59, 0.3); border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #a0aec0; font-size: 14px;">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(71, 85, 105, 0.4);"></div>
                    <span>No consultations</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #a0aec0; font-size: 14px;">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: rgba(59, 130, 246, 0.3); border: 1px solid #3b82f6;"></div>
                    <span>Has consultations</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #a0aec0; font-size: 14px;">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: rgba(239, 68, 68, 0.3); border: 1px solid #ef4444;"></div>
                    <span>Urgent cases</span>
                </div>
            </div>

            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 25px;">
                <button onclick="openGlobalSearchInterface()" style="padding: 12px 24px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background 0.3s ease;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">🔍 Global Search</button>
                <button onclick="document.getElementById('emergencyConsultationModal').remove()" style="padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">❌ Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Store current date for navigation
    window.currentCalendarDate = currentDate;
};

// Helper functions for simple calendar
function generateSimpleCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let daysHTML = '';

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        daysHTML += `<div style="aspect-ratio: 1; opacity: 0.3;"></div>`;
    }

    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const isToday = (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
        );

        let dayStyle = `
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(71, 85, 105, 0.4);
            border-radius: 8px;
            cursor: pointer !important;
            transition: all 0.3s ease;
            position: relative;
            min-height: 60px;
            color: white;
            font-size: 16px;
            font-weight: bold;
        `;

        if (isToday) {
            dayStyle += `
                background: rgba(34, 197, 94, 0.2) !important;
                border-color: #22c55e !important;
                color: #22c55e !important;
            `;
        }

        daysHTML += `
            <div style="${dayStyle}" onclick="openDateConsultationInterface('${dateStr}')" onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'; this.style.borderColor='#3b82f6'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='${isToday ? 'rgba(34, 197, 94, 0.2)' : 'rgba(15, 23, 42, 0.6)'}'; this.style.borderColor='${isToday ? '#22c55e' : 'rgba(71, 85, 105, 0.4)'}'; this.style.transform='scale(1)'">
                ${day}
            </div>
        `;
    }

    return daysHTML;
}

function getMonthYearString(date) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function changeCalendarMonth(direction) {
    if (!window.currentCalendarDate) {
        window.currentCalendarDate = new Date();
    }

    window.currentCalendarDate.setMonth(window.currentCalendarDate.getMonth() + direction);

    // Update the title
    const titleElement = document.getElementById('calendarMonthTitle');
    if (titleElement) {
        titleElement.textContent = getMonthYearString(window.currentCalendarDate);
    }

    // Update the calendar days
    const daysContainer = document.getElementById('calendarDaysContainer');
    if (daysContainer) {
        daysContainer.innerHTML = generateSimpleCalendar(window.currentCalendarDate);
    }
}

// Date click handler - Opens consultation interface for specific date
window.openDateConsultationInterface = function(dateStr) {
    console.log('Opening consultation interface for date:', dateStr);
    console.log('showAddConsultationForm available:', typeof window.showAddConsultationForm);

    // Close the calendar modal first
    const calendarModal = document.getElementById('emergencyConsultationModal');
    if (calendarModal) {
        calendarModal.remove();
    }

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

    content.innerHTML = `
        <div class="consultation-interface-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
            <div>
                <h2 style="color: #3b82f6; margin: 0; font-size: 28px;">
                    📅 Consultations for ${dateStr}
                </h2>
                <p style="margin: 5px 0 0 0; color: #a0aec0; font-size: 16px;">
                    Manage consultation logs for this date
                </p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="showConsultationCalendar()" style="
                    padding: 12px 24px; background: #3b82f6; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                ">📅 Back to Calendar</button>
                <button onclick="document.getElementById('dateConsultationInterface').remove()" style="
                    padding: 12px 24px; background: #ef4444; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                ">❌ Close</button>
            </div>
        </div>

        <div class="consultation-interface-content">
            <!-- Search Section -->
            <div style="background: #2d3748; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #f59e0b; margin-bottom: 20px; text-align: center;">
                    🔍 Search Consultations
                </h3>
                <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
                    <input type="text" id="globalSearchInput" placeholder="Search by specialist, patient ID, ER doctor, date, specialty..." style="
                        flex: 1; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                        background: #4a5568; color: white; font-size: 14px;
                    ">
                    <button onclick="performGlobalSearch()" style="
                        padding: 12px 20px; background: #f59e0b; color: white; border: none;
                        border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                        🔍 Search
                    </button>
                    <button onclick="clearGlobalSearch()" style="
                        padding: 12px 20px; background: #6b7280; color: white; border: none;
                        border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
                        ❌ Clear
                    </button>
                </div>
                <div id="searchResultsSummary" style="color: #a0aec0; font-size: 14px; margin-bottom: 10px;"></div>
                <div id="searchResults" style="max-height: 300px; overflow-y: auto; display: none;"></div>
            </div>

            <!-- Add New Consultation Section -->
            <div style="background: #2d3748; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #22c55e; margin-bottom: 20px; text-align: center;">
                    ➕ Add New Consultation
                </h3>
                <button id="openConsultationFormBtn" style="
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
                <div style="max-height: 400px; overflow-y: auto;" id="consultationLogsForDate">
                    <div style="padding: 40px; text-align: center; color: #a0aec0;">
                        <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                        <h4 style="margin: 0 0 10px 0; color: #6b7280;">Loading consultations...</h4>
                        <p style="margin: 0; font-size: 14px;">Fetching consultation logs for this date.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Set up the consultation form button click handler after the element is added to DOM
    const consultationFormBtn = document.getElementById('openConsultationFormBtn');
    if (consultationFormBtn) {
        consultationFormBtn.onclick = function() {
            console.log('Consultation form button clicked for date:', dateStr);
            // Try the external function first, then use our backup implementation
            if (typeof window.showAddConsultationForm === 'function') {
                window.showAddConsultationForm(dateStr);
            } else {
                console.log('Using backup consultation form implementation');
                showConsultationFormBackup(dateStr);
            }
        };
    }

    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Load consultation logs for this date
    loadConsultationLogsForDate(dateStr);

    console.log('Date consultation interface opened for:', dateStr);
};

// Function to go back to calendar
window.showConsultationCalendar = function() {
    // Close the date interface
    const dateInterface = document.getElementById('dateConsultationInterface');
    if (dateInterface) {
        dateInterface.remove();
    }

    // Show the calendar again
    window.emergencyShowConsultationLog();
};

// Load consultation logs for a specific date
async function loadConsultationLogsForDate(dateStr) {
    try {
        const response = await fetch('/api/consultation-logs');
        const consultationLogs = await response.json();

        // Filter logs for the specific date
        const logsForDate = consultationLogs.filter(log => log.date === dateStr);

        const container = document.getElementById('consultationLogsForDate');
        if (container) {
            if (logsForDate.length === 0) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #a0aec0;">
                        <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                        <h4 style="margin: 0 0 10px 0; color: #6b7280;">No consultations recorded</h4>
                        <p style="margin: 0; font-size: 14px;">Click "Open Consultation Form" above to add the first consultation for this date.</p>
                    </div>
                `;
            } else {
                // Generate table with existing consultations
                let tableHTML = `
                    <div style="padding: 15px; background: #4a5568; font-weight: bold; text-transform: uppercase; font-size: 12px; color: #a0aec0; display: grid; grid-template-columns: 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px 80px; gap: 10px;">
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

                logsForDate.forEach(log => {
                    const urgentIcon = log.urgent ? '<span style="color: #ef4444;">⚠️</span>' : '';

                    tableHTML += `
                        <div style="padding: 15px; border-bottom: 1px solid #4a5568; display: grid; grid-template-columns: 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px 80px; gap: 10px; align-items: center; font-size: 14px;">
                            <div style="padding: 4px 8px; background: #3b82f6; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center;">${log.shift}</div>
                            <div>Dr. ${log.erDoctorId}</div>
                            <div style="font-weight: bold;">${log.timeCalled}</div>
                            <div>${log.specialistId}</div>
                            <div>${log.specialty}</div>
                            <div>${log.arrivalTime || '--:--'}</div>
                            <div style="color: #22c55e;">${log.responseTime || '--'}</div>
                            <div style="font-family: monospace; font-weight: bold;">${log.patientId}</div>
                            <div style="padding: 4px 8px; background: #22c55e; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center;">${log.outcome}</div>
                            <div style="text-align: center;">${urgentIcon}</div>
                            <div>
                                <button onclick="editConsultation(${log.id})" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;">✏️</button>
                                <button onclick="deleteConsultation(${log.id})" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️</button>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = tableHTML;
            }
        }
    } catch (error) {
        console.error('Error loading consultation logs:', error);
        const container = document.getElementById('consultationLogsForDate');
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #ef4444;">
                    <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
                    <h4 style="margin: 0 0 10px 0;">Error loading consultations</h4>
                    <p style="margin: 0; font-size: 14px;">Please try again or contact support.</p>
                </div>
            `;
        }
    }
}

if (typeof showReferralStats !== 'undefined') {
    const originalShowReferralStats = showReferralStats;
    window.showReferralStats = async function() {
        SectionManager.showSection('referralSection');
        // Call original function logic
        await originalShowReferralStats.call(this);
    };
}

if (typeof showReferralEntry !== 'undefined') {
    const originalShowReferralEntry = showReferralEntry;
    window.showReferralEntry = function() {
        SectionManager.showSection('referralEntrySection');
        // Call original function logic
        originalShowReferralEntry.call(this);
    };
}

if (typeof showLicenseManager !== 'undefined') {
    const originalShowLicenseManager = showLicenseManager;
    window.showLicenseManager = async function() {
        SectionManager.showSection('licenseSection');
        // Call original function logic
        await originalShowLicenseManager.call(this);
    };
}

// Add helper for other sections
window.showSectionById = function(sectionId) {
    return SectionManager.showSection(sectionId);
};

// Backup consultation form function
async function showConsultationFormBackup(dateStr) {
    console.log('Opening backup consultation form for date:', dateStr);

    // Load doctors from API
    let doctors = [];
    try {
        const response = await fetch('/api/doctors');
        const data = await response.json();
        doctors = data.data || [];
    } catch (error) {
        console.error('Error loading doctors:', error);
    }

    // Create form popup
    const popup = document.createElement('div');
    popup.id = 'addConsultationPopupBackup';
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

    // Generate doctor options
    let doctorOptions = '<option value="">Select ER Doctor</option>';
    doctors.forEach(doctor => {
        doctorOptions += `<option value="${doctor.id}">${doctor.name}</option>`;
    });

    // Specialist-specialty mapping
    const specialistData = {
        'fathi': 'Internal Medicine',
        'joseph': 'Orthopedics',
        'mahasen': 'ENT',
        'mammoun': 'General Surgery',
        'yanelis': 'Ophthalmology'
    };

    let specialistOptions = '<option value="">Select Specialist</option>';
    Object.keys(specialistData).forEach(id => {
        const name = id.charAt(0).toUpperCase() + id.slice(1);
        specialistOptions += `<option value="${id}">Dr. ${name}</option>`;
    });

    content.innerHTML = `
        <h2 style="color: #3b82f6; margin-bottom: 25px; text-align: center;">
            ➕ Add New Consultation - ${dateStr}
        </h2>

        <div style="background: #2d3748; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <form id="consultationFormBackup">
                <!-- Row 1: Date, Shift, ER Doctor, Time Called -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Date</label>
                        <input type="date" id="consultDateBackup" value="${dateStr}" readonly style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Shift</label>
                        <select id="consultShiftBackup" required style="
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
                        <select id="consultErDoctorBackup" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            ${doctorOptions}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Time Called</label>
                        <input type="time" id="consultTimeCalledBackup" required onchange="calculateResponseTime()" style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                </div>

                <!-- Row 2: Specialist, Specialty, Arrival Time, Patient ID -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Specialist</label>
                        <select id="consultSpecialistBackup" required onchange="populateSpecialty()" style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            ${specialistOptions}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Specialty <span style="color: #f59e0b;">(Auto-filled)</span></label>
                        <input type="text" id="consultSpecialtyBackup" readonly placeholder="Select specialist first" style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #374151; color: #a0aec0; font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Arrival Time <span style="color: #ef4444;">*</span></label>
                        <input type="time" id="consultArrivalTimeBackup" required onchange="calculateResponseTime()" style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Patient ID</label>
                        <input type="text" id="consultPatientIdBackup" required placeholder="e.g., P001" style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                    </div>
                </div>

                <!-- Row 3: Response Time (Auto-calculated) and Outcome -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Response Time <span style="color: #22c55e;">(Auto-calculated)</span></label>
                        <input type="text" id="consultResponseTimeBackup" readonly placeholder="Enter times above" style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #374151; color: #22c55e; font-size: 14px; font-weight: bold;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #a0aec0; font-size: 14px;">Outcome</label>
                        <select id="consultOutcomeBackup" required style="
                            width: 100%; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;
                            background: #4a5568; color: white; font-size: 14px;
                        ">
                            <option value="">Select Outcome</option>
                            <option value="admitted">Admitted</option>
                            <option value="discharged">Discharged</option>
                            <option value="patient_referred">Patient Referred</option>
                            <option value="dama">DAMA</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: center; margin-top: 28px;">
                        <input type="checkbox" id="consultUrgentBackup" style="margin-right: 10px; transform: scale(1.2);">
                        <label for="consultUrgentBackup" style="color: #ef4444; font-weight: bold;">Urgent Case</label>
                    </div>
                </div>

                <!-- Buttons -->
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button type="submit" style="
                        padding: 15px 30px; background: #22c55e; color: white; border: none;
                        border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='#16a34a'" onmouseout="this.style.background='#22c55e'">
                        💾 Save Consultation
                    </button>
                    <button type="button" onclick="document.getElementById('addConsultationPopupBackup').remove()" style="
                        padding: 15px 30px; background: #ef4444; color: white; border: none;
                        border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                        transition: background 0.3s ease;
                    " onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                        ❌ Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    popup.appendChild(content);
    document.body.appendChild(popup);

    // Define specialist data globally for the functions to access
    window.specialistSpecialtyMap = specialistData;

    // Add helper functions
    window.populateSpecialty = function() {
        const specialistSelect = document.getElementById('consultSpecialistBackup');
        const specialtyInput = document.getElementById('consultSpecialtyBackup');

        if (specialistSelect && specialtyInput) {
            const selectedSpecialist = specialistSelect.value;
            if (selectedSpecialist && window.specialistSpecialtyMap) {
                specialtyInput.value = window.specialistSpecialtyMap[selectedSpecialist] || '';
                specialtyInput.style.color = '#22c55e';
                specialtyInput.style.fontWeight = 'bold';
            } else {
                specialtyInput.value = '';
                specialtyInput.style.color = '#a0aec0';
                specialtyInput.style.fontWeight = 'normal';
            }
        }
    };

    window.calculateResponseTime = function() {
        const timeCalledInput = document.getElementById('consultTimeCalledBackup');
        const arrivalTimeInput = document.getElementById('consultArrivalTimeBackup');
        const responseTimeInput = document.getElementById('consultResponseTimeBackup');

        if (timeCalledInput && arrivalTimeInput && responseTimeInput) {
            const timeCalled = timeCalledInput.value;
            const arrivalTime = arrivalTimeInput.value;

            if (timeCalled && arrivalTime) {
                // Parse times
                const [calledHour, calledMin] = timeCalled.split(':').map(Number);
                const [arrivalHour, arrivalMin] = arrivalTime.split(':').map(Number);

                // Convert to minutes since midnight
                const calledMinutes = calledHour * 60 + calledMin;
                let arrivalMinutes = arrivalHour * 60 + arrivalMin;

                // Handle cases where arrival time is next day (e.g., called at 23:30, arrived at 01:15)
                if (arrivalMinutes < calledMinutes) {
                    arrivalMinutes += 24 * 60; // Add 24 hours in minutes
                }

                // Calculate difference
                const diffMinutes = arrivalMinutes - calledMinutes;

                if (diffMinutes >= 0) {
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;

                    let responseText = '';
                    if (hours > 0) {
                        responseText = `${hours}h ${minutes}min`;
                    } else {
                        responseText = `${minutes} min`;
                    }

                    responseTimeInput.value = responseText;
                    responseTimeInput.style.color = '#22c55e';
                    responseTimeInput.style.fontWeight = 'bold';
                } else {
                    responseTimeInput.value = 'Invalid times';
                    responseTimeInput.style.color = '#ef4444';
                    responseTimeInput.style.fontWeight = 'bold';
                }
            } else {
                responseTimeInput.value = '';
                responseTimeInput.style.color = '#a0aec0';
                responseTimeInput.style.fontWeight = 'normal';
            }
        }
    };

    // Handle form submission
    document.getElementById('consultationFormBackup').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            date: document.getElementById('consultDateBackup').value,
            shift: document.getElementById('consultShiftBackup').value,
            erDoctorId: document.getElementById('consultErDoctorBackup').value,
            timeCalled: document.getElementById('consultTimeCalledBackup').value,
            specialistId: document.getElementById('consultSpecialistBackup').value,
            specialty: document.getElementById('consultSpecialtyBackup').value,
            arrivalTime: document.getElementById('consultArrivalTimeBackup').value,
            responseTime: document.getElementById('consultResponseTimeBackup').value,
            patientId: document.getElementById('consultPatientIdBackup').value,
            outcome: document.getElementById('consultOutcomeBackup').value,
            urgent: document.getElementById('consultUrgentBackup').checked
        };

        try {
            const response = await fetch('/api/consultation-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Consultation saved successfully!');
                popup.remove();
                // Refresh the consultation logs for this date
                if (document.getElementById('consultationLogsForDate')) {
                    loadConsultationLogsForDate(dateStr);
                }
            } else {
                alert('Error saving consultation. Please try again.');
            }
        } catch (error) {
            console.error('Error saving consultation:', error);
            alert('Error saving consultation. Please check your connection and try again.');
        }
    });

    // Close when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

// Global search functionality
window.performGlobalSearch = async function() {
    const searchTerm = document.getElementById('globalSearchInput').value.trim();
    const summaryDiv = document.getElementById('searchResultsSummary');
    const resultsDiv = document.getElementById('searchResults');

    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }

    summaryDiv.innerHTML = '🔍 Searching...';
    resultsDiv.style.display = 'none';

    try {
        // Fetch all consultation logs
        const response = await fetch('/api/consultation-logs');
        const consultationLogs = await response.json();

        // Perform comprehensive search
        const searchResults = consultationLogs.filter(log => {
            const searchLower = searchTerm.toLowerCase();

            // Search across multiple fields
            return (
                log.date.toLowerCase().includes(searchLower) ||
                log.shift.toLowerCase().includes(searchLower) ||
                log.specialistId.toLowerCase().includes(searchLower) ||
                (log.specialty && log.specialty.toLowerCase().includes(searchLower)) ||
                log.patientId.toLowerCase().includes(searchLower) ||
                log.outcome.toLowerCase().includes(searchLower) ||
                log.timeCalled.toLowerCase().includes(searchLower) ||
                (log.arrivalTime && log.arrivalTime.toLowerCase().includes(searchLower)) ||
                (log.responseTime && log.responseTime.toLowerCase().includes(searchLower)) ||
                getDoctorName(log.erDoctorId).toLowerCase().includes(searchLower) ||
                getSpecialistName(log.specialistId).toLowerCase().includes(searchLower)
            );
        });

        displaySearchResults(searchResults, searchTerm);

    } catch (error) {
        console.error('Error performing search:', error);
        summaryDiv.innerHTML = '<span style="color: #ef4444;">❌ Error performing search. Please try again.</span>';
    }
};

// Clear search results
window.clearGlobalSearch = function() {
    document.getElementById('globalSearchInput').value = '';
    document.getElementById('searchResultsSummary').innerHTML = '';
    document.getElementById('searchResults').style.display = 'none';
};

// Display search results
function displaySearchResults(results, searchTerm) {
    const summaryDiv = document.getElementById('searchResultsSummary');
    const resultsDiv = document.getElementById('searchResults');

    if (results.length === 0) {
        summaryDiv.innerHTML = `<span style="color: #f59e0b;">No consultations found for "${searchTerm}"</span>`;
        resultsDiv.style.display = 'none';
        return;
    }

    // Group results by date for better organization
    const resultsByDate = {};
    results.forEach(log => {
        if (!resultsByDate[log.date]) {
            resultsByDate[log.date] = [];
        }
        resultsByDate[log.date].push(log);
    });

    const dateCount = Object.keys(resultsByDate).length;
    summaryDiv.innerHTML = `
        <span style="color: #22c55e;">
            ✅ Found ${results.length} consultation${results.length > 1 ? 's' : ''}
            across ${dateCount} date${dateCount > 1 ? 's' : ''} for "${searchTerm}"
        </span>
    `;

    // Build results HTML
    let resultsHTML = '';

    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(resultsByDate).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const logsForDate = resultsByDate[date];

        resultsHTML += `
            <div style="margin-bottom: 25px; border: 1px solid #4a5568; border-radius: 8px; overflow: hidden;">
                <div style="background: #4a5568; padding: 15px; color: white; font-weight: bold;">
                    📅 ${formatDateDisplay(date)} (${logsForDate.length} consultation${logsForDate.length > 1 ? 's' : ''})
                </div>
                <div style="background: #374151;">
                    ${generateSearchResultTable(logsForDate, searchTerm)}
                </div>
            </div>
        `;
    });

    resultsDiv.innerHTML = resultsHTML;
    resultsDiv.style.display = 'block';
}

// Generate table for search results with highlighting
function generateSearchResultTable(logs, searchTerm) {
    let tableHTML = `
        <div style="padding: 10px; background: #4a5568; font-weight: bold; text-transform: uppercase; font-size: 12px; color: #a0aec0; display: grid; grid-template-columns: 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px; gap: 10px;">
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
        </div>
    `;

    logs.forEach(log => {
        const urgentIcon = log.urgent ? '<span style="color: #ef4444;">⚠️</span>' : '';
        const doctorName = getDoctorName(log.erDoctorId);
        const specialistName = getSpecialistName(log.specialistId);

        // Highlight matching terms
        const highlightText = (text, term) => {
            if (!text || !term) return text || '';
            const regex = new RegExp(`(${term})`, 'gi');
            return text.replace(regex, '<mark style="background: #f59e0b; color: black; padding: 1px 3px; border-radius: 3px;">$1</mark>');
        };

        tableHTML += `
            <div style="padding: 12px 10px; border-bottom: 1px solid #4a5568; display: grid; grid-template-columns: 80px 120px 100px 120px 120px 100px 120px 120px 80px 100px; gap: 10px; align-items: center; font-size: 13px;">
                <div style="padding: 4px 8px; background: #3b82f6; color: white; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; text-align: center;">${highlightText(log.shift, searchTerm)}</div>
                <div>${highlightText(doctorName, searchTerm)}</div>
                <div style="font-weight: bold;">${highlightText(log.timeCalled, searchTerm)}</div>
                <div>${highlightText(specialistName, searchTerm)}</div>
                <div>${highlightText(log.specialty || '', searchTerm)}</div>
                <div>${highlightText(log.arrivalTime || '--:--', searchTerm)}</div>
                <div style="color: #22c55e;">${highlightText(log.responseTime || '--', searchTerm)}</div>
                <div style="font-family: monospace; font-weight: bold;">${highlightText(log.patientId, searchTerm)}</div>
                <div style="padding: 4px 8px; background: #22c55e; color: white; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; text-align: center;">${highlightText(log.outcome, searchTerm)}</div>
                <div style="text-align: center;">${urgentIcon}</div>
            </div>
        `;
    });

    return tableHTML;
}

// Helper function to format date for display
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

// Helper functions to get doctor and specialist names
function getDoctorName(doctorId) {
    // Original doctor names for roster compatibility
    const doctorNames = {
        1: 'Dr. Ahmed',
        2: 'Dr. Hagah',
        3: 'Dr. Shafi',
        4: 'Dr. Hasan'
    };
    return doctorNames[doctorId] || `Doctor ID: ${doctorId}`;
}

function getSpecialistName(specialistId) {
    const specialistNames = {
        'fathi': 'Dr. Fathi',
        'joseph': 'Dr. Joseph',
        'mahasen': 'Dr. Mahasen',
        'mammoun': 'Dr. Mammoun',
        'yanelis': 'Dr. Yanelis'
    };
    return specialistNames[specialistId] || specialistId;
}

// Global search interface (standalone search modal)
window.openGlobalSearchInterface = function() {
    // Close calendar modal first
    const calendarModal = document.getElementById('emergencyConsultationModal');
    if (calendarModal) {
        calendarModal.remove();
    }

    // Create dedicated search modal
    const modal = document.createElement('div');
    modal.id = 'globalSearchModal';
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
        border: 2px solid #f59e0b !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
    `;

    content.innerHTML = `
        <div class="search-interface-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #f59e0b; padding-bottom: 20px;">
            <div>
                <h2 style="color: #f59e0b; margin: 0; font-size: 28px;">
                    🔍 Global Consultation Search
                </h2>
                <p style="margin: 5px 0 0 0; color: #a0aec0; font-size: 16px;">
                    Search across all consultation records by any field
                </p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="window.emergencyShowConsultationLog()" style="
                    padding: 12px 24px; background: #3b82f6; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                ">📅 Back to Calendar</button>
                <button onclick="document.getElementById('globalSearchModal').remove()" style="
                    padding: 12px 24px; background: #ef4444; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                ">❌ Close</button>
            </div>
        </div>

        <!-- Enhanced Search Section -->
        <div style="background: #2d3748; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="color: #f59e0b; margin-bottom: 20px; text-align: center;">
                🔍 Search Consultations
            </h3>
            <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
                <input type="text" id="globalSearchInputStandalone" placeholder="Search by specialist, patient ID, ER doctor, date, specialty, outcome..." style="
                    flex: 1; padding: 15px; border: 1px solid #4a5568; border-radius: 8px;
                    background: #4a5568; color: white; font-size: 16px;
                ">
                <button onclick="performGlobalSearchStandalone()" style="
                    padding: 15px 25px; background: #f59e0b; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                    🔍 Search
                </button>
                <button onclick="clearGlobalSearchStandalone()" style="
                    padding: 15px 25px; background: #6b7280; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
                    ❌ Clear
                </button>
            </div>

            <!-- Search Examples -->
            <div style="margin-bottom: 15px;">
                <p style="color: #a0aec0; font-size: 14px; margin-bottom: 10px;">Example searches:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <button onclick="document.getElementById('globalSearchInputStandalone').value='Dr. Ahmed'; performGlobalSearchStandalone();" style="padding: 6px 12px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; cursor: pointer; font-size: 12px;">Dr. Ahmed</button>
                    <button onclick="document.getElementById('globalSearchInputStandalone').value='fathi'; performGlobalSearchStandalone();" style="padding: 6px 12px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; cursor: pointer; font-size: 12px;">Dr. Fathi</button>
                    <button onclick="document.getElementById('globalSearchInputStandalone').value='2025-07-01'; performGlobalSearchStandalone();" style="padding: 6px 12px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; cursor: pointer; font-size: 12px;">2025-07-01</button>
                    <button onclick="document.getElementById('globalSearchInputStandalone').value='admitted'; performGlobalSearchStandalone();" style="padding: 6px 12px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; cursor: pointer; font-size: 12px;">Admitted</button>
                    <button onclick="document.getElementById('globalSearchInputStandalone').value='morning'; performGlobalSearchStandalone();" style="padding: 6px 12px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; cursor: pointer; font-size: 12px;">Morning Shift</button>
                </div>
            </div>

            <div id="searchResultsSummaryStandalone" style="color: #a0aec0; font-size: 14px; margin-bottom: 10px;"></div>
            <div id="searchResultsStandalone" style="max-height: 500px; overflow-y: auto; display: none;"></div>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Add enter key support for standalone search
    document.getElementById('globalSearchInputStandalone').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performGlobalSearchStandalone();
        }
    });

    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Standalone search functions
window.performGlobalSearchStandalone = async function() {
    const searchTerm = document.getElementById('globalSearchInputStandalone').value.trim();
    const summaryDiv = document.getElementById('searchResultsSummaryStandalone');
    const resultsDiv = document.getElementById('searchResultsStandalone');

    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }

    summaryDiv.innerHTML = '🔍 Searching...';
    resultsDiv.style.display = 'none';

    try {
        // Fetch all consultation logs
        const response = await fetch('/api/consultation-logs');
        const consultationLogs = await response.json();

        // Perform comprehensive search
        const searchResults = consultationLogs.filter(log => {
            const searchLower = searchTerm.toLowerCase();

            // Search across multiple fields
            return (
                log.date.toLowerCase().includes(searchLower) ||
                log.shift.toLowerCase().includes(searchLower) ||
                log.specialistId.toLowerCase().includes(searchLower) ||
                (log.specialty && log.specialty.toLowerCase().includes(searchLower)) ||
                log.patientId.toLowerCase().includes(searchLower) ||
                log.outcome.toLowerCase().includes(searchLower) ||
                log.timeCalled.toLowerCase().includes(searchLower) ||
                (log.arrivalTime && log.arrivalTime.toLowerCase().includes(searchLower)) ||
                (log.responseTime && log.responseTime.toLowerCase().includes(searchLower)) ||
                getDoctorName(log.erDoctorId).toLowerCase().includes(searchLower) ||
                getSpecialistName(log.specialistId).toLowerCase().includes(searchLower)
            );
        });

        displaySearchResultsStandalone(searchResults, searchTerm);

    } catch (error) {
        console.error('Error performing search:', error);
        summaryDiv.innerHTML = '<span style="color: #ef4444;">❌ Error performing search. Please try again.</span>';
    }
};

// Clear standalone search results
window.clearGlobalSearchStandalone = function() {
    document.getElementById('globalSearchInputStandalone').value = '';
    document.getElementById('searchResultsSummaryStandalone').innerHTML = '';
    document.getElementById('searchResultsStandalone').style.display = 'none';
};

// Display standalone search results
function displaySearchResultsStandalone(results, searchTerm) {
    const summaryDiv = document.getElementById('searchResultsSummaryStandalone');
    const resultsDiv = document.getElementById('searchResultsStandalone');

    if (results.length === 0) {
        summaryDiv.innerHTML = `<span style="color: #f59e0b;">No consultations found for "${searchTerm}"</span>`;
        resultsDiv.style.display = 'none';
        return;
    }

    // Group results by date for better organization
    const resultsByDate = {};
    results.forEach(log => {
        if (!resultsByDate[log.date]) {
            resultsByDate[log.date] = [];
        }
        resultsByDate[log.date].push(log);
    });

    const dateCount = Object.keys(resultsByDate).length;
    summaryDiv.innerHTML = `
        <span style="color: #22c55e;">
            ✅ Found ${results.length} consultation${results.length > 1 ? 's' : ''}
            across ${dateCount} date${dateCount > 1 ? 's' : ''} for "${searchTerm}"
        </span>
    `;

    // Build results HTML
    let resultsHTML = '';

    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(resultsByDate).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const logsForDate = resultsByDate[date];

        resultsHTML += `
            <div style="margin-bottom: 25px; border: 1px solid #4a5568; border-radius: 8px; overflow: hidden;">
                <div style="background: #4a5568; padding: 15px; color: white; font-weight: bold;">
                    📅 ${formatDateDisplay(date)} (${logsForDate.length} consultation${logsForDate.length > 1 ? 's' : ''})
                </div>
                <div style="background: #374151;">
                    ${generateSearchResultTable(logsForDate, searchTerm)}
                </div>
            </div>
        `;
    });

    resultsDiv.innerHTML = resultsHTML;
    resultsDiv.style.display = 'block';
}

// Add Enter key support for search
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener when DOM is ready, but check if element exists first
    setTimeout(() => {
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performGlobalSearch();
                }
            });
        }
    }, 1000);
});