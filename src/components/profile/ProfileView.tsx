import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  FileSpreadsheet,
  Bell,
  Save,
  Shield,
} from 'lucide-react';
import { SalaryCalculationResult, SalarySettings, UserProfile } from '../../types/attendance';
import { exportBackupJSON, exportCycleToCSV, importBackupJSON } from '../../utils/storage';

interface ProfileViewProps {
  profile: UserProfile;
  settings: SalarySettings;
  activeSalaryResult: SalaryCalculationResult;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateSettings: (settings: SalarySettings) => void;
  onReloadData: () => void;
  onShowToast: (msg: string, undo?: () => void, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  settings,
  activeSalaryResult,
  onUpdateProfile,
  onUpdateSettings,
  onReloadData,
  onShowToast,
}) => {
  const [profileForm, setProfileForm] = useState<UserProfile>(profile);
  const [settingsForm, setSettingsForm] = useState<SalarySettings>(settings);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
  };

  const handleExportJSON = () => {
    exportBackupJSON();
    onShowToast('JSON backup exported successfully!', undefined, 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          onReloadData();
        } else {
          onShowToast('Failed to import backup. Invalid JSON file format.', undefined, 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleExportCSV = () => {
    exportCycleToCSV(activeSalaryResult);
    onShowToast('CSV exported for current cycle!', undefined, 'success');
  };

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      onShowToast('Notifications are not supported in this browser.', undefined, 'warning');
      return;
    }

    if (Notification.permission === 'granted') {
      const updated = { ...settingsForm, eveningReminder: !settingsForm.eveningReminder };
      setSettingsForm(updated);
      onUpdateSettings(updated);
      onShowToast(updated.eveningReminder ? 'Evening reminder enabled (8:00 PM)' : 'Reminder disabled');
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const updated = { ...settingsForm, eveningReminder: true };
        setSettingsForm(updated);
        onUpdateSettings(updated);
        onShowToast('Notifications enabled! You will be reminded in the evening.');
      } else {
        onShowToast('Notification permission was not granted.', undefined, 'warning');
      }
    } else {
      onShowToast('Notifications are blocked in browser site settings.', undefined, 'warning');
    }
  };

  return (
    <div className="page-view">
      {/* Profile Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              }}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{profile.name || 'Personal User'}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {profile.jobRole || 'Worker / Employee'} • {profile.companyName || 'Private'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile((prev) => !prev)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.08)',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#cbd5e1',
            }}
          >
            {isEditingProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Your Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Job Role
                </label>
                <input
                  type="text"
                  value={profileForm.jobRole || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, jobRole: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={profileForm.companyName || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Employee ID
                </label>
                <input
                  type="text"
                  value={profileForm.employeeId || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, employeeId: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Joining Date
                </label>
                <input
                  type="date"
                  value={profileForm.joiningDate || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, joiningDate: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-action" style={{ marginTop: '8px' }}>
              <Save size={16} /> Save Profile
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: '#64748b', display: 'block' }}>Employee ID</span>
              <span style={{ fontWeight: 700 }}>{profile.employeeId || 'Not set'}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: '#64748b', display: 'block' }}>Joining Date</span>
              <span style={{ fontWeight: 700 }}>{profile.joiningDate || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Salary & Cycle Settings Card */}
      <div className="glass-card">
        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} color="#818cf8" />
          <span>Salary & Cycle Rules</span>
        </div>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Monthly Basic Salary (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={settingsForm.monthlySalary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, monthlySalary: Number(e.target.value) })}
                  required
                  style={{ width: '100%', paddingLeft: '28px', fontWeight: 700 }}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                OT Rate (₹/Hour)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={settingsForm.otRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, otRate: Number(e.target.value) })}
                  required
                  style={{ width: '100%', paddingLeft: '28px', fontWeight: 700 }}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  ₹
                </span>
              </div>
            </div>
          </div>

          {/* Salary Cycle Config */}
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Salary Cycle Range (Default: 23rd → 22nd)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Start:</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={settingsForm.cycleStartDay}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cycleStartDay: Number(e.target.value) })}
                  required
                  style={{ width: '100%', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>th</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>End:</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={settingsForm.cycleEndDay}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cycleEndDay: Number(e.target.value) })}
                  required
                  style={{ width: '100%', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>nd</span>
              </div>
            </div>
          </div>

          {/* Absent Deduction Method */}
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Absent Deduction Calculation
            </label>
            <select
              value={settingsForm.absentDeductionMethod}
              onChange={(e) => setSettingsForm({ ...settingsForm, absentDeductionMethod: e.target.value as any })}
              style={{ width: '100%', fontWeight: 600 }}
            >
              <option value="cycle_days">Exact cycle calendar days (Basic / Total Days in Cycle)</option>
              <option value="fixed_30">Fixed 30-day divisor (Basic / 30)</option>
              <option value="none">No absent deduction</option>
            </select>
          </div>

          <button type="submit" className="btn-primary-action">
            <Save size={16} /> Save Salary Settings
          </button>
        </form>
      </div>

      {/* Backup & Restore Card */}
      <div className="glass-card">
        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="#34d399" />
          <span>Data Backup & Restore</span>
        </div>
        <p style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '14px' }}>
          Your data is stored 100% privately in your local browser storage. Export a backup file to keep your records safe or transfer to another phone.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={handleExportJSON}
            className="btn-quick-action primary"
            style={{ justifyContent: 'center' }}
          >
            <Download size={16} />
            <span>Export JSON</span>
          </button>

          <label
            className="btn-quick-action"
            style={{
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#34d399',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.08)',
            }}
          >
            <Upload size={16} />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-quick-action"
          style={{
            width: '100%',
            justifyContent: 'center',
            color: '#38bdf8',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            background: 'rgba(6, 182, 212, 0.08)',
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Export Current Cycle to CSV</span>
        </button>
      </div>

      {/* Evening Reminder Toggle */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: settingsForm.eveningReminder ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: settingsForm.eveningReminder ? '#38bdf8' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Evening Reminder</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Check today's attendance before sleeping
            </div>
          </div>
        </div>

        <button
          onClick={handleRequestNotification}
          style={{
            padding: '7px 14px',
            borderRadius: 'var(--radius-full)',
            background: settingsForm.eveningReminder ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${settingsForm.eveningReminder ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
            color: settingsForm.eveningReminder ? '#34d399' : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          {settingsForm.eveningReminder ? 'Active' : 'Enable'}
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '0.72rem', color: '#64748b' }}>
        My Attendance & Salary v1.0 • 100% Private Offline PWA
      </div>
    </div>
  );
};
