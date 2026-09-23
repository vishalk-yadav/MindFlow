import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { facultyAPI } from '../../services/api';

export const FacultyStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [riskLevel, setRiskLevel] = useState('ALL');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (department) params.department = department;
      if (year) params.year = year;
      if (riskLevel && riskLevel !== 'ALL') params.riskLevel = riskLevel;

      const res = await facultyAPI.getStudents(params);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Unable to load students directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, department, year, riskLevel]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse, monitor, and assess wellbeing across all registered engineering students
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
            {students.length} students found
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics & Communication</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Academic Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk (&ge; 80)</option>
              <option value="HIGH">High Risk (60 - 79)</option>
              <option value="MODERATE">Moderate Risk (30 - 59)</option>
              <option value="LOW">Low Risk (&lt; 30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading student directory...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-500 font-semibold">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-4">Department & Class</th>
                  <th className="py-4 px-4">Burnout Score</th>
                  <th className="py-4 px-4">Risk Level</th>
                  <th className="py-4 px-4">Last Check-in</th>
                  <th className="py-4 px-4">Active Tasks</th>
                  <th className="py-4 px-6 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.length > 0 ? (
                  students.map((student) => {
                    const score = student.burnoutScore ?? 35;
                    const isCritical = score >= 80;
                    const isHigh = score >= 60 && score < 80;
                    const isModerate = score >= 30 && score < 60;

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-2xl font-bold text-xs flex items-center justify-center shrink-0 ${
                                isCritical
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                  : isHigh
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                  : isModerate
                                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/faculty/students/${student.id}`}
                                  className="font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                >
                                  {student.name}
                                </Link>
                                {student.hasActiveAlert && (
                                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold px-1.5 py-0.2 rounded animate-pulse">
                                    Alert
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                          <p className="font-semibold truncate max-w-[160px]">{student.department}</p>
                          <p className="text-[10px] text-slate-400">
                            {student.year} • Sec {student.section}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                                isCritical
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                  : isHigh
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                  : isModerate
                                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {score} / 100
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isCritical
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                : isHigh
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                                : isModerate
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}
                          >
                            {student.riskLevel}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {student.lastCheckIn ? (
                            <span>
                              {new Date(student.lastCheckIn).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-400">No check-in</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                          <span>{student.activeTasksCount} tasks</span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/faculty/students/${student.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                      No students matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
