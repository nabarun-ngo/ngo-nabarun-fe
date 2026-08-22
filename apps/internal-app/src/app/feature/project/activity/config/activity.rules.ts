import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { ActivityListFilter } from '../data/activity-data.source';
import type {
  Activity,
  ActivityFilterCriteria,
  ActivityListContext,
  ActivityPrimaryChip,
  ActivityRefDataMap,
  ActivityStatus,
} from '../domain';
import { ActivityRefData } from '../domain';

export const ACTIVITY_DEFAULT_CHIP: ActivityPrimaryChip = 'all';

export const ACTIVITY_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

/**
 * `GET /projects/activities` takes a single `status` value, so each chip maps to exactly
 * one status. `PLANNED`, `CONFIRMED`, `ON_HOLD` and `CANCELLED` live in the filter sheet.
 */
const ACTIVITY_CHIP_STATUS: Partial<Record<ActivityPrimaryChip, ActivityStatus>> = {
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
};

export function isActivityPrimaryChip(chip: string): chip is ActivityPrimaryChip {
  return ACTIVITY_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeActivityChip(value?: string | null): ActivityPrimaryChip {
  return value && isActivityPrimaryChip(value) ? value : ACTIVITY_DEFAULT_CHIP;
}

export function activityStatusForChip(chip: ActivityPrimaryChip): ActivityStatus | undefined {
  return ACTIVITY_CHIP_STATUS[chip];
}

export function createActivityContext(options: {
  refData: ActivityRefDataMap;
  projectId?: string;
}): ActivityListContext {
  return {
    refData: options.refData,
    projectId: options.projectId,
    projectOptions: [],
    userOptions: [],
    expenseOptions: [],
  };
}

export function cloneActivityCriteria(
  criteria: ActivityFilterCriteria,
): ActivityFilterCriteria {
  return { ...criteria };
}

/** The route project scope is the default filter for every chip. */
export function getDefaultCriteriaForChip(
  _chip: ActivityPrimaryChip,
  projectId?: string,
): ActivityFilterCriteria {
  return projectId ? { projectId } : {};
}

export function buildActivityApiFilter(
  chip: ActivityPrimaryChip,
  criteria: ActivityFilterCriteria = {},
): ActivityListFilter {
  return {
    projectId: criteria.projectId || undefined,
    status: activityStatusForChip(chip) ?? criteria.status,
    scale: criteria.scale,
    type: criteria.type,
    assignedTo: criteria.assignedTo || undefined,
    organizerId: criteria.organizerId || undefined,
    parentActivityId: criteria.parentActivityId || undefined,
  };
}

/** `GET /projects/activities` has no text query, so name search is applied client-side. */
export function matchesActivitySearch(activity: Activity, searchText?: string): boolean {
  const search = searchText?.trim().toLocaleLowerCase();
  if (!search) {
    return true;
  }
  return activity.name.toLocaleLowerCase().includes(search)
    || (activity.location ?? '').toLocaleLowerCase().includes(search);
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildActivityAppliedFilters(
  criteria: ActivityFilterCriteria,
  refData: RefDataMap,
  context?: ActivityListContext,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  const label = (options: { key: string; label: string }[] | undefined, id: string): string =>
    options?.find(option => option.key === id)?.label ?? id;

  if (criteria.projectId) {
    pills.push({
      id: 'projectId',
      label: `Project: ${label(context?.projectOptions, criteria.projectId)}`,
    });
  }
  if (criteria.status) {
    pills.push({
      id: 'status',
      label: `Status: ${refLabel(refData, ActivityRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.scale) {
    pills.push({
      id: 'scale',
      label: `Scale: ${refLabel(refData, ActivityRefData.refDataKey.scales, criteria.scale)}`,
    });
  }
  if (criteria.type) {
    pills.push({
      id: 'type',
      label: `Type: ${refLabel(refData, ActivityRefData.refDataKey.types, criteria.type)}`,
    });
  }
  if (criteria.assignedTo) {
    pills.push({
      id: 'assignedTo',
      label: `Assigned to: ${label(context?.userOptions, criteria.assignedTo)}`,
    });
  }
  if (criteria.organizerId) {
    pills.push({
      id: 'organizerId',
      label: `Organizer: ${label(context?.userOptions, criteria.organizerId)}`,
    });
  }

  return pills;
}

export function removeActivityFilterById(
  criteria: ActivityFilterCriteria,
  pillId: string,
): ActivityFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveActivitySheetFilters(criteria: ActivityFilterCriteria): number {
  return [
    criteria.projectId,
    criteria.status,
    criteria.scale,
    criteria.type,
    criteria.assignedTo,
    criteria.organizerId,
  ].filter(Boolean).length;
}

export function resolveActivityPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.activity),
    canUpdateEntity: permissions.includes(SCOPE.update.activity),
    canLinkExpense: permissions.includes(SCOPE.update.activity)
      && permissions.includes(SCOPE.read.expenses),
    canReadDonations: permissions.includes(SCOPE.read.donations),
    canReadExpenses: permissions.includes(SCOPE.read.expenses),
  };
}
