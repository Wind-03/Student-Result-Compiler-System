import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../stores/authStore';
import type { Course, Paginated } from '../types';

export const coursesKey = '/courses';
export const courseKey = (id: string) => `/courses/${id}`;

/** Matches the backend's createCourseSchema. */
export interface CreateCourseInput {
  code: string;
  title: string;
  departmentId: string;
  lecturerId?: string;
  maxTest?: number;
  maxPractical?: number;
  maxAssignment?: number;
  maxExamination?: number;
}

interface BackendCourse {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  lecturerId: string | null;
  maxTest: number;
  maxPractical: number;
  maxAssignment: number;
  maxExamination: number;
  updatedAt?: string;
}
interface BackendDepartment {
  id: string;
  name: string;
}
interface BackendUser {
  id: string;
  fullName: string;
  role: string;
}
interface BackendStudent {
  id: string;
  departmentId: string;
}

/**
 * The backend course record has no lecturer name, level, student count or
 * status, so we enrich it:
 *  - department name       ← GET /departments
 *  - student count         ← GET /students (grouped by department)
 *  - lecturer name         ← GET /users, but only for admins (that route is
 *                            admin-only; lecturers see their own name)
 * Level and status have no backend source and use sensible placeholders.
 */
async function buildContext() {
  const currentUser = useAuthStore.getState().user;
  const isAdmin = currentUser?.role === 'admin';

  const [departments, students, users] = await Promise.all([
    apiClient.get<BackendDepartment[]>('/departments').then((r) => r.data),
    apiClient
      .get<BackendStudent[]>('/students')
      .then((r) => r.data)
      .catch(() => [] as BackendStudent[]),
    isAdmin
      ? apiClient
          .get<BackendUser[]>('/users')
          .then((r) => r.data)
          .catch(() => [] as BackendUser[])
      : Promise.resolve([] as BackendUser[]),
  ]);

  const deptName = new Map(departments.map((d) => [d.id, d.name]));
  const userName = new Map(users.map((u) => [u.id, u.fullName]));
  const studentCountByDept = new Map<string, number>();
  for (const s of students) {
    studentCountByDept.set(
      s.departmentId,
      (studentCountByDept.get(s.departmentId) ?? 0) + 1,
    );
  }

  return { currentUser, deptName, userName, studentCountByDept };
}

function toCourse(
  c: BackendCourse,
  ctx: Awaited<ReturnType<typeof buildContext>>,
): Course {
  let lecturerName = 'Unassigned';
  if (c.lecturerId) {
    lecturerName =
      ctx.userName.get(c.lecturerId) ??
      (ctx.currentUser?.id === c.lecturerId
        ? ctx.currentUser.fullName
        : 'Assigned lecturer');
  }

  return {
    id: c.id,
    code: c.code,
    title: c.title,
    department: ctx.deptName.get(c.departmentId) ?? '—',
    level: '—',
    lecturerId: c.lecturerId ?? '',
    lecturerName,
    studentCount: ctx.studentCountByDept.get(c.departmentId) ?? 0,
    status: 'not_started',
    lastActivityAt: c.updatedAt ?? new Date().toISOString(),
  };
}

export async function fetchCourses(): Promise<Paginated<Course>> {
  const [{ data }, ctx] = await Promise.all([
    apiClient.get<BackendCourse[]>(coursesKey),
    buildContext(),
  ]);
  const items = data.map((c) => toCourse(c, ctx));
  return { items, total: items.length, page: 1, pageSize: items.length || 1 };
}

export async function fetchCourse(id: string): Promise<Course> {
  const [{ data }, ctx] = await Promise.all([
    apiClient.get<BackendCourse>(courseKey(id)),
    buildContext(),
  ]);
  return toCourse(data, ctx);
}

/** POST /courses — matches createCourseSchema. Unset maxima fall back to the backend's defaults (20/20/0/60). */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const [{ data }, ctx] = await Promise.all([
    apiClient.post<BackendCourse>('/courses', {
      code: input.code.trim(),
      title: input.title.trim(),
      departmentId: input.departmentId,
      lecturerId: input.lecturerId || undefined,
      maxTest: input.maxTest,
      maxPractical: input.maxPractical,
      maxAssignment: input.maxAssignment,
      maxExamination: input.maxExamination,
    }),
    buildContext(),
  ]);
  return toCourse(data, ctx);
}

/** Per-component maxima for a course, used to render score/max cells. */
export async function fetchCourseMaxima(id: string): Promise<{
  test: number;
  practical: number;
  assignment: number;
  examination: number;
  total: number;
}> {
  const { data } = await apiClient.get<BackendCourse>(courseKey(id));
  const total =
    data.maxTest + data.maxPractical + data.maxAssignment + data.maxExamination;
  return {
    test: data.maxTest,
    practical: data.maxPractical,
    assignment: data.maxAssignment,
    examination: data.maxExamination,
    total,
  };
}
