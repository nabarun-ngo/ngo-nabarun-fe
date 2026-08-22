import type { AppliedListFilter, ListRouteFilterBinding } from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { AccountConstant } from '../../../finance.const';
import type { AccountRefData, TransactionApiFilter, TransactionListCriteria } from '../../domain';

export const TRANSACTION_DEFAULT_CHIP = 'default';

export const TRANSACTION_LIST_ROUTE_FILTER_BINDINGS: ListRouteFilterBinding[] = [
  { param: 'filterTransactionRef', criteriaKey: 'transactionRef', type: 'string' },
  { param: 'filterTxnId', criteriaKey: 'txnId', type: 'string' },
  { param: 'txnType', criteriaKey: 'txnType', type: 'csv' },
  { param: 'txnStatus', criteriaKey: 'txnStatus', type: 'csv' },
  { param: 'startDate', criteriaKey: 'startDate', type: 'string' },
  { param: 'endDate', criteriaKey: 'endDate', type: 'string' },
];

function labelsForKeys(values: KeyValue[] | undefined, keys: string[] | undefined): string[] {
  if (!keys?.length) return [];
  if (!values?.length) return keys;
  return keys.map(k => values.find(v => v.key === k)?.displayValue ?? k);
}

function refKeyValues(refData: AccountRefData | undefined, key: string): KeyValue[] {
  const value = refData?.[key];
  return Array.isArray(value) && value.every(item => item && typeof item === 'object' && 'key' in item)
    ? value as KeyValue[]
    : [];
}

export function cloneTransactionCriteria(
  criteria: TransactionListCriteria,
): TransactionListCriteria {
  return {
    ...criteria,
    txnType: criteria.txnType ? [...criteria.txnType] : undefined,
    txnStatus: criteria.txnStatus ? [...criteria.txnStatus] : undefined,
  };
}

export function getDefaultTransactionCriteria(): TransactionListCriteria {
  return {};
}

export function buildTransactionApiFilter(
  criteria: TransactionListCriteria = {},
  searchText?: string,
): TransactionApiFilter {
  const trimmedSearch = searchText?.trim();
  return {
    txnId: criteria.txnId || undefined,
    txnType: criteria.txnType?.length ? criteria.txnType : undefined,
    txnStatus: criteria.txnStatus?.length ? criteria.txnStatus : undefined,
    transactionRef: (trimmedSearch || criteria.transactionRef) || undefined,
    startDate: criteria.startDate || undefined,
    endDate: criteria.endDate || undefined,
  };
}

export function buildTransactionAppliedFilters(
  criteria: TransactionListCriteria,
  refData?: AccountRefData,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  const typeRef = refKeyValues(refData, AccountConstant.refDataKey.transactionType);
  const statusRef = refKeyValues(refData, AccountConstant.refDataKey.transactionStatus);
  if (criteria.txnId) pills.push({ id: 'txnId', label: `Txn: ${criteria.txnId}` });
  if (criteria.transactionRef) {
    pills.push({ id: 'transactionRef', label: `Ref: ${criteria.transactionRef}` });
  }
  if (criteria.txnType?.length) {
    pills.push({
      id: 'txnType',
      label: `Type: ${labelsForKeys(typeRef, criteria.txnType).join(', ')}`,
    });
  }
  if (criteria.txnStatus?.length) {
    pills.push({
      id: 'txnStatus',
      label: `Status: ${labelsForKeys(statusRef, criteria.txnStatus).join(', ')}`,
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

export function removeTransactionFilterById(
  criteria: TransactionListCriteria,
  pillId: string,
): TransactionListCriteria {
  const next = { ...criteria };
  switch (pillId) {
    case 'txnId':
      next.txnId = undefined;
      break;
    case 'transactionRef':
      next.transactionRef = undefined;
      break;
    case 'txnType':
      next.txnType = undefined;
      break;
    case 'txnStatus':
      next.txnStatus = undefined;
      break;
    case 'dateRange':
      next.startDate = undefined;
      next.endDate = undefined;
      break;
  }
  return next;
}

export function countActiveTransactionSheetFilters(criteria: TransactionListCriteria): number {
  let count = 0;
  if (criteria.txnId) count++;
  if (criteria.transactionRef) count++;
  if (criteria.txnType?.length) count++;
  if (criteria.txnStatus?.length) count++;
  if (criteria.startDate || criteria.endDate) count++;
  return count;
}
