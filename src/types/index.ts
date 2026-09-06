// ---------------------------------------------------------------------------
// Domain types for the Student Result Compilation and Scaling System (SRCS)
// ---------------------------------------------------------------------------

export type UserRole = 'lecturer' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarInitials: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type CompilationStatus = 'not_started' | 'in_progress' | 'compiled' | 'scaled' | 'exported';

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  level: string;
  lecturerId: string;
  lecturerName: string;
  studentCount: number;
  status: CompilationStatus;
  lastActivityAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  regNumber: string;
  utmeNumber: string;
  department: string;
  level: string;
}

export type AssessmentType = 'test' | 'practical' | 'assignment' | 'examination';

export type MatchStatus = 'matched' | 'partial' | 'unmatched';

export interface UploadRow {
  rowId: string;
  regNumber: string;
  utmeNumber: string;
  fullName: string;
  department: string;
  score: number;
  matchStatus: MatchStatus;
  matchedStudentId?: string;
  matchedOn?: 'regNumber' | 'utmeNumber' | 'name+department';
}

export interface UploadPreview {
  uploadId: string;
  courseId: string;
  assessmentType: AssessmentType;
  fileName: string;
  maxScore: number;
  rows: UploadRow[];
  matchedCount: number;
  partialCount: number;
  unmatchedCount: number;
}

export interface ComponentScore {
  type: AssessmentType;
  raw: number;
  max: number;
}

export interface CompiledRecord {
  studentId: string;
  fullName: string;
  regNumber: string;
  department: string;
  components: ComponentScore[];
  total: number;
  maxTotal: number;
  grade: string;
  status: 'pass' | 'fail';
  flags: string[];
}

export interface UnmatchedRecord {
  rowId: string;
  fullName: string;
  regNumber: string;
  reason: string;
  suggestedAction: 'mark_absent' | 'request_reupload' | 'enter_manually';
}

export type ScalingMethod = 'range_conversion' | 'fixed_bonus' | 'percentage' | 'component_specific';

export interface ScalingRule {
  courseId: string;
  method: ScalingMethod;
  targetComponent: AssessmentType | 'total';
  fromMax?: number;
  toMax?: number;
  bonusMarks?: number;
  percentage?: number;
  approvalReference: string;
  note?: string;
}

export interface ScalingPreviewResult {
  studentId: string;
  fullName: string;
  regNumber: string;
  beforeScore: number;
  afterScore: number;
  beforeGrade: string;
  afterGrade: string;
  beforeStatus: 'pass' | 'fail';
  afterStatus: 'pass' | 'fail';
}

export interface ScalingPreviewSummary {
  passRateBefore: number;
  passRateAfter: number;
  failRateBefore: number;
  failRateAfter: number;
  affectedCount: number;
  results: ScalingPreviewResult[];
}

export interface GradeBand {
  grade: string;
  min: number;
  max: number;
  remark: string;
}

export interface ResultSummary {
  courseId: string;
  passCount: number;
  failCount: number;
  passRate: number;
  failRate: number;
  highestScore: number;
  lowestScore: number;
  classAverage: number;
  gradeDistribution: { grade: string; count: number }[];
  comparedToPrevious?: {
    passRate: number;
    classAverage: number;
  };
}

export type ExportFormat = 'xlsx' | 'pdf';

export interface ExportRecord {
  id: string;
  courseId: string;
  format: ExportFormat;
  version: number;
  exportedBy: string;
  exportedAt: string;
  status: 'ready' | 'submitted';
}

export type AuditAction = 'upload' | 'score_edit' | 'scaling' | 'export' | 'login' | 'record_change';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  courseId?: string;
  courseCode?: string;
  performedBy: string;
  role: UserRole;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  approvalReference?: string;
}

export interface Department {
  id: string;
  name: string;
  facultyName: string;
  headOfDepartment: string;
}

export interface LecturerAccount {
  id: string;
  fullName: string;
  email: string;
  department: string;
  courseCount: number;
  status: 'active' | 'suspended';
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
