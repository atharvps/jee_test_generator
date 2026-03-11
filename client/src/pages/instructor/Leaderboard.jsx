import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Trophy, Medal, Search } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    analyticsService.getLeaderboard()
      .then(res => setLeaderboard(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = leaderboard.filter(e =>
    !search || e.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.student?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const rankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const rankBg = (rank) => {
    if (rank === 1) return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    if (rank === 2) return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800';
    return 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800';
  };

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Loading leaderboard..."/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="text-amber-500" size={28}/> Student Leaderboard
        </h1>
        <p className="text-slate-500 mt-1">Top performing students ranked by best score</p>
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
            const pos = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ['h-28', 'h-36', 'h-24'];
            const colors = ['bg-slate-400', 'bg-amber-400', 'bg-amber-700'];
            const emojis = ['🥈', '🥇', '🥉'];
            if (!entry) return <div key={i}/>;
            return (
              <div key={entry.student?.id} className="flex flex-col items-center">
                <div className="text-center mb-2">
                  <div className="text-3xl mb-1">{emojis[i]}</div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-24">
                    {entry.student?.name?.split(' ')[0]}
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{entry.bestScore}</p>
                </div>
                <div className={`w-full ${heights[i]} ${colors[i]} rounded-t-xl flex items-end justify-center pb-3`}>
                  <span className="text-white font-black text-xl">#{pos}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input type="text" placeholder="Search students..." className="input pl-9 py-2"
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <div className="text-5xl mb-3">🏆</div>
          <p className="font-medium">No results found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div key={entry.student?.id}
              className={`card p-4 border flex items-center gap-4 ${rankBg(entry.rank)} transition-all hover:shadow-md`}>
              <div className="w-12 text-center flex-shrink-0">
                <span className="text-xl font-black">{rankMedal(entry.rank)}</span>
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {entry.student?.name?.charAt(0)?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">{entry.student?.name}</p>
                <p className="text-xs text-slate-500 truncate">{entry.student?.email}</p>
              </div>

              <div className="hidden sm:grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-lg font-black text-brand-600">{entry.bestScore}</p>
                  <p className="text-xs text-slate-500">Best Score</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{entry.avgScore}</p>
                  <p className="text-xs text-slate-500">Avg Score</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{entry.attempts}</p>
                  <p className="text-xs text-slate-500">Tests Taken</p>
                </div>
              </div>

              <div className="sm:hidden text-right">
                <p className="text-xl font-black text-brand-600">{entry.bestScore}</p>
                <p className="text-xs text-slate-500">{entry.attempts} tests</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
