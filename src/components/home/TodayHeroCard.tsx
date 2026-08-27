import React from 'react';
import {
  Check,
  XCircle,
  Coffee,
  Palmtree,
  Clock,
  Edit3,
  Sparkles,
  PlusCircle,
  FileText,
  UserX,
} from 'lucide-react';
import { DayRecord, SalarySettings } from '../../types/attendance';
import { getTimeGreeting } from '../../utils/dateUtils';

interface TodayHeroCardProps {
  todayRecord: DayRecord;
  settings: SalarySettings;
  onOpenStatusModal: () => void;
  onQuickAbsent: () => void;
}

export const TodayHeroCard: React.FC<TodayHeroCardProps> = ({
  todayRecord,
  settings,
  onOpenStatusModal,
  onQuickAbsent,
}) => {
  const greeting = getTimeGreeting();

  const getStatusLabel = () => {
    switch (todayRecord.status) {
      case 'P':
        return 'PRESENT';
      case 'A':
        return 'ABSENT';
      case 'L':
        return 'ON LEAVE';
      case 'WO':
        return 'WEEKLY OFF';
      default:
        return 'PRESENT';
    }
  };

  const getStatusIcon = () => {
    switch (todayRecord.status) {
      case 'P':
        return <Check size={24} strokeWidth={3} />;
      case 'A':
        return <XCircle size={24} strokeWidth={2.5} />;
      case 'L':
        return <Palmtree size={24} strokeWidth={2.5} />;
      case 'WO':
        return <Coffee size={24} strokeWidth={2.5} />;
      default:
        return <Check size={24} strokeWidth={3} />;
    }
  };

  return (
    <div className="today-hero-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="today-greeting">{greeting}</div>
          <div className="today-date-text">{todayRecord.fullDateStr}</div>
        </div>

        {todayRecord.isManualOverride ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#cbd5e1',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} color="#38bdf8" />
            <span>Updated</span>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            ● Auto Checked
          </div>
        )}
      </div>

      {/* Big Visual Status Banner */}
      <div className={`today-status-banner status-${todayRecord.status}`}>
        <div className="status-badge-content">
          <div className="status-icon-circle">{getStatusIcon()}</div>
          <div className="status-title-group">
            <h2>{getStatusLabel()}</h2>
            <span>
              {todayRecord.isManualOverride ? 'Manually changed' : 'Automatically recorded'}
            </span>
          </div>
        </div>

        <button
          className="btn-change-status"
          onClick={onOpenStatusModal}
          aria-label="Change Status"
        >
          <Edit3 size={14} />
          <span>Change</span>
        </button>
      </div>

      {/* OT Today Mini Box */}
      <div className="ot-widget">
        <div className="ot-info-left">
          <div className="ot-icon-badge">
            <Clock size={18} />
          </div>
          <div>
            <div className="ot-title-text">OT Today</div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="ot-value-text">{todayRecord.otHours || 0} hrs</span>
              {todayRecord.otHours > 0 && (
                <span className="ot-earnings-tag">
                  (+₹{(todayRecord.otHours * settings.otRate).toLocaleString('en-IN')})
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          className="btn-add-ot"
          onClick={onOpenStatusModal}
          aria-label="Add or Edit Overtime"
        >
          <PlusCircle size={15} />
          <span>{todayRecord.otHours > 0 ? 'Edit OT' : '+ Add OT'}</span>
        </button>
      </div>

      {/* Optional Note Preview */}
      {todayRecord.note && (
        <div
          style={{
            marginTop: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: '#cbd5e1',
          }}
        >
          <FileText size={15} color="#38bdf8" />
          <span style={{ fontStyle: 'italic' }}>"{todayRecord.note}"</span>
        </div>
      )}

      {/* Quick Action: Mark Absent Button (if currently Present) */}
      {todayRecord.status === 'P' && (
        <div style={{ marginTop: '14px' }}>
          <button
            type="button"
            className="btn-quick-action danger"
            onClick={onQuickAbsent}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <UserX size={16} />
            <span>Mark Today Absent (1-Tap)</span>
          </button>
        </div>
      )}
    </div>
  );
};
