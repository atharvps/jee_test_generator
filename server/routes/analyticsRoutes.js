const express = require('express');
const router = express.Router();
const { getStudentAnalytics, getInstructorAnalytics, getLeaderboard } = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireStudent, requireInstructor } = require('../middleware/roleMiddleware');

router.get('/student', requireAuth, requireStudent, getStudentAnalytics);
router.get('/instructor', requireAuth, requireInstructor, getInstructorAnalytics);
router.get('/leaderboard', requireAuth, requireInstructor, getLeaderboard);

module.exports = router;
