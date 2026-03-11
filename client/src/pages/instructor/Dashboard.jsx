import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { questionService } from '../../services/questionService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { BarChart2, Users, BookOpen, Trophy, TrendingUp, ClipboardList } from 'lucide-react';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [qStats, setQStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getInstructorAnalytics(),
      questionService.getStats(),
    ]).then(([analyticsRes, statsRes]) => {
      setAnalytics(analyticsRes.data.data);
      setQStats(statsRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Loading dashboard..."/></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="card p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
        <p className="text-slate-400 mb-6">Manage your JEE question bank and monitor student performance.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/instructor/question-bank" className="inline-flex items-center gap-2 bg-white text-slate-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors shadow-sm text-sm">
            <BookOpen size={16}/> Manage Questions
          </Link>
          <Link to="/instructor/analytics" className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors text-sm">
            <BarChart2 size={16}/> View Analytics
          </Link>
          <Link to="/instructor/leaderboard" className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors text-sm">
            <Trophy size={16}/> Leaderboard
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: analytics?.totalStudents || 0, icon: <Users size={18}/>, color: 'from-blue-500 to-blue-600' },
          { label: 'Tests Submitted', value: analytics?.totalTests || 0, icon: <ClipboardList size={18}/>, color: 'from-purple-500 to-purple-600' },
          { label: 'Class Average', value: analytics?.classAverage || 0, icon: <TrendingUp size={18}/>, color: 'from-green-500 to-green-600' },
          { label: 'Total Questions', value: qStats?.total || 0, icon: <BookOpen size={18}/>, color: 'from-amber-500 to-amber-600' },
        ].map((s, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top students */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Trophy size={18} className="text-amber-500"/> Top Students</h2>
            <Link to="/instructor/leaderboard" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">See all</Link>
          </div>
          {analytics?.leaderboard?.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No student activity yet</p>
          ) : (
            <div className="space-y-3">
              {(analytics?.leaderboard || []).slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className={`text-lg font-black ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{entry.student?.name}</p>
                    <p className="text-xs text-slate-500">{entry.attempts} attempts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{entry.bestScore}</p>
                    <p className="text-xs text-slate-500">best</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question bank summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><BookOpen size={18} className="text-brand-600"/> Question Bank</h2>
            <Link to="/instructor/question-bank" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Manage</Link>
          </div>
          {qStats?.totalBySubject?.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No questions yet</p>
          ) : (
            <div className="space-y-3">
              {(qStats?.totalBySubject || []).map((item) => {
                const icons = { Physics: '⚡', Chemistry: '🧪', Mathematics: '∑' };
                const colors = { Physics: 'bg-blue-500', Chemistry: 'bg-emerald-500', Mathematics: 'bg-pink-500' };
                const maxQ = Math.max(...(qStats?.totalBySubject || []).map(s => s.total));
                return (
                  <div key={item._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{icons[item._id]} {item._id}</span>
                      <span className="text-slate-500">{item.total} questions</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[item._id] || 'bg-brand-500'} rounded-full`} style={{ width: `${(item.total / maxQ) * 100}%` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {analytics?.recentActivity?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5">Recent Student Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['Student', 'Test', 'Score', 'Date'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.recentActivity.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{r.student?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.test?.title || 'Mock Test'}</td>
                    <td className="py-3 px-4 font-bold text-brand-600">{r.score}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(r.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
