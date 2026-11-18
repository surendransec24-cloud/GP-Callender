import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <div className="offline-banner-content">
        <WifiOff size={16} strokeWidth={1.75} className="offline-icon" />
        <span className="offline-text">You are currently offline. Viewing cached BIT calendar data.</span>
      </div>
      <button 
        type="button" 
        className="offline-retry-btn" 
        onClick={() => window.location.reload()}
        aria-label="Retry connection"
      >
        <RefreshCw size={13} strokeWidth={1.75} />
        <span>Retry</span>
      </button>
    </div>
  );
}
