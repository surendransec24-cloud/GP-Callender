import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Download, 
  AlertCircle, 
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function LoginScreen() {
  const { loginWithGoogle, loginWithDemoAccount, authError, setAuthError, isFirebaseConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDemoOptions, setShowDemoOptions] = useState(true);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);

    if (!isFirebaseConfigured) {
      setAuthError(
        'Firebase OAuth is not configured with live credentials in this preview environment. You can use one of the one-click BIT evaluation accounts below to test the full student and admin experiences.'
      );
      setLoading(false);
      setShowDemoOptions(true);
      return;
    }

    try {
      await loginWithGoogle();
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (asAdmin = false) => {
    setLoading(true);
    setTimeout(() => {
      loginWithDemoAccount(asAdmin);
      setLoading(false);
    }, 250);
  };

  return (
    <div className="login-split-page">
      {/* Brand Hero Column (Desktop Left / Mobile Top) */}
      <div className="login-hero-pane">
        <div className="hero-pattern-overlay" aria-hidden="true" />
        
        <div className="hero-content-container">
          <div className="hero-badge-pill">
            <Sparkles size={14} strokeWidth={1.75} />
            <span>Academic Years 2026 – 2030</span>
          </div>

          <div className="hero-branding">
            <div className="college-crest-box">
              <span className="crest-text">BIT</span>
            </div>
            <div className="college-text-block">
              <h2 className="college-title">Bannari Amman Institute of Technology</h2>
              <p className="college-subtitle">Autonomous Institution • Sathyamangalam, Tamil Nadu</p>
            </div>
          </div>

          <div className="hero-tagline-block">
            <h1 className="hero-main-heading">Never miss a GP again.</h1>
            <p className="hero-subheading">
              The official, real-time institutional leave and holiday calendar for BIT students and faculty.
            </p>
          </div>

          {/* Feature Highlights with Crisp Icons */}
          <div className="hero-features-list">
            <div className="hero-feature-item">
              <div className="feature-icon-wrapper">
                <CalendarIcon size={18} strokeWidth={1.75} />
              </div>
              <div className="feature-text">
                <strong>Real-Time GP Leaves</strong>
                <span>Instant sync with official college announcements and AN half-day notices.</span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-wrapper">
                <Clock size={18} strokeWidth={1.75} />
              </div>
              <div className="feature-text">
                <strong>Timely Reminders</strong>
                <span>Track exact countdowns and mess closure schedules before you leave campus.</span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-wrapper">
                <Download size={18} strokeWidth={1.75} />
              </div>
              <div className="feature-text">
                <strong>1-Click Calendar Sync</strong>
                <span>Export seamlessly to Apple Calendar, Google Calendar, or Outlook via .ics.</span>
              </div>
            </div>
          </div>

          {/* Abstract Calendar Visual Preview */}
          <div className="hero-calendar-graphic-card" aria-hidden="true">
            <div className="graphic-card-header">
              <div className="graphic-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="graphic-month">November 2026</span>
              <span className="graphic-badge">Active Schedule</span>
            </div>
            <div className="graphic-card-body">
              <div className="graphic-preview-row">
                <span className="preview-label">Next Confirmed GP</span>
                <span className="preview-status">Confirmed</span>
              </div>
              <div className="graphic-leave-title">Deepavali Festival GP</div>
              <div className="graphic-leave-meta">
                <span>25 Nov (AN) → 29 Nov 2026</span>
                <span className="meta-tag">Mess Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-in Form Column (Desktop Right / Mobile Bottom) */}
      <div className="login-form-pane">
        <div className="login-card-container">
          <div className="login-card-header">
            <div className="mobile-crest-badge">BIT</div>
            <h2 className="login-heading">Welcome to BIT Calendar</h2>
            <p className="login-subtext">
              Sign in with your official college account to view schedules, active leave approvals, and sync calendar reminders.
            </p>
          </div>

          {/* Friendly Error Banner for Non-College Accounts or Warnings */}
          {authError && (
            <div className="login-alert-banner" role="alert">
              <div className="alert-icon-box">
                <AlertCircle size={18} strokeWidth={1.75} />
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
          <div className="login-action-wrapper">
            <button
              type="button"
              className="google-auth-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-label="Sign in with your college Google account"
            >
              {loading ? (
                <div className="btn-spinner" aria-label="Signing in..." />
              ) : (
                <>
                  <svg className="google-g-logo" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="google-btn-text">Sign in with your college Google account</span>
                </>
              )}
            </button>

            {/* Privacy line */}
            <div className="login-privacy-footnote">
              <ShieldCheck size={14} strokeWidth={1.75} className="shield-icon" />
              <span>Only @bitsathy.ac.in accounts are permitted. Credentials are authenticated securely.</span>
            </div>
          </div>

          {/* Quick Evaluation Accounts (for testing without live Google credentials) */}
          <div className="evaluation-section">
            <div className="divider-label">
              <span>Quick Evaluation Access</span>
            </div>

            <div className="eval-cards-grid">
              <button
                type="button"
                className="eval-card student-eval"
                onClick={() => handleDemoSignIn(false)}
                disabled={loading}
              >
                <div className="eval-icon-circle student">
                  <GraduationCap size={18} strokeWidth={1.75} />
                </div>
                <div className="eval-info">
                  <div className="eval-title-row">
                    <span className="eval-name">Student Account</span>
                    <span className="eval-pill">Student</span>
                  </div>
                  <span className="eval-email">kavitha.cs24@bitsathy.ac.in</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.75} className="eval-chevron" />
              </button>

              <button
                type="button"
                className="eval-card admin-eval"
                onClick={() => handleDemoSignIn(true)}
                disabled={loading}
              >
                <div className="eval-icon-circle admin">
                  <ShieldAlert size={18} strokeWidth={1.75} />
                </div>
                <div className="eval-info">
                  <div className="eval-title-row">
                    <span className="eval-name">Administrator</span>
                    <span className="eval-pill admin">Admin</span>
                  </div>
                  <span className="eval-email">admin@bitsathy.ac.in</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.75} className="eval-chevron" />
              </button>
            </div>
          </div>

          {/* Footer note */}
          <footer className="login-card-footer">
            <span>Bannari Amman Institute of Technology • Student Affairs</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
