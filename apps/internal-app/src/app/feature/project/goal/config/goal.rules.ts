import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Goal,
  GoalFilterCriteria,
  GoalListContext,
  GoalPrimaryChip,
  GoalRefDataMap,
  GoalStatus,
} from '../domain';
import { GoalRefData } from '../domain';

export const GOAL_DEFAULT_CHIP: GoalPrimaryChip = 'all';

export const GOAL_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'achieved', label: 'Achieved' },
];

/** The goal list endpoint has no status filter, so chips narrow the loaded page. */
const GOAL_CHIP_STATUS: Partial<Record<GoalPrimaryChip, GoalStatus>> = {
  in_progress: 'IN_PROGRESS',
  achieved: 'ACHIEVED',
};

export function isGoalPrimaryChip(chip: string): chip is GoalPrimaryChip {
  return GOAL_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeGoalChip(value?: string | null): GoalPrimaryChip {
  return value && isGoalPrimaryChip(value) ? value : GOAL_DEFAULT_CHIP;
}

export function goalStatusForChip(chip: GoalPrimaryChip): GoalStatus | undefined {
  return GOAL_CHIP_STATUS[chip];
}

export function createGoalContext(options: {
  refData: GoalRefDataMap;
  projectId?: string;
}): GoalListContext {
  return {
    refData: options.refData,
    projectId: options.projectId,
    projectOptions: [],
  };
}

export function cloneGoalCriteria(criteria: GoalFilterCriteria): GoalFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(
  _chip: GoalPrimaryChip,
  projectId?: string,
): GoalFilterCriteria {
  return projectId ? { projectId } : {};
}

export function matchesGoalCriteria(
  goal: Goal,
  chip: GoalPrimaryChip,
  criteria: GoalFilterCriteria,
  searchText?: string,
): boolean {
  const status = goalStatusForChip(chip) ?? criteria.status;
  const search = searchText?.trim().toLocaleLowerCase();
  return (!status || goal.status === status)
    && (!criteria.priority || goal.priority === criteria.priority)
    && (!search
      || goal.title.toLocaleLowerCase().includes(search)
      || (goal.description ?? '').toLocaleLowerCase().includes(search));
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildGoalAppliedFilters(
  criteria: GoalFilterCriteria,
  refData: RefDataMap,
  context?: GoalListContext,
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
      label: `Status: ${refLabel(refData, GoalRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.priority) {
    pills.push({
      id: 'priority',
      label: `Priority: ${refLabel(refData, GoalRefData.refDataKey.priorities, criteria.priority)}`,
    });
  }

  return pills;
}

export function removeGoalFilterById(
  criteria: GoalFilterCriteria,
  pillId: string,
): GoalFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveGoalSheetFilters(criteria: GoalFilterCriteria): number {
  return [criteria.projectId, criteria.status, criteria.priority].filter(Boolean).length;
}

export function resolveGoalPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.goal),
    canUpdateEntity: permissions.includes(SCOPE.update.goal),
    canRecordProgress: permissions.includes(SCOPE.update.goal),
  };
}
