import type { ReactNode } from 'react';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-ink-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      {label}...
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-ledger-200 px-6 py-12 text-center">
      <p className="font-serif text-lg font-medium text-ink-900">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-600">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-sm border border-fail-500/30 bg-fail-50 px-4 py-3 text-sm text-fail-600">
      {message ?? 'Something went wrong loading this data. Please try again.'}
    </div>
  );
}
