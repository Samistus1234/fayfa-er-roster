// License Center Module - Completely New Implementation
console.log('🔧 Loading License Center Module');

class LicenseCenter {
    constructor() {
        this.licenses = [];
        this.doctors = [];
        this.isInitialized = false;
        console.log('✅ LicenseCenter constructor completed');
    }

    // Initialize the license center
    async init() {
        console.log('🔧 Initializing License Center...');

        try {
            await this.loadDoctors();
            await this.loadLicenses();
            this.isInitialized = true;
            console.log('✅ License Center initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Error initializing License Center:', error);
            this.showNotification('Failed to initialize License Center: ' + error.message, 'error');
            return false;
        }
    }

    // Load doctors data
    async loadDoctors() {
        try {
            console.log('🔧 Loading doctors...');
            const response = await fetch('/api/doctors');
            if (response.ok) {
                const result = await response.json();
                // Handle different API response formats
                if (result.success && result.data) {
                    this.doctors = result.data;
                } else if (Array.isArray(result)) {
                    this.doctors = result;
                } else {
                    this.doctors = result;
                }
                console.log(`✅ Loaded ${this.doctors.length} doctors:`, this.doctors);
            } else {
                throw new Error('Failed to load doctors');
            }
        } catch (error) {
            console.error('❌ Error loading doctors:', error);
            // Fallback data
            this.doctors = [
                { id: 1, name: 'Dr. Ahmed', specialty: 'Emergency Medicine' },
                { id: 2, name: 'Dr. Hagah', specialty: 'Emergency Medicine' },
                { id: 3, name: 'Dr. Shafi', specialty: 'Emergency Medicine' },
                { id: 4, name: 'Dr. Hasan', specialty: 'Emergency Medicine' },
                { id: 5, name: 'Dr. Akin', specialty: 'Emergency Medicine' },
                { id: 6, name: 'Dr. Ebuka', specialty: 'Emergency Medicine' },
                { id: 7, name: 'Dr. Rabab', specialty: 'Emergency Medicine' }
            ];
        }
    }

    // Load licenses data
    async loadLicenses() {
        try {
            console.log('🔧 Loading licenses...');
            const response = await fetch('/api/medical-licenses');
            if (response.ok) {
                this.licenses = await response.json();
                console.log(`✅ Loaded ${this.licenses.length} licenses`);
            } else {
                throw new Error('Failed to load licenses');
            }
        } catch (error) {
            console.error('❌ Error loading licenses:', error);
            this.licenses = [];
        }
    }

    // Show the license center modal
    showModal() {
        console.log('🔧 Opening License Center...');
        const modal = document.getElementById('licenseCenterModal');

        if (!modal) {
            console.error('❌ License Center modal not found!');
            this.showNotification('Error: License Center modal not found', 'error');
            return;
        }

        modal.style.display = 'flex';
        modal.classList.add('show');
        this.loadModalContent();
    }

    // Close the license center modal
    closeModal() {
        const modal = document.getElementById('licenseCenterModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Wait for transition to complete
        }
    }

    // Load modal content
    loadModalContent() {
        const modalBody = document.getElementById('licenseCenterBody');
        if (!modalBody) return;

        const content = this.generateContent();
        modalBody.innerHTML = content;

        // Setup event listeners
        setTimeout(() => {
            this.setupEventListeners();
            this.refreshDisplay();
        }, 100);
    }

    // Generate modal content
    generateContent() {
        return `
            <div class="license-center-container">
                <!-- Dashboard Overview -->
                <div class="license-dashboard">
                    <div class="dashboard-cards">
                        <div class="stat-card purple">
                            <div class="stat-icon">
                                <i class="fas fa-id-badge"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="totalLicenseCount">0</div>
                                <div class="stat-label">Total Licenses</div>
                            </div>
                        </div>
                        <div class="stat-card green">
                            <div class="stat-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="activeLicenseCount">0</div>
                                <div class="stat-label">Active</div>
                            </div>
                        </div>
                        <div class="stat-card yellow">
                            <div class="stat-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="expiringSoonCount">0</div>
                                <div class="stat-label">Expiring Soon</div>
                            </div>
                        </div>
                        <div class="stat-card red">
                            <div class="stat-icon">
                                <i class="fas fa-times-circle"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="expiredCount">0</div>
                                <div class="stat-label">Expired</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="license-actions">
                    <button class="action-btn primary" onclick="licenseCenter.addNewLicense()">
                        <i class="fas fa-plus"></i>
                        Add License
                    </button>
                    <button class="action-btn info" onclick="licenseCenter.checkExpiries()">
                        <i class="fas fa-clock"></i>
                        Check Expiries
                    </button>
                    <button class="action-btn success" onclick="licenseCenter.exportData()">
                        <i class="fas fa-download"></i>
                        Export Data
                    </button>
                    <button class="action-btn warning" onclick="licenseCenter.refreshData()">
                        <i class="fas fa-sync"></i>
                        Refresh
                    </button>
                </div>

                <!-- License List -->
                <div class="license-list-section">
                    <div class="section-header">
                        <h3><i class="fas fa-list"></i> License Registry</h3>
                        <div class="search-controls">
                            <input type="text" id="licenseSearch" placeholder="Search licenses..." class="search-input">
                            <select id="statusFilter" class="filter-select">
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Expiring Soon">Expiring Soon</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>
                    </div>
                    <div class="license-grid" id="licenseGrid">
                        <!-- License cards will be populated here -->
                    </div>
                </div>
            </div>

            <style>
                .license-center-container {
                    padding: 20px;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .license-dashboard .dashboard-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 25px;
                }

                .stat-card {
                    padding: 20px;
                    border-radius: 12px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .stat-card.purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .stat-card.green { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
                .stat-card.yellow { background: linear-gradient(135deg, #FF9800 0%, #f57c00 100%); }
                .stat-card.red { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); }

                .stat-icon { font-size: 24px; }
                .stat-number { font-size: 28px; font-weight: bold; }
                .stat-label { font-size: 14px; opacity: 0.9; }

                .license-actions {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 25px;
                    flex-wrap: wrap;
                }

                .action-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
                .action-btn.primary { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); }
                .action-btn.info { background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); }
                .action-btn.success { background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); }
                .action-btn.warning { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); }

                .license-list-section .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .search-controls {
                    display: flex;
                    gap: 10px;
                }

                .search-input, .filter-select {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .license-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }

                .license-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border-left: 4px solid;
                    transition: all 0.3s ease;
                }

                .license-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }

                .license-card.active { border-left-color: #4CAF50; }
                .license-card.warning { border-left-color: #FF9800; }
                .license-card.expired { border-left-color: #f44336; }

                .license-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }

                .license-type {
                    font-weight: bold;
                    font-size: 16px;
                    color: #333;
                }

                .license-status {
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    color: white;
                }

                .license-status.active { background: #4CAF50; }
                .license-status.warning { background: #FF9800; }
                .license-status.expired { background: #f44336; }

                .license-details {
                    color: #666;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .license-actions-mini {
                    margin-top: 15px;
                    display: flex;
                    gap: 8px;
                }

                .mini-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .mini-btn.edit { background: #2196F3; color: white; }
                .mini-btn.delete { background: #f44336; color: white; }
                .mini-btn:hover { opacity: 0.8; }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                }

                .empty-icon {
                    font-size: 48px;
                    color: #ddd;
                    margin-bottom: 15px;
                }
            </style>
        `;
    }

    // Setup event listeners
    setupEventListeners() {
        const searchInput = document.getElementById('licenseSearch');
        const statusFilter = document.getElementById('statusFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterLicenses());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterLicenses());
        }
    }

    // Refresh display
    refreshDisplay() {
        this.updateStatistics();
        this.displayLicenses();
    }

    // Update statistics
    updateStatistics() {
        const total = this.licenses.length;
        const active = this.licenses.filter(l => l.status === 'Active').length;
        const expiringSoon = this.licenses.filter(l => l.status === 'Expiring Soon').length;
        const expired = this.licenses.filter(l => l.status === 'Expired').length;

        document.getElementById('totalLicenseCount').textContent = total;
        document.getElementById('activeLicenseCount').textContent = active;
        document.getElementById('expiringSoonCount').textContent = expiringSoon;
        document.getElementById('expiredCount').textContent = expired;
    }

    // Display licenses
    displayLicenses() {
        const grid = document.getElementById('licenseGrid');
        if (!grid) return;

        if (this.licenses.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-id-card"></i>
                    </div>
                    <h4>No Licenses Found</h4>
                    <p>Start by adding some medical licenses to track.</p>
                </div>
            `;
            return;
        }

        const filteredLicenses = this.getFilteredLicenses();

        grid.innerHTML = filteredLicenses.map(license => {
            const doctor = this.doctors.find(d => d.id === license.staffMemberId);
            const doctorName = doctor ? doctor.name : `Doctor ${license.staffMemberId}`;
            const statusClass = this.getStatusClass(license.status);

            return `
                <div class="license-card ${statusClass}">
                    <div class="license-header">
                        <div class="license-type">${license.licenseType}</div>
                        <div class="license-status ${statusClass}">${license.status}</div>
                    </div>
                    <div class="license-details">
                        <div><strong>Doctor:</strong> ${doctorName}</div>
                        <div><strong>License #:</strong> ${license.licenseNumber}</div>
                        <div><strong>Issued:</strong> ${this.formatDate(license.issueDate)}</div>
                        <div><strong>Expires:</strong> ${this.formatDate(license.expirationDate)}</div>
                        ${license.daysUntilExpiration !== null ?
                            `<div><strong>Days Until Expiry:</strong> ${license.daysUntilExpiration}</div>` : ''}
                    </div>
                    <div class="license-actions-mini">
                        <button class="mini-btn edit" onclick="licenseCenter.editLicense(${license.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="mini-btn delete" onclick="licenseCenter.deleteLicense(${license.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get filtered licenses
    getFilteredLicenses() {
        const searchTerm = document.getElementById('licenseSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        return this.licenses.filter(license => {
            const doctor = this.doctors.find(d => d.id === license.staffMemberId);
            const doctorName = doctor ? doctor.name.toLowerCase() : '';

            const matchesSearch = !searchTerm ||
                doctorName.includes(searchTerm) ||
                license.licenseType.toLowerCase().includes(searchTerm) ||
                license.licenseNumber.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || license.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }

    // Filter licenses
    filterLicenses() {
        this.displayLicenses();
    }

    // Get status CSS class
    getStatusClass(status) {
        switch (status) {
            case 'Active': return 'active';
            case 'Expiring Soon': return 'warning';
            case 'Expired': return 'expired';
            default: return 'active';
        }
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Action methods
    async addNewLicense() {
        console.log('🔵 Add License button clicked!');
        try {
            // Ensure doctors data is loaded
            if (!this.doctors || !Array.isArray(this.doctors)) {
                console.log('🔄 Loading doctors data...');
                await this.loadDoctors();
            }
            this.showAddLicenseModal();
        } catch (error) {
            console.error('❌ Error in addNewLicense:', error);
            alert('Error opening Add License modal: ' + error.message);
        }
    }

    async checkExpiries() {
        const expiring = this.licenses.filter(l => l.status === 'Expiring Soon' || l.status === 'Expired');
        this.showNotification(`Found ${expiring.length} licenses requiring attention`, 'warning');
    }

    async exportData() {
        try {
            const response = await fetch('/api/medical-licenses/export/csv');
            if (response.ok) {
                const csvContent = await response.text();
                this.downloadFile(csvContent, 'licenses.csv', 'text/csv');
                this.showNotification('License data exported successfully!', 'success');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            this.showNotification('Failed to export license data', 'error');
        }
    }

    async refreshData() {
        this.showNotification('Refreshing license data...', 'info');
        await this.loadLicenses();
        this.refreshDisplay();
        this.showNotification('License data refreshed!', 'success');
    }

    editLicense(licenseId) {
        this.showNotification(`Edit license ${licenseId} - coming soon!`, 'info');
    }

    deleteLicense(licenseId) {
        if (confirm('Are you sure you want to delete this license?')) {
            this.showNotification(`Delete license ${licenseId} - coming soon!`, 'info');
        }
    }

    // Add License Modal
    showAddLicenseModal() {
        console.log('🔵 Opening Add License Modal...');
        const modalHtml = `
            <div id="addLicenseModal" class="modal-overlay show" style="display: flex;">
                <div class="add-license-modal glass-card" style="width: 90vw; max-width: 600px; max-height: 90vh; overflow-y: auto; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); border-radius: 16px;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px 12px 0 0;">
                        <div class="header-content" style="display: flex; align-items: center; gap: 1rem;">
                            <div class="header-icon" style="font-size: 1.5rem;">
                                <i class="fas fa-plus-circle"></i>
                            </div>
                            <div>
                                <h2 style="margin: 0; font-size: 1.5rem;">Add New Medical License</h2>
                                <p style="margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 0.9rem;">Create a new license record</p>
                            </div>
                        </div>
                        <button class="close-btn" onclick="licenseCenter.closeAddLicenseModal()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.5rem;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 2rem;">
                        <form id="addLicenseForm" style="display: grid; gap: 1.5rem;">
                            <div class="form-group">
                                <label for="staffMember" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Staff Member *</label>
                                <select id="staffMember" required style="width: 100%; padding: 0.75rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background: rgba(255, 255, 255, 0.9);">
                                    <option value="">Select a staff member</option>
                                    ${(this.doctors && Array.isArray(this.doctors)) ? this.doctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('') : '<option value="">Loading staff members...</option>'}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="licenseType" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">License Type *</label>
                                <select id="licenseType" required style="width: 100%; padding: 0.75rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background: rgba(255, 255, 255, 0.9);">
                                    <option value="">Select license type</option>
                                    <option value="Medical License">Medical License</option>
                                    <option value="Board Certification">Board Certification</option>
                                    <option value="DEA License">DEA License</option>
                                    <option value="State Medical License">State Medical License</option>
                                    <option value="Specialty Certification">Specialty Certification</option>
                                    <option value="CPR Certification">CPR Certification</option>
                                    <option value="ACLS Certification">ACLS Certification</option>
                                    <option value="BLS Certification">BLS Certification</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="licenseNumber" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">License Number *</label>
                                <input type="text" id="licenseNumber" required placeholder="Enter license number" style="width: 100%; padding: 0.75rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background: rgba(255, 255, 255, 0.9);">
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label for="issueDate" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Issue Date *</label>
                                    <input type="date" id="issueDate" required style="width: 100%; padding: 0.75rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background: rgba(255, 255, 255, 0.9);">
                                </div>

                                <div class="form-group">
                                    <label for="expirationDate" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Expiration Date *</label>
                                    <input type="date" id="expirationDate" required style="width: 100%; padding: 0.75rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background: rgba(255, 255, 255, 0.9);">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="issuingAuthority" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Issuing Authority *</label>
                                <input type="text" id="issuingAuthority" required placeholder="e.g., State Medical Board, American Board of Emergency Medicine" style="width: 100%; padding: 0.75rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; color: #1f2937; background: rgba(255, 255, 255, 0.9);">
                            </div>

                            <div class="form-group">
                                <label for="additionalNotes" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Additional Notes</label>
                                <textarea id="additionalNotes" placeholder="Enter any additional notes or comments..." rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; resize: vertical; color: #1f2937; background: rgba(255, 255, 255, 0.9);"></textarea>
                            </div>

                            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                                <button type="button" onclick="licenseCenter.closeAddLicenseModal()" style="padding: 0.75rem 1.5rem; border: 2px solid #d1d5db; background: rgba(255, 255, 255, 0.9); color: #1f2937; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600;">
                                    Cancel
                                </button>
                                <button type="submit" style="padding: 0.75rem 1.5rem; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600;">
                                    <i class="fas fa-plus"></i> Add License
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('addLicenseModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // If doctors were just loaded, update the dropdown
        if (this.doctors && Array.isArray(this.doctors) && this.doctors.length > 0) {
            const staffSelect = document.getElementById('staffMember');
            staffSelect.innerHTML = `
                <option value="">Select a staff member</option>
                ${this.doctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('')}
            `;
        }

        // Setup form submission
        const form = document.getElementById('addLicenseForm');
        form.addEventListener('submit', (e) => this.handleAddLicenseSubmit(e));
    }

    closeAddLicenseModal() {
        const modal = document.getElementById('addLicenseModal');
        if (modal) {
            modal.remove();
        }
    }

    async handleAddLicenseSubmit(e) {
        e.preventDefault();

        const formData = {
            staffMemberId: document.getElementById('staffMember').value,
            licenseType: document.getElementById('licenseType').value,
            licenseNumber: document.getElementById('licenseNumber').value,
            issueDate: document.getElementById('issueDate').value,
            expirationDate: document.getElementById('expirationDate').value,
            issuingAuthority: document.getElementById('issuingAuthority').value,
            additionalNotes: document.getElementById('additionalNotes').value
        };

        try {
            this.showNotification('Adding new license...', 'info');

            const response = await fetch('/api/medical-licenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newLicense = await response.json();
                this.showNotification('License added successfully!', 'success');
                this.closeAddLicenseModal();
                await this.loadLicenses(); // Refresh the license list
                this.refreshDisplay();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add license');
            }
        } catch (error) {
            console.error('Error adding license:', error);
            this.showNotification('Failed to add license: ' + error.message, 'error');
        }
    }

    // Helper methods
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${message} (${type})`);
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize and setup global functions
const licenseCenter = new LicenseCenter();

function openLicenseCenter() {
    console.log('🔧 Opening License Center...');

    licenseCenter.init().then((success) => {
        if (success) {
            licenseCenter.showModal();
        } else {
            alert('Failed to initialize License Center');
        }
    }).catch(error => {
        console.error('❌ Error:', error);
        alert('Failed to load License Center: ' + error.message);
    });
}

function closeLicenseCenter() {
    licenseCenter.closeModal();
}

// Make functions globally available
window.openLicenseCenter = openLicenseCenter;
window.closeLicenseCenter = closeLicenseCenter;
window.licenseCenter = licenseCenter;

console.log('✅ License Center Module loaded successfully');