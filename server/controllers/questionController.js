const Question = require('../models/Question');

// @desc    Get all questions (instructor)
// @route   GET /api/questions
// @access  Private/Instructor
const getAllQuestions = async (req, res) => {
  try {
    const { subject, difficulty, chapter, type, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (chapter) filter.chapter = { $regex: chapter, $options: 'i' };
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching questions.' });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || !question.isActive) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private/Instructor
const createQuestion = async (req, res) => {
  try {
    const { subject, chapter, difficulty, type, question_text, options, correct_answer, solution, tags } = req.body;

    if (!subject || !chapter || !difficulty || !question_text || !correct_answer) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const question = await Question.create({
      subject, chapter, difficulty, type: type || 'MCQ',
      question_text, options, correct_answer, solution, tags,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Question created successfully.', data: question });
  } catch (error) {
    console.error('Create question error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error creating question.' });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private/Instructor
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    res.json({ success: true, message: 'Question updated.', data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating question.' });
  }
};

// @desc    Delete question (soft delete)
// @route   DELETE /api/questions/:id
// @access  Private/Instructor
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting question.' });
  }
};

// @desc    Get question stats
// @route   GET /api/questions/stats
// @access  Private/Instructor
const getQuestionStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { subject: '$subject', difficulty: '$difficulty' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.subject': 1, '_id.difficulty': 1 } },
    ]);

    const totalBySubject = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$subject', total: { $sum: 1 } } },
    ]);

    const total = await Question.countDocuments({ isActive: true });

    res.json({ success: true, data: { stats, totalBySubject, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, getQuestionStats };
