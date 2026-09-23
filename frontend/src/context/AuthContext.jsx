import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, privacyAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mindflow_user');
      if (!saved || saved === 'undefined' || saved === 'null') {
        return null;
      }
      return JSON.parse(saved);
    } catch (err) {
      console.warn('Failed to parse stored user from localStorage:', err);
      localStorage.removeItem('mindflow_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('mindflow_token');
    return stored && stored !== 'undefined' && stored !== 'null' ? stored : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('mindflow_token');
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        try {
          const res = await authAPI.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('mindflow_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to verify session:', err);
          logout();
        }
      } else {
        if (storedToken) {
          localStorage.removeItem('mindflow_token');
          localStorage.removeItem('mindflow_user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    if (newToken) {
      localStorage.setItem('mindflow_token', newToken);
      setToken(newToken);
    }
    if (userData) {
      localStorage.setItem('mindflow_user', JSON.stringify(userData));
      setUser(userData);
    }
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token: newToken, user: userData } = res.data;
    if (newToken) {
      localStorage.setItem('mindflow_token', newToken);
      setToken(newToken);
    }
    if (userData) {
      localStorage.setItem('mindflow_user', JSON.stringify(userData));
      setUser(userData);
    }
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('mindflow_token');
    localStorage.removeItem('mindflow_user');
    setToken(null);
    setUser(null);
  };

  const toggleAnonymousMode = async () => {
    try {
      const res = await privacyAPI.toggleAnonymous();
      setUser((prev) => ({
        ...prev,
        anonymousMode: res.data.anonymousMode,
        name: res.data.displayName,
      }));
      return res.data;
    } catch (err) {
      console.error('Failed to toggle anonymous mode:', err);
      throw err;
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('mindflow_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isFaculty: user?.role === 'FACULTY' || user?.role === 'ADMIN',
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT' || !user?.role,
        login,
        register,
        logout,
        toggleAnonymousMode,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
