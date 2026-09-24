import React, { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BedDouble,
  Clock,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Star,
  Zap,
  Coffee,
  X,
  Heart,
  BarChart3
} from 'lucide-react';
import { focusAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from '../../utils/confetti';

const SLEEP_PRESETS = [
  {
    id: 'NAP_20',
    label: '20m Power Nap',
    minutes: 20,
    type: 'POWER_NAP',
    description: 'Boosts alertness and memory consolidation without post-sleep grogginess.',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'NAP_45',
    label: '45m Refresh',
    minutes: 45,
    type: 'REFRESH',
    description: 'Deep cognitive fatigue reset for intense coding and engineering problem-solving.',
    icon: Coffee,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'CYCLE_90',
    label: '90m Full Cycle',
    minutes: 90,
    type: 'CYCLE',
    description: '1 complete REM/Slow-wave cycle. Dramatically lowers cortisol & burnout.',
    icon: Moon,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'NIGHT_7H',
    label: '7h Full Rest',
    minutes: 420,
    type: 'OVERNIGHT',
    description: 'Restorative overnight recovery meeting standard cognitive baseline targets.',
    icon: BedDouble,
    color: 'from-purple-600 to-rose-600',
  },
  {
    id: 'NIGHT_8H',
    label: '8h Peak Recovery',
    minutes: 480,
    type: 'OVERNIGHT',
    description: 'Optimal engineering recovery. Maximum reduction in sleep deficit and burnout risk.',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
  },
];

export const SleepTimerWidget = ({ onSleepCompleted, isCompact = false }) => {
  const { showToast } = useNotification();

  // Selected Preset or custom
  const [selectedPreset, setSelectedPreset] = useState(SLEEP_PRESETS[0]);
  const [customMinutes, setCustomMinutes] = useState(60);
  const [isCustom, setIsCustom] = useState(false);

  // Timer running state
  const [totalSeconds, setTotalSeconds] = useState(20 * 60);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Sleep Stats from API
  const [sleepStats, setSleepStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Burnout Analysis Modal State
  const [analysisModal, setAnalysisModal] = useState(null);
  const [qualityRating, setQualityRating] = useState(4);
  const [logging, setLogging] = useState(false);

  // Fetch sleep stats & target
  const fetchSleepStats = async () => {
    try {
      setLoadingStats(true);
      const res = await focusAPI.getSleepStats();
      setSleepStats(res.data);
    } catch (err) {
      console.error('Failed to load sleep stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchSleepStats();
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
        setElapsedSeconds((e) => e + 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      handleWakeUpAndAnalyze();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Preset Selection
  const handleSelectPreset = (preset) => {
    if (isRunning) {
      if (!window.confirm('Timer is active. Switch sleep mode and reset timer?')) return;
    }
    setIsCustom(false);
    setSelectedPreset(preset);
    setIsRunning(false);
    setTotalSeconds(preset.minutes * 60);
    setSecondsLeft(preset.minutes * 60);
    setElapsedSeconds(0);
  };

  const handleApplyCustom = () => {
    const mins = Math.max(parseInt(customMinutes, 10) || 30, 5);
    setIsCustom(true);
    setIsRunning(false);
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
    setElapsedSeconds(0);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    setElapsedSeconds(0);
  };

  // Wake Up & Log Sleep
  const handleWakeUpAndAnalyze = async () => {
    setIsRunning(false);

    // Calculate actual minutes slept (minimum 1 minute or preset duration if finished)
    const minutesToLog = Math.max(
      secondsLeft === 0 ? Math.round(totalSeconds / 60) : Math.round(elapsedSeconds / 60) || 1,
      1
    );

    try {
      setLogging(true);
      const res = await focusAPI.logSleep({
        durationMinutes: minutesToLog,
        sleepType: isCustom ? 'CUSTOM' : selectedPreset.type,
        qualityRating,
        notes: `Rest session logged via MindFlow Sleep Timer`,
      });

      // Celebration
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.6 } });

      // Open Burnout Impact modal
      setAnalysisModal(res.data);

      showToast(
        `Rest session logged! Burnout score updated to ${res.data.burnout.score}.`,
        'success'
      );

      // Refresh stats
      fetchSleepStats();

      // Dispatch global events so Dashboard & Topbar update immediately
      window.dispatchEvent(new CustomEvent('mindflow:checkin-updated'));
      window.dispatchEvent(new CustomEvent('mindflow:sleep-updated'));

      if (onSleepCompleted) {
        onSleepCompleted(res.data);
      }
    } catch (err) {
      console.error('Failed to log sleep session:', err);
      showToast('Failed to record sleep session.', 'error');
    } finally {
      setLogging(false);
    }
  };

  // Time formatters
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Main Sleep Timer Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 text-white border border-indigo-900/60 shadow-2xl">
        {/* Ambient Starry Background Effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Telemetry Pill */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Moon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Sleep & Rest Timer</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                  Burnout Engine Integrated
                </span>
              </div>
              <p className="text-xs text-indigo-200/70 mt-0.5">
                Restorative sleep cycles automatically analyzed to reduce your burnout risk score.
              </p>
            </div>
          </div>

          {/* Today's Recovery Telemetry Pill */}
          {sleepStats && (
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/80">
                  Today's Sleep
                </div>
                <div className="text-xs font-black text-white">
                  {sleepStats.todaySleepHours}h / {sleepStats.targetSleepHours}h Target
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Preset Mode Selection Chips */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 my-6">
          {SLEEP_PRESETS.map((preset) => {
            const isSelected = !isCustom && selectedPreset.id === preset.id;
            const IconComponent = preset.icon;

            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-400/80 ring-2 ring-indigo-400/30 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl bg-gradient-to-r ${preset.color} text-white`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-300/80">{preset.minutes}m</span>
                </div>
                <div>
                  <div className="text-xs font-bold truncate">{preset.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Central Radial Countdown Display */}
        <div className="relative z-10 flex flex-col items-center justify-center py-6">
          {/* Circular Glow Container */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center rounded-full bg-slate-900/80 border-4 border-indigo-900/40 shadow-inner">
            {/* SVG Circular Progress Track */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-indigo-500 transition-all duration-1000 ease-linear"
                strokeWidth="4"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Live Clock Text */}
            <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white drop-shadow-md">
              {formatTime(secondsLeft)}
            </span>

            <span className="text-xs font-bold text-indigo-300 mt-2 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              <span>
                {isCustom ? 'Custom Rest' : selectedPreset.label}
                {isRunning ? ' in progress...' : ' ready'}
              </span>
            </span>

            {elapsedSeconds > 0 && (
              <span className="text-[11px] text-slate-400 mt-1 font-mono">
                Slept: {formatTime(elapsedSeconds)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={handleToggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause Rest' : 'Start Sleep Timer'}</span>
            </button>

            <button
              onClick={handleResetTimer}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Wake Up & Analyze Burnout Button */}
            {(isRunning || elapsedSeconds > 0) && (
              <button
                onClick={handleWakeUpAndAnalyze}
                disabled={logging}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>{logging ? 'Analyzing...' : 'Wake Up & Log Sleep'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Burnout Recovery Educational Tip */}
        <div className="relative z-10 mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-indigo-200">How this affects your Burnout Score: </span>
            <span className="text-indigo-200/80 leading-relaxed">
              MindFlow tracks your sleep deficit against your {sleepStats?.targetSleepHours || 7.5}h
              engineering baseline target. When you wake up, logged rest immediately lowers your
              Burnout Risk Score by replenishing recovery deficit telemetry.
            </span>
          </div>
        </div>
      </div>

      {/* Burnout Impact Result Modal */}
      {analysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setAnalysisModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  Sleep Analyzed & Burnout Score Updated!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your recovery telemetry has refreshed your burnout prediction.
                </p>
              </div>
            </div>

            {/* Score Comparison Grid */}
            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Previous Burnout Score
                </span>
                <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                  {analysisModal.burnout?.previousScore ?? '—'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  New Burnout Score
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <span>{analysisModal.burnout?.score}</span>
                  {analysisModal.burnout?.scoreReduction > 0 && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>-{analysisModal.burnout.scoreReduction}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sleep Summary */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sleep Duration Recorded:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {analysisModal.loggedMinutes} mins ({analysisModal.loggedHours} hrs)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Sleep Logged Today:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {analysisModal.totalSleepToday} hrs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Updated Risk Level:</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {analysisModal.burnout?.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="mt-4 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
              <p className="leading-relaxed">{analysisModal.burnout?.explanation}</p>
            </div>

            <button
              onClick={() => setAnalysisModal(null)}
              className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Great, Continue Study Flow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
