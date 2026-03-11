import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, Award, BookOpen } from 'lucide-react';

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getStudentAnalytics()
      .then(res => setAnalytics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Loading analytics..."/></div>;

  if (!analytics || analytics.totalTests === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No data yet</h2>
        <p className="text-slate-500">Take some tests to see your analytics</p>
      </div>
    );
  }

  const subjectData = ['Physics', 'Chemistry', 'Mathematics'].map(subject => ({
    subject: subject.slice(0, 4),
    accuracy: parseFloat(analytics.subjectPerformance?.[subject]?.accuracy || 0),
    correct: analytics.subjectPerformance?.[subject]?.correct || 0,
    incorrect: analytics.subjectPerformance?.[subject]?.incorrect || 0,
  }));

  const radarData = ['Physics', 'Chemistry', 'Mathematics'].map(subject => ({
    subject,
    accuracy: parseFloat(analytics.subjectPerformance?.[subject]?.accuracy || 0),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-brand-600" size={26}/> My Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your JEE preparation progress</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: analytics.totalTests, icon: '📝', color: 'from-brand-500 to-brand-600' },
          { label: 'Avg Score', value: analytics.averageScore, icon: <TrendingUp size={18}/>, color: 'from-blue-500 to-blue-600' },
          { label: 'Best Score', value: analytics.bestScore, icon: <Award size={18}/>, color: 'from-green-500 to-green-600' },
          { label: 'Avg Accuracy', value: `${analytics.averageAccuracy}%`, icon: <Target size={18}/>, color: 'from-purple-500 to-purple-600' },
        ].map((s, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Score history chart */}
      {analytics.scoreHistory?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-600"/> Score History
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="test" label={{ value: 'Test #', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 12 }}/>
              <YAxis tick={{ fontSize: 12 }}/>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(v, n) => [v, n === 'score' ? 'Score' : 'Percentage']}/>
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Score"/>
              <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 3 }} name="Percentage"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject accuracy bar chart */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-600"/> Subject Accuracy
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="subject" tick={{ fontSize: 12 }}/>
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }}/>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={v => [`${v}%`, 'Accuracy']}/>
              <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Target size={18} className="text-brand-600"/> Performance Radar
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0"/>
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }}/>
              <Radar name="Accuracy" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2}/>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={v => [`${v}%`, 'Accuracy']}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy trend */}
      {analytics.accuracyTrend?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5">Accuracy Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.accuracyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
              <XAxis dataKey="test" tick={{ fontSize: 12 }}/>
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }}/>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={v => [`${v}%`, 'Accuracy']}/>
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject breakdown table */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-5">Detailed Subject Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Subject', 'Correct', 'Incorrect', 'Unattempted', 'Total', 'Accuracy', 'Score'].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Physics', 'Chemistry', 'Mathematics'].map(subject => {
                const s = analytics.subjectPerformance?.[subject];
                const icons = { Physics: '⚡', Chemistry: '🧪', Mathematics: '∑' };
                return (
                  <tr key={subject} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{icons[subject]} {subject}</td>
                    <td className="py-3 px-3 text-green-600 font-bold">{s?.correct || 0}</td>
                    <td className="py-3 px-3 text-red-500 font-bold">{s?.incorrect || 0}</td>
                    <td className="py-3 px-3 text-slate-400 font-bold">{s?.unattempted || 0}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{s?.total || 0}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${s?.accuracy || 0}%` }}/>
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{s?.accuracy || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-brand-600">{s?.score || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
