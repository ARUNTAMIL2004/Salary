import {
  AttendanceOverrides,
  DayRecord,
  SalaryCalculationResult,
  SalaryCycleInfo,
  SalarySettings,
} from '../types/attendance';
import {
  formatDate,
  getDatesInRange,
  getLocalDateKey,
  isSunday,
  parseDateKey,
} from './dateUtils';

export const DEFAULT_SETTINGS: SalarySettings = {
  monthlySalary: 18000,
  otRate: 130,
  cycleStartDay: 23,
  cycleEndDay: 22,
  sundayIncludedInBase: true,
  workingDayDefault: 'P',
  sundayDefault: 'WO',
  absentDeductionMethod: 'cycle_days',
  eveningReminder: false,
  reminderTime: '20:00',
};

/**
 * Derives the single day status by combining calendar rules with any user override.
 */
export function deriveDayRecord(
  dateKey: string,
  todayKey: string,
  overrides: AttendanceOverrides,
  settings: SalarySettings = DEFAULT_SETTINGS
): DayRecord {
  const dateObj = parseDateKey(dateKey);
  const sunday = isSunday(dateObj);
  const isToday = dateKey === todayKey;
  const isFuture = dateKey > todayKey;

  const override = overrides[dateKey];
  const isManualOverride = Boolean(override && (override.status !== undefined || (override.otHours !== undefined && override.otHours > 0) || override.note));

  let status = override?.status;
  const otHours = override?.otHours ?? 0;
  const note = override?.note;

  if (!status) {
    if (isFuture) {
      status = 'Upcoming';
    } else if (sunday) {
      status = settings.sundayDefault; // 'WO'
    } else {
      status = settings.workingDayDefault; // 'P'
    }
  }

  const otAmount = otHours * settings.otRate;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return {
    dateKey,
    date: dateObj,
    dayOfMonth: dateObj.getDate(),
    dayOfWeek: dateObj.getDay(),
    dayName: dayNames[dateObj.getDay()],
    fullDateStr: formatDate(dateObj, 'full'),
    status,
    isManualOverride,
    isToday,
    isFuture,
    isSunday: sunday,
    otHours,
    otAmount,
    note,
  };
}

/**
 * Calculates complete attendance statistics and salary breakdown for a given cycle.
 */
export function calculateSalaryForCycle(
  cycle: SalaryCycleInfo,
  overrides: AttendanceOverrides,
  settings: SalarySettings = DEFAULT_SETTINGS,
  todayKey: string = getLocalDateKey()
): SalaryCalculationResult {
  const dateKeys = getDatesInRange(cycle.startDate, cycle.endDate);

  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let weeklyOffDays = 0;
  let workedSundays = 0;
  let upcomingDays = 0;
  let totalOtHours = 0;

  const dayRecords: DayRecord[] = dateKeys.map((key) => {
    const record = deriveDayRecord(key, todayKey, overrides, settings);

    if (record.isFuture) {
      upcomingDays++;
    } else {
      // Past or Today dates strictly counted
      switch (record.status) {
        case 'P':
          presentDays++;
          if (record.isSunday) {
            workedSundays++;
          }
          break;
        case 'A':
          absentDays++;
          break;
        case 'L':
          leaveDays++;
          break;
        case 'WO':
          weeklyOffDays++;
          break;
        default:
          break;
      }

      if (record.otHours > 0) {
        totalOtHours += record.otHours;
      }
    }

    return record;
  });

  const otEarnings = Math.round(totalOtHours * settings.otRate);

  // Per day rate calculation for absent deductions
  let divisor = cycle.totalDays;
  if (settings.absentDeductionMethod === 'fixed_30') {
    divisor = 30;
  } else if (settings.absentDeductionMethod === 'none') {
    divisor = 0;
  }

  const perDayRate = divisor > 0 ? settings.monthlySalary / divisor : 0;
  const absentDeductions = Math.round(absentDays * perDayRate);

  // Net salary calculation
  // Base ₹18,000 already includes weekly offs.
  // Working Sunday adds OT only (Rule #8: Sunday ₹500 is inside base, OT is added on top).
  const netEstimatedSalary = Math.max(0, settings.monthlySalary - absentDeductions + otEarnings);

  // Calculate streak (consecutive working days present up to today)
  const streakCount = calculatePresentStreak(todayKey, overrides, settings);

  return {
    cycleInfo: cycle,
    presentDays,
    absentDays,
    leaveDays,
    weeklyOffDays,
    workedSundays,
    upcomingDays,
    totalOtHours,
    otEarnings,
    basicSalary: settings.monthlySalary,
    perDayRate: Math.round(perDayRate),
    absentDeductions,
    netEstimatedSalary,
    streakCount,
    days: dayRecords,
  };
}

/**
 * Calculates current consecutive working days present.
 */
export function calculatePresentStreak(
  todayKey: string = getLocalDateKey(),
  overrides: AttendanceOverrides = {},
  settings: SalarySettings = DEFAULT_SETTINGS
): number {
  let streak = 0;
  const cur = parseDateKey(todayKey);

  // Check today first
  const todayRecord = deriveDayRecord(todayKey, todayKey, overrides, settings);
  if (todayRecord.status === 'A') {
    return 0;
  }

  // Walk backwards up to 60 days
  for (let i = 0; i < 60; i++) {
    const dKey = getLocalDateKey(cur);
    const rec = deriveDayRecord(dKey, todayKey, overrides, settings);

    if (rec.status === 'P') {
      streak++;
    } else if (rec.status === 'WO') {
      // Weekly off doesn't break the streak, skip and continue checking prior working days
    } else if (rec.status === 'A' || rec.status === 'L') {
      break;
    }

    cur.setDate(cur.getDate() - 1);
  }

  return streak;
}
