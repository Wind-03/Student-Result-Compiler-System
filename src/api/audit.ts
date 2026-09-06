import { apiClient } from '../lib/apiClient';
import type { AuditAction, AuditEntry } from '../types';

export interface AuditFilters {
  courseId?: string;
  action?: AuditAction;
}

export const auditKey = (filters: AuditFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.courseId) params.set('courseId', filters.courseId);
  if (filters.action) params.set('action', filters.action);
  const qs = params.toString();
  return `/audit-trail${qs ? `?${qs}` : ''}`;
};

export async function fetchAuditTrail(filters: AuditFilters = {}): Promise<{ items: AuditEntry[]; total: number }> {
  const { data } = await apiClient.get(auditKey(filters));
  return data;
}
