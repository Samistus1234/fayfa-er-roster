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
      morning: '6:00 AM - 2:00 PM',
      evening: '2:00 PM - 10:00 PM',
      night: '10:00 PM - 6:00 AM'
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
            .urgent { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
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
                
                <div class="urgent">
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
                    <li>Review any urgent cases from the previous shift</li>
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
                <p>For urgent matters, please contact the Emergency Department directly.</p>
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
}

module.exports = new EmailService();