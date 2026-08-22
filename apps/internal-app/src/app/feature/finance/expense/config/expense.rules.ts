import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import type { Account } from '../../accounts/domain';
import { AccountConstant } from '../../finance.const';
import type {
  Expense,
  ExpenseFilterCriteria,
  ExpenseListContext,
  ExpensePrimaryChip,
  ExpenseRefData,
  ExpenseStatus,
  ExpenseStatusGroups,
} from '../domain';

export const EXPENSE_DEFAULT_CHIP: ExpensePrimaryChip = 'mine';

export const EXPENSE_CHIPS = [
  { id: 'mine', label: 'Mine' },
  { id: 'pending_reimburse', label: 'Pending Reimburse' },
  { id: 'reimbursed', label: 'Reimbursed' },
] as const;

/** Deep-link statuses for dashboard “My Pending Expenses” → Mine + unsettled only. */
export const EXPENSE_MINE_UNSETTLED_STATUSES = [
  'DRAFT', 'SUBMITTED', 'FINALIZED', 'SEND_BACK',
] as const;

/** Deep-link query for dashboard “My Pending Expenses” → Mine + unsettled only. */
export const EXPENSE_MINE_UNSETTLED_ROUTE_QUERY = {
  status: EXPENSE_MINE_UNSETTLED_STATUSES.join(','),
} as const;

export type ExpenseSettlementReadiness =
  | 'noWallet'
  | 'needsTopUp'
  | 'ready'
  | 'ineligible';

const LEGACY_CHIP_ALIASES: Record<string, ExpensePrimaryChip> = {
  my_expenses: 'mine',
  pending_approval: 'pending_reimburse',
  sent_back: 'pending_reimburse',
  all: 'mine',
};

export function expenseStatusGroups(refData?: ExpenseRefData): ExpenseStatusGroups {
  const value = refData?.[AccountConstant.refDataKey.expenseStatusGroups];
  if (value && !Array.isArray(value) && typeof value === 'object' && 'outstanding' in value) {
    return value as ExpenseStatusGroups;
  }
  return { outstanding: [], closed: [], excluded: [] };
}

/** Chip → status group: pending_reimburse → outstanding, reimbursed → closed. */
export function expenseStatusesForChip(
  chipId: ExpensePrimaryChip,
  refData?: ExpenseRefData,
): ExpenseStatus[] | undefined {
  const groups = expenseStatusGroups(refData);
  if (chipId === 'pending_reimburse') {
    return groups.outstanding.length
      ? groups.outstanding as ExpenseStatus[]
      : undefined;
  }
  if (chipId === 'reimbursed') {
    return groups.closed.length
      ? groups.closed as ExpenseStatus[]
      : undefined;
  }
  return undefined;
}

export function isMineChip(chipId: ExpensePrimaryChip): boolean {
  return chipId === 'mine';
}

/** Draft or sent back — member can fully edit and (re)submit. */
export function isUnsubmittedExpenseStatus(status?: ExpenseStatus): boolean {
  return status === 'DRAFT' || status === 'SEND_BACK';
}

export function isSettlementEligibleStatus(status?: ExpenseStatus): boolean {
  return status === 'SUBMITTED' || status === 'FINALIZED';
}

export function normalizeExpenseChip(value?: string | null): ExpensePrimaryChip {
  if (!value) return EXPENSE_DEFAULT_CHIP;
  if (EXPENSE_CHIPS.some(chip => chip.id === value)) {
    return value as ExpensePrimaryChip;
  }
  return LEGACY_CHIP_ALIASES[value] ?? EXPENSE_DEFAULT_CHIP;
}

export function createExpenseContext(options: {
  refData: ExpenseRefData;
  defaultPayerId?: string;
  projectId?: string;
  activityId?: string;
}): ExpenseListContext {
  const scoped = !!(options.projectId && options.activityId);
  return {
    refData: options.refData,
    activeChip: EXPENSE_DEFAULT_CHIP,
    memberOptions: [],
    eventOptions: [],
    defaultPayerId: options.defaultPayerId,
    projectId: options.projectId,
    presetActivityId: options.activityId,
    pageName: scoped ? 'Project Expenses' : 'Expenses',
    projectBackLink: scoped
      ? AppRoute.secured_project_activities_page.url.replace(':id', btoa(options.projectId!))
      : undefined,
    payerWallets: new Map(),
    fundingAccounts: [],
    settlementRefreshKey: 0,
    createOptions: {
      memberOptions: [],
      eventOptions: [],
      defaultPayerId: options.defaultPayerId,
      presetActivityId: options.activityId,
      lockEvent: !!options.activityId,
    },
  };
}

export function resolveExpenseStatuses(
  chipId: ExpensePrimaryChip,
  criteria?: ExpenseFilterCriteria,
  refData?: ExpenseRefData,
): ExpenseStatus[] | undefined {
  const chipPreset = expenseStatusesForChip(chipId, refData);
  const userStatus = criteria?.status?.length
    ? criteria.status as ExpenseStatus[]
    : undefined;

  if (userStatus?.length && chipPreset?.length) {
    const intersection = userStatus.filter(status => chipPreset.includes(status));
    return intersection.length ? intersection : chipPreset;
  }
  if (userStatus?.length) return userStatus;
  return chipPreset;
}

export function buildExpenseApiFilter(
  chipId: ExpensePrimaryChip,
  criteria: ExpenseFilterCriteria = {},
  searchText?: string,
  refData?: ExpenseRefData,
) {
  return {
    expenseId: (searchText?.trim() || criteria.expenseId) || undefined,
    expenseRefId: criteria.expenseRefId || undefined,
    expenseStatus: resolveExpenseStatuses(chipId, criteria, refData),
    startDate: criteria.startDate || undefined,
    endDate: criteria.endDate || undefined,
    payerId: criteria.payerId || undefined,
  };
}

export function shouldUseOrgList(
  chipId: ExpensePrimaryChip,
  canManageExpenses: boolean,
): boolean {
  return canManageExpenses && !isMineChip(chipId);
}

export function resolveExpensePermissions(authorization: AuthorizationService) {
  const perms = authorization.effectivePermissions();
  const canFinalizeExpense = perms.includes(SCOPE.finalize.expense);
  const canSettleExpense = perms.includes(SCOPE.settle.expense);
  const canManageExpenses = [
    SCOPE.finalize.expense,
    SCOPE.settle.expense,
    SCOPE.read.expenses,
  ].some(p => perms.includes(p));

  return {
    canManageExpenses,
    canFinalizeExpense,
    canSettleExpense,
    canSendBack: canManageExpenses,
    canUpdateEntity: perms.includes(SCOPE.update.expense),
    showCreateFab: perms.includes(SCOPE.create.expense),
    canCreateAccount: perms.includes(SCOPE.create.account),
  };
}

export function getExpensePayerWallet(
  context: ExpenseListContext,
  expense?: Expense,
): Account | undefined {
  if (!expense?.id) return undefined;
  return context.payerWallets.get(expense.id);
}

export function settlementShortfall(
  expense: Expense,
  wallet?: Account,
): number {
  const amount = Number(expense.finalAmount ?? 0);
  const balance = wallet?.balance ?? 0;
  return Math.max(0, amount - balance);
}

export function resolveSettlementReadiness(
  expense?: Expense,
  wallet?: Account,
): ExpenseSettlementReadiness {
  if (!expense || !isSettlementEligibleStatus(expense.status)) {
    return 'ineligible';
  }
  if (!wallet?.id) {
    return 'noWallet';
  }
  if (settlementShortfall(expense, wallet) > 0) {
    return 'needsTopUp';
  }
  return 'ready';
}

/** Deep-link to Accounts create for a missing payer wallet, with return to expense. */
export function buildCreateWalletRoute(expense: Expense): {
  commands: string[];
  queryParams: Record<string, string>;
} {
  const payerId = expense.paidBy?.id ?? '';
  return {
    commands: [AppRoute.secured_account_list_page.url],
    queryParams: {
      create: 'true',
      accountType: 'WALLET',
      ownerType: 'INDIVIDUAL',
      ...(payerId ? { accountHolder: payerId } : {}),
      backTo: AppRoute.secured_manage_account_page.url,
      backLabel: 'Expenses',
      ...(expense.id ? { expenseId: expense.id } : {}),
    },
  };
}

export function buildExpenseTransactionRoute(expense: {
  txnNumber?: string;
}, accountId: string): {
  commands: string[];
  queryParams: Record<string, string>;
} {
  return {
    commands: [
      AppRoute.secured_account_transaction_page.url.replace(':id', btoa(accountId)),
    ],
    queryParams: {
      self: 'N',
      transactionRef: expense.txnNumber ?? '',
      backTo: AppRoute.secured_manage_account_page.url,
      backLabel: 'Expenses',
    },
  };
}
