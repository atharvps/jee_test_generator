import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import { FlaskConical, Zap, Target, BookOpen, ChevronRight } from 'lucide-react';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const QUESTION_COUNTS = [30, 45, 60, 75, 90];

export default function GenerateTest() {
  const [config, setConfig] = useState({
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    difficulty: 'Mixed',
    number_of_questions: 75,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleSubject = (subject) => {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleGenerate = async () => {
    if (config.subjects.length === 0) return setError('Please select at least one subject.');
    setError(''); setLoading(true);
    try {
      const res = await testService.generate(config);
      const testId = res.data.data._id;
      navigate(`/student/exam/${testId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate test. Please try again.');
      setLoading(false);
    }
  };

  const subjectColors = {
    Physics: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', active: 'bg-blue-500 border-blue-500 text-white', icon: '⚡' },
    Chemistry: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300', active: 'bg-emerald-500 border-emerald-500 text-white', icon: '🧪' },
    Mathematics: { bg: 'bg-pink-50 dark:bg-pink-950', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-700 dark:text-pink-300', active: 'bg-pink-500 border-pink-500 text-white', icon: '∑' },
  };

  const perSubject = config.subjects.length > 0 ? Math.ceil(config.number_of_questions / config.subjects.length) : 0;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FlaskConical className="text-brand-600" size={28} /> Generate Mock Test
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your personalized JEE mock test</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Subjects */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-600" /> Select Subjects
          </h3>
          <p className="text-sm text-slate-500 mb-4">Choose one or more subjects to include in the test</p>
          <div className="grid grid-cols-3 gap-3">
            {SUBJECTS.map(subject => {
              const isActive = config.subjects.includes(subject);
              const c = subjectColors[subject];
              return (
                <button key={subject} onClick={() => toggleSubject(subject)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center font-semibold ${isActive ? c.active : `${c.bg} ${c.border} ${c.text}`}`}>
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-sm">{subject}</div>
                  {isActive && config.subjects.length > 0 && (
                    <div className="text-xs opacity-80 mt-0.5">{perSubject} Qs</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Target size={18} className="text-brand-600" /> Difficulty Level
          </h3>
          <p className="text-sm text-slate-500 mb-4">Set the difficulty of questions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIFFICULTIES.map(diff => {
              const colors = { Easy: 'from-green-400 to-green-500', Medium: 'from-yellow-400 to-amber-500', Hard: 'from-red-400 to-red-600', Mixed: 'from-brand-400 to-brand-600' };
              const isActive = config.difficulty === diff;
              return (
                <button key={diff} onClick={() => setConfig({...config, difficulty: diff})}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${isActive ? `bg-gradient-to-r ${colors[diff]} text-white shadow-md` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question count */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Zap size={18} className="text-brand-600" /> Number of Questions
          </h3>
          <p className="text-sm text-slate-500 mb-4">Standard JEE has 75 questions (3 hrs)</p>
          <div className="flex flex-wrap gap-3">
            {QUESTION_COUNTS.map(count => (
              <button key={count} onClick={() => setConfig({...config, number_of_questions: count})}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${config.number_of_questions === count ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-6 bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800">
          <h3 className="font-bold text-brand-900 dark:text-brand-100 mb-3">Test Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-brand-600 font-medium">Subjects:</span> <span className="text-brand-800 dark:text-brand-200">{config.subjects.join(', ') || 'None'}</span></div>
            <div><span className="text-brand-600 font-medium">Difficulty:</span> <span className="text-brand-800 dark:text-brand-200">{config.difficulty}</span></div>
            <div><span className="text-brand-600 font-medium">Questions:</span> <span className="text-brand-800 dark:text-brand-200">{config.number_of_questions}</span></div>
            <div><span className="text-brand-600 font-medium">Duration:</span> <span className="text-brand-800 dark:text-brand-200">3 Hours</span></div>
            <div><span className="text-brand-600 font-medium">Marking:</span> <span className="text-brand-800 dark:text-brand-200">+4 / -1 / 0</span></div>
            <div><span className="text-brand-600 font-medium">Max Score:</span> <span className="text-brand-800 dark:text-brand-200">{config.number_of_questions * 4}</span></div>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || config.subjects.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
          {loading ? (
            <><span className="animate-spin">⟳</span> Generating Test...</>
          ) : (
            <><FlaskConical size={20}/> Generate & Start Test <ChevronRight size={18}/></>
          )}
        </button>
      </div>
    </div>
  );
}
