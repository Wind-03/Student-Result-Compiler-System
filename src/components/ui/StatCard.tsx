import type { ReactNode } from 'react';

export default function StatCard({
  label,
  value,
  hint,
  accent = 'ink',
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: 'ink' | 'gold' | 'pass' | 'fail' | 'brand';
  icon?: ReactNode;
}) {
  const accentColor: Record<string, string> = {
    ink: 'text-ink-900',
    gold: 'text-gold-600',
    pass: 'text-pass-600',
    fail: 'text-fail-600',
    brand: 'text-brand-600',
  };
  return (
    <div className="rounded-sm border border-ledger-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-600">{label}</p>
        {icon && <span className="text-ink-600/60">{icon}</span>}
      </div>
      <p className={`mt-2 font-serif text-3xl font-semibold ${accentColor[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-600">{hint}</p>}
    </div>
  );
}
