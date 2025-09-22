// Notification Settings Management
class NotificationSettings {
    constructor() {
        this.initialized = false;
        this.settings = {
            email: true,
            sms: false,
            push: false
        };
    }

    // Initialize notification settings
    async initialize() {
        try {
            // Load user preferences
            await this.loadSettings();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize notification settings:', error);
        }
    }

    // Load user notification settings
    async loadSettings() {
        try {
            const response = await fetch('/api/preferences/my-preferences');
            const data = await response.json();
            
            if (data.success) {
                this.settings = {
                    email: data.data.emailEnabled,
                    sms: data.data.smsEnabled,
                    push: data.data.pushEnabled,
                    emailReminderTime: data.data.emailReminderTime,
                    smsReminderTime: data.data.smsReminderTime,
                    pushReminderTime: data.data.pushReminderTime,
                    quietHoursStart: data.data.quietHoursStart,
                    quietHoursEnd: data.data.quietHoursEnd,
                    notifyForEmergency: data.data.notifyForEmergency,
                    notifyForLicenseExpiry: data.data.notifyForLicenseExpiry,
                    notifyForDutyChanges: data.data.notifyForDutyChanges
                };
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
            // Fallback to localStorage
            const savedSettings = localStorage.getItem('notificationSettings');
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
            }
        }
    }

    // Save settings
    async saveSettings() {
        try {
            const response = await fetch('/api/preferences/my-preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailEnabled: this.settings.email,
                    smsEnabled: this.settings.sms,
                    pushEnabled: this.settings.push,
                    emailReminderTime: parseInt(this.settings.emailReminderTime),
                    smsReminderTime: parseInt(this.settings.smsReminderTime),
                    pushReminderTime: parseInt(this.settings.pushReminderTime),
                    quietHoursStart: this.settings.quietHoursStart,
                    quietHoursEnd: this.settings.quietHoursEnd,
                    notifyForEmergency: this.settings.notifyForEmergency,
                    notifyForLicenseExpiry: this.settings.notifyForLicenseExpiry,
                    notifyForDutyChanges: this.settings.notifyForDutyChanges
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showAlert('Notification settings saved', 'success');
                // Also save to localStorage as backup
                localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
            } else {
                showAlert('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showAlert('Failed to save settings', 'error');
        }
    }

    // Show notification settings modal
    showSettingsModal() {
        const modal = document.getElementById('notificationSettingsModal');
        if (!modal) {
            this.createSettingsModal();
        }
        
        // Update UI with current settings
        this.updateSettingsUI();
        
        // Show modal
        const bsModal = new bootstrap.Modal(document.getElementById('notificationSettingsModal'));
        bsModal.show();
    }

    // Create settings modal
    createSettingsModal() {
        const modalHTML = `
        <div class="modal fade" id="notificationSettingsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content glass-effect">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-bell me-2"></i>Notification Settings
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="notification-settings-container">
                            <!-- Email Notifications -->
                            <div class="notification-channel-card">
                                <div class="channel-header">
                                    <div class="channel-info">
                                        <i class="fas fa-envelope channel-icon"></i>
                                        <div>
                                            <h6>Email Notifications</h6>
                                            <p class="text-muted mb-0">Receive duty reminders via email</p>
                                        </div>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="emailNotifications" checked>
                                    </div>
                                </div>
                                <div class="channel-settings mt-3">
                                    <div class="setting-item">
                                        <label>Email Address</label>
                                        <input type="email" class="form-control" id="notificationEmail" 
                                               value="${window.user?.email || ''}" readonly>
                                    </div>
                                    <div class="setting-item mt-2">
                                        <label>Send reminders</label>
                                        <select class="form-select" id="emailReminderTime">
                                            <option value="120">2 hours before</option>
                                            <option value="60">1 hour before</option>
                                            <option value="30">30 minutes before</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- SMS Notifications -->
                            <div class="notification-channel-card mt-3">
                                <div class="channel-header">
                                    <div class="channel-info">
                                        <i class="fas fa-sms channel-icon"></i>
                                        <div>
                                            <h6>SMS Notifications</h6>
                                            <p class="text-muted mb-0">Receive duty reminders via SMS</p>
                                        </div>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="smsNotifications">
                                    </div>
                                </div>
                                <div class="channel-settings mt-3" id="smsSettings" style="display: none;">
                                    <div class="setting-item">
                                        <label>Phone Number</label>
                                        <input type="tel" class="form-control" id="notificationPhone" 
                                               placeholder="+966 50 123 4567">
                                    </div>
                                    <div class="setting-item mt-2">
                                        <label>Send reminders</label>
                                        <select class="form-select" id="smsReminderTime">
                                            <option value="120">2 hours before</option>
                                            <option value="60">1 hour before</option>
                                            <option value="30">30 minutes before</option>
                                        </select>
                                    </div>
                                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="notificationSettings.testSMS()">
                                        <i class="fas fa-paper-plane me-1"></i>Send Test SMS
                                    </button>
                                </div>
                            </div>

                            <!-- Push Notifications -->
                            <div class="notification-channel-card mt-3">
                                <div class="channel-header">
                                    <div class="channel-info">
                                        <i class="fas fa-mobile-alt channel-icon"></i>
                                        <div>
                                            <h6>Push Notifications</h6>
                                            <p class="text-muted mb-0">Receive browser push notifications</p>
                                        </div>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="pushNotifications">
                                    </div>
                                </div>
                                <div class="channel-settings mt-3" id="pushSettings" style="display: none;">
                                    <p class="text-muted">Push notifications will be sent to this browser</p>
                                    <button class="btn btn-sm btn-outline-primary" onclick="pushManager.testNotification()">
                                        <i class="fas fa-bell me-1"></i>Send Test Notification
                                    </button>
                                </div>
                            </div>

                            <!-- Notification History -->
                            <div class="mt-4">
                                <h6 class="mb-3">Notification History</h6>
                                <div class="notification-history" id="notificationHistory">
                                    <div class="text-center text-muted py-3">
                                        <i class="fas fa-inbox fa-2x mb-2"></i>
                                        <p>Loading notification history...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="notificationSettings.save()">
                            <i class="fas fa-save me-2"></i>Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        this.attachEventListeners();
    }

    // Attach event listeners
    attachEventListeners() {
        // Toggle SMS settings
        document.getElementById('smsNotifications').addEventListener('change', (e) => {
            const smsSettings = document.getElementById('smsSettings');
            smsSettings.style.display = e.target.checked ? 'block' : 'none';
            this.settings.sms = e.target.checked;
        });

        // Toggle Push settings
        document.getElementById('pushNotifications').addEventListener('change', async (e) => {
            const pushSettings = document.getElementById('pushSettings');
            pushSettings.style.display = e.target.checked ? 'block' : 'none';
            this.settings.push = e.target.checked;
            
            if (e.target.checked && !pushManager.isSubscribed) {
                await pushManager.enableNotifications();
            } else if (!e.target.checked && pushManager.isSubscribed) {
                await pushManager.unsubscribeUser();
            }
        });

        // Email toggle
        document.getElementById('emailNotifications').addEventListener('change', (e) => {
            this.settings.email = e.target.checked;
        });
    }

    // Update settings UI
    updateSettingsUI() {
        document.getElementById('emailNotifications').checked = this.settings.email;
        document.getElementById('smsNotifications').checked = this.settings.sms;
        document.getElementById('pushNotifications').checked = pushManager.isSubscribed;
        
        // Show/hide settings based on toggles
        document.getElementById('smsSettings').style.display = this.settings.sms ? 'block' : 'none';
        document.getElementById('pushSettings').style.display = pushManager.isSubscribed ? 'block' : 'none';
        
        // Load notification history
        this.loadNotificationHistory();
    }

    // Load notification history
    async loadNotificationHistory() {
        try {
            const response = await fetch('/api/sms/history?limit=10');
            const data = await response.json();
            
            const historyContainer = document.getElementById('notificationHistory');
            
            if (data.success && data.data.length > 0) {
                historyContainer.innerHTML = data.data.map(msg => `
                    <div class="history-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-${msg.type === 'sms' ? 'sms' : 'envelope'} me-2"></i>
                                    <strong>${msg.type.toUpperCase()}</strong>
                                    <span class="badge bg-secondary ms-2">${msg.type}</span>
                                </div>
                                <p class="mb-0 mt-1 text-muted small">${msg.message}</p>
                            </div>
                            <small class="text-muted">${new Date(msg.timestamp).toLocaleString()}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                historyContainer.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No notification history available</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading notification history:', error);
        }
    }

    // Test SMS
    async testSMS() {
        const phone = document.getElementById('notificationPhone').value;
        if (!phone) {
            showAlert('Please enter a phone number', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/sms/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    doctorId: window.user?.id || 1,
                    message: 'Test SMS from Fayfa ER Roster'
                })
            });

            const data = await response.json();
            if (data.success) {
                showAlert('Test SMS sent successfully!', 'success');
            } else {
                showAlert('Failed to send test SMS', 'error');
            }
        } catch (error) {
            console.error('Error sending test SMS:', error);
            showAlert('Failed to send test SMS', 'error');
        }
    }

    // Save settings
    async save() {
        try {
            const settings = {
                email: document.getElementById('emailNotifications').checked,
                sms: document.getElementById('smsNotifications').checked,
                push: document.getElementById('pushNotifications').checked,
                phone: document.getElementById('notificationPhone').value,
                emailReminderTime: document.getElementById('emailReminderTime').value,
                smsReminderTime: document.getElementById('smsReminderTime').value
            };

            // Save to localStorage for now
            this.settings = settings;
            await this.saveSettings();

            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('notificationSettingsModal')).hide();
        } catch (error) {
            console.error('Error saving settings:', error);
            showAlert('Failed to save settings', 'error');
        }
    }
}

// Initialize notification settings
const notificationSettings = new NotificationSettings();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    await notificationSettings.initialize();
});