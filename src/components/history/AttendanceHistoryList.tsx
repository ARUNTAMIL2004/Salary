import React, { useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { DayRecord, SalaryCalculationResult } from '../../types/attendance';

interface AttendanceHistoryListProps {
  salaryResult: SalaryCalculationResult;
  todayKey: string;
  onSelectDay: (day: DayRecord) => void;
}

export const AttendanceHistoryList: React.FC<AttendanceHistoryListProps> = ({
  salaryResult,
  todayKey,
  onSelectDay,
}) => {
  const [filter, setFilter] = useState<'all' | 'P' | 'A' | 'WO' | 'OT'>('all');

  // Filter out future dates from history list, reverse chronological order
  const pastAndTodayDays = salaryResult.days
    .filter((d) => !d.isFuture)
    .reverse();

  const filteredDays = pastAndTodayDays.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'OT') return d.otHours > 0;
    return d.status === filter;
  });

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
    <div className="page-view">
      {/* Header & Stats Banner */}
      <div className="glass-card">
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
          Attendance History
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
          {salaryResult.cycleInfo.monthName}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginTop: '2px' }}>
          {salaryResult.cycleInfo.label}
        </div>

        {/* Quick Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '14px', paddingBottom: '4px' }}>
          <button
            className={`ot-chip-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({pastAndTodayDays.length})
          </button>
          <button
            className={`ot-chip-btn ${filter === 'P' ? 'active' : ''}`}
            onClick={() => setFilter('P')}
          >
            Present ({salaryResult.presentDays})
          </button>
          <button
            className={`ot-chip-btn ${filter === 'A' ? 'active' : ''}`}
            onClick={() => setFilter('A')}
          >
            Absent ({salaryResult.absentDays})
          </button>
          <button
            className={`ot-chip-btn ${filter === 'WO' ? 'active' : ''}`}
            onClick={() => setFilter('WO')}
          >
            Weekly Off ({salaryResult.weeklyOffDays})
          </button>
          <button
            className={`ot-chip-btn ${filter === 'OT' ? 'active' : ''}`}
            onClick={() => setFilter('OT')}
          >
            OT Days ({salaryResult.days.filter((d) => !d.isFuture && d.otHours > 0).length})
          </button>
        </div>
      </div>

      {/* History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredDays.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8' }}>
            No records match the selected filter.
          </div>
        ) : (
          filteredDays.map((day) => {
            const isToday = day.dateKey === todayKey;
            return (
              <div
                key={day.dateKey}
                className="history-item-row"
                onClick={() => onSelectDay(day)}
                style={{ cursor: 'pointer' }}
              >
                <div className="history-left">
                  <div className="history-date-badge">
                    <div className="history-date-num">{day.dayOfMonth}</div>
                    <div className="history-date-day">{day.dayName}</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`history-status-pill ${day.status}`}>
                        {getStatusText(day.status)}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
                          (Today)
                        </span>
                      )}
                      {day.isManualOverride && (
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 5px', borderRadius: '4px' }}>
                          Manual
                        </span>
                      )}
                    </div>

                    {day.note && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={11} color="#38bdf8" />
                        <span>{day.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {day.otHours > 0 && (
                    <div className="history-ot-pill">
                      +{day.otHours}h (+₹{day.otAmount})
                    </div>
                  )}
                  <ArrowRight size={14} color="#64748b" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
