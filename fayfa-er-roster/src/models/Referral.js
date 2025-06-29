class Referral {
  constructor(id, doctorId, type, patientName, description, date, createdAt) {
    this.id = id;
    this.doctorId = doctorId;
    this.type = type; // 'emergency' or 'life-saving'
    this.patientName = patientName;
    this.description = description;
    this.date = new Date(date);
    this.createdAt = createdAt || new Date();
  }

  static referrals = [];

  static getAll() {
    return this.referrals;
  }

  static findById(id) {
    return this.referrals.find(referral => referral.id === parseInt(id));
  }

  static getByDoctor(doctorId) {
    return this.referrals.filter(referral => referral.doctorId === parseInt(doctorId));
  }

  static getByMonth(year, month) {
    return this.referrals.filter(referral => {
      const refDate = new Date(referral.date);
      return refDate.getFullYear() === year && refDate.getMonth() === month - 1;
    });
  }

  static add(referralData) {
    const newId = this.referrals.length > 0 
      ? Math.max(...this.referrals.map(r => r.id)) + 1 
      : 1;
    
    const referral = new Referral(
      newId,
      referralData.doctorId,
      referralData.type,
      referralData.patientName,
      referralData.description,
      referralData.date
    );
    
    this.referrals.push(referral);
    return referral;
  }

  static update(id, updates) {
    const referralIndex = this.referrals.findIndex(ref => ref.id === parseInt(id));
    if (referralIndex !== -1) {
      this.referrals[referralIndex] = { ...this.referrals[referralIndex], ...updates };
      return this.referrals[referralIndex];
    }
    return null;
  }

  static delete(id) {
    const referralIndex = this.referrals.findIndex(ref => ref.id === parseInt(id));
    if (referralIndex !== -1) {
      return this.referrals.splice(referralIndex, 1)[0];
    }
    return null;
  }

  static getStatsByMonth(year, month) {
    const monthlyReferrals = this.getByMonth(year, month);
    const Doctor = require('./Doctor');
    
    const stats = {
      total: monthlyReferrals.length,
      emergency: monthlyReferrals.filter(r => r.type === 'emergency').length,
      lifeSaving: monthlyReferrals.filter(r => r.type === 'life-saving').length,
      doctorBreakdown: []
    };

    // Get breakdown by doctor
    const doctors = Doctor.getAll();
    doctors.forEach(doctor => {
      const doctorReferrals = monthlyReferrals.filter(r => r.doctorId === doctor.id);
      const emergency = doctorReferrals.filter(r => r.type === 'emergency').length;
      const lifeSaving = doctorReferrals.filter(r => r.type === 'life-saving').length;
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