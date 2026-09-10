// ---------------------------------------------------------------------------
// Mapping helpers between the SRCS backend (NestJS) contract and the
// frontend's view types. The backend is the source of truth for routes and
// shapes; these helpers translate at the API boundary so pages, hooks and view
// types stay unchanged.
// ---------------------------------------------------------------------------

import type {
  AssessmentType,
  AuditAction,
  ScalingRule,
  UserRole,
} from '../types';

/* -------------------------------------------------------------------------- */
/*  Enum translation                                                          */
/* -------------------------------------------------------------------------- */

export type BackendRole = 'LECTURER' | 'ADMIN';
export type BackendAssessment = 'TEST' | 'PRACTICAL' | 'ASSIGNMENT' | 'EXAMINATION';
export type BackendAuditAction =
  | 'UPLOAD'
  | 'SCORE_EDIT'
  | 'SCALING_APPLY'
  | 'COMPILE'
  | 'EXPORT'
  | 'LOGIN'
  | 'GRADE_SCALE_UPDATE';

export function roleToFront(role: BackendRole | string): UserRole {
  return role === 'ADMIN' ? 'admin' : 'lecturer';
}

export function assessmentToBackend(type: AssessmentType): BackendAssessment {
  return type.toUpperCase() as BackendAssessment;
}

export function auditActionToFront(action: string): AuditAction {
  switch (action) {
    case 'UPLOAD':
      return 'upload';
    case 'SCORE_EDIT':
      return 'score_edit';
    case 'SCALING_APPLY':
      return 'scaling';
    case 'EXPORT':
      return 'export';
    case 'LOGIN':
      return 'login';
    case 'COMPILE':
    case 'GRADE_SCALE_UPDATE':
    default:
      return 'record_change';
  }
}

export function auditActionToBackend(
  action: AuditAction,
): BackendAuditAction | undefined {
  switch (action) {
    case 'upload':
      return 'UPLOAD';
    case 'score_edit':
      return 'SCORE_EDIT';
    case 'scaling':
      return 'SCALING_APPLY';
    case 'export':
      return 'EXPORT';
    case 'login':
      return 'LOGIN';
    case 'record_change':
      return 'GRADE_SCALE_UPDATE';
    default:
      return undefined;
  }
}

/** A scaling target the backend understands (upper-case component or TOTAL). */
function scalingTargetToBackend(
  target: AssessmentType | 'total',
): 'TEST' | 'PRACTICAL' | 'ASSIGNMENT' | 'EXAMINATION' | 'TOTAL' {
  return target === 'total'
    ? 'TOTAL'
    : (target.toUpperCase() as 'TEST' | 'PRACTICAL' | 'ASSIGNMENT' | 'EXAMINATION');
}

/**
 * Translate the frontend's ScalingRule into the backend's discriminated-union
 * body. `component_specific` maps to a fixed bonus restricted to a component;
 * a percentage "increase of N%" becomes a backend multiplier of (100 + N)%.
 * When no approval reference is supplied (preview before the user types one),
 * a placeholder keeps the request valid — the real apply always carries one.
 */
export function scalingRuleToBackend(
  rule: ScalingRule,
  opts: { previewPlaceholder?: boolean } = {},
): Record<string, unknown> {
  const target = scalingTargetToBackend(rule.targetComponent);
  const approvalReference =
    rule.approvalReference?.trim() ||
    (opts.previewPlaceholder ? 'PREVIEW-ONLY' : '');
  const reason = rule.note?.trim() || undefined;

  switch (rule.method) {
    case 'range_conversion':
      return {
        method: 'RANGE_CONVERSION',
        target,
        inputMin: 0,
        inputMax: rule.fromMax ?? 0,
        outputMin: 0,
        outputMax: rule.toMax ?? 0,
        approvalReference,
        reason,
      };
    case 'percentage':
      return {
        method: 'PERCENTAGE',
        target,
        // Frontend field is a percentage *increase*; backend multiplies.
        percentage: 100 + (rule.percentage ?? 0),
        approvalReference,
        reason,
      };
    case 'fixed_bonus':
    case 'component_specific':
    default:
      return {
        method: 'FIXED_BONUS',
        target,
        bonus: rule.bonusMarks ?? 0,
        approvalReference,
        reason,
      };
  }
}

/* -------------------------------------------------------------------------- */
/*  Misc helpers                                                              */
/* -------------------------------------------------------------------------- */

export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Render a stored audit value (object or scalar) as a short string. */
export function stringifyValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
