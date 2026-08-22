import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { FormValues } from '@nabarun-ngo/forms-core';
import type {
  AppliedListFilter,
  ChipFilter,
  FilteredListDashboardPermissions,
  ListRouteFilterBinding,
  RefDataMap,
} from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { AccountConstant } from '../../../finance.const';
import type {
  Account,
  AccountListCriteria,
  AccountPrimaryChip,
} from '../../domain';

export interface AccountDashboardPermissions extends FilteredListDashboardPermissions {
  canManageAccounts?: boolean;
  canCreateAccount?: boolean;
  canUpdateAccount?: boolean;
  canReadTransactions?: boolean;
  canUpdateTransactions?: boolean;
  canTransfer?: boolean;
  canUpdateBanking?: boolean;
}

export const ACCOUNT_CHIP_PRESETS: Record<AccountPrimaryChip, { status?: Account['status'][] }> = {
  mine: {},
  active: {},
  closed: {},
};

export function accountStatusGroups(refData?: RefDataMap): {
  outstanding: string[];
  closed: string[];
  excluded: string[];
} {
  const value = refData?.[AccountConstant.refDataKey.accountStatusGroups];
  if (value && !Array.isArray(value) && typeof value === 'object' && 'outstanding' in value) {
    return value as { outstanding: string[]; closed: string[]; excluded: string[] };
  }
  return {
    outstanding: ['ACTIVE'],
    closed: ['CLOSED'],
    excluded: [],
  };
}

export function accountStatusesForChip(
  chipId: AccountPrimaryChip,
  refData?: RefDataMap,
): Account['status'][] | undefined {
  const groups = accountStatusGroups(refData);
  if (chipId === 'closed') {
    return groups.closed as Account['status'][];
  }
  if (chipId === 'mine' || chipId === 'active') {
    return groups.outstanding as Account['status'][];
  }
  return undefined;
}

export const ACCOUNT_CHIPS: ChipFilter[] = [
  { id: 'mine', label: 'Mine' },
  { id: 'active', label: 'All Open' },
  { id: 'closed', label: 'All Closed' },
];

export const ACCOUNT_DEFAULT_CHIP: AccountPrimaryChip = 'mine';

/** Deep-link query for dashboard “My Wallet Balance” → Mine + wallet type only. */
export const ACCOUNT_MINE_WALLET_ROUTE_QUERY = {
  type: 'WALLET',
} as const;

const LEGACY_CHIP_ALIASES: Record<string, AccountPrimaryChip> = {
  my_accounts: 'mine',
  all_accounts: 'active',
};

export const ACCOUNT_LIST_ROUTE_FILTER_BINDINGS: ListRouteFilterBinding[] = [
  { param: 'filterAccountId', criteriaKey: 'accountId', type: 'string' },
  { param: 'type', criteriaKey: 'type', type: 'csv' },
  { param: 'ownerType', criteriaKey: 'ownerType', type: 'csv' },
  { param: 'status', criteriaKey: 'status', type: 'csv' },
  { param: 'accountHolderId', criteriaKey: 'accountHolderId', type: 'string' },
];

export function isMineChip(chipId: AccountPrimaryChip): boolean {
  return chipId === 'mine';
}

export function isActiveChip(chipId: AccountPrimaryChip): boolean {
  return chipId === 'active';
}

export function isClosedAccount(account: Pick<Account, 'status'>): boolean {
  return account.status === 'CLOSED';
}

export function isOrgScopeChip(chipId: AccountPrimaryChip): boolean {
  return chipId === 'active' || chipId === 'closed';
}

export function normalizeAccountChip(chipId: string | null | undefined): AccountPrimaryChip {
  if (!chipId) {
    return ACCOUNT_DEFAULT_CHIP;
  }
  if (chipId in ACCOUNT_CHIP_PRESETS) {
    return chipId as AccountPrimaryChip;
  }
  return LEGACY_CHIP_ALIASES[chipId] ?? ACCOUNT_DEFAULT_CHIP;
}

export function isAccountPrimaryChip(chip: string): chip is AccountPrimaryChip {
  return chip in ACCOUNT_CHIP_PRESETS;
}

export function shouldUseOrgList(
  chipId: AccountPrimaryChip,
  canManageAccounts: boolean,
): boolean {
  return canManageAccounts && isOrgScopeChip(chipId);
}

export function cloneAccountCriteria(criteria: AccountListCriteria): AccountListCriteria {
  return {
    ...criteria,
    type: criteria.type ? [...criteria.type] : undefined,
    ownerType: criteria.ownerType ? [...criteria.ownerType] : undefined,
    status: criteria.status ? [...criteria.status] : undefined,
  };
}

export function getDefaultCriteriaForChip(_chipId: AccountPrimaryChip): AccountListCriteria {
  return {};
}

export function resolveAccountStatuses(
  chipId: AccountPrimaryChip,
  criteria?: AccountListCriteria,
  refData?: RefDataMap,
): Account['status'][] | undefined {
  const chipPreset = accountStatusesForChip(chipId, refData);
  const userStatus = criteria?.status?.length ? criteria.status : undefined;

  if (userStatus?.length && chipPreset?.length) {
    const intersection = userStatus.filter(status => chipPreset.includes(status));
    return intersection.length ? intersection : chipPreset;
  }

  if (userStatus?.length) {
    return userStatus;
  }

  return chipPreset;
}

export function buildAccountApiFilter(
  chipId: AccountPrimaryChip,
  criteria: AccountListCriteria = {},
  searchText?: string,
  refData?: RefDataMap,
): {
  accountId?: string;
  type?: Account['accountType'][];
  ownerType?: Account['ownerType'][];
  status?: Account['status'][];
  accountHolderId?: string;
} {
  const status = resolveAccountStatuses(chipId, criteria, refData);
  return {
    accountId: (searchText?.trim() || criteria.accountId) || undefined,
    type: criteria.type?.length ? criteria.type : undefined,
    ownerType: criteria.ownerType?.length
      ? criteria.ownerType.filter((value): value is Account['ownerType'] => !!value)
      : undefined,
    status: status?.length ? status : undefined,
    accountHolderId: criteria.accountHolderId || undefined,
  };
}

function labelsForKeys(values: KeyValue[] | undefined, keys: string[] | undefined): string[] {
  if (!keys?.length || !values?.length) return keys ?? [];
  return keys.map(k => values.find(v => v.key === k)?.displayValue ?? k);
}

export function buildAccountAppliedFilters(
  criteria: AccountListCriteria,
  refData: RefDataMap,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  const typeRef = refData[AccountConstant.refDataKey.accountType] as KeyValue[] | undefined;
  const statusRef = refData[AccountConstant.refDataKey.accountStatus] as KeyValue[] | undefined;
  const ownerTypeRef = refData[AccountConstant.refDataKey.ownerType] as KeyValue[] | undefined;

  if (criteria.accountId) {
    pills.push({ id: 'accountId', label: `ID: ${criteria.accountId}` });
  }
  if (criteria.type?.length) {
    pills.push({
      id: 'type',
      label: `Type: ${labelsForKeys(typeRef, criteria.type).join(', ')}`,
    });
  }
  if (criteria.status?.length) {
    pills.push({
      id: 'status',
      label: `Status: ${labelsForKeys(statusRef, criteria.status).join(', ')}`,
    });
  }
  if (criteria.ownerType?.length) {
    pills.push({
      id: 'ownerType',
      label: `Owner type: ${labelsForKeys(
        ownerTypeRef,
        criteria.ownerType.filter((value): value is NonNullable<typeof value> => !!value),
      ).join(', ')}`,
    });
  }
  if (criteria.accountHolderId) {
    pills.push({
      id: 'accountHolderId',
      label: `Owner: ${criteria.accountHolderName ?? criteria.accountHolderId}`,
    });
  }

  return pills;
}

export function removeAccountFilterById(
  criteria: AccountListCriteria,
  pillId: string,
): AccountListCriteria {
  const next = { ...criteria };
  switch (pillId) {
    case 'accountId':
      next.accountId = undefined;
      break;
    case 'type':
      next.type = undefined;
      break;
    case 'status':
      next.status = undefined;
      break;
    case 'ownerType':
      next.ownerType = undefined;
      break;
    case 'accountHolderId':
      next.accountHolderId = undefined;
      next.accountHolderName = undefined;
      break;
  }
  return next;
}

export function countActiveAccountSheetFilters(criteria: AccountListCriteria): number {
  let count = 0;
  if (criteria.accountId) count++;
  if (criteria.type?.length) count++;
  if (criteria.ownerType?.length) count++;
  if (criteria.status?.length) count++;
  if (criteria.accountHolderId) count++;
  return count;
}

export function isAccountCustodian(
  account: Pick<Account, 'custodianUserIds' | 'ownerType'>,
  userId: string | null | undefined,
): boolean {
  if (!userId) {
    return false;
  }
  return (account.custodianUserIds ?? []).includes(userId);
}

/**
 * ORG-owned accounts require the current user to be a custodian.
 * On the All Open (admin) view transfers are limited to org bank accounts.
 */
export function canTransferFromAccount(
  account: Pick<Account, 'accountType' | 'ownerType' | 'status' | 'custodianUserIds'>,
  options: {
    canTransfer: boolean;
    chipId: AccountPrimaryChip;
    currentUserId?: string | null;
  },
): boolean {
  if (!options.canTransfer || isClosedAccount(account) || account.accountType === 'INVESTMENT') {
    return false;
  }
  if (isActiveChip(options.chipId)) {
    return (
      account.ownerType === 'ORG' &&
      account.accountType === 'BANK' &&
      isAccountCustodian(account, options.currentUserId)
    );
  }
  if (!isMineChip(options.chipId)) {
    return false;
  }
  if (account.ownerType === 'ORG') {
    return isAccountCustodian(account, options.currentUserId);
  }
  return true;
}

export function resolveAccountPermissions(
  authorization: AuthorizationService,
): AccountDashboardPermissions {
  const perms = authorization.effectivePermissions();
  const canCreateAccount = perms.includes(SCOPE.create.account);
  const canUpdateAccount = perms.includes(SCOPE.update.account);
  const canReadTransactions = perms.includes(SCOPE.read.transactions);
  const canUpdateTransactions = perms.includes(SCOPE.update.transactions);
  const canManageAccounts = [canUpdateAccount, canCreateAccount, canReadTransactions].some(Boolean);

  return {
    canManageAccounts,
    canCreateAccount,
    canUpdateAccount,
    canReadTransactions,
    canUpdateTransactions,
    canTransfer: canUpdateAccount && canUpdateTransactions,
    canUpdateBanking: true,
    canUpdateEntity: canUpdateAccount,
    showCreateFab: canCreateAccount,
  };
}

export function validateTransferValues(
  _values: FormValues,
  documents: readonly unknown[],
): string | undefined {
  if (!documents.length) {
    return 'Upload at least one transfer proof document.';
  }
  return undefined;
}
