const User = require('../models/User');
const Result = require('../models/Result');

// @desc    Get all students (instructor)
// @route   GET /api/users/students
// @access  Private/Instructor
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true })
      .select('name email createdAt lastLogin')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get student performance summary
// @route   GET /api/users/students/:id/performance
// @access  Private/Instructor
const getStudentPerformance = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('name email');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const results = await Result.find({ student: req.params.id })
      .populate('test', 'title config')
      .sort({ submitted_at: -1 });

    res.json({ success: true, data: { student, results } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllStudents, getStudentPerformance, updateProfile };
