import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useUIStore } from '../../stores/uiStore';
import { useCompiledRecords, useUnmatchedRecords } from '../../hooks/useScores';
import { compileCourse, resolveUnmatchedRecord } from '../../api/scores';
import Card, { CardHeader } from '../../components/ui/Card';
import { Field, Select } from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner, EmptyState } from '../../components/ui/Feedback';
import type { UnmatchedRecord } from '../../types';

const actionLabels: Record<UnmatchedRecord['suggestedAction'], string> = {
  mark_absent: 'Mark absent',
  request_reupload: 'Request re-upload',
  enter_manually: 'Enter manually',
};

export default function CompileMatchPage() {
  const { courses } = useCourses();
  const activeCourseId = useUIStore((s) => s.activeCourseId);
  const pushToast = useUIStore((s) => s.pushToast);
  const [courseId, setCourseId] = useState(activeCourseId ?? courses[0]?.id ?? '');
  const effectiveCourseId = courseId || courses[0]?.id || '';

  const { records, isLoading, mutate } = useCompiledRecords(effectiveCourseId);
  const { items: unmatched, mutate: mutateUnmatched } = useUnmatchedRecords(effectiveCourseId);
  const [compiling, setCompiling] = useState(false);

  async function handleCompile() {
    setCompiling(true);
    try {
      await compileCourse(effectiveCourseId);
      await mutate();
      pushToast('Component tables compiled into one result table.', 'success');
    } catch {
      pushToast('Compilation failed. Please try again.', 'error');
    } finally {
      setCompiling(false);
    }
  }

  async function handleResolve(rowId: string, action: UnmatchedRecord['suggestedAction']) {
    await resolveUnmatchedRecord(effectiveCourseId, rowId, action);
    pushToast(`Marked as: ${actionLabels[action]}.`, 'info');
    mutateUnmatched();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Course" subtitle="Compile all uploaded component tables into a single result table" />
        <div className="flex items-end gap-4">
          <div className="w-72">
            <Field label="Course">
              <Select value={effectiveCourseId} onChange={(e) => setCourseId(e.target.value)}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} &mdash; {c.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button onClick={handleCompile} loading={compiling}>
            Compile &amp; match records
          </Button>
        </div>
      </Card>

      {unmatched.length > 0 && (
        <Card>
          <CardHeader title="Exceptions" subtitle="These rows could not be matched automatically - resolve before finalizing" />
          <div className="space-y-3">
            {unmatched.map((row) => (
              <div key={row.rowId} className="flex items-center justify-between rounded-sm border border-gold-400/40 bg-gold-400/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{row.fullName} <span className="font-mono text-xs text-ink-600">({row.regNumber})</span></p>
                  <p className="text-xs text-ink-600">{row.reason}</p>
                </div>
                <div className="flex gap-2">
                  {(['mark_absent', 'request_reupload', 'enter_manually'] as const).map((action) => (
                    <Button key={action} size="sm" variant={action === row.suggestedAction ? 'gold' : 'secondary'} onClick={() => handleResolve(row.rowId, action)}>
                      {actionLabels[action]}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="p-5">
          <CardHeader title="Compiled result table" subtitle="Total score calculated from all matched component tables" />
        </div>
        {isLoading ? (
          <Spinner label="Compiling records" />
        ) : records.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nothing compiled yet" description="Compile the course above to see the merged result table." />
          </div>
        ) : (
          <Table>
            <THead>
              <Th>Reg. number</Th>
              <Th>Full name</Th>
              <Th>Test</Th>
              <Th>Practical</Th>
              <Th>Assignment</Th>
              <Th>Exam</Th>
              <Th>Total</Th>
              <Th>Grade</Th>
              <Th>Status</Th>
            </THead>
            <tbody>
              {records.map((r) => (
                <Tr key={r.studentId}>
                  <Td className="font-mono text-xs">{r.regNumber}</Td>
                  <Td className="font-medium text-ink-900">{r.fullName}</Td>
                  {r.components.map((c) => (
                    <Td key={c.type}>{c.raw}/{c.max}</Td>
                  ))}
                  <Td className="font-semibold">{r.total}/{r.maxTotal}</Td>
                  <Td>{r.grade}</Td>
                  <Td>
                    <Badge tone={r.status === 'pass' ? 'pass' : 'fail'}>{r.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
