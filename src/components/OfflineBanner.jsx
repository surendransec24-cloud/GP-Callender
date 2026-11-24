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
    <div className="offline-banner-glass" role="status" aria-live="polite">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <WifiOff size={15} strokeWidth={2} />
        <span>You are currently offline. Viewing cached BIT calendar data.</span>
      </div>
      <button 
        type="button" 
        onClick={() => window.location.reload()}
        aria-label="Retry connection"
        style={{ marginLeft: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '9999px', color: 'inherit', fontSize: '11px', fontWeight: 'bold' }}
      >
        Retry
      </button>
    </div>
  );
}
