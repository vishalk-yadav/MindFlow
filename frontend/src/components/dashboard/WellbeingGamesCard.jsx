import React from 'react';
import { Gamepad2, CircleDot, Layers, Wind, BookOpen, Grid3x3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WellbeingGamesCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Wellbeing Games</h3>
          </div>
          <button
            onClick={() => navigate('/games')}
            className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
          Take a break. Play a game. Feel better.
        </p>

        {/* 4 Interactive Game Tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Tic-Tac-Toe */}
          <div className="bg-purple-50/50 dark:bg-slate-800/60 border border-purple-100/60 dark:border-slate-700/60 rounded-2xl p-3 flex flex-col items-center text-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-purple-100/80 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1.5">
              <Grid3x3 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Tic-Tac-Toe</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Vs Minimax CPU</p>
            <button
              onClick={() => navigate('/games?game=tictactoe')}
              className="mt-2 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Play
            </button>
          </div>

          {/* Word Match */}
          <div className="bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100/60 dark:border-slate-700/60 rounded-2xl p-3 flex flex-col items-center text-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Word Match</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Cognitive reset</p>
            <button
              onClick={() => navigate('/games?game=wordmatch')}
              className="mt-2 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Play
            </button>
          </div>

          {/* Stress Bubbles */}
          <div className="bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100/60 dark:border-slate-700/60 rounded-2xl p-3 flex flex-col items-center text-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-blue-100/80 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1.5">
              <CircleDot className="w-4 h-4 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Stress Bubbles</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Quick & fun (30s)</p>
            <button
              onClick={() => navigate('/games?game=bubbles')}
              className="mt-2 w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Play
            </button>
          </div>

          {/* Memory Match */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-3 flex flex-col items-center text-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-slate-200/80 dark:bg-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-1.5">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Memory Match</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Boost focus (1m)</p>
            <button
              onClick={() => navigate('/games?game=memory')}
              className="mt-2 w-full py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Play
            </button>
          </div>
        </div>

        {/* 4-4-6 Breathing quick launcher bar */}
        <div className="mt-3 p-2.5 px-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/60 dark:border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Wind className="w-3.5 h-3.5 animate-breathe" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">4-4-6 Mindful Breathing</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">1-minute calming exercise</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/games?game=breathing')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Breathe
          </button>
        </div>
      </div>
    </div>
  );
};
