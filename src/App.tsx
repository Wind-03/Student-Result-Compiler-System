import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import LoginPage from './pages/LoginPage';
import AuditTrailPage from './pages/AuditTrailPage';

import LecturerDashboardPage from './pages/lecturer/DashboardPage';
import UploadScoresPage from './pages/lecturer/UploadScoresPage';
import CompileMatchPage from './pages/lecturer/CompileMatchPage';
import ScoreScalingPage from './pages/lecturer/ScoreScalingPage';
import ResultSummaryPage from './pages/lecturer/ResultSummaryPage';
import ExportResultPage from './pages/lecturer/ExportResultPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import ManageLecturersPage from './pages/admin/ManageLecturersPage';
import GradingScalePage from './pages/admin/GradingScalePage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/lecturer'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute role="lecturer" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/lecturer" element={<LecturerDashboardPage />} />
            <Route path="/lecturer/upload" element={<UploadScoresPage />} />
            <Route path="/lecturer/compile" element={<CompileMatchPage />} />
            <Route path="/lecturer/scaling" element={<ScoreScalingPage />} />
            <Route path="/lecturer/summary" element={<ResultSummaryPage />} />
            <Route path="/lecturer/export" element={<ExportResultPage />} />
            <Route path="/lecturer/audit" element={<AuditTrailPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/students" element={<ManageStudentsPage />} />
            <Route path="/admin/courses" element={<ManageCoursesPage />} />
            <Route path="/admin/lecturers" element={<ManageLecturersPage />} />
            <Route path="/admin/grading-scale" element={<GradingScalePage />} />
            <Route path="/admin/audit" element={<AuditTrailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
