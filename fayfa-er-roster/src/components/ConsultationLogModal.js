import React, { useState, useEffect } from 'react';
import './ConsultationLogModal.css';
import DateConsultationModal from './DateConsultationModal';

const ConsultationLogModal = ({ isOpen, onClose, doctors, specialists, consultationLogs, onAddLog, onUpdateLog, onDeleteLog, onExportLog }) => {
  const [logs, setLogs] = useState([]);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentLog, setCurrentLog] = useState({
    id: null,
    date: new Date().toISOString().split('T')[0],
    shift: '',
    erDoctorId: '',
    timeCalled: '',
    specialistId: '',
    specialty: '',
    arrivalTime: '',
    responseTime: '',
    patientId: '',
    outcome: '',
    urgent: false
  });

  const shifts = [
    { value: 'morning', label: 'Morning (7:00 AM - 3:00 PM)' },
    { value: 'evening', label: 'Evening (3:00 PM - 11:00 PM)' },
    { value: 'night', label: 'Night (11:00 PM - 7:00 AM)' }
  ];

  const outcomes = [
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'completed', label: 'Completed' },
    { value: 'declined', label: 'Declined' }
  ];

  const specialistsList = [
    { id: 'fathi', name: 'Dr. Fathi', specialty: 'Cardiology' },
    { id: 'joseph', name: 'Dr. Joseph', specialty: 'Neurology' },
    { id: 'mahasen', name: 'Dr. Mahasen', specialty: 'Orthopedics' },
    { id: 'specialist1', name: 'Dr. Sarah Al-Rashid', specialty: 'Surgery' },
    { id: 'specialist2', name: 'Dr. Omar Hassan', specialty: 'Psychiatry' },
    { id: 'specialist3', name: 'Dr. Fatima Al-Zahra', specialty: 'Radiology' },
    { id: 'specialist4', name: 'Dr. Khalid Mansour', specialty: 'Anesthesiology' }
  ];

  useEffect(() => {
    if (consultationLogs) {
      setLogs(consultationLogs);
    }
  }, [consultationLogs]);

  useEffect(() => {
    // Auto-calculate response time when both times are available
    if (currentLog.timeCalled && currentLog.arrivalTime) {
      const responseTime = calculateResponseTime(currentLog.timeCalled, currentLog.arrivalTime);
      setCurrentLog(prev => ({ ...prev, responseTime }));
    }
  }, [currentLog.timeCalled, currentLog.arrivalTime]);

  const calculateResponseTime = (timeCalled, arrivalTime) => {
    if (!timeCalled || !arrivalTime) return '';
    
    const [calledHours, calledMinutes] = timeCalled.split(':').map(Number);
    const [arrivalHours, arrivalMinutes] = arrivalTime.split(':').map(Number);
    
    const calledTotalMinutes = calledHours * 60 + calledMinutes;
    const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes;
    
    let diffMinutes = arrivalTotalMinutes - calledTotalMinutes;
    
    // Handle next day scenario
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    return `${diffMinutes} min`;
  };

  const handleSpecialistChange = (specialistId) => {
    const specialist = specialistsList.find(s => s.id === specialistId);
    setCurrentLog(prev => ({
      ...prev,
      specialistId,
      specialty: specialist ? specialist.specialty : ''
    }));
  };

  const handleInputChange = (field, value) => {
    setCurrentLog(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    if (currentLog.id) {
      onUpdateLog(currentLog.id, currentLog);
    } else {
      const newLog = { ...currentLog, id: Date.now() };
      onAddLog(newLog);
      setLogs(prev => [...prev, newLog]);
    }
    
    clearForm();
  };

  const handleAddNewRow = () => {
    clearForm();
  };

  const handleDeleteRow = (logId) => {
    if (window.confirm('Are you sure you want to delete this consultation log entry?')) {
      onDeleteLog(logId);
      setLogs(prev => prev.filter(log => log.id !== logId));
    }
  };

  const clearForm = () => {
    setCurrentLog({
      id: null,
      date: new Date().toISOString().split('T')[0],
      shift: '',
      erDoctorId: '',
      timeCalled: '',
      specialistId: '',
      specialty: '',
      arrivalTime: '',
      responseTime: '',
      patientId: '',
      outcome: '',
      urgent: false
    });
  };

  const validateForm = () => {
    const required = ['date', 'shift', 'erDoctorId', 'timeCalled', 'specialistId', 'patientId', 'outcome'];
    for (let field of required) {
      if (!currentLog[field]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }
    return true;
  };

  const handleExport = (format) => {
    onExportLog(logs, format);
  };

  const editLog = (log) => {
    setCurrentLog(log);
  };

  const getERDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const getSpecialistName = (specialistId) => {
    const specialist = specialistsList.find(s => s.id === specialistId);
    return specialist ? specialist.name : 'Unknown Specialist';
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDateModalOpen(true);
  };

  const closeDateModal = () => {
    setDateModalOpen(false);
    setSelectedDate(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="consultation-log-modal glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div>
              <h2>CONSULTATION LOG</h2>
              <p>Track specialist responses</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn add-btn" onClick={handleAddNewRow}>
              <i className="fas fa-plus"></i>
              Add Row
            </button>
            <button className="action-btn save-btn" onClick={handleSave}>
              <i className="fas fa-save"></i>
              Save
            </button>
            <button className="action-btn clear-btn" onClick={clearForm}>
              <i className="fas fa-eraser"></i>
              Clear Form
            </button>
            <button className="action-btn export-btn" onClick={() => handleExport('csv')}>
              <i className="fas fa-file-csv"></i>
              CSV
            </button>
            <button className="action-btn export-btn" onClick={() => handleExport('pdf')}>
              <i className="fas fa-file-pdf"></i>
              PDF
            </button>
          </div>

          {/* Form Fields */}
          <div className="consultation-form glass-card">
            <div className="form-grid">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={currentLog.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Shift</label>
                <select
                  value={currentLog.shift}
                  onChange={(e) => handleInputChange('shift', e.target.value)}
                  required
                >
                  <option value="">Select Shift</option>
                  {shifts.map(shift => (
                    <option key={shift.value} value={shift.value}>{shift.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>ER Doctor</label>
                <select
                  value={currentLog.erDoctorId}
                  onChange={(e) => handleInputChange('erDoctorId', e.target.value)}
                  required
                >
                  <option value="">Select ER Doctor</option>
                  {doctors && doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Time Called</label>
                <input
                  type="time"
                  value={currentLog.timeCalled}
                  onChange={(e) => handleInputChange('timeCalled', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialist</label>
                <select
                  value={currentLog.specialistId}
                  onChange={(e) => handleSpecialistChange(e.target.value)}
                  required
                >
                  <option value="">Select Specialist</option>
                  {specialistsList.map(specialist => (
                    <option key={specialist.id} value={specialist.id}>{specialist.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Specialty</label>
                <input
                  type="text"
                  value={currentLog.specialty}
                  readOnly
                  className="readonly-field"
                  placeholder="Auto-populated"
                />
              </div>

              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="time"
                  value={currentLog.arrivalTime}
                  onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Response Time</label>
                <input
                  type="text"
                  value={currentLog.responseTime}
                  readOnly
                  className="readonly-field"
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="form-group">
                <label>Patient ID</label>
                <input
                  type="text"
                  value={currentLog.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  placeholder="Patient ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Outcome</label>
                <select
                  value={currentLog.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {outcomes.map(outcome => (
                    <option key={outcome.value} value={outcome.value}>{outcome.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentLog.urgent}
                    onChange={(e) => handleInputChange('urgent', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Urgent
                </label>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="consultation-table-container">
            <div className="table-header">
              <div>Date</div>
              <div>Shift</div>
              <div>ER Doctor</div>
              <div>Time Called</div>
              <div>Specialist</div>
              <div>Specialty</div>
              <div>Response</div>
              <div>Arrival Time</div>
              <div>Response Time</div>
              <div>Patient ID</div>
              <div>Outcome</div>
              <div>Urgent</div>
              <div>Actions</div>
            </div>
            
            <div className="table-body">
              {logs.map(log => (
                <div key={log.id} className="table-row">
                  <div className="date-cell">
                    <button
                      className="date-link"
                      onClick={() => handleDateClick(log.date)}
                      title={`View all consultations for ${log.date}`}
                    >
                      <i className="fas fa-calendar-day"></i>
                      {log.date}
                    </button>
                  </div>
                  <div>{shifts.find(s => s.value === log.shift)?.label.split(' ')[0] || log.shift}</div>
                  <div>{getERDoctorName(log.erDoctorId)}</div>
                  <div>{log.timeCalled}</div>
                  <div>{getSpecialistName(log.specialistId)}</div>
                  <div>{log.specialty}</div>
                  <div>--:--</div>
                  <div>{log.arrivalTime}</div>
                  <div>{log.responseTime}</div>
                  <div>{log.patientId}</div>
                  <div>
                    <span className={`outcome-badge outcome-${log.outcome}`}>
                      {outcomes.find(o => o.value === log.outcome)?.label || log.outcome}
                    </span>
                  </div>
                  <div>{log.urgent ? '✓' : ''}</div>
                  <div className="action-cell">
                    <button className="edit-btn" onClick={() => editLog(log)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteRow(log.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date-specific consultation modal */}
      <DateConsultationModal
        isOpen={dateModalOpen}
        onClose={closeDateModal}
        selectedDate={selectedDate}
        consultationLogs={logs}
        doctors={doctors}
      />
    </div>
  );
};

export default ConsultationLogModal;
