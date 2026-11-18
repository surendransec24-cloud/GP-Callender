import React, { useRef, useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Utensils, 
  Search, 
  X,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toDateKey } from '../services/leavesService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthView({
  year,
  month,
  onNavigateMonth,
  onOpenMonthPicker,
  onJumpToday,
  eventsLookup,
  selectedDateKey,
  onSelectDate,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  todayKey,
  weekStartsOnMonday
}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [animDirection, setAnimDirection] = useState('none'); // 'next', 'prev', 'none'
  const prevMonthRef = useRef(month);
  const prevYearRef = useRef(year);

  // Month navigation boundaries: Jan 2026 to Dec 2030
  const canGoPrev = !(year === 2026 && month === 1);
  const canGoNext = !(year === 2030 && month === 12);

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  // Track animation direction when month changes
  useEffect(() => {
    const prevKey = prevYearRef.current * 12 + prevMonthRef.current;
    const currKey = year * 12 + month;

    if (currKey > prevKey) {
      setAnimDirection('slide-next');
    } else if (currKey < prevKey) {
      setAnimDirection('slide-prev');
    }

    prevMonthRef.current = month;
    prevYearRef.current = year;

    const timer = setTimeout(() => {
      setAnimDirection('none');
    }, 260);
    return () => clearTimeout(timer);
  }, [year, month]);

  // Weekday column titles
  const weekdays = weekStartsOnMonday
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate day cells
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 is Sun
  const offset = weekStartsOnMonday 
    ? (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
    : firstDayOfWeek;

  const daysInCurrentMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  // Calculate Month Summary Statistics
  let gpCount = 0;
  let holidayCount = 0;
  let tentativeCount = 0;
  const countedGps = new Set();

  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const key = toDateKey(year, month, d);
    const dayData = eventsLookup.get(key);
    if (dayData) {
      if (dayData.isHoliday) holidayCount++;
      if (dayData.isGP) {
        dayData.events.forEach(ev => {
          if (ev.type === 'GP' && !countedGps.has(ev.id || `${ev.startDate}-${ev.endDate}`)) {
            countedGps.add(ev.id || `${ev.startDate}-${ev.endDate}`);
            gpCount++;
          }
        });
      }
      if (dayData.status === 'Tentative') {
        tentativeCount++;
      }
    }
  }

  // Swipe gesture handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX.current;
    const diffY = e.changedTouches[0].screenY - touchStartY.current;

    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0 && canGoNext) {
        onNavigateMonth(1);
      } else if (diffX > 0 && canGoPrev) {
        onNavigateMonth(-1);
      }
    }
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'holiday', label: 'Holidays', dotClass: 'holiday' },
    { id: 'gp', label: 'GP Leave', dotClass: 'gp' },
    { id: 'mess', label: 'Mess Closed', dotClass: 'mess' }
  ];

  const activeFilterIndex = filterOptions.findIndex(f => f.id === filter);

  return (
    <div className="month-view-wrapper">
      {/* 1. Search Bar & Filter Controls */}
      <div className="calendar-controls-card">
        {/* Quick Search */}
        <div className="search-bar-box">
          <Search size={16} strokeWidth={1.75} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search festival, GP, or holiday..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search leaves and holidays"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* Filter Segmented Control with Sliding Active Indicator */}
        <div className="filter-segmented-control" role="tablist" aria-label="Filter events by type">
          {/* Sliding active pill backdrop */}
          <div 
            className="segmented-slider-thumb"
            style={{
              width: `${100 / filterOptions.length}%`,
              transform: `translateX(${activeFilterIndex * 100}%)`
            }}
            aria-hidden="true"
          />

          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={filter === opt.id}
              className={`segmented-tab-btn ${filter === opt.id ? 'active' : ''}`}
              onClick={() => setFilter(opt.id)}
            >
              {opt.dotClass && <span className={`filter-indicator-dot ${opt.dotClass}`} />}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Month Navigation Header */}
      <div className="month-nav-header">
        <button 
          type="button" 
          className="month-nav-arrow-btn" 
          onClick={() => onNavigateMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>

        <button 
          type="button" 
          className="month-jump-picker-btn"
          onClick={onOpenMonthPicker}
          aria-label={`Current month: ${monthLabel}. Click to open month and year picker`}
        >
          <span className="month-title-text">{monthLabel}</span>
          <ChevronDown size={16} strokeWidth={1.75} className="chevron-icon" />
        </button>

        <div className="nav-right-group">
          <button 
            type="button" 
            className="today-pill-btn"
            onClick={onJumpToday}
            aria-label="Jump to today's date"
          >
            Today
          </button>

          <button 
            type="button" 
            className="month-nav-arrow-btn" 
            onClick={() => onNavigateMonth(1)}
            disabled={!canGoNext}
            aria-label="Next month"
          >
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* 3. Month Summary Strip */}
      <div className="month-summary-strip">
        <div className="summary-left-block">
          <span className="summary-badge gp">
            <span className="summary-bullet gp" />
            {gpCount > 0 ? `${gpCount} GP ${gpCount === 1 ? 'Period' : 'Periods'}` : 'No GP announced'}
          </span>
          <span className="summary-badge holiday">
            <span className="summary-bullet holiday" />
            {holidayCount} {holidayCount === 1 ? 'Holiday' : 'Holidays'}
          </span>
        </div>

        {tentativeCount > 0 && (
          <div className="summary-tentative-pill" title="Tentative schedule awaiting final confirmation">
            <span className="tentative-dot" />
            <span>Tentative Dates</span>
          </div>
        )}
      </div>

      {/* 4. Calendar Month Grid Card */}
      <div 
        className={`calendar-month-card ${animDirection}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="grid"
        aria-label={`Calendar grid for ${monthLabel}`}
      >
        {/* 7-Column Day of Week Headers */}
        <div className="weekdays-header-row" role="row">
          {weekdays.map((dayName, idx) => {
            const isWeekend = weekStartsOnMonday ? (idx >= 5) : (idx === 0);
            return (
              <div 
                key={dayName} 
                className={`weekday-col-label ${isWeekend ? 'weekend' : ''}`}
                role="columnheader"
                aria-label={dayName}
              >
                {dayName}
              </div>
            );
          })}
        </div>

        {/* 7-Column Date Grid */}
        <div className="month-dates-grid">
          {/* Leading days from previous month */}
          {Array.from({ length: offset }).map((_, i) => {
            const dayNum = daysInPrevMonth - offset + 1 + i;
            return (
              <div 
                key={`prev-${i}`} 
                className="calendar-day-cell outside-month"
                role="gridcell"
                aria-hidden="true"
              >
                <span className="day-number-text tabular-nums">{dayNum}</span>
              </div>
            );
          })}

          {/* Days of the current month */}
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateKey = toDateKey(year, month, dayNum);
            const dayData = eventsLookup.get(dateKey);
            const isToday = (dateKey === todayKey);
            const isSelected = (dateKey === selectedDateKey);

            // Weekday index: 0 is left edge of week, 6 is right edge of week
            const colIndex = (offset + i) % 7;
            const isRowStart = colIndex === 0;
            const isRowEnd = colIndex === 6;

            // GP Leave Analysis
            const gpEvent = dayData?.events?.find(e => e.type === 'GP');
            const hasGP = Boolean(gpEvent);
            const isGPStart = hasGP && (dateKey === gpEvent.startDate);
            const isGPEnd = hasGP && (dateKey === gpEvent.endDate);
            const isANStart = isGPStart && Boolean(gpEvent.startAN);

            // Determine Connected GP Pill Positioning
            let gpTrackClass = '';
            if (hasGP) {
              const startOnThisCell = isGPStart || isRowStart;
              const endOnThisCell = isGPEnd || isRowEnd;

              if (startOnThisCell && endOnThisCell) {
                gpTrackClass = 'gp-track-single';
              } else if (startOnThisCell) {
                gpTrackClass = 'gp-track-start';
              } else if (endOnThisCell) {
                gpTrackClass = 'gp-track-end';
              } else {
                gpTrackClass = 'gp-track-middle';
              }
            }

            // Other indicators
            const hasHoliday = Boolean(dayData?.isHoliday);
            const isFestival = Boolean(dayData?.isFestival);
            const hasMessClosure = Boolean(dayData?.hasMessClosure);
            const isTentative = (dayData?.status === 'Tentative');

            // Filtering & Search Dimming
            let isDimmed = false;
            if (filter !== 'all') {
              let matches = false;
              if (filter === 'holiday' && hasHoliday) matches = true;
              if (filter === 'gp' && hasGP) matches = true;
              if (filter === 'mess' && hasMessClosure) matches = true;
              if (!matches) isDimmed = true;
            }

            if (searchQuery.trim().length > 0) {
              const q = searchQuery.toLowerCase();
              const matches = dayData?.events?.some(e => {
                const n = (e.name || '').toLowerCase();
                const fn = (e.festivalName || '').toLowerCase();
                return n.includes(q) || fn.includes(q);
              });
              if (!matches) isDimmed = true;
            }

            return (
              <div
                key={dateKey}
                className={`calendar-day-cell ${hasGP ? 'has-gp' : ''} ${hasHoliday ? 'has-holiday' : ''} ${isSelected ? 'is-selected' : ''} ${isDimmed ? 'filter-dimmed' : ''}`}
                onClick={() => onSelectDate(dateKey)}
                role="gridcell"
                tabIndex={0}
                aria-label={`${dateKey}${isToday ? ', Today' : ''}${hasGP ? ', GP Leave' : ''}${hasHoliday ? ', Public Holiday' : ''}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDate(dateKey);
                  }
                }}
              >
                {/* Continuous Rounded GP Bar / Pill Track */}
                {hasGP && (
                  <div 
                    className={`gp-continuous-track ${gpTrackClass} ${isANStart ? 'an-diagonal-split' : ''} ${isFestival ? 'festival-tint' : ''}`}
                    title={gpEvent?.name || 'GP Leave'}
                  >
                    {isANStart && <span className="an-marker-tag">AN</span>}
                  </div>
                )}

                {/* Day Cell Content Container */}
                <div className="day-cell-inner">
                  {/* Date Number with Today Circle */}
                  <span className={`day-number-text tabular-nums ${isToday ? 'today-pill' : ''}`}>
                    {dayNum}
                  </span>

                  {/* Indicator Dots Row */}
                  <div className="day-indicators-row">
                    {/* Public Holiday Dot (Rose/Red) */}
                    {hasHoliday && (
                      <span className="indicator-dot holiday" title="Public Holiday" />
                    )}

                    {/* Festival Dot (Amber) */}
                    {isFestival && (
                      <span className="indicator-dot festival" title="Festival Holiday" />
                    )}

                    {/* Mess Closure Indicator */}
                    {hasMessClosure && (
                      <span className="indicator-icon-mess" title="Mess Closed">
                        <Utensils size={10} strokeWidth={1.75} />
                      </span>
                    )}

                    {/* Tentative Indicator: Green Dot with Dashed Ring */}
                    {isTentative && (
                      <span className="indicator-dot tentative-dashed" title="Tentative date" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Trailing days from next month */}
          {(() => {
            const totalRendered = offset + daysInCurrentMonth;
            const remainder = totalRendered % 7;
            if (remainder > 0) {
              const trailing = 7 - remainder;
              return Array.from({ length: trailing }).map((_, i) => (
                <div 
                  key={`next-${i}`} 
                  className="calendar-day-cell outside-month"
                  role="gridcell"
                  aria-hidden="true"
                >
                  <span className="day-number-text tabular-nums">{i + 1}</span>
                </div>
              ));
            }
            return null;
          })()}
        </div>
      </div>

      {/* 5. Accessible Visual Legend */}
      <div className="calendar-legend-box" aria-label="Calendar legend">
        <div className="legend-items-list">
          <div className="legend-item">
            <span className="legend-swatch holiday-dot" />
            <span className="legend-label">Public Holiday</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch gp-pill" />
            <span className="legend-label">GP Leave</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch festival-pill" />
            <span className="legend-label">GP + Festival</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch an-half-pill">
              <span className="an-mini-tag">AN</span>
            </span>
            <span className="legend-label">AN Departure</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch mess-stripe">
              <Utensils size={10} strokeWidth={1.75} />
            </span>
            <span className="legend-label">Mess Closed</span>
          </div>

          <div className="legend-item">
            <span className="legend-swatch tentative-dot" />
            <span className="legend-label">Tentative</span>
          </div>
        </div>
      </div>
    </div>
  );
}
