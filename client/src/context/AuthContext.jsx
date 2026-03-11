import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jee_token');
    const storedUser = localStorage.getItem('jee_user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch {
        localStorage.removeItem('jee_token');
        localStorage.removeItem('jee_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, role) => {
    const response = await api.post('/api/auth/login', { email, password, role });
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('jee_token', newToken);
    localStorage.setItem('jee_user', JSON.stringify(newUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return newUser;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const response = await api.post('/api/auth/register', { name, email, password, role });
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('jee_token', newToken);
    localStorage.setItem('jee_user', JSON.stringify(newUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jee_token');
    localStorage.removeItem('jee_user');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isStudent, isInstructor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
