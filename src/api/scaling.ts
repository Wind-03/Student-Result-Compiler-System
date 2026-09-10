import { apiClient } from '../lib/apiClient';
import type { ScalingPreviewSummary, ScalingRule } from '../types';
import { scalingRuleToBackend } from './_mappers';

interface BackendStats {
  passRate: number;
  failRate: number;
}
interface BackendPreviewRow {
  registrationNumber: string;
  fullName: string;
  oldTotal: number;
  newTotal: number;
  oldGrade: string;
  newGrade: string;
  changed: boolean;
}
interface BackendScalingPreview {
  before: BackendStats;
  after: BackendStats;
  passRateDelta: number;
  affectedStudents: number;
  rows: BackendPreviewRow[];
}

// The backend preview carries grades but not pass/fail flags; under the default
// scale an 'F' is the only failing grade.
const isFail = (grade: string) => grade.toUpperCase() === 'F';

export async function previewScaling(
  courseId: string,
  rule: ScalingRule,
): Promise<ScalingPreviewSummary> {
  const body = scalingRuleToBackend(rule, { previewPlaceholder: true });
  const { data } = await apiClient.post<BackendScalingPreview>(
    `/courses/${courseId}/scaling/preview`,
    body,
  );

  return {
    passRateBefore: data.before.passRate,
    passRateAfter: data.after.passRate,
    failRateBefore: data.before.failRate,
    failRateAfter: data.after.failRate,
    affectedCount: data.affectedStudents,
    results: data.rows.map((r) => ({
      studentId: r.registrationNumber,
      fullName: r.fullName,
      regNumber: r.registrationNumber,
      beforeScore: r.oldTotal,
      afterScore: r.newTotal,
      beforeGrade: r.oldGrade,
      afterGrade: r.newGrade,
      beforeStatus: isFail(r.oldGrade) ? 'fail' : 'pass',
      afterStatus: isFail(r.newGrade) ? 'fail' : 'pass',
    })),
  };
}

export async function applyScaling(
  courseId: string,
  rule: ScalingRule,
): Promise<{ applied: boolean; appliedAt: string }> {
  const body = scalingRuleToBackend(rule);
  await apiClient.post(`/courses/${courseId}/scaling/apply`, body);
  return { applied: true, appliedAt: new Date().toISOString() };
}
