class MedicalLicense {
  constructor(id, staffMemberId, licenseType, licenseNumber, issueDate, expirationDate, issuingAuthority, additionalNotes) {
    this.id = id;
    this.staffMemberId = staffMemberId;
    this.licenseType = licenseType;
    this.licenseNumber = licenseNumber;
    this.issueDate = issueDate;
    this.expirationDate = expirationDate;
    this.issuingAuthority = issuingAuthority;
    this.additionalNotes = additionalNotes || '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Sample data with realistic license information
  static medicalLicenses = [
    // Dr. Ahmed - Multiple licenses with different statuses
    new MedicalLicense(1, 1, 'BLS', 'BLS-2024-001', '2024-01-15', '2026-01-15', 'American Heart Association', 'Renewed certification'),
    new MedicalLicense(2, 1, 'ACLS', 'ACLS-2023-045', '2023-06-20', '2025-06-20', 'American Heart Association', 'Advanced certification completed'),
    new MedicalLicense(3, 1, 'SCFHS', 'D35893', '2022-06-29', '2025-08-22', 'Saudi Commission for Health Specialties', 'Expiring soon - renewal required'),
    
    // Dr. Sarah - Mixed status licenses
    new MedicalLicense(4, 2, 'BLS', 'BLS-2023-089', '2023-03-10', '2025-03-10', 'Saudi Heart Association', 'Standard certification'),
    new MedicalLicense(5, 2, 'PALS', 'PALS-2024-012', '2024-02-28', '2026-02-28', 'American Heart Association', 'Pediatric specialty certification'),
    new MedicalLicense(6, 2, 'ACLS', 'ACLS-2022-156', '2022-09-15', '2024-09-15', 'Saudi Heart Association', 'Expired - needs renewal'),
    
    // Dr. Mohammed - Current licenses
    new MedicalLicense(7, 3, 'BLS', 'BLS-2024-067', '2024-04-12', '2026-04-12', 'American Heart Association', 'Recently renewed'),
    new MedicalLicense(8, 3, 'ACLS', 'ACLS-2024-023', '2024-01-08', '2026-01-08', 'Saudi Heart Association', 'Current certification'),
    new MedicalLicense(9, 3, 'SCFHS', 'D41256', '2023-11-30', '2026-11-30', 'Saudi Commission for Health Specialties', 'Valid medical license'),
    
    // Dr. Fatima - Expiring soon
    new MedicalLicense(10, 4, 'BLS', 'BLS-2022-134', '2022-12-05', '2024-12-05', 'Saudi Heart Association', 'Expiring in December'),
    new MedicalLicense(11, 4, 'PALS', 'PALS-2023-078', '2023-08-22', '2025-08-22', 'American Heart Association', 'Pediatric certification'),
    
    // Dr. Omar - Mixed statuses
    new MedicalLicense(12, 5, 'ACLS', 'ACLS-2024-089', '2024-05-15', '2026-05-15', 'American Heart Association', 'Current advanced certification'),
    new MedicalLicense(13, 5, 'BLS', 'BLS-2023-201', '2023-07-30', '2025-07-30', 'Saudi Heart Association', 'Standard life support'),
    
    // Dr. Aisha - Recent certifications
    new MedicalLicense(14, 6, 'BLS', 'BLS-2024-156', '2024-06-10', '2026-06-10', 'American Heart Association', 'New certification'),
    new MedicalLicense(15, 6, 'ACLS', 'ACLS-2024-134', '2024-03-25', '2026-03-25', 'Saudi Heart Association', 'Advanced life support'),
    new MedicalLicense(16, 6, 'PALS', 'PALS-2024-067', '2024-04-18', '2026-04-18', 'American Heart Association', 'Pediatric advanced life support')
  ];

  static licenseTypes = ['BLS', 'ACLS', 'PALS', 'SCFHS'];
  
  static issuingAuthorities = [
    'American Heart Association',
    'Saudi Heart Association', 
    'Saudi Commission for Health Specialties',
    'European Resuscitation Council',
    'International Liaison Committee on Resuscitation'
  ];

  // Calculate days until expiration
  static calculateDaysUntilExpiration(expirationDate) {
    if (!expirationDate) return null;
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Determine license status
  static getLicenseStatus(expirationDate) {
    const daysUntilExpiration = this.calculateDaysUntilExpiration(expirationDate);
    
    if (daysUntilExpiration === null) return 'Unknown';
    if (daysUntilExpiration < 0) return 'Expired';
    if (daysUntilExpiration <= 30) return 'Expiring Soon';
    return 'Active';
  }

  // Get status color for UI
  static getStatusColor(status) {
    switch (status) {
      case 'Active': return 'green';
      case 'Expiring Soon': return 'yellow';
      case 'Expired': return 'red';
      default: return 'gray';
    }
  }

  // Get all licenses
  static getAll() {
    return this.medicalLicenses.map(license => ({
      ...license,
      daysUntilExpiration: this.calculateDaysUntilExpiration(license.expirationDate),
      status: this.getLicenseStatus(license.expirationDate)
    }));
  }

  // Find license by ID
  static findById(id) {
    const license = this.medicalLicenses.find(license => license.id === parseInt(id));
    if (!license) return null;
    
    return {
      ...license,
      daysUntilExpiration: this.calculateDaysUntilExpiration(license.expirationDate),
      status: this.getLicenseStatus(license.expirationDate)
    };
  }

  // Get licenses by staff member
  static getByStaffMember(staffMemberId) {
    return this.medicalLicenses
      .filter(license => license.staffMemberId === parseInt(staffMemberId))
      .map(license => ({
        ...license,
        daysUntilExpiration: this.calculateDaysUntilExpiration(license.expirationDate),
        status: this.getLicenseStatus(license.expirationDate)
      }));
  }

  // Get licenses by type
  static getByLicenseType(licenseType) {
    return this.medicalLicenses
      .filter(license => license.licenseType === licenseType)
      .map(license => ({
        ...license,
        daysUntilExpiration: this.calculateDaysUntilExpiration(license.expirationDate),
        status: this.getLicenseStatus(license.expirationDate)
      }));
  }

  // Get licenses by status
  static getByStatus(status) {
    return this.getAll().filter(license => license.status === status);
  }

  // Get expiring licenses (within specified days)
  static getExpiringLicenses(withinDays = 30) {
    return this.getAll().filter(license => {
      const days = license.daysUntilExpiration;
      return days !== null && days >= 0 && days <= withinDays;
    });
  }

  // Get expired licenses
  static getExpiredLicenses() {
    return this.getAll().filter(license => {
      const days = license.daysUntilExpiration;
      return days !== null && days < 0;
    });
  }

  // Get active licenses
  static getActiveLicenses() {
    return this.getAll().filter(license => license.status === 'Active');
  }

  // Search licenses
  static searchLicenses(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.getAll().filter(license => 
      license.licenseNumber.toLowerCase().includes(term) ||
      license.licenseType.toLowerCase().includes(term) ||
      license.issuingAuthority.toLowerCase().includes(term) ||
      license.additionalNotes.toLowerCase().includes(term)
    );
  }

  // Add new license
  static add(licenseData) {
    const newId = Math.max(...this.medicalLicenses.map(l => l.id)) + 1;
    const license = new MedicalLicense(
      newId,
      parseInt(licenseData.staffMemberId),
      licenseData.licenseType,
      licenseData.licenseNumber,
      licenseData.issueDate,
      licenseData.expirationDate,
      licenseData.issuingAuthority,
      licenseData.additionalNotes || ''
    );
    this.medicalLicenses.push(license);
    return {
      ...license,
      daysUntilExpiration: this.calculateDaysUntilExpiration(license.expirationDate),
      status: this.getLicenseStatus(license.expirationDate)
    };
  }

  // Update license
  static update(id, updates) {
    const licenseIndex = this.medicalLicenses.findIndex(license => license.id === parseInt(id));
    if (licenseIndex !== -1) {
      this.medicalLicenses[licenseIndex] = { 
        ...this.medicalLicenses[licenseIndex], 
        ...updates,
        updatedAt: new Date()
      };
      const updatedLicense = this.medicalLicenses[licenseIndex];
      return {
        ...updatedLicense,
        daysUntilExpiration: this.calculateDaysUntilExpiration(updatedLicense.expirationDate),
        status: this.getLicenseStatus(updatedLicense.expirationDate)
      };
    }
    return null;
  }

  // Delete license
  static delete(id) {
    const licenseIndex = this.medicalLicenses.findIndex(license => license.id === parseInt(id));
    if (licenseIndex !== -1) {
      return this.medicalLicenses.splice(licenseIndex, 1)[0];
    }
    return null;
  }

  // Get license statistics
  static getStatistics() {
    const allLicenses = this.getAll();
    const total = allLicenses.length;
    const active = allLicenses.filter(l => l.status === 'Active').length;
    const expiringSoon = allLicenses.filter(l => l.status === 'Expiring Soon').length;
    const expired = allLicenses.filter(l => l.status === 'Expired').length;

    const licenseTypeBreakdown = {};
    this.licenseTypes.forEach(type => {
      licenseTypeBreakdown[type] = allLicenses.filter(l => l.licenseType === type).length;
    });

    const staffBreakdown = {};
    allLicenses.forEach(license => {
      staffBreakdown[license.staffMemberId] = (staffBreakdown[license.staffMemberId] || 0) + 1;
    });

    return {
      total,
      active,
      expiringSoon,
      expired,
      licenseTypeBreakdown,
      staffBreakdown,
      expirationAlerts: this.getExpiringLicenses(30)
    };
  }

  // Export to CSV
  static exportToCSV() {
    const headers = [
      'ID', 'Staff Member ID', 'License Type', 'License Number', 'Issue Date', 
      'Expiration Date', 'Days Until Expiration', 'Status', 'Issuing Authority', 
      'Additional Notes', 'Created At', 'Updated At'
    ];
    
    const csvContent = [
      headers.join(','),
      ...this.getAll().map(license => [
        license.id,
        license.staffMemberId,
        license.licenseType,
        license.licenseNumber,
        license.issueDate,
        license.expirationDate,
        license.daysUntilExpiration || 'N/A',
        license.status,
        `"${license.issuingAuthority.replace(/"/g, '""')}"`,
        `"${license.additionalNotes.replace(/"/g, '""')}"`,
        license.createdAt.toISOString(),
        license.updatedAt.toISOString()
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // Export to PDF data
  static exportToPDF() {
    return {
      title: 'Medical License Management Report',
      generatedAt: new Date().toISOString(),
      data: this.getAll(),
      statistics: this.getStatistics()
    };
  }

  // Get license types
  static getLicenseTypes() {
    return this.licenseTypes;
  }

  // Get issuing authorities
  static getIssuingAuthorities() {
    return this.issuingAuthorities;
  }
}

module.exports = MedicalLicense;
