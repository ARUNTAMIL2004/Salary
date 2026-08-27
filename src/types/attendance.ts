export type AttendanceStatus = 'P' | 'A' | 'L' | 'WO' | 'Upcoming';

export interface DayOverride {
  status?: AttendanceStatus;
  otHours?: number;
  note?: string;
  updatedAt?: string;
}

export type AttendanceOverrides = Record<string, DayOverride>;

export interface SalarySettings {
  monthlySalary: number;       // default 18000
  otRate: number;              // default 130
  cycleStartDay: number;       // default 23
  cycleEndDay: number;         // default 22
  sundayIncludedInBase: boolean; // default true (₹500 inside basic, no double pay)
  workingDayDefault: AttendanceStatus; // default 'P'
  sundayDefault: AttendanceStatus;     // default 'WO'
  absentDeductionMethod: 'cycle_days' | 'fixed_30' | 'none'; // default 'cycle_days'
  eveningReminder: boolean;    // default false
  reminderTime: string;        // default "20:00"
}

export interface UserProfile {
  name: string;
  employeeId?: string;
  companyName?: string;
  jobRole?: string;
  joiningDate?: string;
  photoUrl?: string;
}

export interface SalaryCycleInfo {
  cycleId: string;       // e.g. "2026-08"
  startDate: string;     // YYYY-MM-DD
  endDate: string;       // YYYY-MM-DD
  label: string;         // "23 Aug 2026 → 22 Sep 2026"
  shortLabel: string;    // "23 Aug – 22 Sep"
  monthName: string;     // "August 2026 Cycle"
  totalDays: number;
  completedDays: number; // strictly up to today
  progressPercent: number;
  isCurrentCycle: boolean;
  isPastCycle: boolean;
  isFutureCycle: boolean;
}

export interface DayRecord {
  dateKey: string;       // YYYY-MM-DD
  date: Date;
  dayOfMonth: number;
  dayOfWeek: number;     // 0 = Sunday, 1 = Monday...
  dayName: string;       // "Thu"
  fullDateStr: string;   // "Thursday, 27 Aug 2026"
  status: AttendanceStatus;
  isManualOverride: boolean;
  isToday: boolean;
  isFuture: boolean;
  isSunday: boolean;
  otHours: number;
  otAmount: number;
  note?: string;
}

export interface SalaryCalculationResult {
  cycleInfo: SalaryCycleInfo;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  weeklyOffDays: number;
  workedSundays: number;
  upcomingDays: number;
  totalOtHours: number;
  otEarnings: number;
  basicSalary: number;
  perDayRate: number;
  absentDeductions: number;
  netEstimatedSalary: number;
  streakCount: number;
  days: DayRecord[];
}

export type ActiveTab = 'home' | 'calendar' | 'salary' | 'history' | 'profile';
