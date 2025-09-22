// Swap Requests Management
class SwapRequestManager {
    constructor() {
        this.myRequests = { sent: [], received: [] };
        this.allRequests = [];
        this.selectedDuty = null;
    }

    // Initialize swap request manager
    async initialize() {
        try {
            await this.loadMyRequests();
            
            // Refresh every 30 seconds
            setInterval(() => {
                this.loadMyRequests();
            }, 30000);
        } catch (error) {
            console.error('Failed to initialize swap manager:', error);
        }
    }

    // Load my swap requests
    async loadMyRequests() {
        try {
            const response = await fetch('/api/swaps/my-requests');
            const data = await response.json();
            
            if (data.success) {
                this.myRequests = data.data;
                this.updateRequestBadges();
            }
        } catch (error) {
            console.error('Error loading swap requests:', error);
        }
    }

    // Update request badges
    updateRequestBadges() {
        const pendingReceived = this.myRequests.received.filter(r => r.status === 'pending').length;
        const pendingSent = this.myRequests.sent.filter(r => r.status === 'pending').length;
        
        // Update badge in navigation if it exists
        const swapBadge = document.getElementById('swapRequestBadge');
        if (swapBadge) {
            const total = pendingReceived + pendingSent;
            swapBadge.textContent = total;
            swapBadge.style.display = total > 0 ? 'inline-block' : 'none';
        }
    }

    // Show swap request modal
    showSwapModal(dutyId = null) {
        this.selectedDuty = dutyId;
        
        let modal = document.getElementById('swapRequestModal');
        if (!modal) {
            this.createSwapModal();
            modal = document.getElementById('swapRequestModal');
        }
        
        // Load available swap targets if duty is selected
        if (dutyId) {
            this.loadAvailableTargets(dutyId);
        }
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    // Create swap request modal
    createSwapModal() {
        const modalHTML = `
        <div class="modal fade" id="swapRequestModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content glass-effect">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-exchange-alt me-2"></i>Duty Swap Requests
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs mb-3" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#newSwapTab" type="button">
                                    <i class="fas fa-plus me-1"></i>New Request
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#sentTab" type="button">
                                    <i class="fas fa-paper-plane me-1"></i>Sent
                                    <span class="badge bg-primary ms-1" id="sentBadge">0</span>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#receivedTab" type="button">
                                    <i class="fas fa-inbox me-1"></i>Received
                                    <span class="badge bg-warning ms-1" id="receivedBadge">0</span>
                                </button>
                            </li>
                            ${window.user?.role === 'admin' ? `
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#adminTab" type="button">
                                    <i class="fas fa-shield-alt me-1"></i>Admin
                                    <span class="badge bg-danger ms-1" id="adminBadge">0</span>
                                </button>
                            </li>
                            ` : ''}
                        </ul>
                        
                        <div class="tab-content">
                            <!-- New Request Tab -->
                            <div class="tab-pane fade show active" id="newSwapTab">
                                <form id="newSwapForm">
                                    <div class="mb-3">
                                        <label class="form-label">Select Your Duty to Swap</label>
                                        <select class="form-select" id="requestorDutySelect" required>
                                            <option value="">Choose a duty...</option>
                                        </select>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Select Doctor to Swap With</label>
                                        <select class="form-select" id="targetDoctorSelect" required>
                                            <option value="">Choose a doctor...</option>
                                        </select>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Select Their Duty You Want</label>
                                        <select class="form-select" id="targetDutySelect" required disabled>
                                            <option value="">First select a doctor...</option>
                                        </select>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Reason for Swap</label>
                                        <textarea class="form-control" id="swapReason" rows="3" 
                                            placeholder="Please provide a reason for this swap request..."></textarea>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-paper-plane me-2"></i>Send Swap Request
                                    </button>
                                </form>
                            </div>
                            
                            <!-- Sent Tab -->
                            <div class="tab-pane fade" id="sentTab">
                                <div id="sentRequestsList" class="swap-requests-list">
                                    <div class="text-center text-muted py-3">
                                        <i class="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                        <p>Loading sent requests...</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Received Tab -->
                            <div class="tab-pane fade" id="receivedTab">
                                <div id="receivedRequestsList" class="swap-requests-list">
                                    <div class="text-center text-muted py-3">
                                        <i class="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                        <p>Loading received requests...</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Admin Tab -->
                            ${window.user?.role === 'admin' ? `
                            <div class="tab-pane fade" id="adminTab">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h6>All Pending Swap Requests</h6>
                                        <button class="btn btn-sm btn-outline-primary" onclick="swapManager.loadAllRequests()">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                </div>
                                <div id="adminRequestsList" class="swap-requests-list">
                                    <div class="text-center text-muted py-3">
                                        <i class="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                        <p>Loading all requests...</p>
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        this.attachEventListeners();
        
        // Load data
        this.loadMyDuties();
        this.loadSwapRequests();
    }

    // Attach event listeners
    attachEventListeners() {
        // Form submission
        document.getElementById('newSwapForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitSwapRequest();
        });

        // Duty selection change - load available targets
        document.getElementById('requestorDutySelect').addEventListener('change', (e) => {
            const dutyId = e.target.value;
            if (dutyId) {
                this.loadAvailableTargets(dutyId);
            } else {
                document.getElementById('targetDoctorSelect').innerHTML = '<option value="">First select your duty...</option>';
                document.getElementById('targetDutySelect').innerHTML = '<option value="">First select a doctor...</option>';
                document.getElementById('targetDutySelect').disabled = true;
            }
        });

        // Doctor selection change
        document.getElementById('targetDoctorSelect').addEventListener('change', (e) => {
            const doctorId = e.target.value;
            if (doctorId) {
                this.loadDoctorDuties(doctorId);
            } else {
                document.getElementById('targetDutySelect').disabled = true;
                document.getElementById('targetDutySelect').innerHTML = '<option value="">First select a doctor...</option>';
            }
        });

        // Tab change events
        document.querySelectorAll('#swapRequestModal .nav-link').forEach(tab => {
            tab.addEventListener('shown.bs.tab', () => {
                this.loadSwapRequests();
            });
        });
    }

    // Load my duties for swap
    async loadMyDuties() {
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();
            
            // Load current month's roster
            const response = await fetch(`/api/roster/${currentYear}/${String(currentMonth).padStart(2, '0')}`);
            const data = await response.json();
            
            if (data.success) {
                // Get current time info
                const currentHour = today.getHours();
                const todayDateStr = today.toISOString().split('T')[0];
                
                const myDuties = data.data.filter(duty => {
                    if (duty.doctorId !== window.user?.id) return false;
                    
                    const dutyDate = new Date(duty.date);
                    const dutyDateStr = dutyDate.toISOString().split('T')[0];
                    
                    // Future dates are always valid
                    if (dutyDateStr > todayDateStr) return true;
                    
                    // For today, check if shift hasn't started yet
                    if (dutyDateStr === todayDateStr) {
                        const shiftStartHours = {
                            'morning': 7,   // 7 AM
                            'evening': 15,  // 3 PM
                            'night': 23     // 11 PM
                        };
                        
                        const shiftStartHour = shiftStartHours[duty.shift] || 7;
                        return currentHour < shiftStartHour;
                    }
                    
                    return false;
                });
                
                const select = document.getElementById('requestorDutySelect');
                select.innerHTML = '<option value="">Choose a duty...</option>';
                
                if (myDuties.length === 0) {
                    select.innerHTML = '<option value="">No upcoming duties available for swap</option>';
                } else {
                    myDuties.forEach(duty => {
                        const option = document.createElement('option');
                        option.value = duty.id;
                        option.textContent = `${duty.shift} shift on ${new Date(duty.date).toLocaleDateString()} ${duty.isReferralDuty ? '(Referral)' : ''}`;
                        
                        if (this.selectedDuty && duty.id === this.selectedDuty) {
                            option.selected = true;
                        }
                        
                        select.appendChild(option);
                    });
                }
                
                // Also load next month if we're near the end of current month
                if (today.getDate() > 20) {
                    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
                    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
                    
                    const nextResponse = await fetch(`/api/roster/${nextYear}/${String(nextMonth).padStart(2, '0')}`);
                    const nextData = await nextResponse.json();
                    
                    if (nextData.success) {
                        const nextMonthDuties = nextData.data.filter(duty => duty.doctorId === window.user?.id);
                        
                        nextMonthDuties.forEach(duty => {
                            const option = document.createElement('option');
                            option.value = duty.id;
                            option.textContent = `${duty.shift} shift on ${new Date(duty.date).toLocaleDateString()} ${duty.isReferralDuty ? '(Referral)' : ''}`;
                            
                            select.appendChild(option);
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error loading duties:', error);
        }
    }

    // Load available swap targets
    async loadAvailableTargets(dutyId) {
        try {
            const response = await fetch(`/api/swaps/available-targets/${dutyId}`);
            const data = await response.json();
            
            if (data.success) {
                const select = document.getElementById('targetDoctorSelect');
                select.innerHTML = '<option value="">Choose a doctor...</option>';
                
                data.data.forEach(option => {
                    if (option.availableDuties.length > 0) {
                        const optionEl = document.createElement('option');
                        optionEl.value = option.doctor.id;
                        optionEl.textContent = `${option.doctor.name} (${option.availableDuties.length} available duties)`;
                        select.appendChild(optionEl);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading swap targets:', error);
        }
    }

    // Load doctor's duties
    async loadDoctorDuties(doctorId) {
        try {
            const dutyId = document.getElementById('requestorDutySelect').value;
            if (!dutyId) return;
            
            const response = await fetch(`/api/swaps/available-targets/${dutyId}`);
            const data = await response.json();
            
            if (data.success) {
                const doctorData = data.data.find(d => d.doctor.id === parseInt(doctorId));
                
                const select = document.getElementById('targetDutySelect');
                select.disabled = false;
                select.innerHTML = '<option value="">Choose their duty...</option>';
                
                if (doctorData && doctorData.availableDuties) {
                    doctorData.availableDuties.forEach(duty => {
                        const option = document.createElement('option');
                        option.value = duty.id;
                        option.textContent = `${duty.shift} shift on ${new Date(duty.date).toLocaleDateString()} ${duty.isReferralDuty ? '(Referral)' : ''}`;
                        select.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading doctor duties:', error);
        }
    }

    // Submit swap request
    async submitSwapRequest() {
        try {
            const formData = {
                requestorDutyId: document.getElementById('requestorDutySelect').value,
                targetId: document.getElementById('targetDoctorSelect').value,
                targetDutyId: document.getElementById('targetDutySelect').value,
                reason: document.getElementById('swapReason').value
            };

            const response = await fetch('/api/swaps/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                showAlert('Swap request sent successfully!', 'success');
                document.getElementById('newSwapForm').reset();
                this.loadSwapRequests();
                
                // Switch to sent tab
                const sentTab = document.querySelector('[data-bs-target="#sentTab"]');
                if (sentTab) {
                    sentTab.click();
                }
            } else {
                showAlert(data.message || 'Failed to send swap request', 'error');
            }
        } catch (error) {
            console.error('Error submitting swap request:', error);
            showAlert('Failed to send swap request', 'error');
        }
    }

    // Load swap requests
    async loadSwapRequests() {
        await this.loadMyRequests();
        this.displaySentRequests();
        this.displayReceivedRequests();
        
        if (window.user?.role === 'admin') {
            await this.loadAllRequests();
        }
    }

    // Load all requests (admin)
    async loadAllRequests() {
        try {
            const response = await fetch('/api/swaps/all?status=pending');
            const data = await response.json();
            
            if (data.success) {
                this.allRequests = data.data;
                this.displayAdminRequests();
            }
        } catch (error) {
            console.error('Error loading all requests:', error);
        }
    }

    // Display sent requests
    displaySentRequests() {
        const container = document.getElementById('sentRequestsList');
        const badge = document.getElementById('sentBadge');
        
        const pending = this.myRequests.sent.filter(r => r.status === 'pending').length;
        badge.textContent = pending;
        
        if (this.myRequests.sent.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-paper-plane fa-3x mb-3"></i>
                    <p>No sent swap requests</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.myRequests.sent.map(request => this.renderSwapRequest(request, 'sent')).join('');
    }

    // Display received requests
    displayReceivedRequests() {
        const container = document.getElementById('receivedRequestsList');
        const badge = document.getElementById('receivedBadge');
        
        const pending = this.myRequests.received.filter(r => r.status === 'pending').length;
        badge.textContent = pending;
        
        if (this.myRequests.received.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No received swap requests</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.myRequests.received.map(request => this.renderSwapRequest(request, 'received')).join('');
    }

    // Display admin requests
    displayAdminRequests() {
        const container = document.getElementById('adminRequestsList');
        const badge = document.getElementById('adminBadge');
        
        const pending = this.allRequests.filter(r => r.status === 'pending').length;
        badge.textContent = pending;
        
        if (this.allRequests.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-shield-alt fa-3x mb-3"></i>
                    <p>No pending swap requests</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.allRequests.map(request => this.renderSwapRequest(request, 'admin')).join('');
    }

    // Render swap request
    renderSwapRequest(request, type) {
        const statusColors = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            cancelled: 'secondary'
        };
        
        return `
            <div class="swap-request-card ${request.status}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0">
                        ${type === 'sent' ? `To: ${request.target?.name}` : `From: ${request.requestor?.name}`}
                    </h6>
                    <span class="badge bg-${statusColors[request.status]}">${request.status.toUpperCase()}</span>
                </div>
                
                <div class="swap-details">
                    <div class="row">
                        <div class="col-5">
                            <small class="text-muted">Offering:</small>
                            <p class="mb-0">${request.requestorDuty?.shift} - ${new Date(request.requestorDuty?.date).toLocaleDateString()}</p>
                        </div>
                        <div class="col-2 text-center">
                            <i class="fas fa-exchange-alt text-primary"></i>
                        </div>
                        <div class="col-5">
                            <small class="text-muted">Requesting:</small>
                            <p class="mb-0">${request.targetDuty?.shift} - ${new Date(request.targetDuty?.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                
                ${request.reason ? `
                <div class="mt-2">
                    <small class="text-muted">Reason:</small>
                    <p class="mb-0 small">${request.reason}</p>
                </div>
                ` : ''}
                
                ${request.adminNotes && request.status === 'rejected' ? `
                <div class="mt-2">
                    <small class="text-muted">Admin Notes:</small>
                    <p class="mb-0 small text-danger">${request.adminNotes}</p>
                </div>
                ` : ''}
                
                <div class="mt-3 d-flex gap-2">
                    ${type === 'sent' && request.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="swapManager.cancelRequest('${request.id}')">
                            <i class="fas fa-times me-1"></i>Cancel
                        </button>
                    ` : ''}
                    
                    ${type === 'received' && request.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="swapManager.acceptRequest('${request.id}')">
                            <i class="fas fa-check me-1"></i>Accept
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="swapManager.declineRequest('${request.id}')">
                            <i class="fas fa-times me-1"></i>Decline
                        </button>
                    ` : ''}
                    
                    ${type === 'admin' && request.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="swapManager.approveRequest('${request.id}')">
                            <i class="fas fa-check me-1"></i>Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="swapManager.showRejectModal('${request.id}')">
                            <i class="fas fa-times me-1"></i>Reject
                        </button>
                    ` : ''}
                </div>
                
                <small class="text-muted">
                    Created: ${new Date(request.createdAt).toLocaleString()}
                </small>
            </div>
        `;
    }

    // Cancel request
    async cancelRequest(requestId) {
        if (!confirm('Are you sure you want to cancel this swap request?')) return;
        
        try {
            const response = await fetch(`/api/swaps/${requestId}/cancel`, {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                showAlert('Swap request cancelled', 'success');
                this.loadSwapRequests();
            } else {
                showAlert(data.message || 'Failed to cancel request', 'error');
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
            showAlert('Failed to cancel request', 'error');
        }
    }

    // Approve request (admin)
    async approveRequest(requestId) {
        if (!confirm('Are you sure you want to approve this swap? The duties will be immediately swapped.')) return;
        
        try {
            const response = await fetch(`/api/swaps/${requestId}/approve`, {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                showAlert('Swap request approved and duties swapped!', 'success');
                this.loadSwapRequests();
                
                // Refresh the main roster display
                if (window.loadRoster) {
                    window.loadRoster();
                }
            } else {
                showAlert(data.message || 'Failed to approve request', 'error');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            showAlert('Failed to approve request', 'error');
        }
    }

    // Show reject modal
    showRejectModal(requestId) {
        const reason = prompt('Please provide a reason for rejecting this swap request:');
        if (reason !== null) {
            this.rejectRequest(requestId, reason);
        }
    }

    // Reject request (admin)
    async rejectRequest(requestId, reason) {
        try {
            const response = await fetch(`/api/swaps/${requestId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            
            const data = await response.json();
            if (data.success) {
                showAlert('Swap request rejected', 'success');
                this.loadSwapRequests();
            } else {
                showAlert(data.message || 'Failed to reject request', 'error');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            showAlert('Failed to reject request', 'error');
        }
    }

    // Accept request (target doctor)
    async acceptRequest(requestId) {
        if (!confirm('Are you sure you want to accept this swap? Your duties will be exchanged.')) return;
        
        try {
            const response = await fetch(`/api/swaps/${requestId}/accept`, {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                showAlert('Swap request accepted! Your duties have been swapped.', 'success');
                this.loadSwapRequests();
                
                // Refresh the main roster display
                if (window.loadRoster) {
                    window.loadRoster();
                }
            } else {
                showAlert(data.message || 'Failed to accept request', 'error');
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            showAlert('Failed to accept request', 'error');
        }
    }

    // Decline request (target doctor)
    async declineRequest(requestId) {
        const reason = prompt('Please provide a reason for declining this swap request (optional):');
        
        try {
            const response = await fetch(`/api/swaps/${requestId}/decline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: reason || 'No reason provided' })
            });
            
            const data = await response.json();
            if (data.success) {
                showAlert('Swap request declined', 'success');
                this.loadSwapRequests();
            } else {
                showAlert(data.message || 'Failed to decline request', 'error');
            }
        } catch (error) {
            console.error('Error declining request:', error);
            showAlert('Failed to decline request', 'error');
        }
    }
}

// Initialize swap manager
const swapManager = new SwapRequestManager();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    await swapManager.initialize();
});