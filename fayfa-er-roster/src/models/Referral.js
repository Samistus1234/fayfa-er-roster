class Referral {
  constructor(id, patientId, erDoctorId, referralType, destination, urgency, status, referralTime, notes, outcome) {
    this.id = id;
    this.patientId = patientId;
    this.erDoctorId = erDoctorId;
    this.referralType = referralType; // 'emergency', 'life-saving', 'routine'
    this.destination = destination; // Hospital/facility name
    this.urgency = urgency; // 'immediate', 'urgent', 'routine'
    this.status = status; // 'pending', 'in-transit', 'completed', 'cancelled'
    this.referralTime = new Date(referralTime);
    this.notes = notes || '';
    this.outcome = outcome || '';
    this.createdAt = new Date();
  }

  static referrals = [
    new Referral(1, 'P001', 1, 'emergency', 'King Faisal Specialist Hospital', 'immediate', 'completed', '2025-07-01T08:00:00Z', 'STEMI - urgent PCI needed', 'Successful PCI performed'),
    new Referral(2, 'P002', 2, 'life-saving', 'National Guard Hospital', 'immediate', 'in-transit', '2025-07-01T09:30:00Z', 'Stroke - thrombolysis candidate', ''),
    new Referral(3, 'P003', 3, 'emergency', 'King Khalid University Hospital', 'urgent', 'completed', '2025-07-01T07:15:00Z', 'Trauma - multiple injuries', 'Stabilized in trauma center'),
    new Referral(4, 'P004', 4, 'routine', 'Riyadh Care Hospital', 'routine', 'pending', '2025-07-01T10:45:00Z', 'Elective surgery consultation', ''),
    new Referral(5, 'P005', 1, 'emergency', 'King Saud Medical City', 'immediate', 'in-transit', '2025-07-01T11:20:00Z', 'Acute MI - cardiogenic shock', '')
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
    return this.referrals.filter(referral => referral.referralType === type);
  }

  static getByUrgency(urgency) {
    return this.referrals.filter(referral => referral.urgency === urgency);
  }

  static getByERDoctor(erDoctorId) {
    return this.referrals.filter(referral => referral.erDoctorId === parseInt(erDoctorId));
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
      const referralDate = new Date(referral.referralTime);
      return referralDate >= today && referralDate < tomorrow;
    });
  }

  static add(referralData) {
    const newId = Math.max(...this.referrals.map(r => r.id)) + 1;
    const referral = new Referral(
      newId,
      referralData.patientId,
      referralData.erDoctorId,
      referralData.referralType,
      referralData.destination,
      referralData.urgency,
      referralData.status || 'pending',
      referralData.referralTime || new Date().toISOString(),
      referralData.notes,
      referralData.outcome
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
    const emergency = this.referrals.filter(r => r.referralType === 'emergency').length;
    const lifeSaving = this.referrals.filter(r => r.referralType === 'life-saving').length;
    const active = this.getActiveReferrals().length;
    const todaysReferrals = this.getTodaysReferrals().length;
    
    const destinationBreakdown = {};
    this.referrals.forEach(referral => {
      destinationBreakdown[referral.destination] = (destinationBreakdown[referral.destination] || 0) + 1;
    });

    const doctorBreakdown = {};
    this.referrals.forEach(referral => {
      doctorBreakdown[referral.erDoctorId] = (doctorBreakdown[referral.erDoctorId] || 0) + 1;
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
      const month = new Date(referral.referralTime).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { emergency: 0, lifeSaving: 0, total: 0 };
      }
      monthlyData[month].total++;
      if (referral.referralType === 'emergency') monthlyData[month].emergency++;
      if (referral.referralType === 'life-saving') monthlyData[month].lifeSaving++;
    });

    return monthlyData;
  }
}

module.exports = Referral;
