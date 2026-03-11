import api from './api';
export const authService = {
  login: (email, password, role) => api.post('/api/auth/login', { email, password, role }),
  register: (name, email, password, role) => api.post('/api/auth/register', { name, email, password, role }),
  getMe: () => api.get('/api/auth/me'),
};
