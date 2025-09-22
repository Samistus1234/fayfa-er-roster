const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');

// Get all consultations
router.get('/', (req, res) => {
  try {
    const consultations = Consultation.getAll();
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Get consultation by ID
router.get('/:id', (req, res) => {
  try {
    const consultation = Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    res.json(consultation);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

// Get consultations by status
router.get('/status/:status', (req, res) => {
  try {
    const consultations = Consultation.getByStatus(req.params.status);
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations by status:', error);
    res.status(500).json({ error: 'Failed to fetch consultations by status' });
  }
});

// Get consultations by specialty
router.get('/specialty/:specialty', (req, res) => {
  try {
    const consultations = Consultation.getBySpecialty(req.params.specialty);
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations by specialty:', error);
    res.status(500).json({ error: 'Failed to fetch consultations by specialty' });
  }
});

// Get consultations by urgency
router.get('/urgency/:urgency', (req, res) => {
  try {
    const consultations = Consultation.getByUrgency(req.params.urgency);
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations by urgency:', error);
    res.status(500).json({ error: 'Failed to fetch consultations by urgency' });
  }
});

// Get consultations by ER doctor
router.get('/doctor/:doctorId', (req, res) => {
  try {
    const consultations = Consultation.getByERDoctor(req.params.doctorId);
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations by doctor:', error);
    res.status(500).json({ error: 'Failed to fetch consultations by doctor' });
  }
});

// Get active consultations
router.get('/filter/active', (req, res) => {
  try {
    const consultations = Consultation.getActiveConsultations();
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching active consultations:', error);
    res.status(500).json({ error: 'Failed to fetch active consultations' });
  }
});

// Get consultation statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = Consultation.getConsultationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching consultation stats:', error);
    res.status(500).json({ error: 'Failed to fetch consultation statistics' });
  }
});

// Create new consultation
router.post('/', (req, res) => {
  try {
    const { patientId, erDoctorId, specialty, urgency, notes } = req.body;
    
    // Validate required fields
    if (!patientId || !erDoctorId || !specialty) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, erDoctorId, and specialty are required' 
      });
    }

    const consultationData = {
      patientId,
      erDoctorId: parseInt(erDoctorId),
      specialty,
      urgency: urgency || 'routine',
      notes: notes || '',
      requestTime: new Date().toISOString()
    };

    const consultation = Consultation.add(consultationData);
    res.status(201).json(consultation);
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

// Update consultation
router.put('/:id', (req, res) => {
  try {
    const consultationId = req.params.id;
    const updates = req.body;

    // If status is being updated to something other than pending, set response time
    if (updates.status && updates.status !== 'pending' && !updates.responseTime) {
      updates.responseTime = new Date().toISOString();
    }

    const updatedConsultation = Consultation.update(consultationId, updates);
    
    if (!updatedConsultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json(updatedConsultation);
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ error: 'Failed to update consultation' });
  }
});

// Delete consultation
router.delete('/:id', (req, res) => {
  try {
    const deletedConsultation = Consultation.delete(req.params.id);
    
    if (!deletedConsultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({ message: 'Consultation deleted successfully', consultation: deletedConsultation });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ error: 'Failed to delete consultation' });
  }
});

module.exports = router;
