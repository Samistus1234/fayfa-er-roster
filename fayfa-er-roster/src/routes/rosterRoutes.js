const express = require('express');
const rosterController = require('../controllers/rosterController');

const router = express.Router();

router.get('/', rosterController.getAllRoster);
router.get('/:year/:month', rosterController.getRosterByMonth);
router.get('/analytics/:year/:month', rosterController.getDutyAnalytics);
router.post('/', rosterController.createRosterEntry);
router.put('/:id', rosterController.updateRosterEntry);
router.delete('/:id', rosterController.deleteRosterEntry);

module.exports = router;