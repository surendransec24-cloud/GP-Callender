import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Utensils,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { saveGpLeave, formatHumanDate, getCustomGpsFromLocal } from '../services/leavesService';

export default function AdminModal({ onClose, onLeaveSaved, onShowToast }) {
  const [start, setStart] = useState('');
  const [startAN, setStartAN] = useState(true);
  const [end, setEnd] = useState('');
  const [festivalName, setFestivalName] = useState('');
  const [festivalDate, setFestivalDate] = useState('');
  const [hasMessClosure, setHasMessClosure] = useState(false);
  const [messFrom, setMessFrom] = useState('');
  const [messTo, setMessTo] = useState('');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load custom GP leaves for management
  const [customList, setCustomList] = useState(getCustomGpsFromLocal());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!start || !end) {
      setFormError('Please select both Start Date and End Date for the GP.');
      return;
    }
    if (start > end) {
      setFormError('Start Date cannot be after End Date.');
      return;
    }
    if (hasMessClosure && (!messFrom || !messTo)) {
      setFormError('Please provide both Mess Closure From and To dates, or uncheck the mess closure option.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: 'GP',
        start,
        startAN: Boolean(startAN),
        end,
        status: 'Confirmed'
      };

      if (festivalName.trim()) {
        payload.festival = {
          name: festivalName.trim(),
          ...(festivalDate ? { date: festivalDate } : {})
        };
      }

      if (hasMessClosure && messFrom.trim() && messTo.trim()) {
        payload.messClosure = {
          from: messFrom.trim(),
          to: messTo.trim()
        };
      }

      await saveGpLeave(payload);
      onShowToast('New GP Leave successfully published!');
      onLeaveSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save GP leave: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocal = (id) => {
    const updated = customList.filter(c => c.id !== id);
    localStorage.setItem('bit_calendar_custom_gps_v2', JSON.stringify(updated));
    setCustomList(updated);
    onShowToast('Removed custom leave entry');
    onLeaveSaved();
  };

  return (
    <div
      className="bottom-sheet-backdrop active"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Admin leave management"
    >
      <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
        <div className="sheet-drag-handle-bar" aria-hidden="true">
          <div className="sheet-drag-pill" />
        </div>

        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-title-row">
            <span className="admin-shield-badge">
              <ShieldAlert size={14} strokeWidth={1.75} />
              <span>Admin Portal</span>
            </span>
            <h3 className="admin-modal-title">Announce Official GP Leave</h3>
          </div>
          <button
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Close admin modal"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="admin-form-intro">
          <p>
            Publish officially approved General Permission (GP) leaves. Confirmed entries automatically synchronize across student devices.
          </p>
        </div>

        {formError && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={16} strokeWidth={1.75} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Dates Grid */}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="admin-start-date" className="form-label">Leave Start Date *</label>
              <input
                id="admin-start-date"
                type="date"
                className="form-input tabular-nums"
                value={start}
                onChange={e => setStart(e.target.value)}
                min="2026-01-01"
                max="2030-12-31"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-end-date" className="form-label">Leave End Date *</label>
              <input
                id="admin-end-date"
                type="date"
                className="form-input tabular-nums"
                value={end}
                onChange={e => setEnd(e.target.value)}
                min="2026-01-01"
                max="2030-12-31"
                required
              />
            </div>
          </div>

          {/* AN Departure Checkbox */}
          <div className="form-checkbox-row">
            <label className="checkbox-label-container">
              <input
                type="checkbox"
                checked={startAN}
                onChange={e => setStartAN(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom" />
              <div className="checkbox-text">
                <span className="checkbox-title">Afternoon (AN) Half-Day Departure</span>
                <span className="checkbox-desc">Students may leave campus after morning classes</span>
              </div>
            </label>
          </div>

          {/* Festival Info */}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="admin-fest-name" className="form-label">Associated Festival (Optional)</label>
              <input
                id="admin-fest-name"
                type="text"
                className="form-input"
                placeholder="e.g. Deepavali, Pongal"
                value={festivalName}
                onChange={e => setFestivalName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-fest-date" className="form-label">Festival Peak Date</label>
              <input
                id="admin-fest-date"
                type="date"
                className="form-input tabular-nums"
                value={festivalDate}
                onChange={e => setFestivalDate(e.target.value)}
                min="2026-01-01"
                max="2030-12-31"
              />
            </div>
          </div>

          {/* Mess Closure Toggle */}
          <div className="form-mess-section">
            <label className="checkbox-label-container">
              <input
                type="checkbox"
                checked={hasMessClosure}
                onChange={e => setHasMessClosure(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom" />
              <div className="checkbox-text">
                <span className="checkbox-title">Hostel Dining Mess Closed</span>
                <span className="checkbox-desc">Mess catering paused during this leave period</span>
              </div>
            </label>

            {hasMessClosure && (
              <div className="form-grid-2 sub-grid">
                <div className="form-group">
                  <label htmlFor="admin-mess-from" className="form-label">Mess Closed From</label>
                  <input
                    id="admin-mess-from"
                    type="date"
                    className="form-input tabular-nums"
                    value={messFrom}
                    onChange={e => setMessFrom(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-mess-to" className="form-label">Mess Closed To</label>
                  <input
                    id="admin-mess-to"
                    type="date"
                    className="form-input tabular-nums"
                    value={messTo}
                    onChange={e => setMessTo(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions-row">
            <button
              type="button"
              className="form-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="form-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Confirmed GP'}
            </button>
          </div>
        </form>

        {/* Existing Custom GP Leaves */}
        {customList.length > 0 && (
          <div className="admin-custom-list-section">
            <h4 className="custom-list-heading">Previously Announced Custom Leaves ({customList.length})</h4>
            <div className="custom-items-stack">
              {customList.map((c) => (
                <div key={c.id} className="custom-leave-row">
                  <div className="custom-leave-info">
                    <span className="custom-leave-name">{c.festival?.name || 'GP Leave'}</span>
                    <span className="custom-leave-dates tabular-nums">
                      {formatHumanDate(c.start, false)} {c.startAN ? '(AN)' : ''} → {formatHumanDate(c.end, false)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="custom-delete-btn"
                    onClick={() => handleDeleteLocal(c.id)}
                    title="Remove custom GP leave"
                    aria-label={`Delete custom leave ${c.festival?.name || 'GP Leave'}`}
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
