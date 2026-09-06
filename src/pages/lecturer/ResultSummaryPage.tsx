import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useUIStore } from '../../stores/uiStore';
import { useResultSummary } from '../../hooks/useResults';
import Card, { CardHeader } from '../../components/ui/Card';
import { Field, Select } from '../../components/ui/Field';
import StatCard from '../../components/ui/StatCard';
import { Spinner, ErrorState } from '../../components/ui/Feedback';

export default function ResultSummaryPage() {
  const { courses } = useCourses();
  const activeCourseId = useUIStore((s) => s.activeCourseId);
  const [courseId, setCourseId] = useState(activeCourseId ?? courses[0]?.id ?? '');
  const effectiveCourseId = courseId || courses[0]?.id || '';
  const { summary, isLoading, error } = useResultSummary(effectiveCourseId);

  const maxCount = summary ? Math.max(...summary.gradeDistribution.map((g) => g.count), 1) : 1;

  return (
    <div className="space-y-6">
      <Card>
        <div className="w-72">
          <Field label="Course">
            <Select value={effectiveCourseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} &mdash; {c.title}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {isLoading && <Spinner label="Loading result summary" />}
      {error && <ErrorState />}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Pass rate" value={`${summary.passRate}%`} accent="pass" hint={`${summary.passCount} students`} />
            <StatCard label="Fail rate" value={`${summary.failRate}%`} accent="fail" hint={`${summary.failCount} students`} />
            <StatCard label="Highest score" value={summary.highestScore} accent="brand" />
            <StatCard label="Lowest score" value={summary.lowestScore} accent="ink" />
            <StatCard label="Class average" value={summary.classAverage} accent="gold" />
          </div>

          <Card>
            <CardHeader title="Grade distribution" subtitle="Number of students per grade band" />
            <div className="space-y-3">
              {summary.gradeDistribution.map((g) => (
                <div key={g.grade} className="flex items-center gap-4">
                  <span className="w-6 text-sm font-semibold text-ink-900">{g.grade}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-sm bg-ledger-100">
                    <div
                      className="h-full rounded-sm bg-brand-500"
                      style={{ width: `${(g.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm text-ink-600">{g.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {summary.comparedToPrevious && (
            <Card>
              <CardHeader title="Before vs. after scaling" subtitle="Comparison against the pre-scaling result set" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-600">Pass rate change</p>
                  <p className={`mt-1 font-serif text-2xl font-semibold ${summary.comparedToPrevious.passRate >= 0 ? 'text-pass-600' : 'text-fail-600'}`}>
                    {summary.comparedToPrevious.passRate >= 0 ? '+' : ''}
                    {summary.comparedToPrevious.passRate}pt
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-600">Class average change</p>
                  <p className={`mt-1 font-serif text-2xl font-semibold ${summary.comparedToPrevious.classAverage >= 0 ? 'text-pass-600' : 'text-fail-600'}`}>
                    {summary.comparedToPrevious.classAverage >= 0 ? '+' : ''}
                    {summary.comparedToPrevious.classAverage} pts
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
