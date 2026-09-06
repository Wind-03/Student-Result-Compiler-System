import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useUIStore } from '../../stores/uiStore';
import { uploadScoreTable } from '../../api/scores';
import Card, { CardHeader } from '../../components/ui/Card';
import { Field, Select } from '../../components/ui/Field';
import FileDropzone from '../../components/ui/FileDropzone';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Feedback';
import type { AssessmentType, UploadPreview } from '../../types';

const assessmentOptions: { value: AssessmentType; label: string }[] = [
  { value: 'test', label: 'Test' },
  { value: 'practical', label: 'Practical' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'examination', label: 'Examination' },
];

const matchTone = {
  matched: 'pass' as const,
  partial: 'gold' as const,
  unmatched: 'fail' as const,
};

export default function UploadScoresPage() {
  const { courses } = useCourses();
  const activeCourseId = useUIStore((s) => s.activeCourseId);
  const pushToast = useUIStore((s) => s.pushToast);

  const [courseId, setCourseId] = useState(activeCourseId ?? courses[0]?.id ?? '');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('test');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveCourseId = courseId || courses[0]?.id || '';

  async function handleUpload() {
    if (!file || !effectiveCourseId) return;
    setLoading(true);
    setPreview(null);
    try {
      // TODO: replace mock uploadScoreTable() call with the real multipart upload endpoint.
      const result = await uploadScoreTable(effectiveCourseId, file, assessmentType);
      setPreview(result);
      pushToast(`${result.fileName} processed - ${result.matchedCount} of ${result.rows.length} rows matched automatically.`, 'success');
    } catch (err) {
      pushToast('Upload failed. Check the file format and try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="1. Select course and assessment" subtitle="Choose which component this score table belongs to" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Course">
            <Select value={effectiveCourseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} &mdash; {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assessment type">
            <Select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}>
              {assessmentOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="2. Upload file" subtitle="Excel or CSV, with registration number, UTME number, full name, department, and score columns" />
        <FileDropzone onFile={setFile} fileName={file?.name} />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleUpload} disabled={!file} loading={loading}>
            Upload &amp; check matches
          </Button>
        </div>
      </Card>

      {loading && <Spinner label="Matching records against the student registry" />}

      {preview && (
        <Card padded={false}>
          <div className="p-5">
            <CardHeader title="3. Review match status" subtitle={`${preview.fileName} · ${preview.rows.length} rows · max score ${preview.maxScore}`} />
            <div className="mb-4 grid grid-cols-3 gap-4">
              <StatCard label="Matched" value={preview.matchedCount} accent="pass" />
              <StatCard label="Partial match" value={preview.partialCount} accent="gold" />
              <StatCard label="Unmatched" value={preview.unmatchedCount} accent="fail" />
            </div>
          </div>
          <Table>
            <THead>
              <Th>Reg. number</Th>
              <Th>Full name</Th>
              <Th>Department</Th>
              <Th>Score</Th>
              <Th>Matched on</Th>
              <Th>Status</Th>
            </THead>
            <tbody>
              {preview.rows.map((row) => (
                <Tr key={row.rowId}>
                  <Td className="font-mono text-xs">{row.regNumber}</Td>
                  <Td>{row.fullName}</Td>
                  <Td>{row.department}</Td>
                  <Td>{row.score}</Td>
                  <Td className="text-ink-600">{row.matchedOn ?? '—'}</Td>
                  <Td>
                    <Badge tone={matchTone[row.matchStatus]}>{row.matchStatus}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="flex justify-end gap-3 p-5">
            <Button variant="secondary">Confirm import</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
