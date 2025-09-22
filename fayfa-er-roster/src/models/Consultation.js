class Consultation {
  constructor(id, patientId, erDoctorId, specialistId, specialty, urgency, status, requestTime, responseTime, notes) {
    this.id = id;
    this.patientId = patientId;
    this.erDoctorId = erDoctorId;
    this.specialistId = specialistId;
    this.specialty = specialty;
    this.urgency = urgency; // 'routine', 'urgent', 'emergency'
    this.status = status; // 'pending', 'accepted', 'completed', 'declined'
    this.requestTime = new Date(requestTime);
    this.responseTime = responseTime ? new Date(responseTime) : null;
    this.notes = notes || '';
    this.createdAt = new Date();
  }

  static consultations = [
    new Consultation(1, 'P001', 1, null, 'Cardiology', 'urgent', 'pending', '2025-07-01T08:30:00Z', null, 'Chest pain, possible MI'),
    new Consultation(2, 'P002', 2, null, 'Neurology', 'emergency', 'pending', '2025-07-01T09:15:00Z', null, 'Stroke symptoms'),
    new Consultation(3, 'P003', 3, null, 'Orthopedics', 'routine', 'completed', '2025-07-01T07:45:00Z', '2025-07-01T08:00:00Z', 'Fracture assessment'),
    new Consultation(4, 'P004', 1, null, 'Psychiatry', 'urgent', 'accepted', '2025-07-01T10:20:00Z', '2025-07-01T10:35:00Z', 'Mental health crisis'),
    new Consultation(5, 'P005', 4, null, 'Surgery', 'emergency', 'pending', '2025-07-01T11:00:00Z', null, 'Acute abdomen')
  ];

  static getAll() {
    return this.consultations;
  }

  static findById(id) {
    return this.consultations.find(consultation => consultation.id === parseInt(id));
  }

  static getByStatus(status) {
    return this.consultations.filter(consultation => consultation.status === status);
  }

  static getBySpecialty(specialty) {
    return this.consultations.filter(consultation => consultation.specialty === specialty);
  }

  static getByUrgency(urgency) {
    return this.consultations.filter(consultation => consultation.urgency === urgency);
  }

  static getByERDoctor(erDoctorId) {
    return this.consultations.filter(consultation => consultation.erDoctorId === parseInt(erDoctorId));
  }

  static getActiveConsultations() {
    return this.consultations.filter(consultation => 
      ['pending', 'accepted'].includes(consultation.status)
    );
  }

  static add(consultationData) {
    const newId = Math.max(...this.consultations.map(c => c.id)) + 1;
    const consultation = new Consultation(
      newId,
      consultationData.patientId,
      consultationData.erDoctorId,
      consultationData.specialistId,
      consultationData.specialty,
      consultationData.urgency,
      consultationData.status || 'pending',
      consultationData.requestTime || new Date().toISOString(),
      consultationData.responseTime,
      consultationData.notes
    );
    this.consultations.push(consultation);
    return consultation;
  }

  static update(id, updates) {
    const consultationIndex = this.consultations.findIndex(consultation => consultation.id === parseInt(id));
    if (consultationIndex !== -1) {
      this.consultations[consultationIndex] = { ...this.consultations[consultationIndex], ...updates };
      return this.consultations[consultationIndex];
    }
    return null;
  }

  static delete(id) {
    const consultationIndex = this.consultations.findIndex(consultation => consultation.id === parseInt(id));
    if (consultationIndex !== -1) {
      return this.consultations.splice(consultationIndex, 1)[0];
    }
    return null;
  }

  static getConsultationStats() {
    const total = this.consultations.length;
    const pending = this.consultations.filter(c => c.status === 'pending').length;
    const urgent = this.consultations.filter(c => c.urgency === 'urgent').length;
    const emergency = this.consultations.filter(c => c.urgency === 'emergency').length;
    
    const specialtyBreakdown = {};
    this.consultations.forEach(consultation => {
      specialtyBreakdown[consultation.specialty] = (specialtyBreakdown[consultation.specialty] || 0) + 1;
    });

    return {
      total,
      pending,
      urgent,
      emergency,
      specialtyBreakdown,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  static calculateAverageResponseTime() {
    const completedConsultations = this.consultations.filter(c => c.responseTime);
    if (completedConsultations.length === 0) return 0;

    const totalResponseTime = completedConsultations.reduce((sum, consultation) => {
      const responseTime = new Date(consultation.responseTime) - new Date(consultation.requestTime);
      return sum + responseTime;
    }, 0);

    return Math.round(totalResponseTime / completedConsultations.length / (1000 * 60)); // in minutes
  }
}

module.exports = Consultation;
