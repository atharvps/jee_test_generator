const Result = require('../models/Result');
const Test = require('../models/Test');
const Question = require('../models/Question');

const MARKS_CORRECT = 4;
const MARKS_INCORRECT = -1;
const MARKS_UNATTEMPTED = 0;

// @desc    Submit test answers
// @route   POST /api/results/submit
// @access  Private/Student
const submitTest = async (req, res) => {
  try {
    const { test_id, answers, time_taken_seconds } = req.body;

    if (!test_id || !answers) {
      return res.status(400).json({ success: false, message: 'Test ID and answers are required.' });
    }

    // Check if already submitted
    const existing = await Result.findOne({ student: req.user._id, test: test_id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Test already submitted.', data: existing });
    }

    const test = await Test.findById(test_id).populate('questions');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    const questions = test.questions;
    const maxScore = questions.length * MARKS_CORRECT;

    let score = 0;
    let correct_count = 0;
    let incorrect_count = 0;
    let unattempted_count = 0;

    const subject_wise = {
      Physics: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 },
      Chemistry: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 },
      Mathematics: { correct: 0, incorrect: 0, unattempted: 0, score: 0, total: 0 },
    };

    const processedAnswers = questions.map((question) => {
      const userAnswer = answers[question._id.toString()];
      const subject = question.subject;

      if (subject_wise[subject]) {
        subject_wise[subject].total += 1;
      }

      let is_correct = false;
      let marks_awarded = MARKS_UNATTEMPTED;

      if (!userAnswer || userAnswer === '') {
        unattempted_count++;
        if (subject_wise[subject]) subject_wise[subject].unattempted++;
      } else if (userAnswer === question.correct_answer) {
        is_correct = true;
        marks_awarded = MARKS_CORRECT;
        score += MARKS_CORRECT;
        correct_count++;
        if (subject_wise[subject]) {
          subject_wise[subject].correct++;
          subject_wise[subject].score += MARKS_CORRECT;
        }
      } else {
        marks_awarded = MARKS_INCORRECT;
        score += MARKS_INCORRECT;
        incorrect_count++;
        if (subject_wise[subject]) {
          subject_wise[subject].incorrect++;
          subject_wise[subject].score += MARKS_INCORRECT;
        }
      }

      return {
        question: question._id,
        selected_option: userAnswer || null,
        is_correct,
        marks_awarded,
        time_spent_seconds: 0,
        marked_for_review: false,
      };
    });

    const percentage = maxScore > 0 ? ((score / maxScore) * 100).toFixed(2) : 0;

    const result = await Result.create({
      student: req.user._id,
      test: test_id,
      answers: processedAnswers,
      score,
      max_score: maxScore,
      percentage: parseFloat(percentage),
      correct_count,
      incorrect_count,
      unattempted_count,
      subject_wise,
      time_taken_seconds: time_taken_seconds || 0,
      submitted_at: new Date(),
    });

    await result.populate([
      { path: 'test', select: 'title config' },
      { path: 'answers.question', select: 'subject chapter difficulty question_text options correct_answer solution' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully.',
      data: result,
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ success: false, message: 'Server error during submission.' });
  }
};

// @desc    Get result by ID
// @route   GET /api/results/:id
// @access  Private
const getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('test', 'title config')
      .populate('student', 'name email')
      .populate('answers.question', 'subject chapter difficulty question_text options correct_answer solution');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }

    if (req.user.role === 'student' && result.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get student's results
// @route   GET /api/results/my-results
// @access  Private/Student
const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('test', 'title config type')
      .sort({ submitted_at: -1 })
      .limit(20);

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all results (instructor)
// @route   GET /api/results
// @access  Private/Instructor
const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('student', 'name email')
      .populate('test', 'title config')
      .sort({ submitted_at: -1 })
      .limit(100);

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { submitTest, getResult, getMyResults, getAllResults };
