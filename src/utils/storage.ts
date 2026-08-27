import {
  AttendanceOverrides,
  DayOverride,
  SalaryCalculationResult,
  SalarySettings,
  UserProfile,
} from '../types/attendance';
import { DEFAULT_SETTINGS } from './salaryCalculator';

const STORAGE_KEYS = {
  OVERRIDES: 'my_attendance_overrides_v1',
  SETTINGS: 'my_attendance_settings_v1',
  PROFILE: 'my_attendance_profile_v1',
  LAST_DATE_CHECK: 'my_attendance_last_date_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Personal User',
  jobRole: 'Technician / Worker',
  companyName: 'My Company',
  employeeId: '',
  joiningDate: '',
  photoUrl: '',
};

export function loadOverrides(): AttendanceOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading overrides from localStorage', err);
    return {};
  }
}

export function saveOverrides(overrides: AttendanceOverrides): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overrides));
  } catch (err) {
    console.error('Error saving overrides to localStorage', err);
  }
}

export function saveDayOverride(dateKey: string, partialOverride: Partial<DayOverride>): AttendanceOverrides {
  const overrides = loadOverrides();
  const existing = overrides[dateKey] || {};

  const updated: DayOverride = {
    ...existing,
    ...partialOverride,
    updatedAt: new Date().toISOString(),
  };

  // If status is empty and ot is 0 and no note, clean it up to keep storage ultra small
  if (!updated.status && (!updated.otHours || updated.otHours === 0) && !updated.note?.trim()) {
    delete overrides[dateKey];
  } else {
    overrides[dateKey] = updated;
  }

  saveOverrides(overrides);
  return overrides;
}

export function removeDayOverride(dateKey: string): AttendanceOverrides {
  const overrides = loadOverrides();
  if (overrides[dateKey]) {
    delete overrides[dateKey];
    saveOverrides(overrides);
  }
  return overrides;
}

export function loadSettings(): SalarySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading settings', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SalarySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings', err);
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading profile', err);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile', err);
  }
}

export interface BackupData {
  version: number;
  exportDate: string;
  appName: string;
  settings: SalarySettings;
  profile: UserProfile;
  attendanceOverrides: AttendanceOverrides;
}

/**
 * Creates a complete JSON backup file and triggers download.
 */
export function exportBackupJSON(): void {
  const backup: BackupData = {
    version: 1,
    exportDate: new Date().toISOString(),
    appName: 'My Attendance & Salary',
    settings: loadSettings(),
    profile: loadProfile(),
    attendanceOverrides: loadOverrides(),
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_backup_${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restores data from JSON string.
 */
export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data: BackupData = JSON.parse(jsonStr);
    if (data.settings) saveSettings(data.settings);
    if (data.profile) saveProfile(data.profile);
    if (data.attendanceOverrides) saveOverrides(data.attendanceOverrides);
    return true;
  } catch (err) {
    console.error('Failed to import backup JSON', err);
    return false;
  }
}

/**
 * Exports current or selected salary cycle data into a formatted CSV.
 */
export function exportCycleToCSV(result: SalaryCalculationResult): void {
  const headers = ['Date', 'Day', 'Status', 'OT Hours', 'OT Earnings (INR)', 'Note', 'Is Manual Override'];
  const rows = result.days.map((d) => [
    d.dateKey,
    d.dayName,
    d.status,
    d.otHours.toString(),
    d.otAmount.toString(),
    `"${(d.note || '').replace(/"/g, '""')}"`,
    d.isManualOverride ? 'Yes' : 'No',
  ]);

  const summarySection = [
    [],
    ['=== SALARY SUMMARY ==='],
    ['Salary Cycle', result.cycleInfo.label],
    ['Basic Monthly Salary', `INR ${result.basicSalary}`],
    ['Present Days', result.presentDays],
    ['Absent Days', result.absentDays],
    ['Leave Days', result.leaveDays],
    ['Weekly Off Days', result.weeklyOffDays],
    ['Total OT Hours', `${result.totalOtHours} hrs`],
    ['Total OT Earnings', `INR ${result.otEarnings}`],
    ['Absent Deductions', `INR ${result.absentDeductions}`],
    ['Net Estimated Salary', `INR ${result.netEstimatedSalary}`],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    ...summarySection.map((s) => s.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Salary_${result.cycleInfo.cycleId}_${result.cycleInfo.startDate}_to_${result.cycleInfo.endDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
