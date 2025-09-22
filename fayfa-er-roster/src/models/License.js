class License {
  constructor(id, doctorId, type, licenseNumber, issueDate, expiryDate, status, createdAt) {
    this.id = id;
    this.doctorId = doctorId;
    this.type = type; // 'SCFHS', 'BLS', 'ACLS', 'PALS'
    this.licenseNumber = licenseNumber;
    this.issueDate = new Date(issueDate);
    this.expiryDate = new Date(expiryDate);
    this.status = status || 'active'; // 'active', 'expiring_soon', 'expired'
    this.createdAt = createdAt || new Date();
    this.lastNotified = null;
  }

  static licenses = [];

  static getAll() {
    return this.licenses;
  }

  static findById(id) {
    return this.licenses.find(license => license.id === parseInt(id));
  }

  static getByDoctor(doctorId) {
    return this.licenses.filter(license => license.doctorId === parseInt(doctorId));
  }

  static getByType(type) {
    return this.licenses.filter(license => license.type === type);
  }

  static add(licenseData) {
    const newId = this.licenses.length > 0 
      ? Math.max(...this.licenses.map(l => l.id)) + 1 
      : 1;
    
    const license = new License(
      newId,
      licenseData.doctorId,
      licenseData.type,
      licenseData.licenseNumber,
      licenseData.issueDate,
      licenseData.expiryDate,
      licenseData.status
    );
    
    // Update status based on expiry date
    license.status = this.calculateStatus(license.expiryDate);
    
    this.licenses.push(license);
    return license;
  }

  static update(id, updates) {
    const licenseIndex = this.licenses.findIndex(lic => lic.id === parseInt(id));
    if (licenseIndex !== -1) {
      this.licenses[licenseIndex] = { ...this.licenses[licenseIndex], ...updates };
      
      // Recalculate status if expiry date changed
      if (updates.expiryDate) {
        this.licenses[licenseIndex].status = this.calculateStatus(new Date(updates.expiryDate));
      }
      
      return this.licenses[licenseIndex];
    }
    return null;
  }

  static delete(id) {
    const licenseIndex = this.licenses.findIndex(lic => lic.id === parseInt(id));
    if (licenseIndex !== -1) {
      return this.licenses.splice(licenseIndex, 1)[0];
    }
    return null;
  }

  static calculateStatus(expiryDate) {
    const now = new Date();
    const twoMonthsFromNow = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days
    
    if (expiryDate < now) {
      return 'expired';
    } else if (expiryDate <= twoMonthsFromNow) {
      return 'expiring_soon';
    }
    return 'active';
  }

  static getExpiringLicenses() {
    const now = new Date();
    const twoMonthsFromNow = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000));
    
    return this.licenses.filter(license => {
      const expiryDate = new Date(license.expiryDate);
      return expiryDate > now && expiryDate <= twoMonthsFromNow;
    });
  }

  static getExpiredLicenses() {
    const now = new Date();
    return this.licenses.filter(license => new Date(license.expiryDate) < now);
  }

  static getLicensesByStatus() {
    const Doctor = require('./Doctor');
    const doctors = Doctor.getAll();
    
    const summary = {
      total: this.licenses.length,
      active: 0,
      expiringSoon: 0,
      expired: 0,
      byType: {
        SCFHS: { active: 0, expiringSoon: 0, expired: 0 },
        BLS: { active: 0, expiringSoon: 0, expired: 0 },
        ACLS: { active: 0, expiringSoon: 0, expired: 0 },
        PALS: { active: 0, expiringSoon: 0, expired: 0 }
      },
      doctorSummary: []
    };

    // Update all license statuses
    this.licenses.forEach(license => {
      license.status = this.calculateStatus(license.expiryDate);
      
      // Count by status
      if (license.status === 'active') summary.active++;
      else if (license.status === 'expiring_soon') summary.expiringSoon++;
      else if (license.status === 'expired') summary.expired++;
      
      // Count by type and status
      if (summary.byType[license.type]) {
        if (license.status === 'active') summary.byType[license.type].active++;
        else if (license.status === 'expiring_soon') summary.byType[license.type].expiringSoon++;
        else if (license.status === 'expired') summary.byType[license.type].expired++;
      }
    });

    // Create doctor summary
    doctors.forEach(doctor => {
      const doctorLicenses = this.getByDoctor(doctor.id);
      const expiring = doctorLicenses.filter(l => l.status === 'expiring_soon');
      const expired = doctorLicenses.filter(l => l.status === 'expired');
      
      if (expiring.length > 0 || expired.length > 0) {
        summary.doctorSummary.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorEmail: doctor.email,
          doctorPhone: doctor.phone,
          expiringLicenses: expiring,
          expiredLicenses: expired
        });
      }
    });

    return summary;
  }

  static getDaysUntilExpiry(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

module.exports = License;