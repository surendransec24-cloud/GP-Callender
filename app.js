/**
 * BIT Holiday Calendar - Main Application Logic
 * Bannari Amman Institute of Technology, Sathyamangalam
 */

(function () {
  'use strict';

  // --- Configuration and Data ---
  const config = window.BIT_CALENDAR_CONFIG || {
    collegeName: "Bannari Amman Institute of Technology",
    collegeShort: "BIT",
    academicYear: "2026–2027",
    startMonth: "2026-06",
    endMonth: "2027-05",
    defaultViewDate: "2026-11-01"
  };

  const rawEvents = window.BIT_CALENDAR_EVENTS || [];

  // --- Date Helper Utilities ---
  // Avoid UTC timezone off-by-one errors by parsing strings directly
  function parseDateKey(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10), // 1-12
      day: parseInt(parts[2], 10)
    };
  }

  function toDateKey(year, month, day) {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  function createLocalDate(year, month, day) {
    return new Date(year, month - 1, day);
  }

  function getDaysBetween(dateStrA, dateStrB) {
    const da = parseDateKey(dateStrA);
    const db = parseDateKey(dateStrB);
    const dateA = createLocalDate(da.year, da.month, da.day);
    const dateB = createLocalDate(db.year, db.month, db.day);
    const diffTime = dateB.getTime() - dateA.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  }

  function formatDateHuman(dateStr, includeWeekday = true) {
    const dp = parseDateKey(dateStr);
    if (!dp) return '';
    const date = createLocalDate(dp.year, dp.month, dp.day);
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    if (includeWeekday) {
      options.weekday = 'short';
    }
    return date.toLocaleDateString('en-IN', options);
  }

  function formatDateFull(dateStr) {
    const dp = parseDateKey(dateStr);
    if (!dp) return '';
    const date = createLocalDate(dp.year, dp.month, dp.day);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // --- Preprocess Events into Normalized Models & Quick Lookup Map ---
  const eventsLookup = new Map(); // dateKey -> object with events array & summary
  const normalizedEvents = [];

  function processAllEvents() {
    eventsLookup.clear();
    normalizedEvents.length = 0;

    rawEvents.forEach((item, index) => {
      const id = `ev-${index}`;
      if (item.type === 'HOLIDAY') {
        const norm = {
          id,
          type: 'HOLIDAY',
          name: item.name,
          startDate: item.date,
          endDate: item.date,
          startAN: false,
          isRange: false,
          totalDays: 1,
          festival: null,
          messClosure: null,
          raw: item
        };
        normalizedEvents.push(norm);

        registerDateEvent(item.date, norm, {
          isHoliday: true,
          holidayName: item.name
        });
      } else if (item.type === 'GP') {
        const totalDays = getDaysBetween(item.start, item.end);
        const norm = {
          id,
          type: 'GP',
          name: item.festival ? `${item.festival.name} GP Leave` : 'GP Leave',
          startDate: item.start,
          endDate: item.end,
          startAN: !!item.startAN,
          isRange: true,
          totalDays,
          festival: item.festival || null,
          messClosure: item.messClosure || null,
          raw: item
        };
        normalizedEvents.push(norm);

        // Register every day in GP range
        const s = parseDateKey(item.start);
        const curDate = createLocalDate(s.year, s.month, s.day);

        for (let d = 0; d < totalDays; d++) {
          const y = curDate.getFullYear();
          const m = curDate.getMonth() + 1;
          const dayNum = curDate.getDate();
          const dateKey = toDateKey(y, m, dayNum);

          const isStartDay = (d === 0);
          const isAN = isStartDay && !!item.startAN;

          // Check if this day is a festival day
          let isFestivalDay = false;
          let festivalName = '';

          if (item.festival) {
            if (item.festival.date) {
              if (item.festival.endDate) {
                // Multi-day festival range
                if (dateKey >= item.festival.date && dateKey <= item.festival.endDate) {
                  isFestivalDay = true;
                  festivalName = item.festival.name;
                }
              } else if (dateKey === item.festival.date) {
                isFestivalDay = true;
                festivalName = item.festival.name;
              }
            } else {
              // Festival without specific single date (e.g. Pongal holidays covering whole GP)
              isFestivalDay = true;
              festivalName = item.festival.name;
            }
          }

          // Check if mess closure applies
          let messInfo = null;
          if (item.messClosure) {
            messInfo = item.messClosure;
          }

          registerDateEvent(dateKey, norm, {
            isGP: true,
            isAN,
            isFestivalDay,
            festivalName,
            messInfo
          });

          // Advance to next day
          curDate.setDate(curDate.getDate() + 1);
        }
      }
    });

    // Sort normalized events chronologically
    normalizedEvents.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  function registerDateEvent(dateKey, normEvent, meta) {
    if (!eventsLookup.has(dateKey)) {
      eventsLookup.set(dateKey, {
        dateKey,
        events: [],
        isHoliday: false,
        holidayName: '',
        isGP: false,
        isAN: false,
        isFestivalDay: false,
        festivalName: '',
        hasMessClosure: false,
        messInfo: null
      });
    }
    const dayData = eventsLookup.get(dateKey);
    dayData.events.push(normEvent);

    if (meta.isHoliday) {
      dayData.isHoliday = true;
      dayData.holidayName = meta.holidayName;
    }
    if (meta.isGP) {
      dayData.isGP = true;
    }
    if (meta.isAN) {
      dayData.isAN = true;
    }
    if (meta.isFestivalDay) {
      dayData.isFestivalDay = true;
      dayData.festivalName = meta.festivalName;
    }
    if (meta.messInfo) {
      dayData.hasMessClosure = true;
      dayData.messInfo = meta.messInfo;
    }
  }

  processAllEvents();

  // --- Academic Year Months Range ---
  // Range: June 2026 to May 2027
  const availableMonths = [
    { year: 2026, month: 6, label: "June 2026", short: "Jun '26" },
    { year: 2026, month: 7, label: "July 2026", short: "Jul '26" },
    { year: 2026, month: 8, label: "August 2026", short: "Aug '26" },
    { year: 2026, month: 9, label: "September 2026", short: "Sep '26" },
    { year: 2026, month: 10, label: "October 2026", short: "Oct '26" },
    { year: 2026, month: 11, label: "November 2026", short: "Nov '26" },
    { year: 2026, month: 12, label: "December 2026", short: "Dec '26" },
    { year: 2027, month: 1, label: "January 2027", short: "Jan '27" },
    { year: 2027, month: 2, label: "February 2027", short: "Feb '27" },
    { year: 2027, month: 3, label: "March 2027", short: "Mar '27" },
    { year: 2027, month: 4, label: "April 2027", short: "Apr '27" },
    { year: 2027, month: 5, label: "May 2027", short: "May '27" }
  ];

  // Determine initial date
  const realToday = new Date();
  const realTodayKey = toDateKey(realToday.getFullYear(), realToday.getMonth() + 1, realToday.getDate());
  
  // Check if today falls in range 2026-06 to 2027-05
  let initialYear = 2026;
  let initialMonth = 11; // November 2026 default
  if (realTodayKey >= "2026-06-01" && realTodayKey <= "2027-05-31") {
    initialYear = realToday.getFullYear();
    initialMonth = realToday.getMonth() + 1;
  }

  // Application State
  const state = {
    viewYear: initialYear,
    viewMonth: initialMonth,
    selectedDateKey: null,
    activeTab: 'calendar', // 'calendar' | 'upcoming'
    filter: 'all',         // 'all' | 'holiday' | 'gp' | 'mess'
    searchQuery: '',
    todayKey: realTodayKey
  };

  // --- DOM Elements ---
  const el = {
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    notifBtn: document.getElementById('notif-btn'),
    exportIcsBtn: document.getElementById('export-ics-btn'),
    heroBannerContainer: document.getElementById('hero-banner-container'),
    tabCalendarBtn: document.getElementById('tab-calendar-btn'),
    tabUpcomingBtn: document.getElementById('tab-upcoming-btn'),
    calendarViewSection: document.getElementById('calendar-view-section'),
    upcomingViewSection: document.getElementById('upcoming-view-section'),
    filterChips: document.querySelectorAll('.filter-chip'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    prevMonthBtn: document.getElementById('prev-month-btn'),
    nextMonthBtn: document.getElementById('next-month-btn'),
    monthDisplayBtn: document.getElementById('month-display-btn'),
    monthDisplayText: document.getElementById('month-display-text'),
    todayChipBtn: document.getElementById('today-chip-btn'),
    calendarCard: document.getElementById('calendar-card'),
    datesGrid: document.getElementById('dates-grid'),
    upcomingListContainer: document.getElementById('upcoming-list-container'),
    // Bottom sheet
    bottomSheetBackdrop: document.getElementById('bottom-sheet-backdrop'),
    bottomSheet: document.getElementById('bottom-sheet'),
    sheetCloseBtn: document.getElementById('sheet-close-btn'),
    sheetDateText: document.getElementById('sheet-date-text'),
    sheetTitle: document.getElementById('sheet-title'),
    sheetBadges: document.getElementById('sheet-badges'),
    sheetInfoCards: document.getElementById('sheet-info-cards'),
    sheetExportBtn: document.getElementById('sheet-export-btn'),
    sheetShareBtn: document.getElementById('sheet-share-btn'),
    // Month picker dialog
    dialogBackdrop: document.getElementById('month-dialog-backdrop'),
    pickerGrid: document.getElementById('month-picker-grid'),
    closePickerBtn: document.getElementById('close-picker-btn'),
    // Toast
    toastNotice: document.getElementById('toast-notice'),
    toastText: document.getElementById('toast-text')
  };

  // --- Toast Notification Helper ---
  let toastTimer = null;
  function showToast(message) {
    if (!el.toastNotice) return;
    el.toastText.textContent = message;
    el.toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toastNotice.classList.remove('show');
    }, 2800);
  }

  // --- Dark Mode Controller ---
  function initTheme() {
    const savedTheme = localStorage.getItem('bit_theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bit_theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`${newTheme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'} activated`);
  }

  function updateThemeIcon(theme) {
    if (!el.themeToggleBtn) return;
    if (theme === 'dark') {
      // Show sun icon to switch to light
      el.themeToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
        </svg>
      `;
    } else {
      // Show moon icon to switch to dark
      el.themeToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.3 2a10 10 0 0 0-.19 20 10.04 10.04 0 0 0 9.71-7.6 1 1 0 0 0-1.21-1.22A8 8 0 0 1 10.6 3.2a1 1 0 0 0-1.2-1.2z"/>
        </svg>
      `;
    }
  }

  // --- Hero Banner: Next Leave Calculation ---
  function renderHeroBanner() {
    if (!el.heroBannerContainer) return;

    const referenceDate = state.todayKey;
    // Find next upcoming leave or active leave
    let activeOrNextEvent = null;
    let daysDiff = 999;

    for (const ev of normalizedEvents) {
      if (ev.endDate >= referenceDate) {
        activeOrNextEvent = ev;
        if (ev.startDate <= referenceDate) {
          daysDiff = 0; // ongoing now
        } else {
          daysDiff = getDaysBetween(referenceDate, ev.startDate) - 1;
        }
        break;
      }
    }

    if (!activeOrNextEvent) {
      // If all completed in 2026-27, fallback to last event
      activeOrNextEvent = normalizedEvents[normalizedEvents.length - 1];
      daysDiff = -1;
    }

    const isHoliday = activeOrNextEvent.type === 'HOLIDAY';
    const isOngoing = (daysDiff === 0);
    
    let countdownBadgeText = '';
    if (isOngoing) {
      countdownBadgeText = 'Active Now';
    } else if (daysDiff === 1) {
      countdownBadgeText = 'Tomorrow';
    } else if (daysDiff > 1) {
      countdownBadgeText = `In ${daysDiff} days`;
    } else {
      countdownBadgeText = 'Academic Year Complete';
    }

    const dateRangeLabel = activeOrNextEvent.isRange
      ? `${formatDateHuman(activeOrNextEvent.startDate, false)}${activeOrNextEvent.startAN ? ' (AN)' : ''} – ${formatDateHuman(activeOrNextEvent.endDate, false)} (${activeOrNextEvent.totalDays} Days)`
      : formatDateHuman(activeOrNextEvent.startDate, true);

    const typeLabel = isHoliday ? 'Public Holiday' : 'GP Leave';
    const extraPills = [];
    if (activeOrNextEvent.startAN) extraPills.push('Half-Day (AN)');
    if (activeOrNextEvent.messClosure) extraPills.push('Mess Closed');

    el.heroBannerContainer.innerHTML = `
      <div class="hero-banner ${isHoliday ? 'is-holiday' : ''}" id="hero-banner-card" role="button" tabindex="0">
        <div class="hero-banner-header">
          <div class="hero-tag">
            <span>✨</span> Next Leave
          </div>
          <span class="hero-countdown">${countdownBadgeText}</span>
        </div>
        <div class="hero-title">${activeOrNextEvent.name}</div>
        <div class="hero-details">
          <span class="hero-detail-item">
            <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
            ${dateRangeLabel}
          </span>
          ${activeOrNextEvent.messClosure ? `
            <span class="hero-detail-item" style="color: var(--mess-text); font-weight: 600;">
              🍽️ Mess Closure Info
            </span>
          ` : ''}
        </div>
      </div>
    `;

    document.getElementById('hero-banner-card').addEventListener('click', () => {
      openBottomSheetForEvent(activeOrNextEvent);
    });
  }

  // --- Calendar Grid Rendering ---
  function renderCalendar() {
    if (!el.datesGrid) return;

    // Update Month Display text
    const currentMonthObj = availableMonths.find(m => m.year === state.viewYear && m.month === state.viewMonth);
    const label = currentMonthObj ? currentMonthObj.label : `${state.viewYear}-${state.viewMonth}`;
    el.monthDisplayText.textContent = label;

    // Check nav buttons bound
    const currentIndex = availableMonths.findIndex(m => m.year === state.viewYear && m.month === state.viewMonth);
    el.prevMonthBtn.disabled = (currentIndex === 0);
    el.nextMonthBtn.disabled = (currentIndex === availableMonths.length - 1);
    el.prevMonthBtn.style.opacity = (currentIndex === 0) ? '0.4' : '1';
    el.nextMonthBtn.style.opacity = (currentIndex === availableMonths.length - 1) ? '0.4' : '1';

    // Calculate Grid cells
    const year = state.viewYear;
    const month = state.viewMonth;

    // First day of this month
    const firstDay = new Date(year, month - 1, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

    // Total days in this month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Total days in previous month (for leading cells)
    const prevMonthDays = new Date(year, month - 1, 0).getDate();

    el.datesGrid.innerHTML = '';

    // 1. Render Leading cells from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDayNum = prevMonthDays - startingDayOfWeek + 1 + i;
      const cell = document.createElement('div');
      cell.className = 'day-cell other-month';
      cell.innerHTML = `<span class="day-number">${prevDayNum}</span>`;
      el.datesGrid.appendChild(cell);
    }

    // 2. Render Current Month Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKey(year, month, day);
      const dayData = eventsLookup.get(dateKey);
      const isSunday = ((startingDayOfWeek + day - 1) % 7 === 0);
      const isToday = (dateKey === state.todayKey);
      const isSelected = (dateKey === state.selectedDateKey);

      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.dataset.date = dateKey;

      if (isSunday) cell.classList.add('is-sunday');
      if (isToday) cell.classList.add('is-today');
      if (isSelected) cell.classList.add('is-selected');

      let badgeHtml = '';

      if (dayData) {
        cell.classList.add('has-event');

        // Status coloring logic
        if (dayData.isFestivalDay) {
          cell.classList.add('status-festival');
          badgeHtml += `<span class="festival-dot" title="Festival Holiday"></span>`;
        } else if (dayData.isHoliday) {
          cell.classList.add('status-holiday');
          badgeHtml += `<span class="holiday-dot" title="Public Holiday"></span>`;
        } else if (dayData.isAN) {
          cell.classList.add('status-an-half');
          badgeHtml += `<span class="an-badge">AN</span>`;
        } else if (dayData.isGP) {
          cell.classList.add('status-gp');
        }

        if (dayData.hasMessClosure) {
          cell.classList.add('has-mess-closure');
          badgeHtml += `<span class="mess-icon-indicator" title="Mess Closed">🍽️</span>`;
        }

        // Apply active filter dimming
        if (state.filter !== 'all') {
          let matchesFilter = false;
          if (state.filter === 'holiday' && dayData.isHoliday) matchesFilter = true;
          if (state.filter === 'gp' && dayData.isGP) matchesFilter = true;
          if (state.filter === 'mess' && dayData.hasMessClosure) matchesFilter = true;

          if (!matchesFilter) {
            cell.classList.add('filter-dimmed');
          }
        }

        // Apply search query dimming if searching
        if (state.searchQuery.trim().length > 0) {
          const q = state.searchQuery.toLowerCase();
          const matches = dayData.events.some(e => {
            const nameMatch = e.name && e.name.toLowerCase().includes(q);
            const festMatch = e.festival && e.festival.name.toLowerCase().includes(q);
            return nameMatch || festMatch;
          });
          if (!matches) {
            cell.classList.add('filter-dimmed');
          }
        }
      } else {
        // If filter or search is active and day has no event, dim it
        if (state.filter !== 'all' || state.searchQuery.trim().length > 0) {
          cell.classList.add('filter-dimmed');
        }
      }

      cell.innerHTML = `
        <span class="day-number">${day}</span>
        <div class="cell-badge-container">${badgeHtml}</div>
      `;

      cell.addEventListener('click', () => {
        handleDateClick(dateKey);
      });

      el.datesGrid.appendChild(cell);
    }

    // 3. Trailing cells to fill last 7-column row
    const totalRendered = startingDayOfWeek + daysInMonth;
    const remainder = totalRendered % 7;
    if (remainder > 0) {
      const trailingCount = 7 - remainder;
      for (let i = 1; i <= trailingCount; i++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell other-month';
        cell.innerHTML = `<span class="day-number">${i}</span>`;
        el.datesGrid.appendChild(cell);
      }
    }
  }

  // --- Upcoming List Rendering ---
  function renderUpcomingList() {
    if (!el.upcomingListContainer) return;

    el.upcomingListContainer.innerHTML = '';

    // Filter events based on state.filter and state.searchQuery
    let filtered = normalizedEvents.filter(ev => {
      // Filter tab
      if (state.filter === 'holiday' && ev.type !== 'HOLIDAY') return false;
      if (state.filter === 'gp' && ev.type !== 'GP') return false;
      if (state.filter === 'mess' && !ev.messClosure) return false;

      // Search query
      if (state.searchQuery.trim().length > 0) {
        const q = state.searchQuery.toLowerCase();
        const nMatch = ev.name.toLowerCase().includes(q);
        const fMatch = ev.festival && ev.festival.name.toLowerCase().includes(q);
        const dMatch = ev.startDate.includes(q) || ev.endDate.includes(q);
        if (!nMatch && !fMatch && !dMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      el.upcomingListContainer.innerHTML = `
        <div class="upcoming-empty-state">
          <p>No events found matching your filter or search.</p>
        </div>
      `;
      return;
    }

    const refDate = state.todayKey;

    filtered.forEach(ev => {
      const card = document.createElement('div');
      let typeClass = 'type-gp';
      if (ev.type === 'HOLIDAY') typeClass = 'type-holiday';
      else if (ev.festival) typeClass = 'type-festival';

      card.className = `upcoming-card ${typeClass}`;

      // Calculate countdown
      let countdownHtml = '';
      if (ev.endDate < refDate) {
        countdownHtml = `<span class="countdown-pill">Completed</span>`;
      } else if (ev.startDate <= refDate && ev.endDate >= refDate) {
        countdownHtml = `<span class="countdown-pill active-now">Ongoing</span>`;
      } else {
        const diff = getDaysBetween(refDate, ev.startDate) - 1;
        if (diff === 1) {
          countdownHtml = `<span class="countdown-pill urgent">Tomorrow</span>`;
        } else {
          countdownHtml = `<span class="countdown-pill ${diff <= 7 ? 'urgent' : ''}">${diff} days left</span>`;
        }
      }

      // Badges
      let badgesHtml = '';
      if (ev.type === 'HOLIDAY') {
        badgesHtml += `<span class="type-pill holiday">Public Holiday</span>`;
      } else {
        badgesHtml += `<span class="type-pill gp">GP Leave (${ev.totalDays} Days)</span>`;
      }

      if (ev.startAN) {
        badgesHtml += `<span class="type-pill an">AN Half-Day</span>`;
      }

      if (ev.festival) {
        badgesHtml += `<span class="type-pill festival">${ev.festival.name}</span>`;
      }

      if (ev.messClosure) {
        badgesHtml += `<span class="type-pill mess">🍽️ Mess Closed</span>`;
      }

      const dateText = ev.isRange
        ? `${formatDateHuman(ev.startDate, true)}${ev.startAN ? ' (AN)' : ''} → ${formatDateHuman(ev.endDate, true)}`
        : formatDateHuman(ev.startDate, true);

      card.innerHTML = `
        <div class="upcoming-card-top">
          <div class="upcoming-badges">${badgesHtml}</div>
          ${countdownHtml}
        </div>
        <div class="upcoming-card-title">${ev.name}</div>
        <div class="upcoming-dates">
          <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          ${dateText}
        </div>
        ${ev.messClosure ? `
          <div class="upcoming-mess-notice">
            <svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
            <span>Mess Closed: <strong>${ev.messClosure.from}</strong> to <strong>${ev.messClosure.to}</strong></span>
          </div>
        ` : ''}
      `;

      card.addEventListener('click', () => {
        openBottomSheetForEvent(ev);
      });

      el.upcomingListContainer.appendChild(card);
    });
  }

  // --- Bottom Sheet Modal Details ---
  let activeSheetEvent = null;

  function handleDateClick(dateKey) {
    state.selectedDateKey = dateKey;
    renderCalendar();

    const dayData = eventsLookup.get(dateKey);
    if (dayData && dayData.events.length > 0) {
      openBottomSheetForEvent(dayData.events[0], dateKey);
    } else {
      openBottomSheetForEmptyDay(dateKey);
    }
  }

  function openBottomSheetForEvent(eventObj, specificDateKey) {
    activeSheetEvent = eventObj;
    const dateKeyForDisplay = specificDateKey || eventObj.startDate;

    el.sheetDateText.textContent = formatDateFull(dateKeyForDisplay);
    el.sheetTitle.textContent = eventObj.name;

    // Badges
    let badgesHtml = '';
    if (eventObj.type === 'HOLIDAY') {
      badgesHtml += `<span class="type-pill holiday">Public Holiday</span>`;
    } else {
      badgesHtml += `<span class="type-pill gp">GP Leave (${eventObj.totalDays} Days)</span>`;
    }

    if (eventObj.startAN) {
      badgesHtml += `<span class="type-pill an">Afternoon (AN) Start</span>`;
    }

    if (eventObj.festival) {
      badgesHtml += `<span class="type-pill festival">${eventObj.festival.name}</span>`;
    }

    if (eventObj.messClosure) {
      badgesHtml += `<span class="type-pill mess">🍽️ Mess Closed</span>`;
    }

    el.sheetBadges.innerHTML = badgesHtml;

    // Info cards
    let cardsHtml = '';

    // 1. Leave period card
    const leaveRangeStr = eventObj.isRange
      ? `${formatDateHuman(eventObj.startDate, false)}${eventObj.startAN ? ' (AN)' : ''} to ${formatDateHuman(eventObj.endDate, false)}`
      : formatDateHuman(eventObj.startDate, true);

    cardsHtml += `
      <div class="info-card">
        <div class="info-card-icon ${eventObj.type === 'HOLIDAY' ? 'red' : 'blue'}">
          <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
        </div>
        <div class="info-card-content">
          <div class="info-card-label">Permission Period</div>
          <div class="info-card-value">${leaveRangeStr}</div>
          <div class="info-card-sub">${eventObj.isRange ? `Total duration: ${eventObj.totalDays} days` : 'Full day institutional holiday'}</div>
        </div>
      </div>
    `;

    // 2. Afternoon start note
    if (eventObj.startAN) {
      cardsHtml += `
        <div class="info-card">
          <div class="info-card-icon blue">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <div class="info-card-content">
            <div class="info-card-label">Afternoon (AN) Half-Day</div>
            <div class="info-card-value">Leave commences in the afternoon</div>
            <div class="info-card-sub">Students can depart campus after 1:00 PM / scheduled afternoon session.</div>
          </div>
        </div>
      `;
    }

    // 3. Festival info
    if (eventObj.festival) {
      let festDateStr = '';
      if (eventObj.festival.date) {
        festDateStr = eventObj.festival.endDate
          ? `${formatDateHuman(eventObj.festival.date, false)} – ${formatDateHuman(eventObj.festival.endDate, false)}`
          : formatDateHuman(eventObj.festival.date, true);
      } else {
        festDateStr = 'Observed during this GP leave';
      }

      cardsHtml += `
        <div class="info-card">
          <div class="info-card-icon orange">
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
          <div class="info-card-content">
            <div class="info-card-label">Festival Celebration</div>
            <div class="info-card-value">${eventObj.festival.name}</div>
            <div class="info-card-sub">${festDateStr}</div>
          </div>
        </div>
      `;
    }

    // 4. Mess Closure
    if (eventObj.messClosure) {
      cardsHtml += `
        <div class="info-card">
          <div class="info-card-icon grey">
            <svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
          </div>
          <div class="info-card-content">
            <div class="info-card-label">Mess Closure Notice</div>
            <div class="info-card-value">${eventObj.messClosure.from} → ${eventObj.messClosure.to}</div>
            <div class="info-card-sub">Hostel dining facilities remain closed during this window. Reopens thereafter.</div>
          </div>
        </div>
      `;
    }

    el.sheetInfoCards.innerHTML = cardsHtml;
    showBottomSheet();
  }

  function openBottomSheetForEmptyDay(dateKey) {
    activeSheetEvent = null;
    el.sheetDateText.textContent = formatDateFull(dateKey);
    el.sheetTitle.textContent = "Working College Day";
    el.sheetBadges.innerHTML = `<span class="type-pill" style="background: var(--bg-card-subtle); color: var(--text-dim);">Regular Schedule</span>`;
    el.sheetInfoCards.innerHTML = `
      <div class="info-card">
        <div class="info-card-icon" style="background: var(--bg-card-subtle); color: var(--text-dim);">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <div class="info-card-content">
          <div class="info-card-label">Institutional Status</div>
          <div class="info-card-value">Standard Academic / Working Day</div>
          <div class="info-card-sub">Regular lectures, laboratories, and hostel mess services operate as scheduled.</div>
        </div>
      </div>
    `;
    showBottomSheet();
  }

  function showBottomSheet() {
    el.bottomSheetBackdrop.classList.add('active');
    el.bottomSheet.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeBottomSheet() {
    el.bottomSheetBackdrop.classList.remove('active');
    el.bottomSheet.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- iCalendar (.ics) Generator ---
  function formatIcsDate(dateKey) {
    // Returns YYYYMMDD
    return dateKey.replace(/-/g, '');
  }

  function getNextDayKey(dateKey) {
    const p = parseDateKey(dateKey);
    const d = createLocalDate(p.year, p.month, p.day);
    d.setDate(d.getDate() + 1);
    return toDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  function generateIcsForEvents(eventsList) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bannari Amman Institute of Technology//BIT Holiday Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:BIT Holiday & GP Calendar 2026-27',
      'X-WR-TIMEZONE:Asia/Kolkata'
    ];

    eventsList.forEach((ev, idx) => {
      const dtStart = formatIcsDate(ev.startDate);
      // For all-day inclusive range in iCalendar, DTEND is the day AFTER the last day
      const dtEnd = formatIcsDate(getNextDayKey(ev.endDate));

      let summary = ev.name;
      if (ev.startAN) {
        summary += ' (AN Start)';
      }

      let desc = `${ev.name} at Bannari Amman Institute of Technology.`;
      if (ev.startAN) {
        desc += `\\nLeave starts in the afternoon (AN) on ${ev.startDate}.`;
      }
      if (ev.festival) {
        desc += `\\nFestival: ${ev.festival.name}`;
      }
      if (ev.messClosure) {
        desc += `\\nMess Closed: from ${ev.messClosure.from} to ${ev.messClosure.to}`;
      }

      const uid = `bit-cal-${ev.startDate}-${idx}@bitsathy.ac.in`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${formatIcsDate(state.todayKey)}T000000Z`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DESCRIPTION:${desc}`);
      lines.push('LOCATION:Bannari Amman Institute of Technology, Alathukombai, Sathyamangalam, Tamil Nadu');
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function downloadIcsFile(filename, icsContent) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`📅 Calendar file downloaded: ${filename}`);
  }

  // --- Browser Notification Reminder ---
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('⚠️ Notifications are not supported in this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      triggerTestNotification();
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        showToast('🔔 Notification reminders enabled!');
        triggerTestNotification();
      } else {
        showToast('ℹ️ Notification permission was denied.');
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
  }

  function triggerTestNotification() {
    if (Notification.permission !== 'granted') return;

    // Find next leave for demonstration
    let nextEv = normalizedEvents.find(e => e.endDate >= state.todayKey) || normalizedEvents[0];
    const daysLeft = getDaysBetween(state.todayKey, nextEv.startDate) - 1;

    const title = `BIT Calendar Reminder: ${nextEv.name}`;
    const options = {
      body: daysLeft > 0 
        ? `${nextEv.name} starts in ${daysLeft} days (${formatDateHuman(nextEv.startDate, false)}).`
        : `${nextEv.name} is currently ongoing!`,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [200, 100, 200]
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
    showToast('🔔 Reminder notification sent!');
  }

  // --- Month Picker Dialog ---
  function buildMonthPickerDialog() {
    if (!el.pickerGrid) return;
    el.pickerGrid.innerHTML = '';

    availableMonths.forEach(m => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'picker-month-btn';
      if (m.year === state.viewYear && m.month === state.viewMonth) {
        btn.classList.add('selected');
      }
      btn.textContent = m.short;
      btn.addEventListener('click', () => {
        state.viewYear = m.year;
        state.viewMonth = m.month;
        closeMonthPicker();
        renderCalendar();
      });
      el.pickerGrid.appendChild(btn);
    });
  }

  function openMonthPicker() {
    buildMonthPickerDialog();
    el.dialogBackdrop.classList.add('active');
  }

  function closeMonthPicker() {
    el.dialogBackdrop.classList.remove('active');
  }

  // --- Swipe Navigation for Calendar Grid ---
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  function initSwipeNavigation() {
    if (!el.calendarCard) return;

    el.calendarCard.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    el.calendarCard.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipeGesture();
    }, { passive: true });
  }

  function handleSwipeGesture() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    // Ensure horizontal swipe is dominant and exceeds threshold
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0) {
        // Swiped left -> Next Month
        navigateMonth(1);
      } else {
        // Swiped right -> Previous Month
        navigateMonth(-1);
      }
    }
  }

  function navigateMonth(direction) {
    const currentIndex = availableMonths.findIndex(m => m.year === state.viewYear && m.month === state.viewMonth);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < availableMonths.length) {
      state.viewYear = availableMonths[newIndex].year;
      state.viewMonth = availableMonths[newIndex].month;
      
      // Animate transition slightly
      el.calendarCard.style.opacity = '0.5';
      el.calendarCard.style.transform = direction > 0 ? 'translateX(-10px)' : 'translateX(10px)';
      setTimeout(() => {
        renderCalendar();
        el.calendarCard.style.opacity = '1';
        el.calendarCard.style.transform = 'translateX(0)';
      }, 120);
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Theme toggle
    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Notifications
    if (el.notifBtn) {
      el.notifBtn.addEventListener('click', requestNotificationPermission);
    }

    // Export All Events (.ics)
    if (el.exportIcsBtn) {
      el.exportIcsBtn.addEventListener('click', () => {
        const ics = generateIcsForEvents(normalizedEvents);
        downloadIcsFile('BIT_Academic_Calendar_2026_27.ics', ics);
      });
    }

    // Segmented View Toggle
    if (el.tabCalendarBtn && el.tabUpcomingBtn) {
      el.tabCalendarBtn.addEventListener('click', () => {
        state.activeTab = 'calendar';
        el.tabCalendarBtn.classList.add('active');
        el.tabUpcomingBtn.classList.remove('active');
        el.calendarViewSection.classList.remove('hidden');
        el.upcomingViewSection.classList.add('hidden');
      });

      el.tabUpcomingBtn.addEventListener('click', () => {
        state.activeTab = 'upcoming';
        el.tabUpcomingBtn.classList.add('active');
        el.tabCalendarBtn.classList.remove('active');
        el.calendarViewSection.classList.add('hidden');
        el.upcomingViewSection.classList.remove('hidden');
        renderUpcomingList();
      });
    }

    // Filter Chips
    el.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        el.filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.filter = chip.dataset.filter;
        renderCalendar();
        renderUpcomingList();
      });
    });

    // Search Input
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (state.searchQuery.length > 0) {
          el.searchClearBtn.style.display = 'block';
        } else {
          el.searchClearBtn.style.display = 'none';
        }
        renderCalendar();
        renderUpcomingList();
      });

      el.searchClearBtn.addEventListener('click', () => {
        el.searchInput.value = '';
        state.searchQuery = '';
        el.searchClearBtn.style.display = 'none';
        renderCalendar();
        renderUpcomingList();
        el.searchInput.focus();
      });
    }

    // Month Navigation
    el.prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    el.nextMonthBtn.addEventListener('click', () => navigateMonth(1));

    // Month Picker Button
    el.monthDisplayBtn.addEventListener('click', openMonthPicker);
    el.closePickerBtn.addEventListener('click', closeMonthPicker);
    el.dialogBackdrop.addEventListener('click', (e) => {
      if (e.target === el.dialogBackdrop) closeMonthPicker();
    });

    // Today Button
    el.todayChipBtn.addEventListener('click', () => {
      state.viewYear = initialYear;
      state.viewMonth = initialMonth;
      state.selectedDateKey = state.todayKey;
      renderCalendar();
      showToast(`Jumping to ${availableMonths.find(m => m.year === initialYear && m.month === initialMonth)?.label}`);
    });

    // Bottom sheet controls
    el.sheetCloseBtn.addEventListener('click', closeBottomSheet);
    el.bottomSheetBackdrop.addEventListener('click', closeBottomSheet);

    // Bottom sheet Export single event
    el.sheetExportBtn.addEventListener('click', () => {
      if (activeSheetEvent) {
        const ics = generateIcsForEvents([activeSheetEvent]);
        const sanitizedName = activeSheetEvent.name.replace(/[^a-zA-Z0-9]/g, '_');
        downloadIcsFile(`BIT_${sanitizedName}.ics`, ics);
      } else {
        const ics = generateIcsForEvents(normalizedEvents);
        downloadIcsFile('BIT_Academic_Calendar_2026_27.ics', ics);
      }
    });

    // Bottom sheet Share
    el.sheetShareBtn.addEventListener('click', async () => {
      const shareTitle = activeSheetEvent ? `BIT Calendar: ${activeSheetEvent.name}` : 'BIT Holiday Calendar';
      const shareText = activeSheetEvent
        ? `${activeSheetEvent.name} (${activeSheetEvent.startDate}${activeSheetEvent.isRange ? ' to ' + activeSheetEvent.endDate : ''}) - BIT Holiday Calendar`
        : 'Official Holiday & GP Leave Calendar for Bannari Amman Institute of Technology.';

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: window.location.href
          });
        } catch (err) {
          // User dismissed share dialog
        }
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${window.location.href}`)
          .then(() => showToast('📋 Link copied to clipboard!'))
          .catch(() => showToast('Share not available on this browser'));
      }
    });

    // Action cards in footer
    const actionExportAll = document.getElementById('action-export-all');
    if (actionExportAll) {
      actionExportAll.addEventListener('click', () => {
        const ics = generateIcsForEvents(normalizedEvents);
        downloadIcsFile('BIT_Academic_Calendar_2026_27.ics', ics);
      });
    }

    const actionRemind = document.getElementById('action-remind');
    if (actionRemind) {
      actionRemind.addEventListener('click', requestNotificationPermission);
    }
  }

  // --- Service Worker Registration for PWA ---
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('BIT Calendar Service Worker Registered', reg.scope))
        .catch(err => console.warn('Service Worker registration skipped/failed:', err));
    }
  }

  // --- App Initialization ---
  function init() {
    initTheme();
    renderHeroBanner();
    renderCalendar();
    renderUpcomingList();
    initSwipeNavigation();
    setupEventListeners();
    registerServiceWorker();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

