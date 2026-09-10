import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import Button from '../ui/Button';
import { ErrorState } from '../ui/Feedback';
import { createCourse } from '../../api/courses';
import { useDepartments, useLecturers } from '../../hooks/useRecords';
import { useUIStore } from '../../stores/uiStore';

/** Backend defaults (PRD §4.5): Test 20 + Practical 20 + Assignment 0 + Exam 60 = 100. */
const DEFAULT_MAXIMA = { maxTest: '20', maxPractical: '20', maxAssignment: '0', maxExamination: '60' };

export default function AddCourseModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const pushToast = useUIStore((s) => s.pushToast);
  const { departments, isLoading: deptLoading } = useDepartments();
  const { lecturers, isLoading: lecturersLoading } = useLecturers();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [maxima, setMaxima] = useState(DEFAULT_MAXIMA);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setCode('');
    setTitle('');
    setDepartmentId('');
    setLecturerId('');
    setMaxima(DEFAULT_MAXIMA);
    setError(null);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  function updateMax(field: keyof typeof DEFAULT_MAXIMA, value: string) {
    setMaxima((prev) => ({ ...prev, [field]: value }));
  }

  const total =
    (Number(maxima.maxTest) || 0) +
    (Number(maxima.maxPractical) || 0) +
    (Number(maxima.maxAssignment) || 0) +
    (Number(maxima.maxExamination) || 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!departmentId) {
      setError('Select a department.');
      return;
    }
    if (total !== 100) {
      setError(`Component maxima must add up to 100 (currently ${total}).`);
      return;
    }

    setSaving(true);
    try {
      await createCourse({
        code,
        title,
        departmentId,
        lecturerId: lecturerId || undefined,
        maxTest: Number(maxima.maxTest),
        maxPractical: Number(maxima.maxPractical),
        maxAssignment: Number(maxima.maxAssignment),
        maxExamination: Number(maxima.maxExamination),
      });
      pushToast(`Course "${code}" created.`, 'success');
      onCreated();
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not create the course. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add course" width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorState message={error} />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Course code">
            <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSC301" autoFocus />
          </Field>
          <Field label="Course title">
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Data Structures" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Department">
            <Select required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={deptLoading}>
              <option value="">{deptLoading ? 'Loading…' : 'Select a department'}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Lecturer" hint="Optional — can be assigned later.">
            <Select value={lecturerId} onChange={(e) => setLecturerId(e.target.value)} disabled={lecturersLoading}>
              <option value="">{lecturersLoading ? 'Loading…' : 'Unassigned'}</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-800">Component maxima</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Test">
              <Input type="number" min={0} value={maxima.maxTest} onChange={(e) => updateMax('maxTest', e.target.value)} />
            </Field>
            <Field label="Practical">
              <Input type="number" min={0} value={maxima.maxPractical} onChange={(e) => updateMax('maxPractical', e.target.value)} />
            </Field>
            <Field label="Assignment">
              <Input type="number" min={0} value={maxima.maxAssignment} onChange={(e) => updateMax('maxAssignment', e.target.value)} />
            </Field>
            <Field label="Examination">
              <Input type="number" min={0} value={maxima.maxExamination} onChange={(e) => updateMax('maxExamination', e.target.value)} />
            </Field>
          </div>
          <p className={`mt-1.5 text-xs ${total === 100 ? 'text-ink-600' : 'text-fail-600'}`}>
            Total: {total} / 100
          </p>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create course
          </Button>
        </div>
      </form>
    </Modal>
  );
}
