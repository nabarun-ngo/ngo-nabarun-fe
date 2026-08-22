import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  TeamFilterCriteria,
  TeamListContext,
  TeamMember,
  TeamPrimaryChip,
  TeamRefDataMap,
} from '../domain';
import { TeamRefData } from '../domain';

export const TEAM_DEFAULT_CHIP: TeamPrimaryChip = 'all';

export const TEAM_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

export function isTeamPrimaryChip(chip: string): chip is TeamPrimaryChip {
  return TEAM_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeTeamChip(value?: string | null): TeamPrimaryChip {
  return value && isTeamPrimaryChip(value) ? value : TEAM_DEFAULT_CHIP;
}

export function createTeamContext(options: {
  refData: TeamRefDataMap;
  projectId?: string;
}): TeamListContext {
  return {
    refData: options.refData,
    projectId: options.projectId,
    projectOptions: [],
    userOptions: [],
  };
}

export function cloneTeamCriteria(criteria: TeamFilterCriteria): TeamFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(
  _chip: TeamPrimaryChip,
  projectId?: string,
): TeamFilterCriteria {
  return projectId ? { projectId } : {};
}

/**
 * The team list endpoint has no filters, so chips and search narrow the loaded roster.
 * Search matches the member label supplied by the caller.
 */
export function matchesTeamCriteria(
  member: TeamMember,
  chip: TeamPrimaryChip,
  criteria: TeamFilterCriteria,
  searchText?: string,
  memberLabel?: string,
): boolean {
  const chipMatch = chip === 'all'
    || (chip === 'active' ? member.isActive : !member.isActive);
  const search = searchText?.trim().toLocaleLowerCase();
  return chipMatch
    && (!criteria.role || member.role === criteria.role)
    && (!criteria.userId || member.userId === criteria.userId)
    && (!search
      || (memberLabel ?? '').toLocaleLowerCase().includes(search)
      || (member.responsibilities ?? '').toLocaleLowerCase().includes(search));
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildTeamAppliedFilters(
  criteria: TeamFilterCriteria,
  refData: RefDataMap,
  context?: TeamListContext,
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
  if (criteria.role) {
    pills.push({
      id: 'role',
      label: `Role: ${refLabel(refData, TeamRefData.refDataKey.roles, criteria.role)}`,
    });
  }
  if (criteria.userId) {
    pills.push({
      id: 'userId',
      label: `Member: ${optionLabel(context?.userOptions, criteria.userId)}`,
    });
  }

  return pills;
}

export function removeTeamFilterById(
  criteria: TeamFilterCriteria,
  pillId: string,
): TeamFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveTeamSheetFilters(criteria: TeamFilterCriteria): number {
  return [criteria.projectId, criteria.role, criteria.userId].filter(Boolean).length;
}

export function resolveTeamPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.project_team),
    canUpdateEntity: permissions.includes(SCOPE.update.project_team),
    canDeactivate: permissions.includes(SCOPE.update.project_team),
  };
}
