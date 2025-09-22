const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Roster = require('../models/Roster');
const MedicalLicense = require('../models/MedicalLicense');

// Export roster data to CSV
router.get('/roster/csv', (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`Exporting roster CSV for ${year}-${month}`);

    // Get roster data
    let rosterData;
    if (year && month) {
      rosterData = Roster.getByMonth(parseInt(year), parseInt(month));
    } else {
      rosterData = Roster.getAll();
    }

    // Get doctors for name mapping
    const doctors = Doctor.getAll();
    const doctorMap = {};
    doctors.forEach(doctor => {
      doctorMap[doctor.id] = doctor.name;
    });

    // Generate CSV headers
    const headers = [
      'ID',
      'Doctor Name',
      'Doctor ID', 
      'Shift',
      'Date',
      'Is Referral Duty',
      'Day of Week',
      'Created At'
    ];

    // Generate CSV rows
    const csvRows = rosterData.map(entry => [
      entry.id,
      doctorMap[entry.doctorId] || `Doctor ${entry.doctorId}`,
      entry.doctorId,
      entry.shift,
      entry.date.toISOString().split('T')[0], // YYYY-MM-DD format
      entry.isReferralDuty ? 'Yes' : 'No',
      entry.date.toLocaleDateString('en-US', { weekday: 'long' }),
      entry.createdAt.toISOString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') ? `"${field}"` : field
      ).join(','))
    ].join('\n');

    // Set response headers for file download
    const filename = year && month 
      ? `fayfa-roster-${year}-${month.toString().padStart(2, '0')}.csv`
      : `fayfa-roster-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

    console.log(`✅ Roster CSV exported: ${filename} (${rosterData.length} entries)`);
  } catch (error) {
    console.error('Error exporting roster CSV:', error);
    res.status(500).json({ error: 'Failed to export roster data' });
  }
});

// Export doctors data to CSV
router.get('/doctors/csv', (req, res) => {
  try {
    console.log('Exporting doctors CSV');

    const doctors = Doctor.getAll();

    // Generate CSV headers
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Specialization',
      'Is Available',
      'Created At'
    ];

    // Generate CSV rows
    const csvRows = doctors.map(doctor => [
      doctor.id,
      doctor.name,
      doctor.email,
      doctor.phone,
      doctor.specialization,
      doctor.isAvailable ? 'Yes' : 'No',
      doctor.createdAt.toISOString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') ? `"${field}"` : field
      ).join(','))
    ].join('\n');

    // Set response headers for file download
    const filename = `fayfa-doctors-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

    console.log(`✅ Doctors CSV exported: ${filename} (${doctors.length} entries)`);
  } catch (error) {
    console.error('Error exporting doctors CSV:', error);
    res.status(500).json({ error: 'Failed to export doctors data' });
  }
});

// Export analytics data to CSV
router.get('/analytics/csv', (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`Exporting analytics CSV for ${year}-${month}`);

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required for analytics export' });
    }

    // Get roster data for the specified month
    const rosterData = Roster.getByMonth(parseInt(year), parseInt(month));
    const doctors = Doctor.getAll();

    // Calculate analytics using getDutyAnalytics
    const analyticsData = Roster.getDutyAnalytics(parseInt(year), parseInt(month));
    
    // Convert analytics object to array
    const analytics = Object.keys(analyticsData).map(doctorId => {
      const data = analyticsData[doctorId];
      return {
        doctorId: parseInt(doctorId),
        doctor: data.doctor,
        totalDuties: data.total,
        morningCount: data.counts.morning,
        eveningCount: data.counts.evening,
        nightCount: data.counts.night,
        referralCount: data.counts.referral,
        percentage: (data.total / rosterData.length) * 100
      };
    });

    // Generate CSV headers
    const headers = [
      'Doctor Name',
      'Doctor ID',
      'Total Duties',
      'Morning Shifts',
      'Evening Shifts', 
      'Night Shifts',
      'Referral Duties',
      'Duty Percentage',
      'Morning %',
      'Evening %',
      'Night %',
      'Referral %'
    ];

    // Generate CSV rows
    const csvRows = analytics.map(doctorAnalytics => {
      const data = analyticsData[doctorAnalytics.doctorId];
      
      return [
        doctorAnalytics.doctor.name,
        doctorAnalytics.doctorId,
        doctorAnalytics.totalDuties,
        doctorAnalytics.morningCount,
        doctorAnalytics.eveningCount,
        doctorAnalytics.nightCount,
        doctorAnalytics.referralCount,
        `${doctorAnalytics.percentage.toFixed(1)}%`,
        `${data.percentages.morning}%`,
        `${data.percentages.evening}%`,
        `${data.percentages.night}%`,
        `${data.percentages.referral}%`
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') ? `"${field}"` : field
      ).join(','))
    ].join('\n');

    // Set response headers for file download
    const filename = `fayfa-analytics-${year}-${month.toString().padStart(2, '0')}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

    console.log(`✅ Analytics CSV exported: ${filename} (${analytics.length} entries)`);
  } catch (error) {
    console.error('Error exporting analytics CSV:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

// Export comprehensive report data (JSON format for PDF generation)
router.get('/report/data', (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`Generating comprehensive report data for ${year}-${month}`);

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required for report generation' });
    }

    // Get all data
    const rosterData = Roster.getByMonth(parseInt(year), parseInt(month));
    const doctors = Doctor.getAll();
    const analyticsData = Roster.getDutyAnalytics(parseInt(year), parseInt(month));

    // Calculate summary statistics
    const totalDuties = rosterData.length;
    const totalDoctors = doctors.length;
    const averageDutiesPerDoctor = totalDuties / totalDoctors;
    const referralDuties = rosterData.filter(r => r.isReferralDuty).length;

    // Shift distribution
    const shiftDistribution = {
      morning: rosterData.filter(r => r.shift === 'morning').length,
      evening: rosterData.filter(r => r.shift === 'evening').length,
      night: rosterData.filter(r => r.shift === 'night').length
    };

    // Convert analytics to array format
    const analytics = Object.keys(analyticsData).map(doctorId => {
      const data = analyticsData[doctorId];
      return {
        doctorId: parseInt(doctorId),
        doctor: data.doctor,
        totalDuties: data.total,
        morningCount: data.counts.morning,
        eveningCount: data.counts.evening,
        nightCount: data.counts.night,
        referralCount: data.counts.referral,
        percentage: (data.total / totalDuties) * 100
      };
    });

    // Prepare comprehensive report data
    const reportData = {
      metadata: {
        title: 'Fayfa General Hospital - ER Roster Report',
        period: `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Fayfa ER Roster Management System'
      },
      summary: {
        totalDuties,
        totalDoctors,
        averageDutiesPerDoctor: Math.round(averageDutiesPerDoctor * 10) / 10,
        referralDuties,
        referralPercentage: Math.round((referralDuties / totalDuties) * 100 * 10) / 10
      },
      shiftDistribution,
      doctors,
      rosterData,
      analytics,
      analyticsData
    };

    res.json(reportData);
    console.log(`✅ Report data generated for ${year}-${month}`);
  } catch (error) {
    console.error('Error generating report data:', error);
    res.status(500).json({ error: 'Failed to generate report data' });
  }
});

// Get available export formats and periods
router.get('/options', (req, res) => {
  try {
    // Get available months from roster data
    const allRoster = Roster.getAll();
    const availablePeriods = [...new Set(allRoster.map(r => {
      const date = new Date(r.date);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }))].sort();

    const exportOptions = {
      formats: [
        {
          id: 'roster-csv',
          name: 'Roster Data (CSV)',
          description: 'Complete roster entries with doctor names and shift details',
          endpoint: '/api/export/roster/csv',
          requiresPeriod: false
        },
        {
          id: 'doctors-csv', 
          name: 'Doctors List (CSV)',
          description: 'Complete list of doctors with contact information',
          endpoint: '/api/export/doctors/csv',
          requiresPeriod: false
        },
        {
          id: 'analytics-csv',
          name: 'Analytics Report (CSV)', 
          description: 'Duty statistics, workload analysis, and fairness metrics',
          endpoint: '/api/export/analytics/csv',
          requiresPeriod: true
        },
        {
          id: 'comprehensive-pdf',
          name: 'Comprehensive Report (PDF)',
          description: 'Complete report with charts, statistics, and analysis',
          endpoint: '/api/export/report/data',
          requiresPeriod: true,
          clientGenerated: true
        }
      ],
      availablePeriods: availablePeriods.map(period => {
        const [year, month] = period.split('-');
        const date = new Date(year, month - 1);
        return {
          value: period,
          label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          year: parseInt(year),
          month: parseInt(month)
        };
      })
    };

    res.json(exportOptions);
  } catch (error) {
    console.error('Error getting export options:', error);
    res.status(500).json({ error: 'Failed to get export options' });
  }
});

module.exports = router;
