import { InjectionToken } from '@angular/core';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { Observable } from 'rxjs';
import { ExpenseRefDataDto } from 'src/app/core/api/api-client/models';
import { Doc } from 'src/app/shared/models/document.model';
import type { Account } from '../../accounts/domain';
import type {
  Expense,
  ExpenseFilterCriteria,
  ExpenseRefData,
  ExpenseStatus,
  PagedExpenses,
} from '../domain';

export interface ExpenseListFilter {
  expenseId?: string;
  expenseRefId?: string;
  expenseStatus?: ExpenseStatus[];
  startDate?: string;
  endDate?: string;
  payerId?: string;
}

export interface ExpenseListOptions {
  pageIndex?: number;
  pageSize?: number;
  filter?: ExpenseListFilter;
}

export interface ExpenseListPageQuery {
  chipId?: string;
  criteria?: ExpenseFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
  useOrgList?: boolean;
  refData?: ExpenseRefData;
}

export interface ExpenseDataSource {
  loadListPage(query: ExpenseListPageQuery): Observable<PagedExpenses>;
  fetchMyExpenses(options: ExpenseListOptions): Observable<PagedExpenses>;
  fetchExpenses(options: ExpenseListOptions): Observable<PagedExpenses>;
  fetchExpenseById(id: string): Observable<Expense | undefined>;
  createExpense(expense: Expense): Observable<Expense>;
  updateExpense(id: string, patch: Partial<Expense>): Observable<Expense>;
  approveAndSettle(expenseId: string, settlementAccountId: string): Observable<Expense>;
  sendBackExpense(id: string, remarks: string): Observable<Expense>;
  fetchPayerWallet(payerId?: string): Observable<Account | undefined>;
  fetchDocuments(expenseId: string): Observable<Doc[]>;
  fetchRefData(): Observable<ExpenseRefDataDto | undefined>;
  fetchMemberOptions(): Observable<FieldOption[]>;
  fetchEventOptions(): Observable<FieldOption[]>;
}

export const ExpenseDataSource = new InjectionToken<ExpenseDataSource>('ExpenseDataSource');
