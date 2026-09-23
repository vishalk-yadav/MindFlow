import React from 'react';
import { Gamepad2, CircleDot, Layers, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WellbeingGamesCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Wellbeing Games</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">Take a break. Play a game. Feel better.</p>

        {/* 3 Game Tiles */}
        <div className="grid grid-cols-3 gap-3">
          {/* Stress Bubbles */}
          <div className="bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100/60 dark:border-slate-700/60 rounded-2xl p-3 flex flex-col items-center text-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-100/80 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <CircleDot className="w-5 h-5 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Stress Bubbles</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Quick & fun (30 sec)</p>
            <button
              onClick={() => navigate('/games?game=bubbles')}
              className="mt-3 w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Play
            </button>
          </div>

          {/* Memory Match */}
          <div className="bg-purple-50/50 dark:bg-slate-800/60 border border-purple-100/60 dark:border-slate-700/60 rounded-2xl p-3 flex flex-col items-center text-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-100/80 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Memory Match</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Boost focus (1 min)</p>
            <button
              onClick={() => navigate('/games?game=memory')}
              className="mt-3 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Play
            </button>
          </div>

          {/* Breathing Game */}
          <div className="bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100/60 dark:border-slate-700/60 rounded-2xl p-3 flex flex-col items-center text-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <Wind className="w-5 h-5 animate-breathe" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Breathing Game</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Relax mind (1 min)</p>
            <button
              onClick={() => navigate('/games?game=breathing')}
              className="mt-3 w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
