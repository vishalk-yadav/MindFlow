import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Brain,
  Code,
  Laptop,
  Moon,
  Flame,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';

export const AnalyticsPage = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const engineeringWorkload = data?.engineeringWorkload || [
    { name: 'Projects', minutes: 370, formatted: '6h 10m', color: '#818cf8' },
    { name: 'DSA', minutes: 260, formatted: '4h 20m', color: '#3b82f6' },
    { name: 'Exam Prep', minutes: 240, formatted: '4h 00m', color: '#a855f7' },
    { name: 'Assignments', minutes: 220, formatted: '3h 40m', color: '#f59e0b' },
    { name: 'Labs', minutes: 150, formatted: '2h 30m', color: '#10b981' },
    { name: 'Placement', minutes: 135, formatted: '2h 15m', color: '#ec4899' },
  ];

  const correlationData = data?.correlationData || [
    { day: 'Mon', workloadHours: 5.5, sleepHours: 6.8, stressLevel: 4, burnoutScore: 38 },
    { day: 'Tue', workloadHours: 7.0, sleepHours: 6.0, stressLevel: 5, burnoutScore: 42 },
    { day: 'Wed', workloadHours: 8.5, sleepHours: 5.2, stressLevel: 7, burnoutScore: 56 },
    { day: 'Thu', workloadHours: 6.8, sleepHours: 6.2, stressLevel: 5, burnoutScore: 51 },
    { day: 'Fri', workloadHours: 7.5, sleepHours: 5.8, stressLevel: 6, burnoutScore: 58 },
    { day: 'Sat', workloadHours: 8.0, sleepHours: 5.0, stressLevel: 8, burnoutScore: 62 },
    { day: 'Sun', workloadHours: 6.5, sleepHours: 6.4, stressLevel: 5, burnoutScore: 48 },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Engineering Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Focus Time</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">{data?.totalFocusHours || '23.2'} hrs</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Across 6 engineering areas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tasks Completion</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">{data?.summary?.taskCompletionRate || 75}%</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Academic deadlines met</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Sleep</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">{data?.summary?.avgSleep || 6.4} hrs</p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Target: 7.5 hrs</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Stress</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">{data?.summary?.avgStress || 5.8} /10</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Moderate range</span>
        </div>
      </div>

      {/* Engineering Productivity Breakdown Card (Section 30) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>This Week's Engineering Work</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Tracks time spent in DSA, projects, labs, assignments, and exam preparation.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            Last 7 Days
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Bar Chart (7 cols) */}
          <div className="lg:col-span-7 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineeringWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name, item) => [`${item.payload.formatted}`, 'Time Spent']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#1e293b',
                    border: isDark ? '1px solid #334155' : 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown stat pills (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {engineeringWorkload.map((cat) => (
              <div key={cat.name} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{cat.name}</span>
                <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1">{cat.formatted}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Burnout vs Workload Correlation Graph (Section 31) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Workload vs Burnout Risk vs Sleep Correlation</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Identify how heavy workload spikes and sleep deprivation impact your burnout risk indicators.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={correlationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="burnout" domain={[0, 100]} tick={{ fontSize: 10, fill: isDark ? '#a78bfa' : '#8b5cf6' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="hours" orientation="right" domain={[0, 12]} tick={{ fontSize: 10, fill: isDark ? '#60a5fa' : '#3b82f6' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#1e293b',
                  border: isDark ? '1px solid #334155' : 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: isDark ? '#cbd5e1' : '#334155' }} />
              <Line yAxisId="burnout" type="monotone" dataKey="burnoutScore" name="Burnout Risk (0-100)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="hours" type="monotone" dataKey="workloadHours" name="Workload (hrs)" stroke="#ef4444" strokeWidth={2} />
              <Line yAxisId="hours" type="monotone" dataKey="sleepHours" name="Sleep (hrs)" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Data-backed Insight Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-300 block">Identified Trend</span>
            <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
              Your burnout risk indicator increased on days where study workload exceeded 7.5 hours and sleep fell below 5.5 hours. Protecting consistent sleep buffers against stress escalation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
