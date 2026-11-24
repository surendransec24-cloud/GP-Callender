import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import ConfigErrorScreen from './components/ConfigErrorScreen';
import Header from './components/Header';
import GlassBackground from './components/GlassBackground';
import HomeView from './components/HomeView';
import MonthView from './components/MonthView';
import UpcomingView from './components/UpcomingView';
import BottomSheet from './components/BottomSheet';
import MonthPickerModal from './components/MonthPickerModal';
import ProfileSheet from './components/ProfileSheet';
import SkeletonLoader from './components/SkeletonLoader';
import OfflineBanner from './components/OfflineBanner';
import { 
  getAllLeaves, 
  buildEventsLookup, 
  toDateKey, 
  getDaysBetween, 
  formatHumanDate 
} from './services/leavesService';
import { generateIcs, downloadIcsFile } from './utils/icsExport';
import { LEAVE_PORTAL_URL } from './config';
import { 
  Home as HomeIcon,
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon,
  LayoutGrid,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Requirement 9: Lazy-load YearView and AdminModal to keep main bundle lean
const YearView = React.lazy(() => import('./components/YearView'));
const AdminModal = React.lazy(() => import('./components/AdminModal'));

export default function App() {
  const { currentUser, loading: authLoading, isFirebaseConfigured } = useAuth();

  // Leaves Data state
  const [leaves, setLeaves] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Calendar State: Default to Nov 2026 (or today if between 2026-01-01 and 2030-12-31)
  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  let startY = 2026;
  let startM = 11;
  if (todayKey >= '2026-01-01' && todayKey <= '2030-12-31') {
    startY = today.getFullYear();
    startM = today.getMonth() + 1;
  }

  const [currentYear, setCurrentYear] = useState(startY);
  const [currentMonth, setCurrentMonth] = useState(startM);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  // App settings & view toggles (4 navigation items: home, calendar, upcoming, profile)
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'calendar' | 'upcoming' | 'year'
  const [filter, setFilter] = useState('all'); // 'all' | 'holiday' | 'gp' | 'mess'
  const [searchQuery, setSearchQuery] = useState('');
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('bit_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modals state
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Apply dark mode theme
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bit_theme', theme);
    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) {
      metaTheme.setAttribute('content', darkMode ? '#0c1220' : '#1e3a8a');
    }
  }, [darkMode]);

  // Load all leaves (local JSON + Firestore updates)
  const fetchLeaves = async () => {
    setDataLoading(true);
    try {
      const data = await getAllLeaves();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchLeaves();
    }
  }, [currentUser]);

  // Lookup map for fast calendar day rendering
  const eventsLookup = useMemo(() => {
    return buildEventsLookup(leaves);
  }, [leaves]);

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Month navigation (-1 or +1)
  const handleNavigateMonth = (direction) => {
    let y = currentYear;
    let m = currentMonth + direction;

    if (m > 12) {
      if (y < 2030) {
        y++;
        m = 1;
      } else {
        return;
      }
    } else if (m < 1) {
      if (y > 2026) {
        y--;
        m = 12;
      } else {
        return;
      }
    }
    setCurrentYear(y);
    setCurrentMonth(m);
  };

  // Jump to Today
  const handleJumpToday = () => {
    setCurrentYear(startY);
    setCurrentMonth(startM);
    setSelectedDateKey(todayKey);
    showToast(`Jumped to today: ${todayKey}`);
  };

  // Jump from Year view or picker
  const handleJumpToMonth = (y, m) => {
    setCurrentYear(y);
    setCurrentMonth(m);
    setActiveTab('calendar');
  };

  // Export full calendar or year
  const handleExportAll = () => {
    const icsContent = generateIcs(leaves, 'BIT Holiday & GP Calendar (2026-2030)');
    downloadIcsFile('BIT_Calendar_2026_2030.ics', icsContent);
    showToast('Exported full 2026–2030 calendar (.ics)');
  };

  // Find Next Leave for Hero banner
  const nextLeaveEvent = useMemo(() => {
    if (!leaves.length) return null;
    const sorted = [...leaves].sort((a, b) => (a.start || a.date).localeCompare(b.start || b.date));
    return sorted.find(e => (e.end || e.date) >= todayKey) || sorted[0];
  }, [leaves, todayKey]);

  // Next upcoming GP leave (specifically GP)
  const nextUpcomingGP = useMemo(() => {
    if (!leaves.length) return null;
    const gps = leaves.filter(e => e.type === 'GP' && e.end >= todayKey);
    gps.sort((a, b) => a.start.localeCompare(b.start));
    return gps[0] || null;
  }, [leaves, todayKey]);

  // Check if the next GP starts within 7 days
  const isNextGpWithin7Days = useMemo(() => {
    if (!nextUpcomingGP) return false;
    const daysUntilStart = getDaysBetween(todayKey, nextUpcomingGP.start) - 1;
    return daysUntilStart >= 0 && daysUntilStart <= 7;
  }, [nextUpcomingGP, todayKey]);

  // Loading state during auth check (Skeletons instead of generic spinners)
  if (authLoading) {
    return (
      <div className="app-loading-screen" role="status" aria-label="Loading application">
        <div className="college-crest-mini-loading">BIT</div>
        <div className="loading-shimmer-bar" />
        <p className="loading-label">Loading BIT Holiday Calendar...</p>
      </div>
    );
  }

  // First Screen: Show Configuration Error in production if Firebase secrets are missing,
  // or show LoginScreen with real Google authentication
  if (!currentUser) {
    if (!isFirebaseConfigured && !import.meta.env.DEV) {
      return <ConfigErrorScreen />;
    }
    return <LoginScreen />;
  }

  // Selected Day Data for Bottom Sheet
  const selectedDayData = selectedDateKey ? eventsLookup.get(selectedDateKey) : null;

  return (
    <div className="app-viewport">
      {/* Fixed Ambient Glass Background with Drifting Orbs */}
      <GlassBackground />

      {/* Offline Alert Strip if network drops */}
      <OfflineBanner />

      {/* App Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onExportAll={handleExportAll}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenProfile={() => setProfileSheetOpen(true)}
        weekStartsOnMonday={weekStartsOnMonday}
        setWeekStartsOnMonday={setWeekStartsOnMonday}
        onShowToast={showToast}
      />

      {/* Main Responsive App Content Area */}
      <main className="app-main-content">
        {/* Optional 7-Day Urgent GP Reminder Banner */}
        {isNextGpWithin7Days && nextUpcomingGP && (
          <section className="urgent-gp-reminder-section" aria-label="Upcoming GP departure alert">
            <div className="urgent-gp-banner">
              <div className="urgent-banner-icon-box">
                <Clock size={18} strokeWidth={1.75} />
              </div>
              <div className="urgent-banner-content">
                <div className="urgent-banner-title">Apply before your GP leave starts</div>
                <div className="urgent-banner-desc">
                  {nextUpcomingGP.festival?.name || 'Next GP'} starts in {getDaysBetween(todayKey, nextUpcomingGP.start) - 1} days ({formatHumanDate(nextUpcomingGP.start, false)}).
                </div>
              </div>
              <a
                href={LEAVE_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="urgent-banner-apply-btn"
                title="Open BIT Leave Portal"
              >
                <span>Apply now</span>
                <ExternalLink size={14} strokeWidth={1.75} />
              </a>
            </div>
          </section>
        )}

        {/* View Switcher: Sub-tabs for Calendar vs Year when on Calendar view */}
        {activeTab === 'calendar' && (
          <div className="calendar-subview-toggle">
            <div className="subview-pills-row">
              <button
                type="button"
                className="subview-pill-btn active"
                onClick={() => setActiveTab('calendar')}
              >
                <CalendarIcon size={14} strokeWidth={1.75} />
                <span>Month</span>
              </button>
              <button
                type="button"
                className="subview-pill-btn"
                onClick={() => setActiveTab('year')}
              >
                <LayoutGrid size={14} strokeWidth={1.75} />
                <span>Year</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Content View — left column on desktop */}
        {dataLoading ? (
          <SkeletonLoader type={activeTab === 'home' ? 'home' : 'calendar'} />
        ) : (
          <div className="view-content-wrapper">
            {/* VIEW 1: Home View */}
            {activeTab === 'home' && (
              <HomeView
                currentUser={currentUser}
                leaves={leaves}
                eventsLookup={eventsLookup}
                todayKey={todayKey}
                onSelectDate={setSelectedDateKey}
                onSwitchToCalendar={() => setActiveTab('calendar')}
                weekStartsOnMonday={weekStartsOnMonday}
              />
            )}

            {/* VIEW 2: Month Calendar Grid */}
            {activeTab === 'calendar' && (
              <MonthView
                year={currentYear}
                month={currentMonth}
                onNavigateMonth={handleNavigateMonth}
                onOpenMonthPicker={() => setMonthPickerOpen(true)}
                onJumpToday={handleJumpToday}
                eventsLookup={eventsLookup}
                selectedDateKey={selectedDateKey}
                onSelectDate={setSelectedDateKey}
                filter={filter}
                setFilter={setFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                todayKey={todayKey}
                weekStartsOnMonday={weekStartsOnMonday}
              />
            )}

            {/* VIEW 3: Upcoming Timeline */}
            {activeTab === 'upcoming' && (
              <UpcomingView
                events={leaves}
                filter={filter}
                searchQuery={searchQuery}
                referenceDate={todayKey}
                onSelectEvent={ev => setSelectedDateKey(ev.start || ev.date)}
              />
            )}

            {/* VIEW 4: Year Grid (Lazy Loaded) */}
            {activeTab === 'year' && (
              <Suspense fallback={<SkeletonLoader type="calendar" />}>
                <div className="calendar-subview-toggle">
                  <div className="subview-pills-row">
                    <button
                      type="button"
                      className="subview-pill-btn"
                      onClick={() => setActiveTab('calendar')}
                    >
                      <CalendarIcon size={14} strokeWidth={1.75} />
                      <span>Month</span>
                    </button>
                    <button
                      type="button"
                      className="subview-pill-btn active"
                      onClick={() => setActiveTab('year')}
                    >
                      <LayoutGrid size={14} strokeWidth={1.75} />
                      <span>Year</span>
                    </button>
                  </div>
                </div>
                <YearView
                  year={currentYear}
                  setYear={setCurrentYear}
                  eventsLookup={eventsLookup}
                  onSelectDate={setSelectedDateKey}
                  onJumpToMonth={handleJumpToMonth}
                  weekStartsOnMonday={weekStartsOnMonday}
                />
              </Suspense>
            )}
          </div>
        )}

        {/* Desktop right panel — Upcoming list + Apply card (hidden on mobile via CSS) */}
        <aside className="desktop-right-panel" aria-label="Upcoming leaves and quick actions">
          {/* Apply for Leave card */}
          <div className="desktop-apply-card">
            <div className="desktop-apply-label">QUICK ACTIONS</div>
            <a
              href={LEAVE_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="desktop-apply-link"
              title="Open BIT Leave Portal"
              aria-label="Open BIT Leave Portal to apply for outpass leave"
            >
              <ExternalLink size={16} strokeWidth={1.75} />
              <span>Apply for Leave</span>
            </a>
          </div>

          {/* Upcoming events list (always visible in right panel on desktop) */}
          {!dataLoading && (
            <UpcomingView
              events={leaves}
              filter={filter}
              searchQuery={searchQuery}
              referenceDate={todayKey}
              onSelectEvent={ev => setSelectedDateKey(ev.start || ev.date)}
              compact={true}
            />
          )}
        </aside>
      </main>

      {/* Floating Bottom Dock & Sticky Action Container */}
      <footer className="sticky-bottom-wrapper">
        {/* Main "Apply for Leave" Button (min 48px tap target) */}
        <div className="sticky-apply-container">
          <a
            href={LEAVE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sticky-apply-main-btn"
            title="Open BIT Leave Portal"
            aria-label="Open BIT Leave Portal to submit outpass leave"
          >
            <span className="btn-text">Apply for Leave</span>
            <ExternalLink size={17} strokeWidth={1.75} className="btn-external-icon" />
          </a>
        </div>

        {/* Floating Bottom Tab Bar with Frosted Glass Background (4 items: Home, Calendar, Upcoming, Profile) */}
        <nav className="bottom-nav-dock" aria-label="Primary Navigation">
          {/* 1. Home */}
          <button
            type="button"
            className={`bottom-nav-dock-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
            aria-label="Home tab"
            aria-current={activeTab === 'home' ? 'page' : undefined}
          >
            <HomeIcon 
              size={19} 
              strokeWidth={activeTab === 'home' ? 2.2 : 1.75} 
              className={activeTab === 'home' ? 'active-icon' : ''} 
            />
            <span>Home</span>
          </button>

          {/* 2. Calendar */}
          <button
            type="button"
            className={`bottom-nav-dock-btn ${activeTab === 'calendar' || activeTab === 'year' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
            aria-label="Calendar tab"
            aria-current={(activeTab === 'calendar' || activeTab === 'year') ? 'page' : undefined}
          >
            <CalendarIcon 
              size={19} 
              strokeWidth={(activeTab === 'calendar' || activeTab === 'year') ? 2.2 : 1.75} 
              className={(activeTab === 'calendar' || activeTab === 'year') ? 'active-icon' : ''} 
            />
            <span>Calendar</span>
          </button>

          {/* 3. Upcoming */}
          <button
            type="button"
            className={`bottom-nav-dock-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
            aria-label="Upcoming leave list tab"
            aria-current={activeTab === 'upcoming' ? 'page' : undefined}
          >
            <Clock 
              size={19} 
              strokeWidth={activeTab === 'upcoming' ? 2.2 : 1.75} 
              className={activeTab === 'upcoming' ? 'active-icon' : ''} 
            />
            <span>Upcoming</span>
          </button>

          {/* 4. Profile */}
          <button
            type="button"
            className={`bottom-nav-dock-btn ${profileSheetOpen ? 'active' : ''}`}
            onClick={() => setProfileSheetOpen(true)}
            aria-label="Profile and settings tab"
            aria-haspopup="dialog"
          >
            <UserIcon 
              size={19} 
              strokeWidth={profileSheetOpen ? 2.2 : 1.75} 
              className={profileSheetOpen ? 'active-icon' : ''} 
            />
            <span>Profile</span>
          </button>
        </nav>
      </footer>

      {/* Date Details Bottom Sheet Modal */}
      {selectedDateKey && (
        <BottomSheet
          dateKey={selectedDateKey}
          dayData={selectedDayData}
          onClose={() => setSelectedDateKey(null)}
          onShowToast={showToast}
        />
      )}

      {/* Month/Year Picker Bottom Sheet */}
      {monthPickerOpen && (
        <MonthPickerModal
          currentYear={currentYear}
          currentMonth={currentMonth}
          onSelectMonth={(y, m) => {
            setCurrentYear(y);
            setCurrentMonth(m);
            setActiveTab('calendar');
          }}
          onClose={() => setMonthPickerOpen(false)}
        />
      )}

      {/* Profile & Settings Bottom Sheet */}
      <ProfileSheet
        isOpen={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        weekStartsOnMonday={weekStartsOnMonday}
        setWeekStartsOnMonday={setWeekStartsOnMonday}
        onExportAll={handleExportAll}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onShowToast={showToast}
      />

      {/* Admin GP Announce Modal (Lazy Loaded) */}
      {adminModalOpen && (
        <Suspense fallback={null}>
          <AdminModal
            onClose={() => setAdminModalOpen(false)}
            onLeaveSaved={fetchLeaves}
            onShowToast={showToast}
          />
        </Suspense>
      )}

      {/* Toast Alert Pill */}
      {toastMessage && (
        <div className="floating-toast-alert" role="status" aria-live="polite">
          <CheckCircle2 size={16} strokeWidth={2} className="toast-check-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
