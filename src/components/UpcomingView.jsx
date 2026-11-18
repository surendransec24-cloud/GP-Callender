import React, { useMemo } from 'react';
import { 
  Calendar, 
  Utensils, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Clock,
  ChevronRight,
  Inbox
} from 'lucide-react';
import { formatHumanDate, getDaysBetween } from '../services/leavesService';
import { LEAVE_PORTAL_URL } from '../config';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function UpcomingView({ 
  events, 
  filter, 
  searchQuery, 
  referenceDate, 
  onSelectEvent 
}) {
  // 1. Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // Filter type
      if (filter === 'holiday' && ev.type !== 'HOLIDAY') return false;
      if (filter === 'gp' && ev.type !== 'GP') return false;
      if (filter === 'mess' && !ev.messClosure) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const nMatch = (ev.name || '').toLowerCase().includes(q);
        const fMatch = ev.festival && (ev.festival.name || '').toLowerCase().includes(q);
        const dMatch = (ev.start || ev.date || '').includes(q);
        if (!nMatch && !fMatch && !dMatch) return false;
      }

      return true;
    }).sort((a, b) => (a.start || a.date).localeCompare(b.start || b.date));
  }, [events, filter, searchQuery]);

  // 2. Group events by Month & Year for sticky timeline headers
  const groupedEventsByMonth = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    filteredEvents.forEach(ev => {
      const sDate = ev.start || ev.date;
      const [yStr, mStr] = sDate.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const groupKey = `${y}-${m}`;
      const groupLabel = `${MONTH_NAMES[m - 1]} ${y}`;

      if (!currentGroup || currentGroup.key !== groupKey) {
        currentGroup = {
          key: groupKey,
          label: groupLabel,
          year: y,
          month: m,
          events: []
        };
        groups.push(currentGroup);
      }
      currentGroup.events.push(ev);
    });

    return groups;
  }, [filteredEvents]);

  if (filteredEvents.length === 0) {
    return (
      <div className="upcoming-empty-card" role="status">
        <div className="empty-graphic-circle">
          <Inbox size={32} strokeWidth={1.75} />
        </div>
        <h3 className="empty-title">No leaves or holidays found</h3>
        <p className="empty-desc">
          No scheduled leaves match your active filter or search query. Try switching filters to "All".
        </p>
      </div>
    );
  }

  return (
    <div className="upcoming-timeline-container" role="feed" aria-label="Upcoming leave timeline">
      {groupedEventsByMonth.map(group => (
        <section key={group.key} className="timeline-month-group">
          {/* Sticky Month Header */}
          <div className="timeline-sticky-header">
            <span className="sticky-month-text">{group.label}</span>
            <span className="sticky-count-pill">{group.events.length}</span>
          </div>

          {/* List of Timeline Event Cards */}
          <div className="timeline-cards-list">
            {group.events.map((ev, idx) => {
              const isRange = ev.type === 'GP';
              const startDate = isRange ? ev.start : ev.date;
              const endDate = isRange ? ev.end : ev.date;
              const name = ev.name || (ev.festival ? `${ev.festival.name} GP Leave` : 'GP Leave');
              const isConfirmed = ev.status === 'Confirmed';
              const isHoliday = ev.type === 'HOLIDAY';
              const isFestival = Boolean(ev.festival);

              // Countdown badge calculation
              let countdownBadge = '';
              let badgeClass = 'normal';

              if (endDate < referenceDate) {
                countdownBadge = 'Completed';
                badgeClass = 'completed';
              } else if (startDate <= referenceDate && endDate >= referenceDate) {
                countdownBadge = 'Active Now';
                badgeClass = 'active';
              } else {
                const diff = getDaysBetween(referenceDate, startDate) - 1;
                if (diff === 0) {
                  countdownBadge = 'Starts Today';
                  badgeClass = 'urgent';
                } else if (diff === 1) {
                  countdownBadge = 'Tomorrow';
                  badgeClass = 'urgent';
                } else {
                  countdownBadge = `In ${diff} days`;
                  badgeClass = diff <= 7 ? 'urgent' : 'normal';
                }
              }

              // Color stripe class
              let stripeType = 'holiday';
              if (ev.type === 'GP') {
                stripeType = isFestival ? 'festival' : 'gp';
              }

              const dateRangeLabel = isRange
                ? `${formatHumanDate(startDate, false)}${ev.startAN ? ' (AN)' : ''} → ${formatHumanDate(endDate, false)}`
                : formatHumanDate(startDate, false);

              return (
                <div
                  key={ev.id || `${startDate}-${idx}`}
                  className={`timeline-item-card stripe-${stripeType}`}
                  onClick={() => onSelectEvent(ev)}
                  role="article"
                  tabIndex={0}
                  aria-label={`${name}. ${dateRangeLabel}. ${countdownBadge}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectEvent(ev);
                    }
                  }}
                >
                  {/* Left Colour Stripe */}
                  <div className={`card-colour-stripe stripe-${stripeType}`} aria-hidden="true" />

                  <div className="timeline-card-content">
                    {/* Top Row: Category Pill & Days Left Chip */}
                    <div className="card-top-row">
                      <div className="card-type-tags">
                        {isHoliday ? (
                          <span className="tag-pill holiday">Public Holiday</span>
                        ) : (
                          <span className={`tag-pill ${isFestival ? 'festival' : 'gp'}`}>
                            {isFestival ? 'GP + Festival' : 'GP Leave'}
                          </span>
                        )}

                        {ev.startAN && (
                          <span className="tag-pill an">AN Departure</span>
                        )}

                        {isConfirmed ? (
                          <span className="tag-status confirmed">
                            <CheckCircle2 size={11} strokeWidth={1.75} />
                            Confirmed
                          </span>
                        ) : (
                          <span className="tag-status tentative">
                            <AlertCircle size={11} strokeWidth={1.75} />
                            Tentative
                          </span>
                        )}
                      </div>

                      <span className={`days-left-chip ${badgeClass} tabular-nums`}>
                        {countdownBadge}
                      </span>
                    </div>

                    {/* Middle: Title & Date Range */}
                    <div className="card-middle-row">
                      <h3 className="timeline-event-title">{name}</h3>
                      <div className="timeline-event-dates tabular-nums">
                        <Calendar size={14} strokeWidth={1.75} />
                        <span>{dateRangeLabel}</span>
                      </div>
                    </div>

                    {/* Bottom: Notes & Portal Apply Link */}
                    <div className="card-bottom-row">
                      <div className="card-notices">
                        {ev.messClosure && (
                          <span className="mess-closed-tag">
                            <Utensils size={12} strokeWidth={1.75} />
                            Mess Closed
                          </span>
                        )}
                      </div>

                      {ev.type === 'GP' && (
                        <a
                          href={LEAVE_PORTAL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="timeline-apply-link"
                          onClick={e => e.stopPropagation()}
                          title="Apply for this leave on BIT Leave Portal"
                        >
                          <span>Apply</span>
                          <ExternalLink size={13} strokeWidth={1.75} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
