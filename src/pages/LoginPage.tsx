import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import type { UserRole } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const authLogin = useAuthStore((s) => s.login);
  const [role, setRole] = useState<UserRole>('lecturer');
  const [email, setEmail] = useState('lecturer@srcs.edu');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login({ email, password, role });
      authLogin(user, token);
      navigate(user.role === 'admin' ? '/admin' : '/lecturer');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-900">
      {/* Left: brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden px-14 py-12 text-ledger-100 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(214,169,79,0.12),transparent_45%)]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-gold-500 font-serif text-base font-bold text-ink-900">S</div>
          <span className="font-serif text-lg font-semibold text-white">SRCS</span>
        </div>
        <div className="relative max-w-md">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gold-400">Student Result Compilation &amp; Scaling System</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-white">
            One result table, matched, scaled, and audited automatically.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ledger-100/70">
            Compile test, practical, assignment, and examination scores across tables, apply
            approved scaling with a full audit trail, and export a final result sheet in minutes.
          </p>
        </div>
        <div className="relative flex gap-8 text-sm text-ledger-100/60">
          <div>
            <p className="font-serif text-2xl text-white">95%+</p>
            <p>auto-match rate</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-white">100%</p>
            <p>auditable scaling</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-white">70%</p>
            <p>less manual work</p>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full items-center justify-center bg-ledger-50 px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">Sign in</h2>
          <p className="mt-1 text-sm text-ink-600">Access your department's result compilation workspace.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-sm border border-ledger-200 bg-white p-1">
            {(['lecturer', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-sm py-2 text-sm font-medium capitalize transition-colors ${
                  role === r ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-ledger-100'
                }`}
              >
                Login as {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email address">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@institution.edu" />
            </Field>
            <Field label="Password">
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>

            {error && <p className="rounded-sm border border-fail-500/30 bg-fail-50 px-3 py-2 text-sm text-fail-600">{error}</p>}

            <Button type="submit" className="w-full" loading={loading}>
              Sign in as {role}
            </Button>
          </form>

          <p className="mt-6 text-xs text-ink-600">
            Demo credentials are pre-filled. All sign-in attempts are logged for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
