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

      // Add doctor name resolution
      const doctors = Doctor.getAll();
      const rosterWithNames = roster.map(shift => {
        if (!shift.doctorName && shift.doctorId) {
          const doctor = doctors.find(d => d.id === shift.doctorId);
          if (doctor) {
            shift.doctorName = doctor.name;
          }
        }
        return shift;
      });

      res.json({ success: true, data: rosterWithNames });
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
  }
};

module.exports = rosterController;