const express = require('express');
const router = express.Router();
const { getAllQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, getQuestionStats } = require('../controllers/questionController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireInstructor } = require('../middleware/roleMiddleware');

router.get('/stats', requireAuth, requireInstructor, getQuestionStats);
router.get('/', requireAuth, requireInstructor, getAllQuestions);
router.get('/:id', requireAuth, getQuestion);
router.post('/', requireAuth, requireInstructor, createQuestion);
router.put('/:id', requireAuth, requireInstructor, updateQuestion);
router.delete('/:id', requireAuth, requireInstructor, deleteQuestion);

module.exports = router;
