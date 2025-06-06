const notificationScheduler = require('../utils/notificationScheduler');
const Roster = require('../models/Roster');
const Doctor = require('../models/Doctor');

const notificationController = {
  getUpcomingDuties: (req, res) => {
    try {
      const upcomingDuties = Roster.getUpcomingDuties();
      
      // Add doctor information to each duty
      const dutiesWithDoctors = upcomingDuties.map(duty => {
        const doctor = Doctor.findById(duty.doctorId);
        return {
          ...duty,
          doctor: doctor
        };
      });

      res.json({ 
        success: true, 
        data: dutiesWithDoctors,
        count: dutiesWithDoctors.length
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  sendTestNotification: async (req, res) => {
    try {
      const { doctorId, dutyId } = req.body;
      
      if (!doctorId || !dutyId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor ID and Duty ID are required' 
        });
      }

      const result = await notificationScheduler.sendTestNotification(doctorId, dutyId);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Test notification sent successfully' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: `Failed to send notification: ${result.message}` 
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getScheduledNotifications: (req, res) => {
    try {
      const scheduled = notificationScheduler.getScheduledNotifications();
      res.json({ 
        success: true, 
        data: scheduled,
        count: scheduled.length
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  forceCheckUpcomingDuties: async (req, res) => {
    try {
      await notificationScheduler.checkUpcomingDuties();
      res.json({ 
        success: true, 
        message: 'Manual check for upcoming duties completed' 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  clearAllNotifications: (req, res) => {
    try {
      notificationScheduler.clearAllNotifications();
      res.json({ 
        success: true, 
        message: 'All scheduled notifications cleared' 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createTestDuties: (req, res) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Create test duties for today at different times
      const testDuties = [
        {
          doctorId: 1,
          shift: 'morning',
          date: new Date(today.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now set as morning shift
          isReferralDuty: false
        },
        {
          doctorId: 2, 
          shift: 'evening',
          date: new Date(today.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now set as evening shift
          isReferralDuty: true
        }
      ];

      const createdDuties = [];
      testDuties.forEach(dutyData => {
        const duty = Roster.add(dutyData);
        createdDuties.push(duty);
      });

      res.json({
        success: true,
        message: `Created ${createdDuties.length} test duties for today`,
        data: createdDuties
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = notificationController;