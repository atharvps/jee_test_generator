const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Physics', 'Chemistry', 'Mathematics'],
  },
  chapter: {
    type: String,
    required: [true, 'Chapter is required'],
    trim: true,
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: ['Easy', 'Medium', 'Hard'],
  },
  type: {
    type: String,
    enum: ['MCQ', 'Integer'],
    default: 'MCQ',
  },
  question_text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        if (this.type === 'MCQ') return v && v.length === 4;
        return true;
      },
      message: 'MCQ questions must have exactly 4 options',
    },
  },
  correct_answer: {
    type: String,
    required: [true, 'Correct answer is required'],
  },
  solution: {
    type: String,
    trim: true,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ chapter: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);
