import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  User, 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  Calendar, 
  ExternalLink, 
  Download, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert,
  ChevronRight,
  Check
} from 'lucide-react';
import { LEAVE_PORTAL_URL } from '../config';

export default function ProfileSheet({
  isOpen,
  onClose,
  darkMode,
  setDarkMode,
  weekStartsOnMonday,
  setWeekStartsOnMonday,
  onExportAll,
  onOpenAdmin,
  onShowToast
}) {
  const { currentUser, logout, isAdmin } = useAuth();
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem('bit_theme_mode') || (darkMode ? 'dark' : 'light');
  });

  if (!isOpen) return null;

  const handleThemeChange = (mode) => {
    setThemePreference(mode);
    localStorage.setItem('bit_theme_mode', mode);

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      onShowToast('Applied system theme');
    } else {
      const isDark = (mode === 'dark');
      setDarkMode(isDark);
      onShowToast(`Switched to ${mode} mode`);
    }
  };

  const handleNotificationRequest = async () => {
    if (!('Notification' in window)) {
      onShowToast('Notifications are not supported in this browser');
      return;
    }
    if (Notification.permission === 'granted') {
      onShowToast('Notifications are already active');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        onShowToast('Leave alerts enabled');
      } else {
        onShowToast('Notification permission denied');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const hasNotifications = ('Notification' in window) && Notification.permission === 'granted';

  return (
    <div 
      className="bottom-sheet-backdrop active" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="User profile and settings"
    >
      <div className="profile-sheet-card" onClick={e => e.stopPropagation()}>
        <div className="sheet-drag-handle-bar" aria-hidden="true">
          <div className="sheet-drag-pill" />
        </div>

        {/* Header */}
        <div className="sheet-header-row">
          <div className="profile-top-title">
            <h3 className="profile-sheet-heading">Profile &amp; Settings</h3>
          </div>
          <button 
            type="button" 
            className="sheet-close-btn" 
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* User Card */}
        <div className="profile-user-card">
          <div className="profile-avatar-box">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.displayName} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-initials">
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'B'}
              </div>
            )}
          </div>

          <div className="profile-details-block">
            <h4 className="profile-user-name">{currentUser?.displayName || 'BIT Student'}</h4>
            <span className="profile-user-email">{currentUser?.email}</span>
            <div className="profile-badges-row">
              <span className="domain-verified-badge">
                <ShieldCheck size={12} strokeWidth={1.75} />
                <span>Verified @bitsathy.ac.in</span>
              </span>
              {isAdmin && (
                <span className="admin-status-badge">
                  <ShieldAlert size={12} strokeWidth={1.75} />
                  <span>Admin</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Sections */}
        <div className="profile-settings-list">
          {/* 1. Theme Toggle */}
          <div className="setting-item-block">
            <span className="setting-label">Appearance</span>
            <div className="segmented-theme-picker" role="radiogroup" aria-label="Theme selection">
              <button
                type="button"
                className={`theme-pick-btn ${themePreference === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
                role="radio"
                aria-checked={themePreference === 'light'}
              >
                <Sun size={15} strokeWidth={1.75} />
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`theme-pick-btn ${themePreference === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
                role="radio"
                aria-checked={themePreference === 'dark'}
              >
                <Moon size={15} strokeWidth={1.75} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                className={`theme-pick-btn ${themePreference === 'system' ? 'active' : ''}`}
                onClick={() => handleThemeChange('system')}
                role="radio"
                aria-checked={themePreference === 'system'}
              >
                <Laptop size={15} strokeWidth={1.75} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* 2. Week Start Day Toggle */}
          <div className="setting-item-block">
            <span className="setting-label">First Day of Week</span>
            <div className="segmented-theme-picker" role="radiogroup" aria-label="Week start day">
              <button
                type="button"
                className={`theme-pick-btn ${!weekStartsOnMonday ? 'active' : ''}`}
                onClick={() => {
                  setWeekStartsOnMonday(false);
                  onShowToast('Week starts on Sunday');
                }}
                role="radio"
                aria-checked={!weekStartsOnMonday}
              >
                <span>Sunday</span>
              </button>
              <button
                type="button"
                className={`theme-pick-btn ${weekStartsOnMonday ? 'active' : ''}`}
                onClick={() => {
                  setWeekStartsOnMonday(true);
                  onShowToast('Week starts on Monday');
                }}
                role="radio"
                aria-checked={weekStartsOnMonday}
              >
                <span>Monday</span>
              </button>
            </div>
          </div>

          {/* 3. Notification Toggle Row */}
          <div className="setting-action-row" onClick={handleNotificationRequest} role="button" tabIndex={0}>
            <div className="setting-left">
              <div className="setting-icon-box">
                <Bell size={17} strokeWidth={1.75} />
              </div>
              <div className="setting-info">
                <span className="setting-title">Leave Notifications</span>
                <span className="setting-desc">Alerts before GP leaves and campus departures</span>
              </div>
            </div>
            <span className={`setting-status-pill ${hasNotifications ? 'enabled' : 'disabled'}`}>
              {hasNotifications ? 'Active' : 'Enable'}
            </span>
          </div>

          {/* 4. Portal Direct Link */}
          <a
            href={LEAVE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="setting-action-row"
          >
            <div className="setting-left">
              <div className="setting-icon-box portal">
                <ExternalLink size={17} strokeWidth={1.75} />
              </div>
              <div className="setting-info">
                <span className="setting-title">BIT Student Leave Portal</span>
                <span className="setting-desc">Official portal to submit and manage outpass leaves</span>
              </div>
            </div>
            <ChevronRight size={16} strokeWidth={1.75} className="setting-arrow" />
          </a>

          {/* 5. Export Full Calendar */}
          <button
            type="button"
            className="setting-action-row"
            onClick={() => {
              onExportAll();
              onClose();
            }}
          >
            <div className="setting-left">
              <div className="setting-icon-box export">
                <Download size={17} strokeWidth={1.75} />
              </div>
              <div className="setting-info">
                <span className="setting-title">Export Academic Calendar</span>
                <span className="setting-desc">Download all 2026–2030 leaves to .ics</span>
              </div>
            </div>
            <ChevronRight size={16} strokeWidth={1.75} className="setting-arrow" />
          </button>

          {/* 6. Admin Portal Option */}
          {isAdmin && (
            <button
              type="button"
              className="setting-action-row admin-highlight"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
            >
              <div className="setting-left">
                <div className="setting-icon-box admin">
                  <ShieldAlert size={17} strokeWidth={1.75} />
                </div>
                <div className="setting-info">
                  <span className="setting-title">Official Leave Announcer</span>
                  <span className="setting-desc">Publish and confirm institutional GP leaves</span>
                </div>
              </div>
              <ChevronRight size={16} strokeWidth={1.75} className="setting-arrow" />
            </button>
          )}

          {/* 7. Sign Out Button */}
          <button
            type="button"
            className="profile-signout-btn"
            onClick={logout}
          >
            <LogOut size={16} strokeWidth={1.75} />
            <span>Sign out of BIT Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
