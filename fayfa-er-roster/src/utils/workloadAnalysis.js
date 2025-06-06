const Roster = require('../models/Roster');
const Doctor = require('../models/Doctor');

class WorkloadAnalysis {
  
  // Shift duration mapping (in hours)
  static SHIFT_HOURS = {
    morning: 8,   // 6AM - 2PM
    evening: 8,   // 2PM - 10PM  
    night: 8      // 10PM - 6AM
  };

  // Night shift weight (nights are more taxing)
  static NIGHT_SHIFT_WEIGHT = 1.3;
  static REFERRAL_DUTY_WEIGHT = 1.2;

  static getWorkloadAnalysis(year, month) {
    const monthlyRoster = Roster.getByMonth(year, month);
    const doctors = Doctor.getAll();
    const analysis = {};

    doctors.forEach(doctor => {
      const doctorDuties = monthlyRoster.filter(entry => entry.doctorId === doctor.id);
      analysis[doctor.id] = this.calculateDoctorWorkload(doctor, doctorDuties, year, month);
    });

    // Calculate department averages
    const departmentStats = this.calculateDepartmentStats(analysis);
    
    return {
      doctorAnalysis: analysis,
      departmentStats: departmentStats,
      workloadRanking: this.rankDoctorsByWorkload(analysis),
      balanceScore: this.calculateBalanceScore(analysis)
    };
  }

  static calculateDoctorWorkload(doctor, duties, year, month) {
    const shifts = {
      morning: duties.filter(d => d.shift === 'morning' && !d.isReferralDuty).length,
      evening: duties.filter(d => d.shift === 'evening' && !d.isReferralDuty).length,
      night: duties.filter(d => d.shift === 'night' && !d.isReferralDuty).length,
      referral: duties.filter(d => d.isReferralDuty).length
    };

    // Calculate total hours
    const regularHours = (shifts.morning + shifts.evening) * this.SHIFT_HOURS.morning + 
                        shifts.night * this.SHIFT_HOURS.night;
    
    // Calculate weighted hours (accounting for night shift difficulty)
    const weightedHours = (shifts.morning + shifts.evening) * this.SHIFT_HOURS.morning + 
                         shifts.night * this.SHIFT_HOURS.night * this.NIGHT_SHIFT_WEIGHT +
                         shifts.referral * this.SHIFT_HOURS.morning * this.REFERRAL_DUTY_WEIGHT;

    // Calculate consecutive duties
    const consecutiveAnalysis = this.analyzeConsecutiveDuties(duties);

    // Calculate workdays and off days
    const totalDays = new Date(year, month, 0).getDate(); // Days in month
    const workDays = shifts.morning + shifts.evening + shifts.night + shifts.referral;
    const offDays = totalDays - workDays;

    // Calculate weekend duties
    const weekendDuties = this.calculateWeekendDuties(duties, year, month);

    return {
      doctor: doctor,
      shifts: shifts,
      hours: {
        regular: regularHours,
        weighted: Math.round(weightedHours * 10) / 10,
        average_per_day: Math.round((regularHours / totalDays) * 10) / 10
      },
      workload: {
        total_duties: workDays,
        work_days: workDays,
        off_days: offDays,
        work_percentage: Math.round((workDays / totalDays) * 100 * 10) / 10
      },
      consecutive: consecutiveAnalysis,
      weekend: weekendDuties,
      intensity: this.calculateIntensityScore(shifts, consecutiveAnalysis)
    };
  }

  static analyzeConsecutiveDuties(duties) {
    if (duties.length === 0) return { max_consecutive: 0, total_streaks: 0, average_streak: 0 };

    // Sort duties by date
    const sortedDuties = duties.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let maxConsecutive = 0;
    let currentStreak = 1;
    let totalStreaks = 0;
    let streakLengths = [];

    for (let i = 1; i < sortedDuties.length; i++) {
      const prevDate = new Date(sortedDuties[i-1].date);
      const currDate = new Date(sortedDuties[i].date);
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
      } else {
        if (currentStreak > 1) {
          streakLengths.push(currentStreak);
          totalStreaks++;
        }
        maxConsecutive = Math.max(maxConsecutive, currentStreak);
        currentStreak = 1;
      }
    }

    // Don't forget the last streak
    if (currentStreak > 1) {
      streakLengths.push(currentStreak);
      totalStreaks++;
    }
    maxConsecutive = Math.max(maxConsecutive, currentStreak);

    const averageStreak = streakLengths.length > 0 ? 
      Math.round((streakLengths.reduce((a, b) => a + b, 0) / streakLengths.length) * 10) / 10 : 0;

    return {
      max_consecutive: maxConsecutive,
      total_streaks: totalStreaks,
      average_streak: averageStreak,
      streak_lengths: streakLengths
    };
  }

  static calculateWeekendDuties(duties, year, month) {
    let weekendCount = 0;
    let saturdayCount = 0;
    let sundayCount = 0;

    duties.forEach(duty => {
      const date = new Date(duty.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      if (dayOfWeek === 0) { // Sunday
        weekendCount++;
        sundayCount++;
      } else if (dayOfWeek === 6) { // Saturday
        weekendCount++;
        saturdayCount++;
      }
    });

    return {
      total_weekend_duties: weekendCount,
      saturday_duties: saturdayCount,
      sunday_duties: sundayCount
    };
  }

  static calculateIntensityScore(shifts, consecutiveAnalysis) {
    // Base score from shift distribution
    let baseScore = shifts.morning * 1 + shifts.evening * 1 + shifts.night * 1.3 + shifts.referral * 1.2;
    
    // Penalty for long consecutive stretches
    let consecutivePenalty = consecutiveAnalysis.max_consecutive > 3 ? 
      (consecutiveAnalysis.max_consecutive - 3) * 0.5 : 0;
    
    // Night shift intensity bonus
    let nightIntensity = shifts.night > 8 ? (shifts.night - 8) * 0.3 : 0;
    
    const totalScore = baseScore + consecutivePenalty + nightIntensity;
    
    return {
      score: Math.round(totalScore * 10) / 10,
      level: this.getIntensityLevel(totalScore),
      factors: {
        base_workload: Math.round(baseScore * 10) / 10,
        consecutive_penalty: Math.round(consecutivePenalty * 10) / 10,
        night_intensity: Math.round(nightIntensity * 10) / 10
      }
    };
  }

  static getIntensityLevel(score) {
    if (score < 20) return 'Low';
    if (score < 30) return 'Moderate';
    if (score < 40) return 'High';
    return 'Very High';
  }

  static calculateDepartmentStats(analysis) {
    const doctors = Object.values(analysis);
    const totalDoctors = doctors.length;

    if (totalDoctors === 0) return {};

    const totalHours = doctors.reduce((sum, doc) => sum + doc.hours.regular, 0);
    const totalWeightedHours = doctors.reduce((sum, doc) => sum + doc.hours.weighted, 0);
    const totalDuties = doctors.reduce((sum, doc) => sum + doc.workload.total_duties, 0);

    const avgHours = Math.round((totalHours / totalDoctors) * 10) / 10;
    const avgWeightedHours = Math.round((totalWeightedHours / totalDoctors) * 10) / 10;
    const avgDuties = Math.round((totalDuties / totalDoctors) * 10) / 10;

    // Calculate standard deviation for balance assessment
    const hourVariance = doctors.reduce((sum, doc) => 
      sum + Math.pow(doc.hours.regular - avgHours, 2), 0) / totalDoctors;
    const hourStdDev = Math.round(Math.sqrt(hourVariance) * 10) / 10;

    return {
      total_doctors: totalDoctors,
      total_hours: totalHours,
      total_weighted_hours: Math.round(totalWeightedHours * 10) / 10,
      total_duties: totalDuties,
      averages: {
        hours: avgHours,
        weighted_hours: avgWeightedHours,
        duties: avgDuties
      },
      distribution: {
        hours_std_deviation: hourStdDev,
        balance_rating: this.getBalanceRating(hourStdDev)
      }
    };
  }

  static getBalanceRating(stdDev) {
    if (stdDev < 10) return 'Excellent';
    if (stdDev < 20) return 'Good';
    if (stdDev < 30) return 'Fair';
    return 'Poor';
  }

  static rankDoctorsByWorkload(analysis) {
    return Object.values(analysis)
      .sort((a, b) => b.hours.weighted - a.hours.weighted)
      .map((doc, index) => ({
        rank: index + 1,
        doctor: doc.doctor,
        weighted_hours: doc.hours.weighted,
        intensity_level: doc.intensity.level,
        total_duties: doc.workload.total_duties
      }));
  }

  static calculateBalanceScore(analysis) {
    const doctors = Object.values(analysis);
    if (doctors.length === 0) return 0;

    const avgHours = doctors.reduce((sum, doc) => sum + doc.hours.weighted, 0) / doctors.length;
    const deviations = doctors.map(doc => Math.abs(doc.hours.weighted - avgHours));
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    
    // Balance score: 100 means perfect balance, lower means more imbalance
    const balanceScore = Math.max(0, 100 - (avgDeviation * 2));
    
    return {
      score: Math.round(balanceScore),
      rating: balanceScore > 85 ? 'Excellent' : 
              balanceScore > 70 ? 'Good' : 
              balanceScore > 50 ? 'Fair' : 'Poor',
      average_deviation: Math.round(avgDeviation * 10) / 10
    };
  }
}

module.exports = WorkloadAnalysis;