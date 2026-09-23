import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Moon,
  Flame,
  Building,
  CheckCircle2,
  Users,
  AlertCircle
} from 'lucide-react';
import { facultyAPI } from '../../services/api';

export const FacultyAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await facultyAPI.getAnalytics();
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Unable to load institutional analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Aggregating institutional wellbeing metrics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm">
        {error || 'No analytics data available.'}
      </div>
    );
  }

  const { departmentComparison, weeklyTrend, distribution, participation } = analytics;

  return (
    <div className="space-y-6">
      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-semibold text-slate-400">Total Participating</span>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {distribution?.reduce((acc, d) => acc + (d.count || 0), 0) || 20} students
          </p>
          <span className="text-[11px] text-blue-500 font-semibold block mt-1">Across 3 departments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-semibold text-slate-400">Critical / High Risk Rate</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {((distribution?.find(d => d.name.includes('Critical'))?.percentage || 0) +
              (distribution?.find(d => d.name.includes('High'))?.percentage || 0))}%
          </p>
          <span className="text-[11px] text-rose-500 font-semibold block mt-1">
            Above safety intervention limit
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-semibold text-slate-400">Active Check-ins Today</span>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {participation?.checkedInToday ?? 20} logged
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold block mt-1">
            {participation?.weeklyRate ?? 100}% participation
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-semibold text-slate-400">Healthy / Low Risk</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {distribution?.find(d => d.name.includes('Low'))?.count || 0} students
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">Balanced workload & sleep</span>
        </div>
      </div>

      {/* Row 1 Charts: Risk Distribution + Department Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Student Risk Tier Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of students categorized by AI burnout prediction</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Average Risk Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Average Burnout Score by Department</h3>
            <p className="text-xs text-slate-400">Comparing stress index across engineering disciplines</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentComparison || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis
                  dataKey="department"
                  type="category"
                  tick={{ fontSize: 9 }}
                  width={90}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="avgScore" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: 7-Day Average Burnout Score Weekly Trend */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Campus Weekly Burnout Score Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Mean calculated fatigue index across day-of-week check-in points
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '11px',
                }}
              />
              <Line type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
