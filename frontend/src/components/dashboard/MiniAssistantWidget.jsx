import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MiniAssistantWidget = () => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    navigate(`/ai?initial=${encodeURIComponent(input.trim())}`);
  };

  const handlePillClick = (prompt) => {
    navigate(`/ai?initial=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between h-full transition-colors duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">AI Wellbeing Assistant</h3>
        </div>

        {/* Snippet Conversation */}
        <div className="space-y-2.5 my-2">
          {/* User message snippet */}
          <div className="flex justify-end">
            <div className="bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900/60 rounded-2xl rounded-tr-xs px-3 py-2 text-xs font-medium max-w-[85%]">
              I feel stressed and have a lot of assignments this week.
            </div>
          </div>

          {/* Bot reply snippet */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl rounded-tl-xs p-3 text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">It sounds like you're under a lot of pressure. Here's what I suggest:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                <li>Break your tasks into smaller steps.</li>
                <li>Take a 10-minute break after each task.</li>
                <li>Try a quick breathing exercise.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <button
            onClick={() => handlePillClick('Create a study plan for today')}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Create study plan
          </button>
          <button
            onClick={() => handlePillClick('Why am I feeling stressed?')}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Why am I stressed?
          </button>
          <button
            onClick={() => handlePillClick('Give me a motivational quote')}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Give me a motivational quote
          </button>
        </div>
      </div>

      {/* Mini Input Bar */}
      <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
