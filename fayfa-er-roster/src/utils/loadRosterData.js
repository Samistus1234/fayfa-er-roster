const Roster = require('../models/Roster');

// Function to convert shift codes to our format
function convertShift(code) {
  switch(code) {
    case 'M': return 'morning';
    case 'E': return 'evening';
    case 'N': return 'night';
    case 'R': case 'R2': case 'ER': return 'morning'; // Referral duties default to morning shift
    case 'O': case 'DL': case '-----': case '------': return null; // Off days
    default: return null;
  }
}

// Function to check if it's a referral duty
function isReferralDuty(code) {
  return ['R', 'R2', 'ER'].includes(code);
}

// June 2025 roster data
const rosterData = {
  'AHMED': ['M','M','M','O','M','M','O','M','M','M','M','M','O','O','M','M','M','M','O','O','M','M','M','M','M','O','O','M','M','M'],
  'HAGAH': ['O','E','E','E','E','R2','M','E','E','E','O','O','M','DL','E','O','O','E','E','E','E','O','E','E','O','M','M','DL','E','E'],
  'SHAFI': ['E','R','O','M','-----','-----','------','------','------','E','E','E','O','M','R','E','E','O','M','M','DL','R','O','O','ER','E','E','ER','O','O'],
  'HASAN': ['O','E','E','R','R2','E','E','R','N','O','E','E','ER','N','O','O','E','ER','N','O','E','E','E','N','O','O','E','E','R','N'],
  'AKIN': ['R','N','N','O','E','E','R','N','R2','O','R','N','N','O','O','E','R','O','R','N','N','O','R','E','E','R','N','O','O','E'],
  'EBUKA': ['N','O','O','E','R','N','N','R2','E','R','O','R','E','ER','N','N','O','O','E','ER','O','N','N','O','O','E','R','N','N','O'],
  'RABAB': ['E','O','R','N','N','R2','E','E','R','N','N','O','O','E','E','R','N','N','O','O','R','E','O','R','N','N','O','O','E','R']
};

// Doctor ID mapping
const doctorMap = {
  'AHMED': 1,
  'HAGAH': 2,
  'SHAFI': 3,
  'HASAN': 4,
  'AKIN': 5,
  'EBUKA': 6,
  'RABAB': 7
};

function loadJuneRoster() {
  console.log('Loading June 2025 roster data...');
  
  // Clear existing roster entries for June 2025
  Roster.roster = Roster.roster.filter(entry => {
    const entryDate = new Date(entry.date);
    return !(entryDate.getFullYear() === 2025 && entryDate.getMonth() === 5); // June is month 5 (0-indexed)
  });

  let entryId = Math.max(...Roster.roster.map(r => r.id), 0) + 1;
  let addedEntries = 0;

  // Process each doctor's schedule
  Object.keys(rosterData).forEach(doctorName => {
    const doctorId = doctorMap[doctorName];
    const schedule = rosterData[doctorName];

    schedule.forEach((shiftCode, dayIndex) => {
      const date = new Date(2025, 5, dayIndex + 1); // June 2025, day 1-30
      const shift = convertShift(shiftCode);
      
      if (shift) { // Only add if it's a valid shift (not off day)
        const isReferral = isReferralDuty(shiftCode);
        
        const rosterEntry = {
          id: entryId++,
          doctorId: doctorId,
          shift: shift,
          date: date,
          isReferralDuty: isReferral,
          createdAt: new Date()
        };
        
        Roster.roster.push(rosterEntry);
        addedEntries++;
      }
    });
  });

  console.log(`Successfully loaded ${addedEntries} roster entries for June 2025`);
  console.log(`Total roster entries: ${Roster.roster.length}`);
}

module.exports = { loadJuneRoster };