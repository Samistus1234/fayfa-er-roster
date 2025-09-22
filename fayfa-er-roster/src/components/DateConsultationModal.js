import React, { useState, useEffect } from 'react';
import './DateConsultationModal.css';

const DateConsultationModal = ({ isOpen, onClose, selectedDate, consultationLogs, doctors }) => {
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const shifts = [
    { value: 'all', label: 'All Shifts' },
    { value: 'morning', label: 'Morning' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' }
  ];

  const outcomes = [
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'admitted', label: 'Admitted' },
    { value: 'dama', label: 'Patient Discharged' },
    { value: 'patient_referred', label: 'Patient Referred' },
    { value: 'completed', label: 'Completed' },
    { value: 'declined', label: 'Declined' }
  ];

  const specialistsList = [
    { id: 'fathi', name: 'Dr. Fathi', specialty: 'Internal Medicine' },
    { id: 'joseph', name: 'Dr. Joseph', specialty: 'Orthopedics' },
    { id: 'mahasen', name: 'Dr. Mahasen', specialty: 'ENT' },
    { id: 'mammoun', name: 'Dr. Mammoun', specialty: 'General Surgery' },
    { id: 'yanelis', name: 'Dr. Yanelis', specialty: 'Ophthalmology' },
    { id: 'specialist1', name: 'Dr. Sarah Al-Rashid', specialty: 'Surgery' },
    { id: 'specialist2', name: 'Dr. Omar Hassan', specialty: 'Psychiatry' },
    { id: 'specialist3', name: 'Dr. Fatima Al-Zahra', specialty: 'Radiology' },
    { id: 'specialist4', name: 'Dr. Khalid Mansour', specialty: 'Anesthesiology' }
  ];

  // Get unique specialties from the logs
  const uniqueSpecialties = [...new Set(consultationLogs.map(log => log.specialty))];

  useEffect(() => {
    if (consultationLogs && selectedDate) {
      let filtered = consultationLogs.filter(log => log.date === selectedDate);

      // Apply filters
      if (shiftFilter !== 'all') {
        filtered = filtered.filter(log => log.shift === shiftFilter);
      }

      if (specialtyFilter !== 'all') {
        filtered = filtered.filter(log => log.specialty === specialtyFilter);
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(log =>
          log.patientId.toLowerCase().includes(term) ||
          log.specialty.toLowerCase().includes(term) ||
          log.outcome.toLowerCase().includes(term) ||
          getERDoctorName(log.erDoctorId).toLowerCase().includes(term) ||
          getSpecialistName(log.specialistId).toLowerCase().includes(term)
        );
      }

      setFilteredLogs(filtered);
    }
  }, [consultationLogs, selectedDate, shiftFilter, specialtyFilter, searchTerm]);

  const getERDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const getSpecialistName = (specialistId) => {
    const specialist = specialistsList.find(s => s.id === specialistId);
    return specialist ? specialist.name : 'Unknown Specialist';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShiftLabel = (shift) => {
    const shiftObj = shifts.find(s => s.value === shift);
    return shiftObj ? shiftObj.label : shift;
  };

  const getOutcomeLabel = (outcome) => {
    const outcomeObj = outcomes.find(o => o.value === outcome);
    return outcomeObj ? outcomeObj.label : outcome;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setShiftFilter('all');
    setSpecialtyFilter('all');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="date-consultation-modal glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-calendar-day"></i>
            </div>
            <div>
              <h2>CONSULTATION LOGS</h2>
              <p>{selectedDate ? formatDate(selectedDate) : 'Select a date'}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Filter Controls */}
          <div className="filter-controls glass-card">
            <div className="filter-row">
              <div className="filter-group">
                <label>Search</label>
                <div className="search-input-container">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search by patient, doctor, specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Shift</label>
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="filter-select"
                >
                  {shifts.map(shift => (
                    <option key={shift.value} value={shift.value}>{shift.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Specialty</label>
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Specialties</option>
                  {uniqueSpecialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <button className="clear-filters-btn" onClick={clearFilters}>
                <i className="fas fa-times"></i>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="day-summary glass-card">
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{filteredLogs.length}</div>
                <div className="stat-label">Total Consultations</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{filteredLogs.filter(log => log.urgent).length}</div>
                <div className="stat-label">Urgent Cases</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{filteredLogs.filter(log => log.outcome === 'admitted').length}</div>
                <div className="stat-label">Admissions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{[...new Set(filteredLogs.map(log => log.specialty))].length}</div>
                <div className="stat-label">Specialties Involved</div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          {filteredLogs.length > 0 ? (
            <div className="consultation-table-container">
              <div className="table-header">
                <div>Time</div>
                <div>Shift</div>
                <div>ER Doctor</div>
                <div>Specialist</div>
                <div>Specialty</div>
                <div>Response Time</div>
                <div>Patient ID</div>
                <div>Outcome</div>
                <div>Priority</div>
              </div>

              <div className="table-body">
                {filteredLogs.map(log => (
                  <div key={log.id} className={`table-row ${log.urgent ? 'urgent-row' : ''}`}>
                    <div className="time-cell">
                      <div className="call-time">{log.timeCalled}</div>
                      {log.arrivalTime && (
                        <div className="arrival-time">→ {log.arrivalTime}</div>
                      )}
                    </div>
                    <div>
                      <span className={`shift-badge shift-${log.shift}`}>
                        {getShiftLabel(log.shift)}
                      </span>
                    </div>
                    <div className="doctor-cell">
                      <div className="doctor-name">{getERDoctorName(log.erDoctorId)}</div>
                    </div>
                    <div className="specialist-cell">
                      <div className="specialist-name">{getSpecialistName(log.specialistId)}</div>
                    </div>
                    <div>
                      <span className="specialty-tag">{log.specialty}</span>
                    </div>
                    <div className="response-time-cell">
                      {log.responseTime ? (
                        <span className={`response-time ${
                          parseInt(log.responseTime) > 60 ? 'slow' :
                          parseInt(log.responseTime) > 30 ? 'moderate' : 'fast'
                        }`}>
                          {log.responseTime}
                        </span>
                      ) : (
                        <span className="no-response">Pending</span>
                      )}
                    </div>
                    <div className="patient-id">{log.patientId}</div>
                    <div>
                      <span className={`outcome-badge outcome-${log.outcome}`}>
                        {getOutcomeLabel(log.outcome)}
                      </span>
                    </div>
                    <div className="priority-cell">
                      {log.urgent && <i className="fas fa-exclamation-triangle urgent-icon"></i>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-data-message glass-card">
              <div className="no-data-icon">
                <i className="fas fa-calendar-times"></i>
              </div>
              <h3>No Consultations Found</h3>
              <p>
                {selectedDate ?
                  `No consultation logs found for ${formatDate(selectedDate)} with the current filters.` :
                  'Please select a date to view consultation logs.'
                }
              </p>
              {(shiftFilter !== 'all' || specialtyFilter !== 'all' || searchTerm) && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <i className="fas fa-times"></i>
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateConsultationModal;