import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Utensils,
  ChevronRight
} from 'lucide-react';
import { 
  formatHumanDate, 
  getDaysBetween, 
  toDateKey 
} from '../services/leavesService';
import { LEAVE_PORTAL_URL } from '../config';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function HomeView({
  currentUser,
  leaves,
  eventsLookup,
  todayKey,
  onSelectDate,
  onSwitchToCalendar,
  weekStartsOnMonday
}) {
  // Extract user first name
  const firstName = useMemo(() => {
    if (!currentUser?.displayName) return 'Student';
    return currentUser.displayName.split(' ')[0];
  }, [currentUser]);

  // Determine current time greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today date parts
  const todayDateObj = new Date();
  const currentYear = todayDateObj.getFullYear();
  const currentMonth = todayDateObj.getMonth() + 1;

  // Find Next Leave for Hero banner
  const nextLeaveEvent = useMemo(() => {
    if (!leaves.length) return null;
    const sorted = [...leaves].sort((a, b) => (a.start || a.date).localeCompare(b.start || b.date));
    return sorted.find(e => (e.end || e.date) >= todayKey) || sorted[0];
  }, [leaves, todayKey]);

  // Calculate days to next leave
  const daysToNextLeave = useMemo(() => {
    if (!nextLeaveEvent) return null;
    const sDate = nextLeaveEvent.start || nextLeaveEvent.date;
    const eDate = nextLeaveEvent.end || nextLeaveEvent.date;
    if (sDate <= todayKey && eDate >= todayKey) return 0; // Active today
    return Math.max(0, getDaysBetween(todayKey, sDate) - 1);
  }, [nextLeaveEvent, todayKey]);

  // Calculate stats for current month
  const monthStats = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let gps = 0;
    let holidays = 0;
    const countedGpIds = new Set();

    for (let d = 1; d <= daysInMonth; d++) {
      const key = toDateKey(currentYear, currentMonth, d);
      const dayData = eventsLookup.get(key);
      if (dayData) {
        if (dayData.isHoliday) holidays++;
        if (dayData.isGP) {
          dayData.events.forEach(ev => {
            if (ev.type === 'GP' && !countedGpIds.has(ev.id || `${ev.startDate}-${ev.endDate}`)) {
              countedGpIds.add(ev.id || `${ev.startDate}-${ev.endDate}`);
              gps++;
            }
          });
        }
      }
    }

    return { gps, holidays };
  }, [currentYear, currentMonth, eventsLookup]);

  // Compact calendar data calculation
  const compactCalendarDays = useMemo(() => {
    const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
    const offset = weekStartsOnMonday 
      ? (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
      : firstDayOfWeek;

    const days = [];

    // Leading days
    for (let i = 0; i < offset; i++) {
      const dNum = daysInPrevMonth - offset + 1 + i;
      days.push({ dayNum: dNum, isOutside: true, key: `prev-${i}` });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateKey = toDateKey(currentYear, currentMonth, d);
      const dayData = eventsLookup.get(dateKey);
      const colIndex = (offset + d - 1) % 7;
      days.push({
        dayNum: d,
        dateKey,
        dayData,
        isToday: dateKey === todayKey,
        isOutside: false,
        colIndex,
        key: dateKey
      });
    }

    // Trailing days
    const remainder = days.length % 7;
    if (remainder > 0) {
      const trailing = 7 - remainder;
      for (let t = 1; t <= trailing; t++) {
        days.push({ dayNum: t, isOutside: true, key: `next-${t}` });
      }
    }

    return days;
  }, [currentYear, currentMonth, eventsLookup, todayKey, weekStartsOnMonday]);

  // Weekdays for compact calendar
  const weekdays = weekStartsOnMonday
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Hero countdown formatting
  let countdownDisplay = '';
  let countdownSub = '';
  if (daysToNextLeave === 0) {
    countdownDisplay = 'ACTIVE';
    countdownSub = 'Currently ongoing';
  } else if (daysToNextLeave === 1) {
    countdownDisplay = '1 DAY';
    countdownSub = 'Starts tomorrow';
  } else if (daysToNextLeave !== null) {
    countdownDisplay = `${daysToNextLeave} DAYS`;
    countdownSub = 'Until next leave';
  }

  const nextLeaveTitle = nextLeaveEvent
    ? (nextLeaveEvent.name || (nextLeaveEvent.festival ? `${nextLeaveEvent.festival.name} GP Leave` : 'GP Leave'))
    : 'No upcoming leaves scheduled';

  const nextLeaveDateRange = nextLeaveEvent
    ? `${formatHumanDate(nextLeaveEvent.start || nextLeaveEvent.date, false)}${nextLeaveEvent.startAN ? ' (AN)' : ''}${nextLeaveEvent.end ? ` → ${formatHumanDate(nextLeaveEvent.end, false)}` : ''}`
    : '';

  return (
    <div className="home-view-container">
      {/* 1. Header Greeting Section */}
      <section className="home-greeting-section">
        <div className="greeting-text-block">
          <span className="greeting-salutation">{greeting},</span>
          <h1 className="greeting-name">{firstName}</h1>
        </div>
        <div className="greeting-avatar-block">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt={currentUser.displayName} className="home-avatar-img" />
          ) : (
            <div className="home-avatar-fallback">
              {firstName.charAt(0)}
            </div>
          )}
        </div>
      </section>

      {/* 2. Quick-Stats Row */}
      <section className="quick-stats-section" aria-label="Monthly Leave Statistics">
        <div className="stat-card">
          <div className="stat-icon-pill gp">
            <CalendarIcon size={16} strokeWidth={1.75} />
          </div>
          <div className="stat-content">
            <span className="stat-number tabular-nums">{monthStats.gps}</span>
            <span className="stat-label">GPs this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-pill holiday">
            <Sparkles size={16} strokeWidth={1.75} />
          </div>
          <div className="stat-content">
            <span className="stat-number tabular-nums">{monthStats.holidays}</span>
            <span className="stat-label">Holidays this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-pill countdown">
            <Clock size={16} strokeWidth={1.75} />
          </div>
          <div className="stat-content">
            <span className="stat-number tabular-nums">
              {daysToNextLeave !== null ? daysToNextLeave : '—'}
            </span>
            <span className="stat-label">Days to next leave</span>
          </div>
        </div>
      </section>

      {/* 3. Hero "Next Leave" Card */}
      {nextLeaveEvent && (
        <section className="home-hero-section">
          <div 
            className={`hero-leave-card ${nextLeaveEvent.type === 'HOLIDAY' ? 'is-holiday' : 'is-gp'}`}
            onClick={() => onSelectDate(nextLeaveEvent.start || nextLeaveEvent.date)}
            role="button"
            tabIndex={0}
            aria-label={`Next leave: ${nextLeaveTitle}. ${countdownDisplay}`}
          >
            <div className="hero-card-header">
              <div className="hero-badge-pill">
                <Sparkles size={13} strokeWidth={1.75} />
                <span>Next Scheduled Leave</span>
              </div>
              <div className="hero-status-pill">
                {nextLeaveEvent.status === 'Confirmed' ? (
                  <span className="status-confirmed">
                    <CheckCircle2 size={12} strokeWidth={1.75} />
                    Confirmed
                  </span>
                ) : (
                  <span className="status-tentative">
                    <AlertCircle size={12} strokeWidth={1.75} />
                    Tentative
                  </span>
                )}
              </div>
            </div>

            <div className="hero-card-countdown-block">
              <span className="hero-countdown-number tabular-nums">{countdownDisplay}</span>
              <span className="hero-countdown-sub">{countdownSub}</span>
            </div>

            <div className="hero-card-body">
              <h2 className="hero-leave-title">{nextLeaveTitle}</h2>
              <div className="hero-date-range">
                <CalendarIcon size={15} strokeWidth={1.75} />
                <span className="tabular-nums">{nextLeaveDateRange}</span>
              </div>

              {nextLeaveEvent.startAN && (
                <div className="hero-an-notice">
                  <span className="an-tag">AN Start</span>
                  <span>Afternoon half-day departure from campus</span>
                </div>
              )}

              {nextLeaveEvent.messClosure && (
                <div className="hero-mess-notice">
                  <Utensils size={14} strokeWidth={1.75} />
                  <span>Mess dining closed during this leave</span>
                </div>
              )}
            </div>

            <div className="hero-card-actions">
              <a
                href={LEAVE_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-apply-btn"
                onClick={e => e.stopPropagation()}
                title="Apply on BIT Leave Portal"
              >
                <span>Apply on Portal</span>
                <ExternalLink size={15} strokeWidth={1.75} />
              </a>

              <button
                type="button"
                className="hero-details-btn"
                onClick={() => onSelectDate(nextLeaveEvent.start || nextLeaveEvent.date)}
              >
                <span>View Details</span>
                <ChevronRight size={15} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Compact Month Calendar Preview */}
      <section className="compact-calendar-section">
        <div className="compact-calendar-header">
          <div className="compact-title-block">
            <h3 className="compact-title">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </h3>
            <span className="compact-sub">This Month</span>
          </div>

          <button
            type="button"
            className="compact-expand-link"
            onClick={onSwitchToCalendar}
            aria-label="View full interactive calendar"
          >
            <span>Full Calendar</span>
            <ArrowRight size={15} strokeWidth={1.75} />
          </button>
        </div>

        <div className="compact-calendar-card">
          <div className="compact-weekdays-row">
            {weekdays.map((w, idx) => (
              <span key={idx} className="compact-weekday-label">{w}</span>
            ))}
          </div>

          <div className="compact-grid">
            {compactCalendarDays.map((cell) => {
              if (cell.isOutside) {
                return (
                  <div key={cell.key} className="compact-cell outside">
                    <span className="compact-day-num tabular-nums">{cell.dayNum}</span>
                  </div>
                );
              }

              const { dateKey, dayData, isToday, dayNum } = cell;
              const hasGP = Boolean(dayData?.isGP);
              const hasHoliday = Boolean(dayData?.isHoliday);
              const isTentative = dayData?.status === 'Tentative';

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`compact-cell ${isToday ? 'is-today' : ''} ${hasGP ? 'has-gp' : ''} ${hasHoliday ? 'has-holiday' : ''}`}
                  onClick={() => onSelectDate(dateKey)}
                  aria-label={`${dateKey}${hasGP ? ' GP leave' : ''}${hasHoliday ? ' Public holiday' : ''}`}
                >
                  <span className={`compact-day-num tabular-nums ${isToday ? 'today-badge' : ''}`}>
                    {dayNum}
                  </span>
                  <div className="compact-indicators">
                    {hasGP && <span className="compact-dot gp" />}
                    {hasHoliday && <span className="compact-dot holiday" />}
                    {isTentative && <span className="compact-dot tentative" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
