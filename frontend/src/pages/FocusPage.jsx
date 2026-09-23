import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Brain,
  Smile,
  BarChart,
  Heart,
  Flame,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  X,
  History,
  Clock
} from 'lucide-react';
import { focusAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import confetti from '../utils/confetti';

const engineeringCategories = [
  { id: 'DSA', label: 'DSA Practice' },
  { id: 'CODING_PRACTICE', label: 'Coding' },
  { id: 'PROJECT', label: 'Projects' },
  { id: 'ASSIGNMENT', label: 'Assignments' },
  { id: 'EXAM_PREP', label: 'Exam Prep' },
  { id: 'PLACEMENT_PREP', label: 'Placement' },
];

export const FocusPage = () => {
  const { isDark } = useTheme();
  const { showToast } = useNotification();
  const [searchParams] = useSearchParams();

  // Mode settings
  const [mode, setMode] = useState('POMODORO'); // 'POMODORO' | 'DEEP_WORK' | 'CUSTOM'
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState('DSA');

  // Timer running state
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showTipBanner, setShowTipBanner] = useState(true);

  useEffect(() => {
    if (searchParams.get('mode') === 'break') {
      setIsBreak(true);
      setTimeLeft(breakMinutes * 60);
      setIsActive(false);
      showToast('Switched to Break Mode. Take a well-deserved breather!', 'info');
    }
  }, [searchParams, breakMinutes]);

  // Stats
  const [stats, setStats] = useState(null);

  // All Sessions Modal & Filter State
  const [showAllSessionsModal, setShowAllSessionsModal] = useState(false);
  const [allSessions, setAllSessions] = useState([]);
  const [loadingAllSessions, setLoadingAllSessions] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('ALL');

  const fetchStats = async () => {
    try {
      const res = await focusAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllSessions = async (cat = sessionFilter) => {
    try {
      setLoadingAllSessions(true);
      const res = await focusAPI.getHistory({ category: cat !== 'ALL' ? cat : undefined });
      setAllSessions(res.data || []);
    } catch (err) {
      console.error('Failed to load focus history:', err);
      showToast('Could not load session history.', 'error');
    } finally {
      setLoadingAllSessions(false);
    }
  };

  const handleOpenAllSessions = () => {
    setShowAllSessionsModal(true);
    fetchAllSessions(sessionFilter);
  };

  const handleFilterChange = (cat) => {
    setSessionFilter(cat);
    fetchAllSessions(cat);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Update time when mode changes
  const applyMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'POMODORO') {
      setFocusMinutes(25);
      setBreakMinutes(5);
      setLongBreakMinutes(15);
      setTimeLeft(25 * 60);
      setIsBreak(false);
    } else if (newMode === 'DEEP_WORK') {
      setFocusMinutes(50);
      setBreakMinutes(10);
      setLongBreakMinutes(20);
      setTimeLeft(50 * 60);
      setIsBreak(false);
    }
  };

  // Timer interval effect
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Completed session
      clearInterval(interval);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    if (!isBreak) {
      // Focus session completed! Record in DB
      try {
        await focusAPI.completeSession(null, {
          durationMinutes: focusMinutes,
          breakMinutes,
          category: selectedCategory,
        });
        showToast(`Focus session complete! +25 points earned. Take a ${breakMinutes}-min break!`, 'success');
        fetchStats();
      } catch (err) {
        console.error(err);
      }
      // Switch to break
      setIsBreak(true);
      setTimeLeft(breakMinutes * 60);
    } else {
      showToast('Break finished! Ready for your next focus session?', 'info');
      setIsBreak(false);
      setTimeLeft(focusMinutes * 60);
    }
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft((isBreak ? breakMinutes : focusMinutes) * 60);
  };

  const handleSkip = () => {
    setIsActive(false);
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(breakMinutes * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(focusMinutes * 60);
    }
  };

  // Stepper handlers
  const adjustTime = (type, delta) => {
    if (isActive) return;
    if (type === 'focus') {
      const next = Math.max(5, focusMinutes + delta);
      setFocusMinutes(next);
      if (!isBreak) setTimeLeft(next * 60);
    } else if (type === 'break') {
      const next = Math.max(1, breakMinutes + delta);
      setBreakMinutes(next);
      if (isBreak) setTimeLeft(next * 60);
    } else if (type === 'longBreak') {
      setLongBreakMinutes(Math.max(5, longBreakMinutes + delta));
    }
  };

  // Formatted display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG circular countdown calculations
  const totalSeconds = (isBreak ? breakMinutes : focusMinutes) * 60;
  const radius = 100;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - ((totalSeconds - timeLeft) / totalSeconds) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
      {/* MAIN COLUMN: Timer & Settings & Benefits (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Main Focus Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Focus Timer</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Better focus. Less stress.
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Work in focused sessions, take mindful breaks, and feel the difference.
              </p>
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Focusing on:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {engineeringCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Timer + Right Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center">
            {/* Left: Circular Countdown Display (6 cols) */}
            <div className="md:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg height="256" width="256" className="rotate-[-90deg]">
                  <circle
                    stroke={isDark ? '#334155' : '#f1f5f9'}
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx="128"
                    cy="128"
                  />
                  <circle
                    stroke={isBreak ? '#10b981' : '#3b82f6'}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
                    r={normalizedRadius}
                    cx="128"
                    cy="128"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {formattedTime}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                    {isBreak ? 'Break Time' : 'Focus Time'}
                  </span>

                  {/* Play / Pause Circular Button */}
                  <button
                    onClick={handleToggleTimer}
                    className={`mt-4 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
                      isBreak
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                    }`}
                  >
                    {isActive ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Auxiliary Controls: Reset & Skip */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSkip}
                  className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Skip to Next"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Session Settings (6 cols) */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Session Settings
              </h3>

              {/* Steppers */}
              <div className="space-y-3">
                {/* Focus Time */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Focus Time</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustTime('focus', -5)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      –
                    </button>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 w-12 text-center">
                      {focusMinutes} min
                    </span>
                    <button
                      onClick={() => adjustTime('focus', 5)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Break Time */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Break Time</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustTime('break', -1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      –
                    </button>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 w-12 text-center">
                      {breakMinutes} min
                    </span>
                    <button
                      onClick={() => adjustTime('break', 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Long Break */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Long Break</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustTime('longBreak', -5)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      –
                    </button>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 w-12 text-center">
                      {longBreakMinutes} min
                    </span>
                    <button
                      onClick={() => adjustTime('longBreak', 5)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Mode Selection Pills */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => applyMode('POMODORO')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'POMODORO'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Pomodoro 25/5
                </button>
                <button
                  onClick={() => applyMode('DEEP_WORK')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'DEEP_WORK'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Deep Work 50/10
                </button>
                <button
                  onClick={() => applyMode('CUSTOM')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'CUSTOM'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {/* Motivational Tip Banner below timer */}
          {showTipBanner && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="font-medium leading-relaxed">
                  You're doing great! A focused session can boost your productivity and reduce stress. Let's get started!
                </span>
              </div>
              <button
                onClick={() => setShowTipBanner(false)}
                className="p-1 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Card: "Why Focus Matters?" Row */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Why Focus Matters?</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Improves concentration</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Helps you stay present and get more done without mental wandering.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Smile className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Reduces stress</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Gives your mind a break and resets cognitive energy levels.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <BarChart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Boosts productivity</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                More high-quality focus equals faster assignment and DSA completion.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Supports mental health</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Prevents burnout fatigue and steadily improves mood.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Progress Ring + Streak + Recent Sessions + Banner (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Today's Focus Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4">Today's Focus Progress</h3>

          <div className="flex items-center gap-5">
            {/* Ring Chart */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg height="96" width="96" className="rotate-[-90deg]">
                <circle stroke={isDark ? '#334155' : '#f1f5f9'} fill="transparent" strokeWidth={8} r={38} cx="48" cy="48" />
                <circle
                  stroke="#10b981"
                  fill="transparent"
                  strokeWidth={8}
                  strokeDasharray="238.76"
                  style={{ strokeDashoffset: 59.69 }}
                  r={38}
                  cx="48"
                  cy="48"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {stats?.today?.sessionsCompleted || 3}/{stats?.today?.sessionsTarget || 4}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">sessions</span>
              </div>
            </div>

            {/* Stat bullet points */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400">Focused Time</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 ml-auto">{stats?.today?.focusedTime || '1h 15m'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-slate-500 dark:text-slate-400">Break Time</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 ml-auto">{stats?.today?.breakTime || '20m'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-500 dark:text-slate-400">Remaining</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 ml-auto">{stats?.today?.remainingSessions || 1} session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Focus Streak Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Focus Streak</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              New record!
            </span>
          </div>

          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-3">5 days in a row 🎉</p>

          <div className="flex items-center justify-between pt-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{day}</span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                    i < 5 ? 'bg-emerald-500 text-white shadow-2xs' : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  {i < 5 && <CheckCircle2 className="w-4 h-4 fill-current text-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Recent Sessions</h3>
            <button
              onClick={handleOpenAllSessions}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentSessions ? (
              stats.recentSessions.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{session.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{session.duration} • {session.timeAgo}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{session.points}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Focus Session</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">25 min • 4 days ago</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+25 pts</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Focus Session</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">25 min • 5 days ago</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+25 pts</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scenic Motivation Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100/70 via-sky-100/60 to-emerald-100/60 dark:from-blue-950/40 dark:via-sky-950/30 dark:to-emerald-950/30 p-6 border border-blue-200/50 dark:border-blue-800/40 shadow-soft">
          <div className="relative z-10">
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
              Small focus steps create big results.
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Every 25 minutes of deliberate practice moves you closer to engineering mastery.
            </p>
          </div>
        </div>
      </div>

      {/* All Focus Sessions History Modal */}
      {showAllSessionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">Focus Session History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">All completed study, coding, and DSA sessions</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllSessionsModal(false)}
                className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/40 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block">Total Completed</span>
                <span className="text-lg font-extrabold text-blue-900 dark:text-blue-200">{allSessions.length} sessions</span>
              </div>
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 block">Total Time</span>
                <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-200">
                  {Math.round(allSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / 60 * 10) / 10} hrs
                </span>
              </div>
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">Points Earned</span>
                <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200">
                  +{allSessions.reduce((acc, s) => acc + (s.pointsEarned || 25), 0)} pts
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => handleFilterChange('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  sessionFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Categories
              </button>
              {engineeringCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    sessionFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scrollable Sessions List */}
            <div className="flex-1 overflow-y-auto mt-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {loadingAllSessions ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-3 border-blue-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">Loading session history...</p>
                </div>
              ) : allSessions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No focus sessions found for this category.
                </div>
              ) : (
                allSessions.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.title}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {s.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{s.duration}</span>
                          <span>•</span>
                          <span>Break {s.breakMinutes}m</span>
                          <span>•</span>
                          <span>{s.dateFormatted || s.timeAgo}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      {s.points}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Keep consistent sessions to build deep work stamina.
              </span>
              <button
                onClick={() => setShowAllSessionsModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
