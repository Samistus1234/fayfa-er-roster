const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/upcoming', notificationController.getUpcomingDuties);
router.get('/scheduled', notificationController.getScheduledNotifications);
router.post('/test', notificationController.sendTestNotification);
router.post('/check', notificationController.forceCheckUpcomingDuties);
router.post('/clear', notificationController.clearAllNotifications);
router.post('/create-test-duties', notificationController.createTestDuties);

module.exports = router;