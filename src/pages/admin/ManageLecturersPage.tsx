import { useState } from 'react';
import { useLecturers } from '../../hooks/useRecords';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner, ErrorState } from '../../components/ui/Feedback';
import AddLecturerModal from '../../components/modals/AddLecturerModal';
import { approveLecturer } from '../../api/records';

export default function ManageLecturersPage() {
  const { lecturers, isLoading, error, mutate } = useLecturers();
  const [addOpen, setAddOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false)

  return (
    <div className="space-y-6">
      <Card padded={false}>
        <div className="p-5">
          <CardHeader
            title="Lecturer accounts"
            subtitle={`${lecturers.length} accounts`}
            action={<Button size="sm" onClick={() => setAddOpen(true)}>Add lecturer</Button>}
          />
        </div>
        {error ? (
          <div className="p-5"><ErrorState /></div>
        ) : isLoading ? (
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
                    <button className="text-sm font-medium text-brand-500 hover:underline" onClick={()=> {
                      setIsApproving(true)
                      approveLecturer(l.id)
                      approveLecturer(l.id).finally(() => setIsApproving(false))
                    }} disabled={l.status === 'active' || isApproving}>
                      {l.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <AddLecturerModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => mutate()} />
    </div>
  );
}
