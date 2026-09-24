import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Paperclip,
  Mic,
  Calendar,
  Flame,
  Gamepad2,
  Wind,
  ChevronRight,
  Smile,
  Moon,
  ShieldAlert,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { aiAPI, plannerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const quickPromptPills = [
  'Plan my day',
  'Reduce stress',
  'Manage workload',
  'Chat about anything',
];

const suggestedQuestions = [
  'Why is my burnout score high?',
  'How can I reduce my workload?',
  'Give me a 2-minute breathing exercise',
  'What are some quick relaxation games?',
  'How can I improve my sleep?',
];

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => `${prev ? prev + ' ' : ''}[Attached file: ${file.name}] `);
      showToast(`Attached "${file.name}"`, 'info');
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice input is not supported in this browser. Please type your message.', 'info');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      setIsRecording(true);
      showToast('Listening... Speak now', 'info');

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setInput((prev) => `${prev ? prev + ' ' : ''}${speechResult}`);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        showToast('Could not hear voice input. Please try again.', 'error');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
      showToast('Could not start microphone.', 'error');
    }
  };

  const studentName = user?.anonymousMode ? 'Anonymous' : (user?.name || 'Student');

  const fetchHistory = async () => {
    try {
      const res = await aiAPI.getHistory();
      if (res.data.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        // Initial bot welcome message
        setMessages([
          {
            id: 'init-1',
            sender: 'ASSISTANT',
            content: `Hi ${studentName}! 👋 I'm your MindFlow assistant. I'm here to help you with your study plans, workload, wellbeing, and any concerns you have. How can I assist you today?`,
            createdAt: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await aiAPI.getStatus();
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchStatus();
  }, []);

  // Handle initial prompt passed in URL e.g. /ai?initial=Why%20am%20I%20stressed
  useEffect(() => {
    const initialQuery = searchParams.get('initial') || searchParams.get('prompt');
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = async () => {
    try {
      await aiAPI.clearHistory();
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'ASSISTANT',
          content: `Hi ${studentName}! 👋 I'm your MindFlow assistant. How can I assist you right now?`,
          createdAt: new Date(),
        },
      ]);
      showToast('Started a fresh conversation session.', 'info');
    } catch (err) {
      showToast('Failed to reset conversation.', 'error');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'USER',
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.sendMessage(text);
      setMessages((prev) => [...prev, res.data.message]);
      fetchStatus();
    } catch (err) {
      console.error(err);
      showToast('Failed to get AI response.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType) => {
    if (actionType === 'CREATE_PLAN') {
      try {
        await plannerAPI.generatePlan({ forceRecovery: true });
        showToast('Generated 5-day recovery study plan!', 'success');
        navigate('/planner');
      } catch (err) {
        console.error(err);
      }
    } else if (actionType === 'START_BREAK') {
      navigate('/focus?mode=break');
    } else if (actionType === 'PLAY_GAME') {
      navigate('/games');
    } else if (actionType === 'OPEN_BREATHING') {
      navigate('/games?game=breathing');
    } else if (actionType === 'DISMISS') {
      showToast('Action dismissed.', 'info');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
      {/* LEFT / MAIN CONVERSATION AREA (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-[82vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">AI Wellbeing Assistant</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Your personal companion for better focus, lower stress and a healthier you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Start a fresh conversation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Quick Prompt Pills Bar */}
        <div className="px-6 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          {quickPromptPills.map((pill) => (
            <button
              key={pill}
              onClick={() => handleSendMessage(pill)}
              className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 text-slate-600 dark:text-slate-300 text-xs font-semibold shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'USER';
            const structured = msg.structuredData;

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-500/10'
                      : 'bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Structured Plan Card if present */}
                  {structured && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-3 text-slate-800 dark:text-slate-100">
                      {structured.title && (
                        <h4 className="font-bold text-xs flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{structured.title}</span>
                        </h4>
                      )}

                      {structured.steps && (
                        <ol className="space-y-1.5 pl-1">
                          {structured.steps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {/* Burnout Notice Box */}
                      {structured.burnoutNotice && (
                        <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{structured.burnoutNotice}</span>
                        </div>
                      )}

                      {/* Confirmation Prompt & Action Buttons */}
                      {structured.actionPrompt && (
                        <p className="font-semibold text-slate-800 dark:text-slate-200 pt-1">
                          {structured.actionPrompt}
                        </p>
                      )}

                      {structured.actions && (
                        <div className="flex items-center gap-2 pt-1">
                          {structured.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleAction(act.action)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                act.variant === 'primary'
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
                                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-2 font-medium ${
                      isUser ? 'text-blue-100 text-right' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 py-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic font-medium">MindFlow Assistant is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttach}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.json"
          />
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-4 py-2 focus-within:border-purple-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-2xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 p-1 transition-colors cursor-pointer"
              title="Attach notes or study file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-1 transition-colors cursor-pointer ${
                isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              title={isRecording ? 'Listening...' : 'Voice message'}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Quick Actions + Suggested Questions + Status + Motivation (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Quick Actions</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('CREATE_PLAN')}
              className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 hover:bg-purple-100/60 dark:hover:bg-purple-950/50 transition-all group cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Create Study Plan</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100/60 dark:hover:bg-rose-950/50 transition-all group cursor-pointer"
            >
              <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Check Burnout</span>
            </button>

            <button
              onClick={() => navigate('/games')}
              className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 transition-all group cursor-pointer"
            >
              <Gamepad2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Play a Game</span>
            </button>

            <button
              onClick={() => navigate('/games?game=breathing')}
              className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100/60 dark:hover:bg-blue-950/50 transition-all group cursor-pointer"
            >
              <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Breathing Exercise</span>
            </button>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-3">Suggested Questions</h3>
          <div className="space-y-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="w-full text-left p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-100 dark:border-slate-700/60 hover:border-purple-200 dark:hover:border-purple-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between transition-all cursor-pointer"
              >
                <span>{q}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Your Current Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Your Current Status</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Burnout Risk</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                  {status?.burnoutRisk?.riskLevel || 'Moderate'}
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{status?.burnoutRisk?.score || 64}/100</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Today's Mood</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <span>😊</span>
                <span>{status?.todayMood || 'Good'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Stress Level</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{status?.stressLevel || '6/10'}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Sleep (last night)</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{status?.sleepLastNight || '6.2 hrs'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Scenic Motivation Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100/70 via-teal-100/60 to-blue-100/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-blue-950/30 p-6 border border-emerald-200/50 dark:border-emerald-800/40 shadow-soft">
          <div className="relative z-10">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block mb-1">You're doing great!</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              Small steps every day lead to big changes. Protect your recovery time to maintain mental clarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
