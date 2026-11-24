import React from 'react';
import { 
  AlertTriangle, 
  KeyRound, 
  ExternalLink, 
  RotateCw, 
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export default function ConfigErrorScreen() {
  const handleReload = () => {
    window.location.reload();
  };

  const requiredSecrets = [
    { name: 'VITE_FIREBASE_API_KEY', desc: 'Firebase Web API Key from Firebase Console' },
    { name: 'VITE_FIREBASE_AUTH_DOMAIN', desc: '<project-id>.firebaseapp.com' },
    { name: 'VITE_FIREBASE_PROJECT_ID', desc: 'Firebase Project ID' },
    { name: 'VITE_FIREBASE_APP_ID', desc: 'Firebase Web App ID (1:xxx:web:xxx)' },
    { name: 'VITE_FIREBASE_STORAGE_BUCKET', desc: '<project-id>.firebasestorage.app' },
    { name: 'VITE_FIREBASE_MESSAGING_SENDER_ID', desc: 'Firebase Cloud Messaging Sender ID' }
  ];

  return (
    <div className="config-error-page" role="alert" aria-live="assertive">
      <div className="config-error-container">
        {/* Header with College Crest */}
        <div className="config-error-header">
          <div className="college-crest-mini" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
            BIT
          </div>
          <div className="config-badge">
            <ShieldAlert size={14} strokeWidth={2} />
            <span>Configuration Error</span>
          </div>
          <h1 className="config-title">Firebase Credentials Missing</h1>
          <p className="config-subtitle">
            This production build of the <strong>BIT Holiday Calendar</strong> was deployed without live Firebase configuration. Google authentication and cloud synchronization are disabled until secrets are configured.
          </p>
        </div>

        {/* Diagnostic Card */}
        <div className="config-card">
          <div className="config-card-title">
            <KeyRound size={16} strokeWidth={2} />
            <span>Required GitHub Actions Secrets</span>
          </div>
          <p className="config-card-desc">
            The build step in <code>.github/workflows/deploy.yml</code> requires the following secrets in GitHub Repository Settings:
          </p>
          <div className="config-secrets-list">
            {requiredSecrets.map(sec => (
              <div key={sec.name} className="config-secret-item">
                <code className="secret-code">{sec.name}</code>
                <span className="secret-desc">{sec.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Resolution */}
        <div className="config-steps-card">
          <h2 className="steps-heading">How to Fix (for Repository Admins):</h2>
          <ol className="steps-ordered-list">
            <li>
              Open your GitHub repository → <strong>Settings</strong> → <strong>Secrets and variables</strong> → <strong>Actions</strong>.
            </li>
            <li>
              Click <strong>New repository secret</strong> and add the values from your Firebase Console (Project Settings → General → Web Apps).
            </li>
            <li>
              In <strong>Firebase Console → Authentication → Settings → Authorized domains</strong>, add:
              <br />
              <code className="inline-domain">surendransec24-cloud.github.io</code>
            </li>
            <li>
              Go to the <strong>Actions</strong> tab on GitHub and re-run the <strong>Deploy to GitHub Pages</strong> workflow.
            </li>
          </ol>
        </div>

        {/* Action Controls */}
        <div className="config-actions">
          <button 
            type="button" 
            className="config-reload-btn"
            onClick={handleReload}
          >
            <RotateCw size={16} strokeWidth={2} />
            <span>Check Again / Reload</span>
          </button>
          <a
            href="https://github.com/surendransec24-cloud/GP-Callender/settings/secrets/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="config-settings-link"
          >
            <span>Open Repository Secrets</span>
            <ExternalLink size={14} strokeWidth={1.75} />
          </a>
        </div>

        <footer className="config-footer">
          Bannari Amman Institute of Technology • Student Affairs System
        </footer>
      </div>
    </div>
  );
}
