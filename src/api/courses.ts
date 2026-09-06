import { apiClient } from '../lib/apiClient';
import type { Course, Paginated } from '../types';

export const coursesKey = '/courses';
export const courseKey = (id: string) => `/courses/${id}`;

export async function fetchCourses(): Promise<Paginated<Course>> {
  const { data } = await apiClient.get<Paginated<Course>>(coursesKey);
  return data;
}

export async function fetchCourse(id: string): Promise<Course> {
  const { data } = await apiClient.get<Course>(courseKey(id));
  return data;
}
