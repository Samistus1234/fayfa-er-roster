const cron = require('node-cron');
const Roster = require('../models/Roster');
const Doctor = require('../models/Doctor');
const License = require('../models/License');
const emailService = require('./emailService');

class NotificationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
    this.init();
  }

  init() {
    // Check every 30 minutes for upcoming duties
    cron.schedule('*/30 * * * *', () => {
      this.checkUpcomingDuties();
    });

    // Check daily at 9 AM for license expiry
    cron.schedule('0 9 * * *', () => {
      this.checkLicenseExpiry();
    });

    // Run initial license check on startup
    setTimeout(() => this.checkLicenseExpiry(), 5000);

    console.log('Notification scheduler initialized - checking every 30 minutes for duties and daily for license expiry');
  }

  async checkUpcomingDuties() {
    try {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      // Get all roster entries
      const allRoster = Roster.getAll();
      
      // Find duties that start within the next 2 hours but more than 30 minutes from now
      const upcomingDuties = allRoster.filter(entry => {
        const dutyDateTime = this.getDutyDateTime(entry);
        return dutyDateTime > thirtyMinutesFromNow && dutyDateTime <= twoHoursFromNow;
      });

      console.log(`Found ${upcomingDuties.length} upcoming duties requiring notifications`);

      for (const duty of upcomingDuties) {
        await this.scheduleNotificationForDuty(duty);
      }
    } catch (error) {
      console.error('Error checking upcoming duties:', error);
    }
  }

  getDutyDateTime(rosterEntry) {
    const dutyDate = new Date(rosterEntry.date);

    // Set time based on shift - Updated to hospital's actual schedule
    switch (rosterEntry.shift) {
      case 'morning':
        dutyDate.setHours(7, 0, 0, 0); // 7:00 AM
        break;
      case 'evening':
        dutyDate.setHours(15, 0, 0, 0); // 3:00 PM
        break;
      case 'night':
        dutyDate.setHours(23, 0, 0, 0); // 11:00 PM
        break;
      default:
        dutyDate.setHours(7, 0, 0, 0); // Default to morning
    }

    return dutyDate;
  }

  async scheduleNotificationForDuty(duty) {
    const dutyDateTime = this.getDutyDateTime(duty);
    const notificationTime = new Date(dutyDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    const now = new Date();

    // Skip if notification time has already passed
    if (notificationTime <= now) {
      return;
    }

    // Check if we already scheduled this notification
    const notificationKey = `${duty.id}-${dutyDateTime.getTime()}`;
    if (this.scheduledJobs.has(notificationKey)) {
      return;
    }

    // Schedule the notification
    const doctor = Doctor.findById(duty.doctorId);
    if (!doctor) {
      console.error(`Doctor not found for duty ${duty.id}`);
      return;
    }

    // Calculate when to send the notification (2 hours before duty)
    const delay = notificationTime.getTime() - now.getTime();
    
    if (delay > 0) {
      const timeoutId = setTimeout(async () => {
        await this.sendDutyNotification(doctor, duty);
        this.scheduledJobs.delete(notificationKey);
      }, delay);

      this.scheduledJobs.set(notificationKey, timeoutId);
      
      console.log(`Scheduled notification for ${doctor.name} - Duty: ${duty.shift} on ${dutyDateTime.toLocaleDateString()}`);
    }
  }

  async sendDutyNotification(doctor, duty) {
    try {
      console.log(`Sending duty notification to ${doctor.name} for ${duty.shift} shift`);
      
      const result = await emailService.sendDutyNotification(doctor, duty);
      
      if (result.success) {
        console.log(`✅ Notification sent successfully to ${doctor.name}`);
        return { success: true, message: 'Notification sent successfully' };
      } else {
        console.error(`❌ Failed to send notification to ${doctor.name}: ${result.message}`);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error(`Error sending notification to ${doctor.name}:`, error);
      return { success: false, message: error.message };
    }
  }

  // Manual method to send immediate notifications for testing
  async sendTestNotification(doctorId, dutyId) {
    const doctor = Doctor.findById(doctorId);
    const duty = Roster.findById(dutyId);
    
    if (!doctor || !duty) {
      throw new Error('Doctor or duty not found');
    }
    
    return await this.sendDutyNotification(doctor, duty);
  }

  // Get all scheduled notifications (for debugging)
  getScheduledNotifications() {
    return Array.from(this.scheduledJobs.keys());
  }

  // Clear all scheduled notifications
  clearAllNotifications() {
    this.scheduledJobs.forEach(timeoutId => clearTimeout(timeoutId));
    this.scheduledJobs.clear();
    console.log('All scheduled notifications cleared');
  }

  // Check for license expiry
  async checkLicenseExpiry() {
    try {
      console.log('Checking for license expiry...');
      
      const expiringLicenses = License.getExpiringLicenses();
      const expiredLicenses = License.getExpiredLicenses();
      
      console.log(`Found ${expiringLicenses.length} expiring licenses and ${expiredLicenses.length} expired licenses`);
      
      // Group licenses by doctor
      const doctorNotifications = new Map();
      
      // Process expiring licenses
      expiringLicenses.forEach(license => {
        const doctor = Doctor.findById(license.doctorId);
        if (!doctor) return;
        
        if (!doctorNotifications.has(doctor.id)) {
          doctorNotifications.set(doctor.id, {
            doctor: doctor,
            expiringLicenses: [],
            expiredLicenses: []
          });
        }
        
        doctorNotifications.get(doctor.id).expiringLicenses.push(license);
      });
      
      // Process expired licenses
      expiredLicenses.forEach(license => {
        const doctor = Doctor.findById(license.doctorId);
        if (!doctor) return;
        
        if (!doctorNotifications.has(doctor.id)) {
          doctorNotifications.set(doctor.id, {
            doctor: doctor,
            expiringLicenses: [],
            expiredLicenses: []
          });
        }
        
        doctorNotifications.get(doctor.id).expiredLicenses.push(license);
      });
      
      // Send notifications to each doctor
      for (const [doctorId, data] of doctorNotifications) {
        await this.sendLicenseExpiryNotification(data.doctor, data.expiringLicenses, data.expiredLicenses);
      }
      
    } catch (error) {
      console.error('Error checking license expiry:', error);
    }
  }

  async sendLicenseExpiryNotification(doctor, expiringLicenses, expiredLicenses) {
    try {
      console.log(`Sending license expiry notification to ${doctor.name}`);
      
      // Check if we've already sent a notification today
      const today = new Date().toDateString();
      const notificationKey = `license-${doctor.id}-${today}`;
      
      if (this.scheduledJobs.has(notificationKey)) {
        console.log(`Already sent license notification to ${doctor.name} today`);
        return;
      }
      
      const result = await emailService.sendLicenseExpiryNotification(doctor, expiringLicenses, expiredLicenses);
      
      if (result.success) {
        console.log(`✅ License expiry notification sent to ${doctor.name}`);
        this.scheduledJobs.set(notificationKey, true);
        
        // Update last notified date for licenses
        [...expiringLicenses, ...expiredLicenses].forEach(license => {
          license.lastNotified = new Date();
        });
      } else {
        console.error(`❌ Failed to send license notification to ${doctor.name}: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error sending license notification to ${doctor.name}:`, error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new NotificationScheduler();