import React from 'react';
import { PlusCircle, Timer, Gamepad2, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = ({ onOpenCheckIn, onOpenAddTask }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft transition-colors duration-200">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Add Task */}
        <button
          onClick={onOpenAddTask || (() => navigate('/tasks'))}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Add Task</span>
        </button>

        {/* Start Timer */}
        <button
          onClick={() => navigate('/focus')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Timer className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Start Timer</span>
        </button>

        {/* Play Game */}
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Play Game</span>
        </button>

        {/* Mood Check-in */}
        <button
          onClick={onOpenCheckIn || (() => navigate('/checkin'))}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Smile className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Mood Check-in</span>
        </button>
      </div>
    </div>
  );
};
