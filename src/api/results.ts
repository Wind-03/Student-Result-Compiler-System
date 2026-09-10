import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../stores/authStore';
import type { ExportFormat, ExportRecord, ResultSummary } from '../types';

export const summaryKey = (courseId: string) => `/courses/${courseId}/summary`;
export const exportsKey = (courseId: string) => `/courses/${courseId}/exports`;

interface BackendStatistics {
  totalStudents: number;
  passCount: number;
  failCount: number;
  passRate: number;
  failRate: number;
  highestScore: number;
  lowestScore: number;
  average: number;
  gradeDistribution: Record<string, number>;
}

export async function fetchResultSummary(
  courseId: string,
): Promise<ResultSummary> {
  const { data } = await apiClient.get<BackendStatistics>(
    summaryKey(courseId),
  );
  return {
    courseId,
    passCount: data.passCount,
    failCount: data.failCount,
    passRate: data.passRate,
    failRate: data.failRate,
    highestScore: data.highestScore,
    lowestScore: data.lowestScore,
    classAverage: data.average,
    gradeDistribution: Object.entries(data.gradeDistribution).map(
      ([grade, count]) => ({ grade, count }),
    ),
  };
}

/**
 * The backend does not keep an export history; every export is a live file
 * download. This returns an empty list so the history panel renders cleanly.
 */
export async function fetchExports(
  _courseId: string,
): Promise<{ items: ExportRecord[] }> {
  return Promise.resolve({ items: [] });
}

/**
 * GET /courses/:id/export/(xlsx|pdf) streams a file. We fetch it as a blob and
 * trigger a browser download, then return a synthetic record for the toast/UI.
 */
export async function exportResult(
  courseId: string,
  format: ExportFormat,
): Promise<ExportRecord> {
  const response = await apiClient.get(
    `/courses/${courseId}/export/${format}`,
    { responseType: 'blob' },
  );

  const blob = response.data as Blob;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${courseId}-results.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  const user = useAuthStore.getState().user;
  return {
    id: crypto.randomUUID(),
    courseId,
    format,
    version: 1,
    exportedBy: user?.fullName ?? 'You',
    exportedAt: new Date().toISOString(),
    status: 'ready',
  };
}

/**
 * The backend has no "submit for moderation" endpoint in v1. This resolves
 * locally so the UI flow completes; wire it to a real route when added.
 */
export async function submitResult(
  _courseId: string,
): Promise<{ submitted: boolean }> {
  return Promise.resolve({ submitted: true });
}
