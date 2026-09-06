import { apiClient } from '../lib/apiClient';
import type { AssessmentType, CompiledRecord, UnmatchedRecord, UploadPreview } from '../types';

export const compiledKey = (courseId: string) => `/courses/${courseId}/compiled`;
export const unmatchedKey = (courseId: string) => `/courses/${courseId}/unmatched`;

export async function uploadScoreTable(
  courseId: string,
  file: File,
  assessmentType: AssessmentType
): Promise<UploadPreview> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('assessmentType', assessmentType);
  const { data } = await apiClient.post<UploadPreview>(`/courses/${courseId}/uploads`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function compileCourse(courseId: string): Promise<{ records: CompiledRecord[]; count: number }> {
  const { data } = await apiClient.post(`/courses/${courseId}/compile`);
  return data;
}

export async function fetchCompiledRecords(courseId: string): Promise<{ records: CompiledRecord[] }> {
  const { data } = await apiClient.get(compiledKey(courseId));
  return data;
}

export async function fetchUnmatchedRecords(courseId: string): Promise<{ items: UnmatchedRecord[] }> {
  const { data } = await apiClient.get(unmatchedKey(courseId));
  return data;
}

export async function resolveUnmatchedRecord(
  courseId: string,
  rowId: string,
  action: UnmatchedRecord['suggestedAction']
): Promise<{ resolved: boolean }> {
  const { data } = await apiClient.post(`/courses/${courseId}/unmatched/${rowId}/resolve`, { action });
  return data;
}
