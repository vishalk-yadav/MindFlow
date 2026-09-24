import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { BurnoutCard } from '../components/dashboard/BurnoutCard';
import { OverviewStats } from '../components/dashboard/OverviewStats';
import { TakeBreakBanner } from '../components/dashboard/TakeBreakBanner';
import { DashboardTodoList } from '../components/dashboard/DashboardTodoList';
import { BurnoutTrendChart } from '../components/dashboard/BurnoutTrendChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { WellbeingGamesCard } from '../components/dashboard/WellbeingGamesCard';
import { ProductivityVsWellbeing } from '../components/dashboard/ProductivityVsWellbeing';
import { WeeklyInsightsCard } from '../components/dashboard/WeeklyInsightsCard';
import { MiniAssistantWidget } from '../components/dashboard/MiniAssistantWidget';
import { HabitTrackerCard } from '../components/dashboard/HabitTrackerCard';
import { DailyCheckInModal } from '../components/checkin/DailyCheckInModal';
import { DashboardSleepCard } from '../components/dashboard/DashboardSleepCard';
import { SleepTimerWidget } from '../components/sleep/SleepTimerWidget';
import { AiNudgeRecommendations } from '../components/dashboard/AiNudgeRecommendations';
import { AlertCircle, ArrowRight, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [sleepTimerModalOpen, setSleepTimerModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isRecoveryModeRequested = searchParams.get('recovery') === 'true';

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleCheckInUpdate = () => {
      fetchDashboard();
    };

    window.addEventListener('mindflow:checkin-updated', handleCheckInUpdate);
    return () => {
      window.removeEventListener('mindflow:checkin-updated', handleCheckInUpdate);
    };
  }, []);

  const isHighRisk = data?.burnoutRisk?.score >= 70 || isRecoveryModeRequested;

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Loading your MindFlow workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Recovery Mode Top Banner if High Burnout or requested */}
      {isHighRisk && (
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">Recovery Mode Recommended</h4>
              <p className="text-xs text-rose-100 mt-0.5">
                Your workload and deadlines are high relative to recovery indicators. Focus on essentials only.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/games?game=breathing')}
              className="px-4 py-2 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition-all shadow-xs cursor-pointer"
            >
              Start Breathing
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 rounded-xl bg-rose-700/60 text-white font-bold text-xs hover:bg-rose-700 transition-all cursor-pointer"
            >
              Review Tasks
            </button>
          </div>
        </div>
      )}

      {/* AI Smart Nudge Recommendations */}
      <AiNudgeRecommendations
        nudges={data?.nudges}
        onNudgesUpdated={fetchDashboard}
      />

      {/* ROW 1: Burnout Risk + Sleep & Recovery Timer + Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <BurnoutCard burnoutData={data?.burnoutRisk} />
        </div>
        <div className="lg:col-span-4">
          <DashboardSleepCard onSleepLogged={fetchDashboard} />
        </div>
        <div className="lg:col-span-4">
          <OverviewStats overviewData={data?.overview} />
        </div>
      </div>

      {/* ROW 2: To-Do List + Burnout Trend + (Quick Actions, Break & Games) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <DashboardTodoList
            tasksData={data?.tasks}
            onTaskUpdated={fetchDashboard}
          />
        </div>
        <div className="lg:col-span-4">
          <BurnoutTrendChart trendData={data?.burnoutTrend} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <QuickActions
            onOpenCheckIn={() => setCheckInModalOpen(true)}
            onOpenAddTask={() => navigate('/tasks')}
            onOpenSleepTimer={() => setSleepTimerModalOpen(true)}
          />
          <TakeBreakBanner />
          <WellbeingGamesCard />
        </div>
      </div>

      {/* ROW 3: Productivity vs Wellbeing + Weekly Insights + Mini AI Assistant + Habit Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <ProductivityVsWellbeing data={data?.productivityVsWellbeing} />
        </div>
        <div className="lg:col-span-3">
          <WeeklyInsightsCard insights={data?.weeklyInsights} />
        </div>
        <div className="lg:col-span-3">
          <MiniAssistantWidget />
        </div>
        <div className="lg:col-span-3">
          <HabitTrackerCard
            habitsData={data?.habits}
            onHabitToggled={fetchDashboard}
          />
        </div>
      </div>

      {/* Daily Check-in Modal */}
      {checkInModalOpen && (
        <DailyCheckInModal
          onClose={() => setCheckInModalOpen(false)}
          onSuccess={fetchDashboard}
        />
      )}

      {/* Direct Sleep Timer Modal (from QuickActions or Recovery prompt) */}
      {sleepTimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl my-8">
            <button
              onClick={() => setSleepTimerModalOpen(false)}
              className="absolute -top-3 -right-3 z-20 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              title="Close Sleep Timer"
            >
              <X className="w-4 h-4" />
            </button>
            <SleepTimerWidget
              onSleepCompleted={() => {
                fetchDashboard();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
