import { apiClient } from '../lib/apiClient';
import type { Department, GradeBand, LecturerAccount, Paginated, Student } from '../types';

export const departmentsKey = '/departments';
export const lecturersKey = '/lecturers';
export const studentsKey = (query = '') => `/students${query ? `?query=${encodeURIComponent(query)}` : ''}`;
export const gradingScaleKey = '/grading-scale';

export async function fetchDepartments(): Promise<Paginated<Department>> {
  const { data } = await apiClient.get(departmentsKey);
  return data;
}

export async function fetchLecturers(): Promise<Paginated<LecturerAccount>> {
  const { data } = await apiClient.get(lecturersKey);
  return data;
}

export async function fetchStudents(query = ''): Promise<Paginated<Student>> {
  const { data } = await apiClient.get(studentsKey(query));
  return data;
}

export async function fetchGradingScale(): Promise<{ items: GradeBand[] }> {
  const { data } = await apiClient.get(gradingScaleKey);
  return data;
}

export async function updateGradingScale(items: GradeBand[]): Promise<{ items: GradeBand[] }> {
  const { data } = await apiClient.put(gradingScaleKey, { items });
  return data;
}
