import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type {
  Report,
  ReportFilterCriteria,
  ReportListContext,
  ReportStatus,
  ReportType,
} from '../domain';

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  DRAFT: 'Draft',
  APPROVED: 'Approved',
};

export function reportTypeChips(types: ReportType[]): ChipFilter[] {
  return types.map(type => ({ id: type.code, label: type.name }));
}

export function defaultReportChip(types: ReportType[]): string {
  return types[0]?.code ?? '';
}

export function isReportTypeChip(chipId: string, types: ReportType[]): boolean {
  return types.some(type => type.code === chipId);
}

export function normalizeReportChip(chipId: string | null | undefined, types: ReportType[]): string {
  return chipId && isReportTypeChip(chipId, types) ? chipId : defaultReportChip(types);
}

export function createReportContext(options: {
  types: ReportType[];
  activeTypeCode?: string;
}): ReportListContext {
  return {
    refData: {},
    types: options.types,
    activeTypeCode: normalizeReportChip(options.activeTypeCode, options.types),
    inputs: [],
    inputOptions: [],
  };
}

export function cloneReportCriteria(criteria: ReportFilterCriteria): ReportFilterCriteria {
  return { ...criteria };
}

export function defaultReportCriteria(): ReportFilterCriteria {
  return {};
}

export function buildReportAppliedFilters(criteria: ReportFilterCriteria): AppliedListFilter[] {
  if (!criteria.status) {
    return [];
  }
  return [{ id: 'status', label: `Status: ${REPORT_STATUS_LABEL[criteria.status]}` }];
}

export function removeReportFilterById(
  criteria: ReportFilterCriteria,
  pillId: string,
): ReportFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveReportSheetFilters(criteria: ReportFilterCriteria): number {
  return criteria.status ? 1 : 0;
}

export function isDraft(report: Report | undefined): boolean {
  return report?.status === 'DRAFT';
}

export function isApproved(report: Report | undefined): boolean {
  return report?.status === 'APPROVED';
}

/**
 * A report type names the roles allowed to manage it, so generation and approval
 * need both the permission and membership of one of those roles.
 */
export function canManageType(
  authorization: AuthorizationService,
  type: ReportType | undefined,
): boolean {
  if (!type?.manageRoles.length) {
    return false;
  }
  const roles = authorization.effectiveRoles();
  return type.manageRoles.some(role => roles.includes(role));
}

export function resolveReportPermissions(
  authorization: AuthorizationService,
  context: ReportListContext,
) {
  const permissions = authorization.effectivePermissions();
  const activeType = context.types.find(type => type.code === context.activeTypeCode);
  const manages = canManageType(authorization, activeType);

  return {
    canRead: permissions.includes(SCOPE.read.reports),
    showCreateFab: permissions.includes(SCOPE.create.reports) && manages,
    canRegenerate: permissions.includes(SCOPE.create.reports) && manages,
    canApprove: permissions.includes(SCOPE.approve.reports) && manages,
    canDelete: permissions.includes(SCOPE.delete.reports) && manages,
    canUpdateEntity: false,
  };
}
