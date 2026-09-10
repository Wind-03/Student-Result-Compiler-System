import type { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

const lecturerNav = [
  { to: '/lecturer', label: 'Dashboard', icon: 'grid' },
  { to: '/lecturer/upload', label: 'Upload Scores', icon: 'upload' },
  { to: '/lecturer/compile', label: 'Compile & Match', icon: 'merge' },
  { to: '/lecturer/scaling', label: 'Score Scaling', icon: 'sliders' },
  { to: '/lecturer/summary', label: 'Result Summary', icon: 'chart' },
  { to: '/lecturer/export', label: 'Export Result', icon: 'download' },
  { to: '/lecturer/audit', label: 'Audit Trail', icon: 'clock' },
] as const;

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: 'grid' },
  { to: '/admin/students', label: 'Students', icon: 'users' },
  { to: '/admin/courses', label: 'Courses & Departments', icon: 'book' },
  { to: '/admin/lecturers', label: 'Lecturer Accounts', icon: 'id' },
  { to: '/admin/grading-scale', label: 'Grading Scale', icon: 'sliders' },
  { to: '/admin/audit', label: 'Audit Trail', icon: 'clock' },
] as const;

const icons: Record<string, ReactElement> = {
  grid: <path d="M4 5h6v6H4zm10 0h6v6h-6zM4 15h6v6H4zm10 0h6v6h-6z" />,
  upload: <path d="M12 4v11m0-11 4 4m-4-4-4 4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />,
  merge: <path d="M6 4v6a4 4 0 0 0 4 4h4m0 0-3-3m3 3-3 3M6 14v6" />,
  sliders: <path d="M4 6h9m3 0h4M4 12h4m3 0h9M4 18h13m3 0h1M9 4v4M17 9v4M6 16v4" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7" />,
  download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />,
  clock: <path d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  users: <path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m18 0v-1a4 4 0 0 0-3-3.87M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 3a4 4 0 0 0 0-6" />,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />,
  id: <path d="M4 5h16v14H4zM8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-3 6c0-1.7 1.3-3 3-3s3 1.3 3 3m5-7h5m-5 4h5" />,
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);
  const items = role === 'admin' ? adminNav : lecturerNav;
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  return (
    <>
      {/* Backdrop, mobile only, shown when the drawer is open */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 max-w-[80vw] shrink-0 -translate-x-full flex-col border-r border-ink-700/40 bg-ink-900 text-ledger-100 transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-ink-700/40 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gold-500 font-serif text-sm font-bold text-ink-900">
              S
            </div>
            <div>
              <p className="font-serif text-sm font-semibold leading-tight text-white">SRCS</p>
              <p className="text-[11px] leading-tight text-ledger-100/60">Result Compilation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
            className="rounded-sm p-1 text-ledger-100/70 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/lecturer' || item.to === '/admin'}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-ledger-100/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-700/40 px-5 py-4 text-[11px] text-ledger-100/50">
          v1.0 &middot; Draft build
        </div>
      </aside>
    </>
  );
}
