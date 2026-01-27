import { Injectable } from '@angular/core';
import { AccountControllerService, DmsControllerService, ExpenseControllerService, UserControllerService } from 'src/app/core/api-client/services';
import { Expense, ExpenseItem, mapExpenseDtoToExpense, mapPagedAccountDtoToPagedAccounts, mapPagedExpenseDtoToPagedExpenses, PagedAccounts, PagedExpenses } from '../model';
import { forkJoin, map, Observable } from 'rxjs';
import { AccountDefaultValue } from '../finance.const';
import { date } from 'src/app/core/service/utilities.service';
import { CreateExpenseDto, DmsUploadDto, UpdateExpenseDto } from 'src/app/core/api-client/models';
import { mapDocDtoToDoc } from 'src/app/shared/model/document.model';
import { FileUpload } from 'src/app/shared/components/generic/file-upload/file-upload.component';
import { mapUserDtoToUser } from '../../member/models/member.mapper';
import { User } from '../../member/models/member.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(
    private readonly expenseController: ExpenseControllerService,
    private readonly dmsController: DmsControllerService,
    private userController: UserControllerService,
    private accountController: AccountControllerService,

  ) { }


  /**
   * Fetch expenses (admin operation)
   * @param pageIndex Page index (0-based)
   * @param pageSize Page size
   * @param filter Additional filter options
   * @returns Observable of paged expense results
   */
  fetchExpenses(
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      startDate?: Date | string;
      endDate?: Date | string;
      expenseId?: string;
      expenseRefId?: string;
      expenseStatus?: Array<'DRAFT' | 'SUBMITTED' | 'FINALIZED' | 'SETTLED' | 'REJECTED'>;
      payerId?: string;
    }
  ): Observable<PagedExpenses> {
    return this.expenseController
      .listExpenses({
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
        map(mapPagedExpenseDtoToPagedExpenses)
      );
  }

  /**
   * Fetch current user's expenses
   * @param pageIndex Page index (0-based)
   * @param pageSize Page size
   * @param filter Additional filter options
   * @returns Observable of paged expense results
   */
  fetchMyExpenses(
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      startDate?: Date | string;
      endDate?: Date | string;
      expenseId?: string;
      expenseRefId?: string;
      expenseStatus?: Array<'DRAFT' | 'SUBMITTED' | 'FINALIZED' | 'SETTLED' | 'REJECTED'>;
      payerId?: string;
    }
  ): Observable<PagedExpenses> {
    return this.expenseController
      .listSelfExpenses({
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
        map(mapPagedExpenseDtoToPagedExpenses)
      );
  }

  /**
   * Create a new expense
   * @param detail Expense creation data
   * @returns Observable of created expense (domain model)
   */
  createExpenses(detail: Expense): Observable<Expense> {
    let expenseDetail: CreateExpenseDto = {
      description: detail.description || '',
      name: detail.name || '',
      expenseRefType: detail.expenseRefType as any,
      expenseRefId: detail.expenseRefId,
      expenseDate: detail.expenseDate,
      expenseItems: detail.expenseItems,
      payerId: detail.payerId || ''
    };
    return this.expenseController
      .createExpense({ body: expenseDetail })
      .pipe(
        map((d) => d.responsePayload),
        map(mapExpenseDtoToExpense)
      );
  }

  /**
   * Update expense details or change status
   * @param id Expense ID
   * @param expense Expense data (API model - components should use ExpenseDetailDto)
   * @returns Observable of updated expense (domain model)
   */
  updateExpense(id: string, expense: Expense): Observable<Expense> {

    if (expense.status === 'FINALIZED') {
      return this.expenseController
        .finalizeExpense({ id })
        .pipe(
          map((d) => d.responsePayload),
          map(mapExpenseDtoToExpense)
        );
    }
    if (expense.status === 'SETTLED') {
      return this.expenseController
        .settleExpense({ id, accountId: expense.settlementAccountId! })
        .pipe(
          map((d) => d.responsePayload),
          map(mapExpenseDtoToExpense)
        );
    }
    let expenseDetailDto: UpdateExpenseDto = {
      name: expense.name,
      description: expense.description,
      expenseDate: expense.expenseDate,
      expenseItems: expense.expenseItems,
      remarks: expense.remarks,
      status: expense.status,
      payerId: expense.payerId
    };
    return this.expenseController
      .updateExpense({ id, body: expenseDetailDto })
      .pipe(
        map((d) => d.responsePayload),
        map(mapExpenseDtoToExpense)
      );
  }

  createExpenseItem(id: string, data: any) {
    return this.expenseController
      .updateExpense({
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
    return this.expenseController
      .updateExpense({
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

  /**
    * Fetch accounts with filtering and pagination
    * @param options Filter and pagination options
    * @returns Observable of paged account results (domain model)
    */
  fetchAccounts(options?: {
    type?: Array<'PRINCIPAL' | 'GENERAL' | 'DONATION' | 'PUBLIC_DONATION' | 'WALLET'>;
    status?: Array<'ACTIVE' | 'INACTIVE' | 'BLOCKED'>;
    accountId?: string;
    accountHolderId?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Observable<PagedAccounts> {
    return this.accountController
      .listAccounts({
        pageIndex: options?.pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: options?.pageSize ?? AccountDefaultValue.pageSize,
        accountHolderId: options?.accountHolderId,
        accountId: options?.accountId,
        status: options?.status ?? ['ACTIVE'],
        includeBalance: true,
        includePaymentDetail: true,
        type: options?.type ?? []
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapPagedAccountDtoToPagedAccounts)
      );
  }

  getExpenseDocuments(id: string) {
    return this.dmsController
      .getDocuments({ id: id, type: 'EXPENSE' })
      .pipe(map((d) => d.responsePayload), map(d => d.map(mapDocDtoToDoc)));
  }

  /**
   * Fetch users based on account type
   * @param accountType Type of account to filter users by role
   * @returns Observable of paged user results
   */
  fetchUsers(accountType?: string): Observable<User[]> {
    const filter: { status: Array<'ACTIVE' | 'INACTIVE' | 'BLOCKED'>; roleCodes?: string[] } = {
      status: ['ACTIVE'],
    };

    if (accountType === 'DONATION') {
      filter.roleCodes = ['ASSISTANT_CASHIER', 'CASHIER'];
    } else if (accountType == 'PRINCIPAL') {
      filter.roleCodes = ['TREASURER'];
    }

    return this.userController
      .listUsers({
        status: filter.status as any,
        roleCodes: filter.roleCodes,
        pageIndex: 0,
        pageSize: 10000
      })
      .pipe(
        map((d) => d.responsePayload),
        map((m) => m.content?.map(mapUserDtoToUser))
      );
  }

  uploadDocuments(documents: FileUpload[], docIndexId: string, docIndexType: string) {
    const requests = documents.map(doc => {
      const body: DmsUploadDto = {
        filename: doc.detail.originalFileName,
        fileBase64: doc.detail.base64Content,
        contentType: doc.detail.contentType,
        documentMapping: [{
          entityId: docIndexId,
          entityType: docIndexType as any
        }]
      };
      return this.dmsController.uploadFile({ body }).pipe(map(d => d.responsePayload));
    });
    return forkJoin(requests);
  }

}
