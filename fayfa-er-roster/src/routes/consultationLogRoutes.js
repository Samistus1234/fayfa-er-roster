const express = require('express');
const router = express.Router();
const ConsultationLog = require('../models/ConsultationLog');

// Get all consultation logs
router.get('/', (req, res) => {
  try {
    const logs = ConsultationLog.getAll();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching consultation logs:', error);
    res.status(500).json({ error: 'Failed to fetch consultation logs' });
  }
});

// Get consultation log by ID
router.get('/:id', (req, res) => {
  try {
    const log = ConsultationLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Consultation log not found' });
    }
    res.json(log);
  } catch (error) {
    console.error('Error fetching consultation log:', error);
    res.status(500).json({ error: 'Failed to fetch consultation log' });
  }
});

// Get logs by date
router.get('/date/:date', (req, res) => {
  try {
    const logs = ConsultationLog.getByDate(req.params.date);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by date:', error);
    res.status(500).json({ error: 'Failed to fetch logs by date' });
  }
});

// Get logs by shift
router.get('/shift/:shift', (req, res) => {
  try {
    const logs = ConsultationLog.getByShift(req.params.shift);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by shift:', error);
    res.status(500).json({ error: 'Failed to fetch logs by shift' });
  }
});

// Get logs by ER doctor
router.get('/doctor/:doctorId', (req, res) => {
  try {
    const logs = ConsultationLog.getByERDoctor(req.params.doctorId);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by doctor:', error);
    res.status(500).json({ error: 'Failed to fetch logs by doctor' });
  }
});

// Get logs by specialist
router.get('/specialist/:specialistId', (req, res) => {
  try {
    const logs = ConsultationLog.getBySpecialist(req.params.specialistId);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by specialist:', error);
    res.status(500).json({ error: 'Failed to fetch logs by specialist' });
  }
});

// Get logs by outcome
router.get('/outcome/:outcome', (req, res) => {
  try {
    const logs = ConsultationLog.getByOutcome(req.params.outcome);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by outcome:', error);
    res.status(500).json({ error: 'Failed to fetch logs by outcome' });
  }
});

// Get urgent logs
router.get('/filter/urgent', (req, res) => {
  try {
    const logs = ConsultationLog.getUrgentLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching urgent logs:', error);
    res.status(500).json({ error: 'Failed to fetch urgent logs' });
  }
});

// Get logs by date range
router.get('/range/:startDate/:endDate', (req, res) => {
  try {
    const logs = ConsultationLog.getDateRange(req.params.startDate, req.params.endDate);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by date range:', error);
    res.status(500).json({ error: 'Failed to fetch logs by date range' });
  }
});

// Get recent logs (default 7 days)
router.get('/filter/recent', (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const logs = ConsultationLog.getRecentLogs(days);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    res.status(500).json({ error: 'Failed to fetch recent logs' });
  }
});

// Get recent logs with specific days
router.get('/filter/recent/:days', (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const logs = ConsultationLog.getRecentLogs(days);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    res.status(500).json({ error: 'Failed to fetch recent logs' });
  }
});

// Get statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = ConsultationLog.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching consultation log stats:', error);
    res.status(500).json({ error: 'Failed to fetch consultation log statistics' });
  }
});

// Get response time statistics
router.get('/stats/response-time', (req, res) => {
  try {
    const stats = ConsultationLog.calculateResponseTimeStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching response time stats:', error);
    res.status(500).json({ error: 'Failed to fetch response time statistics' });
  }
});

// Search logs
router.get('/search/:term', (req, res) => {
  try {
    const logs = ConsultationLog.searchLogs(req.params.term);
    res.json(logs);
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ error: 'Failed to search logs' });
  }
});

// Export logs to CSV
router.get('/export/csv', (req, res) => {
  try {
    const csvContent = ConsultationLog.exportToCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=consultation-logs.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({ error: 'Failed to export to CSV' });
  }
});

// Export logs to PDF (returns data for PDF generation)
router.get('/export/pdf', (req, res) => {
  try {
    const pdfData = ConsultationLog.exportToPDF();
    res.json(pdfData);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({ error: 'Failed to export to PDF' });
  }
});

// Create new consultation log
router.post('/', (req, res) => {
  try {
    const { date, shift, erDoctorId, timeCalled, specialistId, specialty, arrivalTime, responseTime, patientId, outcome, urgent } = req.body;
    
    // Validate required fields
    if (!date || !shift || !erDoctorId || !timeCalled || !specialistId || !patientId || !outcome) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, shift, erDoctorId, timeCalled, specialistId, patientId, and outcome are required' 
      });
    }

    const logData = {
      date,
      shift,
      erDoctorId: parseInt(erDoctorId),
      timeCalled,
      specialistId,
      specialty: specialty || '',
      arrivalTime: arrivalTime || '',
      responseTime: responseTime || '',
      patientId,
      outcome,
      urgent: urgent || false
    };

    const log = ConsultationLog.add(logData);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating consultation log:', error);
    res.status(500).json({ error: 'Failed to create consultation log' });
  }
});

// Update consultation log
router.put('/:id', (req, res) => {
  try {
    const logId = req.params.id;
    const updates = req.body;

    const updatedLog = ConsultationLog.update(logId, updates);
    
    if (!updatedLog) {
      return res.status(404).json({ error: 'Consultation log not found' });
    }

    res.json(updatedLog);
  } catch (error) {
    console.error('Error updating consultation log:', error);
    res.status(500).json({ error: 'Failed to update consultation log' });
  }
});

// Delete consultation log
router.delete('/:id', (req, res) => {
  try {
    const deletedLog = ConsultationLog.delete(req.params.id);
    
    if (!deletedLog) {
      return res.status(404).json({ error: 'Consultation log not found' });
    }

    res.json({ message: 'Consultation log deleted successfully', log: deletedLog });
  } catch (error) {
    console.error('Error deleting consultation log:', error);
    res.status(500).json({ error: 'Failed to delete consultation log' });
  }
});

module.exports = router;
