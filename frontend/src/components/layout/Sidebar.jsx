import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Gamepad2,
  Smile,
  BarChart3,
  Bot,
  Settings,
  CalendarDays,
  Heart,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'To-Do List', path: '/tasks', icon: CheckSquare },
  { name: 'Focus Timer', path: '/focus', icon: Timer },
  { name: 'Wellbeing Games', path: '/games', icon: Gamepad2 },
  { name: 'Mood Check-in', path: '/checkin', icon: Smile },
  { name: 'Event Planner', path: '/planner', icon: CalendarDays },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'AI Assistant', path: '/ai', icon: Bot },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 select-none transition-colors duration-200">
      {/* Top: Logo & Nav items */}
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm text-white">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-10 2" />
                <path d="M12 9c-2 0-4 1-5 3" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                MindFlow
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Work smarter. Recover better.</p>
            </div>
          </div>
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-slate-400 dark:text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
                {item.name === 'AI Assistant' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Quote Card */}
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-800/90 dark:via-slate-800 dark:to-teal-950/20 border border-emerald-100/60 dark:border-slate-700/60 p-4 shadow-xs">
          <div className="relative z-10">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "Small steps every day lead to big changes."
            </p>
            <div className="mt-3 flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <Heart className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950/60 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">MindFlow</span>
            </div>
          </div>
          {/* Decorative botanical leaf illustration */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 opacity-25 pointer-events-none text-emerald-600 dark:text-emerald-500">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M20,80 Q50,20 90,10 Q60,60 20,80 Z" />
              <path d="M40,65 Q60,40 75,25" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white dark:bg-slate-900 z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
