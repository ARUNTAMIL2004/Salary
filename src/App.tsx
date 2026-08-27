import React, { useMemo, useState } from 'react';
import { useAttendance } from './hooks/useAttendance';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';
import { Toast } from './components/common/Toast';
import { TodayHeroCard } from './components/home/TodayHeroCard';
import { CycleProgressCard } from './components/home/CycleProgressCard';
import { RecentActivityList } from './components/home/RecentActivityList';
import { QuickStatusModal } from './components/home/QuickStatusModal';
import { MonthCalendar } from './components/calendar/MonthCalendar';
import { SalaryCycleSummary } from './components/salary/SalaryCycleSummary';
import { AttendanceHistoryList } from './components/history/AttendanceHistoryList';
import { ProfileView } from './components/profile/ProfileView';
import { AttendanceStatus, DayRecord } from './types/attendance';
import { deriveDayRecord } from './utils/salaryCalculator';

export const App: React.FC = () => {
  const {
    todayKey,
    activeTab,
    setActiveTab,
    overrides,
    settings,
    profile,
    selectedCycleId,
    setSelectedCycleId,
    currentCycleInfo,
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
  } = useAttendance();

  const [modalDayRecord, setModalDayRecord] = useState<DayRecord | null>(null);

  // Derive today's current live DayRecord
  const liveTodayRecord = useMemo<DayRecord>(() => {
    return deriveDayRecord(todayKey, todayKey, overrides, settings);
  }, [todayKey, overrides, settings]);

  const handleOpenTodayModal = () => {
    setModalDayRecord(liveTodayRecord);
  };

  const handleOpenDayModal = (dayRecord: DayRecord) => {
    setModalDayRecord(dayRecord);
  };

  const handleSaveModal = (dateKey: string, status: AttendanceStatus, otHours: number, note?: string) => {
    updateDayRecord(dateKey, { status, otHours, note });
  };

  return (
    <div className="app-container">
      {/* Toast Feedback */}
      <Toast toast={toast} onClose={hideToast} />

      {/* Top Header */}
      <Header
        streakCount={currentSalaryResult.streakCount}
        activeTab={activeTab}
        onProfileClick={() => setActiveTab('profile')}
      />

      {/* Main Tab Views */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <div className="page-view">
            {/* Hero Today Check-in */}
            <TodayHeroCard
              todayRecord={liveTodayRecord}
              settings={settings}
              onOpenStatusModal={handleOpenTodayModal}
              onQuickAbsent={() => quickMarkAbsent(todayKey)}
            />

            {/* Current Salary Cycle Progress */}
            <CycleProgressCard
              salaryResult={currentSalaryResult}
              onViewSalaryDetails={() => setActiveTab('salary')}
            />

            {/* Recent Days Activity */}
            <RecentActivityList
              days={currentSalaryResult.days}
              todayKey={todayKey}
              onSelectDay={handleOpenDayModal}
              onViewAllHistory={() => setActiveTab('history')}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <MonthCalendar
            todayKey={todayKey}
            overrides={overrides}
            settings={settings}
            onSelectDay={handleOpenDayModal}
          />
        )}

        {activeTab === 'salary' && (
          <SalaryCycleSummary
            salaryResult={activeSalaryResult}
            currentCycleId={currentCycleInfo.cycleId}
            selectedCycleId={selectedCycleId}
            settings={settings}
            profile={profile}
            onSelectCycle={setSelectedCycleId}
          />
        )}

        {activeTab === 'history' && (
          <AttendanceHistoryList
            salaryResult={activeSalaryResult}
            todayKey={todayKey}
            onSelectDay={handleOpenDayModal}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            settings={settings}
            activeSalaryResult={activeSalaryResult}
            onUpdateProfile={updateProfile}
            onUpdateSettings={updateSettings}
            onReloadData={reloadFromStorage}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Quick Status / Day Edit Modal */}
      {modalDayRecord && (
        <QuickStatusModal
          isOpen={Boolean(modalDayRecord)}
          onClose={() => setModalDayRecord(null)}
          dayRecord={modalDayRecord}
          settings={settings}
          onSave={handleSaveModal}
          onResetToAuto={resetToAuto}
        />
      )}

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

export default App;
