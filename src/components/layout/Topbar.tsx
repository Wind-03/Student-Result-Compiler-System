import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-ledger-200 bg-ledger-50/80 px-8 py-4 backdrop-blur">
      <div>
        <h1 className="font-serif text-xl font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-600">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-ink-900">{user?.fullName}</p>
          <p className="text-xs capitalize text-ink-600">{user?.role} &middot; {user?.department}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
          {user?.avatarInitials}
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="ml-2 rounded-sm border border-ledger-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-fail-500/40 hover:text-fail-600"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
