import useSWR from 'swr';
import {
  departmentsKey,
  fetchDepartments,
  fetchGradingScale,
  fetchLecturers,
  fetchStudents,
  gradingScaleKey,
  lecturersKey,
  studentsKey,
} from '../api/records';

export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR(departmentsKey, fetchDepartments);
  return { departments: data?.items ?? [], error, isLoading, mutate };
}

export function useLecturers() {
  const { data, error, isLoading, mutate } = useSWR(lecturersKey, fetchLecturers);
  return { lecturers: data?.items ?? [], error, isLoading, mutate };
}

export function useStudents(query = '') {
  const { data, error, isLoading, mutate } = useSWR(studentsKey(query), () => fetchStudents(query));
  return { students: data?.items ?? [], total: data?.total ?? 0, error, isLoading, mutate };
}

export function useGradingScale() {
  const { data, error, isLoading, mutate } = useSWR(gradingScaleKey, fetchGradingScale);
  return { bands: data?.items ?? [], error, isLoading, mutate };
}
