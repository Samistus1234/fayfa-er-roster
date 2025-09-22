# Fayfa General Hospital - ER Roster Management System

A comprehensive Emergency Room roster management application for Fayfa General Hospital featuring duty scheduling, analytics, workload distribution analysis, and specialist consultation tracking.

## 🚀 Features

- **Doctor Roster Management** - Schedule and manage ER doctor shifts
- **Duty Analytics Dashboard** - Track morning, evening, night shifts with percentages
- **Workload Distribution Analysis** - Analyze workload balance and intensity
- **Fairness & Equity Metrics** - Monitor fair distribution of duties
- **Specialist Consultation Log** - Track specialist consultations and response times
- **Email Notifications** - Automated duty reminders 2 hours before shifts
- **Export Functionality** - Export data to CSV and PDF formats
- **Referral Duties Tracking** - Special tracking for referral duties (R, R2, ER)

## 🔗 Quick Start

### Option 1: Download and Run
1. **Download:** [Click here to download ZIP](../../archive/refs/heads/main.zip)
2. **Extract** and open terminal in the folder
3. **Install:** `npm install`
4. **Start:** `npm start`
5. **Access:** http://localhost:3000

### Option 2: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/fayfa-er-roster.git
cd fayfa-er-roster
npm install
npm start
```

## 📱 Application Overview

### Main Dashboard
- **Doctor Analytics:** View duty counts and percentages for each doctor
- **Monthly Roster:** Complete schedule view with shift types and referral duties
- **Quick Actions:** Add doctors, create roster entries, view notifications

### Advanced Features
- **Workload Analysis:** Detailed analysis with intensity scoring and balance metrics
- **Fairness Metrics:** Equity analysis with recommendations and alerts
- **Consultation Log:** Professional specialist consultation tracking form
- **Export Options:** CSV and PDF export for all data sections

### Sample Data Included
- **7 Pre-loaded Doctors:** Dr. Ahmed, Dr. Hagah, Dr. Shafi, Dr. Hasan, Dr. Akin, Dr. Ebuka, Dr. Rabab
- **June 2025 Roster:** Complete month with 148 roster entries
- **Referral Duties:** R, R2, ER duty codes properly tracked
- **Analytics Ready:** Immediate access to workload and fairness analysis

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Email Service**: Nodemailer
- **Scheduling**: Node-cron
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Template Engine**: EJS

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fayfa-er-roster
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure email settings**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your email configuration:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=Fayfa ER Roster <noreply@fayfa.hospital>
   PORT=3000
   ```

4. **Start the application**:
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Email Configuration

### For Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an app-specific password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password in the `EMAIL_PASS` environment variable

### For other email providers:
Update the email service configuration in `src/utils/emailService.js`

## API Endpoints

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Roster
- `GET /api/roster` - Get all roster entries
- `GET /api/roster/:year/:month` - Get roster for specific month
- `GET /api/roster/analytics/:year/:month` - Get duty analytics for month
- `POST /api/roster` - Create new roster entry
- `PUT /api/roster/:id` - Update roster entry
- `DELETE /api/roster/:id` - Delete roster entry

### Notifications
- `GET /api/notifications/upcoming` - Get upcoming duties requiring notifications
- `GET /api/notifications/scheduled` - Get currently scheduled notifications
- `POST /api/notifications/test` - Send test notification
- `POST /api/notifications/check` - Manually check for upcoming duties
- `POST /api/notifications/clear` - Clear all scheduled notifications

## Usage

### Adding Doctors
1. Click "Add Doctor" button
2. Fill in doctor details (name, email, phone, specialization)
3. Submit the form

### Creating Roster Entries
1. Click "Add Roster Entry" button
2. Select doctor, shift, and date
3. Optionally mark as referral duty
4. Submit the entry

### Viewing Analytics
1. Select month/year using the date picker
2. Click "Load Roster" to view analytics and roster data
3. Analytics show duty counts and percentages for each doctor

### Email Notifications
- The system automatically checks every 30 minutes for upcoming duties
- Notifications are sent 2 hours before each duty starts
- Doctors receive detailed email reminders with duty information

## Project Structure

```
fayfa-er-roster/
├── src/
│   ├── controllers/        # Route controllers
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions (email, scheduler)
│   └── app.js             # Main application file
├── public/
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   └── images/            # Static images
├── views/                 # EJS templates
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Customization

### Shift Times
The application uses the following shift schedule:
- **Morning Shift**: 7:00 AM to 3:00 PM (8 hours)
- **Evening Shift**: 3:00 PM to 11:00 PM (8 hours)
- **Night Shift**: 11:00 PM to 7:00 AM (8 hours)

Modify shift times in `src/utils/notificationScheduler.js`:
```javascript
case 'morning':
    dutyDate.setHours(7, 0, 0, 0); // 7:00 AM
    break;
case 'evening':
    dutyDate.setHours(15, 0, 0, 0); // 3:00 PM
    break;
case 'night':
    dutyDate.setHours(23, 0, 0, 0); // 11:00 PM
    break;
```

### Email Templates
Customize email templates in `src/utils/emailService.js` in the `generateDutyNotificationHTML` method.

### Hospital Branding
Update hospital name and branding in:
- `views/dashboard.ejs`
- `src/utils/emailService.js`
- `public/css/dashboard.css`

## Development

### Adding New Features
1. Create models in `src/models/`
2. Add controllers in `src/controllers/`
3. Define routes in `src/routes/`
4. Update the main app in `src/app.js`

### Testing Email Functionality
Use the test notification endpoint:
```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"doctorId": 1, "dutyId": 1}'
```

## Support

For issues or questions about the Fayfa ER Roster Management System, please contact the development team or create an issue in the project repository.

## License

This project is licensed under the ISC License.