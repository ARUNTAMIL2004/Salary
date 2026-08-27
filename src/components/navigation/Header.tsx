import React from 'react';
import { CalendarCheck, Flame, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../../types/attendance';

interface HeaderProps {
  streakCount: number;
  activeTab: ActiveTab;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ streakCount, onProfileClick }) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-badge">
          <CalendarCheck size={22} strokeWidth={2.5} />
        </div>
        <div className="header-title-group">
          <h1>My Attendance & Salary</h1>
          <p>Personal Daily Tracker</p>
        </div>
      </div>

      <div className="header-actions">
        {streakCount > 0 && (
          <div className="header-pill" title={`${streakCount} consecutive working days present`}>
            <Flame size={14} color="#f59e0b" fill="#f59e0b" />
            <span>{streakCount}d streak</span>
          </div>
        )}

        <button
          onClick={onProfileClick}
          className="header-pill"
          style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.06)' }}
          title="Personal Profile & Settings"
        >
          <ShieldCheck size={14} color="#34d399" />
          <span>Private</span>
        </button>
      </div>
    </header>
  );
};
