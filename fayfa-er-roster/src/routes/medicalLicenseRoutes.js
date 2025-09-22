const express = require('express');
const router = express.Router();
const MedicalLicense = require('../models/MedicalLicense');

// Get all medical licenses
router.get('/', (req, res) => {
  try {
    const licenses = MedicalLicense.getAll();
    res.json(licenses);
  } catch (error) {
    console.error('Error fetching medical licenses:', error);
    res.status(500).json({ error: 'Failed to fetch medical licenses' });
  }
});

// Get medical license by ID
router.get('/:id', (req, res) => {
  try {
    const license = MedicalLicense.findById(req.params.id);
    if (!license) {
      return res.status(404).json({ error: 'Medical license not found' });
    }
    res.json(license);
  } catch (error) {
    console.error('Error fetching medical license:', error);
    res.status(500).json({ error: 'Failed to fetch medical license' });
  }
});

// Get licenses by staff member
router.get('/staff/:staffMemberId', (req, res) => {
  try {
    const licenses = MedicalLicense.getByStaffMember(req.params.staffMemberId);
    res.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses by staff member:', error);
    res.status(500).json({ error: 'Failed to fetch licenses by staff member' });
  }
});

// Get licenses by type
router.get('/type/:licenseType', (req, res) => {
  try {
    const licenses = MedicalLicense.getByLicenseType(req.params.licenseType);
    res.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses by type:', error);
    res.status(500).json({ error: 'Failed to fetch licenses by type' });
  }
});

// Get licenses by status
router.get('/status/:status', (req, res) => {
  try {
    const licenses = MedicalLicense.getByStatus(req.params.status);
    res.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses by status:', error);
    res.status(500).json({ error: 'Failed to fetch licenses by status' });
  }
});

// Get expiring licenses
router.get('/filter/expiring', (req, res) => {
  try {
    const withinDays = req.query.days ? parseInt(req.query.days) : 30;
    const licenses = MedicalLicense.getExpiringLicenses(withinDays);
    res.json(licenses);
  } catch (error) {
    console.error('Error fetching expiring licenses:', error);
    res.status(500).json({ error: 'Failed to fetch expiring licenses' });
  }
});

// Get expired licenses
router.get('/filter/expired', (req, res) => {
  try {
    const licenses = MedicalLicense.getExpiredLicenses();
    res.json(licenses);
  } catch (error) {
    console.error('Error fetching expired licenses:', error);
    res.status(500).json({ error: 'Failed to fetch expired licenses' });
  }
});

// Get active licenses
router.get('/filter/active', (req, res) => {
  try {
    const licenses = MedicalLicense.getActiveLicenses();
    res.json(licenses);
  } catch (error) {
    console.error('Error fetching active licenses:', error);
    res.status(500).json({ error: 'Failed to fetch active licenses' });
  }
});

// Search licenses
router.get('/search/:term', (req, res) => {
  try {
    const licenses = MedicalLicense.searchLicenses(req.params.term);
    res.json(licenses);
  } catch (error) {
    console.error('Error searching licenses:', error);
    res.status(500).json({ error: 'Failed to search licenses' });
  }
});

// Get license statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = MedicalLicense.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching license statistics:', error);
    res.status(500).json({ error: 'Failed to fetch license statistics' });
  }
});

// Get license types
router.get('/config/types', (req, res) => {
  try {
    const types = MedicalLicense.getLicenseTypes();
    res.json(types);
  } catch (error) {
    console.error('Error fetching license types:', error);
    res.status(500).json({ error: 'Failed to fetch license types' });
  }
});

// Get issuing authorities
router.get('/config/authorities', (req, res) => {
  try {
    const authorities = MedicalLicense.getIssuingAuthorities();
    res.json(authorities);
  } catch (error) {
    console.error('Error fetching issuing authorities:', error);
    res.status(500).json({ error: 'Failed to fetch issuing authorities' });
  }
});

// Export licenses to CSV
router.get('/export/csv', (req, res) => {
  try {
    const csvContent = MedicalLicense.exportToCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=medical-licenses.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({ error: 'Failed to export to CSV' });
  }
});

// Export licenses to PDF (returns data for PDF generation)
router.get('/export/pdf', (req, res) => {
  try {
    const pdfData = MedicalLicense.exportToPDF();
    res.json(pdfData);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({ error: 'Failed to export to PDF' });
  }
});

// Create new medical license
router.post('/', (req, res) => {
  try {
    const { staffMemberId, licenseType, licenseNumber, issueDate, expirationDate, issuingAuthority, additionalNotes } = req.body;
    
    // Validate required fields
    if (!staffMemberId || !licenseType || !licenseNumber || !issueDate || !expirationDate || !issuingAuthority) {
      return res.status(400).json({ 
        error: 'Missing required fields: staffMemberId, licenseType, licenseNumber, issueDate, expirationDate, and issuingAuthority are required' 
      });
    }

    const licenseData = {
      staffMemberId: parseInt(staffMemberId),
      licenseType,
      licenseNumber,
      issueDate,
      expirationDate,
      issuingAuthority,
      additionalNotes: additionalNotes || ''
    };

    const license = MedicalLicense.add(licenseData);
    res.status(201).json(license);
  } catch (error) {
    console.error('Error creating medical license:', error);
    res.status(500).json({ error: 'Failed to create medical license' });
  }
});

// Update medical license
router.put('/:id', (req, res) => {
  try {
    const licenseId = req.params.id;
    const updates = req.body;

    const updatedLicense = MedicalLicense.update(licenseId, updates);
    
    if (!updatedLicense) {
      return res.status(404).json({ error: 'Medical license not found' });
    }

    res.json(updatedLicense);
  } catch (error) {
    console.error('Error updating medical license:', error);
    res.status(500).json({ error: 'Failed to update medical license' });
  }
});

// Delete medical license
router.delete('/:id', (req, res) => {
  try {
    const deletedLicense = MedicalLicense.delete(req.params.id);
    
    if (!deletedLicense) {
      return res.status(404).json({ error: 'Medical license not found' });
    }

    res.json({ message: 'Medical license deleted successfully', license: deletedLicense });
  } catch (error) {
    console.error('Error deleting medical license:', error);
    res.status(500).json({ error: 'Failed to delete medical license' });
  }
});

// Get expiration alerts (for notification system)
router.get('/alerts/expiring', (req, res) => {
  try {
    const withinDays = req.query.days ? parseInt(req.query.days) : 30;
    const expiringLicenses = MedicalLicense.getExpiringLicenses(withinDays);
    
    const alerts = expiringLicenses.map(license => ({
      id: license.id,
      staffMemberId: license.staffMemberId,
      licenseType: license.licenseType,
      licenseNumber: license.licenseNumber,
      expirationDate: license.expirationDate,
      daysUntilExpiration: license.daysUntilExpiration,
      status: license.status,
      alertLevel: license.daysUntilExpiration <= 7 ? 'critical' : 
                  license.daysUntilExpiration <= 30 ? 'warning' : 'info'
    }));

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching expiration alerts:', error);
    res.status(500).json({ error: 'Failed to fetch expiration alerts' });
  }
});

// Get license compliance report
router.get('/reports/compliance', (req, res) => {
  try {
    const allLicenses = MedicalLicense.getAll();
    const stats = MedicalLicense.getStatistics();
    
    // Group licenses by staff member
    const staffCompliance = {};
    allLicenses.forEach(license => {
      if (!staffCompliance[license.staffMemberId]) {
        staffCompliance[license.staffMemberId] = {
          staffMemberId: license.staffMemberId,
          licenses: [],
          totalLicenses: 0,
          activeLicenses: 0,
          expiringSoon: 0,
          expired: 0,
          complianceScore: 0
        };
      }
      
      const staff = staffCompliance[license.staffMemberId];
      staff.licenses.push(license);
      staff.totalLicenses++;
      
      if (license.status === 'Active') staff.activeLicenses++;
      else if (license.status === 'Expiring Soon') staff.expiringSoon++;
      else if (license.status === 'Expired') staff.expired++;
      
      // Calculate compliance score (0-100)
      staff.complianceScore = Math.round((staff.activeLicenses / staff.totalLicenses) * 100);
    });

    res.json({
      overview: stats,
      staffCompliance: Object.values(staffCompliance),
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

module.exports = router;
