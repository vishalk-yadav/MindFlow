import React from 'react';
import { Calendar, Laptop, Moon, Coffee, Meh } from 'lucide-react';

export const OverviewStats = ({ overviewData }) => {
  const studyHours = overviewData?.studyHours ?? 6.5;
  const sleepHours = overviewData?.sleepHours ?? 6.2;
  const breaksCount = overviewData?.breaksCount ?? 2;
  const stressLevel = overviewData?.stressLevel ?? 5;
  const avgStudyHours = overviewData?.avgStudyHours ?? '5.8';
  const weeklyStudyBars = overviewData?.weeklyStudyBars || [
    { day: 'Mon', hours: 6.0 },
    { day: 'Tue', hours: 7.2 },
    { day: 'Wed', hours: 5.5 },
    { day: 'Thu', hours: 6.8 },
    { day: 'Fri', hours: 4.5 },
    { day: 'Sat', hours: 7.0 },
    { day: 'Sun', hours: 5.0 },
  ];

  const maxHours = Math.max(...weeklyStudyBars.map((b) => b.hours), 8);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Today's Overview</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-xl">
          {formattedDate}
        </span>
      </div>

      {/* 2x2 Grid Stats */}
      <div className="grid grid-cols-2 gap-3 my-2">
        {/* Study Hours */}
        <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100/60 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Study / Work Hours</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{studyHours} hrs</p>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100/60 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sleep</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{sleepHours} hrs</p>
          </div>
        </div>

        {/* Breaks */}
        <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Breaks</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{breaksCount}</p>
          </div>
        </div>

        {/* Stress */}
        <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100/60 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Meh className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Stress Level</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{stressLevel} /10</p>
          </div>
        </div>
      </div>

      {/* Mini Bar Chart for This Week */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">This Week</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Avg. {avgStudyHours} hrs</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-16 px-1">
          {weeklyStudyBars.map((bar, idx) => {
            const heightPercent = Math.round((bar.hours / maxHours) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full max-w-[24px] bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400 transition-all rounded-t-md"
                  style={{ height: `${heightPercent}%` }}
                  title={`${bar.day}: ${bar.hours} hrs`}
                />
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400">{bar.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
