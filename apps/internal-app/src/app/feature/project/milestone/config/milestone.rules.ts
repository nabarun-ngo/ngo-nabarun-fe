import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Milestone,
  MilestoneFilterCriteria,
  MilestoneListContext,
  MilestonePrimaryChip,
  MilestoneRefDataMap,
  MilestoneStatus,
} from '../domain';
import { MilestoneRefData } from '../domain';

export const MILESTONE_DEFAULT_CHIP: MilestonePrimaryChip = 'all';

export const MILESTONE_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'achieved', label: 'Achieved' },
];

/** The milestone list endpoint has no filters, so chips narrow the loaded collection. */
const MILESTONE_CHIP_STATUS: Partial<Record<MilestonePrimaryChip, MilestoneStatus>> = {
  in_progress: 'IN_PROGRESS',
  achieved: 'ACHIEVED',
};

export function isMilestonePrimaryChip(chip: string): chip is MilestonePrimaryChip {
  return MILESTONE_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeMilestoneChip(value?: string | null): MilestonePrimaryChip {
  return value && isMilestonePrimaryChip(value) ? value : MILESTONE_DEFAULT_CHIP;
}

export function milestoneStatusForChip(
  chip: MilestonePrimaryChip,
): MilestoneStatus | undefined {
  return MILESTONE_CHIP_STATUS[chip];
}

export function createMilestoneContext(options: {
  refData: MilestoneRefDataMap;
  projectId?: string;
}): MilestoneListContext {
  return {
    refData: options.refData,
    projectId: options.projectId,
    projectOptions: [],
  };
}

export function cloneMilestoneCriteria(
  criteria: MilestoneFilterCriteria,
): MilestoneFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(
  _chip: MilestonePrimaryChip,
  projectId?: string,
): MilestoneFilterCriteria {
  return projectId ? { projectId } : {};
}

export function matchesMilestoneCriteria(
  milestone: Milestone,
  chip: MilestonePrimaryChip,
  criteria: MilestoneFilterCriteria,
  searchText?: string,
): boolean {
  const status = milestoneStatusForChip(chip) ?? criteria.status;
  const search = searchText?.trim().toLocaleLowerCase();
  return (!status || milestone.status === status)
    && (!criteria.importance || milestone.importance === criteria.importance)
    && (!search
      || milestone.name.toLocaleLowerCase().includes(search)
      || (milestone.description ?? '').toLocaleLowerCase().includes(search));
}

export function sortMilestonesByTargetDate(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((a, b) => a.targetDate.localeCompare(b.targetDate));
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildMilestoneAppliedFilters(
  criteria: MilestoneFilterCriteria,
  refData: RefDataMap,
  context?: MilestoneListContext,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];

  if (criteria.projectId) {
    const label = context?.projectOptions
      .find(option => option.key === criteria.projectId)?.label ?? criteria.projectId;
    pills.push({ id: 'projectId', label: `Project: ${label}` });
  }
  if (criteria.status) {
    pills.push({
      id: 'status',
      label: `Status: ${refLabel(refData, MilestoneRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.importance) {
    pills.push({
      id: 'importance',
      label: `Importance: ${refLabel(refData, MilestoneRefData.refDataKey.importances, criteria.importance)}`,
    });
  }

  return pills;
}

export function removeMilestoneFilterById(
  criteria: MilestoneFilterCriteria,
  pillId: string,
): MilestoneFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveMilestoneSheetFilters(
  criteria: MilestoneFilterCriteria,
): number {
  return [criteria.projectId, criteria.status, criteria.importance].filter(Boolean).length;
}

export function isMilestoneOpen(milestone: Milestone): boolean {
  return milestone.status !== 'ACHIEVED';
}

export function resolveMilestonePermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.milestone),
    canUpdateEntity: permissions.includes(SCOPE.update.milestone),
    canComplete: permissions.includes(SCOPE.update.milestone),
  };
}
