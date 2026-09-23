import React, { useState } from 'react';
import { X, Moon, Flame, Zap, Laptop, Coffee, Sparkles, Check } from 'lucide-react';
import { checkinAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from '../../utils/confetti';

const moods = [
  { id: 'GREAT', label: 'Great', emoji: '😄', color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { id: 'GOOD', label: 'Good', emoji: '😊', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { id: 'OKAY', label: 'Okay', emoji: '😐', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { id: 'STRESSED', label: 'Stressed', emoji: '😟', color: 'border-orange-400 bg-orange-50 text-orange-700' },
  { id: 'EXHAUSTED', label: 'Exhausted', emoji: '😫', color: 'border-rose-400 bg-rose-50 text-rose-700' },
];

const workloadOptions = [
  'Classes',
  'Assignments',
  'DSA',
  'Coding',
  'Project',
  'Lab',
  'Exam Preparation',
  'Placement Preparation',
  'Hackathon',
  'Other',
];

export const DailyCheckInModal = ({ onClose, onSuccess }) => {
  const { showToast } = useNotification();
  const [mood, setMood] = useState('GOOD');
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(6);
  const [sleepHours, setSleepHours] = useState(6.5);
  const [studyHours, setStudyHours] = useState(6.0);
  const [breaksCount, setBreaksCount] = useState(2);
  const [mainWorkload, setMainWorkload] = useState('DSA');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        mood,
        stressLevel: parseInt(stressLevel, 10),
        energyLevel: parseInt(energyLevel, 10),
        sleepHours: parseFloat(sleepHours),
        studyHours: parseFloat(studyHours),
        breaksCount: parseInt(breaksCount, 10),
        mainWorkload,
        notes: notes.trim() || undefined,
      };

      const res = await checkinAPI.createCheckIn(payload);
      const score = res.data?.burnoutRisk?.score;
      showToast(
        score !== undefined
          ? `Daily check-in recorded! Burnout indicator updated to ${score}/100.`
          : 'Daily check-in recorded! Burnout indicator updated.',
        'success'
      );
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

      // Dispatch global event so all pages (Dashboard, Analytics, etc.) refresh
      window.dispatchEvent(new CustomEvent('mindflow:checkin-updated', { detail: res.data }));

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to record check-in. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Daily Wellbeing Check-in</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                15 sec
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track your sleep, stress, and workload to update your burnout risk indicator.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">How are you feeling today?</label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center py-2.5 px-1 rounded-2xl border-2 transition-all ${
                    mood === m.id
                      ? `${m.color} dark:bg-opacity-20 shadow-xs scale-102`
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="text-2xl mb-1">{m.emoji}</span>
                  <span className="text-[11px] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level & Energy Level Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stress */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Stress Level
                </span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                  {stressLevel}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                <span>Relaxed (1)</span>
                <span>Overwhelmed (10)</span>
              </div>
            </div>

            {/* Energy */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Energy Level
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  {energyLevel}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                <span>Drained (1)</span>
                <span>Energized (10)</span>
              </div>
            </div>
          </div>

          {/* Sleep, Study Hours, Breaks */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-blue-100/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1 mb-1">
                <Moon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Sleep (hrs)
              </span>
              <input
                type="number"
                step="0.5"
                min="2"
                max="14"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="bg-indigo-50/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-indigo-100/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-1 mb-1">
                <Laptop className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Study (hrs)
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="18"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="bg-emerald-50/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-emerald-100/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Breaks
              </span>
              <input
                type="number"
                min="0"
                max="20"
                value={breaksCount}
                onChange={(e) => setBreaksCount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Main Workload Today */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              What was your main workload focus today?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {workloadOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setMainWorkload(opt)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    mainWorkload === opt
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Optional Note (How's your day going?)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Finished OS lab, practicing LeetCode trees..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving & Recalculating...' : 'Save & Update Burnout Indicator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
