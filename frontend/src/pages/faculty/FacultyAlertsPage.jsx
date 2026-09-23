import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  UserCheck,
  Check,
  MessageSquare,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  ExternalLink
} from 'lucide-react';
import { facultyAPI } from '../../services/api';

export const FacultyAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('risk_desc');

  // Modal State
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [actionType, setActionType] = useState('NOTE');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (riskFilter !== 'ALL') params.riskLevel = riskFilter;
      params.sort = sortOrder;

      const res = await facultyAPI.getAlerts(params);
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, riskFilter, sortOrder]);

  const handleReview = async (alertId) => {
    try {
      await facultyAPI.reviewAlert(alertId);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to review alert:', err);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await facultyAPI.resolveAlert(alertId);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedAlert || !noteText.trim()) return;

    try {
      setSubmittingNote(true);
      await facultyAPI.addInterventionNote(selectedAlert.id, {
        note: noteText.trim(),
        actionType,
      });
      setSuccessMsg('Intervention action logged successfully!');
      setNoteText('');
      setTimeout(() => {
        setNoteModalOpen(false);
        setSuccessMsg('');
        setSelectedAlert(null);
      }, 1000);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to log intervention note:', err);
      alert('Failed to log note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const openNoteModal = (alert) => {
    setSelectedAlert(alert);
    setNoteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Status Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Active Burnout Escalations & Alerts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Early warning triggers generated automatically when student fatigue crosses institutional safety limits
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
            {alerts.length} alerts in view
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'UNREVIEWED', label: 'Unreviewed' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'REVIEWED', label: 'Reviewed' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (&ge; 80)</option>
              <option value="HIGH">High (60 - 79)</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="risk_desc">Highest Risk First</option>
              <option value="date_desc">Newest First</option>
              <option value="risk_asc">Lowest Risk First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">All Clear!</h3>
          <p className="text-xs text-slate-400 mt-1">No alerts match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isCritical = alert.riskScore >= 80;
            return (
              <div
                key={alert.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Header row: Student info + Status & Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 ${
                        isCritical
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {alert.student?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/faculty/students/${alert.studentId}`}
                          className="font-bold text-base text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                        >
                          {alert.student?.name || 'Student'}
                        </Link>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {alert.riskScore} / 100 • {alert.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {alert.student?.academicProfile?.branch || alert.student?.department} •{' '}
                        {alert.student?.academicProfile?.year || '2nd Year'} • {alert.student?.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill & Timestamp */}
                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
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
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(alert.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                </div>

                {/* Reason & Contributing Factors */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    <span className="font-bold text-slate-800 dark:text-slate-100">Reason:</span>{' '}
                    {alert.reason || 'Critical academic fatigue and acute sleep deficit detected.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Factors:</span>
                    {alert.contributingFactors?.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] text-slate-600 dark:text-slate-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Intervention Notes History if any */}
                {alert.interventionNotes && alert.interventionNotes.length > 0 && (
                  <div className="pl-4 border-l-2 border-blue-500/40 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Faculty Actions Logged ({alert.interventionNotes.length})
                    </p>
                    {alert.interventionNotes.map((note) => (
                      <div key={note.id} className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {note.faculty?.name}:
                        </span>{' '}
                        {note.note}{' '}
                        <span className="text-[10px] text-slate-400">
                          ({new Date(note.createdAt).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to={`/faculty/students/${alert.studentId}`}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Student Profile & Trends</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openNoteModal(alert)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Note / Action</span>
                    </button>

                    {alert.status === 'UNREVIEWED' && (
                      <button
                        onClick={() => handleReview(alert.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Mark Reviewed</span>
                      </button>
                    )}

                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve Alert</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Intervention Note Modal */}
      {noteModalOpen && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Support Action for {selectedAlert.student?.name}
              </h3>
              <button
                onClick={() => setNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Intervention Action Category
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NOTE">General Observation / Log</option>
                    <option value="CONTACTED_STUDENT">Scheduled 1-on-1 Counseling Session</option>
                    <option value="ACADEMIC_ADJUSTMENT">Granted Assignment / Lab Extension</option>
                    <option value="COUNSELLING_REFERRED">Referred to Campus Mental Health Clinic</option>
                    <option value="RESOLVED">Verified Fatigue Recovery & Workload Balance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supportive Notes (Confidential)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Log supportive actions taken, conversation points, or academic adjustments..."
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
                    Cancel
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
