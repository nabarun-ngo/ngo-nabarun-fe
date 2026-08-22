import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { ExpenseRefDataDto } from 'src/app/core/api/api-client/models';
import { Doc } from 'src/app/shared/models/document.model';
import type { Account } from 'src/app/feature/finance/accounts/domain';
import type { Expense, ExpenseFilterCriteria, PagedExpenses } from 'src/app/feature/finance/expense/domain';
import {
  EXPENSE_DEFAULT_CHIP,
  normalizeExpenseChip,
} from 'src/app/feature/finance/expense/config/expense.rules';
import {
  ExpenseDataSource,
  ExpenseListOptions,
  ExpenseListPageQuery,
} from 'src/app/feature/finance/expense/data/expense-data.source';
import {
  buildDemoCreatedExpense,
  DEMO_EXPENSE_EVENT_OPTIONS,
  DEMO_EXPENSE_MEMBER_OPTIONS,
  DEMO_EXPENSE_REF_DATA,
  findDemoExpenseById,
  getDemoExpensePage,
  updateDemoExpense,
} from './expense-demo.fixtures';

const DEMO_PAYER_WALLET: Account = {
  id: 'wallet-demo-1',
  displayName: 'Demo User Wallet',
} as Account;

@Injectable()
export class ExpenseDemoDataSource implements ExpenseDataSource {
  loadListPage(query: ExpenseListPageQuery): Observable<PagedExpenses> {
    const chipId = normalizeExpenseChip(query.chipId);
    const criteria = (query.criteria ?? {}) as ExpenseFilterCriteria;
    const { items, totalSize } = getDemoExpensePage(
      chipId,
      criteria,
      query.searchText,
      query.pageIndex,
      query.pageSize,
      query.useOrgList,
    );

    return of({
      content: items,
      totalSize,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(250));
  }

  fetchMyExpenses(options: ExpenseListOptions): Observable<PagedExpenses> {
    return this.loadListPage({
      chipId: 'mine',
      criteria: options.filter as ExpenseFilterCriteria | undefined,
      pageIndex: options.pageIndex ?? 0,
      pageSize: options.pageSize ?? 12,
      useOrgList: false,
    });
  }

  fetchExpenses(options: ExpenseListOptions): Observable<PagedExpenses> {
    return this.loadListPage({
      chipId: 'pending_reimburse',
      criteria: options.filter as ExpenseFilterCriteria | undefined,
      pageIndex: options.pageIndex ?? 0,
      pageSize: options.pageSize ?? 12,
      useOrgList: true,
    });
  }

  fetchExpenseById(id: string): Observable<Expense | undefined> {
    return of(findDemoExpenseById(id)).pipe(delay(150));
  }

  createExpense(expense: Expense): Observable<Expense> {
    return of(buildDemoCreatedExpense(expense)).pipe(delay(200));
  }

  updateExpense(id: string, patch: Partial<Expense>): Observable<Expense> {
    const updated = updateDemoExpense(id, patch);
    return of(updated ?? ({ ...patch, id } as Expense)).pipe(delay(200));
  }

  approveAndSettle(expenseId: string, settlementAccountId: string): Observable<Expense> {
    const existing = findDemoExpenseById(expenseId);
    return of({
      ...(existing ?? {}),
      id: expenseId,
      status: 'SETTLED',
      statusLabel: 'Reimbursed',
      settlementAccountId,
      txnNumber: existing?.txnNumber ?? `TXN-${expenseId}`,
    } as Expense);
  }

  sendBackExpense(id: string, remarks: string): Observable<Expense> {
    const existing = findDemoExpenseById(id);
    return of({
      ...(existing ?? {}),
      id,
      status: 'SEND_BACK',
      statusLabel: 'Sent back',
      remarks,
      sendBackBy: { id: 'admin-1', fullName: 'Finance Admin' },
      sendBackOn: new Date().toISOString().slice(0, 10),
    } as Expense);
  }

  fetchPayerWallet(_payerId?: string): Observable<Account | undefined> {
    return of(DEMO_PAYER_WALLET).pipe(delay(100));
  }

  fetchDocuments(_expenseId: string): Observable<Doc[]> {
    return of([]);
  }

  fetchRefData(): Observable<ExpenseRefDataDto | undefined> {
    return of(DEMO_EXPENSE_REF_DATA as unknown as ExpenseRefDataDto);
  }

  fetchMemberOptions(): Observable<import('@nabarun-ngo/forms-core').FieldOption[]> {
    return of(DEMO_EXPENSE_MEMBER_OPTIONS).pipe(delay(100));
  }

  fetchEventOptions(): Observable<import('@nabarun-ngo/forms-core').FieldOption[]> {
    return of(DEMO_EXPENSE_EVENT_OPTIONS).pipe(delay(100));
  }
}
