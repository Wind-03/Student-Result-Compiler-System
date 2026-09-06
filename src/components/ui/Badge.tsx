import type { ReactNode } from 'react';

type Tone = 'neutral' | 'pass' | 'fail' | 'gold' | 'brand';

const tones: Record<Tone, string> = {
  neutral: 'bg-ledger-100 text-ink-700 border-ledger-200',
  pass: 'bg-pass-50 text-pass-600 border-pass-500/30',
  fail: 'bg-fail-50 text-fail-600 border-fail-500/30',
  gold: 'bg-gold-400/15 text-gold-600 border-gold-400/40',
  brand: 'bg-brand-50 text-brand-600 border-brand-400/30',
};

export default function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
