import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ portalType = 'student' }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(`/${portalType}/login`);
  };

  const portalColors = {
    student: 'from-brand-600 to-brand-800',
    instructor: 'from-slate-800 to-slate-900',
  };

  return (
    <nav className={`bg-gradient-to-r ${portalColors[portalType]} text-white px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <BookOpen size={16} />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight">JEE Mock Test</span>
          <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium capitalize">
            {portalType} Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
            <User size={12} />
          </div>
          <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg bg-white/10 hover:bg-red-500/30 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
