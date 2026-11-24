import React from 'react';

export default function SkeletonLoader({ type = 'calendar' }) {
  if (type === 'home') {
    return (
      <div className="skeleton-container" aria-label="Loading content..." role="status">
        {/* Greeting skeleton */}
        <div className="skeleton-glass" style={{ width: '45%', height: '36px', marginBottom: '20px' }} />

        {/* Quick stats skeleton */}
        <div className="quick-stats-section">
          <div className="skeleton-glass" style={{ height: '88px' }} />
          <div className="skeleton-glass" style={{ height: '88px' }} />
          <div className="skeleton-glass" style={{ height: '88px' }} />
        </div>

        {/* Hero leave skeleton */}
        <div className="skeleton-glass" style={{ height: '200px', marginTop: '20px' }} />

        {/* Compact calendar skeleton */}
        <div className="skeleton-glass" style={{ height: '260px', marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <div className="skeleton-container" aria-label="Loading calendar..." role="status">
      {/* Controls skeleton */}
      <div className="skeleton-glass" style={{ height: '52px', marginBottom: '16px' }} />

      {/* Month nav skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="skeleton-glass" style={{ width: '40px', height: '40px', borderRadius: '9999px' }} />
        <div className="skeleton-glass" style={{ width: '160px', height: '32px' }} />
        <div className="skeleton-glass" style={{ width: '40px', height: '40px', borderRadius: '9999px' }} />
      </div>

      {/* Calendar grid skeleton */}
      <div className="skeleton-glass" style={{ height: '380px' }} />
    </div>
  );
}
