import {
  getSalaryCycleForDate,
  isSunday,
  parseDateKey,
} from './utils/dateUtils';
import {
  calculateSalaryForCycle,
  DEFAULT_SETTINGS,
  deriveDayRecord,
} from './utils/salaryCalculator';
import { AttendanceOverrides } from './types/attendance';

function runTests() {
  console.log('--- STARTING MY ATTENDANCE & SALARY VERIFICATION ---');

  // Test 1: Date formatting and Sunday check
  const testSunday = '2026-08-23'; // 23 Aug 2026 is Sunday
  const testThursday = '2026-08-27'; // 27 Aug 2026 is Thursday
  
  if (!isSunday(testSunday)) throw new Error('Test 1 Failed: 2026-08-23 must be Sunday');
  if (isSunday(testThursday)) throw new Error('Test 1 Failed: 2026-08-27 is Thursday, not Sunday');
  console.log('✓ Test 1 Passed: Sunday calendar detection');

  // Test 2: Dynamic status derivation for Today vs Future
  const todayKey = '2026-08-27';
  const tomorrowKey = '2026-08-28';
  const overrides: AttendanceOverrides = {};

  const todayRecord = deriveDayRecord(todayKey, todayKey, overrides, DEFAULT_SETTINGS);
  const tomorrowRecord = deriveDayRecord(tomorrowKey, todayKey, overrides, DEFAULT_SETTINGS);
  const sundayRecord = deriveDayRecord('2026-08-23', todayKey, overrides, DEFAULT_SETTINGS);

  if (todayRecord.status !== 'P') throw new Error(`Test 2 Failed: Today should be 'P', got ${todayRecord.status}`);
  if (tomorrowRecord.status !== 'Upcoming') throw new Error(`Test 2 Failed: Tomorrow should be 'Upcoming', got ${tomorrowRecord.status}`);
  if (sundayRecord.status !== 'WO') throw new Error(`Test 2 Failed: Past Sunday should be 'WO', got ${sundayRecord.status}`);
  console.log('✓ Test 2 Passed: Dynamic default status (Today=P, Future=Upcoming, Sunday=WO)');

  // Test 3: Manual override on working day (Present -> Absent)
  overrides['2026-08-25'] = { status: 'A', note: 'Family function' };
  const overriddenDay = deriveDayRecord('2026-08-25', todayKey, overrides, DEFAULT_SETTINGS);
  if (overriddenDay.status !== 'A' || overriddenDay.note !== 'Family function') {
    throw new Error('Test 3 Failed: Manual override not respected');
  }
  console.log('✓ Test 3 Passed: Manual override Absent system');

  // Test 4: Sunday Work and Salary Rule (Rule #8: Sunday ₹500 inside basic; only OT is added)
  // E.g., working 8 hours OT on Sunday 2026-08-23
  overrides['2026-08-23'] = { status: 'P', otHours: 8, note: 'Emergency production shift' };
  const workedSundayRec = deriveDayRecord('2026-08-23', todayKey, overrides, DEFAULT_SETTINGS);
  if (workedSundayRec.status !== 'P' || workedSundayRec.otHours !== 8 || workedSundayRec.otAmount !== 8 * 130) {
    throw new Error(`Test 4 Failed: Sunday work OT calculation incorrect: ${workedSundayRec.otAmount}`);
  }
  console.log(`✓ Test 4 Passed: Sunday Work OT = 8 x ₹130 = ₹${workedSundayRec.otAmount}`);

  // Test 5: Salary Cycle calculation for 27 Aug 2026 (Starts 23 Aug, Ends 22 Sep)
  const cycleInfo = getSalaryCycleForDate(parseDateKey('2026-08-27'), 23, 22);
  if (cycleInfo.startDate !== '2026-08-23' || cycleInfo.endDate !== '2026-09-22') {
    throw new Error(`Test 5 Failed: Cycle dates incorrect: ${cycleInfo.startDate} to ${cycleInfo.endDate}`);
  }
  console.log(`✓ Test 5 Passed: Salary Cycle 23 Aug 2026 → 22 Sep 2026 (Total days: ${cycleInfo.totalDays})`);

  // Test 6: Salary Cycle completed stats strictly up to today (27 Aug = 5 days elapsed)
  const salaryResult = calculateSalaryForCycle(cycleInfo, overrides, DEFAULT_SETTINGS, todayKey);
  // Cycle has dates: 23(Sun, worked P, 8h OT), 24(Mon, P), 25(Tue, A), 26(Wed, P), 27(Thu, P) => 5 days elapsed
  // Present: 23, 24, 26, 27 = 4 days
  // Absent: 25 = 1 day
  // Leave: 0
  // Weekly Off: 0 (since 23 was worked)
  // Upcoming: totalDays - 5
  if (salaryResult.presentDays !== 4) throw new Error(`Test 6 Failed: Present days should be 4, got ${salaryResult.presentDays}`);
  if (salaryResult.absentDays !== 1) throw new Error(`Test 6 Failed: Absent days should be 1, got ${salaryResult.absentDays}`);
  if (salaryResult.upcomingDays !== cycleInfo.totalDays - 5) throw new Error('Test 6 Failed: Future days counted');
  if (salaryResult.totalOtHours !== 8) throw new Error(`Test 6 Failed: Total OT should be 8, got ${salaryResult.totalOtHours}`);
  if (salaryResult.otEarnings !== 1040) throw new Error(`Test 6 Failed: OT Earnings should be 1040, got ${salaryResult.otEarnings}`);
  console.log(`✓ Test 6 Passed: Cycle stats strictly up to today: Present=${salaryResult.presentDays}, Absent=${salaryResult.absentDays}, Upcoming=${salaryResult.upcomingDays}, OT Earnings=₹${salaryResult.otEarnings}`);

  // Test 7: Leap year February 2028 (23 Jan 2028 to 22 Feb 2028 and 23 Feb 2028 to 22 Mar 2028)
  const feb2028Cycle = getSalaryCycleForDate(parseDateKey('2028-02-25'), 23, 22);
  // 23 Feb 2028 to 22 Mar 2028: Feb 2028 has 29 days (23,24,25,26,27,28,29 = 7 days) + Mar (22 days) = 29 days total
  if (feb2028Cycle.totalDays !== 29) {
    throw new Error(`Test 7 Failed: Leap year Feb 2028 cycle should be 29 days, got ${feb2028Cycle.totalDays}`);
  }
  const feb2026Cycle = getSalaryCycleForDate(parseDateKey('2026-02-25'), 23, 22);
  // 23 Feb 2026 to 22 Mar 2026: Feb 2026 has 28 days (6 days in Feb + 22 days in Mar) = 28 days total
  if (feb2026Cycle.totalDays !== 28) {
    throw new Error(`Test 7 Failed: Non-leap Feb 2026 cycle should be 28 days, got ${feb2026Cycle.totalDays}`);
  }
  console.log('✓ Test 7 Passed: Leap year 2028 vs 2026 February handling');

  console.log('--- ALL LOGIC TESTS PASSED SUCCESSFULLY! ---');
}

runTests();
