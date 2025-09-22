class Doctor {
  constructor(id, name, email, phone, specialization, isAvailable = true) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.specialization = specialization;
    this.isAvailable = isAvailable;
    this.createdAt = new Date();
  }

  static doctors = [
    new Doctor(1, 'Dr. Ahmed', 'ahmed@fayfa.hospital', '+966501234567', 'Emergency Medicine'),
    new Doctor(2, 'Dr. Hagah', 'hagah@fayfa.hospital', '+966501234568', 'Emergency Medicine'),
    new Doctor(3, 'Dr. Shafi', 'shafi@fayfa.hospital', '+966501234569', 'Emergency Medicine'),
    new Doctor(4, 'Dr. Hasan', 'hasan@fayfa.hospital', '+966501234570', 'Emergency Medicine'),
    new Doctor(5, 'Dr. Akin', 'akin@fayfa.hospital', '+966501234571', 'Emergency Medicine'),
    new Doctor(6, 'Dr. Ebuka', 'ebuka@fayfa.hospital', '+966501234572', 'Emergency Medicine'),
    new Doctor(7, 'Dr. Rabab', 'rabab@fayfa.hospital', '+966501234573', 'Emergency Medicine'),
    new Doctor(8, 'Dr. Hiba', 'hiba@fayfa.hospital', '+966501234574', 'Emergency Medicine')
  ];

  static getAll() {
    return this.doctors;
  }

  static findById(id) {
    return this.doctors.find(doctor => doctor.id === parseInt(id));
  }

  static findByEmail(email) {
    return this.doctors.find(doctor => doctor.email === email);
  }

  static add(doctorData) {
    const newId = Math.max(...this.doctors.map(d => d.id)) + 1;
    const doctor = new Doctor(newId, doctorData.name, doctorData.email, doctorData.phone, doctorData.specialization);
    this.doctors.push(doctor);
    return doctor;
  }

  static update(id, updates) {
    const doctorIndex = this.doctors.findIndex(doctor => doctor.id === parseInt(id));
    if (doctorIndex !== -1) {
      this.doctors[doctorIndex] = { ...this.doctors[doctorIndex], ...updates };
      return this.doctors[doctorIndex];
    }
    return null;
  }

  static delete(id) {
    const doctorIndex = this.doctors.findIndex(doctor => doctor.id === parseInt(id));
    if (doctorIndex !== -1) {
      return this.doctors.splice(doctorIndex, 1)[0];
    }
    return null;
  }
}

module.exports = Doctor;