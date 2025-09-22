// Medical License Management Module - Fixed Version
console.log('🔧 Loading Medical License Management - Fixed Version');

class MedicalLicenseManager {
    constructor() {
        this.licenses = [];
        this.doctors = [];
        this.licenseTypes = ['BLS', 'ACLS', 'PALS', 'SCFHS'];
        this.issuingAuthorities = [
            'American Heart Association',
            'Saudi Heart Association',
            'Saudi Commission for Health Specialties',
            'European Resuscitation Council',
            'International Liaison Committee on Resuscitation'
        ];
        this.filteredLicenses = [];
        this.currentEditingLicense = null;
        console.log('✅ MedicalLicenseManager constructor completed');
    }

    // Initialize the license management system
    async init() {
        console.log('🔧 Initializing Medical License Manager...');

        try {
            // Load doctors first
            console.log('Step 1: Loading doctors...');
            await this.loadDoctors();
            console.log(`✅ Doctors loaded: ${this.doctors.length} doctors`);

            // Load licenses
            console.log('Step 2: Loading licenses...');
            await this.loadLicenses();
            console.log(`✅ Licenses loaded: ${this.licenses.length} licenses`);

            console.log('✅ Medical License Manager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Error initializing Medical License Manager:', error);
            this.showNotification('Failed to initialize license management: ' + error.message, 'error');
            return false;
        }
    }

    // Load doctors data
    async loadDoctors() {
        console.log('🔧 Loading doctors data...');

        // Initialize with fallback data
        this.doctors = [
            { id: 1, name: 'Dr. Ahmed', specialty: 'Emergency Medicine' },
            { id: 2, name: 'Dr. Hagah', specialty: 'Emergency Medicine' },
            { id: 3, name: 'Dr. Shafi', specialty: 'Emergency Medicine' },
            { id: 4, name: 'Dr. Hasan', specialty: 'Emergency Medicine' },
            { id: 5, name: 'Dr. Akin', specialty: 'Emergency Medicine' },
            { id: 6, name: 'Dr. Ebuka', specialty: 'Emergency Medicine' },
            { id: 7, name: 'Dr. Rabab', specialty: 'Emergency Medicine' },
            { id: 8, name: 'Dr. Hiba', specialty: 'Emergency Medicine' }
        ];

        try {
            const response = await fetch('/api/doctors');
            if (response.ok) {
                const doctorsResponse = await response.json();
                console.log('✅ Doctors API response received:', doctorsResponse);

                if (Array.isArray(doctorsResponse)) {
                    this.doctors = doctorsResponse;
                } else if (doctorsResponse && doctorsResponse.success && Array.isArray(doctorsResponse.data)) {
                    this.doctors = doctorsResponse.data;
                } else if (doctorsResponse && Array.isArray(doctorsResponse.doctors)) {
                    this.doctors = doctorsResponse.doctors;
                }

                console.log(`✅ Final doctors loaded: ${this.doctors.length}`);
            } else {
                console.warn('⚠️ Doctors API failed, using fallback data');
            }
        } catch (error) {
            console.error('❌ Error loading doctors:', error);
            console.log('Using fallback doctor data');
        }

        return this.doctors;
    }

    // Load licenses data
    async loadLicenses() {
        console.log('🔧 Loading licenses data...');

        this.licenses = [];
        this.filteredLicenses = [];

        try {
            const response = await fetch('/api/medical-licenses');
            if (response.ok) {
                const licensesData = await response.json();
                console.log('✅ Licenses API response received');

                if (Array.isArray(licensesData)) {
                    this.licenses = licensesData;
                    this.filteredLicenses = [...this.licenses];
                    console.log(`✅ Licenses loaded: ${this.licenses.length}`);
                } else {
                    throw new Error('Invalid licenses data format');
                }
            } else {
                throw new Error(`API failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error loading licenses:', error);
            this.showNotification('Failed to load license data: ' + error.message, 'error');
        }

        return this.licenses;
    }

    // Show the license management modal
    showModal() {
        console.log('🔧 showModal() called');
        const modal = document.getElementById('licenseModal');
        
        if (!modal) {
            console.error('❌ Modal element not found!');
            this.showNotification('Error: License modal not found', 'error');
            return;
        }

        console.log('✅ Modal found, displaying...');
        modal.style.display = 'flex';
        
        // Load content
        this.loadModalContent();
    }

    // Close the license management modal
    closeModal() {
        console.log('🔧 closeModal() called');
        const modal = document.getElementById('licenseModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('✅ Modal closed');
        }
    }

    // Load modal content
    loadModalContent() {
        console.log('🔧 loadModalContent() called');
        const modalBody = document.getElementById('licenseModalBody');
        
        if (!modalBody) {
            console.error('❌ Modal body not found!');
            return;
        }

        console.log('✅ Modal body found, loading content...');

        // Create the content
        const htmlContent = this.generateModalHTML();
        modalBody.innerHTML = htmlContent;

        // Wait for DOM to update, then setup
        setTimeout(() => {
            this.setupEventListeners();
            this.updateLicenseDisplay();
            this.updateStatistics();
            console.log('✅ Modal content loaded and setup complete');
        }, 100);
    }

    // Generate modal HTML
    generateModalHTML() {
        return `
            <div class="license-management-container">
                <!-- License Status Overview -->
                <div class="license-overview glass-effect">
                    <h3><i class="fas fa-chart-bar"></i> License Status Overview</h3>
                    <div class="status-cards">
                        <div class="status-card total">
                            <div class="status-number" id="totalLicenses">0</div>
                            <div class="status-label">Total Licenses</div>
                        </div>
                        <div class="status-card active">
                            <div class="status-number" id="activeLicenses">0</div>
                            <div class="status-label">Active</div>
                        </div>
                        <div class="status-card warning">
                            <div class="status-number" id="expiringSoonLicenses">0</div>
                            <div class="status-label">Expiring Soon</div>
                        </div>
                        <div class="status-card danger">
                            <div class="status-number" id="expiredLicenses">0</div>
                            <div class="status-label">Expired</div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons glass-effect">
                    <button class="btn btn-primary" onclick="licenseManager.showAddLicenseForm()">
                        <i class="fas fa-plus"></i> Add New License
                    </button>
                    <button class="btn btn-warning" onclick="licenseManager.checkExpiryAlerts()">
                        <i class="fas fa-exclamation-triangle"></i> Check Expiry Alerts
                    </button>
                    <button class="btn btn-secondary" onclick="licenseManager.exportLicenses('csv')">
                        <i class="fas fa-download"></i> Export CSV
                    </button>
                </div>

                <!-- License List -->
                <div class="license-list-container glass-effect">
                    <div class="list-header">
                        <h3><i class="fas fa-list"></i> All Licenses</h3>
                        <div class="search-filter">
                            <input type="text" id="licenseSearch" placeholder="Search licenses..." class="form-control">
                            <select id="licenseTypeFilter" class="form-select">
                                <option value="">All Types</option>
                                <option value="BLS">BLS</option>
                                <option value="ACLS">ACLS</option>
                                <option value="PALS">PALS</option>
                                <option value="SCFHS">SCFHS</option>
                            </select>
                            <select id="licenseStatusFilter" class="form-select">
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Expiring Soon">Expiring Soon</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>
                    </div>
                    <div class="license-table-container">
                        <table class="license-table table table-striped" id="licenseTable">
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
                            <tbody id="licenseTableBody">
                                <!-- License entries will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');

        const searchInput = document.getElementById('licenseSearch');
        const typeFilter = document.getElementById('licenseTypeFilter');
        const statusFilter = document.getElementById('licenseStatusFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterLicenses());
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterLicenses());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterLicenses());
        }

        console.log('✅ Event listeners setup complete');
    }

    // Update license display
    updateLicenseDisplay() {
        console.log('🔧 updateLicenseDisplay() called');
        const tableBody = document.getElementById('licenseTableBody');
        
        if (!tableBody) {
            console.error('❌ License table body not found');
            return;
        }

        console.log(`✅ Updating display with ${this.filteredLicenses.length} licenses`);

        if (this.filteredLicenses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-certificate fa-3x text-muted mb-3"></i>
                            <h5>No licenses found</h5>
                            <p class="text-muted">Add a new license or adjust your filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        try {
            tableBody.innerHTML = this.filteredLicenses.map(license => {
                const doctor = this.doctors.find(d => d && d.id === license.staffMemberId);
                const doctorName = doctor ? doctor.name : `Doctor ${license.staffMemberId}`;
                const statusClass = this.getStatusClass(license.status);
                const daysClass = this.getDaysClass(license.daysUntilExpiration);

                return `
                    <tr>
                        <td><strong>${doctorName}</strong></td>
                        <td><span class="license-type-badge ${license.licenseType.toLowerCase()}">${license.licenseType}</span></td>
                        <td><code>${license.licenseNumber}</code></td>
                        <td>${this.formatDate(license.issueDate)}</td>
                        <td>${this.formatDate(license.expirationDate)}</td>
                        <td><span class="status-badge ${statusClass}">${license.status}</span></td>
                        <td>
                            <span class="days-badge ${daysClass}">
                                ${license.daysUntilExpiration !== null ? 
                                    (license.daysUntilExpiration >= 0 ? 
                                        `${license.daysUntilExpiration} days` : 
                                        `${Math.abs(license.daysUntilExpiration)} days ago`) : 
                                    'N/A'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-outline-primary" onclick="licenseManager.editLicense(${license.id})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="licenseManager.deleteLicense(${license.id})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            console.log('✅ License display updated successfully');
        } catch (error) {
            console.error('❌ Error updating license display:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                            <h5>Error Loading Licenses</h5>
                            <p class="text-muted">There was an error displaying the license data.</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    // Update statistics
    updateStatistics() {
        console.log('🔧 updateStatistics() called');
        const stats = this.calculateStatistics();
        
        const elements = {
            totalLicenses: document.getElementById('totalLicenses'),
            activeLicenses: document.getElementById('activeLicenses'),
            expiringSoonLicenses: document.getElementById('expiringSoonLicenses'),
            expiredLicenses: document.getElementById('expiredLicenses')
        };

        if (elements.totalLicenses) elements.totalLicenses.textContent = stats.total;
        if (elements.activeLicenses) elements.activeLicenses.textContent = stats.active;
        if (elements.expiringSoonLicenses) elements.expiringSoonLicenses.textContent = stats.expiringSoon;
        if (elements.expiredLicenses) elements.expiredLicenses.textContent = stats.expired;

        console.log('✅ Statistics updated:', stats);
    }

    // Calculate statistics
    calculateStatistics() {
        const total = this.licenses.length;
        const active = this.licenses.filter(l => l.status === 'Active').length;
        const expiringSoon = this.licenses.filter(l => l.status === 'Expiring Soon').length;
        const expired = this.licenses.filter(l => l.status === 'Expired').length;

        return { total, active, expiringSoon, expired };
    }

    // Filter licenses
    filterLicenses() {
        console.log('🔧 Filtering licenses...');

        const searchTerm = document.getElementById('licenseSearch')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('licenseTypeFilter')?.value || '';
        const statusFilter = document.getElementById('licenseStatusFilter')?.value || '';

        try {
            this.filteredLicenses = this.licenses.filter(license => {
                const doctor = this.doctors.find(d => d && d.id === license.staffMemberId);
                const doctorName = doctor && doctor.name ? doctor.name.toLowerCase() : '';

                const matchesSearch = !searchTerm ||
                    doctorName.includes(searchTerm) ||
                    (license.licenseType && license.licenseType.toLowerCase().includes(searchTerm)) ||
                    (license.licenseNumber && license.licenseNumber.toLowerCase().includes(searchTerm));

                const matchesType = !typeFilter || license.licenseType === typeFilter;
                const matchesStatus = !statusFilter || license.status === statusFilter;

                return matchesSearch && matchesType && matchesStatus;
            });

            console.log(`✅ Filtered to ${this.filteredLicenses.length} licenses`);
            this.updateLicenseDisplay();
        } catch (error) {
            console.error('❌ Error filtering licenses:', error);
            this.filteredLicenses = [...this.licenses];
            this.updateLicenseDisplay();
        }
    }

    // Get status CSS class
    getStatusClass(status) {
        switch (status) {
            case 'Active': return 'status-active';
            case 'Expiring Soon': return 'status-warning';
            case 'Expired': return 'status-danger';
            default: return 'status-unknown';
        }
    }

    // Get days CSS class
    getDaysClass(days) {
        if (days === null) return 'days-unknown';
        if (days < 0) return 'days-expired';
        if (days <= 30) return 'days-warning';
        return 'days-good';
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

    // Show notification
    showNotification(message, type = 'info') {
        console.log(`📢 Notification: ${message} (${type})`);
        
        // Try to use existing toast function
        if (typeof showToast === 'function') {
            showToast(message, type);
            return;
        }

        // Fallback to alert
        alert(message);
    }

    // Placeholder methods for additional functionality
    showAddLicenseForm() {
        this.showNotification('Add License form coming soon', 'info');
    }

    checkExpiryAlerts() {
        const expiring = this.licenses.filter(l => l.status === 'Expiring Soon' || l.status === 'Expired');
        this.showNotification(`Found ${expiring.length} licenses requiring attention`, 'warning');
    }

    editLicense(licenseId) {
        this.showNotification(`Edit license ${licenseId} - coming soon`, 'info');
    }

    deleteLicense(licenseId) {
        if (confirm('Are you sure you want to delete this license?')) {
            this.showNotification(`Delete license ${licenseId} - coming soon`, 'info');
        }
    }

    async exportLicenses(format) {
        try {
            const response = await fetch(`/api/medical-licenses/export/${format}`);
            if (response.ok) {
                if (format === 'csv') {
                    const csvContent = await response.text();
                    this.downloadFile(csvContent, 'medical-licenses.csv', 'text/csv');
                }
                this.showNotification(`Licenses exported to ${format.toUpperCase()} successfully!`, 'success');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification(`Failed to export to ${format.toUpperCase()}`, 'error');
        }
    }

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
}

// Initialize the license manager
const licenseManager = new MedicalLicenseManager();

// Global functions for dashboard integration
function showLicenses() {
    console.log('🔧 showLicenses() called - Medical License Management');

    if (!licenseManager) {
        console.error('❌ License manager not available');
        alert('Medical License Management system not available');
        return;
    }

    console.log('✅ License manager found, initializing...');

    licenseManager.init().then((success) => {
        if (success) {
            console.log('✅ License manager initialized, showing modal');
            licenseManager.showModal();
        } else {
            console.error('❌ License manager initialization failed');
            alert('Failed to initialize Medical License Management');
        }
    }).catch(error => {
        console.error('❌ Error initializing license manager:', error);
        alert('Failed to load Medical License Management: ' + error.message);
    });
}

function closeLicenseModal() {
    console.log('🔧 closeLicenseModal() called');
    if (licenseManager) {
        licenseManager.closeModal();
    }
}

// Make functions available globally
window.showLicenses = showLicenses;
window.closeLicenseModal = closeLicenseModal;
window.licenseManager = licenseManager;

console.log('✅ Medical License Management - Fixed Version loaded successfully');
console.log('Available functions:', {
    showLicenses: typeof showLicenses,
    closeLicenseModal: typeof closeLicenseModal,
    licenseManager: typeof licenseManager
});
