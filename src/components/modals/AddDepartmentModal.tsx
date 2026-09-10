import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { Field, Input } from '../ui/Field';
import Button from '../ui/Button';
import { ErrorState } from '../ui/Feedback';
import { createDepartment } from '../../api/records';
import { useUIStore } from '../../stores/uiStore';

export default function AddDepartmentModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const pushToast = useUIStore((s) => s.pushToast);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setName('');
    setCode('');
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
    setSaving(true);
    try {
      await createDepartment({ name, code });
      pushToast(`Department "${name}" created.`, 'success');
      onCreated();
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not create the department. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add department">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorState message={error} />}
        <Field label="Department name">
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Computer Science"
            autoFocus
          />
        </Field>
        <Field label="Department code" hint="Short code used in registration numbers, e.g. CSC.">
          <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSC" />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create department
          </Button>
        </div>
      </form>
    </Modal>
  );
}
