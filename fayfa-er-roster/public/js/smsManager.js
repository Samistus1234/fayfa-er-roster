// SMS Manager for Admin Dashboard
class SMSManager {
    constructor() {
        this.serviceEnabled = false;
        this.stats = {};
    }

    // Initialize SMS manager
    async initialize() {
        try {
            await this.loadStatus();
            await this.loadRecentActivity();
            
            // Refresh every 30 seconds
            setInterval(() => {
                this.loadStatus();
                this.loadRecentActivity();
            }, 30000);
        } catch (error) {
            console.error('Failed to initialize SMS manager:', error);
        }
    }

    // Load SMS service status
    async loadStatus() {
        try {
            const response = await fetch('/api/sms/status');
            const data = await response.json();
            
            if (data.success) {
                this.serviceEnabled = data.data.enabled;
                this.stats = data.data;
                this.updateStatusUI();
            }
        } catch (error) {
            console.error('Error loading SMS status:', error);
        }
    }

    // Update status UI
    updateStatusUI() {
        // Update service status badge
        const statusBadge = document.getElementById('smsServiceStatus');
        if (statusBadge) {
            statusBadge.textContent = this.serviceEnabled ? 'Active' : 'Disabled';
            statusBadge.className = `badge ${this.serviceEnabled ? 'bg-success' : 'bg-secondary'}`;
        }

        // Update statistics
        const statsContainer = document.getElementById('smsStats');
        if (statsContainer) {
            const thisMonth = this.calculateThisMonthCount();
            
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-value">${this.stats.totalSent || 0}</span>
                    <span class="stat-label">Total Sent</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${thisMonth}</span>
                    <span class="stat-label">This Month</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.stats.failed || 0}</span>
                    <span class="stat-label">Failed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.stats.provider || 'Mock'}</span>
                    <span class="stat-label">Provider</span>
                </div>
            `;
        }
    }

    // Calculate this month's SMS count
    calculateThisMonthCount() {
        if (!this.stats.byType) return 0;
        
        // In a real implementation, this would filter by date
        const total = Object.values(this.stats.byType).reduce((sum, count) => sum + count, 0);
        return Math.floor(total * 0.3); // Mock: assume 30% are from this month
    }

    // Load recent SMS activity
    async loadRecentActivity() {
        try {
            const response = await fetch('/api/sms/history?limit=5');
            const data = await response.json();
            
            const container = document.getElementById('recentSmsActivity');
            if (!container) return;
            
            if (data.success && data.data.length > 0) {
                container.innerHTML = data.data.map(msg => `
                    <div class="history-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-sms me-2"></i>
                                    <strong>${msg.recipient}</strong>
                                    <span class="badge bg-${this.getTypeBadgeColor(msg.type)} ms-2">${msg.type}</span>
                                </div>
                                <p class="mb-0 mt-1 text-muted small">${this.truncateMessage(msg.message)}</p>
                            </div>
                            <small class="text-muted">${this.formatTime(msg.timestamp)}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No SMS activity yet</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading SMS activity:', error);
        }
    }

    // Get badge color for message type
    getTypeBadgeColor(type) {
        const colors = {
            'duty-reminder': 'primary',
            'license-expiry': 'warning',
            'emergency': 'danger',
            'test': 'secondary'
        };
        return colors[type] || 'secondary';
    }

    // Truncate long messages
    truncateMessage(message) {
        return message.length > 80 ? message.substring(0, 77) + '...' : message;
    }

    // Format timestamp
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        
        return date.toLocaleDateString();
    }

    // Toggle SMS service
    async toggleService() {
        try {
            const newState = !this.serviceEnabled;
            
            const response = await fetch('/api/sms/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enabled: newState })
            });

            const data = await response.json();
            if (data.success) {
                this.serviceEnabled = newState;
                this.updateStatusUI();
                showAlert(`SMS service ${newState ? 'enabled' : 'disabled'}`, 'success');
            } else {
                showAlert('Failed to toggle SMS service', 'error');
            }
        } catch (error) {
            console.error('Error toggling SMS service:', error);
            showAlert('Failed to toggle SMS service', 'error');
        }
    }

    // Show emergency alert modal
    showEmergencyModal() {
        const modal = document.getElementById('emergencyAlertModal');
        if (!modal) {
            this.createEmergencyModal();
        }
        
        const bsModal = new bootstrap.Modal(document.getElementById('emergencyAlertModal'));
        bsModal.show();
    }

    // Create emergency alert modal
    createEmergencyModal() {
        const modalHTML = `
        <div class="modal fade" id="emergencyAlertModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content glass-effect">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>Send Emergency Alert
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger">
                            <i class="fas fa-info-circle me-2"></i>
                            This will send an SMS to all available doctors immediately.
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Emergency Message</label>
                            <textarea class="form-control" id="emergencyMessage" rows="4" 
                                placeholder="Enter emergency message..." maxlength="160"></textarea>
                            <small class="text-muted">
                                <span id="charCount">0</span>/160 characters
                            </small>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Preview</label>
                            <div class="alert alert-light">
                                <strong>🚨 EMERGENCY ALERT 🚨</strong><br>
                                <span id="messagePreview">Your message will appear here...</span><br>
                                <small>Please respond immediately.</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="smsManager.sendEmergencyAlert()">
                            <i class="fas fa-paper-plane me-2"></i>Send Alert
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listener for character count
        const messageInput = document.getElementById('emergencyMessage');
        const charCount = document.getElementById('charCount');
        const preview = document.getElementById('messagePreview');
        
        messageInput.addEventListener('input', (e) => {
            charCount.textContent = e.target.value.length;
            preview.textContent = e.target.value || 'Your message will appear here...';
        });
    }

    // Send emergency alert
    async sendEmergencyAlert() {
        const message = document.getElementById('emergencyMessage').value.trim();
        
        if (!message) {
            showAlert('Please enter an emergency message', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/sms/emergency', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            if (data.success) {
                showAlert(`Emergency alert sent to ${data.details.sent} doctors`, 'success');
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('emergencyAlertModal')).hide();
                
                // Clear form
                document.getElementById('emergencyMessage').value = '';
                
                // Refresh activity
                await this.loadRecentActivity();
            } else {
                showAlert('Failed to send emergency alert', 'error');
            }
        } catch (error) {
            console.error('Error sending emergency alert:', error);
            showAlert('Failed to send emergency alert', 'error');
        }
    }
}

// Initialize SMS manager
const smsManager = new SMSManager();

// Initialize on DOM ready (only for admins)
document.addEventListener('DOMContentLoaded', async () => {
    if (window.user && window.user.role === 'admin') {
        await smsManager.initialize();
    }
});