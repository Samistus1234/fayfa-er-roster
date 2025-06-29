const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');

// Get all referrals
router.get('/', referralController.getAllReferrals);

// Get referrals by month
router.get('/month/:year/:month', referralController.getReferralsByMonth);

// Get referral statistics by month
router.get('/stats/:year/:month', referralController.getReferralStats);

// Get referrals by doctor
router.get('/doctor/:doctorId', referralController.getReferralsByDoctor);

// Create new referral
router.post('/', referralController.createReferral);

// Update referral
router.put('/:id', referralController.updateReferral);

// Delete referral
router.delete('/:id', referralController.deleteReferral);

module.exports = router;