import { KeyValue } from 'src/app/shared/models/key-value.model';
import { ListRowIconTone } from '@nabarun-ngo/list-dashboard-angular';
import { date } from 'src/app/shared/utils/utilities.service';
import { AccountConstant } from '../../../finance.const';
import type { Account, AccountRefData } from '../../domain';

export type AccountSummaryStatusTone = 'success' | 'warning' | 'neutral';

export interface AccountSummaryCardView {
  balance: string;
  holderName?: string;
  typeLabel: string;
  statusLabel: string;
  statusTone: AccountSummaryStatusTone;
  accentTone: ListRowIconTone;
  accountId: string;
  activatedOn?: string;
  details: { label: string; value: string }[];
}

function refKeyValues(refData: AccountRefData | undefined, section: string): KeyValue[] {
  const value = refData?.[section];
  if (!Array.isArray(value)) {
    return [];
  }
  return (value as unknown[]).filter(
    (item): item is KeyValue => !!item && typeof item === 'object' && 'key' in item,
  );
}

function refLabel(
  refData: AccountRefData,
  section: string,
  code?: string | null,
): string {
  if (!code) {
    return '-';
  }
  return refKeyValues(refData, section).find(item => item.key === code)?.displayValue ?? code;
}

function accountTypeTone(type: Account['accountType']): ListRowIconTone {
  switch (type) {
    case 'WALLET':
      return 'indigo';
    case 'BANK':
      return 'blue';
    case 'INVESTMENT':
      return 'amber';
    default:
      return 'neutral';
  }
}

function statusTone(status: Account['status']): AccountSummaryStatusTone {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'BLOCKED':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function buildAccountSummaryCardView(
  account: Account,
  refData: AccountRefData,
): AccountSummaryCardView {
  const typeLabel = refLabel(refData, AccountConstant.refDataKey.accountType, account.accountType)
    || account.accountTypeLabel
    || account.accountType;
  const statusLabel = refLabel(refData, AccountConstant.refDataKey.accountStatus, account.status)
    || account.status;

  return {
    balance: account.formattedBalance ?? `₹${(account.balance ?? 0).toLocaleString('en-IN')}`,
    holderName: account.accountHolderName,
    typeLabel,
    statusLabel,
    statusTone: statusTone(account.status),
    accentTone: accountTypeTone(account.accountType),
    accountId: account.id,
    activatedOn: account.activatedOn ? date(account.activatedOn) : undefined,
    details: [
      { label: 'Account ID', value: account.id },
      { label: 'Account type', value: typeLabel },
      { label: 'Owner type', value: account.ownerTypeLabel ?? account.ownerType ?? '-' },
      { label: 'Status', value: statusLabel },
      ...(account.activatedOn
        ? [{ label: 'Activated on', value: date(account.activatedOn) }]
        : []),
      ...(account.accountHolderName
        ? [{ label: 'Account holder', value: account.accountHolderName }]
        : []),
    ],
  };
}
