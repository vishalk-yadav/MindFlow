import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  AlertTriangle,
  Clock,
  Moon,
  BookOpen,
  Calendar,
  CheckCircle2,
  Shield,
  MessageSquare,
  Plus,
  Send,
  UserCheck,
  Check,
  Building,
  Sparkles
} from 'lucide-react';
import { facultyAPI } from '../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const FacultyStudentDetailPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Intervention Note Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [actionType, setActionType] = useState('NOTE');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await facultyAPI.getStudentDetail(id);
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load student detail:', err);
      setError('Unable to load student wellbeing profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudentProfile();
    }
  }, [id]);

  const handleReviewAlert = async (alertId) => {
    try {
      await facultyAPI.reviewAlert(alertId);
      fetchStudentProfile();
    } catch (err) {
      console.error('Failed to review alert:', err);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await facultyAPI.resolveAlert(alertId);
      fetchStudentProfile();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleAddInterventionNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    // Use active alert id if present, or first alert
    const targetAlertId = profile?.alerts?.[0]?.id;
    if (!targetAlertId) {
      alert('Student currently has no open alert to attach an intervention note to.');
      return;
    }

    try {
      setSubmittingNote(true);
      await facultyAPI.addInterventionNote(targetAlertId, {
        note: noteText.trim(),
        actionType,
      });
      setNoteSuccess('Intervention note logged successfully.');
      setNoteText('');
      setTimeout(() => {
        setNoteModalOpen(false);
        setNoteSuccess('');
      }, 1200);
      fetchStudentProfile();
    } catch (err) {
      console.error('Failed to log intervention note:', err);
      alert('Failed to log note. Please try again.');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading student profile & burnout records...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm">
        {error || 'Student not found.'}
      </div>
    );
  }

  const { student, currentBurnout, trends, checkInHistory, tasksSummary, alerts } = profile;
  const isCritical = currentBurnout.score >= 80;
  const isHigh = currentBurnout.score >= 60 && currentBurnout.score < 80;
  const hasActiveAlert = alerts && alerts.length > 0 && alerts[0].status !== 'RESOLVED';
  const activeAlert = alerts && alerts[0];

  // Format Recharts data
  const chartData = (trends?.burnoutHistory || []).map((b, idx) => ({
    name: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: b.score,
    threshold: 70,
  }));

  return (
    <div className="space-y-6">
      {/* Top Navigation & Student Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/faculty/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>

        {hasActiveAlert && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNoteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Supportive Action</span>
            </button>
            {activeAlert?.status === 'UNREVIEWED' && (
              <button
                onClick={() => handleReviewAlert(activeAlert.id)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Mark Reviewed</span>
              </button>
            )}
            {activeAlert?.status !== 'RESOLVED' && (
              <button
                onClick={() => handleResolveAlert(activeAlert.id)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Resolve Alert</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Student Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-3xl font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md ${
                isCritical
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                  : isHigh
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              }`}
            >
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{student.name}</h1>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      : isHigh
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {currentBurnout.riskLevel} RISK ({currentBurnout.score}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{student.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{student.department}</span>
                <span>•</span>
                <span>{student.year}</span>
                <span>•</span>
                <span>Section {student.section}</span>
                <span>•</span>
                <span>Semester {student.semester}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 font-semibold block">Avg Sleep</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {trends?.avgSleep || 7.0} hrs
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 font-semibold block">Avg Study</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {trends?.avgStudy || 6.0} hrs
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 font-semibold block">Task Load</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {tasksSummary?.pending || 0} active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Burnout Analysis & Contributing Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score & Clinical Assessment */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Burnout Assessment</h3>
            <Flame className={`w-5 h-5 ${isCritical ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Predicted Score</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {currentBurnout.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${currentBurnout.score}%` }}
                className={`h-full rounded-full ${
                  isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-blue-500'
                }`}
              />
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentBurnout.explanation}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Flagged Risk Drivers:
            </span>
            {currentBurnout.negativeFactors && currentBurnout.negativeFactors.length > 0 ? (
              currentBurnout.negativeFactors.map((neg, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{neg}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No severe risk drivers detected.</p>
            )}
          </div>
        </div>

        {/* Burnout History Trend Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Burnout Trend (Past 14 Days)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily calculated fatigue index vs institutional threshold (70)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Threshold: 70
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
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
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Alert Limit (70)', fill: '#f43f5e', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={isCritical ? '#f43f5e' : '#3b82f6'}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs / Two Columns: Check-ins & Faculty Intervention Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Check-Ins Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Recent Daily Check-ins</h3>
            <span className="text-xs text-slate-400 font-medium">Past 7 logs</span>
          </div>

          <div className="space-y-3">
            {checkInHistory && checkInHistory.length > 0 ? (
              checkInHistory.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {new Date(c.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Workload: <span className="font-semibold text-slate-600 dark:text-slate-300">{c.mainWorkload}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                    <div className="text-right">
                      <span className="font-bold block">{c.studyHours}h study</span>
                      <span className="text-[10px] text-slate-400">{c.sleepHours}h sleep</span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        c.stressLevel >= 7
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      Stress: {c.stressLevel}/10
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No check-ins recorded yet.</p>
            )}
          </div>
        </div>

        {/* Faculty Support & Intervention History */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Faculty Intervention Notes</h3>
            {hasActiveAlert && (
              <button
                onClick={() => setNoteModalOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {alerts && alerts.length > 0 && alerts.some((a) => a.interventionNotes?.length > 0) ? (
              alerts.flatMap((a) => a.interventionNotes || []).map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {note.faculty?.name || 'Faculty Mentor'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{note.note}</p>
                  <div className="pt-1 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Action: {note.actionType}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No intervention notes logged yet for this student.
                </p>
                {hasActiveAlert && (
                  <button
                    onClick={() => setNoteModalOpen(true)}
                    className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Click to add the first supportive note
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Supportive Action Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Log Supportive Action & Intervention
              </h3>
              <button
                onClick={() => setNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            {noteSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center">
                {noteSuccess}
              </div>
            ) : (
              <form onSubmit={handleAddInterventionNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Intervention Action Category
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NOTE">General Supportive Observation</option>
                    <option value="CONTACTED_STUDENT">Scheduled 1-on-1 Counseling Session</option>
                    <option value="ACADEMIC_ADJUSTMENT">Granted Assignment / Lab Extension</option>
                    <option value="COUNSELLING_REFERRED">Referred to Campus Mental Health Clinic</option>
                    <option value="RESOLVED">Verified Fatigue Recovery & Workload Balance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supportive Details & Plan (Confidential)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g., Met with student to review 3 overlapping deadlines. Extended lab report to next Monday and suggested 7-hour sleep schedule..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNote}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {submittingNote ? 'Saving...' : 'Save Intervention'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
