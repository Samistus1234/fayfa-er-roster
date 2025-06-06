const WorkloadAnalysis = require('../utils/workloadAnalysis');

const workloadController = {
  getWorkloadAnalysis: (req, res) => {
    try {
      const { year, month } = req.params;
      const analysis = WorkloadAnalysis.getWorkloadAnalysis(parseInt(year), parseInt(month));
      
      res.json({ 
        success: true, 
        data: analysis,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDoctorWorkloadDetail: (req, res) => {
    try {
      const { year, month, doctorId } = req.params;
      const fullAnalysis = WorkloadAnalysis.getWorkloadAnalysis(parseInt(year), parseInt(month));
      const doctorAnalysis = fullAnalysis.doctorAnalysis[doctorId];
      
      if (!doctorAnalysis) {
        return res.status(404).json({ 
          success: false, 
          message: 'Doctor not found or no data for this period' 
        });
      }

      res.json({ 
        success: true, 
        data: {
          doctor_analysis: doctorAnalysis,
          department_comparison: {
            department_average: fullAnalysis.departmentStats.averages,
            doctor_vs_average: {
              hours_difference: doctorAnalysis.hours.regular - fullAnalysis.departmentStats.averages.hours,
              duties_difference: doctorAnalysis.workload.total_duties - fullAnalysis.departmentStats.averages.duties
            }
          },
          ranking: fullAnalysis.workloadRanking.find(r => r.doctor.id === parseInt(doctorId))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getWorkloadSummary: (req, res) => {
    try {
      const { year, month } = req.params;
      const analysis = WorkloadAnalysis.getWorkloadAnalysis(parseInt(year), parseInt(month));
      
      // Create a simplified summary for dashboard
      const summary = {
        department_stats: analysis.departmentStats,
        balance_score: analysis.balanceScore,
        top_performers: analysis.workloadRanking.slice(0, 3),
        workload_alerts: [],
        recommendations: []
      };

      // Generate alerts for overworked doctors
      Object.values(analysis.doctorAnalysis).forEach(doc => {
        if (doc.intensity.level === 'Very High') {
          summary.workload_alerts.push({
            type: 'overwork',
            doctor: doc.doctor.name,
            message: `${doc.doctor.name} has very high workload intensity (${doc.intensity.score})`,
            priority: 'high'
          });
        }
        
        if (doc.consecutive.max_consecutive > 5) {
          summary.workload_alerts.push({
            type: 'consecutive',
            doctor: doc.doctor.name,
            message: `${doc.doctor.name} has ${doc.consecutive.max_consecutive} consecutive duty days`,
            priority: 'medium'
          });
        }

        if (doc.workload.work_percentage > 70) {
          summary.workload_alerts.push({
            type: 'high_utilization',
            doctor: doc.doctor.name,
            message: `${doc.doctor.name} is working ${doc.workload.work_percentage}% of days`,
            priority: 'medium'
          });
        }
      });

      // Generate recommendations
      if (analysis.balanceScore.score < 70) {
        summary.recommendations.push({
          type: 'balance',
          message: 'Consider redistributing duties for better workload balance',
          impact: 'high'
        });
      }

      if (summary.workload_alerts.filter(a => a.type === 'overwork').length > 0) {
        summary.recommendations.push({
          type: 'rest',
          message: 'Schedule additional rest days for overworked doctors',
          impact: 'high'
        });
      }

      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = workloadController;