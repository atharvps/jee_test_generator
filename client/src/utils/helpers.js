export const formatScore = (score, maxScore) => `${score}/${maxScore}`;
export const formatPercentage = (val) => `${parseFloat(val).toFixed(1)}%`;
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};
export const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const getDifficultyColor = (diff) => ({ Easy: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400', Medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400', Hard: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' }[diff] || '');
export const getSubjectColor = (subject) => ({ Physics: 'text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300', Chemistry: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300', Mathematics: 'text-pink-700 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300' }[subject] || '');
export const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-600' };
  if (percentage >= 70) return { grade: 'B', color: 'text-blue-600' };
  if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600' };
  if (percentage >= 50) return { grade: 'D', color: 'text-orange-600' };
  return { grade: 'F', color: 'text-red-600' };
};
