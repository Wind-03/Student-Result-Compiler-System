import useSWR from 'swr';
import { coursesKey, courseKey, fetchCourse, fetchCourses } from '../api/courses';

export function useCourses() {
  const { data, error, isLoading, mutate } = useSWR(coursesKey, fetchCourses);
  return { courses: data?.items ?? [], total: data?.total ?? 0, error, isLoading, mutate };
}

export function useCourse(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(id ? courseKey(id) : null, () => fetchCourse(id!));
  return { course: data, error, isLoading, mutate };
}
