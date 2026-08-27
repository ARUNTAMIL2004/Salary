import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceOverrides, DayRecord, SalarySettings } from '../../types/attendance';
import { getLocalDateKey, parseDateKey } from '../../utils/dateUtils';
import { deriveDayRecord } from '../../utils/salaryCalculator';

interface MonthCalendarProps {
  todayKey: string;
  overrides: AttendanceOverrides;
  settings: SalarySettings;
  onSelectDay: (dayRecord: DayRecord) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  todayKey,
  overrides,
  settings,
  onSelectDay,
}) => {
  const todayDate = parseDateKey(todayKey);
  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-11

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const td = parseDateKey(todayKey);
    setCurrentYear(td.getFullYear());
    setCurrentMonth(td.getMonth());
  };

  // Generate calendar grid dates
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0=Sunday, 1=Monday...

  // Days from previous month to fill the first row
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const calendarCells: { dateKey: string; isCurrentMonth: boolean }[] = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
    calendarCells.push({
      dateKey: getLocalDateKey(prevDate),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const curDate = new Date(currentYear, currentMonth, day);
    calendarCells.push({
      dateKey: getLocalDateKey(curDate),
      isCurrentMonth: true,
    });
  }

  // Fill remaining cells of 35 or 42 grid
  const remainingCells = 42 - calendarCells.length;
  if (remainingCells > 0 && remainingCells < 7) {
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      calendarCells.push({
        dateKey: getLocalDateKey(nextDate),
        isCurrentMonth: false,
      });
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="page-view">
      <div className="calendar-card">
        {/* Calendar Nav Header */}
        <div className="calendar-header-nav">
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Monthly Calendar
            </div>
            <div className="calendar-month-title">
              {months[currentMonth]} {currentYear}
            </div>
          </div>

          <div className="calendar-nav-arrows">
            <button
              onClick={handleGoToToday}
              style={{
                fontSize: '0.75rem',
                color: '#38bdf8',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontWeight: 700,
                marginRight: '4px',
              }}
            >
              Today
            </button>
            <button className="btn-cal-nav" onClick={handlePrevMonth} aria-label="Previous Month">
              <ChevronLeft size={18} />
            </button>
            <button className="btn-cal-nav" onClick={handleNextMonth} aria-label="Next Month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="calendar-days-header">
          <div className="sunday-col">Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {calendarCells.map((cell) => {
            const dayRecord = deriveDayRecord(cell.dateKey, todayKey, overrides, settings);
            const isToday = cell.dateKey === todayKey;
            const isFuture = cell.dateKey > todayKey;

            return (
              <button
                key={cell.dateKey}
                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} status-${dayRecord.status}`}
                onClick={() => onSelectDay(dayRecord)}
                disabled={isFuture && !dayRecord.isManualOverride}
                style={{ cursor: isFuture ? 'default' : 'pointer' }}
                title={`${dayRecord.fullDateStr} - ${dayRecord.status}`}
              >
                <span className="cal-date-num">{dayRecord.dayOfMonth}</span>

                <span className="cal-status-dot">
                  {dayRecord.status === 'Upcoming' ? '—' : dayRecord.status}
                </span>

                {dayRecord.otHours > 0 && <span className="cal-ot-indicator" title={`${dayRecord.otHours}h OT`} />}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.72rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#34d399' }}>P = Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
            <span style={{ color: '#fb7185' }}>A = Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: '#fbbf24' }}>L = Leave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
            <span style={{ color: '#a78bfa' }}>WO = Off</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
            <span style={{ color: '#38bdf8' }}>● OT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
