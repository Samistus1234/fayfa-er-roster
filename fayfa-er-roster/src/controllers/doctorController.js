const Doctor = require('../models/Doctor');

const doctorController = {
  getAllDoctors: (req, res) => {
    try {
      const doctors = Doctor.getAll();
      res.json({ success: true, data: doctors });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDoctorById: (req, res) => {
    try {
      const doctor = Doctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      res.json({ success: true, data: doctor });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createDoctor: (req, res) => {
    try {
      const { name, email, phone, specialization } = req.body;
      
      if (!name || !email || !phone || !specialization) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      const existingDoctor = Doctor.findByEmail(email);
      if (existingDoctor) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor with this email already exists' 
        });
      }

      const doctor = Doctor.add({ name, email, phone, specialization });
      res.status(201).json({ success: true, data: doctor });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateDoctor: (req, res) => {
    try {
      const doctor = Doctor.update(req.params.id, req.body);
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      res.json({ success: true, data: doctor });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteDoctor: (req, res) => {
    try {
      const doctor = Doctor.delete(req.params.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = doctorController;