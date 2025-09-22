// ER Statistics Modal Functions

// Show Add ER Statistics Modal
function showAddERStatisticsModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('addERStatisticsModal')) {
        const modalHTML = `
            <div class="modal fade modern-modal" id="addERStatisticsModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-effect">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-hospital-user me-2"></i>Add Emergency Department Statistics
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addERStatisticsForm" class="modern-form">
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <div class="form-floating">
                                            <input type="date" class="form-control modern-input" id="statsDate" 
                                                   value="${new Date().toISOString().split('T')[0]}" required>
                                            <label for="statsDate">Date</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <hr class="my-3">
                                <h6 class="mb-3">Emergency Visit Numbers by Triage Level</h6>
                                
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control modern-input" id="criticalCases" 
                                                   placeholder="Critical" min="0" required value="0">
                                            <label for="criticalCases">Critical (CTAS 1&2)</label>
                                            <div class="form-text text-danger">Life-threatening cases</div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control modern-input" id="urgentCases" 
                                                   placeholder="Urgent" min="0" required value="0">
                                            <label for="urgentCases">Urgent (CTAS 3)</label>
                                            <div class="form-text text-warning">Urgent cases</div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control modern-input" id="nonUrgentCases" 
                                                   placeholder="Non-Urgent" min="0" required value="0">
                                            <label for="nonUrgentCases">Non-Urgent (CTAS 4&5)</label>
                                            <div class="form-text text-info">Less urgent cases</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Total Visits:</strong> <span id="totalVisits">0</span>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="modern-btn secondary-btn" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Cancel
                            </button>
                            <button type="button" class="modern-btn primary-btn" onclick="saveERStatistics()">
                                <i class="fas fa-check me-2"></i>Save Statistics
                                <div class="btn-loader"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners for auto-calculating total
        ['criticalCases', 'urgentCases', 'nonUrgentCases'].forEach(id => {
            document.getElementById(id).addEventListener('input', updateTotalVisits);
        });
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('addERStatisticsModal'));
    modal.show();
}

// Update total visits display
function updateTotalVisits() {
    const critical = parseInt(document.getElementById('criticalCases').value) || 0;
    const urgent = parseInt(document.getElementById('urgentCases').value) || 0;
    const nonUrgent = parseInt(document.getElementById('nonUrgentCases').value) || 0;
    const total = critical + urgent + nonUrgent;
    document.getElementById('totalVisits').textContent = total.toLocaleString();
}

// Save ER Statistics
async function saveERStatistics() {
    const form = document.getElementById('addERStatisticsForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const dateValue = document.getElementById('statsDate').value;
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const critical = parseInt(document.getElementById('criticalCases').value) || 0;
    const urgent = parseInt(document.getElementById('urgentCases').value) || 0;
    const nonUrgent = parseInt(document.getElementById('nonUrgentCases').value) || 0;
    
    const data = {
        year,
        month,
        day,
        statistics: {
            critical,
            urgent,
            nonUrgent
        }
    };
    
    // Show loading state
    const saveBtn = document.querySelector('#addERStatisticsModal .primary-btn');
    const originalHTML = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    
    try {
        const response = await fetch('/api/er-statistics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('addERStatisticsModal')).hide();
            
            // Show success message
            if (typeof showToast === 'function') {
                showToast('ER statistics added successfully', 'success');
            }
            
            // Reload statistics if on the same page
            if (window.selectedYear === year && window.selectedMonth === month) {
                await loadERStatistics();
            }
            
            // Reset form
            form.reset();
            updateTotalVisits();
        } else {
            if (typeof showToast === 'function') {
                showToast(result.message || 'Failed to save statistics', 'error');
            }
            alert(result.message || 'Failed to save statistics');
        }
    } catch (error) {
        console.error('Error saving ER statistics:', error);
        if (typeof showToast === 'function') {
            showToast('Error saving statistics', 'error');
        }
        alert('Error saving statistics. Please check console for details.');
    } finally {
        // Restore button state
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHTML;
    }
}

// Edit ER Statistic
async function editERStatistic(id) {
    try {
        // Fetch the statistic data
        const response = await fetch(`/api/er-statistics/${id}`);
        const result = await response.json();
        
        if (!result.success) {
            if (typeof showToast === 'function') {
                showToast('Failed to load statistic data', 'error');
            }
            return;
        }
        
        const stat = result.data;
        
        // Show the add modal with pre-filled data
        showAddERStatisticsModal();
        
        // Wait for modal to be ready
        setTimeout(() => {
            // Pre-fill the form
            // Set the date using year, month, day
            const statDate = new Date(stat.year, stat.month - 1, stat.day);
            document.getElementById('statsDate').value = statDate.toISOString().split('T')[0];
            document.getElementById('criticalCases').value = stat.statistics.critical;
            document.getElementById('urgentCases').value = stat.statistics.urgent;
            document.getElementById('nonUrgentCases').value = stat.statistics.nonUrgent;
            updateTotalVisits();
            
            // Change the save button to update
            const saveBtn = document.querySelector('#addERStatisticsModal .primary-btn');
            saveBtn.innerHTML = '<i class="fas fa-check me-2"></i>Update Statistics';
            saveBtn.onclick = () => updateERStatistics(id);
            
            // Update modal title
            document.querySelector('#addERStatisticsModal .modal-title').innerHTML = 
                '<i class="fas fa-hospital-user me-2"></i>Edit Emergency Department Statistics';
        }, 300);
        
    } catch (error) {
        console.error('Error loading statistic:', error);
        if (typeof showToast === 'function') {
            showToast('Error loading statistic data', 'error');
        }
    }
}

// Update ER Statistics
async function updateERStatistics(id) {
    const form = document.getElementById('addERStatisticsForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const critical = parseInt(document.getElementById('criticalCases').value) || 0;
    const urgent = parseInt(document.getElementById('urgentCases').value) || 0;
    const nonUrgent = parseInt(document.getElementById('nonUrgentCases').value) || 0;
    
    const data = {
        statistics: {
            critical,
            urgent,
            nonUrgent
        }
    };
    
    // Show loading state
    const updateBtn = document.querySelector('#addERStatisticsModal .primary-btn');
    const originalHTML = updateBtn.innerHTML;
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
    
    try {
        const response = await fetch(`/api/er-statistics/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('addERStatisticsModal')).hide();
            
            // Show success message
            if (typeof showToast === 'function') {
                showToast('ER statistics updated successfully', 'success');
            }
            
            // Reload statistics
            await loadERStatistics();
            
            // Reset form and button
            form.reset();
            updateTotalVisits();
            updateBtn.innerHTML = '<i class="fas fa-check me-2"></i>Save Statistics';
            updateBtn.onclick = saveERStatistics;
        } else {
            if (typeof showToast === 'function') {
                showToast(result.message || 'Failed to update statistics', 'error');
            }
            alert(result.message || 'Failed to update statistics');
        }
    } catch (error) {
        console.error('Error updating ER statistics:', error);
        if (typeof showToast === 'function') {
            showToast('Error updating statistics', 'error');
        }
        alert('Error updating statistics. Please check console for details.');
    } finally {
        // Restore button state
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalHTML;
    }
}

// Override the placeholder function
window.showAddERStatisticsModal = showAddERStatisticsModal;
window.editERStatistic = editERStatistic;