import api from './api';
export const testService = {
  generate: (config) => api.post('/api/tests/generate', config),
  getById: (id) => api.get(`/api/tests/${id}`),
  getMyTests: () => api.get('/api/tests/my-tests'),
  getAllTests: () => api.get('/api/tests'),
  createOfficial: (data) => api.post('/api/tests/official', data),
};
