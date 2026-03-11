import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import { resultService } from '../../services/resultService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatTime } from '../../utils/helpers';
import { Flag, ChevronLeft, ChevronRight, Send, Bookmark } from 'lucide-react';

const EXAM_DURATION = 3 * 60 * 60; // 3 hours in seconds

export default function ExamInterface() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState(new Set());
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeSubject, setActiveSubject] = useState('All');
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await testService.getById(testId);
        setTest(res.data.data);
        setVisited(new Set([0]));
      } catch (err) {
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, navigate]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [test]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await resultService.submit({ test_id: testId, answers, time_taken_seconds: timeTaken });
      navigate(`/student/results/${res.data.data._id}`);
    } catch (err) {
      if (err.response?.status === 409) {
        navigate('/student/results');
      } else {
        alert('Submission failed. Please try again.');
        setSubmitting(false);
      }
    }
  }, [testId, answers, submitting, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <LoadingSpinner size="lg" text="Loading exam..." />
    </div>
  );

  if (!test) return null;

  const questions = test.questions || [];
  const currentQuestion = questions[currentIndex];
  const subjects = ['All', ...new Set(questions.map(q => q.subject))];

  const filteredIndices = activeSubject === 'All'
    ? questions.map((_, i) => i)
    : questions.map((q, i) => q.subject === activeSubject ? i : -1).filter(i => i >= 0);

  const getQuestionStatus = (index) => {
    const q = questions[index];
    const hasAnswer = answers[q?._id];
    const isMarked = markedForReview.has(index);
    const isVisited = visited.has(index);
    if (index === currentIndex) return 'current';
    if (isMarked && hasAnswer) return 'marked-answered';
    if (isMarked) return 'marked';
    if (hasAnswer) return 'answered';
    if (isVisited) return 'visited';
    return 'not-visited';
  };

  const navigateTo = (index) => {
    setCurrentIndex(index);
    setVisited(prev => new Set([...prev, index]));
  };

  const handleAnswer = (option) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion._id]: option }));
    setVisited(prev => new Set([...prev, currentIndex]));
  };

  const clearResponse = () => {
    if (!currentQuestion) return;
    setAnswers(prev => { const n = {...prev}; delete n[currentQuestion._id]; return n; });
  };

  const toggleMark = () => {
    setMarkedForReview(prev => {
      const n = new Set(prev);
      if (n.has(currentIndex)) n.delete(currentIndex);
      else n.add(currentIndex);
      return n;
    });
  };

  const answered = Object.keys(answers).length;
  const unattempted = questions.length - answered;
  const isWarning = timeLeft <= 600;
  const isUrgent = timeLeft <= 300;

  const subjectColors = { Physics: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', Chemistry: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300', Mathematics: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col" style={{fontFamily: 'Outfit, sans-serif'}}>
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="font-bold text-slate-800 dark:text-white text-sm lg:text-base">{test.title || 'JEE Mock Test'}</div>
        
        {/* Subject tabs */}
        <div className="hidden md:flex gap-1">
          {subjects.map(s => (
            <button key={s} onClick={() => setActiveSubject(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${activeSubject === s ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${isUrgent ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 animate-timer-warning' : isWarning ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question panel */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {currentQuestion ? (
            <div className="max-w-3xl mx-auto space-y-5">
              {/* Question header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">Q{currentIndex + 1}/{questions.length}</span>
                  {currentQuestion.subject && (
                    <span className={`badge ${subjectColors[currentQuestion.subject]}`}>{currentQuestion.subject}</span>
                  )}
                  <span className={`badge ${currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : currentQuestion.difficulty === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <button onClick={toggleMark}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${markedForReview.has(currentIndex) ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  <Bookmark size={14}/> {markedForReview.has(currentIndex) ? 'Marked' : 'Mark for Review'}
                </button>
              </div>

              {/* Question text */}
              <div className="card p-6">
                <p className="text-slate-900 dark:text-white text-base leading-relaxed font-medium">
                  {currentQuestion.question_text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {(currentQuestion.options || []).map((option, i) => {
                  const labels = ['A', 'B', 'C', 'D'];
                  const isSelected = answers[currentQuestion._id] === option;
                  return (
                    <button key={i} onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 font-medium ${isSelected ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-200' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-950/50'}`}>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mr-3 text-sm font-bold ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {labels[i]}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={clearResponse} className="btn-secondary text-sm py-2 px-4">Clear Response</button>
                <div className="flex-1" />
                <button onClick={() => navigateTo(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1">
                  <ChevronLeft size={16}/> Previous
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button onClick={() => navigateTo(currentIndex + 1)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                    Save & Next <ChevronRight size={16}/>
                  </button>
                ) : (
                  <button onClick={() => setShowSubmitModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2 px-5 rounded-xl flex items-center gap-1">
                    <Send size={16}/> Submit
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right palette */}
        <div className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Question Palette</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { color: 'bg-green-500', label: `Answered (${answered})` },
                { color: 'bg-red-200 dark:bg-red-900', label: `Not Answered (${visited.size - answered})` },
                { color: 'bg-purple-500', label: `Marked (${markedForReview.size})` },
                { color: 'bg-slate-200 dark:bg-slate-700', label: `Not Visited (${questions.length - visited.size})` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${item.color}`}/>
                  <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 flex-1">
            <div className="grid grid-cols-5 gap-1.5">
              {filteredIndices.map((i) => (
                <button key={i} onClick={() => navigateTo(i)}
                  className={`question-btn ${getQuestionStatus(i)}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button onClick={() => setShowSubmitModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Send size={16}/> Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Submit modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full animate-slide-in">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Submit Test?</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to submit? You cannot change your answers after submission.</p>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{answered}</p>
                <p className="text-xs text-slate-500 mt-0.5">Answered</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
                <p className="text-2xl font-bold text-red-500">{unattempted}</p>
                <p className="text-xs text-slate-500 mt-0.5">Unattempted</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                <p className="text-2xl font-bold text-purple-500">{markedForReview.size}</p>
                <p className="text-xs text-slate-500 mt-0.5">Marked</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="btn-secondary flex-1" disabled={submitting}>Cancel</button>
              <button onClick={() => handleSubmit(false)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2" disabled={submitting}>
                {submitting ? 'Submitting...' : <><Send size={16}/> Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
