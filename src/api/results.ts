import { apiClient } from '../lib/apiClient';
import type { ExportFormat, ExportRecord, ResultSummary } from '../types';

export const summaryKey = (courseId: string) => `/courses/${courseId}/summary`;
export const exportsKey = (courseId: string) => `/courses/${courseId}/exports`;

export async function fetchResultSummary(courseId: string): Promise<ResultSummary> {
  const { data } = await apiClient.get<ResultSummary>(summaryKey(courseId));
  return data;
}

export async function fetchExports(courseId: string): Promise<{ items: ExportRecord[] }> {
  const { data } = await apiClient.get(exportsKey(courseId));
  return data;
}

export async function exportResult(courseId: string, format: ExportFormat): Promise<ExportRecord> {
  const { data } = await apiClient.post<ExportRecord>(`/courses/${courseId}/export`, { format });
  return data;
}

export async function submitResult(courseId: string): Promise<{ submitted: boolean }> {
  const { data } = await apiClient.post(`/courses/${courseId}/submit`);
  return data;
}
