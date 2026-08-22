import { Injectable } from '@angular/core';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ExpenseRefDataDto } from 'src/app/core/api/api-client/models';
import { ActivityService } from '../../../../project/activity/data/activity.service';
import type { Account } from '../../../accounts/domain';
import { ExpenseService } from '../expense.service';
import type { Expense, ExpenseFilterCriteria, PagedExpenses } from '../../domain';
import {
  buildExpenseApiFilter,
  isMineChip,
  normalizeExpenseChip,
} from '../../config/expense.rules';
import { mapUsersToMemberOptions } from '../expense-member-options.mapper';
import {
  ExpenseDataSource,
  ExpenseListOptions,
  ExpenseListPageQuery,
} from '../expense-data.source';

function applyClientTypeFilter(
  page: PagedExpenses,
  criteria?: ExpenseFilterCriteria,
): PagedExpenses {
  if (!criteria?.expenseRefType?.length) return page;
  const content = (page.content ?? []).filter(expense =>
    expense.expenseRefType && criteria.expenseRefType!.includes(expense.expenseRefType),
  );
  return { ...page, content, totalSize: content.length };
}

@Injectable()
export class ExpenseApiDataSource implements ExpenseDataSource {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly activityService: ActivityService,
  ) {}

  loadListPage(query: ExpenseListPageQuery): Observable<PagedExpenses> {
    const chipId = normalizeExpenseChip(query.chipId);
    const filter = buildExpenseApiFilter(chipId, query.criteria, query.searchText, query.refData);
    const options: ExpenseListOptions = {
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      filter,
    };
    const useOrgList = query.useOrgList ?? !isMineChip(chipId);
    const request$ = useOrgList ? this.fetchExpenses(options) : this.fetchMyExpenses(options);
    return request$.pipe(map(page => applyClientTypeFilter(page, query.criteria)));
  }

  fetchMyExpenses(options: ExpenseListOptions): Observable<PagedExpenses> {
    return this.expenseService.fetchMyExpenses(
      options.pageIndex,
      options.pageSize,
      options.filter,
    );
  }

  fetchExpenses(options: ExpenseListOptions): Observable<PagedExpenses> {
    return this.expenseService.fetchExpenses(
      options.pageIndex,
      options.pageSize,
      options.filter,
    );
  }

  fetchExpenseById(id: string): Observable<Expense | undefined> {
    return this.expenseService.fetchExpenseById(id).pipe(
      catchError(() => of(undefined)),
    );
  }

  createExpense(expense: Expense): Observable<Expense> {
    return this.expenseService.createExpenses(expense);
  }

  updateExpense(id: string, patch: Partial<Expense>): Observable<Expense> {
    return this.expenseService.updateExpense(id, patch as Expense);
  }

  approveAndSettle(expenseId: string, settlementAccountId: string): Observable<Expense> {
    return this.expenseService.approveAndSettle(expenseId, settlementAccountId);
  }

  sendBackExpense(id: string, remarks: string): Observable<Expense> {
    return this.expenseService.sendBackExpense(id, remarks);
  }

  fetchPayerWallet(payerId?: string): Observable<Account | undefined> {
    if (!payerId) return of(undefined);
    return this.expenseService.fetchAccounts({
      type: ['WALLET'],
      status: ['ACTIVE'],
      accountHolderId: payerId,
      pageIndex: 0,
      pageSize: 1,
    }).pipe(
      map(result => result.content?.[0]),
      catchError(() => of(undefined)),
    );
  }

  fetchDocuments(expenseId: string): Observable<import('src/app/shared/models/document.model').Doc[]> {
    return this.expenseService.getExpenseDocuments(expenseId).pipe(
      catchError(() => of([])),
    );
  }

  fetchRefData(): Observable<ExpenseRefDataDto | undefined> {
    return this.expenseService.getReferenceData().pipe(
      map(refData => refData ?? undefined),
    );
  }

  fetchMemberOptions(): Observable<FieldOption[]> {
    return this.expenseService.fetchUsers().pipe(
      map(mapUsersToMemberOptions),
      catchError(() => of([])),
    );
  }

  /** Expense events are activities, labelled with the project they belong to. */
  fetchEventOptions(): Observable<FieldOption[]> {
    return forkJoin({
      projects: this.activityService.fetchProjectOptions(),
      activities: this.activityService.fetchActivities(0, 500),
    }).pipe(
      map(({ projects, activities }) => {
        const projectLabels = new Map(projects.map(project => [project.key, project.label]));
        return (activities.content ?? [])
          .map(activity => ({
            key: activity.id,
            label: [projectLabels.get(activity.projectId), activity.name]
              .filter(Boolean)
              .join(' · '),
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }),
      catchError(() => of([])),
    );
  }
}
