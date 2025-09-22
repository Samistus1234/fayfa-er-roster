// Model for tracking specialist on-call schedules
class SpecialistOnCall {
  constructor(id, specialistId, startDate, department) {
    this.id = id;
    this.specialistId = specialistId;
    this.startDate = startDate; // Date when on-call starts (8 AM)
    this.department = department;
    this.createdAt = new Date();
  }
}

// In-memory storage for on-call schedules
const onCallData = [
  // June 28th on-call specialists (still on duty until June 29 8AM)
  new SpecialistOnCall(1, 2, '2025-06-28', 'General Surgery'), // Dr. Mammoun
  new SpecialistOnCall(2, 4, '2025-06-28', 'Internal Medicine'), // Dr. Fathi
  new SpecialistOnCall(3, 6, '2025-06-28', 'ENT'), // Dr. Mahasen
  new SpecialistOnCall(4, 8, '2025-06-28', 'Obstetrics & Gynaecology'), // Dr. Frazana
  // June 29th on-call specialists (will be on duty from June 29 8AM)
  new SpecialistOnCall(5, 1, '2025-06-29', 'General Surgery'), // Dr. Renaldo
  new SpecialistOnCall(6, 3, '2025-06-29', 'Pediatrics'), // Dr. Mahmoud Badawy
  new SpecialistOnCall(7, 5, '2025-06-29', 'Ophthalmology'), // Dr. Yanelis
  new SpecialistOnCall(8, 10, '2025-06-29', 'Nephrology'), // Dr. Abdulraouf
];

// Static methods
SpecialistOnCall.getAll = () => [...onCallData];

SpecialistOnCall.findById = (id) => onCallData.find(schedule => schedule.id === parseInt(id));

// Get specialists on call for a specific date
// Note: On-call period is from 8 AM on startDate to 8 AM next day
SpecialistOnCall.getByDate = (date) => {
  const checkDate = new Date(date);
  const checkHour = checkDate.getHours();
  
  // If it's before 8 AM, we need to check the previous day's on-call
  if (checkHour < 8) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  const dateStr = checkDate.toISOString().split('T')[0];
  return onCallData.filter(schedule => schedule.startDate === dateStr);
};

// Get today's on-call specialists
SpecialistOnCall.getTodayOnCall = () => {
  const Specialist = require('./Specialist');
  const now = new Date();
  const currentHour = now.getHours();
  
  // Determine which on-call period we're in
  let checkDate = new Date(now);
  if (currentHour < 8) {
    // Before 8 AM, still in yesterday's on-call period
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  const dateStr = checkDate.toISOString().split('T')[0];
  const todaySchedules = onCallData.filter(schedule => schedule.startDate === dateStr);
  
  // Get specialist details for each on-call schedule
  const specialistsOnCall = todaySchedules.map(schedule => {
    const specialist = Specialist.findById(schedule.specialistId);
    if (specialist) {
      return {
        ...specialist,
        onCallSince: `${schedule.startDate} 8:00 AM`,
        onCallUntil: `${getNextDay(schedule.startDate)} 8:00 AM`
      };
    }
    return null;
  }).filter(s => s !== null);
  
  // Group by department
  const byDepartment = {};
  specialistsOnCall.forEach(specialist => {
    if (!byDepartment[specialist.department]) {
      byDepartment[specialist.department] = [];
    }
    byDepartment[specialist.department].push(specialist);
  });
  
  return {
    date: dateStr,
    onCallPeriod: `${dateStr} 8:00 AM - ${getNextDay(dateStr)} 8:00 AM`,
    totalOnCall: specialistsOnCall.length,
    specialists: specialistsOnCall,
    byDepartment: byDepartment
  };
};

// Add new on-call schedule
SpecialistOnCall.add = (scheduleData) => {
  const newId = Math.max(...onCallData.map(s => s.id), 0) + 1;
  const newSchedule = new SpecialistOnCall(
    newId,
    scheduleData.specialistId,
    scheduleData.startDate,
    scheduleData.department
  );
  onCallData.push(newSchedule);
  return newSchedule;
};

// Update on-call schedule
SpecialistOnCall.update = (id, updates) => {
  const index = onCallData.findIndex(s => s.id === parseInt(id));
  if (index !== -1) {
    onCallData[index] = { ...onCallData[index], ...updates };
    return onCallData[index];
  }
  return null;
};

// Delete on-call schedule
SpecialistOnCall.delete = (id) => {
  const index = onCallData.findIndex(s => s.id === parseInt(id));
  if (index !== -1) {
    const deleted = onCallData.splice(index, 1);
    return deleted[0];
  }
  return null;
};

// Helper function to get next day
function getNextDay(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

module.exports = SpecialistOnCall;