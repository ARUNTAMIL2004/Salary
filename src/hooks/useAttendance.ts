import { useEffect, useMemo, useState } from 'react';
import {
  ActiveTab,
  AttendanceOverrides,
  DayOverride,
  SalaryCalculationResult,
  SalaryCycleInfo,
  SalarySettings,
  UserProfile,
} from '../types/attendance';
import {
  getAvailableSalaryCycles,
  getLocalDateKey,
  getSalaryCycleForDate,
} from '../utils/dateUtils';
import {
  calculateSalaryForCycle,
} from '../utils/salaryCalculator';
import {
  loadOverrides,
  loadProfile,
  loadSettings,
  removeDayOverride,
  saveDayOverride,
  saveProfile,
  saveSettings,
} from '../utils/storage';

export interface ToastState {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
}

export function useAttendance() {
  const [todayKey, setTodayKey] = useState<string>(() => getLocalDateKey());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  
  const [overrides, setOverrides] = useState<AttendanceOverrides>(() => loadOverrides());
  const [settings, setSettingsState] = useState<SalarySettings>(() => loadSettings());
  const [profile, setProfileState] = useState<UserProfile>(() => loadProfile());
  
  // Salary cycle currently inspected
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [toast, setToast] = useState<ToastState | null>(null);

  // Monitor device date change on tab focus / visibility / periodic check
  useEffect(() => {
    const checkDateChange = () => {
      const current = getLocalDateKey();
      if (current !== todayKey) {
        setTodayKey(current);
      }
    };

    window.addEventListener('focus', checkDateChange);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkDateChange();
      }
    });

    const interval = setInterval(checkDateChange, 30000); // Check every 30s
    return () => {
      window.removeEventListener('focus', checkDateChange);
      clearInterval(interval);
    };
  }, [todayKey]);

  // Current active salary cycle based on today
  const currentCycleInfo = useMemo<SalaryCycleInfo>(() => {
    return getSalaryCycleForDate(todayKey, settings.cycleStartDay, settings.cycleEndDay);
  }, [todayKey, settings.cycleStartDay, settings.cycleEndDay]);

  // If no specific cycle is selected, default to current cycle
  const activeCycleInfo = useMemo<SalaryCycleInfo>(() => {
    if (!selectedCycleId || selectedCycleId === currentCycleInfo.cycleId) {
      return currentCycleInfo;
    }
    const allCycles = getAvailableSalaryCycles(2025, 2030, settings.cycleStartDay, settings.cycleEndDay);
    const found = allCycles.find((c) => c.cycleId === selectedCycleId);
    return found || currentCycleInfo;
  }, [selectedCycleId, currentCycleInfo, settings.cycleStartDay, settings.cycleEndDay]);

  // Real-time calculated salary results for active cycle
  const activeSalaryResult = useMemo<SalaryCalculationResult>(() => {
    return calculateSalaryForCycle(activeCycleInfo, overrides, settings, todayKey);
  }, [activeCycleInfo, overrides, settings, todayKey]);

  // Real-time calculated salary results for today's current cycle (for home dashboard)
  const currentSalaryResult = useMemo<SalaryCalculationResult>(() => {
    return calculateSalaryForCycle(currentCycleInfo, overrides, settings, todayKey);
  }, [currentCycleInfo, overrides, settings, todayKey]);

  // Toast Helper
  const showToast = (message: string, undoAction?: () => void, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type, undoAction });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  };

  const hideToast = () => setToast(null);

  // Status & OT updater
  const updateDayRecord = (dateKey: string, partial: Partial<DayOverride>, customToastMsg?: string) => {
    const prev = overrides[dateKey];

    const updated = saveDayOverride(dateKey, partial);
    setOverrides({ ...updated });

    const undoFn = () => {
      if (prev) {
        saveDayOverride(dateKey, prev);
      } else {
        removeDayOverride(dateKey);
      }
      setOverrides(loadOverrides());
      showToast('Action undone', undefined, 'info');
    };

    const statusName = partial.status === 'P' ? 'Present' : partial.status === 'A' ? 'Absent' : partial.status === 'L' ? 'Leave' : partial.status === 'WO' ? 'Weekly Off' : 'Updated';
    const msg = customToastMsg || (partial.status ? `Marked ${statusName}` : 'Updated successfully');
    showToast(msg, undoFn, 'success');
  };

  // Quick 1-tap mark absent for today or any date
  const quickMarkAbsent = (dateKey: string = todayKey) => {
    updateDayRecord(dateKey, { status: 'A' }, 'Marked Absent for today');
  };

  // Clear manual override (revert to automatic derivation)
  const resetToAuto = (dateKey: string) => {
    const prev = overrides[dateKey];
    const updated = removeDayOverride(dateKey);
    setOverrides({ ...updated });

    const undoFn = () => {
      if (prev) {
        saveDayOverride(dateKey, prev);
        setOverrides(loadOverrides());
      }
    };
    showToast('Reverted to automatic calendar status', undoFn, 'info');
  };

  // Settings
  const updateSettings = (newSettings: SalarySettings) => {
    saveSettings(newSettings);
    setSettingsState(newSettings);
    showToast('Settings saved successfully', undefined, 'success');
  };

  // Profile
  const updateProfile = (newProfile: UserProfile) => {
    saveProfile(newProfile);
    setProfileState(newProfile);
    showToast('Profile updated', undefined, 'success');
  };

  // Reload everything from storage (after backup restore)
  const reloadFromStorage = () => {
    setOverrides(loadOverrides());
    setSettingsState(loadSettings());
    setProfileState(loadProfile());
    showToast('Data restored successfully!', undefined, 'success');
  };

  return {
    todayKey,
    activeTab,
    setActiveTab,
    overrides,
    settings,
    profile,
    selectedCycleId,
    setSelectedCycleId,
    currentCycleInfo,
    activeCycleInfo,
    activeSalaryResult,
    currentSalaryResult,
    toast,
    showToast,
    hideToast,
    updateDayRecord,
    quickMarkAbsent,
    resetToAuto,
    updateSettings,
    updateProfile,
    reloadFromStorage,
  };
}
