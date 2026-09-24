import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DailyCheckInModal } from '../checkin/DailyCheckInModal';
import { Smile, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Layout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const location = useLocation();

  // Reset scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const userName = user?.anonymousMode ? 'Anonymous' : (user?.name || 'Student');

  // Dynamic titles and subtitles based on route
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: `Good Morning, ${userName}! 👋`,
          subtitle: 'Small steps today, big changes tomorrow.',
        };
      case '/tasks':
        return {
          title: `Good Morning, ${userName}! 👋`,
          subtitle: "Here's your to-do list for today. Stay focused and take breaks.",
        };
      case '/focus':
        return {
          title: `Good Morning, ${userName}! 👋`,
          subtitle: 'Take a focused session, stay productive and keep your mind fresh.',
        };
      case '/ai':
        return {
          title: 'AI Wellbeing Assistant',
          subtitle: 'Your personal companion for better focus, lower stress and a healthier you.',
        };
      case '/games':
        return {
          title: 'Wellbeing Games',
          subtitle: 'Take a short cognitive reset. Fun, quick, non-competitive games.',
        };
      case '/checkin':
        return {
          title: 'Daily Wellbeing Check-in',
          subtitle: '15-second pulse check to track your sleep, stress, and workload trends.',
        };
      case '/planner':
        return {
          title: 'Event & Study Planner',
          subtitle: 'Schedule events on your calendar, track daily study blocks, and get notified on that day.',
        };
      case '/analytics':
        return {
          title: 'Engineering Analytics & Trends',
          subtitle: 'Understand your workload, focus distribution, and burnout indicators.',
        };
      case '/settings':
        return {
          title: 'Settings & Privacy Dashboard',
          subtitle: 'Manage your profile, academic workload targets, and data privacy.',
        };
      default:
        return {
          title: 'MindFlow',
          subtitle: 'Study smarter. Code better. Recover better.',
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Floating Daily Check-In Action Button */}
      <button
        onClick={() => setCheckInModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-full shadow-lg shadow-emerald-500/25 flex items-center gap-2.5 font-semibold text-sm hover:scale-105 transition-all"
      >
        <Smile className="w-5 h-5" />
        <span className="hidden sm:inline">Daily Check-in</span>
      </button>

      {/* Daily Check-in Modal */}
      {checkInModalOpen && (
        <DailyCheckInModal onClose={() => setCheckInModalOpen(false)} />
      )}
    </div>
  );
};
