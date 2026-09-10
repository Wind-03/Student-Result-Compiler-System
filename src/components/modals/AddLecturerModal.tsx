import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import { Field, Input } from '../ui/Field';
import Button from '../ui/Button';
import { ErrorState } from '../ui/Feedback';
import { createLecturer } from '../../api/records';
import { useUIStore } from '../../stores/uiStore';

export default function AddLecturerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const pushToast = useUIStore((s) => s.pushToast);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setFullName('');
    setEmail('');
    setPassword('');
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

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    try {
      await createLecturer({ fullName, email, password });
      pushToast(`Lecturer account created for ${fullName}.`, 'success');
      onCreated();
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not create the lecturer account. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add lecturer">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorState message={error} />}
        <Field label="Full name">
          <Input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Ade Fashola"
            autoFocus
          />
        </Field>
        <Field label="Email">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="lecturer@srcs.edu"
          />
        </Field>
        <Field label="Temporary password" hint="At least 8 characters. The lecturer should change it after first login.">
          <Input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
          />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
