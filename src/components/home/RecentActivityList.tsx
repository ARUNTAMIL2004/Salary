import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { DayRecord } from '../../types/attendance';

interface RecentActivityListProps {
  days: DayRecord[];
  todayKey: string;
  onSelectDay: (day: DayRecord) => void;
  onViewAllHistory: () => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  days,
  todayKey,
  onSelectDay,
  onViewAllHistory,
}) => {
  // Filter days strictly up to today, reverse sorted, slice recent 5 days
  const recentDays = days
    .filter((d) => !d.isFuture)
    .slice(-5)
    .reverse();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'Leave';
      case 'WO': return 'Weekly Off';
      default: return status;
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
          Recent Activity
        </div>
        <button
          onClick={onViewAllHistory}
          style={{
            fontSize: '0.78rem',
            color: '#818cf8',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recentDays.map((day) => {
          const isToday = day.dateKey === todayKey;
          return (
            <div
              key={day.dateKey}
              className="history-item-row"
              onClick={() => onSelectDay(day)}
              style={{ cursor: 'pointer', padding: '10px 14px' }}
            >
              <div className="history-left">
                <div className="history-date-badge">
                  <div className="history-date-num" style={{ fontSize: '1rem' }}>
                    {day.dayOfMonth}
                  </div>
                  <div className="history-date-day">{day.dayName}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`history-status-pill ${day.status}`}>
                      {getStatusText(day.status)}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>
                        (Today)
                      </span>
                    )}
                  </div>
                  {day.note && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={10} />
                      <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {day.note}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {day.otHours > 0 && (
                  <div className="history-ot-pill">
                    +{day.otHours}h OT
                  </div>
                )}
                <div style={{ color: '#64748b' }}>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
