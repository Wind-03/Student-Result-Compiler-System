import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAuditTrail } from '../hooks/useAuditTrail';
import Card, { CardHeader } from '../components/ui/Card';
import { Field, Select } from '../components/ui/Field';
import Badge from '../components/ui/Badge';
import { Table, THead, Th, Td, Tr } from '../components/ui/Table';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import type { AuditAction } from '../types';

const actionOptions: { value: AuditAction | ''; label: string }[] = [
  { value: '', label: 'All actions' },
  { value: 'upload', label: 'Upload' },
  { value: 'score_edit', label: 'Score edit' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'export', label: 'Export' },
  { value: 'login', label: 'Login' },
  { value: 'record_change', label: 'Record change' },
];

const actionTone: Record<AuditAction, 'neutral' | 'gold' | 'brand' | 'pass'> = {
  upload: 'brand',
  score_edit: 'gold',
  scaling: 'gold',
  export: 'pass',
  login: 'neutral',
  record_change: 'neutral',
};

export default function AuditTrailPage() {
  const role = useAuthStore((s) => s.user?.role);
  const [action, setAction] = useState<AuditAction | ''>('');
  const { entries, isLoading } = useAuditTrail(action ? { action } : {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Filter"
          subtitle={role === 'admin' ? 'Every upload, edit, scaling action, and export institution-wide' : 'Actions recorded against courses you teach'}
        />
        <div className="w-64">
          <Field label="Action type">
            <Select value={action} onChange={(e) => setAction(e.target.value as AuditAction | '')}>
              {actionOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading audit trail" />
        ) : entries.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No entries found" description="Try a different filter." />
          </div>
        ) : (
          <Table>
            <THead>
              <Th>Timestamp</Th>
              <Th>Action</Th>
              <Th>Course</Th>
              <Th>Performed by</Th>
              <Th>Old value</Th>
              <Th>New value</Th>
              <Th>Approval ref.</Th>
            </THead>
            <tbody>
              {entries.map((e) => (
                <Tr key={e.id}>
                  <Td className="whitespace-nowrap text-ink-600">{new Date(e.timestamp).toLocaleString()}</Td>
                  <Td><Badge tone={actionTone[e.action]}>{e.action.replace('_', ' ')}</Badge></Td>
                  <Td>{e.courseCode ?? '—'}</Td>
                  <Td className="font-medium text-ink-900">
                    {e.performedBy}
                    <span className="block text-xs font-normal capitalize text-ink-600">{e.role}</span>
                  </Td>
                  <Td className="max-w-[14rem] truncate text-ink-600">{e.oldValue ?? '—'}</Td>
                  <Td className="max-w-[16rem] truncate">{e.newValue ?? '—'}</Td>
                  <Td className="font-mono text-xs">{e.approvalReference ?? '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <p className="text-xs text-ink-600">Audit entries are immutable and cannot be deleted.</p>
    </div>
  );
}
