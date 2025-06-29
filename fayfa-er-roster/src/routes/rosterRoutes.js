const express = require('express');
const rosterController = require('../controllers/rosterController');

const router = express.Router();

router.get('/', rosterController.getAllRoster);
router.get('/template/download', rosterController.downloadTemplate);
router.get('/specialists/today', rosterController.getSpecialistsToday);
router.get('/:year/:month', rosterController.getRosterByMonth);
router.get('/analytics/:year/:month', rosterController.getDutyAnalytics);
router.post('/', rosterController.createRosterEntry);
router.post('/import', rosterController.importRoster);
router.put('/:id', rosterController.updateRosterEntry);
router.delete('/:id', rosterController.deleteRosterEntry);

module.exports = router;