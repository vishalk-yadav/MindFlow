import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Clock,
  Zap,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Timer,
  Gamepad2,
  CalendarDays,
  X
} from 'lucide-react';
import { taskAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import confetti from '../utils/confetti';

const priorityColors = {
  HIGH: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
  LOW: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
};

const categoryOptions = [
  'DSA',
  'ASSIGNMENT',
  'PROJECT',
  'LAB',
  'EXAM_PREP',
  'PLACEMENT_PREP',
  'CODING_PRACTICE',
  'ACADEMIC',
  'OTHER',
];

export const TasksPage = () => {
  const { isDark } = useTheme();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState({ high: [], medium: [], low: [], completed: [] });
  const [stats, setStats] = useState({ total: 6, completed: 2, pending: 4, progressPercent: 33 });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter tab: 'all' | 'today' | 'upcoming' | 'completed'
  const [activeTab, setActiveTab] = useState('all');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newCategory, setNewCategory] = useState('DSA');
  const [newDeadline, setNewDeadline] = useState('');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(60);

  // Edit task modal state
  const [editingTask, setEditingTask] = useState(null);

  // Mini calendar week navigation
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + calendarWeekOffset * 7);
  const calMonthYear = baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayOfWeek = baseDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + mondayOffset + i);
    return {
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      fullDate: d
    };
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getTasks({ filter: activeTab });
      setTasks(res.data.tasks);
      setGroups(res.data.groups);
      setStats(res.data.stats);
      setRecommendation(res.data.recommendation);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await taskAPI.createTask({
        title: newTitle.trim(),
        priority: newPriority,
        category: newCategory,
        deadline: newDeadline || undefined,
        deadlineLabel: newDeadline ? 'Due ' + new Date(newDeadline).toLocaleDateString() : 'Due today',
        estimatedMinutes: parseInt(newEstimatedMinutes, 10),
      });

      setNewTitle('');
      showToast('Task added! Burnout indicator updated.', 'success');
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Failed to create task', 'error');
    }
  };

  const handleToggle = async (task) => {
    try {
      await taskAPI.toggleComplete(task.id);
      if (!task.completed) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        showToast(`Completed "${task.title}"!`, 'success');
      } else {
        showToast(`Reopened "${task.title}"`, 'info');
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Failed to update task', 'error');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.deleteTask(id);
      showToast('Task removed', 'info');
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await taskAPI.updateTask(editingTask.id, {
        title: editingTask.title,
        priority: editingTask.priority,
        category: editingTask.category,
        deadlineLabel: editingTask.deadlineLabel,
        estimatedMinutes: parseInt(editingTask.estimatedMinutes, 10),
      });
      setEditingTask(null);
      showToast('Task updated', 'success');
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Failed to update task', 'error');
    }
  };

  // Circular gauge for today's progress
  const radius = 46;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (stats.progressPercent / 100) * circumference;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
      {/* LEFT COLUMN: Main To-Do Card (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Today's To-Do List</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Inline Add Task Input Form */}
          <form onSubmit={handleAddTask} className="mt-6 flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add a new task..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Priority Selector */}
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="HIGH">● High Priority</option>
                  <option value="MEDIUM">● Medium Priority</option>
                  <option value="LOW">● Low Priority</option>
                </select>

                {/* Category Selector */}
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>

                {/* Deadline Input */}
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                Add
              </button>
            </div>
          </form>

          {/* Smart Recommendation Banner if available */}
          {recommendation && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/70 dark:border-blue-800/60 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    Recommended Next Task: {recommendation.title}
                  </p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium mt-0.5">
                    Reason: {recommendation.reason}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/focus')}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Focus Now
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1">
            {[
              { id: 'all', label: `All (${stats.total})` },
              { id: 'today', label: `Today (${stats.pending})` },
              { id: 'upcoming', label: 'Upcoming (1)' },
              { id: 'completed', label: `Completed (${stats.completed})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task Priority Groups */}
          <div className="flex flex-col gap-5 mt-6">
            {/* 1. HIGH PRIORITY GROUP */}
            {groups.high.length > 0 && (
              <div className="rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100/70 dark:border-rose-900/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">High Priority</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                    {groups.high.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {groups.high.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={(t) => setEditingTask(t)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. MEDIUM PRIORITY GROUP */}
            {groups.medium.length > 0 && (
              <div className="rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/70 dark:border-amber-900/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">Medium</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                    {groups.medium.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {groups.medium.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={(t) => setEditingTask(t)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. LOW PRIORITY GROUP */}
            {groups.low.length > 0 && (
              <div className="rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/70 dark:border-emerald-900/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Low Priority</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    {groups.low.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {groups.low.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={(t) => setEditingTask(t)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4. COMPLETED GROUP */}
            {groups.completed.length > 0 && (
              <div className="rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400">Completed</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {groups.completed.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {groups.completed.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={(t) => setEditingTask(t)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Progress + AI Suggestions + Quick Actions + Mini Calendar (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Today's Progress Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4">Today's Progress</h3>

          <div className="flex items-center gap-4">
            {/* Circular Ring Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg height="96" width="96" className="rotate-[-90deg]">
                <circle
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx="48"
                  cy="48"
                />
                <circle
                  stroke="#10b981"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }}
                  r={normalizedRadius}
                  cx="48"
                  cy="48"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {stats.completed}/{stats.total}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">completed</span>
              </div>
            </div>

            {/* Motivational copy */}
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">You're on track!</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Keep going. A little progress each day adds up to big results.
              </p>
            </div>
          </div>
        </div>

        {/* AI Suggestions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">AI Suggestions</h3>
            </div>
            <button
              onClick={() => navigate('/ai?initial=' + encodeURIComponent('Help me prioritize my engineering tasks and study workload.'))}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              View all →
            </button>
          </div>

          <div className="space-y-3">
            {/* Suggestion 1 */}
            <div
              onClick={() => navigate('/ai?initial=' + encodeURIComponent('I have high-priority tasks due today including DSA. How should I schedule them?'))}
              className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-start gap-3 cursor-pointer hover:bg-rose-100/60 dark:hover:bg-rose-950/50 hover:shadow-2xs transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  You have 3 high-priority tasks due today.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Consider completing the DSA assignment first.
                </p>
              </div>
            </div>

            {/* Suggestion 2 */}
            <div
              onClick={() => navigate('/focus?mode=break')}
              className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3 cursor-pointer hover:bg-blue-100/60 dark:hover:bg-blue-950/50 hover:shadow-2xs transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  You've been working for 2 hours.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Take a 5–10 minute break to refresh your mind.
                </p>
              </div>
            </div>

            {/* Suggestion 3 */}
            <div
              onClick={() => navigate('/games?game=breathing')}
              className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3 cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 hover:shadow-2xs transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  Want to be more productive?
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Try the 20-20-20 rule or a quick breathing reset.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Add Task</span>
            </button>
            <button
              onClick={() => navigate('/focus')}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all cursor-pointer"
            >
              <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Start Timer</span>
            </button>
            <button
              onClick={() => navigate('/games')}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-200 dark:hover:border-purple-800 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-bold transition-all cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Play Game</span>
            </button>
            <button
              onClick={() => navigate('/planner')}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-200 dark:hover:border-teal-800 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-bold transition-all cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>View Calendar</span>
            </button>
          </div>
        </div>

        {/* Mini Calendar Widget (Dynamic current week & month) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/planner')}
              className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open Study Planner"
            >
              <span>{calMonthYear}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
              <button
                onClick={() => setCalendarWeekOffset((prev) => prev - 1)}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Previous week"
              >
                ‹
              </button>
              {calendarWeekOffset !== 0 && (
                <button
                  onClick={() => setCalendarWeekOffset(0)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded cursor-pointer"
                >
                  Today
                </button>
              )}
              <button
                onClick={() => setCalendarWeekOffset((prev) => prev + 1)}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Next week"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 text-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            {currentWeekDays.map((d, i) => (
              <button
                key={i}
                onClick={() => navigate('/planner')}
                className={`py-1 text-center rounded-full transition-all cursor-pointer ${
                  d.isToday
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title={`Go to planner (${d.fullDate.toLocaleDateString()})`}
              >
                {d.dayNum}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deadline Label</label>
                <input
                  type="text"
                  value={editingTask.deadlineLabel || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, deadlineLabel: e.target.value })}
                  placeholder="e.g. Due today • 2h"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Task Row Component
const TaskRow = ({ task, onToggle, onEdit, onDelete }) => {
  return (
    <div
      onClick={() => onToggle(task)}
      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
        task.completed
          ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors border ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-500 bg-white dark:bg-slate-800'
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
          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            <span>{task.deadlineLabel || (task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Due today')}</span>
            <span>•</span>
            <span className="uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              {task.category?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            task.priority === 'HIGH'
              ? priorityColors.HIGH
              : task.priority === 'MEDIUM'
              ? priorityColors.MEDIUM
              : priorityColors.LOW
          }`}
        >
          {task.priority === 'HIGH' ? 'High' : task.priority === 'MEDIUM' ? 'Medium' : 'Low'}
        </span>

        <button
          onClick={() => onEdit(task)}
          className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => onDelete(task.id, e)}
          className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
