import React from 'react';

export default function SkeletonLoader({ type = 'calendar' }) {
  if (type === 'home') {
    return (
      <div className="skeleton-container" aria-label="Loading content..." role="status">
        {/* Greeting skeleton */}
        <div className="skeleton-line skeleton-title" style={{ width: '45%', height: '36px', marginBottom: '20px' }} />

        {/* Quick stats skeleton */}
        <div className="skeleton-stats-grid">
          <div className="skeleton-card skeleton-stat-box" />
          <div className="skeleton-card skeleton-stat-box" />
          <div className="skeleton-card skeleton-stat-box" />
        </div>

        {/* Hero leave skeleton */}
        <div className="skeleton-card skeleton-hero-box" style={{ height: '180px', marginTop: '20px' }} />

        {/* Compact calendar skeleton */}
        <div className="skeleton-card skeleton-compact-box" style={{ height: '260px', marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <div className="skeleton-container" aria-label="Loading calendar..." role="status">
      {/* Controls skeleton */}
      <div className="skeleton-card" style={{ height: '48px', marginBottom: '16px' }} />

      {/* Month nav skeleton */}
      <div className="skeleton-nav-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="skeleton-circle" style={{ width: '36px', height: '36px' }} />
        <div className="skeleton-line" style={{ width: '160px', height: '28px' }} />
        <div className="skeleton-circle" style={{ width: '36px', height: '36px' }} />
      </div>

      {/* Calendar grid skeleton */}
      <div className="skeleton-card skeleton-grid-box" style={{ height: '380px' }}>
        <div className="skeleton-grid-lines" />
      </div>
    </div>
  );
}
