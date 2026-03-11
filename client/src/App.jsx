import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import StudentLayout from './components/shared/StudentLayout';
import InstructorLayout from './components/shared/InstructorLayout';

// Student pages
import StudentLogin from './pages/student/Login';
import StudentRegister from './pages/student/Register';
import StudentDashboard from './pages/student/Dashboard';
import GenerateTest from './pages/student/GenerateTest';
import ExamInterface from './pages/student/ExamInterface';
import StudentResults from './pages/student/Results';
import StudentAnalytics from './pages/student/Analytics';
import ResultDetail from './pages/student/ResultDetail';

// Instructor pages
import InstructorLogin from './pages/instructor/Login';
import InstructorRegister from './pages/instructor/Register';
import InstructorDashboard from './pages/instructor/Dashboard';
import QuestionBank from './pages/instructor/QuestionBank';
import TestManagement from './pages/instructor/TestManagement';
import InstructorAnalytics from './pages/instructor/Analytics';
import Leaderboard from './pages/instructor/Leaderboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/student/login" replace />} />

            {/* Student Auth */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<StudentRegister />} />

            {/* Student Protected Routes */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="generate-test" element={<GenerateTest />} />
              <Route path="exam/:testId" element={<ExamInterface />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="results/:resultId" element={<ResultDetail />} />
              <Route path="analytics" element={<StudentAnalytics />} />
            </Route>

            {/* Instructor Auth */}
            <Route path="/instructor/login" element={<InstructorLogin />} />
            <Route path="/instructor/register" element={<InstructorRegister />} />

            {/* Instructor Protected Routes */}
            <Route path="/instructor" element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InstructorDashboard />} />
              <Route path="question-bank" element={<QuestionBank />} />
              <Route path="tests" element={<TestManagement />} />
              <Route path="analytics" element={<InstructorAnalytics />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-brand-600 mb-4">404</h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">Page not found</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
