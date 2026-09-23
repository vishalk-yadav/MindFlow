import React from 'react';
import { ListChecks, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from '../../utils/confetti';

export const DashboardTodoList = ({ tasksData, onTaskUpdated }) => {
  const { showToast } = useNotification();
  const tasks = tasksData?.list || [];
  const completedCount = tasksData?.completedCount ?? 2;
  const totalCount = tasksData?.totalCount ?? 4;
  const progressPercent = tasksData?.progressPercentage ?? 50;

  // Take top 4 for the dashboard view
  const displayTasks = tasks.slice(0, 4);

  const handleToggle = async (id, title, currentCompleted) => {
    try {
      await taskAPI.toggleComplete(id);
      if (!currentCompleted) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        showToast(`Completed "${title}"!`, 'success');
      } else {
        showToast(`Reopened "${title}"`, 'info');
      }
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
      showToast('Failed to update task', 'error');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-900/60">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900/60">
            Medium
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60">
            Low
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ListChecks className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Today's To-Do List</h3>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Task List items */}
        <div className="space-y-2.5 my-3">
          {displayTasks.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-400 py-6 text-center">Your task list is clear. Add your next task.</p>
          ) : (
            displayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggle(task.id, task.title, task.completed)}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  task.completed
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 opacity-70'
                    : 'bg-white dark:bg-slate-800/70 border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors border ${
                      task.completed
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-500 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="truncate">
                    <p
                      className={`text-xs font-semibold truncate ${
                        task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 font-medium">
                      {task.deadlineLabel || (task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Due today')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getPriorityBadge(task.priority)}
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
          <span>{completedCount} / {totalCount} completed ({progressPercent}%)</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
