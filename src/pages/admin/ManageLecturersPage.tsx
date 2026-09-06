import { useLecturers } from '../../hooks/useRecords';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Feedback';

export default function ManageLecturersPage() {
  const { lecturers, isLoading } = useLecturers();

  return (
    <div className="space-y-6">
      <Card padded={false}>
        <div className="p-5">
          <CardHeader title="Lecturer accounts" subtitle={`${lecturers.length} accounts`} action={<Button size="sm">Add lecturer</Button>} />
        </div>
        {isLoading ? (
          <Spinner label="Loading lecturer accounts" />
        ) : (
          <Table>
            <THead>
              <Th>Full name</Th>
              <Th>Email</Th>
              <Th>Department</Th>
              <Th>Courses</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </THead>
            <tbody>
              {lecturers.map((l) => (
                <Tr key={l.id}>
                  <Td className="font-medium text-ink-900">{l.fullName}</Td>
                  <Td>{l.email}</Td>
                  <Td>{l.department}</Td>
                  <Td>{l.courseCount}</Td>
                  <Td><Badge tone={l.status === 'active' ? 'pass' : 'fail'}>{l.status}</Badge></Td>
                  <Td className="text-right">
                    <button className="text-sm font-medium text-brand-500 hover:underline">
                      {l.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
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
