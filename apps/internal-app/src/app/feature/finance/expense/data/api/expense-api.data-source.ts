import { Injectable } from '@angular/core';
import type { FieldOption } from '@ssdev-toolkit/forms-core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import type {
  CreateExpenseDto,
  ExpenseRefDataDto,
  UpdateExpenseDto,
} from 'src/app/core/api/api-client/models';
import {
  AccountService as AccountApiService,
  DmsService,
  ExpenseService as ExpenseApiService,
  ProjectService as ProjectApiService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import { mapDocDtoToDoc } from 'src/app/shared/models/document.model';
import type { Account } from '../../../accounts/domain';
import { mapAccountDtoToAccount } from '../../../accounts/data/account-api.mapper';
import type { Expense, ExpenseFilterCriteria, PagedExpenses } from '../../domain';
import {
  buildExpenseApiFilter,
  isMineChip,
  normalizeExpenseChip,
} from '../../config/expense.rules';
import {
  mapExpenseDtoToExpense,
  mapPagedExpenseDtoToPagedExpenses,
} from '../expense-data.mapper';
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
    private readonly expenseApi: ExpenseApiService,
    private readonly accountApi: AccountApiService,
    private readonly dmsApi: DmsService,
    private readonly usersApi: UsersService,
    private readonly projectApi: ProjectApiService,
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
    return this.expenseApi.expenseControllerListSelfExpenses({
      pageIndex: options.pageIndex,
      pageSize: options.pageSize,
      ...options.filter,
    }).pipe(
      map(response => mapPagedExpenseDtoToPagedExpenses(response.responsePayload)),
    );
  }

  fetchExpenses(options: ExpenseListOptions): Observable<PagedExpenses> {
    return this.expenseApi.expenseControllerListExpenses({
      pageIndex: options.pageIndex,
      pageSize: options.pageSize,
      ...options.filter,
    }).pipe(
      map(response => mapPagedExpenseDtoToPagedExpenses(response.responsePayload)),
    );
  }

  fetchExpenseById(id: string): Observable<Expense | undefined> {
    return this.expenseApi.expenseControllerGetExpenseById({ id }).pipe(
      map(response => mapExpenseDtoToExpense(response.responsePayload)),
      catchError(() => of(undefined)),
    );
  }

  createExpense(expense: Expense): Observable<Expense> {
    const body: CreateExpenseDto = {
      description: expense.description,
      name: expense.name ?? '',
      expenseRefType: expense.expenseRefType ?? 'OTHER',
      expenseRefId: expense.expenseRefId,
      expenseDate: expense.expenseDate,
      expenseItems: expense.expenseItems,
      payerId: expense.payerId ?? '',
    };
    return this.expenseApi.expenseControllerCreateExpense({ body }).pipe(
      map(response => mapExpenseDtoToExpense(response.responsePayload)),
    );
  }

  updateExpense(id: string, patch: Partial<Expense>): Observable<Expense> {
    if (patch.status === 'FINALIZED') {
      return this.expenseApi.expenseControllerFinalizeExpense({ id }).pipe(
        map(response => mapExpenseDtoToExpense(response.responsePayload)),
      );
    }
    if (patch.status === 'SETTLED') {
      return this.expenseApi.expenseControllerSettleExpense({
        id,
        accountId: patch.settlementAccountId!,
      }).pipe(
        map(response => mapExpenseDtoToExpense(response.responsePayload)),
      );
    }
    const body: UpdateExpenseDto = {
      name: patch.name,
      description: patch.description,
      expenseDate: patch.expenseDate,
      expenseItems: patch.expenseItems,
      remarks: patch.remarks,
      status: patch.status,
      payerId: patch.payerId,
    };
    return this.expenseApi.expenseControllerUpdateExpense({ id, body }).pipe(
      map(response => mapExpenseDtoToExpense(response.responsePayload)),
    );
  }

  approveAndSettle(expenseId: string, settlementAccountId: string): Observable<Expense> {
    return this.fetchExpenseById(expenseId).pipe(
      switchMap(expense => {
        if (!expense) {
          throw new Error(`Expense ${expenseId} was not found`);
        }
        if (expense.status === 'SUBMITTED') {
          return this.expenseApi.expenseControllerFinalizeExpense({ id: expenseId }).pipe(
            switchMap(() => this.settleExpense(expenseId, settlementAccountId)),
          );
        }
        if (expense.status === 'FINALIZED') {
          return this.settleExpense(expenseId, settlementAccountId);
        }
        throw new Error(`Cannot approve and settle expense in status ${expense.status}`);
      }),
    );
  }

  sendBackExpense(id: string, remarks: string): Observable<Expense> {
    return this.updateExpense(id, { status: 'SEND_BACK', remarks });
  }

  fetchPayerWallet(payerId?: string): Observable<Account | undefined> {
    if (!payerId) return of(undefined);
    return this.accountApi.accountControllerListAccounts({
      type: ['WALLET'],
      status: ['ACTIVE'],
      accountHolderId: payerId,
      pageIndex: 0,
      pageSize: 1,
      includePaymentDetail: 'Y',
      includeBalance: 'Y',
    }).pipe(
      map(response => response.responsePayload.items?.[0]),
      map(account => account ? mapAccountDtoToAccount(account) : undefined),
      catchError(() => of(undefined)),
    );
  }

  fetchDocuments(expenseId: string): Observable<import('src/app/shared/models/document.model').Doc[]> {
    return this.dmsApi.dms2ControllerListDocuments({
      entityType: 'EXPENSE',
      entityId: expenseId,
    }).pipe(
      map(response => (response.responsePayload?.data ?? []).map(mapDocDtoToDoc)),
      catchError(() => of([])),
    );
  }

  fetchRefData(): Observable<ExpenseRefDataDto | undefined> {
    return this.expenseApi.expenseControllerGetExpenseReferenceData().pipe(
      map(response => response.responsePayload ?? undefined),
    );
  }

  fetchMemberOptions(): Observable<FieldOption[]> {
    return this.usersApi.userControllerListUsers({ status: 'ACTIVE' }).pipe(
      map(response => (response.responsePayload?.items ?? [])
        .filter(user => !!user.id)
        .map(user => ({
          key: user.id!,
          label: user.fullName?.trim() || user.email?.trim() || user.id!,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))),
      catchError(() => of([])),
    );
  }

  /** Expense events are activities, labelled with the project they belong to. */
  fetchEventOptions(): Observable<FieldOption[]> {
    return forkJoin({
      projects: this.projectApi.projectControllerListProjects({
        pageIndex: 0,
        pageSize: 100,
      }),
      activities: this.projectApi.projectControllerListAllActivities({
        pageIndex: 0,
        pageSize: 500,
      }),
    }).pipe(
      map(({ projects, activities }) => {
        const projectLabels = new Map(
          (projects.responsePayload?.items ?? [])
            .map(project => [project.id, `${project.code} · ${project.name}`]),
        );
        return (activities.responsePayload?.items ?? [])
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

  private settleExpense(expenseId: string, settlementAccountId: string): Observable<Expense> {
    return this.expenseApi.expenseControllerSettleExpense({
      id: expenseId,
      accountId: settlementAccountId,
    }).pipe(
      map(response => mapExpenseDtoToExpense(response.responsePayload)),
    );
  }
}
