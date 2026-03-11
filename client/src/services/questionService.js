import api from './api';
export const questionService = {
  getAll: (params) => api.get('/api/questions', { params }),
  getById: (id) => api.get(`/api/questions/${id}`),
  create: (data) => api.post('/api/questions', data),
  update: (id, data) => api.put(`/api/questions/${id}`, data),
  delete: (id) => api.delete(`/api/questions/${id}`),
  getStats: () => api.get('/api/questions/stats'),
};
