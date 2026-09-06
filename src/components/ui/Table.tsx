import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-ledger-200">
      <table className="w-full min-w-max border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-ledger-50 text-left text-xs font-medium uppercase tracking-wide text-ink-600">
      <tr className="border-b border-ledger-200">{children}</tr>
    </thead>
  );
}

export function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-medium ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 text-ink-800 ${className}`}>{children}</td>;
}

export function Tr({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <tr className={`border-b border-ledger-100 last:border-0 hover:bg-ledger-50/60 ${className}`}>{children}</tr>;
}
