import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch (err) {
      // If unauthenticated or network error, fallback demo notifications
      const demo = [
        { id: '1', title: 'Assignment Deadline', message: 'Complete DSA assignment due today in 10h', read: false, createdAt: new Date() },
        { id: '2', title: 'Break Reminder', message: "You've been working for 2 hours.", read: false, createdAt: new Date() },
      ];
      setNotifications(demo);
      setUnreadCount(demo.filter((n) => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleAuthChange = () => fetchNotifications();
    window.addEventListener('mindflow:auth-changed', handleAuthChange);
    return () => window.removeEventListener('mindflow:auth-changed', handleAuthChange);
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || id === 'all' ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => (id === 'all' ? 0 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error(err);
      // Still update UI optimistically
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || id === 'all' ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => (id === 'all' ? 0 : Math.max(0, prev - 1)));
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        fetchNotifications,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}

      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white shadow-rose-500/20'
                : toast.type === 'warning'
                ? 'bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-slate-900 dark:bg-slate-800 text-white shadow-slate-900/20 border border-transparent dark:border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
