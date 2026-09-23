import React from 'react';
import { UserCheck, Lightbulb } from 'lucide-react';

export const ProductivityVsWellbeing = ({ data }) => {
  const prod = data?.productivity ?? 78;
  const well = data?.wellbeing ?? 61;
  const stress = data?.stress ?? 46;
  const insight = data?.insight || "You're productive, but your wellbeing needs attention. Try a short break or a game.";

  const renderRing = (percent, color, label) => {
    const radius = 32;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg height="80" width="80" className="rotate-[-90deg]">
            <circle
              className="stroke-slate-100 dark:stroke-slate-800"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="40"
              cy="40"
            />
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }}
              r={normalizedRadius}
              cx="40"
              cy="40"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-extrabold text-slate-800 dark:text-slate-100">{percent}%</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5">{label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <UserCheck className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Your Productivity vs Wellbeing</h3>
      </div>

      <div className="flex items-center justify-around py-2">
        {renderRing(prod, '#10b981', 'Productivity')}
        {renderRing(well, '#3b82f6', 'Wellbeing')}
        {renderRing(stress, '#f59e0b', 'Stress')}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/60 p-3 rounded-2xl">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-medium">{insight}</span>
      </div>
    </div>
  );
};
