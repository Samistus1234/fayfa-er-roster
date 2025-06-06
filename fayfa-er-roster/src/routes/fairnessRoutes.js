const express = require('express');
const fairnessController = require('../controllers/fairnessController');

const router = express.Router();

// Get full fairness metrics for a month
router.get('/:year/:month', fairnessController.getFairnessMetrics);

// Get fairness summary (quick overview)
router.get('/:year/:month/summary', fairnessController.getFairnessSummary);

// Get detailed equity report for specific doctor
router.get('/:year/:month/doctor/:doctorId', fairnessController.getDoctorEquityReport);

module.exports = router;