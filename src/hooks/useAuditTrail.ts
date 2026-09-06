import useSWR from 'swr';
import { auditKey, fetchAuditTrail, type AuditFilters } from '../api/audit';

export function useAuditTrail(filters: AuditFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR(auditKey(filters), () => fetchAuditTrail(filters));
  return { entries: data?.items ?? [], total: data?.total ?? 0, error, isLoading, mutate };
}
