import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { toDateKey } from '../services/leavesService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function YearView({ 
  year, 
  setYear, 
  eventsLookup, 
  onSelectDate, 
  onJumpToMonth, 
  weekStartsOnMonday 
}) {
  const weekdays = weekStartsOnMonday 
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] 
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handlePrevYear = () => {
    if (year > 2026) setYear(year - 1);
  };

  const handleNextYear = () => {
    if (year < 2030) setYear(year + 1);
  };

  return (
    <div className="year-view-container">
      {/* Year Navigator Bar */}
      <div className="year-header-nav">
        <button 
          type="button" 
          className="year-nav-arrow" 
          onClick={handlePrevYear}
          disabled={year <= 2026}
          aria-label="Previous academic year"
        >
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>

        <div className="year-title-block">
          <span className="year-number tabular-nums">{year}</span>
          <span className="year-subtitle">Academic Overview (12 Months)</span>
        </div>

        <button 
          type="button" 
          className="year-nav-arrow" 
          onClick={handleNextYear}
          disabled={year >= 2030}
          aria-label="Next academic year"
        >
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* 12 Months Mini Grid */}
      <div className="year-months-grid" role="region" aria-label={`Annual calendar overview for ${year}`}>
        {MONTH_NAMES.map((monthName, mIdx) => {
          const monthNum = mIdx + 1;
          const firstDay = new Date(year, mIdx, 1).getDay();
          const offset = weekStartsOnMonday ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;
          const totalDays = new Date(year, monthNum, 0).getDate();

          // Count leaves in this month
          let monthGps = 0;
          let monthHolidays = 0;
          for (let d = 1; d <= totalDays; d++) {
            const k = toDateKey(year, monthNum, d);
            const data = eventsLookup.get(k);
            if (data?.isGP) monthGps++;
            if (data?.isHoliday) monthHolidays++;
          }

          return (
            <div 
              key={monthNum} 
              className="mini-month-card"
              onClick={() => onJumpToMonth(year, monthNum)}
              role="button"
              tabIndex={0}
              aria-label={`${monthName} ${year}, ${monthGps} GP leaves, ${monthHolidays} holidays. Click to view month.`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onJumpToMonth(year, monthNum);
                }
              }}
            >
              <div className="mini-month-header">
                <span className="mini-month-name">{monthName}</span>
                <span className="mini-month-jump-hint">View →</span>
              </div>

              {/* Mini Weekday Headers */}
              <div className="mini-weekdays-row" aria-hidden="true">
                {weekdays.map((w, idx) => (
                  <span key={idx} className="mini-weekday-col">{w}</span>
                ))}
              </div>

              {/* Mini Dates Grid */}
              <div className="mini-dates-grid" aria-hidden="true">
                {/* Empty cells before month starts */}
                {Array.from({ length: offset }).map((_, i) => (
                  <span key={`empty-${i}`} className="mini-day-cell empty" />
                ))}

                {/* Days of the month with tiny indicator dots */}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = toDateKey(year, monthNum, day);
                  const dayData = eventsLookup.get(dateKey);

                  let dotType = '';
                  if (dayData) {
                    if (dayData.isFestival) {
                      dotType = 'festival';
                    } else if (dayData.isHoliday) {
                      dotType = 'holiday';
                    } else if (dayData.isGP) {
                      dotType = 'gp';
                    }
                  }

                  return (
                    <div 
                      key={day} 
                      className={`mini-day-cell ${dotType ? `has-${dotType}` : ''}`}
                    >
                      <span className="mini-day-text tabular-nums">{day}</span>
                      {dotType && <span className={`mini-dot ${dotType}`} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
