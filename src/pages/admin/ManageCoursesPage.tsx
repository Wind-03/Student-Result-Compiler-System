import { useCourses } from '../../hooks/useCourses';
import { useDepartments } from '../../hooks/useRecords';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Feedback';

export default function ManageCoursesPage() {
  const { courses, isLoading } = useCourses();
  const { departments, isLoading: deptLoading } = useDepartments();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Departments" subtitle={`${departments.length} departments`} action={<Button size="sm">Add department</Button>} />
        {deptLoading ? (
          <Spinner label="Loading departments" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {departments.map((d) => (
              <div key={d.id} className="rounded-sm border border-ledger-200 p-4">
                <p className="font-serif font-semibold text-ink-900">{d.name}</p>
                <p className="text-xs text-ink-600">{d.facultyName}</p>
                <p className="mt-2 text-xs text-ink-600">HOD: {d.headOfDepartment}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padded={false}>
        <div className="p-5">
          <CardHeader title="Courses" subtitle={`${courses.length} courses across all departments`} action={<Button size="sm">Add course</Button>} />
        </div>
        {isLoading ? (
          <Spinner label="Loading courses" />
        ) : (
          <Table>
            <THead>
              <Th>Code</Th>
              <Th>Title</Th>
              <Th>Department</Th>
              <Th>Level</Th>
              <Th>Lecturer</Th>
              <Th>Students</Th>
              <Th className="text-right">Action</Th>
            </THead>
            <tbody>
              {courses.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-mono text-xs">{c.code}</Td>
                  <Td className="font-medium text-ink-900">{c.title}</Td>
                  <Td>{c.department}</Td>
                  <Td>{c.level}</Td>
                  <Td>{c.lecturerName}</Td>
                  <Td>{c.studentCount}</Td>
                  <Td className="text-right">
                    <button className="text-sm font-medium text-brand-500 hover:underline">Edit</button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
