import { apiClient } from '../lib/apiClient';
import type {
  AssessmentType,
  CompiledRecord,
  UnmatchedRecord,
  UploadPreview,
  UploadRow,
} from '../types';
import { assessmentToBackend } from './_mappers';
import { fetchCourseMaxima } from './courses';

export const compiledKey = (courseId: string) => `/courses/${courseId}/compiled`;
export const unmatchedKey = (courseId: string) => `/courses/${courseId}/unmatched`;

/* -------------------------------------------------------------------------- */
/*  Backend shapes                                                            */
/* -------------------------------------------------------------------------- */

type BackendMatchStrategy =
  | 'REGISTRATION_NUMBER'
  | 'UTME_NUMBER'
  | 'NAME_AND_DEPARTMENT'
  | 'UNMATCHED';

interface BackendPreviewRow {
  rowNumber: number;
  fullName?: string;
  registrationNumber?: string;
  score?: number;
  matchStrategy: BackendMatchStrategy;
  matchedStudentId: string | null;
}
interface BackendUploadResult {
  committed: boolean;
  report: { ok: boolean; totalRows: number; validRows: number; issues: unknown[] };
  preview: BackendPreviewRow[];
  matchedCount: number;
  unmatchedCount: number;
  importedCount: number;
  batchId: string | null;
}
interface BackendCompiledRow {
  studentId: string | null;
  fullName: string;
  registrationNumber: string;
  department: string;
  test: number | null;
  practical: number | null;
  assignment: number | null;
  examination: number | null;
  total: number;
  scaledTotal: number | null;
  grade: string;
  isPass: boolean;
  matchStrategy: BackendMatchStrategy;
  incomplete: boolean;
}
interface BackendCompiledResult {
  courseId: string;
  rows: BackendCompiledRow[];
}

const matchedOnLabel: Record<
  BackendMatchStrategy,
  UploadRow['matchedOn'] | undefined
> = {
  REGISTRATION_NUMBER: 'regNumber',
  UTME_NUMBER: 'utmeNumber',
  NAME_AND_DEPARTMENT: 'name+department',
  UNMATCHED: undefined,
};

/* -------------------------------------------------------------------------- */
/*  Upload                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * POST /courses/:id/scores/upload. Sends the workbook as multipart, with the
 * assessment type + courseId in the query string (the backend validates those
 * there). `commit=true` imports the rows that pass the audit so the compile
 * step downstream has data; the returned report/preview still surface every
 * duplicate or validation issue found.
 */
export async function uploadScoreTable(
  courseId: string,
  file: File,
  assessmentType: AssessmentType,
): Promise<UploadPreview> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams({
    courseId,
    assessmentType: assessmentToBackend(assessmentType),
    commit: 'true',
  });

  const [{ data }, maxima] = await Promise.all([
    // axios sets multipart/form-data with the correct boundary for FormData.
    apiClient.post<BackendUploadResult>(
      `/courses/${courseId}/scores/upload?${params.toString()}`,
      formData,
    ),
    fetchCourseMaxima(courseId).catch(() => null),
  ]);

  const maxScore = maxima ? maxima[assessmentType] : 0;

  const rows: UploadRow[] = data.preview.map((r) => ({
    rowId: String(r.rowNumber),
    regNumber: r.registrationNumber ?? '',
    utmeNumber: '',
    fullName: r.fullName ?? '',
    department: '',
    score: r.score ?? 0,
    matchStatus: r.matchStrategy === 'UNMATCHED' ? 'unmatched' : 'matched',
    matchedStudentId: r.matchedStudentId ?? undefined,
    matchedOn: matchedOnLabel[r.matchStrategy],
  }));

  return {
    uploadId: data.batchId ?? crypto.randomUUID(),
    courseId,
    assessmentType,
    fileName: file.name,
    maxScore,
    rows,
    matchedCount: data.matchedCount,
    partialCount: 0,
    unmatchedCount: data.unmatchedCount,
  };
}

/* -------------------------------------------------------------------------- */
/*  Compile                                                                   */
/* -------------------------------------------------------------------------- */

async function compileAndMap(courseId: string): Promise<CompiledRecord[]> {
  const [{ data }, maxima] = await Promise.all([
    apiClient.post<BackendCompiledResult>(`/courses/${courseId}/compile`),
    fetchCourseMaxima(courseId).catch(() => ({
      test: 0,
      practical: 0,
      assignment: 0,
      examination: 0,
      total: 0,
    })),
  ]);

  return data.rows.map((r) => ({
    studentId: r.studentId ?? r.registrationNumber,
    fullName: r.fullName,
    regNumber: r.registrationNumber,
    department: r.department,
    components: [
      { type: 'test', raw: r.test ?? 0, max: maxima.test },
      { type: 'practical', raw: r.practical ?? 0, max: maxima.practical },
      { type: 'assignment', raw: r.assignment ?? 0, max: maxima.assignment },
      { type: 'examination', raw: r.examination ?? 0, max: maxima.examination },
    ],
    total: r.scaledTotal ?? r.total,
    maxTotal: maxima.total,
    grade: r.grade,
    status: r.isPass ? 'pass' : 'fail',
    flags: r.incomplete ? ['incomplete'] : [],
  }));
}

export async function compileCourse(
  courseId: string,
): Promise<{ records: CompiledRecord[]; count: number }> {
  const records = await compileAndMap(courseId);
  return { records, count: records.length };
}

export async function fetchCompiledRecords(
  courseId: string,
): Promise<{ records: CompiledRecord[] }> {
  const records = await compileAndMap(courseId);
  return { records };
}

/* -------------------------------------------------------------------------- */
/*  Unmatched / incomplete records                                            */
/* -------------------------------------------------------------------------- */

/**
 * The backend surfaces unmatched rows at upload time, and compilation flags
 * students missing a component as `incomplete`. We derive the exceptions panel
 * from those incomplete compiled rows.
 */
export async function fetchUnmatchedRecords(
  courseId: string,
): Promise<{ items: UnmatchedRecord[] }> {
  const { data } = await apiClient.post<BackendCompiledResult>(
    `/courses/${courseId}/compile`,
  );
  const items: UnmatchedRecord[] = data.rows
    .filter((r) => r.incomplete || r.matchStrategy === 'UNMATCHED')
    .map((r) => ({
      rowId: r.studentId ?? r.registrationNumber,
      fullName: r.fullName,
      regNumber: r.registrationNumber,
      reason:
        r.matchStrategy === 'UNMATCHED'
          ? 'Could not be matched to a student record'
          : 'Missing one or more component scores',
      suggestedAction: 'request_reupload',
    }));
  return { items };
}

/**
 * The backend has no persistent unmatched-resolution endpoint (exceptions are
 * resolved by re-uploading a corrected table). This acknowledges the choice
 * locally so the UI can proceed; re-upload to actually change the data.
 */
export async function resolveUnmatchedRecord(
  _courseId: string,
  _rowId: string,
  _action: UnmatchedRecord['suggestedAction'],
): Promise<{ resolved: boolean }> {
  return Promise.resolve({ resolved: true });
}
