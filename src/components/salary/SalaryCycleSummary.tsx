import React, { useState } from 'react';
import {
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Coffee,
  Palmtree,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SalaryCalculationResult, SalarySettings, UserProfile } from '../../types/attendance';
import { exportCycleToCSV } from '../../utils/storage';
import { SalaryHistorySelector } from './SalaryHistorySelector';

interface SalaryCycleSummaryProps {
  salaryResult: SalaryCalculationResult;
  currentCycleId: string;
  selectedCycleId: string;
  settings: SalarySettings;
  profile: UserProfile;
  onSelectCycle: (cycleId: string) => void;
}

export const SalaryCycleSummary: React.FC<SalaryCycleSummaryProps> = ({
  salaryResult,
  currentCycleId,
  selectedCycleId,
  settings,
  profile,
  onSelectCycle,
}) => {
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);
  const { cycleInfo, presentDays, absentDays, leaveDays, weeklyOffDays, totalOtHours, otEarnings, basicSalary, absentDeductions, netEstimatedSalary, days } = salaryResult;

  const handleExportCSV = () => {
    exportCycleToCSV(salaryResult);
  };

  return (
    <div className="page-view">
      {/* Cycle Selector */}
      <SalaryHistorySelector
        currentCycleId={currentCycleId}
        selectedCycleId={selectedCycleId}
        settings={settings}
        onSelectCycle={onSelectCycle}
      />

      {/* Main Salary Slip Card */}
      <div className="salary-slip-container">
        {/* Slip Header */}
        <div className="slip-header-badge">
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              Salary Slip & Summary
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              {cycleInfo.monthName}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginTop: '2px', fontWeight: 600 }}>
              {cycleInfo.label}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Download CSV for Excel"
          >
            <Download size={14} />
            <span>CSV</span>
          </button>
        </div>

        {/* User Info (Optional) */}
        {profile.name && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#cbd5e1',
            }}
          >
            <span><strong>Employee:</strong> {profile.name}</span>
            {profile.employeeId && <span><strong>ID:</strong> {profile.employeeId}</span>}
          </div>
        )}

        {/* Attendance Days Summary Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="slip-item-row">
            <span className="slip-item-label">
              <CheckCircle2 size={16} color="#10b981" /> Present Days
            </span>
            <span className="slip-item-value" style={{ color: '#34d399' }}>
              {presentDays} days
            </span>
          </div>

          <div className="slip-item-row">
            <span className="slip-item-label">
              <Coffee size={16} color="#8b5cf6" /> Weekly Offs (Sundays)
            </span>
            <span className="slip-item-value" style={{ color: '#a78bfa' }}>
              {weeklyOffDays} days
            </span>
          </div>

          <div className="slip-item-row">
            <span className="slip-item-label">
              <XCircle size={16} color="#f43f5e" /> Absent Days
            </span>
            <span className="slip-item-value" style={{ color: '#fb7185' }}>
              {absentDays} days {absentDeductions > 0 && `(-₹${absentDeductions.toLocaleString('en-IN')})`}
            </span>
          </div>

          <div className="slip-item-row">
            <span className="slip-item-label">
              <Palmtree size={16} color="#f59e0b" /> Leave Days
            </span>
            <span className="slip-item-value" style={{ color: '#fbbf24' }}>
              {leaveDays} days
            </span>
          </div>

          <div className="slip-item-row">
            <span className="slip-item-label">
              <Clock size={16} color="#06b6d4" /> Overtime (OT)
            </span>
            <span className="slip-item-value" style={{ color: '#38bdf8' }}>
              {totalOtHours} hrs (+₹{otEarnings.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        {/* Salary Math Breakdown */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div className="slip-item-row">
            <span className="slip-item-label">Monthly Basic Salary</span>
            <span className="slip-item-value">₹{basicSalary.toLocaleString('en-IN')}</span>
          </div>

          {otEarnings > 0 && (
            <div className="slip-item-row">
              <span className="slip-item-label" style={{ color: '#38bdf8' }}>
                + Total OT Earnings ({totalOtHours}h × ₹{settings.otRate})
              </span>
              <span className="slip-item-value" style={{ color: '#38bdf8' }}>
                +₹{otEarnings.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {absentDeductions > 0 && (
            <div className="slip-item-row">
              <span className="slip-item-label" style={{ color: '#fb7185' }}>
                - Absent Deductions ({absentDays} days)
              </span>
              <span className="slip-item-value" style={{ color: '#fb7185' }}>
                -₹{absentDeductions.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Net Salary Highlight */}
        <div className="slip-total-banner">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Net Payable / Estimated Salary
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399' }}>
              ₹{netEstimatedSalary.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
              Cycle: {cycleInfo.totalDays} Days
            </div>
            {cycleInfo.isCurrentCycle && (
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                Day {cycleInfo.completedDays} of {cycleInfo.totalDays}
              </div>
            )}
          </div>
        </div>

        {/* Rule #8 Notice Note */}
        <div
          style={{
            marginTop: '14px',
            fontSize: '0.74rem',
            color: '#94a3b8',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <Info size={14} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Sunday ₹500 is already included inside basic salary. If you work on Sunday, only your OT hours (@₹{settings.otRate}/h) are added without duplicate pay.
          </span>
        </div>

        {/* Toggle Daily Breakdown Table */}
        <button
          onClick={() => setShowDailyBreakdown((prev) => !prev)}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: '#cbd5e1',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>{showDailyBreakdown ? 'Hide Daily Log' : 'View Detailed Daily Log'}</span>
          {showDailyBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDailyBreakdown && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {days.map((d) => (
              <div
                key={d.dateKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                    {d.dayOfMonth} {d.dayName}
                  </span>
                  {d.note && (
                    <span style={{ marginLeft: '8px', color: '#94a3b8', fontStyle: 'italic' }}>
                      ({d.note})
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`history-status-pill ${d.status}`} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                    {d.status}
                  </span>
                  {d.otHours > 0 && (
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                      +{d.otHours}h (+₹{d.otAmount})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
