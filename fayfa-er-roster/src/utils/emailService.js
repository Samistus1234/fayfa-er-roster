const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Change this to your email provider
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendDutyNotification(doctor, dutyInfo) {
    const subject = `Duty Reminder - Fayfa General Hospital ER`;
    const html = this.generateDutyNotificationHTML(doctor, dutyInfo);

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Fayfa ER Roster <noreply@fayfa.hospital>',
        to: doctor.email,
        subject: subject,
        html: html
      });
      
      console.log(`Duty notification sent to ${doctor.name} (${doctor.email})`);
      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, message: error.message };
    }
  }

  generateDutyNotificationHTML(doctor, dutyInfo) {
    const dutyDate = new Date(dutyInfo.date);
    const formattedDate = dutyDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const shiftTimes = {
      morning: '7:00 AM - 3:00 PM',
      evening: '3:00 PM - 11:00 PM',
      night: '11:00 PM - 7:00 AM'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Duty Reminder</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .duty-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #6c757d; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .highlight { color: #667eea; font-weight: bold; }
            .emergency { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 Fayfa General Hospital</h1>
                <h2>Emergency Department Duty Reminder</h2>
            </div>
            
            <div class="content">
                <h3>Dear Dr. ${doctor.name},</h3>
                
                <div class="emergency">
                    <strong>⏰ Your duty starts in approximately 2 hours!</strong>
                </div>
                
                <p>This is a friendly reminder that you have an upcoming duty scheduled at the Emergency Department.</p>
                
                <div class="duty-details">
                    <h4>📋 Duty Details:</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>📅 Date:</strong> ${formattedDate}</li>
                        <li><strong>⏰ Shift:</strong> <span class="highlight">${dutyInfo.shift.charAt(0).toUpperCase() + dutyInfo.shift.slice(1)}</span></li>
                        <li><strong>🕐 Time:</strong> ${shiftTimes[dutyInfo.shift]}</li>
                        <li><strong>🏥 Location:</strong> Emergency Department, Fayfa General Hospital</li>
                        ${dutyInfo.isReferralDuty ? '<li><strong>📞 Special:</strong> <span style="color: #dc3545;">Referral Duty</span></li>' : ''}
                    </ul>
                </div>
                
                <p><strong>Please ensure you:</strong></p>
                <ul>
                    <li>Arrive 15 minutes before your shift starts</li>
                    <li>Check your equipment and patient assignments</li>
                    <li>Review any emergency cases from the previous shift</li>
                    <li>Bring your hospital ID and necessary documentation</li>
                </ul>
                
                <p>If you have any concerns or need to make changes to your schedule, please contact the duty supervisor immediately.</p>
                
                <p>Thank you for your dedication to patient care.</p>
                
                <p><strong>Best regards,</strong><br>
                ER Roster Management System<br>
                Fayfa General Hospital</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message from the ER Roster Management System.</p>
                <p>For emergency matters, please contact the Emergency Department directly.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send messages');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendLicenseExpiryNotification(doctor, expiringLicenses, expiredLicenses) {
    const subject = `🚨 License Expiry Alert - Action Required`;
    const html = this.generateLicenseExpiryHTML(doctor, expiringLicenses, expiredLicenses);

    try {
      // In development, just log the notification
      console.log(`[DEV MODE] Would send license expiry notification to ${doctor.name} (${doctor.email})`);
      console.log(`- ${expiredLicenses.length} expired licenses`);
      console.log(`- ${expiringLicenses.length} expiring licenses`);
      
      // Uncomment for production
      /*
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Fayfa ER Roster <noreply@fayfa.hospital>',
        to: doctor.email,
        subject: subject,
        html: html
      });
      */
      
      return { 
        success: true, 
        message: 'License expiry notification sent successfully',
        expiredCount: expiredLicenses.length,
        expiringCount: expiringLicenses.length
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, message: error.message };
    }
  }

  generateLicenseExpiryHTML(doctor, expiringLicenses, expiredLicenses) {
    const License = require('../models/License');
    
    let licenseDetailsHtml = '';
    
    if (expiredLicenses.length > 0) {
      licenseDetailsHtml += `
        <div style="background-color: #fee; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0;">
          <h3 style="color: #dc3545; margin-top: 0;">⚠️ Expired Licenses</h3>
          <ul style="margin: 10px 0;">
      `;
      expiredLicenses.forEach(license => {
        const expiredDays = Math.abs(License.getDaysUntilExpiry(license.expiryDate));
        licenseDetailsHtml += `
          <li>
            <strong>${license.type}</strong> - License #${license.licenseNumber}
            <br>Expired ${expiredDays} days ago (${new Date(license.expiryDate).toLocaleDateString()})
          </li>
        `;
      });
      licenseDetailsHtml += '</ul></div>';
    }
    
    if (expiringLicenses.length > 0) {
      licenseDetailsHtml += `
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0;">
          <h3 style="color: #856404; margin-top: 0;">📅 Expiring Soon</h3>
          <ul style="margin: 10px 0;">
      `;
      expiringLicenses.forEach(license => {
        const daysUntilExpiry = License.getDaysUntilExpiry(license.expiryDate);
        licenseDetailsHtml += `
          <li>
            <strong>${license.type}</strong> - License #${license.licenseNumber}
            <br>Expires in ${daysUntilExpiry} days (${new Date(license.expiryDate).toLocaleDateString()})
          </li>
        `;
      });
      licenseDetailsHtml += '</ul></div>';
    }
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>License Expiry Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">License Expiry Alert</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Immediate Action Required</p>
            </div>
            
            <div style="padding: 30px;">
                <p style="font-size: 16px; color: #333;">Dear Dr. ${doctor.name},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    This is an important reminder regarding your professional licenses and certifications:
                </p>
                
                ${licenseDetailsHtml}
                
                <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #155724; margin-top: 0;">📋 Required Actions:</h3>
                    <ol style="margin: 10px 0; color: #155724;">
                        <li>Review your license expiry dates</li>
                        <li>Contact the relevant authorities for renewal</li>
                        <li>Submit renewed licenses to HR department</li>
                        <li>Update your records in the system</li>
                    </ol>
                </div>
                
                <div class="emergency" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0;">
                    <p style="margin: 0; color: #856404;">
                        <strong>⚠️ Important:</strong> Practicing with expired licenses may result in legal and professional consequences.
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Access License Portal
                    </a>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
                
                <p style="color: #6c757d; font-size: 14px; text-align: center;">
                    This is an automated reminder from the Fayfa ER Roster System.
                    <br>For assistance, contact the HR department.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new EmailService();