import api from './api';
export const analyticsService = {
  getStudentAnalytics: () => api.get('/api/analytics/student'),
  getInstructorAnalytics: () => api.get('/api/analytics/instructor'),
  getLeaderboard: () => api.get('/api/analytics/leaderboard'),
};
