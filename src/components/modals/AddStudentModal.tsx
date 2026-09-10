import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import Button from '../ui/Button';
import { ErrorState } from '../ui/Feedback';
import { createStudent } from '../../api/records';
import { useDepartments } from '../../hooks/useRecords';
import { useUIStore } from '../../stores/uiStore';

export default function AddStudentModal({
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
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [utmeNumber, setUtmeNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [level, setLevel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setFullName('');
    setRegistrationNumber('');
    setUtmeNumber('');
    setDepartmentId('');
    setLevel('');
    setError(null);
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!departmentId) {
      setError('Select a department.');
      return;
    }

    setSaving(true);
    try {
      await createStudent({
        fullName,
        registrationNumber,
        utmeNumber: utmeNumber || undefined,
        departmentId,
        level: level ? Number(level) : undefined,
      });
      pushToast(`Student "${fullName}" added to the registry.`, 'success');
      onCreated();
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not add the student. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add student">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorState message={error} />}
        <Field label="Full name">
          <Input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Balogun Ibrahim"
            autoFocus
          />
        </Field>
        <Field label="Registration number">
          <Input
            required
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="CSC/2021/1042"
          />
        </Field>
        <Field label="UTME number" hint="Optional secondary matching key.">
          <Input value={utmeNumber} onChange={(e) => setUtmeNumber(e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Department">
          <Select
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={deptLoading}
          >
            <option value="">{deptLoading ? 'Loading departments…' : 'Select a department'}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Level" hint="Optional, e.g. 300.">
          <Input type="number" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Optional" />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Add student
          </Button>
        </div>
      </form>
    </Modal>
  );
}
