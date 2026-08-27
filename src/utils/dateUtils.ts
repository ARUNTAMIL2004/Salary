import { SalaryCycleInfo } from '../types/attendance';

/**
 * Returns YYYY-MM-DD representation of a Date using local device time (never UTC).
 */
export function getLocalDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a local Date object set at 00:00:00.
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Checks if a given date is Sunday.
 */
export function isSunday(d: Date | string): boolean {
  const dateObj = typeof d === 'string' ? parseDateKey(d) : d;
  return dateObj.getDay() === 0;
}

/**
 * Formats a Date or dateKey into readable strings.
 */
export function formatDate(
  d: Date | string,
  format: 'full' | 'short' | 'dayOnly' | 'monthYear' | 'dayMonth' = 'full'
): string {
  const dateObj = typeof d === 'string' ? parseDateKey(d) : d;
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = days[dateObj.getDay()];
  const shortDayName = shortDays[dateObj.getDay()];
  const dateNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const fullMonthName = fullMonths[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  switch (format) {
    case 'full':
      return `${dayName}, ${dateNum} ${monthName} ${year}`;
    case 'short':
      return `${dateNum} ${monthName} ${year}`;
    case 'dayMonth':
      return `${dateNum} ${monthName}`;
    case 'dayOnly':
      return `${shortDayName}, ${dateNum}`;
    case 'monthYear':
      return `${fullMonthName} ${year}`;
    default:
      return `${dateNum} ${monthName} ${year}`;
  }
}

/**
 * Returns dynamic greeting based on local hour.
 */
export function getTimeGreeting(d: Date = new Date()): string {
  const hour = d.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Calculates the salary cycle that contains the given date.
 * Default cycle starts on the 23rd of previous month and ends on the 22nd of next month.
 */
export function getSalaryCycleForDate(
  targetDate: Date | string = new Date(),
  cycleStartDay: number = 23,
  cycleEndDay: number = 22
): SalaryCycleInfo {
  const d = typeof targetDate === 'string' ? parseDateKey(targetDate) : new Date(targetDate);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const day = d.getDate();

  let startYear: number;
  let startMonth: number;
  let endYear: number;
  let endMonth: number;

  if (day >= cycleStartDay) {
    // Current month start day to Next month end day
    startYear = year;
    startMonth = month;
    if (month === 11) {
      endYear = year + 1;
      endMonth = 0;
    } else {
      endYear = year;
      endMonth = month + 1;
    }
  } else {
    // Previous month start day to Current month end day
    if (month === 0) {
      startYear = year - 1;
      startMonth = 11;
    } else {
      startYear = year;
      startMonth = month - 1;
    }
    endYear = year;
    endMonth = month;
  }

  const startDateObj = new Date(startYear, startMonth, cycleStartDay, 0, 0, 0, 0);
  const endDateObj = new Date(endYear, endMonth, cycleEndDay, 0, 0, 0, 0);

  const startDateStr = getLocalDateKey(startDateObj);
  const endDateStr = getLocalDateKey(endDateObj);

  // Calculate total days in cycle
  const diffTime = endDateObj.getTime() - startDateObj.getTime();
  const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Calculate completed days up to TODAY
  const todayKey = getLocalDateKey();
  const todayObj = parseDateKey(todayKey);

  let completedDays = 0;
  if (todayObj >= endDateObj) {
    completedDays = totalDays;
  } else if (todayObj < startDateObj) {
    completedDays = 0;
  } else {
    const elapsed = Math.round((todayObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    completedDays = Math.max(0, Math.min(totalDays, elapsed));
  }

  const progressPercent = Math.round((completedDays / totalDays) * 100);

  const isCurrentCycle = todayKey >= startDateStr && todayKey <= endDateStr;
  const isPastCycle = todayKey > endDateStr;
  const isFutureCycle = todayKey < startDateStr;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const label = `${cycleStartDay} ${months[startMonth]} ${startYear} → ${cycleEndDay} ${months[endMonth]} ${endYear}`;
  const shortLabel = `${cycleStartDay} ${months[startMonth]} – ${cycleEndDay} ${months[endMonth]}`;
  const monthName = `${fullMonths[startMonth]} ${startYear} Cycle`;
  const cycleId = `${startYear}-${String(startMonth + 1).padStart(2, '0')}`;

  return {
    cycleId,
    startDate: startDateStr,
    endDate: endDateStr,
    label,
    shortLabel,
    monthName,
    totalDays,
    completedDays,
    progressPercent,
    isCurrentCycle,
    isPastCycle,
    isFutureCycle,
  };
}

/**
 * Returns an array of date keys (YYYY-MM-DD) between startDate and endDate inclusive.
 */
export function getDatesInRange(startDateKey: string, endDateKey: string): string[] {
  const dates: string[] = [];
  const current = parseDateKey(startDateKey);
  const end = parseDateKey(endDateKey);

  while (current <= end) {
    dates.push(getLocalDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Generates selectable salary cycles between startYear and endYear.
 */
export function getAvailableSalaryCycles(
  startYear: number = 2025,
  endYear: number = 2030,
  cycleStartDay: number = 23,
  cycleEndDay: number = 22
): SalaryCycleInfo[] {
  const cycles: SalaryCycleInfo[] = [];

  for (let yr = startYear; yr <= endYear; yr++) {
    for (let mo = 0; mo < 12; mo++) {
      // Pick the 25th of the month to guarantee landing inside this month's cycle
      const sampleDate = new Date(yr, mo, 25, 0, 0, 0, 0);
      const cycle = getSalaryCycleForDate(sampleDate, cycleStartDay, cycleEndDay);
      // Avoid duplicates
      if (!cycles.some((c) => c.cycleId === cycle.cycleId)) {
        cycles.push(cycle);
      }
    }
  }

  return cycles;
}
