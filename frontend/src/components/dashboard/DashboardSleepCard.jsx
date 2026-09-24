import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sparkles,
  Zap,
  Coffee,
  BedDouble,
  Play,
  ArrowRight,
  TrendingDown,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { focusAPI } from '../../services/api';
import { SleepTimerWidget } from '../sleep/SleepTimerWidget';

export const DashboardSleepCard = ({ onSleepLogged }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialPresetId, setInitialPresetId] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await focusAPI.getSleepStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch sleep stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleUpdate = () => {
      fetchStats();
    };

    window.addEventListener('mindflow:checkin-updated', handleUpdate);
    window.addEventListener('mindflow:sleep-updated', handleUpdate);

    return () => {
      window.removeEventListener('mindflow:checkin-updated', handleUpdate);
      window.removeEventListener('mindflow:sleep-updated', handleUpdate);
    };
  }, []);

  const openSleepTimer = (presetId = null) => {
    setInitialPresetId(presetId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setInitialPresetId(null);
  };

  const handleSleepCompleted = (result) => {
    fetchStats();
    if (onSleepLogged) {
      onSleepLogged(result);
    }
  };

  const todaySleep = stats?.todaySleepHours || 0;
  const targetSleep = stats?.targetSleepHours || 8.0;
  const deficit = stats?.sleepDeficit || 0;
  const progressPercent = Math.min(100, Math.round((todaySleep / targetSleep) * 100));

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-800/50 shadow-soft flex flex-col justify-between transition-colors duration-200">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                <Moon className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>Sleep & Recovery Timer</span>
                </h4>
                <p className="text-[11px] text-indigo-200/70">
                  Directly reduces burnout score & sleep deficit
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              -25% Burnout Factor
            </span>
          </div>

          {/* Telemetry Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Today's Recorded Rest
              </span>
              <span className="font-bold text-white">
                {todaySleep.toFixed(1)}h <span className="text-slate-400 font-normal">/ {targetSleep}h goal</span>
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  progressPercent >= 100
                    ? 'bg-emerald-500'
                    : progressPercent >= 70
                    ? 'bg-indigo-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-slate-400">
                {deficit > 0 ? (
                  <span className="text-amber-300 font-medium">Deficit: {deficit.toFixed(1)}h</span>
                ) : (
                  <span className="text-emerald-300 font-medium">Goal achieved!</span>
                )}
              </span>
              <span className="text-indigo-300 font-bold flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-emerald-400" />
                Lower your burnout
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => openSleepTimer('NAP_20')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all hover:scale-[1.02] cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-amber-300 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">20m</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium leading-tight">Power Nap</p>
            </button>

            <button
              onClick={() => openSleepTimer('CYCLE_90')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all hover:scale-[1.02] cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-indigo-300 mb-1">
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">90m</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium leading-tight">Full Cycle</p>
            </button>

            <button
              onClick={() => openSleepTimer('NIGHT_8H')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all hover:scale-[1.02] cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 mb-1">
                <BedDouble className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">8h</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium leading-tight">Night Rest</p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => openSleepTimer()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Sleep Timer</span>
          </button>
          <button
            onClick={() => navigate('/focus?tab=sleep')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Open in Focus & Rest Room"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sleep Timer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl my-8">
            {/* Close Button */}
            <button
              onClick={handleModalClose}
              className="absolute -top-3 -right-3 z-20 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              title="Close Sleep Timer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Widget */}
            <SleepTimerWidget
              onSleepCompleted={(result) => {
                handleSleepCompleted(result);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
