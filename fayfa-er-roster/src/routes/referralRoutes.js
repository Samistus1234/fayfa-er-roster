const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const referralController = require('../controllers/referralController');

// Controller-based routes (prioritized)
// Get all referrals
router.get('/', referralController.getAllReferrals);

// Get referrals by month
router.get('/month/:year/:month', referralController.getReferralsByMonth);

// Get referral statistics by month
router.get('/stats/:year/:month', referralController.getReferralStats);

// Get referrals by doctor
router.get('/doctor/:doctorId', referralController.getReferralsByDoctor);

// Additional direct routes for specific functionality
// Get referral by ID
router.get('/:id', (req, res) => {
  try {
    const referral = Referral.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }
    res.json(referral);
  } catch (error) {
    console.error('Error fetching referral:', error);
    res.status(500).json({ error: 'Failed to fetch referral' });
  }
});

// Get referrals by status
router.get('/status/:status', (req, res) => {
  try {
    const referrals = Referral.getByStatus(req.params.status);
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals by status:', error);
    res.status(500).json({ error: 'Failed to fetch referrals by status' });
  }
});

// Get referrals by type
router.get('/type/:type', (req, res) => {
  try {
    const referrals = Referral.getByType(req.params.type);
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals by type:', error);
    res.status(500).json({ error: 'Failed to fetch referrals by type' });
  }
});

// Get referrals by urgency
router.get('/urgency/:urgency', (req, res) => {
  try {
    const referrals = Referral.getByUrgency(req.params.urgency);
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals by urgency:', error);
    res.status(500).json({ error: 'Failed to fetch referrals by urgency' });
  }
});

// Get active referrals
router.get('/filter/active', (req, res) => {
  try {
    const referrals = Referral.getActiveReferrals();
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching active referrals:', error);
    res.status(500).json({ error: 'Failed to fetch active referrals' });
  }
});

// Get today's referrals
router.get('/filter/today', (req, res) => {
  try {
    const referrals = Referral.getTodaysReferrals();
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching today\'s referrals:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s referrals' });
  }
});

// Get referral statistics overview
router.get('/stats/overview', (req, res) => {
  try {
    const stats = Referral.getReferralStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Failed to fetch referral statistics' });
  }
});

// Get referral trends
router.get('/stats/trends', (req, res) => {
  try {
    const trends = Referral.getReferralTrends();
    res.json(trends);
  } catch (error) {
    console.error('Error fetching referral trends:', error);
    res.status(500).json({ error: 'Failed to fetch referral trends' });
  }
});

// Create new referral
router.post('/', referralController.createReferral);

// Update referral
router.put('/:id', referralController.updateReferral);

// Delete referral
router.delete('/:id', referralController.deleteReferral);

module.exports = router;
