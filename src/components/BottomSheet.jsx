import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Utensils, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Share2, 
  Clock, 
  MapPin,
  ExternalLink,
  Copy,
  Check,
  CheckCheck
} from 'lucide-react';
import { formatFullDate, formatHumanDate } from '../services/leavesService';
import { generateIcs, downloadIcsFile } from '../utils/icsExport';
import { LEAVE_PORTAL_URL } from '../config';

export default function BottomSheet({ dateKey, dayData, onClose, onShowToast }) {
  const [copiedDates, setCopiedDates] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const sheetRef = useRef(null);
  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!dateKey) return null;

  const hasEvents = dayData && dayData.events && dayData.events.length > 0;
  const primaryEvent = hasEvents ? dayData.events[0] : null;

  // Check if this day is part of a GP period
  const isGPPeriod = Boolean(dayData?.isGP || primaryEvent?.type === 'GP');
  const gpEvent = isGPPeriod 
    ? (dayData?.events?.find(e => e.type === 'GP') || (primaryEvent?.type === 'GP' ? primaryEvent : null))
    : null;

  // Generate range text for clipboard, e.g. "25 Jun 2026 (AN) to 29 Jun 2026"
  const gpRangeString = gpEvent 
    ? `${formatHumanDate(gpEvent.startDate, false)}${gpEvent.startAN ? ' (AN)' : ''} to ${formatHumanDate(gpEvent.endDate, false)}`
    : formatFullDate(dateKey);

  // Copy dates with animated feedback
  const handleCopyDates = () => {
    const copyText = gpRangeString;

    const setSuccess = () => {
      setCopiedDates(true);
      setShowConfetti(true);
      onShowToast(`Dates copied: "${copyText}"`);
      setTimeout(() => setShowConfetti(false), 1200);
      setTimeout(() => setCopiedDates(false), 2400);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyText)
        .then(setSuccess)
        .catch(() => {
          fallbackCopy(copyText);
          setSuccess();
        });
    } else {
      fallbackCopy(copyText);
      setSuccess();
    }
  };

  const fallbackCopy = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(el);
  };

  // Export event to .ics
  const handleExportThisEvent = () => {
    if (!primaryEvent) return;
    const ics = generateIcs([primaryEvent.raw || primaryEvent], primaryEvent.name);
    const sanitizedName = (primaryEvent.name || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
    downloadIcsFile(`BIT_${sanitizedName}.ics`, ics);
    onShowToast(`Exported ${primaryEvent.name} to calendar (.ics)`);
  };

  // Share event
  const handleShare = async () => {
    const title = primaryEvent ? `BIT Leave: ${primaryEvent.name}` : `BIT Calendar: ${dateKey}`;
    const text = primaryEvent 
      ? `${primaryEvent.name} (${primaryEvent.startDate}${primaryEvent.isRange ? ' to ' + primaryEvent.endDate : ''}) at Bannari Amman Institute of Technology.`
      : `Schedule for ${dateKey} at Bannari Amman Institute of Technology.`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${title}\n${text}\n${window.location.href}`)
        .then(() => onShowToast('Details copied to clipboard'))
        .catch(() => onShowToast('Sharing not available'));
    }
  };

  // Touch handlers for swipe-down to dismiss
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY.current;
    if (delta > 0 && sheetRef.current) {
      touchDeltaY.current = delta;
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (touchDeltaY.current > 110) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    touchDeltaY.current = 0;
  };

  // Determine Chip type
  let headerChip = null;
  if (primaryEvent?.type === 'HOLIDAY') {
    headerChip = { label: 'Public Holiday', className: 'chip-holiday' };
  } else if (primaryEvent?.type === 'GP') {
    headerChip = { label: primaryEvent.festival ? 'GP + Festival' : 'GP Leave', className: primaryEvent.festival ? 'chip-festival' : 'chip-gp' };
  } else if (dayData?.hasMessClosure) {
    headerChip = { label: 'Mess Closure', className: 'chip-mess' };
  }

  const isConfirmed = primaryEvent?.status === 'Confirmed';

  return (
    <div 
      className="bottom-sheet-backdrop active" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Date details sheet"
    >
      <div 
        ref={sheetRef}
        className="bottom-sheet-container" 
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle Bar */}
        <div className="sheet-drag-handle-bar" aria-hidden="true">
          <div className="sheet-drag-pill" />
        </div>

        {/* Top Header Row */}
        <div className="sheet-header-row">
          <div className="sheet-header-badges">
            {headerChip && (
              <span className={`sheet-category-chip ${headerChip.className}`}>
                {headerChip.label}
              </span>
            )}

            {primaryEvent && (
              <span className={`sheet-status-badge ${isConfirmed ? 'confirmed' : 'tentative'}`}>
                {isConfirmed ? (
                  <>
                    <CheckCircle2 size={12} strokeWidth={1.75} />
                    <span>Confirmed</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} strokeWidth={1.75} />
                    <span>Tentative</span>
                  </>
                )}
              </span>
            )}
          </div>

          <button 
            type="button" 
            className="sheet-close-btn" 
            onClick={onClose}
            aria-label="Close date details"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Title & Human Date */}
        <div className="sheet-title-section">
          <h2 className="sheet-main-title">
            {primaryEvent ? (primaryEvent.name || (primaryEvent.festival?.name ? `${primaryEvent.festival.name} GP Leave` : 'GP Leave')) : 'Normal Working Day'}
          </h2>
          <span className="sheet-date-subtitle tabular-nums">
            {formatFullDate(dateKey)}
          </span>
        </div>

        {/* Detailed Information Rows */}
        <div className="sheet-info-rows">
          {primaryEvent?.isRange ? (
            <div className="sheet-info-item">
              <div className="info-icon-box">
                <Calendar size={17} strokeWidth={1.75} />
              </div>
              <div className="info-content">
                <span className="info-label">Leave Duration</span>
                <span className="info-value tabular-nums">
                  {formatHumanDate(primaryEvent.startDate, false)}
                  {primaryEvent.startAN ? ' (AN Departure)' : ''}
                  {' → '}
                  {formatHumanDate(primaryEvent.endDate, false)}
                </span>
              </div>
            </div>
          ) : (
            <div className="sheet-info-item">
              <div className="info-icon-box">
                <Calendar size={17} strokeWidth={1.75} />
              </div>
              <div className="info-content">
                <span className="info-label">Date</span>
                <span className="info-value tabular-nums">
                  {formatHumanDate(dateKey, false)}
                </span>
              </div>
            </div>
          )}

          {primaryEvent?.startAN && (
            <div className="sheet-info-item an-notice-row">
              <div className="info-icon-box an">
                <Clock size={17} strokeWidth={1.75} />
              </div>
              <div className="info-content">
                <span className="info-label">Afternoon (AN) Half-Day</span>
                <span className="info-value">
                  Leave begins in the afternoon session after morning classes.
                </span>
              </div>
            </div>
          )}

          {dayData?.hasMessClosure && dayData.messClosure && (
            <div className="sheet-info-item mess-notice-row">
              <div className="info-icon-box mess">
                <Utensils size={17} strokeWidth={1.75} />
              </div>
              <div className="info-content">
                <span className="info-label">Hostel Mess Closure</span>
                <span className="info-value">
                  Dining halls will be closed from {formatHumanDate(dayData.messClosure.from, false)} to {formatHumanDate(dayData.messClosure.to, false)}.
                </span>
              </div>
            </div>
          )}

          <div className="sheet-info-item">
            <div className="info-icon-box">
              <MapPin size={17} strokeWidth={1.75} />
            </div>
            <div className="info-content">
              <span className="info-label">Location / Jurisdiction</span>
              <span className="info-value">
                Bannari Amman Institute of Technology, Sathyamangalam
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sheet-actions-stack">
          {/* Apply for GP Button (Only for GP leave or active dates) */}
          {isGPPeriod && (
            <a
              href={LEAVE_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sheet-primary-apply-btn"
              title="Open BIT Leave Portal"
            >
              <span>Apply for this GP</span>
              <ExternalLink size={16} strokeWidth={1.75} />
            </a>
          )}

          {/* Secondary Actions Row */}
          <div className="sheet-secondary-btns-row">
            {/* Copy Dates Button with Spring & Confetti animation */}
            <button
              type="button"
              className={`sheet-secondary-btn copy-btn ${copiedDates ? 'copied' : ''}`}
              onClick={handleCopyDates}
              aria-label="Copy leave dates to clipboard"
            >
              {copiedDates ? (
                <>
                  <Check size={16} strokeWidth={2.2} className="check-animated" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} strokeWidth={1.75} />
                  <span>Copy Dates</span>
                </>
              )}

              {/* Confetti burst indicator */}
              {showConfetti && (
                <span className="confetti-particles" aria-hidden="true">
                  <span className="particle p1" />
                  <span className="particle p2" />
                  <span className="particle p3" />
                  <span className="particle p4" />
                </span>
              )}
            </button>

            {/* Export .ics */}
            {primaryEvent && (
              <button
                type="button"
                className="sheet-secondary-btn"
                onClick={handleExportThisEvent}
                title="Export event to .ics file"
                aria-label="Download calendar event file"
              >
                <Download size={16} strokeWidth={1.75} />
                <span>Export .ics</span>
              </button>
            )}

            {/* Share Details */}
            <button
              type="button"
              className="sheet-secondary-btn"
              onClick={handleShare}
              title="Share event details"
              aria-label="Share details"
            >
              <Share2 size={16} strokeWidth={1.75} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
