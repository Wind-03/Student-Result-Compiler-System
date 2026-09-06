import useSWR from 'swr';
import { compiledKey, fetchCompiledRecords, fetchUnmatchedRecords, unmatchedKey } from '../api/scores';

export function useCompiledRecords(courseId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    courseId ? compiledKey(courseId) : null,
    () => fetchCompiledRecords(courseId!)
  );
  return { records: data?.records ?? [], error, isLoading, mutate };
}

export function useUnmatchedRecords(courseId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    courseId ? unmatchedKey(courseId) : null,
    () => fetchUnmatchedRecords(courseId!)
  );
  return { items: data?.items ?? [], error, isLoading, mutate };
}
