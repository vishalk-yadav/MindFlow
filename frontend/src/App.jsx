import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Student Layout & Pages
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { FocusPage } from './pages/FocusPage';
import { GamesPage } from './pages/GamesPage';
import { MoodCheckInPage } from './pages/MoodCheckInPage';
import { PlannerPage } from './pages/PlannerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { SettingsPage } from './pages/SettingsPage';

// Faculty Layout & Pages
import { FacultyLayout } from './components/faculty/FacultyLayout';
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyStudentsPage } from './pages/faculty/FacultyStudentsPage';
import { FacultyStudentDetailPage } from './pages/faculty/FacultyStudentDetailPage';
import { FacultyAlertsPage } from './pages/faculty/FacultyAlertsPage';
import { FacultyAnalyticsPage } from './pages/faculty/FacultyAnalyticsPage';
import { FacultyActivityPage } from './pages/faculty/FacultyActivityPage';
import { AdminSettingsPage } from './pages/faculty/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/faculty/AdminAuditLogsPage';

// Protected Student Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected Faculty & Admin Route
const FacultyRoute = ({ children }) => {
  const { isAuthenticated, isFaculty, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isFaculty) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected Admin Only Route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/faculty/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student Portal Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="focus" element={<FocusPage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="checkin" element={<MoodCheckInPage />} />
                <Route path="planner" element={<PlannerPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="ai" element={<AIAssistantPage />} />
                <Route path="assistant" element={<Navigate to="/ai" replace />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Faculty & Admin Portal Routes */}
              <Route
                path="/faculty"
                element={
                  <FacultyRoute>
                    <FacultyLayout />
                  </FacultyRoute>
                }
              >
                <Route index element={<Navigate to="/faculty/dashboard" replace />} />
                <Route path="dashboard" element={<FacultyDashboardPage />} />
                <Route path="students" element={<FacultyStudentsPage />} />
                <Route path="students/:id" element={<FacultyStudentDetailPage />} />
                <Route path="alerts" element={<FacultyAlertsPage />} />
                <Route path="analytics" element={<FacultyAnalyticsPage />} />
                <Route path="activity" element={<FacultyActivityPage />} />
                <Route
                  path="admin/settings"
                  element={
                    <AdminRoute>
                      <AdminSettingsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/audit-logs"
                  element={
                    <AdminRoute>
                      <AdminAuditLogsPage />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
