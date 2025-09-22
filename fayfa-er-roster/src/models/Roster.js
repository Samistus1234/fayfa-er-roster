class Roster {
  constructor(id, doctorId, shift, date, isReferralDuty = false) {
    this.id = id;
    this.doctorId = doctorId;
    this.shift = shift; // 'morning', 'evening', 'night'
    this.date = new Date(date);
    this.isReferralDuty = isReferralDuty;
    this.createdAt = new Date();
  }

  static roster = [
    new Roster(1, 1, 'morning', '2025-06-06'),
    new Roster(2, 2, 'evening', '2025-06-06'),
    new Roster(3, 3, 'night', '2025-06-06'),
    new Roster(4, 4, 'morning', '2025-06-07'),
    new Roster(5, 5, 'evening', '2025-06-07'),
    new Roster(6, 1, 'night', '2025-06-07'),
    new Roster(7, 2, 'morning', '2025-06-08', true),
    new Roster(8, 3, 'evening', '2025-06-08'),
    new Roster(9, 4, 'night', '2025-06-08'),
    new Roster(10, 5, 'morning', '2025-06-09'),
    // Test data for today (2025-06-28 in UTC)
    new Roster(11, 8, 'morning', '2025-06-28'), // Dr. Fathi - Morning shift
    new Roster(12, 9, 'evening', '2025-06-28'), // Dr. Mahasen - Evening shift
    new Roster(13, 10, 'night', '2025-06-28'), // Dr. Joseph - Night shift
  ];

  static getAll() {
    return this.roster;
  }

  static findById(id) {
    return this.roster.find(entry => entry.id === parseInt(id));
  }

  static getByMonth(year, month) {
    return this.roster.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1;
    });
  }

  static getByDoctor(doctorId) {
    return this.roster.filter(entry => entry.doctorId === parseInt(doctorId));
  }

  static add(rosterData) {
    const newId = Math.max(...this.roster.map(r => r.id)) + 1;
    const entry = new Roster(newId, rosterData.doctorId, rosterData.shift, rosterData.date, rosterData.isReferralDuty);
    this.roster.push(entry);
    return entry;
  }

  static update(id, updates) {
    const entryIndex = this.roster.findIndex(entry => entry.id === parseInt(id));
    if (entryIndex !== -1) {
      this.roster[entryIndex] = { ...this.roster[entryIndex], ...updates };
      return this.roster[entryIndex];
    }
    return null;
  }

  static delete(id) {
    const entryIndex = this.roster.findIndex(entry => entry.id === parseInt(id));
    if (entryIndex !== -1) {
      return this.roster.splice(entryIndex, 1)[0];
    }
    return null;
  }

  static getDutyAnalytics(year, month) {
    const monthlyRoster = this.getByMonth(year, month);
    const doctorAnalytics = {};

    const Doctor = require('./Doctor');
    const doctors = Doctor.getAll();

    // Calculate doctor-specific analytics
    doctors.forEach(doctor => {
      const doctorDuties = monthlyRoster.filter(entry => entry.doctorId === doctor.id);
      
      const shiftCounts = {
        morning: doctorDuties.filter(d => d.shift === 'morning' && !d.isReferralDuty).length,
        evening: doctorDuties.filter(d => d.shift === 'evening' && !d.isReferralDuty).length,
        night: doctorDuties.filter(d => d.shift === 'night' && !d.isReferralDuty).length,
        referral: doctorDuties.filter(d => d.isReferralDuty).length
      };

      const totalDuties = shiftCounts.morning + shiftCounts.evening + shiftCounts.night + shiftCounts.referral;

      doctorAnalytics[doctor.id] = {
        doctor: doctor,
        counts: shiftCounts,
        total: totalDuties,
        percentages: {
          morning: totalDuties > 0 ? ((shiftCounts.morning / totalDuties) * 100).toFixed(1) : 0,
          evening: totalDuties > 0 ? ((shiftCounts.evening / totalDuties) * 100).toFixed(1) : 0,
          night: totalDuties > 0 ? ((shiftCounts.night / totalDuties) * 100).toFixed(1) : 0,
          referral: totalDuties > 0 ? ((shiftCounts.referral / totalDuties) * 100).toFixed(1) : 0
        }
      };
    });

    // Calculate summary analytics for the dashboard
    const totalShifts = monthlyRoster.filter(entry => !entry.isReferralDuty).length;
    const referralDuties = monthlyRoster.filter(entry => entry.isReferralDuty).length;
    const activeDoctors = new Set(monthlyRoster.map(entry => entry.doctorId)).size;
    
    // Calculate coverage rate (assuming 3 shifts per day for the month)
    const daysInMonth = new Date(year, month, 0).getDate();
    const expectedShifts = daysInMonth * 3; // 3 shifts per day
    const actualShifts = totalShifts + referralDuties;
    const coverageRate = expectedShifts > 0 ? Math.round((actualShifts / expectedShifts) * 100) : 0;
    
    // Calculate referral percentage
    const referralPercentage = (totalShifts + referralDuties) > 0 
      ? Math.round((referralDuties / (totalShifts + referralDuties)) * 100) 
      : 0;
    
    // Calculate average workload
    const averageWorkload = activeDoctors > 0 
      ? Math.round((totalShifts + referralDuties) / activeDoctors) 
      : 0;

    return {
      // Summary statistics for dashboard
      totalShifts: totalShifts,
      activeDoctors: activeDoctors,
      referralDuties: referralDuties,
      coverageRate: coverageRate,
      referralPercentage: referralPercentage,
      averageWorkload: averageWorkload,
      
      // Detailed doctor analytics
      doctorAnalysis: doctorAnalytics,
      
      // Monthly roster data
      monthlyRoster: monthlyRoster
    };
  }

  static getUpcomingDuties() {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return this.roster.filter(entry => {
      const dutyDateTime = this.getDutyDateTime(entry);
      return dutyDateTime <= twoHoursFromNow && dutyDateTime > now;
    });
  }

  static getDutyDateTime(rosterEntry) {
    const dutyDate = new Date(rosterEntry.date);
    
    // Set time based on shift
    switch (rosterEntry.shift) {
      case 'morning':
        dutyDate.setHours(6, 0, 0, 0); // 6:00 AM
        break;
      case 'evening':
        dutyDate.setHours(14, 0, 0, 0); // 2:00 PM
        break;
      case 'night':
        dutyDate.setHours(22, 0, 0, 0); // 10:00 PM
        break;
      default:
        dutyDate.setHours(6, 0, 0, 0); // Default to morning
    }
    
    return dutyDate;
  }

  // Get specialists available today (24-hour on-call specialists, not ER doctors)
  static getSpecialistsToday() {
    const SpecialistOnCall = require('./SpecialistOnCall');
    return SpecialistOnCall.getTodayOnCall();
  }
}

module.exports = Roster;