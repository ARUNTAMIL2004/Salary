import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SalaryCalculationResult } from '../../types/attendance';

interface CycleProgressCardProps {
  salaryResult: SalaryCalculationResult;
  onViewSalaryDetails: () => void;
}

export const CycleProgressCard: React.FC<CycleProgressCardProps> = ({
  salaryResult,
  onViewSalaryDetails,
}) => {
  const { cycleInfo, presentDays, absentDays, weeklyOffDays, totalOtHours, otEarnings, netEstimatedSalary, absentDeductions } = salaryResult;

  return (
    <div className="salary-overview-card">
      <div className="cycle-header-row">
        <div className="cycle-tag">CURRENT SALARY CYCLE</div>
        <div className="cycle-dates-label">{cycleInfo.shortLabel}</div>
      </div>

      {/* Progress Bar */}
      <div className="cycle-progress-bar-container">
        <div className="cycle-progress-info">
          <span>Cycle Progress</span>
          <span style={{ color: '#38bdf8' }}>
            Day {cycleInfo.completedDays} of {cycleInfo.totalDays} ({cycleInfo.progressPercent}%)
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${cycleInfo.progressPercent}%` }} />
        </div>
      </div>

      {/* 5 Stats Grid */}
      <div className="cycle-stats-grid">
        <div className="stat-cell">
          <div className="stat-cell-num present">{presentDays}</div>
          <div className="stat-cell-label">Present</div>
        </div>

        <div className="stat-cell">
          <div className="stat-cell-num absent">{absentDays}</div>
          <div className="stat-cell-label">Absent</div>
        </div>

        <div className="stat-cell">
          <div className="stat-cell-num wo">{weeklyOffDays}</div>
          <div className="stat-cell-label">Off (WO)</div>
        </div>

        <div className="stat-cell">
          <div className="stat-cell-num ot">{totalOtHours}h</div>
          <div className="stat-cell-label">OT Total</div>
        </div>
      </div>

      {/* Estimated Salary Highlight */}
      <div className="salary-hero-amount">
        <div>
          <div className="salary-label-sub">Estimated Monthly Salary</div>
          <div className="salary-val-large">
            <span>₹</span>
            {netEstimatedSalary.toLocaleString('en-IN')}
          </div>
          {otEarnings > 0 && (
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
              Includes +₹{otEarnings.toLocaleString('en-IN')} OT ({totalOtHours} hrs)
            </div>
          )}
          {absentDeductions > 0 && (
            <div style={{ fontSize: '0.72rem', color: '#fb7185', marginTop: '2px', fontWeight: 600 }}>
              -₹{absentDeductions.toLocaleString('en-IN')} Absent deduction
            </div>
          )}
        </div>

        <button
          className="btn-change-status"
          onClick={onViewSalaryDetails}
          style={{ background: 'rgba(255, 255, 255, 0.12)' }}
          aria-label="View Full Salary Breakdown"
        >
          <span>Slip</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
