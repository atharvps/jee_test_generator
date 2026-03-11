const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentPerformance, updateProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireInstructor } = require('../middleware/roleMiddleware');

router.get('/students', requireAuth, requireInstructor, getAllStudents);
router.get('/students/:id/performance', requireAuth, requireInstructor, getStudentPerformance);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;
