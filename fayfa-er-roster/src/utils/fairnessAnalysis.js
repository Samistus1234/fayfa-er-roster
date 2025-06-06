const Roster = require('../models/Roster');
const Doctor = require('../models/Doctor');

class FairnessAnalysis {
  
  static getFairnessMetrics(year, month) {
    const monthlyRoster = Roster.getByMonth(year, month);
    const doctors = Doctor.getAll();
    
    if (doctors.length === 0) return {};

    const doctorStats = this.calculateDoctorStats(doctors, monthlyRoster);
    const fairnessScores = this.calculateFairnessScores(doctorStats);
    const rotationAnalysis = this.analyzeShiftRotation(doctors, monthlyRoster);
    const opportunityAnalysis = this.analyzeOpportunityDistribution(doctorStats);
    const equityRecommendations = this.generateEquityRecommendations(doctorStats, fairnessScores);

    return {
      doctorStats: doctorStats,
      fairnessScores: fairnessScores,
      rotationAnalysis: rotationAnalysis,
      opportunityAnalysis: opportunityAnalysis,
      recommendations: equityRecommendations,
      overallFairnessRating: this.calculateOverallFairnessRating(fairnessScores),
      inequityAlerts: this.generateInequityAlerts(doctorStats, fairnessScores)
    };
  }

  static calculateDoctorStats(doctors, monthlyRoster) {
    const stats = {};
    const totalDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    doctors.forEach(doctor => {
      const doctorDuties = monthlyRoster.filter(entry => entry.doctorId === doctor.id);
      
      const shiftCounts = {
        morning: doctorDuties.filter(d => d.shift === 'morning' && !d.isReferralDuty).length,
        evening: doctorDuties.filter(d => d.shift === 'evening' && !d.isReferralDuty).length,
        night: doctorDuties.filter(d => d.shift === 'night' && !d.isReferralDuty).length,
        referral: doctorDuties.filter(d => d.isReferralDuty).length
      };

      const totalShifts = shiftCounts.morning + shiftCounts.evening + shiftCounts.night;
      const totalDuties = totalShifts + shiftCounts.referral;
      const totalHours = totalShifts * 8;
      
      // Weekend analysis
      const weekendDuties = doctorDuties.filter(duty => {
        const date = new Date(duty.date);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      }).length;

      // Holiday analysis (simplified - weekends for now)
      const holidayDuties = weekendDuties; // Can be expanded for actual holidays

      // Premium shift analysis (nights and referrals)
      const premiumShifts = shiftCounts.night + shiftCounts.referral;

      stats[doctor.id] = {
        doctor: doctor,
        shifts: shiftCounts,
        totals: {
          shifts: totalShifts,
          hours: totalHours,
          duties: totalDuties,
          weekend: weekendDuties,
          holiday: holidayDuties,
          premium: premiumShifts
        },
        percentages: {
          workload: Math.round((totalDuties / totalDays) * 100 * 10) / 10,
          weekend: Math.round((weekendDuties / Math.max(totalDuties, 1)) * 100 * 10) / 10,
          night: Math.round((shiftCounts.night / Math.max(totalDuties, 1)) * 100 * 10) / 10,
          referral: Math.round((shiftCounts.referral / Math.max(totalDuties, 1)) * 100 * 10) / 10,
          morning: Math.round((shiftCounts.morning / Math.max(totalDuties, 1)) * 100 * 10) / 10,
          evening: Math.round((shiftCounts.evening / Math.max(totalDuties, 1)) * 100 * 10) / 10
        }
      };
    });

    return stats;
  }

  static calculateFairnessScores(doctorStats) {
    const doctors = Object.values(doctorStats);
    const doctorCount = doctors.length;

    if (doctorCount === 0) return {};

    // Calculate department averages
    const averages = {
      shifts: doctors.reduce((sum, d) => sum + d.totals.shifts, 0) / doctorCount,
      hours: doctors.reduce((sum, d) => sum + d.totals.hours, 0) / doctorCount,
      weekend: doctors.reduce((sum, d) => sum + d.totals.weekend, 0) / doctorCount,
      night: doctors.reduce((sum, d) => sum + d.shifts.night, 0) / doctorCount,
      referral: doctors.reduce((sum, d) => sum + d.shifts.referral, 0) / doctorCount,
      premium: doctors.reduce((sum, d) => sum + d.totals.premium, 0) / doctorCount
    };

    // Calculate standard deviations
    const stdDevs = {
      shifts: this.calculateStdDev(doctors.map(d => d.totals.shifts), averages.shifts),
      hours: this.calculateStdDev(doctors.map(d => d.totals.hours), averages.hours),
      weekend: this.calculateStdDev(doctors.map(d => d.totals.weekend), averages.weekend),
      night: this.calculateStdDev(doctors.map(d => d.shifts.night), averages.night),
      referral: this.calculateStdDev(doctors.map(d => d.shifts.referral), averages.referral),
      premium: this.calculateStdDev(doctors.map(d => d.totals.premium), averages.premium)
    };

    // Calculate fairness scores for each metric (0-100, where 100 is perfectly fair)
    const fairnessScores = {
      overall: 0,
      workload: Math.max(0, 100 - (stdDevs.shifts * 5)), // Penalize high standard deviation
      weekend: Math.max(0, 100 - (stdDevs.weekend * 10)),
      night: Math.max(0, 100 - (stdDevs.night * 8)),
      referral: Math.max(0, 100 - (stdDevs.referral * 12)),
      premium: Math.max(0, 100 - (stdDevs.premium * 6))
    };

    // Calculate overall fairness score (weighted average)
    fairnessScores.overall = Math.round(
      (fairnessScores.workload * 0.3 + 
       fairnessScores.weekend * 0.2 + 
       fairnessScores.night * 0.2 + 
       fairnessScores.referral * 0.15 + 
       fairnessScores.premium * 0.15) * 10
    ) / 10;

    return {
      scores: fairnessScores,
      averages: averages,
      standardDeviations: stdDevs,
      coefficientsOfVariation: {
        shifts: stdDevs.shifts / Math.max(averages.shifts, 1),
        weekend: stdDevs.weekend / Math.max(averages.weekend, 1),
        night: stdDevs.night / Math.max(averages.night, 1),
        referral: stdDevs.referral / Math.max(averages.referral, 1)
      }
    };
  }

  static analyzeShiftRotation(doctors, monthlyRoster) {
    const rotationPatterns = {};
    
    doctors.forEach(doctor => {
      const doctorDuties = monthlyRoster
        .filter(entry => entry.doctorId === doctor.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const patterns = {
        morningToEvening: 0,
        eveningToNight: 0,
        nightToMorning: 0,
        consecutiveSameShift: 0,
        rotationScore: 0
      };

      for (let i = 1; i < doctorDuties.length; i++) {
        const prevShift = doctorDuties[i-1].shift;
        const currShift = doctorDuties[i].shift;

        if (prevShift === currShift) {
          patterns.consecutiveSameShift++;
        } else {
          if (prevShift === 'morning' && currShift === 'evening') patterns.morningToEvening++;
          if (prevShift === 'evening' && currShift === 'night') patterns.eveningToNight++;
          if (prevShift === 'night' && currShift === 'morning') patterns.nightToMorning++;
        }
      }

      // Calculate rotation score (higher = better rotation)
      const totalTransitions = doctorDuties.length - 1;
      const goodRotations = patterns.morningToEvening + patterns.eveningToNight + patterns.nightToMorning;
      patterns.rotationScore = totalTransitions > 0 ? Math.round((goodRotations / totalTransitions) * 100) : 0;

      rotationPatterns[doctor.id] = {
        doctor: doctor,
        patterns: patterns,
        rotationQuality: this.getRotationQuality(patterns.rotationScore)
      };
    });

    return rotationPatterns;
  }

  static analyzeOpportunityDistribution(doctorStats) {
    const doctors = Object.values(doctorStats);
    const opportunities = {
      premium_shifts: [],
      weekend_coverage: [],
      referral_duties: [],
      light_workload: [],
      heavy_workload: []
    };

    doctors.forEach(stats => {
      const doctor = stats.doctor;
      
      // Premium shift opportunities (night + referral)
      opportunities.premium_shifts.push({
        doctor: doctor,
        count: stats.totals.premium,
        percentage: Math.round((stats.totals.premium / Math.max(stats.totals.duties, 1)) * 100)
      });

      // Weekend coverage
      opportunities.weekend_coverage.push({
        doctor: doctor,
        count: stats.totals.weekend,
        percentage: stats.percentages.weekend
      });

      // Referral duties
      opportunities.referral_duties.push({
        doctor: doctor,
        count: stats.shifts.referral,
        percentage: stats.percentages.referral
      });

      // Workload distribution
      if (stats.totals.shifts < 12) {
        opportunities.light_workload.push({ doctor: doctor, shifts: stats.totals.shifts });
      } else if (stats.totals.shifts > 20) {
        opportunities.heavy_workload.push({ doctor: doctor, shifts: stats.totals.shifts });
      }
    });

    // Sort by count for ranking
    opportunities.premium_shifts.sort((a, b) => b.count - a.count);
    opportunities.weekend_coverage.sort((a, b) => b.count - a.count);
    opportunities.referral_duties.sort((a, b) => b.count - a.count);

    return opportunities;
  }

  static generateEquityRecommendations(doctorStats, fairnessScores) {
    const recommendations = [];
    const doctors = Object.values(doctorStats);

    // Workload imbalance recommendations
    if (fairnessScores.scores.workload < 70) {
      const highWorkload = doctors.filter(d => d.totals.shifts > fairnessScores.averages.shifts + 3);
      const lowWorkload = doctors.filter(d => d.totals.shifts < fairnessScores.averages.shifts - 3);

      if (highWorkload.length > 0 && lowWorkload.length > 0) {
        recommendations.push({
          type: 'workload_redistribution',
          priority: 'high',
          title: 'Redistribute Workload',
          description: `Transfer shifts from overworked doctors (${highWorkload.map(d => d.doctor.name).join(', ')}) to underutilized doctors (${lowWorkload.map(d => d.doctor.name).join(', ')})`,
          impact: 'Improves overall workload fairness'
        });
      }
    }

    // Night shift distribution recommendations
    if (fairnessScores.scores.night < 60) {
      const nightHeavy = doctors.filter(d => d.shifts.night > fairnessScores.averages.night + 2);
      const nightLight = doctors.filter(d => d.shifts.night < fairnessScores.averages.night - 1);

      if (nightHeavy.length > 0) {
        recommendations.push({
          type: 'night_shift_balance',
          priority: 'medium',
          title: 'Balance Night Shifts',
          description: `Redistribute night shifts more evenly. ${nightHeavy.map(d => d.doctor.name).join(', ')} have disproportionately high night duties`,
          impact: 'Reduces night shift burden inequality'
        });
      }
    }

    // Weekend duty recommendations
    if (fairnessScores.scores.weekend < 65) {
      recommendations.push({
        type: 'weekend_rotation',
        priority: 'medium',
        title: 'Improve Weekend Rotation',
        description: 'Implement a more systematic weekend duty rotation to ensure fair distribution',
        impact: 'Ensures equal weekend coverage burden'
      });
    }

    // Referral duty recommendations
    if (fairnessScores.scores.referral < 70) {
      const referralHeavy = doctors.filter(d => d.shifts.referral > fairnessScores.averages.referral + 1);
      if (referralHeavy.length > 0) {
        recommendations.push({
          type: 'referral_balance',
          priority: 'low',
          title: 'Balance Referral Duties',
          description: `Consider rotating referral responsibilities. ${referralHeavy.map(d => d.doctor.name).join(', ')} handle most referrals`,
          impact: 'Distributes specialized duties more fairly'
        });
      }
    }

    return recommendations;
  }

  static generateInequityAlerts(doctorStats, fairnessScores) {
    const alerts = [];
    const doctors = Object.values(doctorStats);

    // Critical workload imbalance
    if (fairnessScores.scores.workload < 50) {
      alerts.push({
        level: 'critical',
        type: 'workload_imbalance',
        message: 'Severe workload imbalance detected across the department',
        action: 'Immediate redistribution required'
      });
    }

    // Night shift concentration
    const maxNightShifts = Math.max(...doctors.map(d => d.shifts.night));
    const minNightShifts = Math.min(...doctors.map(d => d.shifts.night));
    if (maxNightShifts - minNightShifts > 5) {
      alerts.push({
        level: 'warning',
        type: 'night_concentration',
        message: `Night shift distribution is uneven (range: ${minNightShifts}-${maxNightShifts})`,
        action: 'Review night shift allocation policy'
      });
    }

    // Weekend burden
    const maxWeekendDuties = Math.max(...doctors.map(d => d.totals.weekend));
    if (maxWeekendDuties > 6) {
      const weekendHeavy = doctors.filter(d => d.totals.weekend === maxWeekendDuties);
      alerts.push({
        level: 'warning',
        type: 'weekend_burden',
        message: `${weekendHeavy.map(d => d.doctor.name).join(', ')} have excessive weekend duties (${maxWeekendDuties})`,
        action: 'Consider weekend duty caps'
      });
    }

    return alerts;
  }

  static calculateOverallFairnessRating(fairnessScores) {
    const score = fairnessScores.scores.overall;
    
    if (score >= 85) return { rating: 'Excellent', color: 'success', description: 'Highly equitable distribution' };
    if (score >= 70) return { rating: 'Good', color: 'info', description: 'Generally fair with minor imbalances' };
    if (score >= 55) return { rating: 'Fair', color: 'warning', description: 'Noticeable inequities that should be addressed' };
    return { rating: 'Poor', color: 'danger', description: 'Significant fairness issues requiring immediate attention' };
  }

  static calculateStdDev(values, mean) {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  static getRotationQuality(score) {
    if (score >= 75) return { quality: 'Excellent', description: 'Great shift rotation pattern' };
    if (score >= 50) return { quality: 'Good', description: 'Adequate rotation with room for improvement' };
    if (score >= 25) return { quality: 'Fair', description: 'Limited rotation, mostly consecutive same shifts' };
    return { quality: 'Poor', description: 'Poor rotation pattern, needs restructuring' };
  }
}

module.exports = FairnessAnalysis;