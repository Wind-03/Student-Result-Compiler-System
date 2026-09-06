import { useCourses } from '../../hooks/useCourses';
import { useDepartments, useLecturers } from '../../hooks/useRecords';
import { useAuditTrail } from '../../hooks/useAuditTrail';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Feedback';
import type { CompilationStatus } from '../../types';

const statusTone: Record<CompilationStatus, { label: string; tone: 'neutral' | 'pass' | 'gold' | 'brand' }> = {
  not_started: { label: 'Not started', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'gold' },
  compiled: { label: 'Compiled', tone: 'brand' },
  scaled: { label: 'Scaled', tone: 'brand' },
  exported: { label: 'Exported', tone: 'pass' },
};

export default function AdminDashboardPage() {
  const { courses, isLoading } = useCourses();
  const { departments } = useDepartments();
  const { lecturers } = useLecturers();
  const { entries } = useAuditTrail();

  if (isLoading) return <Spinner label="Loading institution overview" />;

  const scalingThisWeek = entries.filter((e) => e.action === 'scaling').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Departments" value={departments.length} accent="brand" />
        <StatCard label="Active lecturers" value={lecturers.filter((l) => l.status === 'active').length} accent="ink" />
        <StatCard label="Courses tracked" value={courses.length} accent="gold" />
        <StatCard label="Scaling actions logged" value={scalingThisWeek} accent="pass" />
      </div>

      <Card padded={false}>
        <div className="p-5">
          <CardHeader title="All courses" subtitle="Compilation status across every department" />
        </div>
        <Table>
          <THead>
            <Th>Course</Th>
            <Th>Lecturer</Th>
            <Th>Department</Th>
            <Th>Students</Th>
            <Th>Status</Th>
          </THead>
          <tbody>
            {courses.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-ink-900">{c.code}<span className="block text-xs font-normal text-ink-600">{c.title}</span></Td>
                <Td>{c.lecturerName}</Td>
                <Td>{c.department}</Td>
                <Td>{c.studentCount}</Td>
                <Td><Badge tone={statusTone[c.status].tone}>{statusTone[c.status].label}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
