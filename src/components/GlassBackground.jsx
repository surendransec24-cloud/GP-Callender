import React from 'react';

/**
 * GlassBackground
 * Fixed, GPU-accelerated background with 4 slowly drifting gradient orbs
 * and a faint micro-noise texture (3% opacity) for authentic frosted glass.
 */
export default function GlassBackground() {
  return (
    <div className="glass-bg-canvas" aria-hidden="true">
      {/* 4 Drifting Gradient Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
      <div className="bg-orb orb-4" />

      {/* Micro-noise overlay for frosted depth */}
      <div className="bg-noise-overlay" />
    </div>
  );
}
