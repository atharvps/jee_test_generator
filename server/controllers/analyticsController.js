const Result = require('../models/Result');
const User = require('../models/User');

// @desc    Get student analytics
// @route   GET /api/analytics/student
// @access  Private/Student
const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;

    const results = await Result.find({ student: studentId })
      .populate('test', 'title config createdAt')
      .sort({ submitted_at: -1 });

    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          totalTests: 0, averageScore: 0, bestScore: 0, averageAccuracy: 0,
          scoreHistory: [], subjectPerformance: {}, recentResults: [], accuracyTrend: [],
        },
      });
    }

    const totalTests = results.length;
    const scores = results.map(r => r.score);
    const averageScore = (scores.reduce((a, b) => a + b, 0) / totalTests).toFixed(1);
    const bestScore = Math.max(...scores);

    const accuracies = results.map(r => {
      const attempted = r.correct_count + r.incorrect_count;
      return attempted > 0 ? ((r.correct_count / attempted) * 100).toFixed(1) : 0;
    });
    const averageAccuracy = (accuracies.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / totalTests).toFixed(1);

    const scoreHistory = results.slice(0, 10).reverse().map((r, i) => ({
      test: i + 1,
      score: r.score,
      maxScore: r.max_score,
      percentage: r.percentage,
      date: r.submitted_at,
      title: r.test?.title || `Test ${i + 1}`,
    }));

    const accuracyTrend = results.slice(0, 10).reverse().map((r, i) => ({
      test: i + 1,
      accuracy: parseFloat(accuracies[results.length - 1 - i] || 0),
      date: r.submitted_at,
    }));

    const subjectPerformance = { Physics: { correct: 0, incorrect: 0, unattempted: 0, total: 0, score: 0 },
      Chemistry: { correct: 0, incorrect: 0, unattempted: 0, total: 0, score: 0 },
      Mathematics: { correct: 0, incorrect: 0, unattempted: 0, total: 0, score: 0 } };

    results.forEach(r => {
      ['Physics', 'Chemistry', 'Mathematics'].forEach(subject => {
        if (r.subject_wise && r.subject_wise[subject]) {
          subjectPerformance[subject].correct += r.subject_wise[subject].correct || 0;
          subjectPerformance[subject].incorrect += r.subject_wise[subject].incorrect || 0;
          subjectPerformance[subject].unattempted += r.subject_wise[subject].unattempted || 0;
          subjectPerformance[subject].total += r.subject_wise[subject].total || 0;
          subjectPerformance[subject].score += r.subject_wise[subject].score || 0;
        }
      });
    });

    Object.keys(subjectPerformance).forEach(subject => {
      const s = subjectPerformance[subject];
      const attempted = s.correct + s.incorrect;
      s.accuracy = attempted > 0 ? ((s.correct / attempted) * 100).toFixed(1) : 0;
    });

    res.json({
      success: true,
      data: {
        totalTests, averageScore: parseFloat(averageScore), bestScore,
        averageAccuracy: parseFloat(averageAccuracy), scoreHistory,
        subjectPerformance, recentResults: results.slice(0, 5), accuracyTrend,
      },
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get instructor analytics
// @route   GET /api/analytics/instructor
// @access  Private/Instructor
const getInstructorAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalResults = await Result.countDocuments();

    const allResults = await Result.find()
      .populate('student', 'name email')
      .populate('test', 'title config')
      .sort({ score: -1 });

    const avgScore = allResults.length > 0
      ? (allResults.reduce((a, r) => a + r.score, 0) / allResults.length).toFixed(1)
      : 0;

    // Top students by average score
    const studentScores = {};
    allResults.forEach(r => {
      const sid = r.student?._id?.toString();
      if (!sid) return;
      if (!studentScores[sid]) {
        studentScores[sid] = { student: r.student, scores: [], attempts: 0 };
      }
      studentScores[sid].scores.push(r.score);
      studentScores[sid].attempts++;
    });

    const leaderboard = Object.values(studentScores).map(({ student, scores, attempts }) => ({
      student,
      avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      bestScore: Math.max(...scores),
      attempts,
    })).sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore)).slice(0, 10);

    // Score distribution
    const scoreRanges = { '0-100': 0, '101-200': 0, '201-240': 0, '241-300': 0, '300+': 0 };
    allResults.forEach(r => {
      if (r.score <= 100) scoreRanges['0-100']++;
      else if (r.score <= 200) scoreRanges['101-200']++;
      else if (r.score <= 240) scoreRanges['201-240']++;
      else if (r.score <= 300) scoreRanges['241-300']++;
      else scoreRanges['300+']++;
    });

    // Subject-wise class performance
    const classSubjectPerformance = { Physics: { correct: 0, total: 0 }, Chemistry: { correct: 0, total: 0 }, Mathematics: { correct: 0, total: 0 } };
    allResults.forEach(r => {
      ['Physics', 'Chemistry', 'Mathematics'].forEach(subject => {
        if (r.subject_wise?.[subject]) {
          classSubjectPerformance[subject].correct += r.subject_wise[subject].correct || 0;
          classSubjectPerformance[subject].total += r.subject_wise[subject].total || 0;
        }
      });
    });

    Object.keys(classSubjectPerformance).forEach(s => {
      const d = classSubjectPerformance[s];
      d.accuracy = d.total > 0 ? ((d.correct / d.total) * 100).toFixed(1) : 0;
    });

    res.json({
      success: true,
      data: {
        totalStudents, totalTests: totalResults, classAverage: parseFloat(avgScore),
        leaderboard, scoreDistribution: scoreRanges, classSubjectPerformance,
        recentActivity: allResults.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Instructor analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get leaderboard
// @route   GET /api/analytics/leaderboard
// @access  Private/Instructor
const getLeaderboard = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('student', 'name email')
      .populate('test', 'title')
      .sort({ score: -1, submitted_at: 1 });

    const studentMap = {};
    results.forEach(r => {
      const sid = r.student?._id?.toString();
      if (!sid) return;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          student: r.student, scores: [], bestResult: null, attempts: 0,
        };
      }
      studentMap[sid].scores.push(r.score);
      studentMap[sid].attempts++;
      if (!studentMap[sid].bestResult || r.score > studentMap[sid].bestResult.score) {
        studentMap[sid].bestResult = r;
      }
    });

    const leaderboard = Object.values(studentMap).map(({ student, scores, bestResult, attempts }, idx) => ({
      rank: idx + 1,
      student: { id: student._id, name: student.name, email: student.email },
      bestScore: Math.max(...scores),
      avgScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
      attempts,
      bestTestTitle: bestResult?.test?.title || 'Mock Test',
      lastAttempt: bestResult?.submitted_at,
    })).sort((a, b) => b.bestScore - a.bestScore).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStudentAnalytics, getInstructorAnalytics, getLeaderboard };
