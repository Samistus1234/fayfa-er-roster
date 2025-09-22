// Real-time updates handler using Server-Sent Events
let eventSource = null;
let reconnectInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Initialize real-time connection
function initializeRealTimeUpdates() {
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
        return; // Already connected
    }
    
    eventSource = new EventSource('/api/sse/events');
    
    eventSource.onopen = function() {
        reconnectAttempts = 0;
        showConnectionStatus('connected');
        
        // Clear any reconnection interval
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    };
    
    eventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            handleRealTimeUpdate(data);
        } catch (error) {
            console.error('Error parsing real-time data:', error);
        }
    };
    
    eventSource.onerror = function(error) {
        console.error('Real-time connection error:', error);
        showConnectionStatus('disconnected');
        
        if (eventSource.readyState === EventSource.CLOSED) {
            // Connection closed, attempt to reconnect
            attemptReconnect();
        }
    };
}

// Handle incoming real-time updates
function handleRealTimeUpdate(data) {
    switch (data.type) {
        case 'connected':
            break;
            
        case 'roster-change':
            handleRosterChange(data.data);
            break;
            
        case 'analytics-update':
            handleAnalyticsUpdate(data.data);
            break;
            
        default:
    }
}

// Handle roster changes
function handleRosterChange(changeData) {
    const { changeType, roster } = changeData;
    
    // Show notification
    const notifications = {
        add: `New duty added for ${getShiftInfo(roster)}`,
        update: `Duty updated for ${getShiftInfo(roster)}`,
        delete: `Duty removed for ${getShiftInfo(roster)}`
    };
    
    showNotification(notifications[changeType] || 'Roster updated', 'info');
    
    // If we're viewing the same month, update the display
    const currentMonth = document.getElementById('monthYear')?.value;
    if (currentMonth) {
        const [year, month] = currentMonth.split('-');
        const rosterDate = new Date(roster.date);
        
        if (parseInt(year) === rosterDate.getFullYear() && 
            parseInt(month) === rosterDate.getMonth() + 1) {
            // Reload roster data for current month
            if (typeof loadRosterData === 'function') {
                loadRosterData();
            }
        }
    }
}

// Handle analytics updates
function handleAnalyticsUpdate(analyticsData) {
    const { analytics } = analyticsData;
    
    // Update analytics display if visible
    if (document.getElementById('analyticsContent')) {
        // Update stat numbers with animation
        updateStatWithAnimation('totalShifts', analytics.totalShifts);
        updateStatWithAnimation('activeDoctors', analytics.activeDoctors);
        updateStatWithAnimation('referralDuties', analytics.referralDuties);
        
        // Update percentage displays
        const referralPercentageEl = document.querySelector('.stat-percentage');
        if (referralPercentageEl && analytics.referralPercentage !== undefined) {
            referralPercentageEl.textContent = `${analytics.referralPercentage}%`;
        }
    }
    
    // Update duty analytics if visible
    if (document.getElementById('dutyAnalyticsSection')?.style.display !== 'none') {
        // Reload duty analytics
        if (typeof loadDutyAnalytics === 'function') {
            loadDutyAnalytics();
        }
    }
}

// Update stat with animation
function updateStatWithAnimation(elementId, newValue) {
    const element = document.querySelector(`[data-value="${elementId}"]`) || 
                   document.getElementById(elementId);
    
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue !== newValue) {
        // Add update animation
        element.classList.add('updating');
        
        // Animate number change
        animateValue(element, currentValue, newValue, 500);
        
        // Remove animation class
        setTimeout(() => {
            element.classList.remove('updating');
        }, 600);
    }
}

// Animate value change
function animateValue(element, start, end, duration) {
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    
    const startTime = new Date().getTime();
    const endTime = startTime + duration;
    let timer;
    
    function run() {
        const now = new Date().getTime();
        const remaining = Math.max((endTime - now) / duration, 0);
        const value = Math.round(end - (remaining * range));
        element.textContent = value;
        
        if (value === end) {
            clearInterval(timer);
        }
    }
    
    timer = setInterval(run, stepTime);
    run();
}

// Get shift info for notifications
function getShiftInfo(roster) {
    const date = new Date(roster.date).toLocaleDateString();
    const shift = roster.shift.charAt(0).toUpperCase() + roster.shift.slice(1);
    const type = roster.isReferralDuty ? 'Referral' : shift;
    return `${date} - ${type} shift`;
}

// Show connection status
function showConnectionStatus(status) {
    const indicator = document.createElement('div');
    indicator.className = `connection-status ${status}`;
    indicator.innerHTML = `
        <i class="fas fa-${status === 'connected' ? 'wifi' : 'wifi-slash'}"></i>
        <span>${status === 'connected' ? 'Live updates active' : 'Reconnecting...'}</span>
    `;
    
    // Remove existing indicator
    const existing = document.querySelector('.connection-status');
    if (existing) {
        existing.remove();
    }
    
    // Add to navbar
    const navbar = document.querySelector('.navbar-actions');
    if (navbar) {
        navbar.insertBefore(indicator, navbar.firstChild);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Use existing notification system if available
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else if (typeof showAlert === 'function') {
        showAlert(message, type);
    } else {
    }
}

// Attempt to reconnect
function attemptReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        showConnectionStatus('error');
        return;
    }
    
    reconnectAttempts++;
    
    // Wait before reconnecting (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000);
    
    setTimeout(() => {
        initializeRealTimeUpdates();
    }, delay);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize real-time updates
    initializeRealTimeUpdates();
    
    // Reconnect on page visibility change
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && (!eventSource || eventSource.readyState === EventSource.CLOSED)) {
            initializeRealTimeUpdates();
        }
    });
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (eventSource) {
        eventSource.close();
    }
});