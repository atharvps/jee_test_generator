import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, Eye, EyeOff, Sun, Moon, Zap } from 'lucide-react';

export default function StudentLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, 'student');
      if (user.role === 'student') navigate('/student/dashboard');
      else setError('This account is not registered as a student.');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'student@jee.com', password: 'Student@123' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <button onClick={toggleTheme} className="fixed top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
        {isDark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <BookOpen className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">JEE Mock Test</h1>
          <p className="text-brand-300 mt-1">Student Portal</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Sign in to continue</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" className="input" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} className="input pr-12" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <button onClick={fillDemo} className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline">
            <Zap size={14}/> Use demo credentials
          </button>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/student/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Register here
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            Are you an instructor?{' '}
            <Link to="/instructor/login" className="text-slate-500 hover:underline">Instructor Portal →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
