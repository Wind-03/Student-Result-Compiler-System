import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-ledger-200 bg-ledger-50/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileNav}
          aria-label="Open navigation"
          className="-ml-1 shrink-0 rounded-sm p-1.5 text-ink-700 hover:bg-ledger-100 lg:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-serif text-lg font-semibold text-ink-900 sm:text-xl">{title}</h1>
          {subtitle && <p className="hidden truncate text-sm text-ink-600 sm:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium text-ink-900">{user?.fullName}</p>
          <p className="text-xs capitalize text-ink-600">{user?.role} &middot; {user?.department}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
          {user?.avatarInitials}
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="ml-1 shrink-0 rounded-sm border border-ledger-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:border-fail-500/40 hover:text-fail-600 sm:ml-2 sm:px-3"
        >
          <span className="hidden sm:inline">Sign out</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="sm:hidden">
            <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
