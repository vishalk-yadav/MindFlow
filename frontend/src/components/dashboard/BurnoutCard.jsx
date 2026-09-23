import React, { useState } from 'react';
import { Flame, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const BurnoutCard = ({ burnoutData }) => {
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const score = burnoutData?.score ?? 48;
  const riskLevel = burnoutData?.riskLevel || 'Moderate Risk';
  const explanation = burnoutData?.explanation || "You're at a moderate risk of burnout. Your workload is slightly high and your sleep could be better. Take a short break and focus on your wellbeing.";
  const factors = burnoutData?.factors || {
    workload: 32,
    sleep: 26,
    stress: 22,
    breaks: 20,
  };

  const positiveFactors = burnoutData?.positiveFactors || [
    'Study hours remain balanced with daily targets',
    'Consistent focus streak maintained',
  ];

  const negativeFactors = burnoutData?.negativeFactors || [
    'Average sleep (6.2 hrs) is below your 7.5h target',
    'Few mindful breaks recorded today',
    '2 academic deadlines due within 48 hours',
  ];

  // Gauge colors
  const isHigh = score >= 70;
  const isModerate = score >= 40 && score < 70;

  const badgeColor = isHigh
    ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
    : isModerate
    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
    : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';

  const ringColor = isHigh ? '#f43f5e' : isModerate ? '#f59e0b' : '#10b981';

  // SVG Gauge calculations (circumference for semi-circle)
  const radius = 62;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-500 dark:text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Burnout Risk</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Indicator, not a diagnosis</p>
            </div>
          </div>
          <button
            onClick={() => setShowExplanationModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Why?</span>
          </button>
        </div>

        {/* Meter & Explanation Row */}
        <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
          {/* Circular/Arc Gauge */}
          <div className="relative flex flex-col items-center justify-center w-36 h-36 shrink-0">
            <svg height="144" width="144" className="rotate-[-135deg]">
              <circle
                className="stroke-slate-100 dark:stroke-slate-800"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                style={{ strokeDashoffset: 0 }}
                r={normalizedRadius}
                cx="72"
                cy="72"
                strokeLinecap="round"
              />
              <circle
                stroke={ringColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }}
                r={normalizedRadius}
                cx="72"
                cy="72"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{score}</span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">/100</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${badgeColor}`}>
                {riskLevel}
              </span>
            </div>
          </div>

          {/* Description Text */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {explanation}
            </p>
          </div>
        </div>

        {/* Top Contributing Factors Bars */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Top Contributing Factors</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Relative share</span>
          </div>

          <div className="space-y-2.5">
            {/* Workload */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Workload</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{factors.workload}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all duration-700"
                  style={{ width: `${factors.workload}%` }}
                />
              </div>
            </div>

            {/* Sleep */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Sleep</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{factors.sleep}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${factors.sleep}%` }}
                />
              </div>
            </div>

            {/* Stress */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Stress</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{factors.stress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${factors.stress}%` }}
                />
              </div>
            </div>

            {/* Breaks */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Breaks</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{factors.breaks}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${factors.breaks}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Burnout Explanation Modal */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Why is your risk {riskLevel.toLowerCase()}?</h3>
              </div>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed">
                MindFlow analyzes four engineering telemetry signals: academic workload deadlines, sleep duration vs your 7.5h target, self-reported stress, and cognitive break frequency.
              </p>

              {/* Negative Drivers */}
              <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-4">
                <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Primary Pressure Factors
                </h4>
                <ul className="space-y-1.5">
                  {negativeFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-rose-700 dark:text-rose-300/90">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Positive Mitigators */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Protecting Factors
                </h4>
                <ul className="space-y-1.5">
                  {positiveFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300/90">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
