import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TakeBreakBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100/70 via-teal-100/60 to-blue-100/60 dark:from-slate-900 dark:via-teal-950/40 dark:to-emerald-950/30 p-6 border border-emerald-200/50 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Background Scenic Landscape SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="w-full h-full">
          {/* Sun */}
          <circle cx="320" cy="50" r="35" fill="#fef08a" opacity="0.8" />
          {/* Mountains & Hills */}
          <path d="M0 200 L120 120 L240 200 Z" fill="#6ee7b7" opacity="0.4" />
          <path d="M150 200 L280 90 L390 200 Z" fill="#34d399" opacity="0.5" />
          <path d="M260 200 L350 140 L400 200 Z" fill="#059669" opacity="0.3" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-xs text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Take a Break</span>
        </div>
        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
          You've been working for 2 hours.
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
          How about a 5-minute break to refresh your mind?
        </p>
      </div>

      <div className="relative z-10 mt-6">
        <button
          onClick={() => navigate('/focus?mode=break')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-slate-900/10 dark:shadow-emerald-900/20 transition-all hover:gap-3"
        >
          <span>Start Break</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
