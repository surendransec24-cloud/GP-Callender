import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Moon, 
  Sun, 
  Download, 
  Bell, 
  ShieldAlert,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  darkMode, 
  setDarkMode, 
  onExportAll, 
  onOpenAdmin,
  onOpenProfile,
  onShowToast
}) {
  const { currentUser, isAdmin } = useAuth();

  const handleNotificationRequest = async () => {
    if (!('Notification' in window)) {
      onShowToast('Notifications not supported on this browser');
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification('BIT Calendar Reminders Active', {
        body: 'You will receive reminders 1 day prior to upcoming GP leave & holidays.',
        icon: 'icon-192.png'
      });
      onShowToast('Notification reminder active');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('BIT Calendar Reminders Enabled', {
          body: 'You will receive reminders 1 day prior to upcoming GP leave & holidays.',
          icon: 'icon-192.png'
        });
        onShowToast('Notifications enabled');
      } else {
        onShowToast('Notification permission was denied');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Group */}
        <div className="brand-group">
          <div className="college-crest-mini" aria-hidden="true">
            <span>BIT</span>
          </div>
          <div className="brand-text-block">
            <span className="college-title-header">Bannari Amman Institute of Technology</span>
            <div className="app-title-row">
              <h1 className="app-title-header">Holiday Calendar</h1>
              <span className="app-years-chip">2026–2030</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="header-actions-group">
          {/* Admin badge / shortcut if admin */}
          {isAdmin && (
            <button
              type="button"
              className="header-admin-pill-btn"
              onClick={onOpenAdmin}
              title="Open Official Leave Announcer"
              aria-label="Admin Leave Portal"
            >
              <ShieldAlert size={14} strokeWidth={1.75} />
              <span>Admin</span>
            </button>
          )}

          {/* Export .ics */}
          <button 
            type="button" 
            className="header-icon-btn" 
            onClick={onExportAll}
            title="Download full calendar (.ics)"
            aria-label="Export all events to calendar"
          >
            <Download size={18} strokeWidth={1.75} />
          </button>

          {/* Notification Reminders */}
          <button 
            type="button" 
            className="header-icon-btn" 
            onClick={handleNotificationRequest}
            title="Toggle leave alerts"
            aria-label="Toggle notifications"
          >
            <Bell size={18} strokeWidth={1.75} />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button 
            type="button" 
            className="header-icon-btn" 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {darkMode ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
          </button>

          {/* User Profile Avatar (Opens Profile Sheet) */}
          <button 
            type="button" 
            className="header-avatar-btn" 
            onClick={onOpenProfile}
            title="Open Profile and Settings"
            aria-label="Open profile and settings"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.displayName} className="header-avatar-img" />
            ) : (
              <div className="header-avatar-fallback">
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'B'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
