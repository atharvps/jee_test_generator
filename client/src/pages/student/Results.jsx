import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { ChevronRight, Clock, Target, CheckCircle, XCircle } from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultService.getMyResults()
      .then(res => setResults(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Loading results..."/></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Results</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review your past test performance</p>
      </div>

      {results.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No results yet</h2>
          <p className="text-slate-500 mb-6">Take your first mock test to see results here</p>
          <Link to="/student/generate-test" className="btn-primary">Generate Test</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => {
            const accuracy = result.correct_count + result.incorrect_count > 0
              ? ((result.correct_count / (result.correct_count + result.incorrect_count)) * 100).toFixed(1)
              : 0;
            const scorePercent = result.max_score > 0 ? ((result.score / result.max_score) * 100).toFixed(1) : 0;
            const grade = scorePercent >= 90 ? 'A+' : scorePercent >= 75 ? 'A' : scorePercent >= 60 ? 'B' : scorePercent >= 45 ? 'C' : 'D';
            const gradeColor = scorePercent >= 75 ? 'text-green-600' : scorePercent >= 60 ? 'text-blue-600' : scorePercent >= 45 ? 'text-yellow-600' : 'text-red-600';

            return (
              <Link key={result._id} to={`/student/results/${result._id}`}
                className="card p-6 hover:shadow-md transition-all duration-200 group block">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1">
                      {result.test?.title || 'Mock Test'}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Clock size={11}/> {formatDate(result.submitted_at)}</span>
                      <span>• {result.test?.config?.subjects?.join(', ')}</span>
                      <span>• {result.test?.config?.difficulty}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0"/>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{result.correct_count}</p>
                          <p className="text-xs text-slate-500">Correct</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-red-500 flex-shrink-0"/>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{result.incorrect_count}</p>
                          <p className="text-xs text-slate-500">Incorrect</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-blue-500 flex-shrink-0"/>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{accuracy}%</p>
                          <p className="text-xs text-slate-500">Accuracy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className={`text-3xl font-black ${gradeColor}`}>{grade}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{result.score}</p>
                    <p className="text-xs text-slate-500">out of {result.max_score}</p>
                    <ChevronRight size={18} className="ml-auto mt-2 text-slate-400 group-hover:text-brand-500 transition-colors"/>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
