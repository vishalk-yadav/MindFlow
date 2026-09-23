import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Sparkles,
  Coffee,
  CheckCircle2,
  Clock,
  BookOpen,
  Plus,
  Flame,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { plannerAPI, examAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import confetti from '../utils/confetti';

export const PlannerPage = () => {
  const { showToast } = useNotification();
  const [plan, setPlan] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPlanAndExams = async () => {
    try {
      setLoading(true);
      const [planRes, examRes] = await Promise.all([
        plannerAPI.getPlan(),
        examAPI.getExams(),
      ]);
      setPlan(planRes.data);
      setExams(examRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanAndExams();
  }, []);

  const handleGenerate = async (forceRecovery = false) => {
    try {
      setGenerating(true);
      const res = await plannerAPI.generatePlan({ forceRecovery });
      setPlan(res.data);
      confetti({ particleCount: 40, spread: 60 });
      showToast(
        forceRecovery
          ? 'Generated recovery-focused study schedule!'
          : 'Generated balanced study schedule!',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to generate study plan.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTopic = async (exam, topicIdx) => {
    const updatedList = [...exam.topicsList];
    updatedList[topicIdx].completed = !updatedList[topicIdx].completed;

    try {
      const res = await examAPI.updateTopics(exam.id, updatedList);
      setExams((prev) => prev.map((e) => (e.id === exam.id ? res.data : e)));
      showToast('Exam topic updated!', 'success');
      if (updatedList[topicIdx].completed) {
        confetti({ particleCount: 30, spread: 40 });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update topic', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
      {/* LEFT COLUMN: Study Timeline Schedule (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Smart Daily Study Planner</span>
                {plan?.burnoutAdapted && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    Recovery Pacing
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Distributes tasks into realistic cognitive blocks with protected mindful breaks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerate(false)}
                disabled={generating}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generating ? 'Planning...' : 'Generate Plan'}</span>
              </button>

              <button
                onClick={() => handleGenerate(true)}
                disabled={generating}
                className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 disabled:opacity-50 transition-all cursor-pointer"
              >
                Recovery Mode
              </button>
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="mt-6 space-y-4">
            {plan?.schedule && plan.schedule.length > 0 ? (
              plan.schedule.map((item, idx) => {
                const isBreak = item.type === 'BREAK';

                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      isBreak
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-800 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {/* Time pill */}
                    <div className="shrink-0 w-28 text-center py-1 px-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {item.startTime} – {item.endTime}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isBreak ? (
                          <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                        {!isBreak && item.priority && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {item.priority}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.description || item.recommendation}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                      {item.durationMinutes} min
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-12 text-center">
                Click "Generate Plan" to organize your pending engineering assignments and DSA goals.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Exam Mode & Deadlines (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Exam Mode Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Exam Mode</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
              Active
            </span>
          </div>

          {exams.length > 0 ? (
            exams.map((exam) => {
              const prepPercent = Math.round((exam.topicsCompleted / (exam.topicsTotal || 1)) * 100);

              return (
                <div key={exam.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{exam.subject}</h4>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">5 days remaining</p>
                    </div>
                    <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60 px-2 py-1 rounded-xl">
                      {prepPercent}% Ready
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${prepPercent}%` }}
                    />
                  </div>

                  {/* Topics remaining checklist */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Revision Topics:</p>
                    <div className="space-y-2">
                      {exam.topicsList?.map((t, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleTopic(exam, idx)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            t.completed
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-600'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                              t.completed
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate">{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No exams scheduled.</p>
          )}
        </div>

        {/* Academic Deadlines Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Upcoming Pressure</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Tomorrow</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">DBMS Assignment</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">2 Days</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">OS Lab Record Submission</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">4 Days</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Math Test</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
