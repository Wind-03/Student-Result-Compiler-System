import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useUIStore } from '../../stores/uiStore';
import { previewScaling, applyScaling } from '../../api/scaling';
import Card, { CardHeader } from '../../components/ui/Card';
import { Field, Select, Input } from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Feedback';
import type { AssessmentType, ScalingMethod, ScalingPreviewSummary } from '../../types';

const methodOptions: { value: ScalingMethod; label: string; description: string }[] = [
  { value: 'range_conversion', label: 'Range conversion', description: 'Convert a component from one mark range to another (e.g., 30 → 20).' },
  { value: 'fixed_bonus', label: 'Fixed bonus', description: 'Add a fixed number of marks to every student.' },
  { value: 'percentage', label: 'Percentage-based', description: 'Increase the total score by a percentage.' },
  { value: 'component_specific', label: 'Component-specific', description: 'Apply a bonus restricted to one component only.' },
];

const targetOptions: { value: AssessmentType | 'total'; label: string }[] = [
  { value: 'total', label: 'Total score' },
  { value: 'test', label: 'Test' },
  { value: 'practical', label: 'Practical' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'examination', label: 'Examination' },
];

export default function ScoreScalingPage() {
  const { courses } = useCourses();
  const activeCourseId = useUIStore((s) => s.activeCourseId);
  const pushToast = useUIStore((s) => s.pushToast);
  const [courseId, setCourseId] = useState(activeCourseId ?? courses[0]?.id ?? '');
  const effectiveCourseId = courseId || courses[0]?.id || '';

  const [method, setMethod] = useState<ScalingMethod>('range_conversion');
  const [target, setTarget] = useState<AssessmentType | 'total'>('examination');
  const [fromMax, setFromMax] = useState(30);
  const [toMax, setToMax] = useState(20);
  const [bonusMarks, setBonusMarks] = useState(2);
  const [percentage, setPercentage] = useState(5);
  const [approvalReference, setApprovalReference] = useState('');
  const [note, setNote] = useState('');

  const [preview, setPreview] = useState<ScalingPreviewSummary | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);

  function buildRule() {
    return {
      courseId: effectiveCourseId,
      method,
      targetComponent: target,
      fromMax: method === 'range_conversion' ? fromMax : undefined,
      toMax: method === 'range_conversion' ? toMax : undefined,
      bonusMarks: method === 'fixed_bonus' || method === 'component_specific' ? bonusMarks : undefined,
      percentage: method === 'percentage' ? percentage : undefined,
      approvalReference,
      note,
    };
  }

  async function handlePreview() {
    setPreviewing(true);
    setPreview(null);
    try {
      const result = await previewScaling(effectiveCourseId, buildRule());
      setPreview(result);
    } catch {
      pushToast('Could not generate scaling preview.', 'error');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleApply() {
    if (!approvalReference) {
      pushToast('An approval reference is required before scaling can be applied.', 'error');
      return;
    }
    setApplying(true);
    try {
      await applyScaling(effectiveCourseId, buildRule());
      pushToast('Scaling applied. Totals and grades recalculated, and the audit trail updated.', 'success');
    } catch {
      pushToast('Scaling could not be applied. Confirm the approval reference and try again.', 'error');
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Define scaling rule" subtitle="Scaling cannot be applied without an approval reference" />
        <div className="mb-4 w-72">
          <Field label="Course">
            <Select value={effectiveCourseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} &mdash; {c.title}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {methodOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMethod(opt.value)}
              className={`rounded-sm border px-4 py-3 text-left transition-colors ${
                method === opt.value ? 'border-brand-500 bg-brand-50' : 'border-ledger-200 hover:border-brand-400'
              }`}
            >
              <p className="text-sm font-medium text-ink-900">{opt.label}</p>
              <p className="mt-0.5 text-xs text-ink-600">{opt.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Apply to">
            <Select value={target} onChange={(e) => setTarget(e.target.value as AssessmentType | 'total')}>
              {targetOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>

          {method === 'range_conversion' && (
            <>
              <Field label="From (max marks)">
                <Input type="number" value={fromMax} onChange={(e) => setFromMax(Number(e.target.value))} />
              </Field>
              <Field label="To (max marks)">
                <Input type="number" value={toMax} onChange={(e) => setToMax(Number(e.target.value))} />
              </Field>
            </>
          )}
          {(method === 'fixed_bonus' || method === 'component_specific') && (
            <Field label="Bonus marks">
              <Input type="number" value={bonusMarks} onChange={(e) => setBonusMarks(Number(e.target.value))} />
            </Field>
          )}
          {method === 'percentage' && (
            <Field label="Percentage increase (%)">
              <Input type="number" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} />
            </Field>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Approval reference" hint="Required - e.g. HOD memo or exam board reference">
            <Input value={approvalReference} onChange={(e) => setApprovalReference(e.target.value)} placeholder="HOD-CSC-2026-0031" />
          </Field>
          <Field label="Reason (optional)">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Exam found above approved difficulty band" />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={handlePreview} loading={previewing}>
            Preview effect
          </Button>
          <Button onClick={handleApply} loading={applying} disabled={!preview}>
            Apply scaling
          </Button>
        </div>
      </Card>

      {previewing && <Spinner label="Calculating scaling effect" />}

      {preview && (
        <Card padded={false}>
          <div className="p-5">
            <CardHeader title="Preview" subtitle={`${preview.affectedCount} students affected - review before applying`} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Pass rate before" value={`${preview.passRateBefore}%`} accent="ink" />
              <StatCard label="Pass rate after" value={`${preview.passRateAfter}%`} accent="pass" hint={`${(preview.passRateAfter - preview.passRateBefore).toFixed(1)}pt change`} />
              <StatCard label="Fail rate before" value={`${preview.failRateBefore}%`} accent="ink" />
              <StatCard label="Fail rate after" value={`${preview.failRateAfter}%`} accent="fail" />
            </div>
          </div>
          <Table>
            <THead>
              <Th>Full name</Th>
              <Th>Reg. number</Th>
              <Th>Score before</Th>
              <Th>Score after</Th>
              <Th>Grade before</Th>
              <Th>Grade after</Th>
              <Th>Status change</Th>
            </THead>
            <tbody>
              {preview.results.map((r) => (
                <Tr key={r.studentId}>
                  <Td className="font-medium text-ink-900">{r.fullName}</Td>
                  <Td className="font-mono text-xs">{r.regNumber}</Td>
                  <Td>{r.beforeScore}</Td>
                  <Td className="font-semibold">{r.afterScore}</Td>
                  <Td>{r.beforeGrade}</Td>
                  <Td>{r.afterGrade}</Td>
                  <Td>
                    {r.beforeStatus === r.afterStatus ? (
                      <Badge tone={r.afterStatus === 'pass' ? 'pass' : 'fail'}>No change</Badge>
                    ) : (
                      <Badge tone="gold">{r.beforeStatus} &rarr; {r.afterStatus}</Badge>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
