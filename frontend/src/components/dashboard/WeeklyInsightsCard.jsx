import React from 'react';
import { BarChart2, TrendingDown, Flame, Moon, CheckSquare, Clock, Lightbulb } from 'lucide-react';

export const WeeklyInsightsCard = ({ insights }) => {
  const burnoutChange = insights?.burnoutRiskChange || '↓ 12%';
  const avgStress = insights?.avgStress || '5.8 / 10';
  const avgSleep = insights?.avgSleep || '6.4 hrs';
  const tasksCompleted = insights?.tasksCompleted || '75%';
  const focusTime = insights?.focusTime || '18 hrs';
  const mainInsight = insights?.mainInsight || 'Your sleep improved this week. Keep it up!';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Weekly Insights</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-xl">
            This Week
          </span>
        </div>

        {/* Metrics List */}
        <div className="space-y-3 my-2">
          <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <TrendingDown className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Burnout Risk</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{burnoutChange}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Average Stress</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{avgStress}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>Average Sleep</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{avgSleep}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span>Tasks Completed</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tasksCompleted}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Focus Time</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{focusTime}</span>
          </div>
        </div>
      </div>

      {/* Main Insight Box */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Main Insight</p>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">{mainInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
