import React, { useState, useEffect } from 'react';
import {
  Activity,
  Smile,
  AlertTriangle,
  UserCheck,
  MessageSquare,
  Clock,
  Filter,
  CheckCircle2,
  Building
} from 'lucide-react';
import { facultyAPI } from '../../services/api';

export const FacultyActivityPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const res = await facultyAPI.getActivityLogs();
        setLogs(res.data || []);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (typeFilter === 'ALL') return true;
    return log.type === typeFilter;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'CHECKIN':
        return <Smile className="w-4 h-4 text-blue-500" />;
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'INTERVENTION':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'REVIEW':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Live Wellbeing Activity Stream</h2>
          <p className="text-xs text-slate-400">
            Real-time feed of student check-ins, burnout alerts, and faculty intervention actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'CHECKIN', 'ALERT', 'INTERVENTION'].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === f
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'ALL' ? 'All Activity' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading activity feed...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No activity events recorded under this filter.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            {filteredLogs.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4">
                {/* Timeline node */}
                <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>

                <div className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getEventIcon(item.type)}
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0 self-start sm:self-center">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      , {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
