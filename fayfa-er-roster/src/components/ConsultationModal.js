import React, { useState, useEffect } from 'react';
import './ConsultationModal.css';

const ConsultationModal = ({ isOpen, onClose, doctors, consultations, onAddConsultation, onUpdateConsultation }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [showNewConsultForm, setShowNewConsultForm] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    patientId: '',
    erDoctorId: '',
    specialty: '',
    urgency: 'routine',
    notes: ''
  });

  const specialties = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Surgery', 'Psychiatry', 
    'Radiology', 'Pathology', 'Anesthesiology', 'Dermatology', 'Ophthalmology'
  ];

  const urgencyLevels = [
    { value: 'routine', label: 'Routine', color: '#10b981' },
    { value: 'urgent', label: 'Urgent', color: '#f59e0b' },
    { value: 'emergency', label: 'Emergency', color: '#ef4444' }
  ];

  const statusColors = {
    pending: '#f59e0b',
    accepted: '#3b82f6',
    completed: '#10b981',
    declined: '#ef4444'
  };

  const handleSubmitConsultation = (e) => {
    e.preventDefault();
    onAddConsultation({
      ...newConsultation,
      erDoctorId: parseInt(newConsultation.erDoctorId),
      requestTime: new Date().toISOString()
    });
    setNewConsultation({
      patientId: '',
      erDoctorId: '',
      specialty: '',
      urgency: 'routine',
      notes: ''
    });
    setShowNewConsultForm(false);
  };

  const handleUpdateStatus = (consultationId, newStatus) => {
    onUpdateConsultation(consultationId, { 
      status: newStatus,
      responseTime: newStatus !== 'pending' ? new Date().toISOString() : null
    });
  };

  const getERDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredConsultations = () => {
    switch (activeTab) {
      case 'active':
        return consultations.filter(c => ['pending', 'accepted'].includes(c.status));
      case 'completed':
        return consultations.filter(c => c.status === 'completed');
      case 'all':
        return consultations;
      default:
        return consultations;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="consultation-modal glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <div>
              <h2>Consultation Management</h2>
              <p>Track specialist responses and manage consultation requests</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="consultation-tabs">
            <button 
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <i className="fas fa-clock"></i>
              Active ({consultations.filter(c => ['pending', 'accepted'].includes(c.status)).length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <i className="fas fa-check-circle"></i>
              Completed ({consultations.filter(c => c.status === 'completed').length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <i className="fas fa-list"></i>
              All ({consultations.length})
            </button>
          </div>

          <div className="consultation-actions">
            <button 
              className="add-consultation-btn"
              onClick={() => setShowNewConsultForm(!showNewConsultForm)}
            >
              <i className="fas fa-plus"></i>
              New Consultation
            </button>
          </div>

          {showNewConsultForm && (
            <div className="new-consultation-form glass-card">
              <h3>Request New Consultation</h3>
              <form onSubmit={handleSubmitConsultation}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient ID</label>
                    <input
                      type="text"
                      value={newConsultation.patientId}
                      onChange={(e) => setNewConsultation({...newConsultation, patientId: e.target.value})}
                      placeholder="Enter patient ID"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ER Doctor</label>
                    <select
                      value={newConsultation.erDoctorId}
                      onChange={(e) => setNewConsultation({...newConsultation, erDoctorId: e.target.value})}
                      required
                    >
                      <option value="">Select ER Doctor</option>
                      {doctors.filter(d => d.category === 'ER').map(doctor => (
                        <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Specialty</label>
                    <select
                      value={newConsultation.specialty}
                      onChange={(e) => setNewConsultation({...newConsultation, specialty: e.target.value})}
                      required
                    >
                      <option value="">Select Specialty</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency</label>
                    <select
                      value={newConsultation.urgency}
                      onChange={(e) => setNewConsultation({...newConsultation, urgency: e.target.value})}
                    >
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Clinical Notes</label>
                  <textarea
                    value={newConsultation.notes}
                    onChange={(e) => setNewConsultation({...newConsultation, notes: e.target.value})}
                    placeholder="Enter clinical details and reason for consultation"
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-paper-plane"></i>
                    Send Consultation Request
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowNewConsultForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="consultations-list">
            {getFilteredConsultations().map(consultation => (
              <div key={consultation.id} className="consultation-item glass-card">
                <div className="consultation-header">
                  <div className="consultation-info">
                    <div className="patient-id">Patient: {consultation.patientId}</div>
                    <div className="specialty-badge" style={{backgroundColor: statusColors[consultation.status]}}>
                      {consultation.specialty}
                    </div>
                    <div className={`urgency-badge urgency-${consultation.urgency}`}>
                      {consultation.urgency.toUpperCase()}
                    </div>
                  </div>
                  <div className="consultation-status">
                    <span className={`status-badge status-${consultation.status}`}>
                      {consultation.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="consultation-details">
                  <div className="detail-row">
                    <span className="label">ER Doctor:</span>
                    <span className="value">{getERDoctorName(consultation.erDoctorId)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Requested:</span>
                    <span className="value">{formatTime(consultation.requestTime)}</span>
                  </div>
                  {consultation.responseTime && (
                    <div className="detail-row">
                      <span className="label">Response:</span>
                      <span className="value">{formatTime(consultation.responseTime)}</span>
                    </div>
                  )}
                  {consultation.notes && (
                    <div className="detail-row">
                      <span className="label">Notes:</span>
                      <span className="value">{consultation.notes}</span>
                    </div>
                  )}
                </div>
                {consultation.status === 'pending' && (
                  <div className="consultation-actions">
                    <button 
                      className="action-btn accept-btn"
                      onClick={() => handleUpdateStatus(consultation.id, 'accepted')}
                    >
                      <i className="fas fa-check"></i>
                      Accept
                    </button>
                    <button 
                      className="action-btn decline-btn"
                      onClick={() => handleUpdateStatus(consultation.id, 'declined')}
                    >
                      <i className="fas fa-times"></i>
                      Decline
                    </button>
                  </div>
                )}
                {consultation.status === 'accepted' && (
                  <div className="consultation-actions">
                    <button 
                      className="action-btn complete-btn"
                      onClick={() => handleUpdateStatus(consultation.id, 'completed')}
                    >
                      <i className="fas fa-check-circle"></i>
                      Mark Complete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;
