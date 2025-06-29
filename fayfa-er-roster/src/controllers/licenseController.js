const License = require('../models/License');
const Doctor = require('../models/Doctor');

const licenseController = {
  getAllLicenses: (req, res) => {
    try {
      const licenses = License.getAll();
      res.json({ success: true, data: licenses });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getLicensesByDoctor: (req, res) => {
    try {
      const { doctorId } = req.params;
      const licenses = License.getByDoctor(parseInt(doctorId));
      
      // Add days until expiry for each license
      const licensesWithExpiry = licenses.map(license => ({
        ...license,
        daysUntilExpiry: License.getDaysUntilExpiry(license.expiryDate)
      }));
      
      res.json({ success: true, data: licensesWithExpiry });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getLicenseStatus: (req, res) => {
    try {
      const summary = License.getLicensesByStatus();
      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getExpiringLicenses: (req, res) => {
    try {
      const expiringLicenses = License.getExpiringLicenses();
      const Doctor = require('../models/Doctor');
      
      // Add doctor details to each license
      const licensesWithDoctors = expiringLicenses.map(license => {
        const doctor = Doctor.findById(license.doctorId);
        return {
          ...license,
          doctorName: doctor ? doctor.name : 'Unknown',
          doctorEmail: doctor ? doctor.email : '',
          doctorPhone: doctor ? doctor.phone : '',
          daysUntilExpiry: License.getDaysUntilExpiry(license.expiryDate)
        };
      });
      
      res.json({ success: true, data: licensesWithDoctors });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createLicense: (req, res) => {
    try {
      const { doctorId, type, licenseNumber, issueDate, expiryDate } = req.body;

      // Validation
      if (!doctorId || !type || !licenseNumber || !issueDate || !expiryDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      // Validate doctor exists
      const doctor = Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor not found' 
        });
      }

      // Validate type
      const validTypes = ['SCFHS', 'BLS', 'ACLS', 'PALS'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid license type. Must be SCFHS, BLS, ACLS, or PALS' 
        });
      }

      // Check for duplicate license
      const existingLicenses = License.getByDoctor(doctorId);
      const duplicate = existingLicenses.find(l => 
        l.type === type && l.status !== 'expired'
      );
      
      if (duplicate) {
        return res.status(400).json({ 
          success: false, 
          message: `Active ${type} license already exists for this doctor` 
        });
      }

      const license = License.add({
        doctorId,
        type,
        licenseNumber,
        issueDate,
        expiryDate
      });

      res.status(201).json({ 
        success: true, 
        data: license,
        message: 'License added successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateLicense: (req, res) => {
    try {
      const license = License.update(req.params.id, req.body);
      if (!license) {
        return res.status(404).json({ success: false, message: 'License not found' });
      }
      res.json({ success: true, data: license });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteLicense: (req, res) => {
    try {
      const license = License.delete(req.params.id);
      if (!license) {
        return res.status(404).json({ success: false, message: 'License not found' });
      }
      res.json({ success: true, message: 'License deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  checkExpiry: (req, res) => {
    try {
      const expiringLicenses = License.getExpiringLicenses();
      const expiredLicenses = License.getExpiredLicenses();
      
      const notifications = [];
      
      // Process expiring licenses
      expiringLicenses.forEach(license => {
        const doctor = Doctor.findById(license.doctorId);
        const daysUntilExpiry = License.getDaysUntilExpiry(license.expiryDate);
        
        notifications.push({
          type: 'expiring_soon',
          license: license,
          doctor: doctor,
          message: `${license.type} license expires in ${daysUntilExpiry} days`,
          priority: daysUntilExpiry <= 30 ? 'high' : 'medium'
        });
      });
      
      // Process expired licenses
      expiredLicenses.forEach(license => {
        const doctor = Doctor.findById(license.doctorId);
        
        notifications.push({
          type: 'expired',
          license: license,
          doctor: doctor,
          message: `${license.type} license has expired`,
          priority: 'critical'
        });
      });
      
      res.json({ 
        success: true, 
        data: {
          notifications,
          expiringCount: expiringLicenses.length,
          expiredCount: expiredLicenses.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = licenseController;