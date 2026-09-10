import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useUIStore } from '../../stores/uiStore';
import { useExports } from '../../hooks/useResults';
import { useCompiledRecords } from '../../hooks/useScores';
import { exportResult, submitResult } from '../../api/results';
import Card, { CardHeader } from '../../components/ui/Card';
import { Field, Select } from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { EmptyState, ErrorState } from '../../components/ui/Feedback';
import type { ExportFormat } from '../../types';

export default function ExportResultPage() {
  const { courses } = useCourses();
  const activeCourseId = useUIStore((s) => s.activeCourseId);
  const pushToast = useUIStore((s) => s.pushToast);
  const [courseId, setCourseId] = useState(activeCourseId ?? courses[0]?.id ?? '');
  const effectiveCourseId = courseId || courses[0]?.id || '';

  const { records, error: recordsError } = useCompiledRecords(effectiveCourseId);
  const { exports, mutate } = useExports(effectiveCourseId);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleExport(format: ExportFormat) {
    setExporting(format);
    try {
      await exportResult(effectiveCourseId, format);
      await mutate();
      pushToast(`${format.toUpperCase()} exported and recorded in the audit trail.`, 'success');
    } catch {
      pushToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(null);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitResult(effectiveCourseId);
      await mutate();
      pushToast('Result submitted for departmental moderation.', 'success');
    } catch {
      pushToast('Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="w-full sm:w-72">
          <Field label="Course">
            <Select value={effectiveCourseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} &mdash; {c.title}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5">
          <CardHeader
            title="Final result preview"
            subtitle={`${records.length} students - compiled, scaled, and graded`}
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleExport('xlsx')} loading={exporting === 'xlsx'}>
                  Export Excel
                </Button>
                <Button onClick={() => handleExport('pdf')} loading={exporting === 'pdf'}>
                  Export PDF
                </Button>
              </div>
            }
          />
        </div>
        {recordsError ? (
          <div className="p-5"><ErrorState message="Could not load the compiled result. Compile the course first." /></div>
        ) : records.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nothing to export yet" description="Compile the course first from the Compile & Match screen." />
          </div>
        ) : (
          <Table>
            <THead>
              <Th>Reg. number</Th>
              <Th>Full name</Th>
              <Th>Total</Th>
              <Th>Grade</Th>
              <Th>Status</Th>
            </THead>
            <tbody>
              {records.slice(0, 10).map((r) => (
                <Tr key={r.studentId}>
                  <Td className="font-mono text-xs">{r.regNumber}</Td>
                  <Td className="font-medium text-ink-900">{r.fullName}</Td>
                  <Td>{r.total}/{r.maxTotal}</Td>
                  <Td>{r.grade}</Td>
                  <Td><Badge tone={r.status === 'pass' ? 'pass' : 'fail'}>{r.status}</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        {records.length > 10 && (
          <p className="px-5 py-3 text-xs text-ink-600">Showing 10 of {records.length} rows in this preview - the exported file contains the full result table.</p>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Export history"
          subtitle="Every export is versioned and permanently recorded in the audit trail"
          action={
            <Button variant="secondary" size="sm" onClick={handleSubmit} loading={submitting} disabled={exports.length === 0}>
              Submit for HOD moderation
            </Button>
          }
        />
        {exports.length === 0 ? (
          <p className="text-sm text-ink-600">No exports yet for this course.</p>
        ) : (
          <ul className="divide-y divide-ledger-100">
            {exports.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  {e.format.toUpperCase()} &middot; v{e.version} &middot; {new Date(e.exportedAt).toLocaleString()}
                </span>
                <Badge tone={e.status === 'submitted' ? 'pass' : 'brand'}>{e.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
