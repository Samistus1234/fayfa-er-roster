const FairnessAnalysis = require('../utils/fairnessAnalysis');

const fairnessController = {
  getFairnessMetrics: (req, res) => {
    try {
      const { year, month } = req.params;
      const metrics = FairnessAnalysis.getFairnessMetrics(parseInt(year), parseInt(month));
      
      res.json({ 
        success: true, 
        data: metrics,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getFairnessSummary: (req, res) => {
    try {
      const { year, month } = req.params;
      const metrics = FairnessAnalysis.getFairnessMetrics(parseInt(year), parseInt(month));
      
      // Create simplified summary for quick overview
      const summary = {
        overall_rating: metrics.overallFairnessRating,
        scores: metrics.fairnessScores?.scores || {},
        top_concerns: [],
        quick_stats: {
          total_doctors: Object.keys(metrics.doctorStats || {}).length,
          alerts_count: metrics.inequityAlerts?.length || 0,
          recommendations_count: metrics.recommendations?.length || 0
        }
      };

      // Identify top concerns
      if (metrics.fairnessScores?.scores) {
        const scores = metrics.fairnessScores.scores;
        Object.entries(scores).forEach(([metric, score]) => {
          if (metric !== 'overall' && score < 60) {
            summary.top_concerns.push({
              metric: metric,
              score: score,
              severity: score < 40 ? 'high' : score < 60 ? 'medium' : 'low'
            });
          }
        });
      }

      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDoctorEquityReport: (req, res) => {
    try {
      const { year, month, doctorId } = req.params;
      const metrics = FairnessAnalysis.getFairnessMetrics(parseInt(year), parseInt(month));
      
      const doctorStats = metrics.doctorStats?.[doctorId];
      if (!doctorStats) {
        return res.status(404).json({ 
          success: false, 
          message: 'Doctor not found or no data for this period' 
        });
      }

      // Compare with department averages
      const averages = metrics.fairnessScores?.averages || {};
      const comparison = {
        shifts: {
          doctor: doctorStats.totals.shifts,
          average: averages.shifts,
          difference: doctorStats.totals.shifts - averages.shifts,
          percentile: this.calculatePercentile(doctorStats.totals.shifts, Object.values(metrics.doctorStats).map(d => d.totals.shifts))
        },
        weekend: {
          doctor: doctorStats.totals.weekend,
          average: averages.weekend,
          difference: doctorStats.totals.weekend - averages.weekend,
          percentile: this.calculatePercentile(doctorStats.totals.weekend, Object.values(metrics.doctorStats).map(d => d.totals.weekend))
        },
        night: {
          doctor: doctorStats.shifts.night,
          average: averages.night,
          difference: doctorStats.shifts.night - averages.night,
          percentile: this.calculatePercentile(doctorStats.shifts.night, Object.values(metrics.doctorStats).map(d => d.shifts.night))
        }
      };

      res.json({ 
        success: true, 
        data: {
          doctor_stats: doctorStats,
          department_comparison: comparison,
          equity_score: this.calculateDoctorEquityScore(doctorStats, averages),
          rotation_analysis: metrics.rotationAnalysis?.[doctorId]
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  calculatePercentile: (value, allValues) => {
    const sorted = allValues.sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return Math.round((index / (sorted.length - 1)) * 100);
  },

  calculateDoctorEquityScore: (doctorStats, averages) => {
    const shiftDiff = Math.abs(doctorStats.totals.shifts - averages.shifts);
    const weekendDiff = Math.abs(doctorStats.totals.weekend - averages.weekend);
    const nightDiff = Math.abs(doctorStats.shifts.night - averages.night);
    
    // Lower differences = higher equity score
    const score = Math.max(0, 100 - (shiftDiff * 5 + weekendDiff * 10 + nightDiff * 8));
    
    return {
      score: Math.round(score),
      level: score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'
    };
  }
};

module.exports = fairnessController;