const express = require('express');
const router = express.Router();
const { submitTest, getResult, getMyResults, getAllResults } = require('../controllers/resultController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireStudent, requireInstructor } = require('../middleware/roleMiddleware');

router.post('/submit', requireAuth, requireStudent, submitTest);
router.get('/my-results', requireAuth, requireStudent, getMyResults);
router.get('/', requireAuth, requireInstructor, getAllResults);
router.get('/:id', requireAuth, getResult);

module.exports = router;
