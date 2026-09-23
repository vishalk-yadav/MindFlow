import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Building,
  Clock,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { facultyAPI } from '../../services/api';

export const FacultyDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await facultyAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
      setError('Unable to load faculty dashboard. Please ensure you are logged in as faculty or admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading student wellbeing metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm">
        {error || 'No data returned.'}
      </div>
    );
  }

  const summary = data.summary || data.metrics || {};
  const metrics = {
    totalStudents: summary.totalStudents || 0,
    criticalRiskCount: summary.criticalRisk || summary.criticalRiskCount || 0,
    highRiskCount: summary.highRisk || summary.highRiskCount || 0,
    reviewedAlerts: summary.reviewedAlerts || Math.max(0, (summary.activeAlertsCount || 0) - (summary.unreviewedAlertsCount || 0)),
    unreviewedAlerts: summary.unreviewedAlertsCount || summary.unreviewedAlerts || 0,
  };
  const distribution = data.distribution || {
    critical: summary.criticalRisk || 0,
    high: summary.highRisk || 0,
    moderate: summary.moderateRisk || 0,
    low: summary.lowRisk || 0,
  };
  const totalInDistribution =
    (distribution?.critical || 0) +
    (distribution?.high || 0) +
    (distribution?.moderate || 0) +
    (distribution?.low || 0) || 1;
  const recentAlerts = data.recentAlerts || [];
  const departmentStats = (data.departmentStats || []).map((d) => ({
    department: d.name || d.department,
    count: d.totalStudents || d.count,
    avgScore: d.averageScore || d.avgScore || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Urgent Alert Banner (if critical/unreviewed alerts exist) */}
      {metrics.unreviewedAlerts > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">
                {metrics.unreviewedAlerts} Urgent Student Burnout {metrics.unreviewedAlerts === 1 ? 'Alert' : 'Alerts'} Require Faculty Review
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                Students have logged severe sleep deprivation and excessive study workload crossing the institutional threshold.
              </p>
            </div>
          </div>
          <Link
            to="/faculty/alerts"
            className="px-4 py-2.5 rounded-xl bg-white text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Review Alerts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monitored Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Monitored</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.totalStudents}</p>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active in institution</span>
          </div>
        </div>

        {/* Critical Risk */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Critical Risk (Score &gt;80)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{metrics.criticalRiskCount}</p>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
            <span className="font-semibold text-rose-500">
              {Math.round((metrics.criticalRiskCount / (metrics.totalStudents || 1)) * 100)}%
            </span>
            <span>of student body</span>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High Risk (Score 60-79)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{metrics.highRiskCount}</p>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
            <span className="font-semibold text-amber-500">
              {Math.round((metrics.highRiskCount / (metrics.totalStudents || 1)) * 100)}%
            </span>
            <span>approaching threshold</span>
          </div>
        </div>

        {/* Resolved / Supported */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interventions Logged</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.reviewedAlerts}</p>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
            <span className="text-emerald-500 font-semibold">Active mentorship</span>
            <span>support active</span>
          </div>
        </div>
      </div>

      {/* Grid: Risk Distribution + Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Burnout Risk Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current wellbeing status across active students</p>
            </div>
            <Link
              to="/faculty/students"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Segmented Bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-6">
            <div
              style={{ width: `${((distribution?.critical || 0) / totalInDistribution) * 100}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Critical: ${distribution?.critical || 0}`}
            />
            <div
              style={{ width: `${((distribution?.high || 0) / totalInDistribution) * 100}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`High: ${distribution?.high || 0}`}
            />
            <div
              style={{ width: `${((distribution?.moderate || 0) / totalInDistribution) * 100}%` }}
              className="bg-blue-500 h-full transition-all"
              title={`Moderate: ${distribution?.moderate || 0}`}
            />
            <div
              style={{ width: `${((distribution?.low || 0) / totalInDistribution) * 100}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Low: ${distribution?.low || 0}`}
            />
          </div>

          {/* Distribution Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-bold mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Critical Risk</span>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{distribution?.critical || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Score &ge; 80</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>High Risk</span>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{distribution?.high || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Score 60 - 79</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 text-xs font-bold mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Moderate Risk</span>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{distribution?.moderate || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Score 30 - 59</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low / Healthy</span>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{distribution?.low || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Score &lt; 30</p>
            </div>
          </div>
        </div>

        {/* Department Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Department Risk Index</h3>
              <Building className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {departmentStats && departmentStats.length > 0 ? (
                departmentStats.map((dept) => {
                  const isHigh = dept.avgScore >= 60;
                  return (
                    <div key={dept.department} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                          {dept.department}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{dept.count} students</span>
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                              isHigh
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {dept.avgScore}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(dept.avgScore, 100)}%` }}
                          className={`h-full rounded-full ${
                            dept.avgScore >= 75
                              ? 'bg-rose-500'
                              : dept.avgScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">No department statistics available</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/faculty/analytics"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open Full Department Analytics &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Burnout Alerts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent High-Risk Burnout Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Students flagged by the automated prediction algorithm based on sleep deficit and task overload
            </p>
          </div>
          <Link
            to="/faculty/alerts"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Manage All Alerts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-4">Department & Year</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Contributing Factors</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAlerts && recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => {
                  const isCritical = alert.riskScore >= 80;
                  return (
                    <tr key={alert.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              isCritical
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {alert.student?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <Link
                              to={`/faculty/students/${alert.studentId}`}
                              className="font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                            >
                              {alert.student?.name || 'Student'}
                            </Link>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{alert.student?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold truncate max-w-[150px]">
                          {alert.student?.academicProfile?.branch || alert.student?.department || 'Engineering'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {alert.student?.academicProfile?.year || '2nd Year'} • Sec {alert.student?.section || 'A'}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              isCritical
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {alert.riskScore} / 100
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {alert.riskLevel}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {alert.contributingFactors && alert.contributingFactors.length > 0 ? (
                            alert.contributingFactors.slice(0, 2).map((factor, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                              >
                                {factor}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">Academic overload</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            alert.status === 'UNREVIEWED'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 animate-pulse'
                              : alert.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : alert.status === 'REVIEWED'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/faculty/students/${alert.studentId}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-1.5"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400 text-xs">
                    No active high-risk alerts at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
