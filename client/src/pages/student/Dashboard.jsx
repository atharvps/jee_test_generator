import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resultService } from '../../services/resultService';
import { analyticsService } from '../../services/analyticsService';
import StatCard from '../../components/shared/StatCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatScore, formatDate, getDifficultyColor } from '../../utils/helpers';
import { FlaskConical, TrendingUp, Target, Clock, ChevronRight, Award } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, resultsRes] = await Promise.all([
          analyticsService.getStudentAnalytics(),
          resultService.getMyResults(),
        ]);
        setAnalytics(analyticsRes.data.data);
        setRecentResults(resultsRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  );

  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="card p-8 bg-gradient-to-r from-brand-600 to-brand-800 text-white border-0">
        <h1 className="text-2xl font-bold mb-1">Good {timeOfDay}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-brand-200 mb-6">Ready to practice for JEE? Let's generate a test!</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/student/generate-test" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors shadow-sm">
            <FlaskConical size={18} /> Generate Mock Test
          </Link>
          <Link to="/student/analytics" className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors">
            <TrendingUp size={18} /> View Analytics
          </Link>
        </div>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Tests Taken" value={analytics.totalTests} icon="📝" color="brand" />
          <StatCard title="Average Score" value={analytics.averageScore || 0} subtitle="out of max" icon={<TrendingUp size={18}/>} color="blue" />
          <StatCard title="Best Score" value={analytics.bestScore || 0} icon={<Award size={18}/>} color="green" />
          <StatCard title="Avg Accuracy" value={`${analytics.averageAccuracy || 0}%`} icon={<Target size={18}/>} color="purple" />
        </div>
      )}

      {/* Recent Results */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Tests</h2>
          <Link to="/student/results" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={14}/>
          </Link>
        </div>

        {recentResults.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium">No tests taken yet</p>
            <p className="text-sm mt-1">Generate your first mock test to get started!</p>
            <Link to="/student/generate-test" className="btn-primary inline-flex mt-4">Start Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentResults.map((result) => (
              <Link key={result._id} to={`/student/results/${result._id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {result.test?.title || 'Mock Test'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Clock size={12}/> {formatDate(result.submitted_at)}
                    <span>• {result.test?.config?.subjects?.join(', ')}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{result.score}</p>
                  <p className="text-xs text-slate-500">{result.percentage?.toFixed(1)}%</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Subject Quick Stats */}
      {analytics?.subjectPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Physics', 'Chemistry', 'Mathematics'].map((subject) => {
            const data = analytics.subjectPerformance[subject];
            const colors = { Physics: 'blue', Chemistry: 'green', Mathematics: 'pink' };
            const icons = { Physics: '⚡', Chemistry: '🧪', Mathematics: '∑' };
            return (
              <div key={subject} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{icons[subject]}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{subject}</p>
                    <p className="text-xs text-slate-500">{data?.total || 0} questions attempted</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-semibold">✓ {data?.correct || 0}</span>
                  <span className="text-red-500 font-semibold">✗ {data?.incorrect || 0}</span>
                  <span className="text-slate-400">— {data?.unattempted || 0}</span>
                </div>
                <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                    style={{ width: `${data?.accuracy || 0}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1 text-right">{data?.accuracy || 0}% accuracy</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
