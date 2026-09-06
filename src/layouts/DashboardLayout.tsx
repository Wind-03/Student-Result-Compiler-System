import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import ToastStack from '../components/ui/ToastStack';

const titles: Record<string, { title: string; subtitle?: string }> = {
  '/lecturer': { title: 'Lecturer Dashboard', subtitle: 'Your courses at a glance' },
  '/lecturer/upload': { title: 'Upload Score Table', subtitle: 'Import test, practical, assignment, or examination scores' },
  '/lecturer/compile': { title: 'Compile & Match', subtitle: 'Merge uploaded tables into one result table' },
  '/lecturer/scaling': { title: 'Score Scaling', subtitle: 'Apply an approved scaling formula and preview its effect' },
  '/lecturer/summary': { title: 'Result Summary & Statistics', subtitle: 'Pass rate, grade distribution, and class performance' },
  '/lecturer/export': { title: 'Export Final Result', subtitle: 'Download or submit the compiled result sheet' },
  '/lecturer/audit': { title: 'Audit Trail', subtitle: 'Every action recorded against your courses' },
  '/admin': { title: 'Administrator Dashboard', subtitle: 'Institution-wide overview' },
  '/admin/students': { title: 'Student Records', subtitle: 'Manage the student registry' },
  '/admin/courses': { title: 'Courses & Departments', subtitle: 'Manage course and department records' },
  '/admin/lecturers': { title: 'Lecturer Accounts', subtitle: 'Manage lecturer access' },
  '/admin/grading-scale': { title: 'Grading Scale', subtitle: 'Configure institution-wide grade boundaries' },
  '/admin/audit': { title: 'Audit Trail', subtitle: 'Every upload, edit, scaling action, and export institution-wide' },
};

export default function DashboardLayout() {
  const location = useLocation();
  const meta = titles[location.pathname] ?? { title: 'SRCS' };

  return (
    <div className="flex h-screen overflow-hidden bg-ledger-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
      <ToastStack />
    </div>
  );
}
