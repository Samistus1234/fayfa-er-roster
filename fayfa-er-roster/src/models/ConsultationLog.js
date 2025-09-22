class ConsultationLog {
  constructor(id, date, shift, erDoctorId, timeCalled, specialistId, specialty, arrivalTime, responseTime, patientId, outcome, urgent = false) {
    this.id = id;
    this.date = date;
    this.shift = shift;
    this.erDoctorId = erDoctorId;
    this.timeCalled = timeCalled;
    this.specialistId = specialistId;
    this.specialty = specialty;
    this.arrivalTime = arrivalTime;
    this.responseTime = responseTime;
    this.patientId = patientId;
    this.outcome = outcome;
    this.urgent = urgent;
    this.createdAt = new Date();
  }

  static consultationLogs = [
    new ConsultationLog(1, '2025-07-01', 'morning', 1, '08:30', 'fathi', 'Internal Medicine', '09:15', '45 min', 'P001', 'admitted', false),
    new ConsultationLog(2, '2025-07-01', 'evening', 2, '15:45', 'joseph', 'Orthopedics', '16:20', '35 min', 'P002', 'admitted', true),
    new ConsultationLog(3, '2025-07-01', 'night', 3, '23:15', 'mahasen', 'ENT', '', '', 'P003', 'patient_referred', false),
    new ConsultationLog(4, '2025-07-02', 'morning', 1, '09:00', 'mammoun', 'General Surgery', '09:30', '30 min', 'P004', 'admitted', true),
    new ConsultationLog(5, '2025-07-02', 'evening', 4, '16:30', 'yanelis', 'Ophthalmology', '', '', 'P005', 'dama', false)
  ];

  static getAll() {
    return this.consultationLogs;
  }

  static findById(id) {
    return this.consultationLogs.find(log => log.id === parseInt(id));
  }

  static getByDate(date) {
    return this.consultationLogs.filter(log => log.date === date);
  }

  static getByShift(shift) {
    return this.consultationLogs.filter(log => log.shift === shift);
  }

  static getByERDoctor(erDoctorId) {
    return this.consultationLogs.filter(log => log.erDoctorId === parseInt(erDoctorId));
  }

  static getBySpecialist(specialistId) {
    return this.consultationLogs.filter(log => log.specialistId === specialistId);
  }

  static getByOutcome(outcome) {
    return this.consultationLogs.filter(log => log.outcome === outcome);
  }

  static getUrgentLogs() {
    return this.consultationLogs.filter(log => log.urgent === true);
  }

  static getDateRange(startDate, endDate) {
    return this.consultationLogs.filter(log => {
      const logDate = new Date(log.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return logDate >= start && logDate <= end;
    });
  }

  static add(logData) {
    const newId = Math.max(...this.consultationLogs.map(l => l.id)) + 1;
    const log = new ConsultationLog(
      newId,
      logData.date,
      logData.shift,
      parseInt(logData.erDoctorId),
      logData.timeCalled,
      logData.specialistId,
      logData.specialty,
      logData.arrivalTime || '',
      logData.responseTime || '',
      logData.patientId,
      logData.outcome,
      logData.urgent || false
    );
    this.consultationLogs.push(log);
    return log;
  }

  static update(id, updates) {
    const logIndex = this.consultationLogs.findIndex(log => log.id === parseInt(id));
    if (logIndex !== -1) {
      this.consultationLogs[logIndex] = { ...this.consultationLogs[logIndex], ...updates };
      return this.consultationLogs[logIndex];
    }
    return null;
  }

  static delete(id) {
    const logIndex = this.consultationLogs.findIndex(log => log.id === parseInt(id));
    if (logIndex !== -1) {
      return this.consultationLogs.splice(logIndex, 1)[0];
    }
    return null;
  }

  static getStatistics() {
    const total = this.consultationLogs.length;
    const admitted = this.consultationLogs.filter(l => l.outcome === 'admitted').length;
    const urgent = this.consultationLogs.filter(l => l.urgent === true).length;
    const dama = this.consultationLogs.filter(l => l.outcome === 'dama' || l.outcome === 'discharged_ama').length;
    
    const shiftBreakdown = {
      morning: this.consultationLogs.filter(l => l.shift === 'morning').length,
      evening: this.consultationLogs.filter(l => l.shift === 'evening').length,
      night: this.consultationLogs.filter(l => l.shift === 'night').length
    };

    const specialtyBreakdown = {};
    this.consultationLogs.forEach(log => {
      specialtyBreakdown[log.specialty] = (specialtyBreakdown[log.specialty] || 0) + 1;
    });

    const doctorBreakdown = {};
    this.consultationLogs.forEach(log => {
      doctorBreakdown[log.erDoctorId] = (doctorBreakdown[log.erDoctorId] || 0) + 1;
    });

    return {
      total,
      admitted,
      urgent,
      dama,
      admissionRate: total > 0 ? Math.round((admitted / total) * 100) : 0,
      urgentRate: total > 0 ? Math.round((urgent / total) * 100) : 0,
      shiftBreakdown,
      specialtyBreakdown,
      doctorBreakdown,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  static calculateAverageResponseTime() {
    const logsWithResponseTime = this.consultationLogs.filter(l => l.responseTime && l.responseTime !== '');
    if (logsWithResponseTime.length === 0) return 0;

    const totalMinutes = logsWithResponseTime.reduce((sum, log) => {
      const minutes = parseInt(log.responseTime.replace(' min', ''));
      return sum + (isNaN(minutes) ? 0 : minutes);
    }, 0);

    return Math.round(totalMinutes / logsWithResponseTime.length);
  }

  static exportToCSV() {
    const headers = [
      'ID', 'Date', 'Shift', 'ER Doctor ID', 'Time Called', 'Specialist ID', 
      'Specialty', 'Arrival Time', 'Response Time', 'Patient ID', 'Outcome', 'Urgent'
    ];
    
    const csvContent = [
      headers.join(','),
      ...this.consultationLogs.map(log => [
        log.id,
        log.date,
        log.shift,
        log.erDoctorId,
        log.timeCalled,
        log.specialistId,
        log.specialty,
        log.arrivalTime,
        log.responseTime,
        log.patientId,
        log.outcome,
        log.urgent
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  static exportToPDF() {
    // This would typically use a PDF library like jsPDF
    // For now, return structured data that can be used by the frontend
    return {
      title: 'Consultation Log Report',
      generatedAt: new Date().toISOString(),
      data: this.consultationLogs,
      statistics: this.getStatistics()
    };
  }

  static searchLogs(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.consultationLogs.filter(log => 
      log.patientId.toLowerCase().includes(term) ||
      log.specialty.toLowerCase().includes(term) ||
      log.outcome.toLowerCase().includes(term) ||
      log.date.includes(term)
    );
  }

  static getRecentLogs(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.consultationLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= cutoffDate;
    });
  }

  static getLogsBySpecialtyAndDate(specialty, date) {
    return this.consultationLogs.filter(log => 
      log.specialty === specialty && log.date === date
    );
  }

  static calculateResponseTimeStats() {
    const logsWithResponseTime = this.consultationLogs.filter(l => 
      l.responseTime && l.responseTime !== '' && l.responseTime !== '--'
    );

    if (logsWithResponseTime.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0 };
    }

    const responseTimes = logsWithResponseTime.map(log => {
      const minutes = parseInt(log.responseTime.replace(' min', ''));
      return isNaN(minutes) ? 0 : minutes;
    }).sort((a, b) => a - b);

    const min = responseTimes[0];
    const max = responseTimes[responseTimes.length - 1];
    const average = Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length);
    const median = responseTimes.length % 2 === 0
      ? Math.round((responseTimes[responseTimes.length / 2 - 1] + responseTimes[responseTimes.length / 2]) / 2)
      : responseTimes[Math.floor(responseTimes.length / 2)];

    return { min, max, average, median };
  }
}

module.exports = ConsultationLog;
