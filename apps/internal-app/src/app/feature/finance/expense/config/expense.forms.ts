import type {
  FieldOption,
  FormDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type { CfFormStepperStep } from '@nabarun-ngo/forms-angular';
import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { AccountConstant } from '../../finance.const';
import { validateTransferValues } from '../../accounts/config/account/account.rules';
import type { LineItemRow } from 'src/app/shared/components/line-items-editor/line-items-editor.component';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { ExpenseDataSource } from '../data/expense-data.source';
import type {
  Expense,
  ExpenseCreateOptions,
  ExpenseFilterCriteria,
  ExpenseItem,
  ExpensePrimaryChip,
  ExpenseRefData,
} from '../domain';
import { expenseStatusesForChip } from './expense.rules';

export {
  ACCOUNT_TRANSFER_DOCUMENT_HINT as EXPENSE_TOP_UP_DOCUMENT_HINT,
  ACCOUNT_TRANSFER_DOCUMENT_TYPES as EXPENSE_TOP_UP_DOCUMENT_TYPES,
} from '../../accounts/config/account/account.forms';

export type ExpenseCreateStep = 'details' | 'items';

export const EXPENSE_CREATE_STEPPER_STEPS: CfFormStepperStep<ExpenseCreateStep>[] = [
  { id: 'details', label: 'Expense details', kind: 'form' },
  { id: 'items', label: 'Line items', kind: 'custom' },
];

export function resolveExpenseCreateSteps(_values: FormValues): ExpenseCreateStep[] {
  return ['details', 'items'];
}

function statusOptionsForChip(
  chipId: ExpensePrimaryChip,
  refData: ExpenseRefData,
): FieldOption[] {
  const all = toFieldOptions(
    refData[AccountConstant.refDataKey.expenseStatus] as KeyValue[] | undefined,
  );
  const preset = expenseStatusesForChip(chipId, refData);
  if (!preset?.length) return all;
  return all.filter(option => preset.includes(option.key as typeof preset[number]));
}

export function buildExpenseFilterForm(
  chipId: ExpensePrimaryChip,
  refData: ExpenseRefData,
  memberOptions: FieldOption[] = [],
  eventOptions: FieldOption[] = [],
): FormDefinition {
  return {
    id: 'expense-filter',
    key: 'expense-filter',
    label: 'Expense Filters',
    description: '',
    fields: [
      baseField({
        id: 'expenseId',
        key: 'expenseId',
        label: 'Expense ID',
        placeholder: 'Enter expense ID',
        fieldType: 'text',
        sortOrder: 1,
      }),
      baseField({
        id: 'expenseRefType',
        key: 'expenseRefType',
        label: 'Expense Type',
        fieldType: 'multiselect',
        sortOrder: 2,
        fieldOptions: toFieldOptions(
          (refData[AccountConstant.refDataKey.expenseType] as KeyValue[] | undefined) ?? [],
        ),
      }),
      baseField({
        id: 'expenseRefId',
        key: 'expenseRefId',
        label: 'Event',
        fieldType: 'autocomplete',
        sortOrder: 3,
        fieldOptions: eventOptions,
        condition: {
          dependsOnKey: 'expenseRefType',
          operator: 'in',
          value: ['EVENT'],
        },
      }),
      baseField({
        id: 'payerId',
        key: 'payerId',
        label: 'Expense Payer',
        fieldType: 'autocomplete',
        sortOrder: 4,
        fieldOptions: memberOptions,
      }),
      baseField({
        id: 'status',
        key: 'status',
        label: 'Expense Status',
        fieldType: 'multiselect',
        sortOrder: 5,
        fieldOptions: statusOptionsForChip(chipId, refData),
      }),
    ].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function expenseCriteriaToValues(criteria: ExpenseFilterCriteria): FormValues {
  return {
    expenseId: criteria.expenseId ?? '',
    expenseRefType: criteria.expenseRefType ?? [],
    expenseRefId: criteria.expenseRefId ?? '',
    payerId: criteria.payerId ?? '',
    status: criteria.status ?? [],
  };
}

export function expenseValuesToCriteria(
  _chipId: ExpensePrimaryChip,
  values: FormValues,
  criteria: ExpenseFilterCriteria,
  memberOptions: FieldOption[] = [],
  eventOptions: FieldOption[] = [],
): ExpenseFilterCriteria {
  const expenseRefType = values['expenseRefType'];
  const status = values['status'];
  const expenseId = values['expenseId'];
  const expenseRefId = values['expenseRefId'];
  const payerId = values['payerId'];
  const resolvedPayerId = typeof payerId === 'string' && payerId.trim()
    ? payerId.trim() : undefined;
  const resolvedEventId = typeof expenseRefId === 'string' && expenseRefId.trim()
    ? expenseRefId.trim() : undefined;
  const typeIncludesEvent = Array.isArray(expenseRefType) && expenseRefType.includes('EVENT');

  return {
    ...criteria,
    expenseId: typeof expenseId === 'string' && expenseId.trim()
      ? expenseId.trim() : undefined,
    expenseRefType: Array.isArray(expenseRefType) && expenseRefType.length
      ? expenseRefType as string[] : undefined,
    expenseRefId: typeIncludesEvent ? resolvedEventId : undefined,
    eventName: typeIncludesEvent && resolvedEventId
      ? eventOptions.find(option => option.key === resolvedEventId)?.label
      : undefined,
    payerId: resolvedPayerId,
    payerName: resolvedPayerId
      ? memberOptions.find(option => option.key === resolvedPayerId)?.label
      : undefined,
    status: Array.isArray(status) && status.length ? status as string[] : undefined,
  };
}

function buildExpenseHeaderFields(
  refData: ExpenseRefData,
  options: ExpenseCreateOptions,
) {
  return [
    baseField({
      id: 'payerId',
      key: 'payerId',
      label: 'Expense Payer',
      placeholder: 'Select member',
      fieldType: 'autocomplete',
      sortOrder: 1,
      mandatory: true,
      fieldOptions: options.memberOptions,
    }),
    baseField({
      id: 'name',
      key: 'name',
      label: 'Expense Name',
      placeholder: 'Ex. Team lunch',
      fieldType: 'text',
      sortOrder: 2,
      mandatory: true,
    }),
    baseField({
      id: 'expenseRefType',
      key: 'expenseRefType',
      label: 'Expense Type',
      placeholder: 'Select type',
      fieldType: 'select',
      sortOrder: 3,
      mandatory: true,
      enabled: !options.lockEvent,
      fieldOptions: toFieldOptions(
        refData[AccountConstant.refDataKey.expenseType] as KeyValue[] | undefined,
      ),
    }),
    baseField({
      id: 'expenseRefId',
      key: 'expenseRefId',
      label: 'Event',
      placeholder: 'Search event',
      fieldType: 'autocomplete',
      sortOrder: 4,
      mandatory: true,
      enabled: !options.lockEvent,
      fieldOptions: options.eventOptions,
      condition: {
        dependsOnKey: 'expenseRefType',
        operator: 'equals',
        value: 'EVENT',
      },
    }),
    baseField({
      id: 'expenseDate',
      key: 'expenseDate',
      label: 'Expense Date',
      fieldType: 'date',
      sortOrder: 5,
      mandatory: true,
      dateConstraints: { max: { kind: 'today' } },
    }),
    baseField({
      id: 'description',
      key: 'description',
      label: 'Description',
      placeholder: 'Optional notes',
      fieldType: 'textarea',
      sortOrder: 6,
    }),
  ];
}

export function buildExpenseCreateStep(
  step: ExpenseCreateStep,
  refData: ExpenseRefData,
  options: ExpenseCreateOptions,
): FormDefinition {
  if (step === 'items') {
    return {
      id: 'expense-create-items',
      key: 'expense-create-items',
      label: 'Line items',
      description: '',
      fields: [],
    };
  }
  return {
    id: 'expense-create-details',
    key: 'expense-create-details',
    label: 'Expense details',
    description: '',
    fields: buildExpenseHeaderFields(refData, options),
  };
}

export function defaultExpenseCreateValues(options: ExpenseCreateOptions): FormValues {
  return {
    payerId: options.defaultPayerId ?? '',
    name: '',
    expenseRefType: options.lockEvent ? 'EVENT' : '',
    expenseRefId: options.presetActivityId ?? '',
    expenseDate: new Date().toISOString().slice(0, 10),
    description: '',
  };
}

export function expenseToCreateValues(expense: Expense): FormValues {
  return {
    payerId: expense.payerId ?? expense.paidBy?.id ?? '',
    name: expense.name ?? '',
    expenseRefType: expense.expenseRefType ?? '',
    expenseRefId: expense.expenseRefId ?? '',
    expenseDate: expense.expenseDate ?? '',
    description: expense.description ?? '',
  };
}

export function lineItemRowsToExpenseItems(rows: LineItemRow[]): ExpenseItem[] {
  return rows
    .filter(row => row.itemName.trim() && row.amount > 0)
    .map(({ itemName, amount }) => ({
      itemName,
      amount,
      formattedAmount: `₹${amount.toLocaleString('en-IN')}`,
    }));
}

export function expenseItemsToLineItemRows(items?: ExpenseItem[]): LineItemRow[] {
  if (!items?.length) return [{ itemName: '', amount: 0 }];
  return items.map(item => ({
    itemName: item.itemName ?? '',
    amount: item.amount ?? 0,
  }));
}

export function createValuesToExpense(
  values: FormValues,
  expenseItems: ExpenseItem[],
  presetActivityId?: string,
): Expense {
  const expenseRefType = (presetActivityId
    ? 'EVENT'
    : String(values['expenseRefType'] ?? '')) as Expense['expenseRefType'];
  const expenseRefId = presetActivityId
    ?? (expenseRefType === 'EVENT'
      ? String(values['expenseRefId'] ?? '').trim() || undefined
      : undefined);

  return {
    name: String(values['name'] ?? '').trim(),
    description: String(values['description'] ?? '').trim() || undefined,
    expenseRefType,
    expenseRefId,
    expenseDate: String(values['expenseDate'] ?? ''),
    expenseItems,
    payerId: String(values['payerId'] ?? '').trim(),
    status: 'DRAFT',
  };
}

export function createValuesToExpenseUpdate(
  values: FormValues,
  expenseItems: ExpenseItem[],
  memberOptions: FieldOption[],
  presetActivityId?: string,
): Partial<Expense> {
  const expense = createValuesToExpense(values, expenseItems, presetActivityId);
  const amount = expenseItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const payerLabel = memberOptions.find(option => option.key === expense.payerId)?.label;
  return {
    ...expense,
    finalAmount: amount,
    formattedAmount: `₹${amount.toLocaleString('en-IN')}`,
    displayName: expense.name,
    paidBy: expense.payerId
      ? { id: expense.payerId, fullName: payerLabel }
      : undefined,
  };
}

export function saveExpenseCreate(
  values: FormValues,
  lineItemRows: LineItemRow[],
  presetActivityId: string | undefined,
  expenseData: ExpenseDataSource,
): Observable<Expense> {
  const validItems = lineItemRowsToExpenseItems(lineItemRows);
  if (!validItems.length) {
    return throwError(() => new Error(
      'Add at least one expense item with a name and amount.',
    ));
  }
  return expenseData.createExpense(
    createValuesToExpense(values, validItems, presetActivityId),
  );
}

export function buildExpenseResubmitForm(): FormDefinition {
  return {
    id: 'expense-resubmit',
    key: 'expense-resubmit',
    label: 'Correct expense',
    description: '',
    fields: [
      baseField({
        id: 'remarks',
        key: 'remarks',
        label: 'Remarks',
        fieldType: 'textarea',
        sortOrder: 1,
      }),
    ],
  };
}

export function buildExpenseSendBackForm(): FormDefinition {
  return {
    id: 'expense-send-back',
    key: 'expense-send-back',
    label: 'Send back for correction',
    description: '',
    fields: [
      baseField({
        id: 'remarks',
        key: 'remarks',
        label: 'Reason for send back',
        placeholder: 'Explain what the member should correct',
        fieldType: 'textarea',
        sortOrder: 1,
        mandatory: true,
      }),
    ],
  };
}

export function buildExpenseEditForm(
  refData: ExpenseRefData,
  options: ExpenseCreateOptions,
  expense?: Expense,
): FormDefinition {
  const fields = buildExpenseHeaderFields(refData, options);
  if (expense?.status === 'SEND_BACK' && expense.remarks) {
    fields.unshift(baseField({
      id: 'adminFeedback',
      key: 'adminFeedback',
      label: 'Admin feedback',
      fieldType: 'textarea',
      sortOrder: 0,
      enabled: false,
    }));
  }
  return {
    id: 'expense-edit',
    key: 'expense-edit',
    label: 'Edit Expense',
    description: '',
    fields,
  };
}

export function expenseToEditValues(expense: Expense): FormValues {
  return {
    ...expenseToCreateValues(expense),
    adminFeedback: expense.remarks ?? '',
  };
}

export function buildExpenseTopUpForm(
  fundingOptions: FieldOption[],
  walletId: string,
): FormDefinition {
  return {
    id: 'expense-top-up-wallet',
    key: 'expense-top-up-wallet',
    label: 'Top up payer wallet',
    description: 'Record a fund transfer into the payer wallet. Upload transfer proof.',
    fields: [
      baseField({
        id: 'transferFrom',
        key: 'transferFrom',
        label: 'Transfer from account',
        fieldType: 'select',
        sortOrder: 1,
        mandatory: true,
        fieldOptions: fundingOptions,
      }),
      baseField({
        id: 'transferTo',
        key: 'transferTo',
        label: 'Transfer to wallet',
        fieldType: 'text',
        sortOrder: 2,
        mandatory: true,
        enabled: false,
        fieldOptions: [{ key: walletId, label: walletId }],
      }),
      baseField({
        id: 'amount',
        key: 'amount',
        label: 'Transfer amount',
        fieldType: 'number',
        sortOrder: 3,
        mandatory: true,
      }),
      baseField({
        id: 'transferDate',
        key: 'transferDate',
        label: 'Transfer date',
        fieldType: 'date',
        sortOrder: 4,
        mandatory: true,
        dateConstraints: { max: { kind: 'today' } },
      }),
      baseField({
        id: 'description',
        key: 'description',
        label: 'Transfer description',
        fieldType: 'textarea',
        sortOrder: 5,
        mandatory: true,
      }),
      baseField({
        id: 'transferReferenceType',
        key: 'transferReferenceType',
        label: 'Transfer reference',
        fieldType: 'select',
        sortOrder: 6,
        mandatory: true,
        enabled: false,
        fieldOptions: [{ key: 'ADHOC', label: 'General' }],
      }),
    ],
  };
}

export function defaultExpenseTopUpValues(options: {
  walletId: string;
  shortfall: number;
  expenseId?: string;
}): FormValues {
  const today = new Date().toISOString().split('T')[0];
  return {
    transferFrom: '',
    transferTo: options.walletId,
    amount: options.shortfall > 0 ? options.shortfall : null,
    transferDate: today,
    description: options.expenseId
      ? `Top up for expense ${options.expenseId}`
      : 'Top up for expense reimbursement',
    transferReferenceType: 'ADHOC',
  };
}

export function validateExpenseTopUpValues(
  values: FormValues,
  documents: readonly unknown[],
): string | undefined {
  const from = String(values['transferFrom'] ?? '').trim();
  if (!from) return 'Select the account to transfer from.';
  const amount = Number(values['amount'] ?? 0);
  if (!(amount > 0)) return 'Enter a transfer amount greater than zero.';
  if (!String(values['description'] ?? '').trim()) {
    return 'Enter a transfer description.';
  }
  return validateTransferValues(values, documents);
}

