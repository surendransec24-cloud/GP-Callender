import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const YEARS = [2026, 2027, 2028, 2029, 2030];

export default function MonthPickerModal({ currentYear, currentMonth, onSelectMonth, onClose }) {
  const [pickerYear, setPickerYear] = useState(currentYear);

  return (
    <div 
      className="bottom-sheet-backdrop active" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Month and year picker"
    >
      <div className="month-picker-sheet-card" onClick={e => e.stopPropagation()}>
        <div className="sheet-drag-handle-bar" aria-hidden="true">
          <div className="sheet-drag-pill" />
        </div>

        {/* Header */}
        <div className="picker-header-row">
          <div className="picker-title-block">
            <h3 className="picker-dialog-title">Jump to Date</h3>
            <span className="picker-dialog-sub">Select academic year and month</span>
          </div>

          <button 
            type="button" 
            className="sheet-close-btn" 
            onClick={onClose}
            aria-label="Close month picker"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Year Pills Row */}
        <div className="picker-years-scroller" role="tablist" aria-label="Select year">
          {YEARS.map(y => (
            <button
              key={y}
              type="button"
              role="tab"
              aria-selected={pickerYear === y}
              className={`year-chip-btn ${pickerYear === y ? 'active' : ''}`}
              onClick={() => setPickerYear(y)}
            >
              <span className="tabular-nums">{y}</span>
            </button>
          ))}
        </div>

        {/* 12 Months Grid */}
        <div className="picker-months-grid" role="grid" aria-label="Months">
          {MONTH_SHORT.map((name, idx) => {
            const mNum = idx + 1;
            const isSelected = (pickerYear === currentYear && mNum === currentMonth);
            return (
              <button
                key={mNum}
                type="button"
                className={`picker-month-cell ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectMonth(pickerYear, mNum);
                  onClose();
                }}
                role="gridcell"
                aria-label={`${MONTH_NAMES[idx]} ${pickerYear}${isSelected ? ', currently selected' : ''}`}
              >
                <span className="month-abbr">{name}</span>
                <span className="month-full-name">{MONTH_NAMES[idx]}</span>
                {isSelected && (
                  <span className="selected-indicator-icon" aria-hidden="true">
                    <Check size={14} strokeWidth={2.2} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
