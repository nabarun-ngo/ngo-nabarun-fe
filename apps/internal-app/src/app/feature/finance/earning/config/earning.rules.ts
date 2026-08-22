import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  EarningFilterCriteria,
  EarningListContext,
  EarningPrimaryChip,
  EarningRefDataMap,
  EarningStatus,
  EarningStatusGroups,
} from '../domain';
import { EarningRefData } from '../domain';

export const EARNING_DEFAULT_CHIP: EarningPrimaryChip = 'all';

export const EARNING_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'outstanding', label: 'Outstanding' },
  { id: 'closed', label: 'Closed' },
];

/** Chip ids used before the outstanding/closed grouping — keeps old links working. */
const LEGACY_EARNING_CHIP_ALIASES: Record<string, EarningPrimaryChip> = {
  pending: 'outstanding',
  received: 'closed',
  cancelled: 'closed',
};

export function earningStatusGroups(refData?: EarningRefDataMap): EarningStatusGroups {
  const value = refData?.[EarningRefData.refDataKey.statusGroups];
  if (value && !Array.isArray(value) && typeof value === 'object' && 'outstanding' in value) {
    return value as EarningStatusGroups;
  }
  return { outstanding: [], closed: [], excluded: [] };
}

/** Chip → status group: outstanding / closed from ref data. */
export function earningStatusesForChip(
  chipId: EarningPrimaryChip,
  refData?: EarningRefDataMap,
): EarningStatus[] | undefined {
  const groups = earningStatusGroups(refData);
  if (chipId === 'outstanding') {
    return groups.outstanding.length
      ? groups.outstanding as EarningStatus[]
      : undefined;
  }
  if (chipId === 'closed') {
    return groups.closed.length
      ? groups.closed as EarningStatus[]
      : undefined;
  }
  return undefined;
}

export function createEarningContext(options: {
  refData: EarningRefDataMap;
}): EarningListContext {
  return {
    refData: options.refData,
    payableAccountOptions: [],
  };
}

export function isEarningPrimaryChip(chip: string): chip is EarningPrimaryChip {
  return EARNING_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeEarningChip(value?: string | null): EarningPrimaryChip {
  if (value && isEarningPrimaryChip(value)) {
    return value;
  }
  return (value ? LEGACY_EARNING_CHIP_ALIASES[value] : undefined) ?? EARNING_DEFAULT_CHIP;
}

export function cloneEarningCriteria(criteria: EarningFilterCriteria): EarningFilterCriteria {
  return {
    ...criteria,
    category: criteria.category ? [...criteria.category] : undefined,
    status: criteria.status ? [...criteria.status] : undefined,
  };
}

export function getDefaultCriteriaForChip(_chip: EarningPrimaryChip): EarningFilterCriteria {
  return {};
}

export function resolveEarningStatuses(
  chipId: EarningPrimaryChip,
  criteria?: EarningFilterCriteria,
  refData?: EarningRefDataMap,
): EarningStatus[] | undefined {
  const chipPreset = earningStatusesForChip(chipId, refData);
  const userStatus = criteria?.status?.length
    ? criteria.status as EarningStatus[]
    : undefined;

  if (userStatus?.length && chipPreset?.length) {
    const intersection = userStatus.filter(status => chipPreset.includes(status));
    return intersection.length ? intersection : chipPreset;
  }

  if (userStatus?.length) {
    return userStatus;
  }

  return chipPreset;
}

export function buildEarningApiFilter(
  chipId: EarningPrimaryChip,
  criteria: EarningFilterCriteria = {},
  searchText?: string,
  refData?: EarningRefDataMap,
): {
  source?: string;
  category?: string[];
  status?: EarningStatus[];
  startDate?: string;
  endDate?: string;
} {
  const source = (searchText?.trim() || criteria.source) || undefined;
  return {
    source,
    category: criteria.category?.length ? criteria.category : undefined,
    status: resolveEarningStatuses(chipId, criteria, refData),
    startDate: criteria.startDate || undefined,
    endDate: criteria.endDate || undefined,
  };
}

function labelsForKeys(values: KeyValue[] | undefined, keys: string[] | undefined): string[] {
  if (!keys?.length || !values?.length) {
    return keys ?? [];
  }
  return keys.map(key => values.find(value => value.key === key)?.displayValue ?? key);
}

export function buildEarningAppliedFilters(
  criteria: EarningFilterCriteria,
  refData: RefDataMap,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];

  if (criteria.source) {
    pills.push({ id: 'source', label: `Source: ${criteria.source}` });
  }
  if (criteria.category?.length) {
    pills.push({
      id: 'category',
      label: `Category: ${labelsForKeys(
        refData[EarningRefData.refDataKey.category] as KeyValue[] | undefined,
        criteria.category,
      ).join(', ')}`,
    });
  }
  if (criteria.status?.length) {
    pills.push({
      id: 'status',
      label: `Status: ${labelsForKeys(
        refData[EarningRefData.refDataKey.status] as KeyValue[] | undefined,
        criteria.status,
      ).join(', ')}`,
    });
  }
  if (criteria.startDate || criteria.endDate) {
    pills.push({
      id: 'dateRange',
      label: `Dates: ${criteria.startDate ?? '…'} – ${criteria.endDate ?? '…'}`,
    });
  }

  return pills;
}

export function removeEarningFilterById(
  criteria: EarningFilterCriteria,
  pillId: string,
): EarningFilterCriteria {
  const next = { ...criteria };
  switch (pillId) {
    case 'source':
      next.source = undefined;
      break;
    case 'category':
      next.category = undefined;
      break;
    case 'status':
      next.status = undefined;
      break;
    case 'dateRange':
      next.startDate = undefined;
      next.endDate = undefined;
      break;
  }
  return next;
}

export function countActiveEarningSheetFilters(criteria: EarningFilterCriteria): number {
  return [
    criteria.source,
    criteria.category?.length,
    criteria.status?.length,
    criteria.startDate || criteria.endDate,
  ].filter(Boolean).length;
}

export function canEditEarningStatus(status?: string): boolean {
  return status === 'PENDING' || status === 'RECEIVED';
}

export function resolveEarningPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    canUpdateEntity: permissions.includes(SCOPE.update.earning),
    showCreateFab: permissions.includes(SCOPE.create.earning),
  };
}
