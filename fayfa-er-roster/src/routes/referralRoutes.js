const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');

// Get all referrals
router.get('/', (req, res) => {
  try {
    const referrals = Referral.getAll();
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

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

// Get referrals by ER doctor
router.get('/doctor/:doctorId', (req, res) => {
  try {
    const referrals = Referral.getByERDoctor(req.params.doctorId);
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals by doctor:', error);
    res.status(500).json({ error: 'Failed to fetch referrals by doctor' });
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

// Get referral statistics
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
router.post('/', (req, res) => {
  try {
    const { patientId, erDoctorId, referralType, destination, urgency, notes } = req.body;
    
    // Validate required fields
    if (!patientId || !erDoctorId || !referralType || !destination) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, erDoctorId, referralType, and destination are required' 
      });
    }

    const referralData = {
      patientId,
      erDoctorId: parseInt(erDoctorId),
      referralType,
      destination,
      urgency: urgency || 'urgent',
      notes: notes || '',
      referralTime: new Date().toISOString()
    };

    const referral = Referral.add(referralData);
    res.status(201).json(referral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

// Update referral
router.put('/:id', (req, res) => {
  try {
    const referralId = req.params.id;
    const updates = req.body;

    const updatedReferral = Referral.update(referralId, updates);
    
    if (!updatedReferral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    res.json(updatedReferral);
  } catch (error) {
    console.error('Error updating referral:', error);
    res.status(500).json({ error: 'Failed to update referral' });
  }
});

// Delete referral
router.delete('/:id', (req, res) => {
  try {
    const deletedReferral = Referral.delete(req.params.id);
    
    if (!deletedReferral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    res.json({ message: 'Referral deleted successfully', referral: deletedReferral });
  } catch (error) {
    console.error('Error deleting referral:', error);
    res.status(500).json({ error: 'Failed to delete referral' });
  }
});

module.exports = router;
