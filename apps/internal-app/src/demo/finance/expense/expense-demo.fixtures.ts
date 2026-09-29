import type {
  Expense,
  ExpenseFilterCriteria,
  ExpensePrimaryChip,
  ExpenseStatus,
} from 'src/app/feature/finance/expense/domain';
import {
  buildExpenseApiFilter,
  isMineChip,
  resolveExpenseStatuses,
} from 'src/app/feature/finance/expense/config/expense.rules';

export const DEMO_EXPENSE_MEMBER_ID = 'demo-user';

export const DEMO_EXPENSE_REF_DATA = {
  expenseStatuses: [
    { key: 'DRAFT', displayValue: 'Not yet submitted' },
    { key: 'SUBMITTED', displayValue: 'Submitted' },
    { key: 'FINALIZED', displayValue: 'Approved' },
    { key: 'SETTLED', displayValue: 'Reimbursed' },
    { key: 'SEND_BACK', displayValue: 'Sent back' },
  ],
  expenseRefTypes: [
    { key: 'EVENT', displayValue: 'Event' },
    { key: 'OPERATIONAL', displayValue: 'Operational' },
    { key: 'ADMINISTRATIVE', displayValue: 'Administrative' },
    { key: 'ADHOC', displayValue: 'Ad hoc' },
    { key: 'OTHER', displayValue: 'Other' },
  ],
  expenseStatusGroups: {
    outstanding: ['DRAFT', 'SUBMITTED', 'FINALIZED', 'SEND_BACK'],
    closed: ['SETTLED'],
    excluded: [] as string[],
  },
};

const STATUSES: ExpenseStatus[] = ['DRAFT', 'SUBMITTED', 'FINALIZED', 'SETTLED', 'SEND_BACK'];

function statusLabel(status: ExpenseStatus): string {
  return DEMO_EXPENSE_REF_DATA['expenseStatuses'].find(item => item.key === status)?.displayValue ?? status;
}

function buildDemoExpense(index: number, isMine: boolean): Expense {
  const TYPES: Expense['expenseRefType'][] = ['EVENT', 'OPERATIONAL', 'ADMINISTRATIVE', 'ADHOC', 'OTHER'];
  const status = STATUSES[index % STATUSES.length];
  const amount = 800 + (index % 6) * 350;
  const month = (index % 12) + 1;
  const id = `EXP-${String(index + 1).padStart(4, '0')}`;
  const payerId = isMine ? DEMO_EXPENSE_MEMBER_ID : `member-${(index % 5) + 1}`;

  return {
    id,
    name: `Demo expense ${index + 1}`,
    description: `Demo expense for ${statusLabel(status).toLowerCase()} workflow`,
    expenseDate: `2026-${String(month).padStart(2, '0')}-15`,
    expenseRefType: TYPES[index % TYPES.length],
    finalAmount: amount,
    status,
    remarks: status === 'SEND_BACK' ? 'Please attach the original receipt.' : undefined,
    displayName: `Demo expense ${index + 1}`,
    formattedAmount: `₹${amount.toLocaleString('en-IN')}`,
    formattedDate: `15/${String(month).padStart(2, '0')}/2026`,
    statusLabel: statusLabel(status),
    isSettled: status === 'SETTLED',
    isFinalized: status === 'FINALIZED' || status === 'SETTLED',
    canEdit: status === 'DRAFT' || status === 'SUBMITTED' || status === 'SEND_BACK',
    paidBy: {
      id: payerId,
      fullName: isMine ? 'Demo User' : `Member ${(index % 5) + 1}`,
      email: isMine ? 'demo@example.com' : `member${(index % 5) + 1}@example.com`,
    },
    createdBy: {
      id: payerId,
      fullName: isMine ? 'Demo User' : `Member ${(index % 5) + 1}`,
    },
    sendBackBy: status === 'SEND_BACK'
      ? { id: 'admin-1', fullName: 'Finance Admin' }
      : undefined,
    sendBackOn: status === 'SEND_BACK' ? `2026-${String(month).padStart(2, '0')}-20` : undefined,
    txnNumber: status === 'SETTLED' ? `TXN-${id}` : undefined,
    settlementAccountId: status === 'SETTLED' ? 'wallet-demo-1' : undefined,
    expenseItems: [
      {
        itemName: `Line item ${index + 1}`,
        amount,
        formattedAmount: `₹${amount.toLocaleString('en-IN')}`,
      },
    ],
  };
}

const DEMO_POOL: Expense[] = [
  ...Array.from({ length: 20 }, (_, i) => buildDemoExpense(i, true)),
  ...Array.from({ length: 30 }, (_, i) => buildDemoExpense(i + 100, false)),
];

function matchesFilter(
  expense: Expense,
  chipId: ExpensePrimaryChip,
  criteria: ExpenseFilterCriteria,
  searchText?: string,
  useOrgList = false,
): boolean {
  if (isMineChip(chipId)) {
    if (expense.paidBy?.id !== DEMO_EXPENSE_MEMBER_ID) {
      return false;
    }
  } else if (!useOrgList && expense.paidBy?.id !== DEMO_EXPENSE_MEMBER_ID) {
    return false;
  }

  const apiFilter = buildExpenseApiFilter(chipId, criteria, searchText, DEMO_EXPENSE_REF_DATA);
  const resolvedStatuses = resolveExpenseStatuses(chipId, criteria, DEMO_EXPENSE_REF_DATA);

  if (apiFilter.expenseId) {
    const needle = apiFilter.expenseId.toLowerCase();
    if (!expense.id?.toLowerCase().includes(needle)) {
      return false;
    }
  }

  if (resolvedStatuses?.length && expense.status && !resolvedStatuses.includes(expense.status)) {
    return false;
  }

  if (apiFilter.payerId && expense.paidBy?.id !== apiFilter.payerId) {
    return false;
  }

  if (criteria.expenseRefType?.length && expense.expenseRefType
    && !criteria.expenseRefType.includes(expense.expenseRefType)) {
    return false;
  }

  if (criteria.expenseRefId && expense.expenseRefId !== criteria.expenseRefId) {
    return false;
  }

  return true;
}

export function findDemoExpenseById(id: string): Expense | undefined {
  return DEMO_POOL.find(expense => expense.id?.toLowerCase() === id.toLowerCase());
}

export function updateDemoExpense(id: string, patch: Partial<Expense>): Expense | undefined {
  const index = DEMO_POOL.findIndex(expense => expense.id?.toLowerCase() === id.toLowerCase());
  const existing = index >= 0 ? DEMO_POOL[index] : undefined;
  if (!existing) {
    return undefined;
  }

  const updated = { ...existing, ...patch, id: existing.id } as Expense;
  DEMO_POOL[index] = updated;
  return updated;
}

export function buildDemoCreatedExpense(payload: Expense): Expense {
  const expenseItems = (payload.expenseItems ?? []).map(item => ({
    ...item,
    formattedAmount: item.formattedAmount ?? `₹${(item.amount ?? 0).toLocaleString('en-IN')}`,
  }));
  const amount = expenseItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const id = `EXP-${String(DEMO_POOL.length + 1).padStart(4, '0')}`;
  const payerOption = DEMO_EXPENSE_MEMBER_OPTIONS.find(option => option.key === payload.payerId);
  const eventOption = DEMO_EXPENSE_EVENT_OPTIONS.find(option => option.key === payload.expenseRefId);
  const payerLabel = payerOption?.label ?? payload.paidBy?.fullName ?? 'Demo User';
  const created: Expense = {
    ...payload,
    id,
    expenseItems,
    finalAmount: amount,
    displayName: payload.name,
    formattedAmount: `₹${amount.toLocaleString('en-IN')}`,
    formattedDate: payload.expenseDate,
    status: 'DRAFT',
    statusLabel: 'Not yet submitted',
    canEdit: true,
    activityName: eventOption?.label,
    paidBy: {
      id: payload.payerId,
      fullName: payerLabel,
    },
  };
  DEMO_POOL.unshift(created);
  return created;
}

export const DEMO_EXPENSE_EVENT_OPTIONS = [
  { key: 'act-demo-1', label: 'Community Drive · Food Distribution' },
  { key: 'act-demo-2', label: 'Health Camp · Awareness Workshop' },
  { key: 'act-demo-3', label: 'Education Fund · Scholarship Drive' },
];

export const DEMO_EXPENSE_MEMBER_OPTIONS = [
  { key: DEMO_EXPENSE_MEMBER_ID, label: 'Demo User' },
  ...Array.from({ length: 5 }, (_, index) => ({
    key: `member-${index + 1}`,
    label: `Member ${index + 1}`,
  })),
];

export function getDemoExpensePage(
  chipId: ExpensePrimaryChip,
  criteria: ExpenseFilterCriteria,
  searchText: string | undefined,
  pageIndex: number,
  pageSize: number,
  useOrgList = false,
): { items: Expense[]; totalSize: number } {
  const filtered = DEMO_POOL.filter(expense =>
    matchesFilter(expense, chipId, criteria, searchText, useOrgList),
  );
  const start = pageIndex * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, totalSize: filtered.length };
}
