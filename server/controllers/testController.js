const Test = require('../models/Test');
const Question = require('../models/Question');
const { shuffleArray } = require('../utils/shuffleArray');

// @desc    Generate a new mock test
// @route   POST /api/tests/generate
// @access  Private/Student
const generateTest = async (req, res) => {
  try {
    const { subjects, difficulty, number_of_questions = 75 } = req.body;

    const selectedSubjects = subjects && subjects.length > 0 ? subjects : ['Physics', 'Chemistry', 'Mathematics'];
    const numQuestions = Math.min(Math.max(parseInt(number_of_questions), 10), 90);
    const perSubject = Math.floor(numQuestions / selectedSubjects.length);
    const remainder = numQuestions % selectedSubjects.length;

    let allQuestions = [];

    for (let i = 0; i < selectedSubjects.length; i++) {
      const subject = selectedSubjects[i];
      const count = perSubject + (i < remainder ? 1 : 0);

      const filter = { subject, isActive: true };
      if (difficulty && difficulty !== 'Mixed') filter.difficulty = difficulty;

      const available = await Question.countDocuments(filter);
      if (available < count) {
        const altFilter = { subject, isActive: true };
        const altQuestions = await Question.aggregate([
          { $match: altFilter },
          { $sample: { size: Math.min(count, available) } },
        ]);
        allQuestions.push(...altQuestions);
      } else {
        const questions = await Question.aggregate([
          { $match: filter },
          { $sample: { size: count } },
        ]);
        allQuestions.push(...questions);
      }
    }

    if (allQuestions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found matching the criteria.' });
    }

    const shuffledQuestions = shuffleArray(allQuestions);
    const questionIds = shuffledQuestions.map(q => q._id);

    const test = await Test.create({
      title: `Mock Test - ${new Date().toLocaleDateString()}`,
      questions: questionIds,
      created_by: req.user._id,
      config: {
        subjects: selectedSubjects,
        difficulty: difficulty || 'Mixed',
        number_of_questions: numQuestions,
        duration_minutes: 180,
      },
      type: 'auto',
    });

    const populatedTest = await Test.findById(test._id).populate({
      path: 'questions',
      select: '-correct_answer -solution',
    });

    res.status(201).json({
      success: true,
      message: 'Test generated successfully.',
      data: populatedTest,
    });
  } catch (error) {
    console.error('Generate test error:', error);
    res.status(500).json({ success: false, message: 'Server error generating test.' });
  }
};

// @desc    Get test by ID (for exam)
// @route   GET /api/tests/:id
// @access  Private
const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate({
      path: 'questions',
      select: req.user.role === 'instructor' ? '' : '-correct_answer -solution',
    });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all tests (instructor view)
// @route   GET /api/tests
// @access  Private/Instructor
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get student's own tests
// @route   GET /api/tests/my-tests
// @access  Private/Student
const getMyTests = async (req, res) => {
  try {
    const tests = await Test.find({ created_by: req.user._id })
      .select('title config createdAt type')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create official test (instructor)
// @route   POST /api/tests/official
// @access  Private/Instructor
const createOfficialTest = async (req, res) => {
  try {
    const { title, question_ids, duration_minutes, subjects } = req.body;

    if (!question_ids || question_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide question IDs.' });
    }

    const test = await Test.create({
      title: title || 'Official JEE Mock Test',
      questions: question_ids,
      created_by: req.user._id,
      config: {
        subjects: subjects || ['Physics', 'Chemistry', 'Mathematics'],
        duration_minutes: duration_minutes || 180,
        number_of_questions: question_ids.length,
      },
      type: 'official',
      isPublished: true,
    });

    res.status(201).json({ success: true, message: 'Official test created.', data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { generateTest, getTest, getAllTests, getMyTests, createOfficialTest };
