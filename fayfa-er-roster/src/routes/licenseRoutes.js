const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');

// Get all licenses
router.get('/', licenseController.getAllLicenses);

// Get license status summary
router.get('/status', licenseController.getLicenseStatus);

// Get expiring licenses
router.get('/expiring', licenseController.getExpiringLicenses);

// Check expiry and get notifications
router.get('/check-expiry', licenseController.checkExpiry);

// Get licenses by doctor
router.get('/doctor/:doctorId', licenseController.getLicensesByDoctor);

// Create new license
router.post('/', licenseController.createLicense);

// Update license
router.put('/:id', licenseController.updateLicense);

// Delete license
router.delete('/:id', licenseController.deleteLicense);

module.exports = router;