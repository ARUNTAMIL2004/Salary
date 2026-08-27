import React, { useState } from 'react';
import { X, Clock, Check, XCircle, Coffee, Palmtree, RotateCcw, FileText } from 'lucide-react';
import { AttendanceStatus, DayRecord, SalarySettings } from '../../types/attendance';

interface QuickStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayRecord: DayRecord;
  settings: SalarySettings;
  onSave: (dateKey: string, status: AttendanceStatus, otHours: number, note?: string) => void;
  onResetToAuto?: (dateKey: string) => void;
}

export const QuickStatusModal: React.FC<QuickStatusModalProps> = ({
  isOpen,
  onClose,
  dayRecord,
  settings,
  onSave,
  onResetToAuto,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(dayRecord.status === 'Upcoming' ? 'P' : dayRecord.status);
  const [otHours, setOtHours] = useState<number>(dayRecord.otHours || 0);
  const [note, setNote] = useState<string>(dayRecord.note || '');

  if (!isOpen) return null;

  const quickOtChips = [0, 1, 1.5, 2, 2.5, 3, 4, 8];
  const otEarnings = Math.round(otHours * settings.otRate);

  const handleStatusClick = (status: AttendanceStatus) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    onSave(dayRecord.dateKey, selectedStatus, otHours, note);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-sheet-header">
          <div>
            <h3 className="modal-sheet-title">{dayRecord.isToday ? "Today's Attendance" : "Edit Attendance"}</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              {dayRecord.fullDateStr}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 4 Large 1-Tap Status Choice Buttons */}
        <div style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Status
        </div>
        <div className="status-buttons-grid">
          <button
            className={`status-choice-btn present ${selectedStatus === 'P' ? 'selected' : ''}`}
            onClick={() => handleStatusClick('P')}
          >
            <div className="choice-symbol">
              <Check size={22} strokeWidth={3} />
            </div>
            <span>PRESENT</span>
          </button>

          <button
            className={`status-choice-btn absent ${selectedStatus === 'A' ? 'selected' : ''}`}
            onClick={() => handleStatusClick('A')}
          >
            <div className="choice-symbol">
              <XCircle size={22} strokeWidth={2.5} />
            </div>
            <span>ABSENT</span>
          </button>

          <button
            className={`status-choice-btn leave ${selectedStatus === 'L' ? 'selected' : ''}`}
            onClick={() => handleStatusClick('L')}
          >
            <div className="choice-symbol">
              <Palmtree size={22} strokeWidth={2.5} />
            </div>
            <span>LEAVE</span>
          </button>

          <button
            className={`status-choice-btn wo ${selectedStatus === 'WO' ? 'selected' : ''}`}
            onClick={() => handleStatusClick('WO')}
          >
            <div className="choice-symbol">
              <Coffee size={22} strokeWidth={2.5} />
            </div>
            <span>WEEKLY OFF</span>
          </button>
        </div>

        {/* Overtime (OT) Section */}
        <div className="ot-section-box">
          <div className="ot-section-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Overtime (OT) Hours
            </span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>
              = ₹{otEarnings.toLocaleString('en-IN')}
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>
                (@₹{settings.otRate}/h)
              </span>
            </span>
          </div>

          <div className="ot-chips-row">
            {quickOtChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`ot-chip-btn ${otHours === chip ? 'active' : ''}`}
                onClick={() => setOtHours(chip)}
              >
                {chip === 0 ? 'No OT' : `+${chip}h`}
              </button>
            ))}
          </div>

          <div className="ot-input-stepper">
            <button
              type="button"
              className="btn-stepper"
              onClick={() => setOtHours((prev) => Math.max(0, parseFloat((prev - 0.5).toFixed(1))))}
            >
              -
            </button>
            <div className="ot-num-display">
              {otHours} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>hrs</span>
            </div>
            <button
              type="button"
              className="btn-stepper"
              onClick={() => setOtHours((prev) => parseFloat((prev + 0.5).toFixed(1)))}
            >
              +
            </button>
          </div>
        </div>

        {/* Optional Notes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
            <FileText size={14} /> Optional Note / Reason
          </label>
          <input
            type="text"
            placeholder="e.g. Production night shift, Doctor visit, Half day..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%' }}
            maxLength={100}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {dayRecord.isManualOverride && onResetToAuto && (
            <button
              type="button"
              onClick={() => {
                onResetToAuto(dayRecord.dateKey);
                onClose();
              }}
              style={{
                flex: '0 0 auto',
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
              title="Revert to auto calculated status"
            >
              <RotateCcw size={16} /> Auto
            </button>
          )}

          <button
            type="button"
            className="btn-primary-action"
            onClick={handleSave}
            style={{ flex: 1 }}
          >
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
};
