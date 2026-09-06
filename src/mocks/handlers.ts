import type MockAdapter from 'axios-mock-adapter';
import {
  mockAuditTrail,
  mockCourses,
  mockDepartments,
  mockGradeBands,
  mockLecturers,
  mockStudents,
  mockUsers,
} from './fixtures';
import type {
  AssessmentType,
  AuditEntry,
  CompiledRecord,
  GradeBand,
  ResultSummary,
  ScalingPreviewResult,
  ScalingPreviewSummary,
  ScalingRule,
  UnmatchedRecord,
  UploadPreview,
  UploadRow,
} from '../types';
const db = {
  courses: [...mockCourses],
  audit: [...mockAuditTrail],
  gradeBands: [...mockGradeBands] as GradeBand[],
  exportsByCourse: {} as Record<string, { id: string; format: string; version: number; exportedBy: string; exportedAt: string; status: string }[]>,
};

function gradeFor(score: number, max: number): string {
  const pct = (score / max) * 100;
  const band = db.gradeBands.find((b) => pct >= b.min && pct <= b.max);
  return band?.grade ?? 'F';
}

function passFail(grade: string): 'pass' | 'fail' {
  return grade === 'F' ? 'fail' : 'pass';
}

function randomDelay() {
  return 500 + Math.random() * 700;
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Build a deterministic but plausible compiled result table for a course. */
function buildCompiledRecords(courseId: string): CompiledRecord[] {
  const courseStudents = mockStudents.slice(0, 24 + (courseId.charCodeAt(2) % 20));
  return courseStudents.map((s, i) => {
    const test = Math.min(20, 10 + ((i * 7) % 11));
    const practical = Math.min(20, 8 + ((i * 5) % 13));
    const assignment = Math.min(10, 5 + ((i * 3) % 6));
    const exam = Math.min(50, 20 + ((i * 11) % 31));
    const total = test + practical + assignment + exam;
    const grade = gradeFor(total, 100);
    return {
      studentId: s.id,
      fullName: s.fullName,
      regNumber: s.regNumber,
      department: s.department,
      components: [
        { type: 'test' as AssessmentType, raw: test, max: 20 },
        { type: 'practical' as AssessmentType, raw: practical, max: 20 },
        { type: 'assignment' as AssessmentType, raw: assignment, max: 10 },
        { type: 'examination' as AssessmentType, raw: exam, max: 50 },
      ],
      total,
      maxTotal: 100,
      grade,
      status: passFail(grade),
      flags: i % 17 === 0 ? ['Score re-entered after transcription review'] : [],
    };
  });
}

const compiledCache: Record<string, CompiledRecord[]> = {};
function getCompiled(courseId: string): CompiledRecord[] {
  if (!compiledCache[courseId]) {
    compiledCache[courseId] = buildCompiledRecords(courseId);
  }
  return compiledCache[courseId];
}

export function installMockHandlers(mock: MockAdapter) {
  mock.onPost('/auth/login').reply((config) => {
    const { email, password, role } = JSON.parse(config.data);
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.role === role
    );
    if (!user || user.password !== password) {
      return [401, { message: 'Invalid email, password, or role selection.' }];
    }
    const { password: _pw, ...safeUser } = user;
    return [200, { token: `mock-token-${safeUser.id}-${Date.now()}`, user: safeUser }];
  });

  // ---- Courses -----------------------------------------------------------
  mock.onGet('/courses').reply(() => [200, { items: db.courses, total: db.courses.length }]);

  mock.onGet(/\/courses\/[^/]+$/).reply((config) => {
    const id = config.url!.split('/').pop();
    const course = db.courses.find((c) => c.id === id);
    return course ? [200, course] : [404, { message: 'Course not found' }];
  });

  // ---- Departments / Lecturers / Students (admin record management) -----
  mock.onGet('/departments').reply(() => [200, { items: mockDepartments, total: mockDepartments.length }]);
  mock.onGet('/lecturers').reply(() => [200, { items: mockLecturers, total: mockLecturers.length }]);
  mock.onGet(/\/students(\?.*)?$/).reply((config) => {
    const url = new URL('http://x' + config.url);
    const q = url.searchParams.get('query')?.toLowerCase() ?? '';
    const filtered = q
      ? mockStudents.filter((s) => s.fullName.toLowerCase().includes(q) || s.regNumber.toLowerCase().includes(q))
      : mockStudents;
    return [200, { items: filtered.slice(0, 50), total: filtered.length }];
  });

  // ---- Grading scale (admin) ---------------------------------------------
  mock.onGet('/grading-scale').reply(() => [200, { items: db.gradeBands }]);
  mock.onPut('/grading-scale').reply((config) => {
    db.gradeBands = JSON.parse(config.data).items;
    db.audit.unshift({
      id: newId('a'),
      action: 'record_change',
      performedBy: 'Mrs. Ngozi Umeh',
      role: 'admin',
      timestamp: new Date().toISOString(),
      newValue: 'Grading scale boundaries updated',
    });
    return [200, { items: db.gradeBands }];
  });

  // ---- Score upload + preview --------------------------------------------
  mock.onPost(/\/courses\/[^/]+\/uploads$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    // The real endpoint would accept multipart/form-data with the file and
    // assessmentType field; the mock simulates the server-side matching pass.
    const assessmentType: AssessmentType = (config.data instanceof FormData
      ? (config.data.get('assessmentType') as AssessmentType)
      : 'test') ?? 'test';
    const fileName = config.data instanceof FormData ? (config.data.get('file') as File)?.name ?? 'upload.xlsx' : 'upload.xlsx';

    const sample = mockStudents.slice(0, 18);
    const rows: UploadRow[] = sample.map((s, i) => {
      const roll = i % 10;
      const matchStatus: UploadRow['matchStatus'] = roll < 7 ? 'matched' : roll < 9 ? 'partial' : 'unmatched';
      return {
        rowId: newId('row'),
        regNumber: matchStatus === 'unmatched' ? s.regNumber.replace('CSC', 'CSC-X') : s.regNumber,
        utmeNumber: s.utmeNumber,
        fullName: s.fullName,
        department: s.department,
        score: Math.round(10 + Math.random() * 40),
        matchStatus,
        matchedStudentId: matchStatus !== 'unmatched' ? s.id : undefined,
        matchedOn: matchStatus === 'matched' ? 'regNumber' : matchStatus === 'partial' ? 'name+department' : undefined,
      };
    });

    const preview: UploadPreview = {
      uploadId: newId('up'),
      courseId,
      assessmentType,
      fileName,
      maxScore: assessmentType === 'examination' ? 50 : assessmentType === 'assignment' ? 10 : 20,
      rows,
      matchedCount: rows.filter((r) => r.matchStatus === 'matched').length,
      partialCount: rows.filter((r) => r.matchStatus === 'partial').length,
      unmatchedCount: rows.filter((r) => r.matchStatus === 'unmatched').length,
    };

    db.audit.unshift({
      id: newId('a'),
      action: 'upload',
      courseId,
      courseCode: db.courses.find((c) => c.id === courseId)?.code,
      performedBy: 'Dr. Ade Fashola',
      role: 'lecturer',
      timestamp: new Date().toISOString(),
      newValue: `Uploaded ${assessmentType} scores (${rows.length} rows, ${fileName})`,
    });

    return [200, preview];
  });

  // ---- Compile & match -----------------------------------------------------
  mock.onPost(/\/courses\/[^/]+\/compile$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    const records = getCompiled(courseId);
    const course = db.courses.find((c) => c.id === courseId);
    if (course) course.status = 'compiled';
    return [200, { records, count: records.length }];
  });

  mock.onGet(/\/courses\/[^/]+\/compiled$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    return [200, { records: getCompiled(courseId) }];
  });

  mock.onGet(/\/courses\/[^/]+\/unmatched$/).reply(() => {
    const unmatched: UnmatchedRecord[] = [
      { rowId: newId('row'), fullName: 'Balogun Ibrahim', regNumber: 'CSC-X/2021/1042', reason: 'Registration number not found in student registry', suggestedAction: 'request_reupload' },
      { rowId: newId('row'), fullName: 'Suleiman Halima', regNumber: 'CSC-X/2020/1091', reason: 'Registration number mismatch and name has no department match', suggestedAction: 'enter_manually' },
    ];
    return [200, { items: unmatched }];
  });

  mock.onPost(/\/courses\/[^/]+\/unmatched\/[^/]+\/resolve$/).reply((config) => {
    const action = JSON.parse(config.data).action;
    return [200, { resolved: true, action }];
  });

  // ---- Scaling ---------------------------------------------------------
  mock.onPost(/\/courses\/[^/]+\/scaling\/preview$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    const rule: ScalingRule = JSON.parse(config.data);
    const records = getCompiled(courseId);

    const results: ScalingPreviewResult[] = records.slice(0, 15).map((r) => {
      let after = r.total;
      if (rule.method === 'fixed_bonus') after = r.total + (rule.bonusMarks ?? 0);
      if (rule.method === 'percentage') after = r.total * (1 + (rule.percentage ?? 0) / 100);
      if (rule.method === 'range_conversion' && rule.fromMax && rule.toMax) {
        const exam = r.components.find((c) => c.type === 'examination');
        if (exam) {
          const converted = (exam.raw / rule.fromMax) * rule.toMax;
          after = r.total - exam.raw + converted;
        }
      }
      if (rule.method === 'component_specific') after = r.total + (rule.bonusMarks ?? 0);
      after = Math.round(Math.min(100, Math.max(0, after)) * 10) / 10;

      const beforeGrade = r.grade;
      const afterGrade = gradeFor(after, r.maxTotal);
      return {
        studentId: r.studentId,
        fullName: r.fullName,
        regNumber: r.regNumber,
        beforeScore: r.total,
        afterScore: after,
        beforeGrade,
        afterGrade,
        beforeStatus: passFail(beforeGrade),
        afterStatus: passFail(afterGrade),
      };
    });

    const passBefore = results.filter((r) => r.beforeStatus === 'pass').length;
    const passAfter = results.filter((r) => r.afterStatus === 'pass').length;

    const summary: ScalingPreviewSummary = {
      passRateBefore: Math.round((passBefore / results.length) * 1000) / 10,
      passRateAfter: Math.round((passAfter / results.length) * 1000) / 10,
      failRateBefore: Math.round(((results.length - passBefore) / results.length) * 1000) / 10,
      failRateAfter: Math.round(((results.length - passAfter) / results.length) * 1000) / 10,
      affectedCount: results.length,
      results,
    };

    return [200, summary];
  });

  mock.onPost(/\/courses\/[^/]+\/scaling\/apply$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    const rule: ScalingRule = JSON.parse(config.data);
    if (!rule.approvalReference) {
      return [422, { message: 'An approval reference is required before scaling can be applied.' }];
    }
    const course = db.courses.find((c) => c.id === courseId);
    if (course) course.status = 'scaled';

    db.audit.unshift({
      id: newId('a'),
      action: 'scaling',
      courseId,
      courseCode: course?.code,
      performedBy: 'Dr. Ade Fashola',
      role: 'lecturer',
      timestamp: new Date().toISOString(),
      oldValue: `${rule.targetComponent} (pre-scaling)`,
      newValue: `${rule.method} applied to ${rule.targetComponent}`,
      approvalReference: rule.approvalReference,
      reason: rule.note,
    });

    return [200, { applied: true, appliedAt: new Date().toISOString() }];
  });

  // ---- Result summary -----------------------------------------------------
  mock.onGet(/\/courses\/[^/]+\/summary$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    const records = getCompiled(courseId);
    const scores = records.map((r) => r.total);
    const passCount = records.filter((r) => r.status === 'pass').length;
    const failCount = records.length - passCount;
    const gradeCounts: Record<string, number> = {};
    records.forEach((r) => (gradeCounts[r.grade] = (gradeCounts[r.grade] ?? 0) + 1));

    const summary: ResultSummary = {
      courseId,
      passCount,
      failCount,
      passRate: Math.round((passCount / records.length) * 1000) / 10,
      failRate: Math.round((failCount / records.length) * 1000) / 10,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      classAverage: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      gradeDistribution: db.gradeBands.map((b) => ({ grade: b.grade, count: gradeCounts[b.grade] ?? 0 })),
      comparedToPrevious: { passRate: -4.2, classAverage: -1.8 },
    };
    return [200, summary];
  });

  // ---- Export ---------------------------------------------------------
  mock.onGet(/\/courses\/[^/]+\/exports$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    return [200, { items: db.exportsByCourse[courseId] ?? [] }];
  });

  mock.onPost(/\/courses\/[^/]+\/export$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    const { format } = JSON.parse(config.data);
    const course = db.courses.find((c) => c.id === courseId);
    const existing = db.exportsByCourse[courseId] ?? [];
    const record = {
      id: newId('exp'),
      format,
      version: existing.length + 1,
      exportedBy: 'Dr. Ade Fashola',
      exportedAt: new Date().toISOString(),
      status: 'ready',
    };
    db.exportsByCourse[courseId] = [record, ...existing];
    if (course) course.status = 'exported';

    db.audit.unshift({
      id: newId('a'),
      action: 'export',
      courseId,
      courseCode: course?.code,
      performedBy: 'Dr. Ade Fashola',
      role: 'lecturer',
      timestamp: new Date().toISOString(),
      newValue: `Exported ${String(format).toUpperCase()} v${record.version}`,
    });

    return [200, record];
  });

  mock.onPost(/\/courses\/[^/]+\/submit$/).reply((config) => {
    const courseId = config.url!.split('/')[2];
    const existing = db.exportsByCourse[courseId] ?? [];
    if (existing[0]) existing[0].status = 'submitted';
    return [200, { submitted: true }];
  });

  // ---- Audit trail --------------------------------------------------------
  mock.onGet(/\/audit-trail(\?.*)?$/).reply((config) => {
    const url = new URL('http://x' + config.url);
    const courseId = url.searchParams.get('courseId');
    const action = url.searchParams.get('action');
    let items: AuditEntry[] = db.audit;
    if (courseId) items = items.filter((e) => e.courseId === courseId);
    if (action) items = items.filter((e) => e.action === action);
    return [200, { items, total: items.length }];
  });

  mock.onAny().reply((config) => {
    console.warn(`[mock] No handler registered for ${config.method?.toUpperCase()} ${config.url}`);
    return [404, { message: 'No mock handler for this endpoint yet.' }];
  });
}

export { randomDelay };
