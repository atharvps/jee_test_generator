import { useState, useEffect } from 'react';
import { questionService } from '../../services/questionService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getDifficultyColor, getSubjectColor } from '../../utils/helpers';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';

const emptyForm = {
  subject: 'Physics', chapter: '', difficulty: 'Medium', type: 'MCQ',
  question_text: '', options: ['', '', '', ''], correct_answer: '', solution: '', tags: ''
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [filters, setFilters] = useState({ subject: '', difficulty: '', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.subject) params.subject = filters.subject;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      const res = await questionService.getAll(params);
      setQuestions(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(); }, [filters.subject, filters.difficulty, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.question_text || !form.correct_answer || !form.chapter)
      return setFormError('Please fill all required fields.');
    const options = form.options.filter(o => o.trim());
    if (form.type === 'MCQ' && options.length !== 4)
      return setFormError('MCQ questions must have exactly 4 options.');
    setFormLoading(true);
    try {
      const payload = { ...form, options, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      if (editingId) await questionService.update(editingId, payload);
      else await questionService.create(payload);
      setShowForm(false); setEditingId(null); setForm(emptyForm);
      fetchQuestions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save question.');
    } finally { setFormLoading(false); }
  };

  const handleEdit = (q) => {
    setForm({ ...q, options: q.options?.length ? q.options : ['','','',''], tags: q.tags?.join(', ') || '' });
    setEditingId(q._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try { await questionService.delete(id); fetchQuestions(); } catch (err) { console.error(err); }
  };

  const filtered = questions.filter(q =>
    !filters.search ||
    q.question_text.toLowerCase().includes(filters.search.toLowerCase()) ||
    q.chapter.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Question Bank</h1>
          <p className="text-slate-500 mt-1">{pagination.total || 0} questions total</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="btn-primary flex items-center gap-2">
          <Plus size={18}/> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Search questions..." className="input pl-9 py-2"
            value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}/>
        </div>
        <select className="input py-2 w-auto" value={filters.subject}
          onChange={e => { setFilters({...filters, subject: e.target.value}); setPage(1); }}>
          <option value="">All Subjects</option>
          {['Physics','Chemistry','Mathematics'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input py-2 w-auto" value={filters.difficulty}
          onChange={e => { setFilters({...filters, difficulty: e.target.value}); setPage(1); }}>
          <option value="">All Difficulties</option>
          {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <div className="text-5xl mb-3">📚</div>
          <p className="font-medium">No questions found</p>
          <button onClick={() => { setShowForm(true); setForm(emptyForm); }} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={16}/> Add First Question
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((q, i) => (
              <div key={q._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`badge ${getSubjectColor(q.subject)}`}>{q.subject}</span>
                      <span className={`badge ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                      <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{q.chapter}</span>
                      <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-500">{q.type}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium text-sm line-clamp-2">{q.question_text}</p>
                    {q.options?.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {q.options.map((opt, oi) => (
                          <p key={oi} className={`text-xs px-2 py-1 rounded ${opt === q.correct_answer ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                            {['A','B','C','D'][oi]}. {opt}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(q)} className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors">
                      <Edit size={16}/>
                    </button>
                    <button onClick={() => handleDelete(q._id)} className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-50">← Prev</button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))} disabled={page === pagination.pages} className="btn-secondary py-2 px-4 text-sm disabled:opacity-50">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button onClick={() => { setShowForm(false); setFormError(''); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Subject *</label>
                  <select className="input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                    {['Physics','Chemistry','Mathematics'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Chapter *</label>
                  <input type="text" className="input" placeholder="e.g. Mechanics" required value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})}/>
                </div>
                <div>
                  <label className="label">Difficulty *</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                    {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="MCQ">MCQ</option>
                    <option value="Integer">Integer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Question Text *</label>
                <textarea className="input min-h-24 resize-y" placeholder="Enter the question..." required
                  value={form.question_text} onChange={e => setForm({...form, question_text: e.target.value})}/>
              </div>
              {form.type === 'MCQ' && (
                <div>
                  <label className="label">Options (A, B, C, D) *</label>
                  <div className="space-y-2">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
                          {['A','B','C','D'][i]}
                        </span>
                        <input type="text" className="input py-2" placeholder={`Option ${['A','B','C','D'][i]}`}
                          value={form.options[i] || ''} onChange={e => {
                            const opts = [...form.options];
                            opts[i] = e.target.value;
                            setForm({...form, options: opts});
                          }}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="label">Correct Answer *</label>
                {form.type === 'MCQ' ? (
                  <select className="input" value={form.correct_answer} onChange={e => setForm({...form, correct_answer: e.target.value})}>
                    <option value="">Select correct option</option>
                    {form.options.filter(o => o.trim()).map((opt, i) => (
                      <option key={i} value={opt}>{['A','B','C','D'][i]}: {opt}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="input" placeholder="Enter the correct answer" required
                    value={form.correct_answer} onChange={e => setForm({...form, correct_answer: e.target.value})}/>
                )}
              </div>
              <div>
                <label className="label">Solution / Explanation</label>
                <textarea className="input min-h-20 resize-y" placeholder="Step-by-step solution..."
                  value={form.solution} onChange={e => setForm({...form, solution: e.target.value})}/>
              </div>
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input type="text" className="input" placeholder="e.g. kinematics, newton, velocity"
                  value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} className="btn-secondary flex-1" disabled={formLoading}>Cancel</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={formLoading}>
                  {formLoading ? 'Saving...' : <>{editingId ? 'Update' : 'Add'} Question</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
