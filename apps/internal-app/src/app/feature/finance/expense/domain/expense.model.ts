import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { Account } from '../../accounts/domain';
import type { PagedResult } from 'src/app/shared/models/paged-result.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { LineItemRow } from 'src/app/shared/components/line-items-editor/line-items-editor.component';

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'FINALIZED' | 'SETTLED' | 'SEND_BACK';

export interface ExpenseItem {
  itemName: string;
  description?: string;
  amount: number;
  formattedAmount: string;
}

export interface Expense {
  id?: string;
  name?: string;
  description?: string;
  expenseDate?: string;
  expenseRefId?: string;
  expenseRefType?: 'OTHER' | 'EVENT' | 'ADHOC' | 'OPERATIONAL' | 'ADMINISTRATIVE';
  finalAmount?: number;
  status?: ExpenseStatus;
  expenseItems?: ExpenseItem[];
  settlementAccount?: Account;
  txnNumber?: string;
  remarks?: string;
  isDeligated?: boolean;
  settlementAccountId?: string;
  activityName?: string;
  createdBy?: { id?: string; fullName?: string; email?: string };
  paidBy?: { id?: string; fullName?: string; email?: string };
  finalizedBy?: { id?: string; fullName?: string; email?: string };
  settledBy?: { id?: string; fullName?: string; email?: string };
  sendBackBy?: { id?: string; fullName?: string; email?: string };
  createdOn?: string;
  finalizedOn?: string;
  settledOn?: string;
  sendBackOn?: string;
  displayName?: string;
  formattedAmount?: string;
  formattedDate?: string;
  statusLabel?: string;
  isSettled?: boolean;
  isFinalized?: boolean;
  canEdit?: boolean;
  payerId?: string;
}

export type PagedExpenses = PagedResult<Expense>;

export type ExpensePrimaryChip = 'mine' | 'pending_reimburse' | 'reimbursed';

export interface ExpenseFilterCriteria {
  [key: string]: unknown;
  status?: string[];
  expenseRefType?: string[];
  expenseRefId?: string;
  eventName?: string;
  startDate?: string;
  endDate?: string;
  expenseId?: string;
  payerId?: string;
  payerName?: string;
}

export interface ExpenseStatusGroups {
  outstanding: string[];
  closed: string[];
  excluded: string[];
}

export type ExpenseRefData = Record<
  string,
  KeyValue[] | ExpenseStatusGroups | undefined
>;

export interface ExpenseCreateOptions {
  memberOptions: FieldOption[];
  eventOptions: FieldOption[];
  defaultPayerId?: string;
  presetActivityId?: string;
  lockEvent: boolean;
}

export interface ExpenseListContext {
  [key: string]: unknown;
  refData: ExpenseRefData;
  activeChip: ExpensePrimaryChip;
  memberOptions: FieldOption[];
  eventOptions: FieldOption[];
  defaultPayerId?: string;
  projectId?: string;
  presetActivityId?: string;
  projectBackLink?: string;
  pageName: 'Expenses' | 'Project Expenses';
  selectedExpense?: Expense;
  payerWallets: Map<string, Account | undefined>;
  /** Org funding accounts cached for expense wallet top-up. */
  fundingAccounts: Account[];
  /** Bumped to invalidate settlement-detail preparation cache after top-up. */
  settlementRefreshKey: number;
  createOptions: ExpenseCreateOptions;
}

export type ExpenseLineItemRows = LineItemRow[];
