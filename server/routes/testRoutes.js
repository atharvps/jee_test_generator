const express = require('express');
const router = express.Router();
const { generateTest, getTest, getAllTests, getMyTests, createOfficialTest } = require('../controllers/testController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireStudent, requireInstructor } = require('../middleware/roleMiddleware');

router.post('/generate', requireAuth, requireStudent, generateTest);
router.get('/my-tests', requireAuth, requireStudent, getMyTests);
router.get('/', requireAuth, requireInstructor, getAllTests);
router.post('/official', requireAuth, requireInstructor, createOfficialTest);
router.get('/:id', requireAuth, getTest);

module.exports = router;
