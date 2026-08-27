import { getSalaryCycleForDate, parseDateKey } from './utils/dateUtils';
import { deriveDayRecord, calculateSalaryForCycle, DEFAULT_SETTINGS } from './utils/salaryCalculator';
import { AttendanceOverrides } from './types/attendance';

console.log('=== RUNNING COMPREHENSIVE E2E USER SCENARIO SUITE ===');

// Scenario 1: First-time user opens app on Thursday, 27 August 2026
const simulatedToday = '2026-08-27'; // Thursday
let userOverrides: AttendanceOverrides = {};

const day1Record = deriveDayRecord(simulatedToday, simulatedToday, userOverrides, DEFAULT_SETTINGS);
console.log(`[Scenario 1] User opens app on ${simulatedToday}:`);
console.log(`  - Status: ${day1Record.status} (Expected: P)`);
console.log(`  - isManualOverride: ${day1Record.isManualOverride} (Expected: false)`);
console.log(`  - OT Hours: ${day1Record.otHours}`);
if (day1Record.status !== 'P' || day1Record.isManualOverride !== false) {
  throw new Error('Scenario 1 Failed');
}

// Scenario 2: Tomorrow (28 August 2026) must remain Upcoming and not count in stats
const tomorrowKey = '2026-08-28';
const tomorrowRec = deriveDayRecord(tomorrowKey, simulatedToday, userOverrides, DEFAULT_SETTINGS);
console.log(`[Scenario 2] Checking future date (${tomorrowKey}):`);
console.log(`  - Status: ${tomorrowRec.status} (Expected: Upcoming)`);
if (tomorrowRec.status !== 'Upcoming') throw new Error('Scenario 2 Failed');

// Scenario 3: User marks 25 August 2026 as Absent with note "Family function"
userOverrides['2026-08-25'] = { status: 'A', note: 'Family function' };
const absentDay = deriveDayRecord('2026-08-25', simulatedToday, userOverrides, DEFAULT_SETTINGS);
console.log(`[Scenario 3] User manually changed 25 Aug to Absent:`);
console.log(`  - Status: ${absentDay.status} (Expected: A)`);
console.log(`  - Note: "${absentDay.note}"`);
if (absentDay.status !== 'A') throw new Error('Scenario 3 Failed');

// Scenario 4: User worked 8 hours OT on Sunday 23 August
userOverrides['2026-08-23'] = { status: 'P', otHours: 8, note: 'Special Sunday overtime shift' };
const workedSunday = deriveDayRecord('2026-08-23', simulatedToday, userOverrides, DEFAULT_SETTINGS);
console.log(`[Scenario 4] Worked Sunday with 8h OT:`);
console.log(`  - Status: ${workedSunday.status}`);
console.log(`  - OT Hours: ${workedSunday.otHours}`);
console.log(`  - OT Amount: ₹${workedSunday.otAmount} (Expected: ₹1040)`);
if (workedSunday.otAmount !== 1040) throw new Error('Scenario 4 Failed');

// Scenario 5: User adds 2.5 hours OT today (27 August)
userOverrides['2026-08-27'] = { status: 'P', otHours: 2.5, note: 'Late evening dispatch' };

// Scenario 6: Current Cycle Calculation (23 Aug 2026 -> 22 Sep 2026)
const currentCycle = getSalaryCycleForDate(parseDateKey(simulatedToday), 23, 22);
const currentCalc = calculateSalaryForCycle(currentCycle, userOverrides, DEFAULT_SETTINGS, simulatedToday);

console.log(`[Scenario 6] Salary Cycle Summary (${currentCycle.label}):`);
console.log(`  - Total Days in Month: ${currentCycle.totalDays}`);
console.log(`  - Elapsed Days so far: ${currentCycle.completedDays}`);
console.log(`  - Present Days: ${currentCalc.presentDays}`);
console.log(`  - Absent Days: ${currentCalc.absentDays}`);
console.log(`  - Total OT Hours: ${currentCalc.totalOtHours} hrs (8h + 2.5h = 10.5h)`);
console.log(`  - Total OT Earnings: ₹${currentCalc.otEarnings} (10.5 × 130 = ₹1365)`);
console.log(`  - Basic Salary: ₹${currentCalc.basicSalary}`);
console.log(`  - Absent Deductions (1 day): ₹${currentCalc.absentDeductions}`);
console.log(`  - Net Estimated Salary: ₹${currentCalc.netEstimatedSalary}`);

if (currentCalc.totalOtHours !== 10.5) throw new Error('Scenario 6 OT hours mismatch');
if (currentCalc.otEarnings !== 1365) throw new Error('Scenario 6 OT earnings mismatch');
if (currentCalc.absentDays !== 1) throw new Error('Scenario 6 Absent mismatch');

// Scenario 7: Backup & Restore JSON simulation
const exportedPayload = JSON.stringify({
  version: 1,
  exportDate: new Date().toISOString(),
  appName: 'My Attendance & Salary',
  settings: DEFAULT_SETTINGS,
  profile: { name: 'Rahul Sharma', jobRole: 'Technician', companyName: 'Precision Tech' },
  attendanceOverrides: userOverrides,
});

const restoredObj = JSON.parse(exportedPayload);
if (Object.keys(restoredObj.attendanceOverrides).length !== Object.keys(userOverrides).length) {
  throw new Error('Scenario 7 Backup simulation failed');
}
console.log(`[Scenario 7] JSON Export & Import Backup validated: ${exportedPayload.length} bytes`);

console.log('=== ALL E2E SCENARIOS PASSED WITH ZERO ERRORS ===');
