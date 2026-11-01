/**
 * BIT Holiday Calendar - Academic Year 2026–2027
 * Bannari Amman Institute of Technology, Sathyamangalam
 * 
 * HOW TO UPDATE FOR NEXT YEAR:
 * 1. Update ACADEMIC_YEAR (e.g., "2027-2028")
 * 2. Update START_MONTH ("2027-06") and END_MONTH ("2028-05")
 * 3. Update the CALENDAR_EVENTS array below with the new dates:
 *    - Single Public Holiday:
 *      { "type": "HOLIDAY", "name": "Holiday Name", "date": "YYYY-MM-DD" }
 *    - GP (General Permission) Leave Period:
 *      {
 *        "type": "GP",
 *        "start": "YYYY-MM-DD",
 *        "startAN": true, // true if leave starts in afternoon
 *        "end": "YYYY-MM-DD",
 *        "festival": { "name": "Festival Name", "date": "YYYY-MM-DD" }, // optional
 *        "messClosure": { "from": "YYYY-MM-DD Dinner", "to": "YYYY-MM-DD Lunch" } // optional
 *      }
 */

const BIT_CALENDAR_CONFIG = {
  collegeName: "Bannari Amman Institute of Technology",
  collegeShort: "BIT",
  academicYear: "2026–2027",
  startMonth: "2026-06", // June 2026
  endMonth: "2027-05",   // May 2027
  defaultViewDate: "2026-11-01" // November 2026 (or auto-falls to today if within range)
};

const BIT_CALENDAR_EVENTS = [
  {
    "type": "GP",
    "start": "2026-06-25",
    "startAN": true,
    "end": "2026-06-29",
    "festival": {
      "name": "Muharram",
      "date": "2026-06-26"
    }
  },
  {
    "type": "GP",
    "start": "2026-07-24",
    "startAN": true,
    "end": "2026-07-28"
  },
  {
    "type": "HOLIDAY",
    "name": "Independence Day",
    "date": "2026-08-15"
  },
  {
    "type": "GP",
    "start": "2026-08-22",
    "startAN": true,
    "end": "2026-08-26",
    "festival": {
      "name": "Milad un Nabi",
      "date": "2026-08-25"
    }
  },
  {
    "type": "HOLIDAY",
    "name": "Krishna Jayanthi",
    "date": "2026-09-04"
  },
  {
    "type": "HOLIDAY",
    "name": "Vinayakar Chathurthi",
    "date": "2026-09-14"
  },
  {
    "type": "GP",
    "start": "2026-09-24",
    "startAN": true,
    "end": "2026-09-29"
  },
  {
    "type": "HOLIDAY",
    "name": "Gandhi Jayanthi",
    "date": "2026-10-02"
  },
  {
    "type": "GP",
    "start": "2026-10-17",
    "startAN": true,
    "end": "2026-10-21",
    "festival": {
      "name": "Pooja Holidays",
      "date": "2026-10-19",
      "endDate": "2026-10-20"
    }
  },
  {
    "type": "GP",
    "start": "2026-11-06",
    "startAN": true,
    "end": "2026-11-10",
    "festival": {
      "name": "Diwali",
      "date": "2026-11-08"
    },
    "messClosure": {
      "from": "2026-11-06 Dinner",
      "to": "2026-11-10 Lunch"
    }
  },
  {
    "type": "HOLIDAY",
    "name": "Christmas",
    "date": "2026-12-25"
  },
  {
    "type": "GP",
    "start": "2026-12-31",
    "startAN": true,
    "end": "2027-01-04",
    "festival": {
      "name": "New Year",
      "date": "2027-01-01"
    },
    "messClosure": {
      "from": "2026-12-31 Dinner",
      "to": "2027-01-04 Lunch"
    }
  },
  {
    "type": "GP",
    "start": "2027-01-14",
    "startAN": true,
    "end": "2027-01-18",
    "festival": {
      "name": "Pongal Holidays"
    },
    "messClosure": {
      "from": "2027-01-14 Dinner",
      "to": "2027-01-18 Lunch"
    }
  },
  {
    "type": "HOLIDAY",
    "name": "Thai Poosam",
    "date": "2027-01-22"
  },
  {
    "type": "HOLIDAY",
    "name": "Republic Day",
    "date": "2027-01-26"
  },
  {
    "type": "GP",
    "start": "2027-02-26",
    "startAN": true,
    "end": "2027-03-02"
  },
  {
    "type": "HOLIDAY",
    "name": "Ramzan",
    "date": "2027-03-11"
  },
  {
    "type": "GP",
    "start": "2027-03-25",
    "startAN": true,
    "end": "2027-03-29",
    "festival": {
      "name": "Good Friday",
      "date": "2027-03-26"
    }
  },
  {
    "type": "HOLIDAY",
    "name": "Tamil New Year",
    "date": "2027-04-14"
  },
  {
    "type": "GP",
    "start": "2027-04-30",
    "startAN": true,
    "end": "2027-05-04",
    "festival": {
      "name": "May Day",
      "date": "2027-05-01"
    }
  },
  {
    "type": "GP",
    "start": "2027-05-27",
    "startAN": true,
    "end": "2027-05-31"
  }
];

// Expose globally for both browser scripts and modules
if (typeof window !== "undefined") {
  window.BIT_CALENDAR_CONFIG = BIT_CALENDAR_CONFIG;
  window.BIT_CALENDAR_EVENTS = BIT_CALENDAR_EVENTS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BIT_CALENDAR_CONFIG, BIT_CALENDAR_EVENTS };
}

