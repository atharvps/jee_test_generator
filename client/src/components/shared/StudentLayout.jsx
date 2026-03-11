import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { LayoutDashboard, FlaskConical, Play, BarChart2, History, Menu } from 'lucide-react';

const studentLinks = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
  { path: '/student/generate-test', label: 'Generate Test', icon: <FlaskConical size={18}/> },
  { path: '/student/results', label: 'My Results', icon: <History size={18}/> },
  { path: '/student/analytics', label: 'Analytics', icon: <BarChart2 size={18}/> },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar portalType="student" />
      <div className="flex flex-1">
        <Sidebar links={studentLinks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="lg:hidden p-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Menu size={20} />
            </button>
          </div>
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
