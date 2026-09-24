import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Brain,
  Coffee,
  Moon,
  Clock,
  Flame,
  ShieldAlert,
  Wind,
  CheckCircle2,
  ArrowRight,
  X,
  RefreshCw,
  Zap,
  HeartPulse,
} from 'lucide-react';
import { nudgeAPI } from '../../services/api';

export const AiNudgeRecommendations = ({ nudges = [], onNudgesUpdated }) => {
  const navigate = useNavigate();
  const [localNudges, setLocalNudges] = useState(nudges);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissingId, setDismissingId] = useState(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setLocalNudges(nudges);
  }, [nudges]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await nudgeAPI.generateRecommendations();
      if (res.data?.nudges) {
        setLocalNudges(res.data.nudges);
      }
      if (onNudgesUpdated) {
        onNudgesUpdated();
      }
    } catch (err) {
      console.error('Failed to generate AI nudge recommendations:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = async (id, e) => {
    e.stopPropagation();
    try {
      setDismissingId(id);
      await nudgeAPI.dismissNudge(id);
      setLocalNudges((prev) => prev.filter((n) => n.id !== id));
      if (onNudgesUpdated) {
        onNudgesUpdated();
      }
    } catch (err) {
      console.error('Failed to dismiss nudge:', err);
    } finally {
      setDismissingId(null);
    }
  };

  const handleDismissAll = async () => {
    try {
      setIsRefreshing(true);
      await nudgeAPI.dismissAll();
      setLocalNudges([]);
      if (onNudgesUpdated) {
        onNudgesUpdated();
      }
    } catch (err) {
      console.error('Failed to dismiss all nudges:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getNudgeTheme = (type) => {
    switch (type) {
      case 'CODING_BREAK':
      case 'DSA_FATIGUE':
        return {
          icon: Coffee,
          bg: 'bg-amber-500/10 dark:bg-amber-950/30',
          border: 'border-amber-200/80 dark:border-amber-800/60',
          text: 'text-amber-900 dark:text-amber-200',
          badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300',
          iconColor: 'text-amber-600 dark:text-amber-400',
          categoryLabel: 'Cognitive Reset',
        };
      case 'SLEEP_DEFICIT':
      case 'LOW_SLEEP':
        return {
          icon: Moon,
          bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
          border: 'border-indigo-200/80 dark:border-indigo-800/60',
          text: 'text-indigo-900 dark:text-indigo-200',
          badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          categoryLabel: 'Sleep Calibration',
        };
      case 'DEADLINE_PRESSURE':
        return {
          icon: Clock,
          bg: 'bg-rose-500/10 dark:bg-rose-950/30',
          border: 'border-rose-200/80 dark:border-rose-800/60',
          text: 'text-rose-900 dark:text-rose-200',
          badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300',
          iconColor: 'text-rose-600 dark:text-rose-400',
          categoryLabel: 'Deadline Pacing',
        };
      case 'HIGH_STRESS':
        return {
          icon: Wind,
          bg: 'bg-teal-500/10 dark:bg-teal-950/30',
          border: 'border-teal-200/80 dark:border-teal-800/60',
          text: 'text-teal-900 dark:text-teal-200',
          badge: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300',
          iconColor: 'text-teal-600 dark:text-teal-400',
          categoryLabel: 'Stress Relief',
        };
      case 'RECOVERY_MODE':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-500/10 dark:bg-red-950/40',
          border: 'border-red-200/80 dark:border-red-800/60',
          text: 'text-red-900 dark:text-red-200',
          badge: 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400',
          categoryLabel: 'Critical Recovery',
        };
      case 'HEALTHY_MOMENTUM':
      default:
        return {
          icon: Sparkles,
          bg: 'bg-blue-500/10 dark:bg-blue-950/30',
          border: 'border-blue-200/80 dark:border-blue-800/60',
          text: 'text-blue-900 dark:text-blue-200',
          badge: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300',
          iconColor: 'text-blue-600 dark:text-blue-400',
          categoryLabel: 'AI Wellbeing Nudge',
        };
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-all">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/5 dark:from-indigo-600/10 dark:to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                AI Smart Nudge Recommendations
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Brain className="w-3 h-3" />
                Gemini Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized interventions based on your fatigue, sleep deficit, and upcoming deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {localNudges && localNudges.length > 1 && (
            <button
              onClick={handleDismissAll}
              disabled={isRefreshing}
              className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Clear All
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-xs transition-all cursor-pointer ${
              isRefreshing ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
            }`}
            title="Evaluate latest telemetry and get fresh AI recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'AI Analyzing...' : 'Refresh AI Nudges'}</span>
          </button>
        </div>
      </div>

      {/* Loading state during refresh */}
      {isRefreshing && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing student workload telemetry and cognitive fatigue patterns...</span>
          </div>
        </div>
      )}

      {/* Nudge list */}
      {localNudges && localNudges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
          {localNudges.map((nudge) => {
            const theme = getNudgeTheme(nudge.type);
            const Icon = theme.icon;
            const isDismissing = dismissingId === nudge.id;

            return (
              <div
                key={nudge.id}
                className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all ${
                  theme.bg
                } ${theme.border} ${isDismissing ? 'opacity-40 scale-95' : 'hover:shadow-xs'}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/90 shadow-2xs ${theme.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
                        {theme.categoryLabel}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDismiss(nudge.id, e)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                      title="Dismiss this nudge"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1 leading-snug">
                    {nudge.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {nudge.message}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    AI Guided
                  </span>

                  {nudge.actionLink && (
                    <button
                      onClick={() => navigate(nudge.actionLink)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-all"
                    >
                      <span>{nudge.actionLabel || 'Take Action'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / Balanced state */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Workload & Rest in Healthy Harmony
              </h4>
              <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                Your study hours, rest intervals, and deadline distribution are well-balanced. MindFlow's AI is continuously monitoring your telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/ai')}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-900/50 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/80 transition-all cursor-pointer"
          >
            <span>Ask AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AiNudgeRecommendations;
