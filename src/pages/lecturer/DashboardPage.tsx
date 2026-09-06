import { Link } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { useAuditTrail } from '../../hooks/useAuditTrail';
import { useUIStore } from '../../stores/uiStore';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner, ErrorState } from '../../components/ui/Feedback';
import type { CompilationStatus } from '../../types';

const statusTone: Record<CompilationStatus, { label: string; tone: 'neutral' | 'pass' | 'gold' | 'brand' }> = {
  not_started: { label: 'Not started', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'gold' },
  compiled: { label: 'Compiled', tone: 'brand' },
  scaled: { label: 'Scaled', tone: 'brand' },
  exported: { label: 'Exported', tone: 'pass' },
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const actionLabel: Record<string, string> = {
  upload: 'uploaded a score table',
  score_edit: 'edited a score',
  scaling: 'applied a scaling rule',
  export: 'exported a result sheet',
  login: 'signed in',
  record_change: 'changed a record',
};

export default function LecturerDashboardPage() {
  const { courses, isLoading, error } = useCourses();
  const { entries } = useAuditTrail();
  const setActiveCourse = useUIStore((s) => s.setActiveCourse);

  if (isLoading) return <Spinner label="Loading your courses" />;
  if (error) return <ErrorState />;

  const pendingUploads = courses.filter((c) => c.status === 'not_started' || c.status === 'in_progress').length;
  const recentScaling = entries.filter((e) => e.action === 'scaling').length;
  const compiledStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active courses" value={courses.length} accent="brand" />
        <StatCard label="Pending uploads" value={pendingUploads} accent="gold" hint="Not yet compiled" />
        <StatCard label="Recent scaling actions" value={recentScaling} accent="ink" />
        <StatCard label="Compiled students" value={compiledStudents} accent="pass" />
      </div>

      <Card padded={false}>
        <div className="p-5">
          <CardHeader title="Your courses" subtitle="Compilation status for each course you teach" />
        </div>
        <Table>
          <THead>
            <Th>Course</Th>
            <Th>Department / Level</Th>
            <Th>Students</Th>
            <Th>Status</Th>
            <Th>Last activity</Th>
            <Th className="text-right">Action</Th>
          </THead>
          <tbody>
            {courses.map((course) => (
              <Tr key={course.id}>
                <Td className="font-medium text-ink-900">
                  {course.code}
                  <span className="block text-xs font-normal text-ink-600">{course.title}</span>
                </Td>
                <Td>
                  {course.department}
                  <span className="block text-xs text-ink-600">Level {course.level}</span>
                </Td>
                <Td>{course.studentCount}</Td>
                <Td>
                  <Badge tone={statusTone[course.status].tone}>{statusTone[course.status].label}</Badge>
                </Td>
                <Td className="text-ink-600">{timeAgo(course.lastActivityAt)}</Td>
                <Td className="text-right">
                  <Link
                    to="/lecturer/upload"
                    onClick={() => setActiveCourse(course.id)}
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 hover:underline"
                  >
                    Open &rarr;
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="Recent activity" subtitle="Your latest actions across all courses" />
        <ul className="space-y-3">
          {entries.slice(0, 6).map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-4 border-b border-ledger-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm text-ink-900">
                  <span className="font-medium">{entry.performedBy}</span> {actionLabel[entry.action]}
                  {entry.courseCode && <span className="text-ink-600"> &middot; {entry.courseCode}</span>}
                </p>
                {entry.newValue && <p className="mt-0.5 text-xs text-ink-600">{entry.newValue}</p>}
              </div>
              <span className="shrink-0 text-xs text-ink-600">{timeAgo(entry.timestamp)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
