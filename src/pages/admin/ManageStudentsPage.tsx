import { useState } from 'react';
import { useStudents } from '../../hooks/useRecords';
import Card, { CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { Table, THead, Th, Td, Tr } from '../../components/ui/Table';
import { Spinner, EmptyState } from '../../components/ui/Feedback';

export default function ManageStudentsPage() {
  const [query, setQuery] = useState('');
  const { students, total, isLoading } = useStudents(query);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Student registry"
          subtitle={`${total} records`}
          action={<Button size="sm">Add student</Button>}
        />
        <Input
          placeholder="Search by name or registration number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Loading students" />
        ) : students.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No matching students" description="Try a different search term." />
          </div>
        ) : (
          <Table>
            <THead>
              <Th>Full name</Th>
              <Th>Reg. number</Th>
              <Th>UTME number</Th>
              <Th>Department</Th>
              <Th>Level</Th>
              <Th className="text-right">Action</Th>
            </THead>
            <tbody>
              {students.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium text-ink-900">{s.fullName}</Td>
                  <Td className="font-mono text-xs">{s.regNumber}</Td>
                  <Td className="font-mono text-xs">{s.utmeNumber}</Td>
                  <Td>{s.department}</Td>
                  <Td>{s.level}</Td>
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
