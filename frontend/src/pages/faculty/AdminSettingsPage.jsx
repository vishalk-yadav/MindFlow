import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Save,
  Users,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  // Threshold form fields
  const [burnoutThreshold, setBurnoutThreshold] = useState(70);
  const [highThreshold, setHighThreshold] = useState(60);
  const [criticalThreshold, setCriticalThreshold] = useState(80);
  const [alertCooldownDays, setAlertCooldownDays] = useState(3);

  // New Faculty Modal
  const [addFacultyOpen, setAddFacultyOpen] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyPassword, setNewFacultyPassword] = useState('password123');
  const [newFacultyDept, setNewFacultyDept] = useState('Computer Science & Engineering');
  const [creatingFaculty, setCreatingFaculty] = useState(false);

  const fetchSettingsAndFaculty = async () => {
    try {
      setLoading(true);
      const [sRes, fRes] = await Promise.all([
        adminAPI.getSettings(),
        adminAPI.getFaculty(),
      ]);
      setSettings(sRes.data);
      setBurnoutThreshold(sRes.data.thresholds.burnoutThreshold);
      setHighThreshold(sRes.data.thresholds.highThreshold);
      setCriticalThreshold(sRes.data.thresholds.criticalThreshold);
      setAlertCooldownDays(sRes.data.thresholds.alertCooldownDays);

      setFacultyList(fRes.data || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load administrative settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndFaculty();
  }, []);

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    if (highThreshold >= criticalThreshold) {
      alert('High threshold must be lower than critical threshold.');
      return;
    }

    try {
      setSaving(true);
      await adminAPI.updateSettings({
        burnoutThreshold: parseInt(burnoutThreshold, 10),
        highThreshold: parseInt(highThreshold, 10),
        criticalThreshold: parseInt(criticalThreshold, 10),
        alertCooldownDays: parseInt(alertCooldownDays, 10),
      });
      setSaveSuccess('Burnout thresholds updated successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update thresholds:', err);
      alert('Error updating thresholds.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      setCreatingFaculty(true);
      await adminAPI.createFaculty({
        name: newFacultyName,
        email: newFacultyEmail,
        password: newFacultyPassword,
        department: newFacultyDept,
      });
      setAddFacultyOpen(false);
      setNewFacultyName('');
      setNewFacultyEmail('');
      fetchSettingsAndFaculty();
    } catch (err) {
      console.error('Failed to create faculty:', err);
      alert(err.response?.data?.error || 'Failed to create faculty member.');
    } finally {
      setCreatingFaculty(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading admin configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Institution Burnout Policy & Thresholds
            </h2>
            <p className="text-xs text-slate-400">
              Configure parameters governing automatic alert generation and cooldown periods
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Configuration Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">Sensitivity Limits</h3>
        <p className="text-xs text-slate-400 mb-6">
          When a student check-in scores above these values, the system flags the student and notifies the assigned department faculty.
        </p>

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSaveThresholds} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Burnout Alert Threshold
              </label>
              <input
                type="number"
                min="30"
                max="95"
                value={burnoutThreshold}
                onChange={(e) => setBurnoutThreshold(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block">Standard trigger score (default: 70)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                High Risk Threshold
              </label>
              <input
                type="number"
                min="30"
                max="85"
                value={highThreshold}
                onChange={(e) => setHighThreshold(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 block">Approaching burnout (default: 60)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                Critical Alert Threshold
              </label>
              <input
                type="number"
                min="70"
                max="99"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-400 block">Urgent intervention limit (default: 80)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Alert Cooldown (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={alertCooldownDays}
                onChange={(e) => setAlertCooldownDays(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block">Prevents duplicate alert spam (default: 3)</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Faculty Team Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Department Faculty Mentors
            </h3>
            <p className="text-xs text-slate-400">
              Faculty assigned to monitor student burnout and perform supportive interventions
            </p>
          </div>

          <button
            onClick={() => setAddFacultyOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Faculty Member</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Faculty Member</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Support Interventions</th>
                <th className="py-3.5 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {facultyList.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{f.name}</p>
                    <p className="text-[11px] text-slate-400">{f.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {f.department}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.role === 'ADMIN'
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {f.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {f._count?.interventionNotes || 0} notes logged
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Faculty Modal */}
      {addFacultyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Onboard Faculty Member
              </h3>
              <button
                onClick={() => setAddFacultyOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Anjali Sen"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="anjali.sen@mindflow.edu"
                  value={newFacultyEmail}
                  onChange={(e) => setNewFacultyEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={newFacultyDept}
                  onChange={(e) => setNewFacultyDept(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={newFacultyPassword}
                  onChange={(e) => setNewFacultyPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddFacultyOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFaculty}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {creatingFaculty ? 'Creating...' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
