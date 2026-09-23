import React from 'react';
import { CheckSquare, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { habitAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const HabitTrackerCard = ({ habitsData, onHabitToggled }) => {
  const { showToast } = useNotification();
  const habits = habitsData || [];

  const handleToggle = async (habitId, habitName) => {
    try {
      await habitAPI.toggleHabit(habitId);
      showToast(`Updated "${habitName}" for today!`, 'success');
      if (onHabitToggled) onHabitToggled();
    } catch (err) {
      console.error(err);
      showToast('Failed to update habit', 'error');
    }
  };

  const daysHeader = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Habit Tracker Assistant</h3>
          </div>
          <Link
            to="/settings"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Weekly Header Row */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400">Habit</span>
          <div className="flex items-center gap-2 sm:gap-3 pr-1">
            {daysHeader.map((d, i) => (
              <span key={i} className="w-5 text-center text-[11px] font-bold text-slate-400 dark:text-slate-400">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Habit Rows */}
        <div className="space-y-2.5">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{habit.name}</span>
              <div className="flex items-center gap-2 sm:gap-3 pr-1">
                {habit.days.map((dayItem, idx) => {
                  const isToday = idx === 6; // Last column is today
                  return (
                    <button
                      key={idx}
                      onClick={() => isToday && handleToggle(habit.id, habit.name)}
                      disabled={!isToday}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                        dayItem.completed
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : isToday
                          ? 'border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                          : 'border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40'
                      }`}
                      title={`${dayItem.day}: ${dayItem.completed ? 'Completed' : 'Missed'}`}
                    >
                      {dayItem.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Privacy Note */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-200">Your Privacy Matters</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
            Your data is private and is never shared without your permission.{' '}
            <Link to="/settings" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              View Privacy Policy →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
