const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  selected_option: {
    type: String,
    default: null,
  },
  is_correct: {
    type: Boolean,
    default: false,
  },
  marks_awarded: {
    type: Number,
    default: 0,
  },
  time_spent_seconds: {
    type: Number,
    default: 0,
  },
  marked_for_review: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  max_score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  correct_count: {
    type: Number,
    default: 0,
  },
  incorrect_count: {
    type: Number,
    default: 0,
  },
  unattempted_count: {
    type: Number,
    default: 0,
  },
  subject_wise: {
    Physics: {
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      unattempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    Chemistry: {
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      unattempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    Mathematics: {
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      unattempted: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  time_taken_seconds: {
    type: Number,
    default: 0,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
  rank: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

resultSchema.index({ student: 1, submitted_at: -1 });
resultSchema.index({ test: 1 });
resultSchema.index({ score: -1 });

module.exports = mongoose.model('Result', resultSchema);
