import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Asset,
  AssetFilterCriteria,
  AssetListContext,
  AssetPrimaryChip,
  AssetRefDataMap,
  AssetStatus,
} from '../domain';
import { AssetRefData } from '../domain';

export const ASSET_DEFAULT_CHIP: AssetPrimaryChip = 'all';

export const ASSET_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'retired', label: 'Retired' },
];

const ASSET_CHIP_STATUS: Partial<Record<AssetPrimaryChip, AssetStatus>> = {
  available: 'AVAILABLE',
  assigned: 'ASSIGNED',
  maintenance: 'MAINTENANCE',
  retired: 'RETIRED',
};

export function isAssetPrimaryChip(chip: string): chip is AssetPrimaryChip {
  return ASSET_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeAssetChip(value?: string | null): AssetPrimaryChip {
  return value && isAssetPrimaryChip(value) ? value : ASSET_DEFAULT_CHIP;
}

export function assetStatusForChip(chip: AssetPrimaryChip): AssetStatus | undefined {
  return ASSET_CHIP_STATUS[chip];
}

export function buildAssetApiFilter(
  chip: AssetPrimaryChip,
  criteria: AssetFilterCriteria = {},
): AssetFilterCriteria {
  return {
    status: assetStatusForChip(chip) ?? criteria.status,
    category: criteria.category,
    custodianUserId: criteria.custodianUserId,
    projectId: criteria.projectId,
  };
}

export function createAssetContext(options: {
  refData: AssetRefDataMap;
}): AssetListContext {
  return {
    refData: options.refData,
    projectOptions: [],
    userOptions: [],
    expenseOptions: [],
  };
}

export function cloneAssetCriteria(criteria: AssetFilterCriteria): AssetFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(_chip: AssetPrimaryChip): AssetFilterCriteria {
  return {};
}

export function matchesAssetSearch(asset: Asset, searchText: string): boolean {
  const search = searchText.trim().toLocaleLowerCase();
  return asset.name.toLocaleLowerCase().includes(search)
    || (asset.serialNumber ?? '').toLocaleLowerCase().includes(search)
    || (asset.location ?? '').toLocaleLowerCase().includes(search);
}

export function matchesAssetCriteria(
  asset: Asset,
  chip: AssetPrimaryChip,
  criteria: AssetFilterCriteria,
  searchText?: string,
): boolean {
  const apiFilter = buildAssetApiFilter(chip, criteria);
  const search = searchText?.trim();
  return (!apiFilter.status || asset.status === apiFilter.status)
    && (!apiFilter.category || asset.category === apiFilter.category)
    && (!apiFilter.custodianUserId || asset.custodianUserId === apiFilter.custodianUserId)
    && (!apiFilter.projectId || asset.projectId === apiFilter.projectId)
    && (!search || matchesAssetSearch(asset, search));
}

export function canAssignAsset(asset: Asset): boolean {
  return asset.status !== 'RETIRED'
    && (asset.status === 'AVAILABLE' || asset.status === 'ASSIGNED');
}

export function canReturnAsset(asset: Asset): boolean {
  return asset.status === 'ASSIGNED';
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildAssetAppliedFilters(
  criteria: AssetFilterCriteria,
  refData: RefDataMap,
  context?: AssetListContext,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  const optionLabel = (
    options: { key: string; label: string }[] | undefined,
    id: string,
  ): string => options?.find(option => option.key === id)?.label ?? id;

  if (criteria.status) {
    pills.push({
      id: 'status',
      label: `Status: ${refLabel(refData, AssetRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.category) {
    pills.push({
      id: 'category',
      label: `Category: ${refLabel(refData, AssetRefData.refDataKey.categories, criteria.category)}`,
    });
  }
  if (criteria.custodianUserId) {
    pills.push({
      id: 'custodianUserId',
      label: `Custodian: ${optionLabel(context?.userOptions, criteria.custodianUserId)}`,
    });
  }
  if (criteria.projectId) {
    pills.push({
      id: 'projectId',
      label: `Project: ${optionLabel(context?.projectOptions, criteria.projectId)}`,
    });
  }

  return pills;
}

export function removeAssetFilterById(
  criteria: AssetFilterCriteria,
  pillId: string,
): AssetFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveAssetSheetFilters(criteria: AssetFilterCriteria): number {
  return [
    criteria.status,
    criteria.category,
    criteria.custodianUserId,
    criteria.projectId,
  ].filter(Boolean).length;
}

export function resolveAssetPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.asset),
    canUpdateEntity: permissions.includes(SCOPE.update.asset),
    canDelete: permissions.includes(SCOPE.delete.asset),
    canAssign: permissions.includes(SCOPE.update.asset),
  };
}
