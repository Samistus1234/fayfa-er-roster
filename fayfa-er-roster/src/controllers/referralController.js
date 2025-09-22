const Referral = require('../models/Referral');
const Doctor = require('../models/Doctor');

const referralController = {
  getAllReferrals: (req, res) => {
    try {
      const referrals = Referral.getAll();
      res.json({ success: true, data: referrals });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getReferralsByMonth: (req, res) => {
    try {
      const { year, month } = req.params;
      const referrals = Referral.getByMonth(parseInt(year), parseInt(month));
      
      // Add doctor names to referrals
      const referralsWithDoctorNames = referrals.map(referral => {
        const doctor = Doctor.findById(referral.doctorId);
        return {
          ...referral,
          doctorName: doctor ? doctor.name : 'Unknown Doctor'
        };
      });
      
      res.json({ success: true, data: referralsWithDoctorNames });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getReferralsByDoctor: (req, res) => {
    try {
      const { doctorId } = req.params;
      const referrals = Referral.getByDoctor(parseInt(doctorId));
      res.json({ success: true, data: referrals });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getReferralStats: (req, res) => {
    try {
      const { year, month } = req.params;
      const stats = Referral.getStatsByMonth(parseInt(year), parseInt(month));
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createReferral: (req, res) => {
    try {
      const { doctorId, type, patientName, description, date } = req.body;

      // Validation
      if (!doctorId || !type || !patientName || !date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor ID, type, patient name, and date are required' 
        });
      }

      // Validate doctor exists
      const doctor = Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor not found' 
        });
      }

      // Validate type
      if (!['emergency', 'life-saving'].includes(type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Type must be either "emergency" or "life-saving"' 
        });
      }

      const referral = Referral.add({
        doctorId,
        type,
        patientName,
        description: description || '',
        date
      });

      res.status(201).json({ 
        success: true, 
        data: referral,
        message: 'Referral created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateReferral: (req, res) => {
    try {
      const referral = Referral.update(req.params.id, req.body);
      if (!referral) {
        return res.status(404).json({ success: false, message: 'Referral not found' });
      }
      res.json({ success: true, data: referral });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteReferral: (req, res) => {
    try {
      const referral = Referral.delete(req.params.id);
      if (!referral) {
        return res.status(404).json({ success: false, message: 'Referral not found' });
      }
      res.json({ success: true, message: 'Referral deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = referralController;