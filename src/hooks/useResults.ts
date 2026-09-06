import useSWR from 'swr';
import { exportsKey, fetchExports, fetchResultSummary, summaryKey } from '../api/results';

export function useResultSummary(courseId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    courseId ? summaryKey(courseId) : null,
    () => fetchResultSummary(courseId!)
  );
  return { summary: data, error, isLoading, mutate };
}

export function useExports(courseId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    courseId ? exportsKey(courseId) : null,
    () => fetchExports(courseId!)
  );
  return { exports: data?.items ?? [], error, isLoading, mutate };
}
