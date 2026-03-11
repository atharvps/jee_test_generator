import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jee_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jee_token');
      localStorage.removeItem('jee_user');
      const path = window.location.pathname;
      if (path.startsWith('/instructor')) {
        window.location.href = '/instructor/login';
      } else {
        window.location.href = '/student/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
