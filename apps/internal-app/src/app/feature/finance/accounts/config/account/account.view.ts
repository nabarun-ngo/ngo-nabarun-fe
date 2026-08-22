import type {
  ListDetailField,
  ListDetailSection,
  ListRowBadge,
  ListRowIconTone,
  ListRowItem,
  ListRowSubtitlePart,
} from '@nabarun-ngo/list-dashboard-core';
import {
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-core';
import { date, isEmpty } from 'src/app/shared/utils/utilities.service';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { AccountConstant } from '../../../finance.const';
import type { Account, AccountRefData, UpiDetail } from '../../domain';

function refKeyValues(refData: AccountRefData | undefined, section: string): KeyValue[] {
  const value = refData?.[section];
  if (!Array.isArray(value)) {
    return [];
  }
  return (value as unknown[]).filter(
    (item): item is KeyValue => !!item && typeof item === 'object' && 'key' in item,
  );
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

function statusBadge(status: Account['status'], label?: string): ListRowBadge {
  switch (status) {
    case 'ACTIVE':
      return { label: label ?? 'Active', tone: 'success' };
    case 'CLOSED':
      return { label: label ?? 'Closed', tone: 'neutral' };
    case 'BLOCKED':
      return { label: label ?? 'Blocked', tone: 'warning' };
    case 'INACTIVE':
      return { label: label ?? 'Inactive', tone: 'neutral' };
    default:
      return { label: label ?? status, tone: 'neutral' };
  }
}

function resolveTypeLabel(account: Account, refData?: AccountRefData): string {
  if (refData) {
    const match = refKeyValues(refData, AccountConstant.refDataKey.accountType).find(
      x => x.key === account.accountType,
    );
    if (match?.displayValue) {
      return match.displayValue;
    }
  }
  return account.accountTypeLabel ?? account.accountType;
}

function resolveStatusLabel(account: Account, refData?: AccountRefData): string {
  if (refData) {
    const match = refKeyValues(refData, AccountConstant.refDataKey.accountStatus).find(
      x => x.key === account.status,
    );
    if (match?.displayValue) {
      return match.displayValue;
    }
  }
  return account.status;
}

function resolveOwnerTypeLabel(account: Account, refData?: AccountRefData): string {
  if (refData) {
    const match = refKeyValues(refData, AccountConstant.refDataKey.ownerType).find(
      x => x.key === account.ownerType,
    );
    if (match?.displayValue) {
      return match.displayValue;
    }
  }
  if (account.ownerType === 'ORG') {
    return 'Organization';
  }
  if (account.ownerType === 'INDIVIDUAL') {
    return 'Individual';
  }
  return account.ownerTypeLabel ?? account.ownerType ?? '-';
}

function resolveOwnerName(account: Account): string {
  return account.accountHolderName ?? account.displayName ?? '-';
}

function buildAccountSubtitleParts(typeLabel: string): ListRowSubtitlePart[] {
  return [{ text: typeLabel }];
}

export function mapAccountListRow(
  account: Account,
  refData?: AccountRefData,
): ListRowItem<Account> {
  const typeLabel = resolveTypeLabel(account, refData);
  const statusLabel = resolveStatusLabel(account, refData);
  const balance = account.formattedBalance
    ?? `₹${(account.balance ?? 0).toLocaleString('en-IN')}`;

  return {
    id: account.id,
    title: balance,
    subtitleParts: buildAccountSubtitleParts(typeLabel),
    metaLeft: `${resolveOwnerTypeLabel(account, refData)} · ${resolveOwnerName(account)}`,
    metaRight: account.id,
    badge: statusBadge(account.status, statusLabel),
    icon: 'account',
    iconTone: accountTypeTone(account.accountType),
    payload: account,
  };
}

function buildUpiSectionTitle(row: UpiDetail, index: number): string {
  const name = row.label?.trim() || row.upiId?.trim() || `UPI ${index + 1}`;
  return row.isPrimary ? `Primary · ${name}` : name;
}

function buildUpiDetailSection(row: UpiDetail, index: number): ListDetailSection {
  const fields: ListDetailField[] = [];
  pushField(fields, 'UPI Id', row.upiId, { required: true });
  pushField(fields, 'Owner Name', row.payeeName);
  pushField(fields, 'Mobile Number', row.mobileNumber);
  pushField(fields, 'Label', row.label);
  if (row.isPrimary) {
    pushField(fields, 'Primary', 'Yes');
  }

  const sectionKey = row.id?.trim() || String(index);
  return detailKeyValueSection(
    `upi_detail_${sectionKey}`,
    buildUpiSectionTitle(row, index),
    fields,
    true,
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

function pushField(
  fields: ListDetailField[],
  label: string,
  value: string | undefined | null,
  options: { required?: boolean } = {},
): void {
  if (!options.required && (value === undefined || value === null || isEmpty(value))) {
    return;
  }
  fields.push(detailTextField(label, value ? String(value) : '-'));
}

export function buildAccountListDetailSections(
  account: Account,
  refData: AccountRefData,
): ListDetailSection[] {
  const sections: ListDetailSection[] = [];
  const detailFields: ListDetailField[] = [];

  pushField(detailFields, 'Account Id', account.id, { required: true });
  pushField(
    detailFields,
    'Account Type',
    refLabel(refData, AccountConstant.refDataKey.accountType, account.accountType),
    { required: true },
  );
  pushField(
    detailFields,
    'Owner Type',
    refLabel(refData, AccountConstant.refDataKey.ownerType, account.ownerType)
      || account.ownerTypeLabel,
    { required: true },
  );
  pushField(
    detailFields,
    'Account Status',
    refLabel(refData, AccountConstant.refDataKey.accountStatus, account.status),
    { required: true },
  );
  pushField(
    detailFields,
    'Activated On',
    account.activatedOn ? date(account.activatedOn) : undefined,
  );
  pushField(
    detailFields,
    'Current Balance',
    account.formattedBalance ?? `₹${(account.balance ?? 0).toLocaleString('en-IN')}`,
    { required: true },
  );
  pushField(detailFields, 'Account Holder', account.accountHolderName);

  sections.push(detailKeyValueSection('account_detail', 'Account details', detailFields));

  if (account.bankDetail) {
    const bankFields: ListDetailField[] = [];
    const isInvestment = account.accountType === 'INVESTMENT';
    pushField(
      bankFields,
      isInvestment ? 'Account / Folio Number' : 'Bank Account Number',
      account.bankDetail.accountNumber,
      { required: !isInvestment || !!account.bankDetail.accountNumber },
    );
    pushField(
      bankFields,
      'Bank Account Holder Name',
      account.bankDetail.accountHolderName,
      { required: account.accountType === 'BANK' },
    );
    pushField(
      bankFields,
      isInvestment ? 'Provider Name' : 'Bank Name',
      account.bankDetail.bankName,
      { required: true },
    );
    pushField(
      bankFields,
      isInvestment ? 'Investment Type' : 'Bank Account Type',
      account.bankDetail.accountType,
      { required: true },
    );
    pushField(
      bankFields,
      'Bank Branch Name',
      account.bankDetail.branch,
      { required: account.accountType === 'BANK' },
    );
    pushField(
      bankFields,
      'Bank IFSC Number',
      account.bankDetail.ifscNumber,
      { required: account.accountType === 'BANK' },
    );
    if (isInvestment) {
      pushField(
        bankFields,
        'Investment Amount',
        account.bankDetail.investmentAmount != null
          ? `₹${account.bankDetail.investmentAmount.toLocaleString('en-IN')}`
          : undefined,
        { required: true },
      );
      pushField(
        bankFields,
        'Source Bank Account',
        account.bankDetail.sourceAccountId,
        { required: true },
      );
      pushField(bankFields, 'Maturity Date', account.bankDetail.maturityDate);
      pushField(
        bankFields,
        'Estimated Maturity Amount',
        account.bankDetail.maturityAmount != null
          ? `₹${account.bankDetail.maturityAmount.toLocaleString('en-IN')}`
          : undefined,
      );
      pushField(bankFields, 'Demat Id', account.bankDetail.dematId);
      pushField(
        bankFields,
        'Interest Rate',
        account.bankDetail.interestRate != null
          ? `${account.bankDetail.interestRate}%`
          : undefined,
      );
      pushField(bankFields, 'Interest Paying Term', account.bankDetail.interestPayingTerm);
      pushField(bankFields, 'Interest credits', 'Recorded via Earnings (INTEREST category)');
    }
    sections.push(
      detailKeyValueSection(
        'bank_detail',
        isInvestment ? 'Investment details' : 'Bank details',
        bankFields,
        true,
      ),
    );
  }

  const upiRows = account.upiDetails?.length
    ? account.upiDetails
    : account.upiDetail
      ? [account.upiDetail]
      : [];

  upiRows.forEach((row, index) => {
    sections.push(buildUpiDetailSection(row, index));
  });

  return sections;
}
