import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type { FormDefinition, FormFieldDefinition, FormValues } from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Earning,
  EarningFilterCriteria,
  EarningPrimaryChip,
  EarningRefDataMap,
} from '../domain';
import { EarningRefData } from '../domain';
import { earningStatusesForChip } from './earning.rules';

export interface EarningCoreFieldsOptions {
  sortOrderStart?: number;
  enabled?: boolean;
}

export function buildEarningCoreFields(
  refData: EarningRefDataMap,
  options: EarningCoreFieldsOptions = {},
): FormFieldDefinition[] {
  const start = options.sortOrderStart ?? 1;
  const enabled = options.enabled ?? true;

  return [
    baseField({
      id: 'source',
      key: 'source',
      label: 'Earning Source',
      fieldType: 'text',
      mandatory: true,
      enabled,
      sortOrder: start,
    }),
    baseField({
      id: 'category',
      key: 'category',
      label: 'Category',
      fieldType: 'select',
      mandatory: true,
      enabled,
      sortOrder: start + 1,
      fieldOptions: toFieldOptions(refData[EarningRefData.refDataKey.category] as KeyValue[] | undefined),
    }),
    baseField({
      id: 'amount',
      key: 'amount',
      label: 'Amount',
      fieldType: 'number',
      mandatory: true,
      enabled,
      sortOrder: start + 2,
    }),
    baseField({
      id: 'description',
      key: 'description',
      label: 'Description',
      fieldType: 'textarea',
      enabled,
      sortOrder: start + 3,
    }),
  ];
}

function statusOptionsForChip(
  chipId: EarningPrimaryChip,
  refData: EarningRefDataMap,
): { key: string; label: string }[] {
  const all = toFieldOptions(refData[EarningRefData.refDataKey.status] as KeyValue[] | undefined);
  const preset = earningStatusesForChip(chipId, refData);
  if (!preset?.length) {
    return all;
  }
  return all.filter(option => preset.includes(option.key as typeof preset[number]));
}

export function buildEarningFilterForm(
  chipId: EarningPrimaryChip,
  refData: EarningRefDataMap,
): FormDefinition {
  const fields: FormFieldDefinition[] = [
    baseField({
      id: 'source',
      key: 'source',
      label: 'Source',
      placeholder: 'Enter source',
      fieldType: 'text',
      sortOrder: 1,
    }),
    baseField({
      id: 'category',
      key: 'category',
      label: 'Category',
      fieldType: 'multiselect',
      sortOrder: 2,
      fieldOptions: toFieldOptions(
        (refData[EarningRefData.refDataKey.category] as KeyValue[] | undefined) ?? [],
      ),
    }),
    baseField({
      id: 'status',
      key: 'status',
      label: 'Status',
      fieldType: 'multiselect',
      sortOrder: 3,
      fieldOptions: statusOptionsForChip(chipId, refData),
    }),
    baseField({
      id: 'startDate',
      key: 'startDate',
      label: 'From date',
      placeholder: 'Start date',
      fieldType: 'date',
      sortOrder: 4,
    }),
    baseField({
      id: 'endDate',
      key: 'endDate',
      label: 'To date',
      placeholder: 'End date',
      fieldType: 'date',
      sortOrder: 5,
    }),
  ];

  return {
    id: 'earning-filter',
    key: 'earning-filter',
    label: 'Earning Filters',
    description: '',
    fields: fields.sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function earningCriteriaToValues(criteria: EarningFilterCriteria): FormValues {
  return {
    source: criteria.source ?? '',
    category: criteria.category ?? [],
    status: criteria.status ?? [],
    startDate: criteria.startDate ?? '',
    endDate: criteria.endDate ?? '',
  };
}

export function earningValuesToCriteria(
  values: FormValues,
  criteria: EarningFilterCriteria,
): EarningFilterCriteria {
  const source = values['source'];
  const category = values['category'];
  const status = values['status'];
  const startDate = values['startDate'];
  const endDate = values['endDate'];

  return {
    ...criteria,
    source: typeof source === 'string' && source.trim() ? source.trim() : undefined,
    category: Array.isArray(category) && category.length ? category as string[] : undefined,
    status: Array.isArray(status) && status.length ? status as string[] : undefined,
    startDate: typeof startDate === 'string' && startDate.trim() ? startDate.trim() : undefined,
    endDate: typeof endDate === 'string' && endDate.trim() ? endDate.trim() : undefined,
  };
}

export function buildEarningCreateForm(
  refData: EarningRefDataMap,
  receiveAccounts: { key: string; label: string }[] = [],
): FormDefinition {
  const fields = buildEarningCoreFields(refData);
  fields.push(baseField({
    id: 'accountId',
    key: 'accountId',
    label: 'Bank or Investment Account',
    fieldType: 'select',
    mandatory: true,
    sortOrder: 5,
    fieldOptions: receiveAccounts,
    condition: { dependsOnKey: 'category', operator: 'equals', value: 'INTEREST' },
  }));
  return {
    id: 'earning-create',
    key: 'earning',
    label: 'Create Earning',
    description: null,
    fields,
  };
}

export function defaultEarningCreateValues(): FormValues {
  return {
    source: '',
    category: '',
    amount: null,
    description: '',
    accountId: '',
  };
}

export function earningCreateEntity(values: FormValues): Partial<Earning> {
  const category = String(values['category'] ?? '').trim() as Earning['category'];
  return {
    source: String(values['source'] ?? '').trim(),
    category,
    amount: Number(values['amount']),
    description: String(values['description'] ?? '').trim() || undefined,
    currency: 'INR',
    accountId: category === 'INTEREST'
      ? String(values['accountId'] ?? '').trim() || undefined
      : undefined,
  };
}

export function buildEarningUpdateForm(
  earning: Earning,
  refData: EarningRefDataMap,
  payableAccounts: { key: string; label: string }[] = [],
): FormDefinition {
  const isPending = earning.status === 'PENDING';
  const isReceived = earning.status === 'RECEIVED';

  const fields: FormFieldDefinition[] = buildEarningCoreFields(refData, {
    enabled: isPending,
  });

  if (isPending) {
    fields.push(
      baseField({
        id: 'status',
        key: 'status',
        label: 'Status',
        fieldType: 'select',
        mandatory: true,
        sortOrder: 5,
        fieldOptions: toFieldOptions(
          refData[EarningRefData.refDataKey.status] as KeyValue[] | undefined,
        ),
      }),
    );
  }

  if (isReceived || isPending) {
    fields.push(
      baseField({
        id: 'earningDate',
        key: 'earningDate',
        label: 'Earning Date',
        fieldType: 'date',
        sortOrder: 6,
        isHidden: !isReceived,
        condition: isPending
          ? { dependsOnKey: 'status', operator: 'equals', value: 'RECEIVED' }
          : null,
      }),
      baseField({
        id: 'accountId',
        key: 'accountId',
        label: 'Received To Account',
        fieldType: 'select',
        sortOrder: 7,
        isHidden: !isReceived,
        fieldOptions: payableAccounts,
        condition: isPending
          ? { dependsOnKey: 'status', operator: 'equals', value: 'RECEIVED' }
          : null,
      }),
    );
  }

  return {
    id: `earning-edit-${earning.id}`,
    key: 'earning',
    label: 'Edit Earning',
    description: null,
    fields: fields.sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function earningToUpdateValues(earning: Earning): FormValues {
  return {
    source: earning.source ?? '',
    category: earning.category ?? '',
    amount: earning.amount ?? null,
    description: earning.description ?? '',
    status: earning.status ?? '',
    earningDate: earning.earningDate ?? '',
    accountId: earning.accountId ?? '',
  };
}

export function earningUpdatePatch(values: FormValues): Partial<Earning> {
  const patch: Partial<Earning> = {
    source: String(values['source'] ?? '').trim() || undefined,
    category: (String(values['category'] ?? '').trim() || undefined) as Earning['category'],
    description: String(values['description'] ?? '').trim() || undefined,
    status: (String(values['status'] ?? '').trim() || undefined) as Earning['status'],
    earningDate: String(values['earningDate'] ?? '').trim() || undefined,
    accountId: String(values['accountId'] ?? '').trim() || undefined,
  };

  const amount = Number(values['amount']);
  if (Number.isFinite(amount)) {
    patch.amount = amount;
  }

  return patch;
}

export function buildEarningEditSummary(
  earning: Earning,
  refData: EarningRefDataMap,
): { label: string; value: string }[] {
  const categoryLabel = (refData[EarningRefData.refDataKey.category] as KeyValue[] | undefined)
    ?.find(item => item.key === earning.category)?.displayValue ?? earning.category;
  const statusLabel = (refData[EarningRefData.refDataKey.status] as KeyValue[] | undefined)
    ?.find(item => item.key === earning.status)?.displayValue ?? earning.status;

  return [
    { label: 'Earning ID', value: earning.id ?? '-' },
    { label: 'Source', value: earning.source ?? '-' },
    { label: 'Category', value: categoryLabel ?? '-' },
    { label: 'Status', value: statusLabel ?? '-' },
    {
      label: 'Amount',
      value: earning.amount != null ? `${earning.currency || '₹'} ${earning.amount}` : '-',
    },
  ];
}

export const EARNING_DOCUMENT_TYPES = ['jpg', 'jpeg', 'png', 'pdf'];
export const EARNING_CREATE_DOCUMENT_HINT =
  'Record a new earning with source, category, and amount. Receipts are optional.';
