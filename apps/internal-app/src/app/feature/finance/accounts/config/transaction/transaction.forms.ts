import type { FormDefinition, FormValues } from '@nabarun-ngo/forms-core';
import {
  baseField,
  dateConstraintsTodayMax,
  isDateRangeValue,
  toFieldOptions,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { AccountConstant } from '../../../finance.const';
import type { AccountRefData, TransactionListCriteria } from '../../domain';

function refKeyValues(refData: AccountRefData | undefined, key: string): KeyValue[] {
  const value = refData?.[key];
  return Array.isArray(value) && value.every(item => item && typeof item === 'object' && 'key' in item)
    ? value as KeyValue[]
    : [];
}

export function buildTransactionFilterForm(refData?: AccountRefData): FormDefinition {
  const typeOptions = toFieldOptions(refKeyValues(refData, AccountConstant.refDataKey.transactionType));
  const statusOptions = toFieldOptions(
    refKeyValues(refData, AccountConstant.refDataKey.transactionStatus),
  );
  return {
    id: 'transaction-filter',
    key: 'transaction-filter',
    label: 'Transaction Filters',
    description: '',
    fields: [
      baseField({
        id: 'txnId',
        key: 'txnId',
        label: 'Transaction Number',
        fieldType: 'text',
        sortOrder: 1,
      }),
      baseField({
        id: 'txnType',
        key: 'txnType',
        label: 'Transaction Type',
        fieldType: 'multiselect',
        sortOrder: 2,
        fieldOptions: typeOptions.length
          ? typeOptions
          : toFieldOptions([
              { key: 'IN', label: 'IN' },
              { key: 'OUT', label: 'OUT' },
            ]),
      }),
      baseField({
        id: 'txnStatus',
        key: 'txnStatus',
        label: 'Transaction Status',
        fieldType: 'multiselect',
        sortOrder: 3,
        fieldOptions: statusOptions.length
          ? statusOptions
          : toFieldOptions([
              { key: 'SUCCESS', label: 'Success' },
              { key: 'REVERSED', label: 'Reversed' },
            ]),
      }),
      baseField({
        id: 'transactionRef',
        key: 'transactionRef',
        label: 'Transaction Reference Id',
        fieldType: 'text',
        sortOrder: 4,
      }),
      baseField({
        id: 'dateRange',
        key: 'dateRange',
        label: 'Transaction Date',
        fieldType: 'date_range',
        sortOrder: 5,
        dateConstraints: dateConstraintsTodayMax(),
      }),
    ],
  };
}

export function transactionCriteriaToValues(criteria: TransactionListCriteria): FormValues {
  return {
    txnId: criteria.txnId ?? '',
    txnType: criteria.txnType ?? [],
    txnStatus: criteria.txnStatus ?? [],
    transactionRef: criteria.transactionRef ?? '',
    dateRange: criteria.startDate || criteria.endDate
      ? { startDate: criteria.startDate ?? undefined, endDate: criteria.endDate ?? undefined }
      : null,
  };
}

export function transactionValuesToCriteria(values: FormValues): TransactionListCriteria {
  const txnType = values['txnType'];
  const txnStatus = values['txnStatus'];
  const dateRange = values['dateRange'];
  return {
    txnId: String(values['txnId'] ?? '').trim() || undefined,
    txnType: Array.isArray(txnType) && txnType.length ? txnType as string[] : undefined,
    txnStatus: Array.isArray(txnStatus) && txnStatus.length ? txnStatus as string[] : undefined,
    transactionRef: String(values['transactionRef'] ?? '').trim() || undefined,
    startDate: isDateRangeValue(dateRange) && dateRange.startDate
      ? String(dateRange.startDate)
      : undefined,
    endDate: isDateRangeValue(dateRange) && dateRange.endDate
      ? String(dateRange.endDate)
      : undefined,
  };
}

export function buildTransactionReadonlyForm(): FormDefinition {
  return {
    id: 'transaction-readonly',
    key: 'transaction-readonly',
    label: 'Transaction',
    description: '',
    fields: [],
  };
}
