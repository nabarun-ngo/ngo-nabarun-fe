
import { Injectable } from '@angular/core';
import { forkJoin, map, of } from 'rxjs';
import {
  AccountControllerService,
  UserControllerService,
  ExpenseControllerService,
  DmsControllerService
} from 'src/app/core/api-client/services';
import {
  AccountDetailDto,
  BankDetailDto,
  UpiDetailDto,
  ExpenseDetailDto,
  ExpenseItemDetailDto,
  DmsUploadDto,
  TransactionDetailDto,
  CreateExpenseDto,
  CreateAccountDto
} from 'src/app/core/api-client/models';
import { date } from 'src/app/core/service/utilities.service';
import { AccountDefaultValue } from './account.const';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(
    private accountController: AccountControllerService,
    private userController: UserControllerService,
    private expenseController: ExpenseControllerService,
    private dmsController: DmsControllerService
  ) { }

  fetchAllAccounts() {
    return this.accountController
      .listAccounts({ pageIndex: 0, pageSize: 100000 })
      .pipe(map((d) => d.responsePayload));
  }

  fetchAccounts(
    options: {
      type?: string[];
      status?: string[];
      accountId?: string;
      accountHolderId?: string;
      pageIndex?: number;
      pageSize?: number;
    }
  ) {
    return this.accountController
      .listAccounts({
        pageIndex: options.pageIndex || AccountDefaultValue.pageNumber,
        pageSize: options.pageSize || AccountDefaultValue.pageSize,
        accountHolderId: options.accountHolderId || undefined,
        accountId: options.accountId || undefined,
        status: options.status ? [...options.status as any] : ['ACTIVE'],
        includeBalance: true,
        includePaymentDetail: true,
        type: options.type ? [...options.type as any] : [],
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchMyAccounts(
    pageIndex?: number,
    pageSize?: number,
    filter?: any
  ) {
    const params: any = {
      pageIndex: pageIndex,
      pageSize: pageSize
    };
    if (filter) {
      Object.assign(params, filter);
    }
    if (params.includeBalance === undefined) params.includeBalance = true;
    if (params.includePaymentDetail === undefined) params.includePaymentDetail = true;

    return this.accountController
      .listSelfAccounts(params)
      .pipe(map((d) => d.responsePayload));
  }

  updateAccountDetail(id: string, value: any) {
    return this.accountController
      .updateAccount({
        id: id,
        body: {
          accountStatus: value.status,
        } as any,
      })
      .pipe(map((d) => d.responsePayload));
  }

  updateBankingAndUPIDetail(id: string, banking: BankDetailDto, upi: UpiDetailDto) {
    return this.accountController
      .updateSelf({
        id: id,
        body: {
          bankDetail: banking,
          upiDetail: upi,
        } as any,
      })
      .pipe(map((d) => d.responsePayload));
  }

  createAccount(accountDetail: CreateAccountDto, banking?: BankDetailDto, upi?: UpiDetailDto) {
    return this.accountController
      .createAccount({ body: accountDetail })
      .pipe(map((d) => d.responsePayload));
  }

  fetchUsers(accountType?: string) {
    let filter: any = { status: ['ACTIVE'] };

    if (accountType == 'DONATION') {
      filter.roleCodes = ['ASSISTANT_CASHIER', 'CASHIER'];
    } else if (accountType && accountType !== 'PUBLIC_DONATION') {
      filter.roleCodes = ['TREASURER'];
    }

    // Use listUsers and flattened params
    return this.userController
      .listUsers({
        status: filter.status,
        roleCodes: filter.roleCodes
      } as any)
      .pipe(map((d) => d.responsePayload));
  }

  fetchTransactions(
    id: string,
    pageIndex?: number,
    pageSize?: number,
    filter?: any
  ) {
    const params: any = {
      id: id,
      pageIndex: pageIndex,
      pageSize: pageSize
    };
    if (filter) {
      Object.assign(params, filter);
      if (filter.endDate) {
        params.endDate = date(filter.endDate, 'yyyy-MM-dd');
      }
      if (filter.startDate) {
        params.startDate = date(filter.startDate, 'yyyy-MM-dd');
      }
    }

    return this.accountController
      .listAccountTransactions(params)
      .pipe(map((d) => d.responsePayload));
  }

  fetchMyTransactions(
    id: string,
    pageIndex?: number,
    pageSize?: number,
    filter?: any
  ) {
    const params: any = {
      id: id,
      pageIndex: pageIndex,
      pageSize: pageSize
    };
    if (filter) {
      Object.assign(params, filter);
      if (filter.endDate) {
        params.endDate = date(filter.endDate, 'yyyy-MM-dd');
      }
      if (filter.startDate) {
        params.startDate = date(filter.startDate, 'yyyy-MM-dd');
      }
    }
    return this.accountController
      .listSelfAccountTransactions(params)
      .pipe(map((d) => d.responsePayload));
  }

  performTransfer(from: AccountDetailDto, value: any) {
    console.warn('performTransfer: createTransaction API is missing');
    return of(null).pipe(map(() => null as any));
  }

  performMoneyIn(accountTo: AccountDetailDto, value: any) {
    console.warn('performMoneyIn: createTransaction API is missing');
    return of(null).pipe(map(() => null as any));
  }

  fetchExpenses(
    pageNumber?: number,
    pageSize?: number,
    filter?: any
  ) {
    const params: any = {
      pageIndex: pageNumber,
      pageSize: pageSize
    };
    if (filter) {
      Object.assign(params, filter);
      if (filter.endDate) {
        params.endDate = date(filter.endDate, 'yyyy-MM-dd');
      }
      if (filter.startDate) {
        params.startDate = date(filter.startDate, 'yyyy-MM-dd');
      }
    }
    return this.expenseController
      .listExpenses(params)
      .pipe(map((d) => d.responsePayload));
  }

  fetchMyExpenses(
    pageNumber?: number,
    pageSize?: number,
    filter?: any
  ) {
    const params: any = {
      pageIndex: pageNumber,
      pageSize: pageSize
    };
    if (filter) {
      Object.assign(params, filter);
      if (filter.endDate) {
        params.endDate = date(filter.endDate, 'yyyy-MM-dd');
      }
      if (filter.startDate) {
        params.startDate = date(filter.startDate, 'yyyy-MM-dd');
      }
    }
    return this.expenseController
      .listSelfExpenses(params)
      .pipe(map((d) => d.responsePayload));
  }

  createExpenses(detail: CreateExpenseDto) {
    return this.expenseController
      .createExpense({ body: detail })
      .pipe(map((d) => d.responsePayload));
  }

  updateExpense(id: string, expense: ExpenseDetailDto) {
    if (expense.status == 'FINALIZED') {
      return this.expenseController
        .finalizeExpense({ id: id })
        .pipe(map((d) => d.responsePayload));
    }
    if (expense.status == 'SETTLED') {
      return this.expenseController
        .settleExpense({ id: id })
        .pipe(map((d) => d.responsePayload));
    }
    return this.expenseController
      .updateExpense({ id: id, body: expense })
      .pipe(map((d) => d.responsePayload));
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

  updateExpenseItem(id: string, data: ExpenseItemDetailDto[]) {
    return this.expenseController
      .updateExpense({
        id: id,
        body: {
          expenseItems: data,
        } as any,
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchEvents() {
    return of([] as any);
  }

  uploadDocuments(documents: any[]) {
    const requests = documents.map(doc => {
      const body: DmsUploadDto = {
        filename: doc.fileName,
        fileBase64: doc.fileBase64,
        contentType: doc.fileType,
        documentMapping: [{
          entityId: doc.docIndexId,
          entityType: doc.docIndexType
        }]
      };
      return this.dmsController.uploadFile({ body }).pipe(map(d => d.responsePayload));
    });
    return forkJoin(requests);
  }

  getExpenseDocuments(id: string) {
    return this.dmsController
      .getDocuments({ id: id, type: 'EXPENSE' as any })
      .pipe(map((d) => d.responsePayload));
  }

  getTransactionDocuments(id: string) {
    return this.dmsController
      .getDocuments({ id: id, type: 'TRANSACTION' as any })
      .pipe(map((d) => d.responsePayload));
  }
}
