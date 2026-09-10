import { apiClient } from '../lib/apiClient';
import type { AuditAction, AuditEntry, UserRole } from '../types';
import {
  auditActionToBackend,
  auditActionToFront,
  roleToFront,
  stringifyValue,
} from './_mappers';

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

interface BackendAuditLog {
  id: string;
  action: string;
  actorId: string;
  courseId: string | null;
  entity: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
interface BackendAuditResponse {
  items: BackendAuditLog[];
  total: number;
}
interface BackendUser {
  id: string;
  fullName: string;
  role: string;
}

/**
 * GET /audit (admin-only). Non-admins get 403 — we treat that as "no entries
 * visible" rather than surfacing an error, so a lecturer's dashboard/audit
 * view renders cleanly. Actor ids are resolved to names via /users when
 * available.
 */
export async function fetchAuditTrail(
  filters: AuditFilters = {},
): Promise<{ items: AuditEntry[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.courseId) params.set('courseId', filters.courseId);
  if (filters.action) {
    const backendAction = auditActionToBackend(filters.action);
    if (backendAction) params.set('action', backendAction);
  }
  params.set('pageSize', '100');

  try {
    const { data } = await apiClient.get<BackendAuditResponse>(
      `/audit?${params.toString()}`,
    );

    const userName = new Map<string, string>();
    const userRole = new Map<string, UserRole>();
    try {
      const { data: users } = await apiClient.get<BackendUser[]>('/users');
      for (const u of users) {
        userName.set(u.id, u.fullName);
        userRole.set(u.id, roleToFront(u.role));
      }
    } catch {
      // /users may be unavailable; fall back to ids below.
    }

    const items: AuditEntry[] = data.items.map((log) => ({
      id: log.id,
      action: auditActionToFront(log.action),
      courseId: log.courseId ?? undefined,
      courseCode:
        (log.metadata?.courseCode as string | undefined) ?? undefined,
      performedBy: userName.get(log.actorId) ?? log.actorId,
      role: userRole.get(log.actorId) ?? 'admin',
      timestamp: log.createdAt,
      oldValue: stringifyValue(log.oldValue),
      newValue: stringifyValue(log.newValue),
      reason: log.reason ?? undefined,
      approvalReference:
        (log.metadata?.approvalReference as string | undefined) ?? undefined,
    }));

    return { items, total: data.total };
  } catch (err: unknown) {
    const status =
      typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
    if (status === 403 || status === 401) {
      return { items: [], total: 0 };
    }
    throw err;
  }
}
