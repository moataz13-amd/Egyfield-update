import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('egyfield-token');
      const adminData = localStorage.getItem('egyfield-admin');

      if (token) {
        try {
          if (adminData) {
            setAdmin(JSON.parse(adminData));
          }
          
          // Fetch up-to-date details
          const { data } = await api.get('/auth/me');
          const updatedAdmin = { ...data, token };
          
          localStorage.setItem('egyfield-admin', JSON.stringify(updatedAdmin));
          setAdmin(updatedAdmin);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
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
