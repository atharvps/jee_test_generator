import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, TrendingUp, Target, BarChart2 } from 'lucide-react';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];

export default function InstructorAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getInstructorAnalytics()
      .then(res => setAnalytics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Loading analytics..."/></div>;

  const subjectData = analytics?.classSubjectPerformance
    ? Object.entries(analytics.classSubjectPerformance).map(([subject, data]) => ({
        subject: subject.slice(0, 4), accuracy: parseFloat(data.accuracy || 0),
        correct: data.correct || 0, total: data.total || 0,
      }))
    : [];

  const scoreDistData = analytics?.scoreDistribution
    ? Object.entries(analytics.scoreDistribution).map(([range, count]) => ({ range, count }))
    : [];

  const topStudentsData = (analytics?.leaderboard || []).slice(0, 8).map(e => ({
    name: e.student?.name?.split(' ')[0] || 'Student',
    avgScore: parseFloat(e.avgScore || 0),
    bestScore: e.bestScore || 0,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="text-brand-600" size={26}/> Class Analytics
        </h1>
        <p className="text-slate-500 mt-1">Monitor overall student performance</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: analytics?.totalStudents || 0, icon: <Users size={18}/>, color: 'from-blue-500 to-blue-600' },
          { label: 'Tests Submitted', value: analytics?.totalTests || 0, icon: <Target size={18}/>, color: 'from-purple-500 to-purple-600' },
          { label: 'Class Average', value: analytics?.classAverage || 0, icon: <TrendingUp size={18}/>, color: 'from-green-500 to-green-600' },
          { label: 'Top Score', value: analytics?.leaderboard?.[0]?.bestScore || 0, icon: '🏆', color: 'from-amber-500 to-amber-600' },
        ].map((s, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3 text-lg`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject accuracy */}
        {subjectData.length > 0 && (
          <div className="card p-6">
            <h2 className="font-bold text-slate-900 dark:text-white mb-5">Subject-wise Class Accuracy</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="subject" tick={{ fontSize: 12 }}/>
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }}/>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={v => [`${v}%`, 'Accuracy']}/>
                <Bar dataKey="accuracy" fill="#6366f1" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score distribution */}
        {scoreDistData.length > 0 && (
          <div className="card p-6">
            <h2 className="font-bold text-slate-900 dark:text-white mb-5">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="range" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false}/>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={v => [v, 'Students']}/>
                <Bar dataKey="count" fill="#10b981" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top students chart */}
      {topStudentsData.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5">Top Students — Score Comparison</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topStudentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="name" tick={{ fontSize: 12 }}/>
              <YAxis tick={{ fontSize: 12 }}/>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }}/>
              <Legend/>
              <Bar dataKey="avgScore" name="Avg Score" fill="#6366f1" radius={[4,4,0,0]}/>
              <Bar dataKey="bestScore" name="Best Score" fill="#10b981" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject breakdown table */}
      {subjectData.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5">Subject-wise Class Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['Subject','Total Attempts','Correct','Class Accuracy'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics?.classSubjectPerformance || {}).map(([subject, data]) => {
                  const icons = { Physics:'⚡', Chemistry:'🧪', Mathematics:'∑' };
                  return (
                    <tr key={subject} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{icons[subject]} {subject}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{data.total || 0}</td>
                      <td className="py-3 px-4 text-green-600 font-bold">{data.correct || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${data.accuracy || 0}%` }}/>
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{data.accuracy || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!analytics || analytics.totalTests === 0) && (
        <div className="card p-16 text-center text-slate-400">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-medium">No data available yet</p>
          <p className="text-sm mt-1">Analytics will appear once students start taking tests.</p>
        </div>
      )}
    </div>
  );
}
