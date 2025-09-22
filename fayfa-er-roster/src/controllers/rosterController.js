const Roster = require('../models/Roster');
const Doctor = require('../models/Doctor');

const rosterController = {
  getAllRoster: (req, res) => {
    try {
      const roster = Roster.getAll();
      res.json({ success: true, data: roster });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getRosterByMonth: (req, res) => {
    try {
      const { year, month } = req.params;
      const roster = Roster.getByMonth(parseInt(year), parseInt(month));
      
      // Add doctor names to roster entries
      const rosterWithDoctorNames = roster.map(entry => {
        const doctor = Doctor.findById(entry.doctorId);
        return {
          ...entry,
          doctorName: doctor ? doctor.name : 'Unknown Doctor'
        };
      });
      
      res.json({ success: true, data: rosterWithDoctorNames });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDutyAnalytics: (req, res) => {
    try {
      const { year, month } = req.params;
      const analytics = Roster.getDutyAnalytics(parseInt(year), parseInt(month));
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSpecialistsToday: (req, res) => {
    try {
      const specialistsData = Roster.getSpecialistsToday();
      res.json({ success: true, data: specialistsData });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createRosterEntry: (req, res) => {
    try {
      const { doctorId, shift, date, isReferralDuty } = req.body;

      if (!doctorId || !shift || !date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor ID, shift, and date are required' 
        });
      }

      const doctor = Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor not found' 
        });
      }

      if (!['morning', 'evening', 'night'].includes(shift)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Shift must be morning, evening, or night' 
        });
      }

      const rosterEntry = Roster.add({ doctorId, shift, date, isReferralDuty });
      res.status(201).json({ success: true, data: rosterEntry });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateRosterEntry: (req, res) => {
    try {
      const entry = Roster.update(req.params.id, req.body);
      if (!entry) {
        return res.status(404).json({ success: false, message: 'Roster entry not found' });
      }
      res.json({ success: true, data: entry });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteRosterEntry: (req, res) => {
    try {
      const entry = Roster.delete(req.params.id);
      if (!entry) {
        return res.status(404).json({ success: false, message: 'Roster entry not found' });
      }
      res.json({ success: true, message: 'Roster entry deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  importRoster: (req, res) => {
    try {
      const { year, month, replaceExisting, entries } = req.body;

      if (!year || !month || !entries || !Array.isArray(entries)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid import data. Required: year, month, entries array' 
        });
      }

      if (entries.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No entries to import' 
        });
      }

      // If replaceExisting, delete existing entries for the month
      if (replaceExisting) {
        const existingEntries = Roster.getByMonth(year, month);
        existingEntries.forEach(entry => {
          Roster.delete(entry.id);
        });
      }

      // Process and validate each entry
      let imported = 0;
      let errors = [];
      const doctors = Doctor.getAll();
      const doctorMap = new Map();
      
      // Create a map of doctor names for quick lookup
      doctors.forEach(doctor => {
        doctorMap.set(doctor.name.toLowerCase(), doctor.id);
      });

      entries.forEach((entry, index) => {
        try {
          const { date, doctorName, shift, area, isReferralDuty } = entry;

          // Find doctor by name
          let doctorId = doctorMap.get(doctorName.toLowerCase());
          
          // If doctor doesn't exist, create new doctor
          if (!doctorId) {
            const newDoctor = Doctor.add({
              name: doctorName,
              email: `${doctorName.toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
              phone: '0000000000',
              specialization: 'Emergency Medicine'
            });
            doctorId = newDoctor.id;
            doctorMap.set(doctorName.toLowerCase(), doctorId);
          }

          // Create roster entry
          const rosterEntry = {
            doctorId,
            shift: shift.toLowerCase(),
            date,
            area: area || 'Main ER',
            isReferralDuty: isReferralDuty || false
          };

          Roster.add(rosterEntry);
          imported++;

        } catch (error) {
          errors.push(`Row ${index + 1}: ${error.message}`);
        }
      });

      if (errors.length > 0 && imported === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Import failed', 
          errors: errors.slice(0, 5) 
        });
      }

      res.json({ 
        success: true, 
        imported, 
        total: entries.length,
        errors: errors.slice(0, 5),
        message: `Successfully imported ${imported} of ${entries.length} entries`
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  downloadTemplate: (req, res) => {
    try {
      const path = require('path');
      const fs = require('fs');
      const format = req.query.format || 'csv';
      
      // Define template file paths
      const templatesDir = path.join(__dirname, '..', '..', 'public', 'templates');
      const templateFiles = {
        csv: path.join(templatesDir, 'roster-template.csv'),
        xlsx: path.join(templatesDir, 'roster-template.xlsx')
      };
      
      if (format === 'csv' || format === 'xlsx') {
        const filePath = templateFiles[format];
        
        // Check if template file exists
        if (!fs.existsSync(filePath)) {
          // If template doesn't exist, create it on the fly
          const generateScript = path.join(__dirname, '..', '..', 'generate-templates.js');
          if (fs.existsSync(generateScript)) {
            require('child_process').execSync('node ' + generateScript);
          }
        }
        
        // Check again after potential generation
        if (fs.existsSync(filePath)) {
          // Set appropriate headers
          if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="roster-template.csv"');
          } else {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="roster-template.xlsx"');
          }
          
          // Send the file
          res.sendFile(filePath);
        } else {
          // If still no file, send error
          res.status(404).json({ 
            success: false, 
            message: `Template file not found. Please contact support.` 
          });
        }
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid format. Use ?format=csv or ?format=xlsx' 
        });
      }
      
    } catch (error) {
      console.error('Template download error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
};

module.exports = rosterController;