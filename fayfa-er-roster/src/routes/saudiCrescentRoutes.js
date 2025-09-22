const express = require('express');
const router = express.Router();
const SaudiCrescent = require('../models/SaudiCrescent');

// Get all Saudi Red Crescent records
router.get('/', (req, res) => {
  try {
    const records = SaudiCrescent.getAll();
    res.json(records);
  } catch (error) {
    console.error('Error fetching Saudi Red Crescent records:', error);
    res.status(500).json({ error: 'Failed to fetch Saudi Red Crescent records' });
  }
});

// Get Saudi Red Crescent record by ID
router.get('/:id', (req, res) => {
  try {
    const record = SaudiCrescent.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Saudi Red Crescent record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error fetching Saudi Red Crescent record:', error);
    res.status(500).json({ error: 'Failed to fetch Saudi Red Crescent record' });
  }
});

// Get records by patient ID
router.get('/patient/:patientId', (req, res) => {
  try {
    const records = SaudiCrescent.getByPatientId(req.params.patientId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching records by patient ID:', error);
    res.status(500).json({ error: 'Failed to fetch records by patient ID' });
  }
});

// Get records by ambulance unit
router.get('/ambulance/:unit', (req, res) => {
  try {
    const records = SaudiCrescent.getByAmbulanceUnit(req.params.unit);
    res.json(records);
  } catch (error) {
    console.error('Error fetching records by ambulance unit:', error);
    res.status(500).json({ error: 'Failed to fetch records by ambulance unit' });
  }
});

// Get records by receiving doctor
router.get('/doctor/:doctorId', (req, res) => {
  try {
    const records = SaudiCrescent.getByReceivingDoctor(req.params.doctorId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching records by doctor:', error);
    res.status(500).json({ error: 'Failed to fetch records by doctor' });
  }
});

// Get today's records
router.get('/filter/today', (req, res) => {
  try {
    const records = SaudiCrescent.getTodaysRecords();
    res.json(records);
  } catch (error) {
    console.error('Error fetching today\'s records:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s records' });
  }
});

// Get recent records
router.get('/filter/recent', (req, res) => {
  try {
    const hours = req.query.hours ? parseInt(req.query.hours) : 24;
    const records = SaudiCrescent.getRecentRecords(hours);
    res.json(records);
  } catch (error) {
    console.error('Error fetching recent records:', error);
    res.status(500).json({ error: 'Failed to fetch recent records' });
  }
});

// Get recent records with specific hours
router.get('/filter/recent/:hours', (req, res) => {
  try {
    const hours = parseInt(req.params.hours) || 24;
    const records = SaudiCrescent.getRecentRecords(hours);
    res.json(records);
  } catch (error) {
    console.error('Error fetching recent records:', error);
    res.status(500).json({ error: 'Failed to fetch recent records' });
  }
});

// Get records by date range
router.get('/range/:startDate/:endDate', (req, res) => {
  try {
    const records = SaudiCrescent.getByDateRange(req.params.startDate, req.params.endDate);
    res.json(records);
  } catch (error) {
    console.error('Error fetching records by date range:', error);
    res.status(500).json({ error: 'Failed to fetch records by date range' });
  }
});

// Get statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = SaudiCrescent.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching Saudi Red Crescent stats:', error);
    res.status(500).json({ error: 'Failed to fetch Saudi Red Crescent statistics' });
  }
});

// Get handover time statistics
router.get('/stats/handover-time', (req, res) => {
  try {
    const stats = SaudiCrescent.getHandoverTimeStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching handover time stats:', error);
    res.status(500).json({ error: 'Failed to fetch handover time statistics' });
  }
});

// Get ambulance units list
router.get('/units/list', (req, res) => {
  try {
    const units = SaudiCrescent.getAmbulanceUnits();
    res.json(units);
  } catch (error) {
    console.error('Error fetching ambulance units:', error);
    res.status(500).json({ error: 'Failed to fetch ambulance units' });
  }
});

// Search records
router.get('/search/:term', (req, res) => {
  try {
    const records = SaudiCrescent.searchRecords(req.params.term);
    res.json(records);
  } catch (error) {
    console.error('Error searching records:', error);
    res.status(500).json({ error: 'Failed to search records' });
  }
});

// Export records to CSV
router.get('/export/csv', (req, res) => {
  try {
    const csvContent = SaudiCrescent.exportToCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=saudi-crescent-records.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({ error: 'Failed to export to CSV' });
  }
});

// Export records to PDF (returns data for PDF generation)
router.get('/export/pdf', (req, res) => {
  try {
    const pdfData = SaudiCrescent.exportToPDF();
    res.json(pdfData);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({ error: 'Failed to export to PDF' });
  }
});

// Create new Saudi Red Crescent record
router.post('/', (req, res) => {
  try {
    const { patientId, ambulanceUnit, receivingDoctorId, timeReceived, handoverTime, duration, additionalNotes } = req.body;
    
    // Validate required fields
    if (!patientId || !ambulanceUnit || !receivingDoctorId || !timeReceived) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, ambulanceUnit, receivingDoctorId, and timeReceived are required' 
      });
    }

    const recordData = {
      patientId,
      ambulanceUnit,
      receivingDoctorId: parseInt(receivingDoctorId),
      timeReceived,
      handoverTime: handoverTime || '',
      duration: duration || '',
      additionalNotes: additionalNotes || ''
    };

    const record = SaudiCrescent.add(recordData);
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating Saudi Red Crescent record:', error);
    res.status(500).json({ error: 'Failed to create Saudi Red Crescent record' });
  }
});

// Update Saudi Red Crescent record
router.put('/:id', (req, res) => {
  try {
    const recordId = req.params.id;
    const updates = req.body;

    const updatedRecord = SaudiCrescent.update(recordId, updates);
    
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Saudi Red Crescent record not found' });
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating Saudi Red Crescent record:', error);
    res.status(500).json({ error: 'Failed to update Saudi Red Crescent record' });
  }
});

// Delete Saudi Red Crescent record
router.delete('/:id', (req, res) => {
  try {
    const deletedRecord = SaudiCrescent.delete(req.params.id);
    
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Saudi Red Crescent record not found' });
    }

    res.json({ message: 'Saudi Red Crescent record deleted successfully', record: deletedRecord });
  } catch (error) {
    console.error('Error deleting Saudi Red Crescent record:', error);
    res.status(500).json({ error: 'Failed to delete Saudi Red Crescent record' });
  }
});

module.exports = router;
