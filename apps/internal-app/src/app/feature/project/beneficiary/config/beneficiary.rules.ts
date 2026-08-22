import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { BeneficiaryListFilter } from '../data/beneficiary-data.source';
import type {
  Beneficiary,
  BeneficiaryFilterCriteria,
  BeneficiaryListContext,
  BeneficiaryPrimaryChip,
  BeneficiaryRefDataMap,
  BeneficiaryStatus,
} from '../domain';
import { BeneficiaryRefData } from '../domain';

export const BENEFICIARY_DEFAULT_CHIP: BeneficiaryPrimaryChip = 'all';

export const BENEFICIARY_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

/** The list endpoint takes a single `status`, so each chip maps to one status. */
const BENEFICIARY_CHIP_STATUS: Partial<Record<BeneficiaryPrimaryChip, BeneficiaryStatus>> = {
  active: 'ACTIVE',
  completed: 'COMPLETED',
};

export function isBeneficiaryPrimaryChip(chip: string): chip is BeneficiaryPrimaryChip {
  return BENEFICIARY_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeBeneficiaryChip(value?: string | null): BeneficiaryPrimaryChip {
  return value && isBeneficiaryPrimaryChip(value) ? value : BENEFICIARY_DEFAULT_CHIP;
}

export function beneficiaryStatusForChip(
  chip: BeneficiaryPrimaryChip,
): BeneficiaryStatus | undefined {
  return BENEFICIARY_CHIP_STATUS[chip];
}

export function createBeneficiaryContext(options: {
  refData: BeneficiaryRefDataMap;
  projectId?: string;
}): BeneficiaryListContext {
  return {
    refData: options.refData,
    projectId: options.projectId,
    projectOptions: [],
  };
}

export function cloneBeneficiaryCriteria(
  criteria: BeneficiaryFilterCriteria,
): BeneficiaryFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(
  _chip: BeneficiaryPrimaryChip,
  projectId?: string,
): BeneficiaryFilterCriteria {
  return projectId ? { projectId } : {};
}

export function buildBeneficiaryApiFilter(
  chip: BeneficiaryPrimaryChip,
  criteria: BeneficiaryFilterCriteria = {},
): BeneficiaryListFilter {
  return {
    status: beneficiaryStatusForChip(chip) ?? criteria.status,
    type: criteria.type,
    category: criteria.category || undefined,
  };
}

/** The list endpoint has no text query, so name search is applied client-side. */
export function matchesBeneficiarySearch(
  beneficiary: Beneficiary,
  searchText?: string,
): boolean {
  const search = searchText?.trim().toLocaleLowerCase();
  if (!search) {
    return true;
  }
  return beneficiary.name.toLocaleLowerCase().includes(search)
    || (beneficiary.location ?? '').toLocaleLowerCase().includes(search)
    || (beneficiary.contactNumber ?? '').includes(search);
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildBeneficiaryAppliedFilters(
  criteria: BeneficiaryFilterCriteria,
  refData: RefDataMap,
  context?: BeneficiaryListContext,
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
      label: `Status: ${refLabel(refData, BeneficiaryRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.type) {
    pills.push({
      id: 'type',
      label: `Type: ${refLabel(refData, BeneficiaryRefData.refDataKey.types, criteria.type)}`,
    });
  }
  if (criteria.category) {
    pills.push({ id: 'category', label: `Category: ${criteria.category}` });
  }

  return pills;
}

export function removeBeneficiaryFilterById(
  criteria: BeneficiaryFilterCriteria,
  pillId: string,
): BeneficiaryFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveBeneficiarySheetFilters(
  criteria: BeneficiaryFilterCriteria,
): number {
  return [
    criteria.projectId,
    criteria.status,
    criteria.type,
    criteria.category,
  ].filter(Boolean).length;
}

export function isBeneficiaryEnrolled(beneficiary: Beneficiary): boolean {
  return beneficiary.status === 'ACTIVE';
}

export function resolveBeneficiaryPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.beneficiary),
    canUpdateEntity: permissions.includes(SCOPE.update.beneficiary),
    canExit: permissions.includes(SCOPE.update.beneficiary),
  };
}
