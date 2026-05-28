import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('egyfield-token');
    const adminData = localStorage.getItem('egyfield-admin');

    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('egyfield-token', data.token);
    localStorage.setItem('egyfield-admin', JSON.stringify(data));
    setAdmin(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('egyfield-token');
    localStorage.removeItem('egyfield-admin');
    setAdmin(null);
  };

  const isAuthenticated = !!admin;

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
