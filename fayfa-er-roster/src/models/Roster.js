class Roster {
  constructor(id, doctorId, shift, date, isReferralDuty = false) {
    this.id = id;
    this.doctorId = doctorId;
    this.shift = shift; // 'morning', 'evening', 'night'
    this.date = new Date(date);
    this.isReferralDuty = isReferralDuty;
    this.createdAt = new Date();
  }

  static roster = [
    // June 2025 Sample Data (keeping existing for testing)
    new Roster(1, 1, 'morning', '2025-06-01'),
    new Roster(2, 1, 'morning', '2025-06-01', true), // Ahmed with referral duty
    new Roster(3, 7, 'evening', '2025-06-01'),
    new Roster(4, 6, 'night', '2025-06-01'),
    new Roster(5, 2, 'morning', '2025-06-01'),

    // July 2025 Complete Roster Data
    // July 1st (Tuesday) - Ahmed: M, Hagah: E, Hasan: O, Hiba: (vacation), Akin: N, Ebuka: O, Rabab: ER, Shafi: (empty)
    new Roster(100, 1, 'morning', '2025-07-01'),
    new Roster(101, 2, 'evening', '2025-07-01'),
    new Roster(102, 5, 'night', '2025-07-01'),
    new Roster(103, 7, 'evening', '2025-07-01', true), // Rabab with referral duty

    // July 2nd (Wednesday) - Ahmed: M, Hagah: O, Hasan: E, Hiba: (vacation), Akin: N, Ebuka: O, Rabab: E, Shafi: (empty)
    new Roster(104, 1, 'morning', '2025-07-02'),
    new Roster(105, 4, 'evening', '2025-07-02'),
    new Roster(106, 5, 'night', '2025-07-02'),
    new Roster(107, 7, 'evening', '2025-07-02'),

    // July 3rd (Thursday) - Ahmed: M, Hagah: O, Hasan: E, Hiba: (vacation), Akin: O, Ebuka: N, Rabab: O, Shafi: R
    new Roster(108, 1, 'morning', '2025-07-03'),
    new Roster(109, 4, 'evening', '2025-07-03'),
    new Roster(110, 6, 'night', '2025-07-03'),
    new Roster(111, 3, 'morning', '2025-07-03', true), // Shafi with referral duty

    // July 4th (Friday) - Ahmed: O, Hagah: DL, Hasan: E, Hiba: (vacation), Akin: E, Ebuka: N, Rabab: M, Shafi: (empty)
    new Roster(112, 4, 'evening', '2025-07-04'),
    new Roster(113, 5, 'evening', '2025-07-04'),
    new Roster(114, 6, 'night', '2025-07-04'),
    new Roster(115, 7, 'morning', '2025-07-04'),

    // July 5th (Saturday) - Ahmed: O, Hagah: O, Hasan: N, Hiba: (vacation), Akin: ER, Ebuka: O, Rabab: ER, Shafi: (empty)
    new Roster(116, 4, 'night', '2025-07-05'),
    new Roster(117, 5, 'evening', '2025-07-05', true), // Akin with referral duty
    new Roster(118, 7, 'evening', '2025-07-05', true), // Rabab with referral duty

    // July 6th (Sunday) - Ahmed: M, Hagah: E, Hasan: O, Hiba: (vacation), Akin: E, Ebuka: R, Rabab: N, Shafi: (empty)
    new Roster(119, 1, 'morning', '2025-07-06'),
    new Roster(120, 2, 'evening', '2025-07-06'),
    new Roster(121, 5, 'evening', '2025-07-06'),
    new Roster(122, 6, 'night', '2025-07-06', true), // Ebuka with referral duty
    new Roster(123, 7, 'night', '2025-07-06'),

    // July 7th (Monday) - Ahmed: M, Hagah: E, Hasan: E, Hiba: (vacation), Akin: O, Ebuka: N, Rabab: N, Shafi: (empty)
    new Roster(124, 1, 'morning', '2025-07-07'),
    new Roster(125, 2, 'evening', '2025-07-07'),
    new Roster(126, 4, 'evening', '2025-07-07'),
    new Roster(127, 6, 'night', '2025-07-07'),
    new Roster(128, 7, 'night', '2025-07-07'),

    // July 8th (Tuesday) - Ahmed: M, Hagah: E, Hasan: E, Hiba: (vacation), Akin: O, Ebuka: O, Rabab: O, Shafi: R
    new Roster(129, 1, 'morning', '2025-07-08'),
    new Roster(130, 2, 'evening', '2025-07-08'),
    new Roster(131, 4, 'evening', '2025-07-08'),
    new Roster(132, 3, 'night', '2025-07-08', true), // Shafi with referral duty

    // July 9th (Wednesday) - Ahmed: M, Hagah: O, Hasan: O, Hiba: (vacation), Akin: N, Ebuka: ER, Rabab: E, Shafi: (empty)
    new Roster(133, 1, 'morning', '2025-07-09'),
    new Roster(134, 5, 'night', '2025-07-09'),
    new Roster(135, 6, 'evening', '2025-07-09', true), // Ebuka with referral duty
    new Roster(136, 7, 'evening', '2025-07-09'),

    // July 10th (Thursday) - Ahmed: M, Hagah: E, Hasan: R, Hiba: (vacation), Akin: N, Ebuka: E, Rabab: E, Shafi: (empty)
    new Roster(137, 1, 'morning', '2025-07-10'),
    new Roster(138, 2, 'evening', '2025-07-10'),
    new Roster(139, 4, 'evening', '2025-07-10', true), // Hasan with referral duty
    new Roster(140, 5, 'night', '2025-07-10'),
    new Roster(141, 6, 'evening', '2025-07-10'),
    new Roster(142, 7, 'evening', '2025-07-10'),

    // July 11th (Friday) - Ahmed: M, Hagah: O, Hasan: E, Hiba: (vacation), Akin: O, Ebuka: N, Rabab: N, Shafi: (empty)
    new Roster(143, 1, 'morning', '2025-07-11'),
    new Roster(144, 4, 'evening', '2025-07-11'),
    new Roster(145, 6, 'night', '2025-07-11'),
    new Roster(146, 7, 'night', '2025-07-11'),

    // July 12th (Saturday) - Ahmed: M, Hagah: DL, Hasan: O, Hiba: (vacation), Akin: E, Ebuka: N, Rabab: N, Shafi: (empty)
    new Roster(147, 1, 'morning', '2025-07-12'),
    new Roster(148, 5, 'evening', '2025-07-12'),
    new Roster(149, 6, 'night', '2025-07-12'),
    new Roster(150, 7, 'night', '2025-07-12'),

    // July 13th (Sunday) - Ahmed: O, Hagah: E, Hasan: M, Hiba: (vacation), Akin: ER, Ebuka: O, Rabab: O, Shafi: R
    new Roster(151, 4, 'morning', '2025-07-13'),
    new Roster(152, 2, 'evening', '2025-07-13'),
    new Roster(153, 5, 'evening', '2025-07-13', true), // Akin with referral duty
    new Roster(154, 3, 'night', '2025-07-13', true), // Shafi with referral duty

    // July 14th (Monday) - Ahmed: M, Hagah: E, Hasan: ER, Hiba: (vacation), Akin: O, Ebuka: E, Rabab: N, Shafi: (empty)
    new Roster(155, 1, 'morning', '2025-07-14'),
    new Roster(156, 2, 'evening', '2025-07-14'),
    new Roster(157, 4, 'evening', '2025-07-14', true), // Hasan with referral duty
    new Roster(158, 6, 'evening', '2025-07-14'),
    new Roster(159, 7, 'night', '2025-07-14'),

    // July 15th (Tuesday) - Ahmed: M, Hagah: E, Hasan: N, Hiba: (vacation), Akin: R, Ebuka: ER, Rabab: E, Shafi: (empty)
    new Roster(160, 1, 'morning', '2025-07-15'),
    new Roster(161, 2, 'evening', '2025-07-15'),
    new Roster(162, 4, 'night', '2025-07-15'),
    new Roster(163, 5, 'morning', '2025-07-15', true), // Akin with referral duty
    new Roster(164, 6, 'evening', '2025-07-15', true), // Ebuka with referral duty
    new Roster(165, 7, 'evening', '2025-07-15'),

    // July 16th-21st (Dr. Hiba still on vacation)
    new Roster(166, 1, 'morning', '2025-07-16'),
    new Roster(167, 5, 'night', '2025-07-16'),
    new Roster(168, 6, 'night', '2025-07-16'),
    new Roster(169, 3, 'evening', '2025-07-16', true), // Shafi with referral duty

    new Roster(170, 1, 'morning', '2025-07-17'),
    new Roster(171, 4, 'evening', '2025-07-17'),
    new Roster(172, 6, 'evening', '2025-07-17', true), // Ebuka with referral duty
    new Roster(173, 7, 'evening', '2025-07-17'),

    new Roster(174, 1, 'morning', '2025-07-18'),
    new Roster(175, 4, 'evening', '2025-07-18', true), // Hasan with referral duty
    new Roster(176, 6, 'evening', '2025-07-18'),
    new Roster(177, 7, 'night', '2025-07-18', true), // Rabab with referral duty

    new Roster(178, 1, 'morning', '2025-07-19'),
    new Roster(179, 4, 'night', '2025-07-19'),
    new Roster(180, 7, 'evening', '2025-07-19'),
    new Roster(181, 3, 'morning', '2025-07-19', true), // Shafi with referral duty

    new Roster(182, 2, 'morning', '2025-07-20'),
    new Roster(183, 5, 'evening', '2025-07-20', true), // Akin with referral duty
    new Roster(184, 6, 'evening', '2025-07-20', true), // Ebuka with referral duty
    new Roster(185, 7, 'evening', '2025-07-20'),

    new Roster(186, 2, 'evening', '2025-07-21'),
    new Roster(187, 4, 'evening', '2025-07-21'),
    new Roster(188, 5, 'evening', '2025-07-21'),
    new Roster(189, 7, 'night', '2025-07-21'),

    // July 22nd (Tuesday) - Dr. Hiba returns from vacation! - Ahmed: M, Hagah: M, Hasan: O, Hiba: R, Akin: O, Ebuka: E, Rabab: N, Shafi: (empty)
    new Roster(190, 1, 'morning', '2025-07-22'),
    new Roster(191, 2, 'morning', '2025-07-22'),
    new Roster(192, 8, 'evening', '2025-07-22', true), // Hiba with referral duty (first day back)
    new Roster(193, 6, 'evening', '2025-07-22'),
    new Roster(194, 7, 'night', '2025-07-22'),

    // July 23rd (Wednesday) - Ahmed: M, Hagah: O, Hasan: E, Hiba: E, Akin: O, Ebuka: O, Rabab: O, Shafi: R
    new Roster(195, 1, 'morning', '2025-07-23'),
    new Roster(196, 4, 'evening', '2025-07-23'),
    new Roster(197, 8, 'evening', '2025-07-23'),
    new Roster(198, 3, 'night', '2025-07-23', true), // Shafi with referral duty

    // July 24th (Thursday) - Ahmed: M, Hagah: O, Hasan: E, Hiba: O, Akin: E, Ebuka: R, Rabab: E, Shafi: (empty)
    new Roster(199, 1, 'morning', '2025-07-24'),
    new Roster(200, 4, 'evening', '2025-07-24'),
    new Roster(201, 5, 'evening', '2025-07-24'),
    new Roster(202, 6, 'evening', '2025-07-24', true), // Ebuka with referral duty
    new Roster(203, 7, 'evening', '2025-07-24'),

    // July 25th (Friday) - Ahmed: M, Hagah: DL, Hasan: N, Hiba: N, Akin: O, Ebuka: E, Rabab: O, Shafi: (empty)
    new Roster(204, 1, 'morning', '2025-07-25'),
    new Roster(205, 4, 'night', '2025-07-25'),
    new Roster(206, 8, 'night', '2025-07-25'),
    new Roster(207, 6, 'evening', '2025-07-25'),

    // July 26th (Saturday) - Ahmed: M, Hagah: M, Hasan: O, Hiba: N, Akin: O, Ebuka: O, Rabab: R, Shafi: (empty)
    new Roster(208, 1, 'morning', '2025-07-26'),
    new Roster(209, 2, 'morning', '2025-07-26'),
    new Roster(210, 8, 'night', '2025-07-26'),
    new Roster(211, 7, 'evening', '2025-07-26', true), // Rabab with referral duty

    // July 27th (Sunday) - Ahmed: O, Hagah: E, Hasan: O, Hiba: N, Akin: O, Ebuka: R, Rabab: E, Shafi: N
    new Roster(212, 2, 'evening', '2025-07-27'),
    new Roster(213, 8, 'night', '2025-07-27'),
    new Roster(214, 6, 'morning', '2025-07-27', true), // Ebuka with referral duty
    new Roster(215, 7, 'evening', '2025-07-27'),
    new Roster(216, 3, 'night', '2025-07-27'),

    // July 28th (Monday) - Ahmed: M, Hagah: M, Hasan: O, Hiba: O, Akin: O, Ebuka: O, Rabab: R, Shafi: E
    new Roster(217, 1, 'morning', '2025-07-28'),
    new Roster(218, 2, 'morning', '2025-07-28'),
    new Roster(219, 7, 'evening', '2025-07-28', true), // Rabab with referral duty
    new Roster(220, 3, 'evening', '2025-07-28'),

    // July 29th (Tuesday) - Ahmed: M, Hagah: E, Hasan: E, Hiba: O, Akin: O, Ebuka: E, Rabab: O, Shafi: N
    new Roster(221, 1, 'morning', '2025-07-29'),
    new Roster(222, 2, 'evening', '2025-07-29'),
    new Roster(223, 4, 'evening', '2025-07-29'),
    new Roster(224, 6, 'evening', '2025-07-29'),
    new Roster(225, 3, 'night', '2025-07-29'),

    // July 30th (Wednesday) - Ahmed: M, Hagah: E, Hasan: N, Hiba: O, Akin: O, Ebuka: R, Rabab: E, Shafi: N
    new Roster(226, 1, 'morning', '2025-07-30'),
    new Roster(227, 2, 'evening', '2025-07-30'),
    new Roster(228, 4, 'night', '2025-07-30'),
    new Roster(229, 6, 'evening', '2025-07-30', true), // Ebuka with referral duty
    new Roster(230, 7, 'evening', '2025-07-30'),
    new Roster(231, 3, 'night', '2025-07-30'),

    // July 31st (Thursday) - Ahmed: M, Hagah: O, Hasan: O, Hiba: O, Akin: R, Ebuka: N, Rabab: E, Shafi: (empty)
    new Roster(232, 1, 'morning', '2025-07-31'),
    new Roster(233, 5, 'evening', '2025-07-31', true), // Akin with referral duty
    new Roster(234, 6, 'night', '2025-07-31'),
    new Roster(235, 7, 'evening', '2025-07-31')
  ];

  static getAll() {
    return this.roster;
  }

  static findById(id) {
    return this.roster.find(entry => entry.id === parseInt(id));
  }

  static getByMonth(year, month) {
    return this.roster.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1;
    });
  }

  static getByDoctor(doctorId) {
    return this.roster.filter(entry => entry.doctorId === parseInt(doctorId));
  }

  static add(rosterData) {
    const newId = Math.max(...this.roster.map(r => r.id)) + 1;
    const entry = new Roster(newId, rosterData.doctorId, rosterData.shift, rosterData.date, rosterData.isReferralDuty);
    this.roster.push(entry);
    return entry;
  }

  static update(id, updates) {
    const entryIndex = this.roster.findIndex(entry => entry.id === parseInt(id));
    if (entryIndex !== -1) {
      this.roster[entryIndex] = { ...this.roster[entryIndex], ...updates };
      return this.roster[entryIndex];
    }
    return null;
  }

  static delete(id) {
    const entryIndex = this.roster.findIndex(entry => entry.id === parseInt(id));
    if (entryIndex !== -1) {
      return this.roster.splice(entryIndex, 1)[0];
    }
    return null;
  }

  static getDutyAnalytics(year, month) {
    const monthlyRoster = this.getByMonth(year, month);
    const analytics = {};

    const Doctor = require('./Doctor');
    const doctors = Doctor.getAll();

    doctors.forEach(doctor => {
      const doctorDuties = monthlyRoster.filter(entry => entry.doctorId === doctor.id);
      
      const shiftCounts = {
        morning: doctorDuties.filter(d => d.shift === 'morning' && !d.isReferralDuty).length,
        evening: doctorDuties.filter(d => d.shift === 'evening' && !d.isReferralDuty).length,
        night: doctorDuties.filter(d => d.shift === 'night' && !d.isReferralDuty).length,
        referral: doctorDuties.filter(d => d.isReferralDuty).length
      };

      const totalDuties = shiftCounts.morning + shiftCounts.evening + shiftCounts.night + shiftCounts.referral;

      analytics[doctor.id] = {
        doctor: doctor,
        counts: shiftCounts,
        total: totalDuties,
        percentages: {
          morning: totalDuties > 0 ? ((shiftCounts.morning / totalDuties) * 100).toFixed(1) : 0,
          evening: totalDuties > 0 ? ((shiftCounts.evening / totalDuties) * 100).toFixed(1) : 0,
          night: totalDuties > 0 ? ((shiftCounts.night / totalDuties) * 100).toFixed(1) : 0,
          referral: totalDuties > 0 ? ((shiftCounts.referral / totalDuties) * 100).toFixed(1) : 0
        }
      };
    });

    return analytics;
  }

  static getUpcomingDuties() {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return this.roster.filter(entry => {
      const dutyDateTime = this.getDutyDateTime(entry);
      return dutyDateTime <= twoHoursFromNow && dutyDateTime > now;
    });
  }

  static getDutyDateTime(rosterEntry) {
    const dutyDate = new Date(rosterEntry.date);

    // Set time based on shift - Updated to hospital's actual schedule
    switch (rosterEntry.shift) {
      case 'morning':
        dutyDate.setHours(7, 0, 0, 0); // 7:00 AM
        break;
      case 'evening':
        dutyDate.setHours(15, 0, 0, 0); // 3:00 PM
        break;
      case 'night':
        dutyDate.setHours(23, 0, 0, 0); // 11:00 PM
        break;
      default:
        dutyDate.setHours(7, 0, 0, 0); // Default to morning
    }

    return dutyDate;
  }
}

module.exports = Roster;