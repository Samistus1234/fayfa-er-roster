class SaudiCrescent {
  constructor(id, patientId, ambulanceUnit, receivingDoctorId, timeReceived, handoverTime, duration, additionalNotes) {
    this.id = id;
    this.patientId = patientId;
    this.ambulanceUnit = ambulanceUnit;
    this.receivingDoctorId = receivingDoctorId;
    this.timeReceived = timeReceived;
    this.handoverTime = handoverTime;
    this.duration = duration;
    this.additionalNotes = additionalNotes;
    this.createdAt = new Date();
  }

  static saudiCrescentRecords = [
    new SaudiCrescent(1, 'P001', 'SRC-101', 1, '08:15', '08:22', '7 min', 'Patient stable, minor injuries from traffic accident'),
    new SaudiCrescent(2, 'P002', 'SRC-205', 2, '09:30', '09:38', '8 min', 'Cardiac patient, transferred from home'),
    new SaudiCrescent(3, 'P003', 'SRC-312', 3, '10:45', '10:52', '7 min', 'Pediatric patient, fever and dehydration'),
    new SaudiCrescent(4, 'P004', 'SRC-108', 1, '11:20', '11:28', '8 min', 'Elderly patient, fall at home, possible fracture'),
    new SaudiCrescent(5, 'P005', 'SRC-203', 4, '12:15', '12:25', '10 min', 'Emergency surgery case, multiple trauma')
  ];

  static ambulanceUnits = [
    'SRC-101', 'SRC-102', 'SRC-103', 'SRC-104', 'SRC-105',
    'SRC-201', 'SRC-202', 'SRC-203', 'SRC-204', 'SRC-205',
    'SRC-301', 'SRC-302', 'SRC-303', 'SRC-304', 'SRC-305',
    'SRC-401', 'SRC-402', 'SRC-403', 'SRC-404', 'SRC-405'
  ];

  static getAll() {
    return this.saudiCrescentRecords;
  }

  static findById(id) {
    return this.saudiCrescentRecords.find(record => record.id === parseInt(id));
  }

  static getByPatientId(patientId) {
    return this.saudiCrescentRecords.filter(record => record.patientId === patientId);
  }

  static getByAmbulanceUnit(ambulanceUnit) {
    return this.saudiCrescentRecords.filter(record => record.ambulanceUnit === ambulanceUnit);
  }

  static getByReceivingDoctor(doctorId) {
    return this.saudiCrescentRecords.filter(record => record.receivingDoctorId === parseInt(doctorId));
  }

  static getByDateRange(startDate, endDate) {
    return this.saudiCrescentRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return recordDate >= start && recordDate <= end;
    });
  }

  static getTodaysRecords() {
    const today = new Date().toISOString().split('T')[0];
    return this.saudiCrescentRecords.filter(record => {
      const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
      return recordDate === today;
    });
  }

  static getRecentRecords(hours = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return this.saudiCrescentRecords.filter(record => {
      const recordTime = new Date(record.createdAt);
      return recordTime >= cutoffTime;
    });
  }

  static add(recordData) {
    const newId = Math.max(...this.saudiCrescentRecords.map(r => r.id)) + 1;
    const record = new SaudiCrescent(
      newId,
      recordData.patientId,
      recordData.ambulanceUnit,
      parseInt(recordData.receivingDoctorId),
      recordData.timeReceived,
      recordData.handoverTime || '',
      recordData.duration || '',
      recordData.additionalNotes || ''
    );
    this.saudiCrescentRecords.push(record);
    return record;
  }

  static update(id, updates) {
    const recordIndex = this.saudiCrescentRecords.findIndex(record => record.id === parseInt(id));
    if (recordIndex !== -1) {
      this.saudiCrescentRecords[recordIndex] = { ...this.saudiCrescentRecords[recordIndex], ...updates };
      return this.saudiCrescentRecords[recordIndex];
    }
    return null;
  }

  static delete(id) {
    const recordIndex = this.saudiCrescentRecords.findIndex(record => record.id === parseInt(id));
    if (recordIndex !== -1) {
      return this.saudiCrescentRecords.splice(recordIndex, 1)[0];
    }
    return null;
  }

  static getStatistics() {
    const total = this.saudiCrescentRecords.length;
    const todaysRecords = this.getTodaysRecords();
    const totalToday = todaysRecords.length;
    
    const ambulanceBreakdown = {};
    this.saudiCrescentRecords.forEach(record => {
      ambulanceBreakdown[record.ambulanceUnit] = (ambulanceBreakdown[record.ambulanceUnit] || 0) + 1;
    });

    const doctorBreakdown = {};
    this.saudiCrescentRecords.forEach(record => {
      doctorBreakdown[record.receivingDoctorId] = (doctorBreakdown[record.receivingDoctorId] || 0) + 1;
    });

    return {
      total,
      totalToday,
      ambulanceBreakdown,
      doctorBreakdown,
      averageHandoverTime: this.calculateAverageHandoverTime(),
      fastestHandover: this.getFastestHandover(),
      slowestHandover: this.getSlowestHandover()
    };
  }

  static calculateAverageHandoverTime() {
    const recordsWithDuration = this.saudiCrescentRecords.filter(r => r.duration && r.duration !== '');
    if (recordsWithDuration.length === 0) return 0;

    const totalMinutes = recordsWithDuration.reduce((sum, record) => {
      const minutes = parseInt(record.duration.replace(' min', ''));
      return sum + (isNaN(minutes) ? 0 : minutes);
    }, 0);

    return Math.round(totalMinutes / recordsWithDuration.length);
  }

  static getFastestHandover() {
    const recordsWithDuration = this.saudiCrescentRecords.filter(r => r.duration && r.duration !== '');
    if (recordsWithDuration.length === 0) return 0;

    const durations = recordsWithDuration.map(record => {
      const minutes = parseInt(record.duration.replace(' min', ''));
      return isNaN(minutes) ? Infinity : minutes;
    });

    return Math.min(...durations);
  }

  static getSlowestHandover() {
    const recordsWithDuration = this.saudiCrescentRecords.filter(r => r.duration && r.duration !== '');
    if (recordsWithDuration.length === 0) return 0;

    const durations = recordsWithDuration.map(record => {
      const minutes = parseInt(record.duration.replace(' min', ''));
      return isNaN(minutes) ? 0 : minutes;
    });

    return Math.max(...durations);
  }

  static exportToCSV() {
    const headers = [
      'ID', 'Patient ID', 'Ambulance Unit', 'Receiving Doctor ID', 'Time Received', 
      'Handover Time', 'Duration', 'Additional Notes', 'Created At'
    ];
    
    const csvContent = [
      headers.join(','),
      ...this.saudiCrescentRecords.map(record => [
        record.id,
        record.patientId,
        record.ambulanceUnit,
        record.receivingDoctorId,
        record.timeReceived,
        record.handoverTime,
        record.duration,
        `"${record.additionalNotes.replace(/"/g, '""')}"`,
        record.createdAt.toISOString()
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  static exportToPDF() {
    return {
      title: 'Saudi Red Crescent Patient Tracking Report',
      generatedAt: new Date().toISOString(),
      data: this.saudiCrescentRecords,
      statistics: this.getStatistics()
    };
  }

  static searchRecords(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.saudiCrescentRecords.filter(record => 
      record.patientId.toLowerCase().includes(term) ||
      record.ambulanceUnit.toLowerCase().includes(term) ||
      record.additionalNotes.toLowerCase().includes(term)
    );
  }

  static getAmbulanceUnits() {
    return this.ambulanceUnits;
  }

  static getHandoverTimeStats() {
    const recordsWithDuration = this.saudiCrescentRecords.filter(r =>
      r.duration && r.duration !== '' && r.duration !== '--'
    );

    if (recordsWithDuration.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0 };
    }

    const durations = recordsWithDuration.map(record => {
      const minutes = parseInt(record.duration.replace(' min', ''));
      return isNaN(minutes) ? 0 : minutes;
    }).sort((a, b) => a - b);

    const min = durations[0];
    const max = durations[durations.length - 1];
    const average = Math.round(durations.reduce((sum, time) => sum + time, 0) / durations.length);
    const median = durations.length % 2 === 0
      ? Math.round((durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2)
      : durations[Math.floor(durations.length / 2)];

    return { min, max, average, median };
  }

  static calculateDuration(timeReceived, handoverTime) {
    if (!timeReceived || !handoverTime) return '';

    const [receivedHours, receivedMinutes] = timeReceived.split(':').map(Number);
    const [handoverHours, handoverMinutes] = handoverTime.split(':').map(Number);

    const receivedTotalMinutes = receivedHours * 60 + receivedMinutes;
    const handoverTotalMinutes = handoverHours * 60 + handoverMinutes;

    let diffMinutes = handoverTotalMinutes - receivedTotalMinutes;

    // Handle next day scenario
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    return `${diffMinutes} min`;
  }
}

module.exports = SaudiCrescent;
