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
  const { data, error, isLoading } = useSWR(departmentsKey, fetchDepartments);
  return { departments: data?.items ?? [], error, isLoading };
}

export function useLecturers() {
  const { data, error, isLoading } = useSWR(lecturersKey, fetchLecturers);
  return { lecturers: data?.items ?? [], error, isLoading };
}

export function useStudents(query = '') {
  const { data, error, isLoading } = useSWR(studentsKey(query), () => fetchStudents(query));
  return { students: data?.items ?? [], total: data?.total ?? 0, error, isLoading };
}

export function useGradingScale() {
  const { data, error, isLoading, mutate } = useSWR(gradingScaleKey, fetchGradingScale);
  return { bands: data?.items ?? [], error, isLoading, mutate };
}
