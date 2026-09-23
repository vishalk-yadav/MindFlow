import React, { useState, useEffect } from 'react';
import { Smile, Moon, Laptop, Coffee, Flame, Zap, Plus, CheckCircle2 } from 'lucide-react';
import { checkinAPI } from '../services/api';
import { DailyCheckInModal } from '../components/checkin/DailyCheckInModal';

export const MoodCheckInPage = () => {
  const [history, setHistory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await checkinAPI.getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const handleCheckInUpdate = () => {
      fetchHistory();
    };

    window.addEventListener('mindflow:checkin-updated', handleCheckInUpdate);
    return () => {
      window.removeEventListener('mindflow:checkin-updated', handleCheckInUpdate);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto">
      {/* Header card with action */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Smile className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Daily Wellbeing & Mood Check-in</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logging a 15-second daily check-in helps MindFlow detect early exhaustion patterns and tune your study schedule.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Check-in</span>
        </button>
      </div>

      {/* Check-in History Cards / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4">Recent Check-in Logs</h3>

        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">No check-ins yet. Log your first check-in!</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.mood === 'GREAT' ? '😄' : item.mood === 'GOOD' ? '😊' : item.mood === 'OKAY' ? '😐' : item.mood === 'STRESSED' ? '😟' : '😫'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{item.mood}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Primary Workload: <strong className="text-slate-700 dark:text-slate-200">{item.mainWorkload}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                    <Moon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.sleepHours}h</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                    <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.studyHours}h</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                    <Flame className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.stressLevel}/10</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                    <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.breaksCount} breaks</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <DailyCheckInModal
          onClose={() => setModalOpen(false)}
          onSuccess={fetchHistory}
        />
      )}
    </div>
  );
};
