import type {
  AuditEntry,
  AuthUser,
  Course,
  Department,
  GradeBand,
  LecturerAccount,
  Student,
} from '../types';

export const mockUsers: (AuthUser & { password: string })[] = [
  {
    id: 'u-lec-1',
    fullName: 'Dr. Ade Fashola',
    email: 'lecturer@srcs.edu',
    password: 'password',
    role: 'lecturer',
    department: 'Computer Science',
    avatarInitials: 'AF',
  },
  {
    id: 'u-admin-1',
    fullName: 'Mrs. Ngozi Umeh',
    email: 'admin@srcs.edu',
    password: 'password',
    role: 'admin',
    department: 'Registry',
    avatarInitials: 'NU',
  },
];

export const mockDepartments: Department[] = [
  { id: 'd-1', name: 'Computer Science', facultyName: 'Faculty of Science', headOfDepartment: 'Prof. Bello Kayode' },
  { id: 'd-2', name: 'Electrical Engineering', facultyName: 'Faculty of Engineering', headOfDepartment: 'Prof. Ifeoma Okoro' },
  { id: 'd-3', name: 'Economics', facultyName: 'Faculty of Social Sciences', headOfDepartment: 'Dr. Tunde Bakare' },
];

export const mockLecturers: LecturerAccount[] = [
  { id: 'u-lec-1', fullName: 'Dr. Ade Fashola', email: 'lecturer@srcs.edu', department: 'Computer Science', courseCount: 3, status: 'active' },
  { id: 'u-lec-2', fullName: 'Dr. Chioma Nwosu', email: 'c.nwosu@srcs.edu', department: 'Electrical Engineering', courseCount: 2, status: 'active' },
  { id: 'u-lec-3', fullName: 'Mr. Femi Adigun', email: 'f.adigun@srcs.edu', department: 'Economics', courseCount: 1, status: 'suspended' },
];

export const mockCourses: Course[] = [
  { id: 'c-1', code: 'CSC 301', title: 'Data Structures & Algorithms', department: 'Computer Science', level: '300', lecturerId: 'u-lec-1', lecturerName: 'Dr. Ade Fashola', studentCount: 84, status: 'compiled', lastActivityAt: '2026-08-29T10:15:00Z' },
  { id: 'c-2', code: 'CSC 305', title: 'Operating Systems', department: 'Computer Science', level: '300', lecturerId: 'u-lec-1', lecturerName: 'Dr. Ade Fashola', studentCount: 76, status: 'in_progress', lastActivityAt: '2026-09-02T14:40:00Z' },
  { id: 'c-3', code: 'CSC 401', title: 'Distributed Systems', department: 'Computer Science', level: '400', lecturerId: 'u-lec-1', lecturerName: 'Dr. Ade Fashola', studentCount: 51, status: 'not_started', lastActivityAt: '2026-08-20T09:00:00Z' },
  { id: 'c-4', code: 'EEE 302', title: 'Signals & Systems', department: 'Electrical Engineering', level: '300', lecturerId: 'u-lec-2', lecturerName: 'Dr. Chioma Nwosu', studentCount: 63, status: 'scaled', lastActivityAt: '2026-09-01T11:20:00Z' },
  { id: 'c-5', code: 'ECO 201', title: 'Microeconomics II', department: 'Economics', level: '200', lecturerId: 'u-lec-3', lecturerName: 'Mr. Femi Adigun', studentCount: 112, status: 'exported', lastActivityAt: '2026-08-15T16:00:00Z' },
];

export const mockGradeBands: GradeBand[] = [
  { grade: 'A', min: 70, max: 100, remark: 'Excellent' },
  { grade: 'B', min: 60, max: 69, remark: 'Very Good' },
  { grade: 'C', min: 50, max: 59, remark: 'Good' },
  { grade: 'D', min: 45, max: 49, remark: 'Fair' },
  { grade: 'E', min: 40, max: 44, remark: 'Pass' },
  { grade: 'F', min: 0, max: 39, remark: 'Fail' },
];

const firstNames = ['Chinedu', 'Amaka', 'Tunde', 'Ngozi', 'Musa', 'Fatima', 'Bola', 'Kelechi', 'Yemi', 'Grace', 'Ibrahim', 'Nkechi', 'Segun', 'Halima', 'Emeka', 'Blessing', 'Aliyu', 'Tolu', 'Uche', 'Zainab'];
const lastNames = ['Okafor', 'Balogun', 'Eze', 'Abubakar', 'Adeyemi', 'Nwachukwu', 'Suleiman', 'Okoro', 'Danjuma', 'Ojo', 'Chukwu', 'Yusuf', 'Obi', 'Lawal', 'Ibe'];

function makeStudent(i: number, department: string): Student {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i * 3) % lastNames.length];
  return {
    id: `s-${department.slice(0, 3).toLowerCase()}-${i}`,
    fullName: `${ln} ${fn}`,
    regNumber: `CSC/20${19 + (i % 6)}/${String(1000 + i)}`,
    utmeNumber: `${90000000 + i * 7}`,
    department,
    level: ['200', '300', '400'][i % 3],
  };
}

export const mockStudents: Student[] = Array.from({ length: 60 }, (_, i) =>
  makeStudent(i, ['Computer Science', 'Electrical Engineering', 'Economics'][i % 3])
);

export const mockAuditTrail: AuditEntry[] = [
  { id: 'a-1', action: 'upload', courseId: 'c-1', courseCode: 'CSC 301', performedBy: 'Dr. Ade Fashola', role: 'lecturer', timestamp: '2026-08-28T09:12:00Z', newValue: 'Uploaded examination scores (84 rows)' },
  { id: 'a-2', action: 'scaling', courseId: 'c-4', courseCode: 'EEE 302', performedBy: 'Dr. Chioma Nwosu', role: 'lecturer', timestamp: '2026-09-01T11:05:00Z', oldValue: 'Exam /30', newValue: 'Exam /20 (range conversion)', approvalReference: 'HOD-EEE-2026-014', reason: 'Exam paper found to be above approved difficulty band' },
  { id: 'a-3', action: 'score_edit', courseId: 'c-1', courseCode: 'CSC 301', performedBy: 'Dr. Ade Fashola', role: 'lecturer', timestamp: '2026-08-30T15:44:00Z', oldValue: '12', newValue: '18', reason: 'Transcription error corrected against original script' },
  { id: 'a-4', action: 'export', courseId: 'c-5', courseCode: 'ECO 201', performedBy: 'Mr. Femi Adigun', role: 'lecturer', timestamp: '2026-08-15T16:00:00Z', newValue: 'Exported PDF v1' },
  { id: 'a-5', action: 'login', performedBy: 'Mrs. Ngozi Umeh', role: 'admin', timestamp: '2026-09-02T08:00:00Z' },
  { id: 'a-6', action: 'record_change', courseId: undefined, performedBy: 'Mrs. Ngozi Umeh', role: 'admin', timestamp: '2026-08-25T10:30:00Z', oldValue: 'Grading scale D: 45-48', newValue: 'Grading scale D: 45-49' },
];
