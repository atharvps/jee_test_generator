import api from './api';
export const resultService = {
  submit: (data) => api.post('/api/results/submit', data),
  getById: (id) => api.get(`/api/results/${id}`),
  getMyResults: () => api.get('/api/results/my-results'),
  getAllResults: () => api.get('/api/results'),
};
