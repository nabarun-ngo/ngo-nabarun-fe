import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  ProjectRisk,
  RiskFilterCriteria,
  RiskListContext,
  RiskPrimaryChip,
  RiskRefDataMap,
  RiskStatus,
} from '../domain';
import { RiskRefData } from '../domain';

export const RISK_DEFAULT_CHIP: RiskPrimaryChip = 'all';

export const RISK_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
];

/** A risk counts as closed once it is mitigated or closed out. */
const CLOSED_RISK_STATUSES: RiskStatus[] = ['MITIGATED', 'CLOSED'];

export function isRiskPrimaryChip(chip: string): chip is RiskPrimaryChip {
  return RISK_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeRiskChip(value?: string | null): RiskPrimaryChip {
  return value && isRiskPrimaryChip(value) ? value : RISK_DEFAULT_CHIP;
}

export function isRiskOpen(risk: ProjectRisk): boolean {
  return !CLOSED_RISK_STATUSES.includes(risk.status);
}

/** Severities that may not be closed out without a recorded mitigation plan. */
const MITIGATION_REQUIRED_SEVERITIES = ['HIGH', 'CRITICAL'];

export function isRiskResolvable(risk: ProjectRisk): boolean {
  return risk.status !== 'CLOSED'
    && (!MITIGATION_REQUIRED_SEVERITIES.includes(risk.severity)
      || !!risk.mitigationPlan?.trim());
}

export function createRiskContext(options: {
  refData: RiskRefDataMap;
  projectId?: string;
}): RiskListContext {
  return {
    refData: options.refData,
    projectId: options.projectId,
    projectOptions: [],
    userOptions: [],
  };
}

export function cloneRiskCriteria(criteria: RiskFilterCriteria): RiskFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(
  _chip: RiskPrimaryChip,
  projectId?: string,
): RiskFilterCriteria {
  return projectId ? { projectId } : {};
}

export function matchesRiskCriteria(
  risk: ProjectRisk,
  chip: RiskPrimaryChip,
  criteria: RiskFilterCriteria,
  searchText?: string,
): boolean {
  const chipMatch = chip === 'all'
    || (chip === 'open' ? isRiskOpen(risk) : !isRiskOpen(risk));
  const search = searchText?.trim().toLocaleLowerCase();
  return chipMatch
    && (!criteria.status || risk.status === criteria.status)
    && (!criteria.severity || risk.severity === criteria.severity)
    && (!criteria.category || risk.category === criteria.category)
    && (!criteria.ownerId || risk.ownerId === criteria.ownerId)
    && (!search
      || risk.title.toLocaleLowerCase().includes(search)
      || (risk.description ?? '').toLocaleLowerCase().includes(search));
}

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function sortRisksBySeverity(risks: ProjectRisk[]): ProjectRisk[] {
  return [...risks].sort((a, b) =>
    (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildRiskAppliedFilters(
  criteria: RiskFilterCriteria,
  refData: RefDataMap,
  context?: RiskListContext,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  const optionLabel = (
    options: { key: string; label: string }[] | undefined,
    id: string,
  ): string => options?.find(option => option.key === id)?.label ?? id;

  if (criteria.projectId) {
    pills.push({
      id: 'projectId',
      label: `Project: ${optionLabel(context?.projectOptions, criteria.projectId)}`,
    });
  }
  if (criteria.status) {
    pills.push({
      id: 'status',
      label: `Status: ${refLabel(refData, RiskRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.severity) {
    pills.push({
      id: 'severity',
      label: `Severity: ${refLabel(refData, RiskRefData.refDataKey.severities, criteria.severity)}`,
    });
  }
  if (criteria.category) {
    pills.push({
      id: 'category',
      label: `Category: ${refLabel(refData, RiskRefData.refDataKey.categories, criteria.category)}`,
    });
  }
  if (criteria.ownerId) {
    pills.push({
      id: 'ownerId',
      label: `Owner: ${optionLabel(context?.userOptions, criteria.ownerId)}`,
    });
  }

  return pills;
}

export function removeRiskFilterById(
  criteria: RiskFilterCriteria,
  pillId: string,
): RiskFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveRiskSheetFilters(criteria: RiskFilterCriteria): number {
  return [
    criteria.projectId,
    criteria.status,
    criteria.severity,
    criteria.category,
    criteria.ownerId,
  ].filter(Boolean).length;
}

export function resolveRiskPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.risk),
    canUpdateEntity: permissions.includes(SCOPE.update.risk),
    canResolve: permissions.includes(SCOPE.update.risk),
  };
}
