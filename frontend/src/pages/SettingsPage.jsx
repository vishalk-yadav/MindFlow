import React, { useState, useEffect } from 'react';
import {
  Shield,
  Download,
  Trash2,
  User,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { privacyAPI, authAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
  const { user, toggleAnonymousMode, logout } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [privacyData, setPrivacyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile edit state
  const [targetSleep, setTargetSleep] = useState(user?.profile?.targetSleepHours || 7.5);
  const [dailyStudy, setDailyStudy] = useState(user?.profile?.dailyStudyHours || 6.0);
  const [branch, setBranch] = useState(user?.academicProfile?.branch || 'Computer Science & Engineering');
  const [year, setYear] = useState(user?.academicProfile?.year || '2nd Year');

  const fetchPrivacy = async () => {
    try {
      const res = await privacyAPI.getOverview();
      setPrivacyData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacy();
  }, []);

  const handleToggleAnonymous = async () => {
    try {
      const res = await toggleAnonymousMode();
      showToast(
        res.anonymousMode ? 'Anonymous Mode enabled!' : 'Anonymous Mode disabled.',
        'info'
      );
      fetchPrivacy();
    } catch (err) {
      showToast('Failed to toggle anonymous mode.', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateOnboarding({
        targetSleepHours: targetSleep,
        dailyStudyHours: dailyStudy,
        branch,
        year,
      });
      showToast('Profile and study targets updated!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await privacyAPI.exportData(format);
      const blob = new Blob([format === 'csv' ? res.data : JSON.stringify(res.data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindflow_export_${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast(`Exported user data as ${format.toUpperCase()}!`, 'success');
    } catch (err) {
      showToast('Failed to export data.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await privacyAPI.deleteAccount();
      logout();
      showToast('Account permanently deleted.', 'info');
      navigate('/register');
    } catch (err) {
      showToast('Failed to delete account.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      {/* 1. Academic & Wellbeing Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Engineering Student Profile</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Manage your branch, year, and baseline recovery targets.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Engineering Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Year / Semester</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Sleep (hours/night)</label>
            <input
              type="number"
              step="0.5"
              min="4"
              max="12"
              value={targetSleep}
              onChange={(e) => setTargetSleep(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Study/Work Hours (daily)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="16"
              value={dailyStudy}
              onChange={(e) => setDailyStudy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Targets</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Anonymous Mode & Privacy Dashboard (Section 38 & 39) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Privacy Dashboard & Anonymous Mode</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total transparency over what telemetry data is stored and why.</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleAnonymous}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
              user?.anonymousMode
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{user?.anonymousMode ? 'Anonymous Mode: ON' : 'Anonymous Mode: OFF'}</span>
          </button>
        </div>

        {/* Categories Table */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Stored Data Categories & Usage:</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            {privacyData?.categories?.map((cat) => (
              <div key={cat.name} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <div className="font-bold text-slate-800 dark:text-slate-200 sm:w-1/3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{cat.name}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] sm:w-2/3">{cat.purpose}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Export (Section 40) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Export Your MindFlow Data</h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Download your complete personal dataset at any time in open JSON or CSV formats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Tasks CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Danger Zone: Delete Account (Section 41) */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/40 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Delete Account & Purge Telemetry</span>
          </h4>
          <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5 max-w-md">
            Permanently remove your student profile, tasks, check-in history, burnout records, and focus sessions. This cannot be undone.
          </p>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all shrink-0"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Are you sure you want to delete your account? All your engineering tasks, habits, burnout trend records, and AI chats will be deleted permanently.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
