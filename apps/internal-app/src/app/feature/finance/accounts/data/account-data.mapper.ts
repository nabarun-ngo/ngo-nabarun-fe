import type { FieldOption } from '@nabarun-ngo/forms-core';
import { AccountRefDataDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { User } from 'src/app/feature/member/domain';
import { AccountConstant } from '../../finance.const';
import type { AccountRefData, AccountStatusGroups, TransferMatrixRow } from '../domain';

type RefDataItem = { key?: string; value?: string; displayValue?: string; description?: string };

function mapRefItems(items: RefDataItem[] | undefined): KeyValue[] {
  return (items ?? [])
    .filter(item => !!item.key)
    .map(item => ({
      key: item.key!,
      displayValue: item.displayValue ?? item.value ?? item.key!,
      description: item.description,
      value: item.value,
    }));
}

function mapStatusGroups(
  groups: AccountRefDataDto['accountStatusGroups'] | undefined,
): AccountStatusGroups {
  return {
    outstanding: [...(groups?.outstanding ?? [])],
    closed: [...(groups?.closed ?? [])],
    excluded: [...(groups?.excluded ?? [])],
  };
}

function mapTransferMatrix(
  rows: AccountRefDataDto['transferMatrix'] | undefined,
): TransferMatrixRow[] {
  return (rows ?? []).map(row => ({
    fromAccountType: row.fromAccountType ?? '',
    reference: row.reference ?? '',
    toAccountTypes: [...(row.toAccountTypes ?? [])],
  }));
}

/** Maps account reference-data DTO keys to dashboard refData shape. */
export function mapAccountRefDataDtoToRefData(
  dto: AccountRefDataDto | undefined,
): AccountRefData {
  if (!dto) {
    return {};
  }

  return {
    [AccountConstant.refDataKey.accountType]: mapRefItems(dto.accountTypes as RefDataItem[]),
    [AccountConstant.refDataKey.accountStatus]: mapRefItems(dto.accountStatuses as RefDataItem[]),
    [AccountConstant.refDataKey.ownerType]: mapRefItems(dto.ownerTypes as RefDataItem[]),
    [AccountConstant.refDataKey.bankAccountType]: mapRefItems(dto.bankAccountTypes as RefDataItem[]),
    [AccountConstant.refDataKey.investmentType]: mapRefItems(dto.investmentTypes as RefDataItem[]),
    [AccountConstant.refDataKey.interestPayingTerm]: mapRefItems(
      dto.interestPayingTerms as RefDataItem[],
    ),
    [AccountConstant.refDataKey.transferReferenceType]: mapRefItems(
      dto.transferReferenceTypes as RefDataItem[],
    ),
    [AccountConstant.refDataKey.transferMatrix]: mapTransferMatrix(dto.transferMatrix),
    [AccountConstant.refDataKey.transactionType]: mapRefItems(dto.transactionTypes as RefDataItem[]),
    [AccountConstant.refDataKey.transactionStatus]: mapRefItems(
      dto.transactionStatuses as RefDataItem[],
    ),
    [AccountConstant.refDataKey.transactionRefType]: mapRefItems(
      dto.transactionRefTypes as RefDataItem[],
    ),
    [AccountConstant.refDataKey.accountStatusGroups]: mapStatusGroups(dto.accountStatusGroups),
  };
}

export function mapUserToMemberOption(user: User): FieldOption {
  return {
    key: user.id,
    label: user.fullName ?? user.id,
  };
}

export function mapUsersToMemberOptions(users: User[]): FieldOption[] {
  return (users ?? []).map(mapUserToMemberOption);
}
