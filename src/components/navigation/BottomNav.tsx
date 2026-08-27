import React from 'react';
import { Home, Calendar, IndianRupee, Clock, User } from 'lucide-react';
import { ActiveTab } from '../../types/attendance';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'salary', label: 'Salary', icon: <IndianRupee size={20} /> },
    { id: 'history', label: 'History', icon: <Clock size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <nav className="bottom-nav-bar" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            aria-selected={isActive}
            role="tab"
          >
            <div className="nav-icon-wrapper">{tab.icon}</div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
