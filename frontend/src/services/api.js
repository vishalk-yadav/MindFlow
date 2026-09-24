import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindflow_token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear and optionally redirect if not on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('mindflow_token');
        localStorage.removeItem('mindflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateOnboarding: (data) => API.patch('/auth/onboarding', data),
};

export const dashboardAPI = {
  getDashboard: () => API.get('/dashboard'),
};

export const taskAPI = {
  getTasks: (params) => API.get('/tasks', { params }),
  createTask: (data) => API.post('/tasks', data),
  updateTask: (id, data) => API.put(`/tasks/${id}`, data),
  toggleComplete: (id) => API.patch(`/tasks/${id}/complete`),
  deleteTask: (id) => API.delete(`/tasks/${id}`),
  getPrioritized: () => API.get('/tasks/prioritize'),
};

export const checkinAPI = {
  createCheckIn: (data) => API.post('/checkins', data),
  getHistory: () => API.get('/checkins'),
};

export const focusAPI = {
  startSession: (data) => API.post('/focus/start', data),
  completeSession: (id, data) => API.post(`/focus/complete/${id || 'quick'}`, data),
  getStats: () => API.get('/focus/stats'),
  getHistory: (params) => API.get('/focus/history', { params }),
  logSleep: (data) => API.post('/focus/sleep', data),
  getSleepStats: () => API.get('/focus/sleep/stats'),
};

export const plannerAPI = {
  generatePlan: (data) => API.post('/planner/generate', data),
  getPlan: () => API.get('/planner'),
};

export const eventAPI = {
  getEvents: (params) => API.get('/events', { params }),
  getTodayEvents: () => API.get('/events/today'),
  createEvent: (data) => API.post('/events', data),
  updateEvent: (id, data) => API.put(`/events/${id}`, data),
  deleteEvent: (id) => API.delete(`/events/${id}`),
};

export const examAPI = {
  getExams: () => API.get('/exams'),
  createExam: (data) => API.post('/exams', data),
  updateTopics: (id, topicsList) => API.put(`/exams/${id}/topics`, { topicsList }),
};

export const aiAPI = {
  sendMessage: (message) => API.post('/ai/chat', { message }),
  getHistory: () => API.get('/ai/history'),
  clearHistory: () => API.delete('/ai/history'),
  getStatus: () => API.get('/ai/status'),
};

export const habitAPI = {
  getHabits: () => API.get('/habits'),
  toggleHabit: (id) => API.patch(`/habits/${id}/toggle`),
  createHabit: (data) => API.post('/habits', data),
};

export const gameAPI = {
  logSession: (data) => API.post('/games/log', data),
  getStats: () => API.get('/games/stats'),
};

export const privacyAPI = {
  getOverview: () => API.get('/privacy'),
  toggleAnonymous: () => API.patch('/privacy/anonymous'),
  exportData: (format = 'json') => API.get(`/privacy/export?format=${format}`, { responseType: format === 'csv' ? 'blob' : 'json' }),
  deleteAccount: () => API.delete('/privacy/account'),
};

export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  clearAll: () => API.delete('/notifications'),
};

export const facultyAPI = {
  getDashboard: () => API.get('/faculty/dashboard'),
  getStudents: (params) => API.get('/faculty/students', { params }),
  getStudentDetail: (id) => API.get(`/faculty/students/${id}`),
  getAlerts: (params) => API.get('/faculty/alerts', { params }),
  reviewAlert: (id) => API.patch(`/faculty/alerts/${id}/review`),
  resolveAlert: (id) => API.patch(`/faculty/alerts/${id}/resolve`),
  addInterventionNote: (alertId, data) => API.post(`/faculty/alerts/${alertId}/notes`, data),
  getAnalytics: () => API.get('/faculty/analytics'),
  getActivityLogs: (params) => API.get('/faculty/activity', { params }),
};

export const adminAPI = {
  getSettings: () => API.get('/admin/settings'),
  updateSettings: (data) => API.patch('/admin/settings', data),
  getFaculty: () => API.get('/admin/faculty'),
  createFaculty: (data) => API.post('/admin/faculty', data),
  updateFaculty: (id, data) => API.patch(`/admin/faculty/${id}`, data),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
};

export const nudgeAPI = {
  getNudges: () => API.get('/nudges'),
  generateRecommendations: () => API.post('/nudges/recommend'),
  dismissNudge: (id) => API.patch(`/nudges/${id}/dismiss`),
  dismissAll: () => API.patch('/nudges/dismiss-all'),
};

export default API;

