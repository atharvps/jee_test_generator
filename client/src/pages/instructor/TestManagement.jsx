import { useState, useEffect } from 'react';
import { testService } from '../../services/testService';
import { questionService } from '../../services/questionService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Plus, ClipboardList, X, Users, Clock } from 'lucide-react';

export default function TestManagement() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ title: '', subjects: ['Physics','Chemistry','Mathematics'], duration_minutes: 180 });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [qFilter, setQFilter] = useState({ subject: '', difficulty: '' });

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await testService.getAllTests();
      setTests(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchQuestions = async () => {
    try {
      const params = { limit: 100 };
      if (qFilter.subject) params.subject = qFilter.subject;
      if (qFilter.difficulty) params.difficulty = qFilter.difficulty;
      const res = await questionService.getAll(params);
      setQuestions(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTests(); }, []);
  useEffect(() => { if (showForm) fetchQuestions(); }, [showForm, qFilter.subject, qFilter.difficulty]);

  const toggleQuestion = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setFormError('');
    if (selectedIds.length === 0) return setFormError('Please select at least one question.');
    setFormLoading(true);
    try {
      await testService.createOfficial({ ...form, question_ids: selectedIds });
      setShowForm(false); setSelectedIds([]); setForm({ title: '', subjects: ['Physics','Chemistry','Mathematics'], duration_minutes: 180 });
      fetchTests();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create test.');
    } finally { setFormLoading(false); }
  };

  const subjectColor = { Physics: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', Chemistry: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', Mathematics: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-brand-600" size={26}/> Test Management
          </h1>
          <p className="text-slate-500 mt-1">Create and manage official tests</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18}/> Create Official Test
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg"/></div>
      ) : tests.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium mb-4">No tests created yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16}/> Create Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map(test => (
            <div key={test._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`badge text-xs ${test.type === 'official' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'}`}>
                  {test.type === 'official' ? '⭐ Official' : '🤖 Auto-generated'}
                </span>
                {test.isPublished && <span className="badge bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs">Published</span>}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{test.title || 'Mock Test'}</h3>
              <div className="flex flex-wrap gap-1 mb-3">
                {test.config?.subjects?.map(s => (
                  <span key={s} className={`badge text-xs ${subjectColor[s] || ''}`}>{s}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><ClipboardList size={12}/> {test.questions?.length || test.config?.number_of_questions || 0} questions</span>
                <span className="flex items-center gap-1"><Clock size={12}/> {test.config?.duration_minutes || 180} min</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <Users size={11}/> By {test.created_by?.name || 'Instructor'} · {formatDate(test.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Test Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Official Test</h2>
              <button onClick={() => { setShowForm(false); setFormError(''); setSelectedIds([]); }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateTest} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 text-sm">{formError}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Test Title</label>
                    <input type="text" className="input" placeholder="e.g. JEE Main Mock Test 2025"
                      value={form.title} onChange={e => setForm({...form, title: e.target.value})}/>
                  </div>
                  <div>
                    <label className="label">Duration (minutes)</label>
                    <input type="number" className="input" min="30" max="360" value={form.duration_minutes}
                      onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})}/>
                  </div>
                </div>

                <div>
                  <label className="label">Select Questions ({selectedIds.length} selected)</label>
                  <div className="flex gap-2 mb-3">
                    <select className="input py-2 text-sm" value={qFilter.subject}
                      onChange={e => setQFilter({...qFilter, subject: e.target.value})}>
                      <option value="">All Subjects</option>
                      {['Physics','Chemistry','Mathematics'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select className="input py-2 text-sm" value={qFilter.difficulty}
                      onChange={e => setQFilter({...qFilter, difficulty: e.target.value})}>
                      <option value="">All Difficulties</option>
                      {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
                    </select>
                    {selectedIds.length > 0 && (
                      <button type="button" onClick={() => setSelectedIds([])}
                        className="btn-secondary py-2 px-3 text-sm text-red-600 border-red-200">Clear</button>
                    )}
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-y-auto max-h-64 divide-y divide-slate-100 dark:divide-slate-800">
                    {questions.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">No questions found</div>
                    ) : questions.map(q => (
                      <label key={q._id} className="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <input type="checkbox" className="mt-1 accent-brand-600" checked={selectedIds.includes(q._id)}
                          onChange={() => toggleQuestion(q._id)}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{q.question_text}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-slate-500">{q.subject}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500">{q.chapter}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className={`text-xs font-semibold ${q.difficulty === 'Easy' ? 'text-green-600' : q.difficulty === 'Hard' ? 'text-red-500' : 'text-yellow-600'}`}>{q.difficulty}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <button type="button" onClick={() => { setShowForm(false); setSelectedIds([]); }}
                  className="btn-secondary flex-1" disabled={formLoading}>Cancel</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={formLoading}>
                  {formLoading ? 'Creating...' : `Create Test (${selectedIds.length} Qs)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
