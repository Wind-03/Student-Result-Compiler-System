import { apiClient } from '../lib/apiClient';
import type { ScalingPreviewSummary, ScalingRule } from '../types';

export async function previewScaling(courseId: string, rule: ScalingRule): Promise<ScalingPreviewSummary> {
  const { data } = await apiClient.post<ScalingPreviewSummary>(`/courses/${courseId}/scaling/preview`, rule);
  return data;
}

export async function applyScaling(courseId: string, rule: ScalingRule): Promise<{ applied: boolean; appliedAt: string }> {
  const { data } = await apiClient.post(`/courses/${courseId}/scaling/apply`, rule);
  return data;
}
