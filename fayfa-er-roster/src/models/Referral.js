class Referral {
  constructor(id, patientId, erDoctorId, referralType, destination, urgency, status, referralTime, notes, outcome, patientName, description, date) {
    this.id = id;
    // Support both old and new field patterns
    this.patientId = patientId;
    this.patientName = patientName;
    this.erDoctorId = erDoctorId;
    this.doctorId = erDoctorId; // Alias for compatibility
    this.referralType = referralType || 'emergency'; // 'emergency', 'life-saving', 'routine'
    this.type = referralType || 'emergency'; // Alias for compatibility
    this.destination = destination; // Hospital/facility name
    this.description = description;
    this.urgency = urgency; // 'immediate', 'urgent', 'routine'
    this.status = status; // 'pending', 'in-transit', 'completed', 'cancelled'
    this.referralTime = new Date(referralTime || date);
    this.date = new Date(date || referralTime); // Alias for compatibility
    this.notes = notes || '';
    this.outcome = outcome || '';
    this.createdAt = new Date();
  }

  static referrals = [
    new Referral(1, 'P001', 1, 'emergency', 'King Faisal Specialist Hospital', 'immediate', 'completed', '2025-07-01T08:00:00Z', 'STEMI - urgent PCI needed', 'Successful PCI performed', 'Ahmed Al-Rashid', 'STEMI - urgent PCI needed'),
    new Referral(2, 'P002', 2, 'life-saving', 'National Guard Hospital', 'immediate', 'in-transit', '2025-07-01T09:30:00Z', 'Stroke - thrombolysis candidate', '', 'Fatima Al-Zahra', 'Stroke - thrombolysis candidate'),
    new Referral(3, 'P003', 3, 'emergency', 'King Khalid University Hospital', 'urgent', 'completed', '2025-07-01T07:15:00Z', 'Trauma - multiple injuries', 'Stabilized in trauma center', 'Mohammed Al-Dosari', 'Trauma - multiple injuries'),
    new Referral(4, 'P004', 4, 'routine', 'Riyadh Care Hospital', 'routine', 'pending', '2025-07-01T10:45:00Z', 'Elective surgery consultation', '', 'Sarah Al-Otaibi', 'Elective surgery consultation'),
    new Referral(5, 'P005', 1, 'emergency', 'King Saud Medical City', 'immediate', 'in-transit', '2025-07-01T11:20:00Z', 'Acute MI - cardiogenic shock', '', 'Ali Al-Mutairi', 'Acute MI - cardiogenic shock')
  ];

  static getAll() {
    return this.referrals;
  }

  static findById(id) {
    return this.referrals.find(referral => referral.id === parseInt(id));
  }

  static getByStatus(status) {
    return this.referrals.filter(referral => referral.status === status);
  }

  static getByType(type) {
    return this.referrals.filter(referral => referral.referralType === type || referral.type === type);
  }

  static getByUrgency(urgency) {
    return this.referrals.filter(referral => referral.urgency === urgency);
  }

  static getByERDoctor(erDoctorId) {
    return this.referrals.filter(referral => referral.erDoctorId === parseInt(erDoctorId));
  }

  static getByDoctor(doctorId) {
    return this.referrals.filter(referral => referral.erDoctorId === parseInt(doctorId) || referral.doctorId === parseInt(doctorId));
  }

  static getActiveReferrals() {
    return this.referrals.filter(referral =>
      ['pending', 'in-transit'].includes(referral.status)
    );
  }

  static getTodaysReferrals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.referrals.filter(referral => {
      const referralDate = new Date(referral.referralTime || referral.date);
      return referralDate >= today && referralDate < tomorrow;
    });
  }

  static getByMonth(year, month) {
    return this.referrals.filter(referral => {
      const refDate = new Date(referral.date || referral.referralTime);
      return refDate.getFullYear() === year && refDate.getMonth() === month - 1;
    });
  }

  static add(referralData) {
    const newId = this.referrals.length > 0
      ? Math.max(...this.referrals.map(r => r.id)) + 1
      : 1;

    const referral = new Referral(
      newId,
      referralData.patientId,
      referralData.erDoctorId || referralData.doctorId,
      referralData.referralType || referralData.type,
      referralData.destination,
      referralData.urgency,
      referralData.status || 'pending',
      referralData.referralTime || referralData.date || new Date().toISOString(),
      referralData.notes,
      referralData.outcome,
      referralData.patientName,
      referralData.description,
      referralData.date
    );

    this.referrals.push(referral);
    return referral;
  }

  static update(id, updates) {
    const referralIndex = this.referrals.findIndex(referral => referral.id === parseInt(id));
    if (referralIndex !== -1) {
      this.referrals[referralIndex] = { ...this.referrals[referralIndex], ...updates };
      return this.referrals[referralIndex];
    }
    return null;
  }

  static delete(id) {
    const referralIndex = this.referrals.findIndex(referral => referral.id === parseInt(id));
    if (referralIndex !== -1) {
      return this.referrals.splice(referralIndex, 1)[0];
    }
    return null;
  }

  static getReferralStats() {
    const total = this.referrals.length;
    const emergency = this.referrals.filter(r => r.referralType === 'emergency' || r.type === 'emergency').length;
    const lifeSaving = this.referrals.filter(r => r.referralType === 'life-saving' || r.type === 'life-saving').length;
    const active = this.getActiveReferrals().length;
    const todaysReferrals = this.getTodaysReferrals().length;

    const destinationBreakdown = {};
    this.referrals.forEach(referral => {
      if (referral.destination) {
        destinationBreakdown[referral.destination] = (destinationBreakdown[referral.destination] || 0) + 1;
      }
    });

    const doctorBreakdown = {};
    this.referrals.forEach(referral => {
      const doctorId = referral.erDoctorId || referral.doctorId;
      if (doctorId) {
        doctorBreakdown[doctorId] = (doctorBreakdown[doctorId] || 0) + 1;
      }
    });

    return {
      total,
      emergency,
      lifeSaving,
      active,
      todaysReferrals,
      destinationBreakdown,
      doctorBreakdown
    };
  }

  static getReferralTrends() {
    // Group referrals by month for trending
    const monthlyData = {};
    this.referrals.forEach(referral => {
      const referralDate = referral.referralTime || referral.date;
      const month = new Date(referralDate).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { emergency: 0, lifeSaving: 0, total: 0 };
      }
      monthlyData[month].total++;
      const type = referral.referralType || referral.type;
      if (type === 'emergency') monthlyData[month].emergency++;
      if (type === 'life-saving') monthlyData[month].lifeSaving++;
    });

    return monthlyData;
  }

  static getStatsByMonth(year, month) {
    const monthlyReferrals = this.getByMonth(year, month);
    const Doctor = require('./Doctor');

    const stats = {
      total: monthlyReferrals.length,
      emergency: monthlyReferrals.filter(r => (r.type || r.referralType) === 'emergency').length,
      lifeSaving: monthlyReferrals.filter(r => (r.type || r.referralType) === 'life-saving').length,
      doctorBreakdown: []
    };

    // Get breakdown by doctor
    const doctors = Doctor.getAll();
    doctors.forEach(doctor => {
      const doctorReferrals = monthlyReferrals.filter(r =>
        (r.doctorId === doctor.id) || (r.erDoctorId === doctor.id)
      );
      const emergency = doctorReferrals.filter(r => (r.type || r.referralType) === 'emergency').length;
      const lifeSaving = doctorReferrals.filter(r => (r.type || r.referralType) === 'life-saving').length;
      const total = doctorReferrals.length;

      if (total > 0) {
        stats.doctorBreakdown.push({
          doctorId: doctor.id,
          name: doctor.name,
          total: total,
          emergency: emergency,
          lifeSaving: lifeSaving,
          emergencyPercentage: Math.round((emergency / total) * 100),
          lifeSavingPercentage: Math.round((lifeSaving / total) * 100)
        });
      }
    });

    return stats;
  }
}

module.exports = Referral;
