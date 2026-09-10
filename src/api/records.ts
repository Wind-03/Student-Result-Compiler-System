import { apiClient } from '../lib/apiClient';
import type {
  Department,
  GradeBand,
  LecturerAccount,
  Paginated,
  Student,
} from '../types';

/* -------------------------------------------------------------------------- */
/*  Create DTOs (mirror the backend's Zod schemas — registerSchema,           */
/*  createStudentSchema, createDepartmentSchema)                              */
/* -------------------------------------------------------------------------- */

export interface CreateLecturerInput {
  fullName: string;
  email: string;
  password: string;
}

export interface CreateStudentInput {
  fullName: string;
  registrationNumber: string;
  utmeNumber?: string;
  departmentId: string;
  level?: number;
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
}

/* -------------------------------------------------------------------------- */
/*  SWR keys (kept stable so hooks/pages don't change)                        */
/* -------------------------------------------------------------------------- */

export const departmentsKey = '/departments';
export const lecturersKey = '/lecturers';
export const studentsKey = (query = '') =>
  `/students${query ? `?query=${encodeURIComponent(query)}` : ''}`;
export const gradingScaleKey = '/grading-scale';

/* -------------------------------------------------------------------------- */
/*  Backend shapes                                                            */
/* -------------------------------------------------------------------------- */

interface BackendDepartment {
  id: string;
  name: string;
  code: string;
}
interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: 'LECTURER' | 'ADMIN';
  isApproved: boolean;
}
interface BackendStudent {
  id: string;
  fullName: string;
  registrationNumber: string;
  utmeNumber: string | null;
  departmentId: string;
  level: number | null;
}
interface BackendCourse {
  id: string;
  lecturerId: string | null;
  departmentId: string;
}
interface BackendGradeBand {
  grade: string;
  minScore: number;
  maxScore: number;
  isPass: boolean;
}
interface BackendGradingScale {
  id: string;
  name: string;
  isDefault: boolean;
  bands: BackendGradeBand[];
}

function paginate<T>(items: T[]): Paginated<T> {
  return { items, total: items.length, page: 1, pageSize: items.length || 1 };
}

/* -------------------------------------------------------------------------- */
/*  Departments                                                               */
/* -------------------------------------------------------------------------- */

export async function fetchDepartments(): Promise<Paginated<Department>> {
  const { data } = await apiClient.get<BackendDepartment[]>('/departments');
  const items: Department[] = data.map((d) => ({
    id: d.id,
    name: d.name,
    facultyName: `Code: ${d.code}`,
    headOfDepartment: '—',
  }));
  return paginate(items);
}

/** POST /departments — matches createDepartmentSchema (name, code). */
export async function createDepartment(
  input: CreateDepartmentInput,
): Promise<Department> {
  const { data } = await apiClient.post<BackendDepartment>('/departments', {
    name: input.name.trim(),
    code: input.code.trim(),
  });
  return { id: data.id, name: data.name, facultyName: `Code: ${data.code}`, headOfDepartment: '—' };
}

/** Shared department lookup used to resolve names elsewhere. */
async function departmentNameMap(): Promise<Map<string, string>> {
  const { data } = await apiClient.get<BackendDepartment[]>('/departments');
  return new Map(data.map((d) => [d.id, d.name]));
}

/* -------------------------------------------------------------------------- */
/*  Lecturers (admin only — derived from /users + /courses)                   */
/* -------------------------------------------------------------------------- */

export async function fetchLecturers(): Promise<Paginated<LecturerAccount>> {
  const [{ data: users }, courses, deptMap] = await Promise.all([
    apiClient.get<BackendUser[]>('/users'),
    apiClient.get<BackendCourse[]>('/courses').then((r) => r.data),
    departmentNameMap(),
  ]);

  const courseCountByLecturer = new Map<string, number>();
  const deptByLecturer = new Map<string, string>();
  for (const c of courses) {
    if (!c.lecturerId) continue;
    courseCountByLecturer.set(
      c.lecturerId,
      (courseCountByLecturer.get(c.lecturerId) ?? 0) + 1,
    );
    if (!deptByLecturer.has(c.lecturerId)) {
      deptByLecturer.set(c.lecturerId, deptMap.get(c.departmentId) ?? '—');
    }
  }

  const items: LecturerAccount[] = users
    .filter((u) => u.role === 'LECTURER')
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      department: deptByLecturer.get(u.id) ?? '—',
      courseCount: courseCountByLecturer.get(u.id) ?? 0,
      status: u.isApproved ? 'active' : 'suspended',
    }));

  return paginate(items);
}

/**
 * POST /auth/register — matches registerSchema (email, fullName, password,
 * role). Used by an admin to provision a new lecturer account; the account
 * lands with isApproved as set by the backend, reflected as 'active' or
 * 'suspended' once the lecturer list is refetched.
 */
export async function createLecturer(input: CreateLecturerInput): Promise<void> {
  await apiClient.post('/auth/register', {
    email: input.email.trim().toLowerCase(),
    fullName: input.fullName.trim(),
    password: input.password,
    role: 'LECTURER',
  });
}

export async function approveLecturer(id:string): Promise<void> {
  await apiClient.patch(`/users/${id}/approval`, {
    isApproved:true
  });
}

/* -------------------------------------------------------------------------- */
/*  Students (with client-side search across name + reg number)              */
/* -------------------------------------------------------------------------- */

export async function fetchStudents(query = ''): Promise<Paginated<Student>> {
  const [{ data: students }, deptMap] = await Promise.all([
    apiClient.get<BackendStudent[]>('/students'),
    departmentNameMap(),
  ]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.registrationNumber.toLowerCase().includes(q),
      )
    : students;

  const items: Student[] = filtered.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    regNumber: s.registrationNumber,
    utmeNumber: s.utmeNumber ?? '—',
    department: deptMap.get(s.departmentId) ?? '—',
    level: s.level != null ? String(s.level) : '—',
  }));

  return paginate(items);
}

/** POST /students — matches createStudentSchema. */
export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const { data } = await apiClient.post<BackendStudent>('/students', {
    fullName: input.fullName.trim(),
    registrationNumber: input.registrationNumber.trim(),
    utmeNumber: input.utmeNumber?.trim() || undefined,
    departmentId: input.departmentId,
    level: input.level,
  });
  const deptMap = await departmentNameMap();
  return {
    id: data.id,
    fullName: data.fullName,
    regNumber: data.registrationNumber,
    utmeNumber: data.utmeNumber ?? '—',
    department: deptMap.get(data.departmentId) ?? '—',
    level: data.level != null ? String(data.level) : '—',
  };
}

/* -------------------------------------------------------------------------- */
/*  Grading scale                                                             */
/* -------------------------------------------------------------------------- */

function bandsToFront(bands: BackendGradeBand[]): GradeBand[] {
  return [...bands]
    .sort((a, b) => b.maxScore - a.maxScore)
    .map((b) => ({
      grade: b.grade,
      min: b.minScore,
      max: b.maxScore,
      remark: b.isPass ? 'Pass' : 'Fail',
    }));
}

export async function fetchGradingScale(): Promise<{ items: GradeBand[] }> {
  const { data } = await apiClient.get<BackendGradingScale[]>('/grading-scales');
  const scale = data.find((s) => s.isDefault) ?? data[0];
  return { items: scale ? bandsToFront(scale.bands) : [] };
}

/**
 * There is no update endpoint for a grading scale; the backend creates scales.
 * Saving therefore POSTs a new default scale built from the edited bands. The
 * bands must tile 0–100 without gaps/overlaps or the backend rejects them.
 */
export async function updateGradingScale(
  items: GradeBand[],
): Promise<{ items: GradeBand[] }> {
  const bands = items.map((b) => ({
    grade: b.grade,
    minScore: b.min,
    maxScore: b.max,
    isPass: !/fail/i.test(b.remark),
  }));

  await apiClient.post('/grading-scales', {
    name: `Institutional Scale (${new Date().toISOString().slice(0, 10)})`,
    isDefault: true,
    bands,
  });

  return { items };
}

