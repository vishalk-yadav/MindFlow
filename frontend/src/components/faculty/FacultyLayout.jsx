import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FacultySidebar } from './FacultySidebar';
import { FacultyTopbar } from './FacultyTopbar';
import { useAuth } from '../../context/AuthContext';

export const FacultyLayout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.includes('/faculty/dashboard')) {
      return {
        title: `Welcome, ${user?.name?.split(' ')[0] || 'Faculty'} 👋`,
        subtitle: 'Student burnout surveillance, academic fatigue indicators, and early intervention overview.',
      };
    }
    if (path.includes('/faculty/students/') && path !== '/faculty/students') {
      return {
        title: 'Student Wellbeing Profile',
        subtitle: 'Confidential burnout metrics, workload distribution, and faculty support log.',
      };
    }
    if (path.includes('/faculty/students')) {
      return {
        title: 'Student Directory & Risk Registry',
        subtitle: 'Filter students across departments, semesters, and burnout risk thresholds.',
      };
    }
    if (path.includes('/faculty/alerts')) {
      return {
        title: 'Burnout Alerts & Escalations',
        subtitle: 'Review students crossing critical burnout limits and initiate supportive interventions.',
      };
    }
    if (path.includes('/faculty/analytics')) {
      return {
        title: 'Institutional Wellbeing Analytics',
        subtitle: 'Department-wide fatigue trends, sleep deprivation patterns, and recovery rates.',
      };
    }
    if (path.includes('/faculty/activity')) {
      return {
        title: 'Live Wellbeing Activity Feed',
        subtitle: 'Real-time record of student check-ins, stress spikes, and intervention actions.',
      };
    }
    if (path.includes('/faculty/admin/settings')) {
      return {
        title: 'Institution Burnout Thresholds',
        subtitle: 'Configure sensitivity thresholds, escalation rules, and alert cooldown periods.',
      };
    }
    if (path.includes('/faculty/admin/audit-logs')) {
      return {
        title: 'System Security & Audit Trail',
        subtitle: 'Immutable record of faculty data access, alert resolutions, and configuration updates.',
      };
    }
    return {
      title: 'Faculty Portal',
      subtitle: 'Student mental wellbeing & academic burnout prediction.',
    };
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <FacultySidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <FacultyTopbar
          onMenuClick={() => setMobileOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
