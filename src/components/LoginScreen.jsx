import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Download, 
  AlertCircle
} from 'lucide-react';
import GlassBackground from './GlassBackground';

export default function LoginScreen() {
  const { loginWithGoogle, authError, setAuthError, isFirebaseConfigured } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);

    if (!isFirebaseConfigured) {
      setAuthError(
        'Firebase OAuth is not configured with live credentials. Please configure your Firebase environment variables.'
      );
      setLoading(false);
      return;
    }

    try {
      await loginWithGoogle();
    } catch (err) {
      // Error is caught and surfaced in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-glass-page">
      {/* Fixed Ambient Glass Background with Drifting Orbs */}
      <GlassBackground />

      <main className="login-card-wrapper">
        <div className="login-glass-card glass glass-interactive" role="region" aria-label="Sign In">
          {/* Top Academic Year Pill */}
          <div className="login-badge-pill glass-subtle">
            <Sparkles size={13} strokeWidth={2} />
            <span>Academic Years 2026 – 2030</span>
          </div>

          {/* Institutional Crest & Title */}
          <div className="login-brand-header">
            <div className="college-crest-glass">
              <span className="crest-initials">BIT</span>
            </div>
            <div className="college-brand-titles">
              <h2 className="college-title">Bannari Amman Institute of Technology</h2>
              <p className="college-subtitle">Autonomous Institution • Sathyamangalam</p>
            </div>
          </div>

          {/* Main Tagline & Subheading */}
          <div className="login-hero-titles">
            <h1 className="login-main-heading">Never miss a GP again.</h1>
            <p className="login-lead-text">
              The official, real-time institutional leave and holiday calendar for BIT students and faculty.
            </p>
          </div>

          {/* Feature highlights pill row */}
          <div className="login-features-grid">
            <div className="login-feature-pill glass-subtle">
              <CalendarIcon size={14} strokeWidth={1.75} />
              <span>Real-Time GP Leaves</span>
            </div>
            <div className="login-feature-pill glass-subtle">
              <Clock size={14} strokeWidth={1.75} />
              <span>Mess Schedules & Countdowns</span>
            </div>
            <div className="login-feature-pill glass-subtle">
              <Download size={14} strokeWidth={1.75} />
              <span>1-Tap Calendar Sync (.ics)</span>
            </div>
          </div>

          {/* Friendly Glass Error Banner for Non-College Accounts */}
          {authError && (
            <div className="login-glass-alert glass-subtle" role="alert">
              <div className="alert-icon-box">
                <AlertCircle size={18} strokeWidth={2} />
              </div>
              <div className="alert-content">
                <span className="alert-title">College Domain Required</span>
                <p className="alert-message">{authError}</p>
                <p className="alert-hint">
                  Please select an account ending with <code>@bitsathy.ac.in</code>. Personal Gmail addresses are not permitted.
                </p>
              </div>
            </div>
          )}

          {/* Primary Action: Official Google Sign-in Button */}
          <div className="login-action-block">
            <button
              type="button"
              className="google-glass-btn glass-pressable"
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-label="Sign in with your college Google account"
            >
              {loading ? (
                <div className="glass-btn-spinner" aria-label="Authenticating..." />
              ) : (
                <>
                  <svg className="google-g-logo" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="google-btn-text">Sign in with your college Google account</span>
                </>
              )}
            </button>

            {/* Privacy footnote */}
            <div className="login-privacy-note">
              <ShieldCheck size={14} strokeWidth={1.75} className="shield-check-icon" />
              <span>Restricted to @bitsathy.ac.in accounts. Authenticated securely via Google.</span>
            </div>
          </div>

          {/* Institutional Footer */}
          <footer className="login-card-footer">
            <span>Bannari Amman Institute of Technology • Student Affairs</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
