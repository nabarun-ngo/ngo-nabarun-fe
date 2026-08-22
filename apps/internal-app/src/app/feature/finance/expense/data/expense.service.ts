import { Injectable } from '@angular/core';
import { AccountService as AccountApiService, DmsService, ExpenseService as ExpenseApiService, UsersService } from 'src/app/core/api/api-client/services';
import type { Expense, ExpenseItem, ExpenseStatus, PagedExpenses } from '../domain';
import { mapExpenseDtoToExpense, mapPagedExpenseDtoToPagedExpenses } from './expense-data.mapper';
import type { PagedAccounts } from '../../accounts/domain';
import { mapPagedAccountDtoToPagedAccounts } from '../../accounts/data/account-api.mapper';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { AccountDefaultValue } from '../../finance.const';
import { date } from 'src/app/shared/utils/utilities.service';
import { CreateExpenseDto, ExpenseRefDataDto, UpdateExpenseDto, UploadDocumentRequestDto } from 'src/app/core/api/api-client/models';
import { mapDocDtoToDoc } from 'src/app/shared/models/document.model';
import { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { mapUserDtoToUser } from 'src/app/feature/member/data/member-data.mapper';
import { User } from 'src/app/feature/member/domain';
import { ApiPagedResult } from 'src/app/shared/models/paged-result.model';

function normalizePaged<T>(payload: any): ApiPagedResult<T> {
  return {
    content: payload?.items ?? payload?.content ?? [],
    totalSize: payload?.total ?? payload?.totalSize ?? 0,
    pageIndex: payload?.pageIndex ?? 0,
    pageSize: payload?.pageSize ?? 0,
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(
    private readonly expenseApi: ExpenseApiService,
    private readonly dmsApi: DmsService,
    private usersApi: UsersService,
    private accountApi: AccountApiService,
  ) { }

  fetchExpenses(
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      startDate?: Date | string;
      endDate?: Date | string;
      expenseId?: string;
      expenseRefId?: string;
      expenseStatus?: ExpenseStatus[];
      payerId?: string;
    }
  ): Observable<PagedExpenses> {
    return this.expenseApi
      .expenseControllerListExpenses({
        pageIndex: pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: pageSize ?? AccountDefaultValue.pageSize,
        ...(filter?.startDate && {
          startDate: typeof filter.startDate === 'string'
            ? filter.startDate
            : date(filter.startDate.toISOString().split('T')[0], 'yyyy-MM-dd')
        }),
        ...(filter?.endDate && {
          endDate: typeof filter.endDate === 'string'
            ? filter.endDate
            : date(filter.endDate.toISOString().split('T')[0], 'yyyy-MM-dd')
        }),
        ...(filter?.expenseId && { expenseId: filter.expenseId }),
        ...(filter?.expenseRefId && { expenseRefId: filter.expenseRefId }),
        ...(filter?.expenseStatus && { expenseStatus: filter.expenseStatus }),
        ...(filter?.payerId && { payerId: filter.payerId })
      })
      .pipe(
        map((d) => d.responsePayload),
        map(payload => mapPagedExpenseDtoToPagedExpenses(normalizePaged(payload) as any))
      );
  }

  fetchMyExpenses(
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      startDate?: Date | string;
      endDate?: Date | string;
      expenseId?: string;
      expenseRefId?: string;
      expenseStatus?: ExpenseStatus[];
      payerId?: string;
    }
  ): Observable<PagedExpenses> {
    return this.expenseApi
      .expenseControllerListSelfExpenses({
        pageIndex: pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: pageSize ?? AccountDefaultValue.pageSize,
        ...(filter?.startDate && {
          startDate: typeof filter.startDate === 'string'
            ? filter.startDate
            : date(filter.startDate.toISOString().split('T')[0], 'yyyy-MM-dd')
        }),
        ...(filter?.endDate && {
          endDate: typeof filter.endDate === 'string'
            ? filter.endDate
            : date(filter.endDate.toISOString().split('T')[0], 'yyyy-MM-dd')
        }),
        ...(filter?.expenseId && { expenseId: filter.expenseId }),
        ...(filter?.expenseRefId && { expenseRefId: filter.expenseRefId }),
        ...(filter?.expenseStatus && { expenseStatus: filter.expenseStatus }),
        ...(filter?.payerId && { payerId: filter.payerId })
      })
      .pipe(
        map((d) => d.responsePayload),
        map(payload => mapPagedExpenseDtoToPagedExpenses(normalizePaged(payload) as any))
      );
  }

  createExpenses(detail: Expense): Observable<Expense> {
    const expenseDetail: CreateExpenseDto = {
      description: detail.description || '',
      name: detail.name || '',
      expenseRefType: detail.expenseRefType as any,
      expenseRefId: detail.expenseRefId,
      expenseDate: detail.expenseDate,
      expenseItems: detail.expenseItems,
      payerId: detail.payerId || ''
    };
    return this.expenseApi
      .expenseControllerCreateExpense({ body: expenseDetail })
      .pipe(
        map((d) => d.responsePayload),
        map(mapExpenseDtoToExpense)
      );
  }

  updateExpense(id: string, expense: Expense): Observable<Expense> {
    if (expense.status === 'FINALIZED') {
      return this.expenseApi
        .expenseControllerFinalizeExpense({ id })
        .pipe(
          map((d) => d.responsePayload),
          map(mapExpenseDtoToExpense)
        );
    }
    if (expense.status === 'SETTLED') {
      return this.expenseApi
        .expenseControllerSettleExpense({ id, accountId: expense.settlementAccountId! })
        .pipe(
          map((d) => d.responsePayload),
          map(mapExpenseDtoToExpense)
        );
    }
    const expenseDetailDto: UpdateExpenseDto = {
      name: expense.name,
      description: expense.description,
      expenseDate: expense.expenseDate,
      expenseItems: expense.expenseItems,
      remarks: expense.remarks,
      status: expense.status,
      payerId: expense.payerId
    };
    return this.expenseApi
      .expenseControllerUpdateExpense({ id, body: expenseDetailDto })
      .pipe(
        map((d) => d.responsePayload),
        map(mapExpenseDtoToExpense)
      );
  }

  createExpenseItem(id: string, data: any) {
    return this.expenseApi
      .expenseControllerUpdateExpense({
        id: id,
        body: {
          expenseItems: [
            {
              itemName: data.itemName,
              description: data.description,
              amount: data.amount,
            },
          ],
        } as any,
      })
      .pipe(map((d) => d.responsePayload));
  }

  updateExpenseItem(id: string, data: ExpenseItem[]): Observable<Expense> {
    return this.expenseApi
      .expenseControllerUpdateExpense({
        id: id,
        body: {
          expenseItems: data,
        } as any,
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapExpenseDtoToExpense)
      );
  }

  fetchAccounts(options?: {
    type?: Array<'BANK' | 'INVESTMENT' | 'WALLET'>;
    status?: Array<'ACTIVE' | 'CLOSED'>;
    accountId?: string;
    accountHolderId?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Observable<PagedAccounts> {
    return this.accountApi
      .accountControllerListAccounts({
        pageIndex: options?.pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: options?.pageSize ?? AccountDefaultValue.pageSize,
        accountHolderId: options?.accountHolderId,
        accountId: options?.accountId,
        status: options?.status ?? ['ACTIVE'],
        includePaymentDetail: 'Y',
        includeBalance: 'Y',
        type: options?.type ?? [],
      } as any)
      .pipe(
        map((d) => d.responsePayload),
        map(payload => mapPagedAccountDtoToPagedAccounts(normalizePaged(payload) as any))
      );
  }

  getExpenseDocuments(id: string) {
    return this.dmsApi
      .dms2ControllerListDocuments({ entityType: 'EXPENSE', entityId: id })
      .pipe(map((d) => d.responsePayload?.data ?? []), map(d => d.map(mapDocDtoToDoc)));
  }

  fetchUsers(_accountType?: string): Observable<User[]> {
    return this.usersApi
      .userControllerListUsers({
        status: 'ACTIVE',
      })
      .pipe(
        map((d) => d.responsePayload),
        map((m) => (normalizePaged(m).content ?? []).map((u) => mapUserDtoToUser(u)))
      );
  }

  uploadDocuments(documents: FileUpload[], docIndexId: string, docIndexType: string) {
    const requests = documents.map(doc => {
      const body: UploadDocumentRequestDto = {
        fileName: doc.detail.originalFileName,
        fileBase64: doc.detail.base64Content,
        contentType: doc.detail.contentType,
        mappings: [{
          entityId: docIndexId,
          entityType: docIndexType
        }]
      };
      return this.dmsApi.dms2ControllerUploadDocument({ body }).pipe(map(d => d.responsePayload));
    });
    return forkJoin(requests);
  }

  getReferenceData(): Observable<ExpenseRefDataDto> {
    return this.expenseApi.expenseControllerGetExpenseReferenceData().pipe(map(d => d.responsePayload!));
  }

  fetchExpenseById(id: string): Observable<Expense> {
    return this.expenseApi
      .expenseControllerGetExpenseById({ id })
      .pipe(
        map(d => d.responsePayload),
        map(mapExpenseDtoToExpense)
      );
  }

  /** Chain finalize (when SUBMITTED) then settle — interim until B1 approve-and-settle endpoint. */
  approveAndSettle(expenseId: string, settlementAccountId: string): Observable<Expense> {
    return this.fetchExpenseById(expenseId).pipe(
      switchMap(expense => {
        if (expense.status === 'SUBMITTED') {
          return this.expenseApi.expenseControllerFinalizeExpense({ id: expenseId }).pipe(
            map(d => d.responsePayload),
            map(mapExpenseDtoToExpense),
            switchMap(() =>
              this.expenseApi.expenseControllerSettleExpense({
                id: expenseId,
                accountId: settlementAccountId,
              }).pipe(
                map(d => d.responsePayload),
                map(mapExpenseDtoToExpense),
              ),
            ),
          );
        }
        if (expense.status === 'FINALIZED') {
          return this.expenseApi.expenseControllerSettleExpense({
            id: expenseId,
            accountId: settlementAccountId,
          }).pipe(
            map(d => d.responsePayload),
            map(mapExpenseDtoToExpense),
          );
        }
        throw new Error(`Cannot approve and settle expense in status ${expense.status}`);
      }),
    );
  }

  sendBackExpense(id: string, remarks: string): Observable<Expense> {
    return this.updateExpense(id, { status: 'SEND_BACK', remarks } as Expense);
  }

}
