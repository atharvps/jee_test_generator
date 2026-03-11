import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { LayoutDashboard, BookOpen, ClipboardList, BarChart2, Trophy, Menu } from 'lucide-react';

const instructorLinks = [
  { path: '/instructor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
  { path: '/instructor/question-bank', label: 'Question Bank', icon: <BookOpen size={18}/> },
  { path: '/instructor/tests', label: 'Test Management', icon: <ClipboardList size={18}/> },
  { path: '/instructor/analytics', label: 'Analytics', icon: <BarChart2 size={18}/> },
  { path: '/instructor/leaderboard', label: 'Leaderboard', icon: <Trophy size={18}/> },
];

export default function InstructorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar portalType="instructor" />
      <div className="flex flex-1">
        <Sidebar links={instructorLinks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
