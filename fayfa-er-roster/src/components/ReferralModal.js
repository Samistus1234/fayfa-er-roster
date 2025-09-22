import React, { useState, useEffect } from 'react';
import './ReferralModal.css';

const ReferralModal = ({ isOpen, onClose, doctors, referrals, onAddReferral, onUpdateReferral }) => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [showNewReferralForm, setShowNewReferralForm] = useState(false);
  const [newReferral, setNewReferral] = useState({
    patientId: '',
    erDoctorId: '',
    referralType: 'emergency',
    destination: '',
    urgency: 'urgent',
    notes: ''
  });

  const destinations = [
    'King Faisal Specialist Hospital',
    'National Guard Hospital',
    'King Khalid University Hospital',
    'Riyadh Care Hospital',
    'King Saud Medical City',
    'Prince Sultan Military Medical City',
    'King Abdulaziz Medical City'
  ];

  const referralTypes = [
    { value: 'emergency', label: 'Emergency', color: '#ef4444', icon: 'fas fa-exclamation-triangle' },
    { value: 'life-saving', label: 'Life-Saving', color: '#dc2626', icon: 'fas fa-heartbeat' },
    { value: 'routine', label: 'Routine', color: '#10b981', icon: 'fas fa-clipboard-list' }
  ];

  const urgencyLevels = [
    { value: 'immediate', label: 'Immediate', color: '#dc2626' },
    { value: 'urgent', label: 'Urgent', color: '#f59e0b' },
    { value: 'routine', label: 'Routine', color: '#10b981' }
  ];

  const statusColors = {
    pending: '#f59e0b',
    'in-transit': '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444'
  };

  const handleSubmitReferral = (e) => {
    e.preventDefault();
    onAddReferral({
      ...newReferral,
      erDoctorId: parseInt(newReferral.erDoctorId),
      referralTime: new Date().toISOString()
    });
    setNewReferral({
      patientId: '',
      erDoctorId: '',
      referralType: 'emergency',
      destination: '',
      urgency: 'urgent',
      notes: ''
    });
    setShowNewReferralForm(false);
  };

  const handleUpdateStatus = (referralId, newStatus) => {
    onUpdateReferral(referralId, { status: newStatus });
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

  const getReferralStats = () => {
    const total = referrals.length;
    const emergency = referrals.filter(r => r.referralType === 'emergency').length;
    const lifeSaving = referrals.filter(r => r.referralType === 'life-saving').length;
    const active = referrals.filter(r => ['pending', 'in-transit'].includes(r.status)).length;
    
    const doctorBreakdown = {};
    referrals.forEach(referral => {
      const doctorName = getERDoctorName(referral.erDoctorId);
      doctorBreakdown[doctorName] = (doctorBreakdown[doctorName] || 0) + 1;
    });

    return { total, emergency, lifeSaving, active, doctorBreakdown };
  };

  const getFilteredReferrals = () => {
    switch (activeTab) {
      case 'active':
        return referrals.filter(r => ['pending', 'in-transit'].includes(r.status));
      case 'completed':
        return referrals.filter(r => r.status === 'completed');
      case 'all':
        return referrals;
      default:
        return referrals;
    }
  };

  const stats = getReferralStats();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="referral-modal glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-ambulance"></i>
            </div>
            <div>
              <h2>Referral Management</h2>
              <p>Track emergency and life-saving referrals</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="referral-tabs">
            <button 
              className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              <i className="fas fa-chart-bar"></i>
              Statistics
            </button>
            <button 
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <i className="fas fa-clock"></i>
              Active ({referrals.filter(r => ['pending', 'in-transit'].includes(r.status)).length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <i className="fas fa-check-circle"></i>
              Completed ({referrals.filter(r => r.status === 'completed').length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <i className="fas fa-list"></i>
              All ({referrals.length})
            </button>
          </div>

          {activeTab === 'statistics' && (
            <div className="referral-statistics">
              <div className="stats-grid">
                <div className="stat-card emergency-card">
                  <div className="stat-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.emergency}</div>
                    <div className="stat-label">Emergency Referrals</div>
                  </div>
                </div>
                <div className="stat-card life-saving-card">
                  <div className="stat-icon">
                    <i className="fas fa-heartbeat"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.lifeSaving}</div>
                    <div className="stat-label">Life-Saving Referrals</div>
                  </div>
                </div>
                <div className="stat-card total-card">
                  <div className="stat-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Referrals</div>
                  </div>
                </div>
              </div>

              <div className="doctor-breakdown glass-card">
                <h3>Doctor-wise Referral Breakdown</h3>
                <div className="breakdown-table">
                  <div className="table-header">
                    <div>Doctor</div>
                    <div>Total Referrals</div>
                    <div>Emergency</div>
                    <div>Life-Saving</div>
                    <div>Emergency %</div>
                    <div>Life-Saving %</div>
                  </div>
                  {Object.entries(stats.doctorBreakdown).map(([doctorName, total]) => {
                    const doctorReferrals = referrals.filter(r => getERDoctorName(r.erDoctorId) === doctorName);
                    const emergency = doctorReferrals.filter(r => r.referralType === 'emergency').length;
                    const lifeSaving = doctorReferrals.filter(r => r.referralType === 'life-saving').length;
                    const emergencyPercent = total > 0 ? Math.round((emergency / total) * 100) : 0;
                    const lifeSavingPercent = total > 0 ? Math.round((lifeSaving / total) * 100) : 0;

                    return (
                      <div key={doctorName} className="table-row">
                        <div className="doctor-name">{doctorName}</div>
                        <div className="total-referrals">{total}</div>
                        <div className="emergency-count">{emergency}</div>
                        <div className="life-saving-count">{lifeSaving}</div>
                        <div className="emergency-percent">{emergencyPercent}%</div>
                        <div className="life-saving-percent">{lifeSavingPercent}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'statistics' && (
            <>
              <div className="referral-actions">
                <button 
                  className="add-referral-btn"
                  onClick={() => setShowNewReferralForm(!showNewReferralForm)}
                >
                  <i className="fas fa-plus"></i>
                  New Referral
                </button>
              </div>

              {showNewReferralForm && (
                <div className="new-referral-form glass-card">
                  <h3>Log New Referral</h3>
                  <form onSubmit={handleSubmitReferral}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Patient ID</label>
                        <input
                          type="text"
                          value={newReferral.patientId}
                          onChange={(e) => setNewReferral({...newReferral, patientId: e.target.value})}
                          placeholder="Enter patient ID"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>ER Doctor</label>
                        <select
                          value={newReferral.erDoctorId}
                          onChange={(e) => setNewReferral({...newReferral, erDoctorId: e.target.value})}
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
                        <label>Referral Type</label>
                        <select
                          value={newReferral.referralType}
                          onChange={(e) => setNewReferral({...newReferral, referralType: e.target.value})}
                        >
                          {referralTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Urgency</label>
                        <select
                          value={newReferral.urgency}
                          onChange={(e) => setNewReferral({...newReferral, urgency: e.target.value})}
                        >
                          {urgencyLevels.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Destination Hospital</label>
                      <select
                        value={newReferral.destination}
                        onChange={(e) => setNewReferral({...newReferral, destination: e.target.value})}
                        required
                      >
                        <option value="">Select Destination</option>
                        {destinations.map(destination => (
                          <option key={destination} value={destination}>{destination}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Clinical Notes</label>
                      <textarea
                        value={newReferral.notes}
                        onChange={(e) => setNewReferral({...newReferral, notes: e.target.value})}
                        placeholder="Enter clinical details and reason for referral"
                        rows="3"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        <i className="fas fa-ambulance"></i>
                        Log Referral
                      </button>
                      <button type="button" className="cancel-btn" onClick={() => setShowNewReferralForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="referrals-list">
                {getFilteredReferrals().map(referral => (
                  <div key={referral.id} className="referral-item glass-card">
                    <div className="referral-header">
                      <div className="referral-info">
                        <div className="patient-id">Patient: {referral.patientId}</div>
                        <div className="type-badge" style={{backgroundColor: referralTypes.find(t => t.value === referral.referralType)?.color}}>
                          <i className={referralTypes.find(t => t.value === referral.referralType)?.icon}></i>
                          {referralTypes.find(t => t.value === referral.referralType)?.label}
                        </div>
                        <div className={`urgency-badge urgency-${referral.urgency}`}>
                          {referral.urgency.toUpperCase()}
                        </div>
                      </div>
                      <div className="referral-status">
                        <span className={`status-badge status-${referral.status}`}>
                          {referral.status.toUpperCase().replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="referral-details">
                      <div className="detail-row">
                        <span className="label">ER Doctor:</span>
                        <span className="value">{getERDoctorName(referral.erDoctorId)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Destination:</span>
                        <span className="value">{referral.destination}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Referral Time:</span>
                        <span className="value">{formatTime(referral.referralTime)}</span>
                      </div>
                      {referral.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span className="value">{referral.notes}</span>
                        </div>
                      )}
                      {referral.outcome && (
                        <div className="detail-row">
                          <span className="label">Outcome:</span>
                          <span className="value">{referral.outcome}</span>
                        </div>
                      )}
                    </div>
                    {['pending', 'in-transit'].includes(referral.status) && (
                      <div className="referral-actions">
                        {referral.status === 'pending' && (
                          <button 
                            className="action-btn transit-btn"
                            onClick={() => handleUpdateStatus(referral.id, 'in-transit')}
                          >
                            <i className="fas fa-truck"></i>
                            Mark In Transit
                          </button>
                        )}
                        {referral.status === 'in-transit' && (
                          <button 
                            className="action-btn complete-btn"
                            onClick={() => handleUpdateStatus(referral.id, 'completed')}
                          >
                            <i className="fas fa-check-circle"></i>
                            Mark Complete
                          </button>
                        )}
                        <button 
                          className="action-btn cancel-btn"
                          onClick={() => handleUpdateStatus(referral.id, 'cancelled')}
                        >
                          <i className="fas fa-times"></i>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
