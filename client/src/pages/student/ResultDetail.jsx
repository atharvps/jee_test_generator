import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/helpers';
import { ChevronLeft, CheckCircle, XCircle, Minus, ChevronDown, ChevronUp } from 'lucide-react';

export default function ResultDetail() {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    resultService.getById(resultId)
      .then(res => setResult(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Loading result..."/></div>;
  if (!result) return <div className="text-center py-20 text-slate-500">Result not found</div>;

  const percentage = result.percentage;
  const grade = percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : percentage >= 45 ? 'C' : 'D';
  const gradeColor = percentage >= 75 ? 'text-green-600' : percentage >= 60 ? 'text-blue-600' : percentage >= 45 ? 'text-yellow-600' : 'text-red-600';

  const filteredAnswers = result.answers?.filter(a => {
    if (filter === 'correct') return a.is_correct;
    if (filter === 'incorrect') return !a.is_correct && a.selected_option;
    if (filter === 'unattempted') return !a.selected_option;
    return true;
  }) || [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <Link to="/student/results" className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 transition-colors">
        <ChevronLeft size={16}/> Back to Results
      </Link>

      {/* Score card */}
      <div className="card p-8 text-center bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-900 dark:to-brand-950">
        <p className={`text-8xl font-black ${gradeColor} mb-2`}>{grade}</p>
        <p className="text-4xl font-bold text-slate-900 dark:text-white">{result.score}</p>
        <p className="text-slate-500 text-lg">out of {result.max_score}</p>
        <p className="text-2xl font-bold text-brand-600 mt-2">{percentage?.toFixed(1)}%</p>
        <p className="text-sm text-slate-500 mt-4">{result.test?.title} • {formatDate(result.submitted_at)}</p>
        {result.time_taken_seconds > 0 && (
          <p className="text-xs text-slate-400 mt-1">Time taken: {formatTime(result.time_taken_seconds)}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Correct', value: result.correct_count, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', icon: <CheckCircle size={20}/> },
          { label: 'Incorrect', value: result.incorrect_count, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30', icon: <XCircle size={20}/> },
          { label: 'Unattempted', value: result.unattempted_count, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', icon: <Minus size={20}/> },
        ].map(item => (
          <div key={item.label} className={`card p-5 text-center ${item.bg}`}>
            <div className={`flex justify-center mb-2 ${item.color}`}>{item.icon}</div>
            <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
            <p className="text-sm text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Subject wise */}
      {result.subject_wise && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Subject-wise Performance</h3>
          <div className="space-y-4">
            {['Physics', 'Chemistry', 'Mathematics'].map(subject => {
              const s = result.subject_wise[subject];
              if (!s || s.total === 0) return null;
              const acc = s.correct + s.incorrect > 0 ? ((s.correct / (s.correct + s.incorrect)) * 100).toFixed(1) : 0;
              const subColors = { Physics: 'bg-blue-500', Chemistry: 'bg-emerald-500', Mathematics: 'bg-pink-500' };
              return (
                <div key={subject}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{subject}</span>
                    <span className="text-sm text-slate-500">{s.correct}/{s.total} correct • {acc}% accuracy • {s.score} pts</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${subColors[subject]} rounded-full transition-all`} style={{ width: `${acc}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Review */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Question Review</h3>
          <div className="flex gap-2">
            {['all', 'correct', 'incorrect', 'unattempted'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredAnswers.map((answer, i) => {
            const q = answer.question;
            const isExpanded = expandedQ === i;
            const status = answer.is_correct ? 'correct' : !answer.selected_option ? 'unattempted' : 'incorrect';
            const statusColors = { correct: 'border-l-green-500 bg-green-50/50 dark:bg-green-950/30', incorrect: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/30', unattempted: 'border-l-slate-300 dark:border-l-slate-600' };
            const statusIcons = { correct: <CheckCircle size={16} className="text-green-500"/>, incorrect: <XCircle size={16} className="text-red-500"/>, unattempted: <Minus size={16} className="text-slate-400"/> };

            return (
              <div key={i} className={`border-l-4 ${statusColors[status]} rounded-r-xl p-4 cursor-pointer`}
                onClick={() => setExpandedQ(isExpanded ? null : i)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {statusIcons[status]}
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-2">{q?.question_text}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-sm font-bold ${answer.marks_awarded > 0 ? 'text-green-600' : answer.marks_awarded < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {answer.marks_awarded > 0 ? '+' : ''}{answer.marks_awarded}
                    </span>
                    {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </div>
                </div>

                {isExpanded && q && (
                  <div className="mt-4 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {(q.options || []).map((opt, oi) => {
                        const isCorrect = opt === q.correct_answer;
                        const isSelected = opt === answer.selected_option;
                        return (
                          <div key={oi} className={`p-2.5 rounded-lg text-sm font-medium ${isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700' : isSelected ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            {isCorrect && '✓ '}{isSelected && !isCorrect && '✗ '}{opt}
                          </div>
                        );
                      })}
                    </div>
                    {q.solution && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                        <span className="font-bold">Solution: </span>{q.solution}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
