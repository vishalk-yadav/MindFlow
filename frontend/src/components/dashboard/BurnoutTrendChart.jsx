import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const BurnoutTrendChart = ({ trendData }) => {
  const { isDark } = useTheme();
  const chartData = trendData?.chartData || [
    { day: 'Mon', score: 38 },
    { day: 'Tue', score: 42 },
    { day: 'Wed', score: 56 },
    { day: 'Thu', score: 51 },
    { day: 'Fri', score: 58 },
    { day: 'Sat', score: 62 },
    { day: 'Sun', score: 68 },
  ];

  const insightText = trendData?.insight || 'Your burnout risk increased by 18% this week.';
  const isIncrease = insightText.toLowerCase().includes('increased');

  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#94a3b8';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Burnout Trend</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-xl">
          Last 7 Days
        </span>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-44 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: axisColor, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 10, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#1e293b',
                borderRadius: '12px',
                border: isDark ? '1px solid #334155' : 'none',
                color: '#fff',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              formatter={(value) => [`${value} / 100`, 'Burnout Risk']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#8b5cf6', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#a78bfa' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Alert Container */}
      <div
        className={`mt-3 p-3 rounded-2xl flex items-center gap-2.5 ${
          isIncrease
            ? 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            isIncrease
              ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300'
              : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300'
          }`}
        >
          {isIncrease ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
        </div>
        <span className="text-xs font-semibold leading-tight">
          {insightText}
        </span>
      </div>
    </div>
  );
};
