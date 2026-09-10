import { useEffect, useState } from 'react';
import { useGradingScale } from '../../hooks/useRecords';
import { updateGradingScale } from '../../api/records';
import { useUIStore } from '../../stores/uiStore';
import Card, { CardHeader } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { Spinner, ErrorState } from '../../components/ui/Feedback';
import type { GradeBand } from '../../types';

export default function GradingScalePage() {
  const { bands, isLoading, error, mutate } = useGradingScale();
  const pushToast = useUIStore((s) => s.pushToast);
  const [draft, setDraft] = useState<GradeBand[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bands.length) setDraft(bands);
  }, [bands]);

  function updateBand(index: number, field: keyof GradeBand, value: string | number) {
    setDraft((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateGradingScale(draft);
      await mutate();
      pushToast('Grading scale updated. This change is recorded in the audit trail.', 'success');
    } catch {
      pushToast('Could not save grading scale.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <Spinner label="Loading grading scale" />;
  if (error) return <ErrorState />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Institutional grading scale" subtitle="Applies to every course unless a component overrides it" />
        <div className="overflow-x-auto">
          <div className="min-w-[32rem] space-y-3">
            <div className="grid grid-cols-[3rem_1fr_1fr_1fr] gap-3 text-xs font-medium uppercase tracking-wide text-ink-600">
              <span>Grade</span>
              <span>Min %</span>
              <span>Max %</span>
              <span>Remark</span>
            </div>
            {draft.map((band, i) => (
              <div key={band.grade} className="grid grid-cols-[3rem_1fr_1fr_1fr] items-center gap-3">
                <span className="font-serif text-lg font-semibold text-ink-900">{band.grade}</span>
                <Field label="Min %">
                  <Input type="number" value={band.min} onChange={(e) => updateBand(i, 'min', Number(e.target.value))} />
                </Field>
                <Field label="Max %">
                  <Input type="number" value={band.max} onChange={(e) => updateBand(i, 'max', Number(e.target.value))} />
                </Field>
                <Field label="Remark">
                  <Input value={band.remark} onChange={(e) => updateBand(i, 'remark', e.target.value)} />
                </Field>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            Save grading scale
          </Button>
        </div>
      </Card>
    </div>
  );
}
