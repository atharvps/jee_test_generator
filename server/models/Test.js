const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: '',
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  config: {
    subjects: [String],
    difficulty: String,
    number_of_questions: Number,
    duration_minutes: {
      type: Number,
      default: 180,
    },
  },
  type: {
    type: String,
    enum: ['auto', 'official'],
    default: 'auto',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Test', testSchema);
