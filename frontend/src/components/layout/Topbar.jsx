import React, { useState } from 'react';
import { Menu, Bell, Calendar, ChevronDown, User, Shield, LogOut, Check, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';

export const Topbar = ({ onMenuClick, title, subtitle }) => {
  const { user, logout, toggleAnonymousMode } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, clearNotifications, fetchNotifications } = useNotification();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleNotifications = () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next) {
      fetchNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleAnonymous = async () => {
    try {
      await toggleAnonymousMode();
    } catch (err) {
      console.error(err);
    }
  };

  // Get current date string e.g. "Apr 26, 2025"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const studentName = user?.anonymousMode ? 'Anonymous' : (user?.name || 'Student');
  const avatarLetter = studentName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-[#f8fafc]/90 dark:bg-slate-950/90 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between transition-colors duration-200">
      {/* Left Greeting & Subheading */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {title || `Good Morning, ${studentName}! 👋`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {subtitle || "Here's your wellbeing and workload overview. Stay focused and take breaks."}
          </p>
        </div>
      </div>

      {/* Right Controls: Date, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Date Display Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>{formattedDate}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-amber-400 shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900 transition-colors animate-in fade-in zoom-in duration-200" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="relative p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 shadow-xs transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 z-50 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAsRead('all')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-3 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 rounded-xl text-left cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                          : 'bg-blue-50/60 dark:bg-blue-950/40 text-slate-800 dark:text-slate-200 border-l-3 border-blue-600 dark:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              {avatarLetter}
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
              {studentName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {user?.anonymousMode ? 'Anonymous Student #4092' : (user?.name || 'Student')}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.anonymousMode ? 'hidden@mindflow.local' : (user?.email || 'student@mindflow.edu')}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">CSE • 2nd Year</span>
                </div>
              </div>

              {/* Anonymous Mode Toggle Button */}
              <button
                onClick={handleToggleAnonymous}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Anonymous Mode</span>
                </div>
                <div
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    user?.anonymousMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-200 ${
                      user?.anonymousMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              <Link
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Profile & Privacy</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
