import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { SalarySettings } from '../../types/attendance';
import { getAvailableSalaryCycles } from '../../utils/dateUtils';

interface SalaryHistorySelectorProps {
  currentCycleId: string;
  selectedCycleId: string;
  settings: SalarySettings;
  onSelectCycle: (cycleId: string) => void;
}

export const SalaryHistorySelector: React.FC<SalaryHistorySelectorProps> = ({
  currentCycleId,
  selectedCycleId,
  settings,
  onSelectCycle,
}) => {
  const allCycles = getAvailableSalaryCycles(2025, 2030, settings.cycleStartDay, settings.cycleEndDay);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '10px 14px',
        }}
      >
        <Calendar size={18} color="#818cf8" />
        <select
          value={selectedCycleId || currentCycleId}
          onChange={(e) => onSelectCycle(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label="Select Salary Cycle"
        >
          {allCycles.map((c) => {
            const isCur = c.cycleId === currentCycleId;
            return (
              <option key={c.cycleId} value={c.cycleId} style={{ background: '#111728', color: '#fff' }}>
                {c.monthName} ({c.shortLabel}) {isCur ? '— [CURRENT]' : ''}
              </option>
            );
          })}
        </select>
        <ChevronDown size={16} color="#94a3b8" />
      </div>
    </div>
  );
};
