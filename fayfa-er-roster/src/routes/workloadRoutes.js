const express = require('express');
const workloadController = require('../controllers/workloadController');

const router = express.Router();

// Get full workload analysis for a month
router.get('/:year/:month', workloadController.getWorkloadAnalysis);

// Get detailed analysis for specific doctor
router.get('/:year/:month/doctor/:doctorId', workloadController.getDoctorWorkloadDetail);

// Get workload summary with alerts and recommendations
router.get('/:year/:month/summary', workloadController.getWorkloadSummary);

module.exports = router;