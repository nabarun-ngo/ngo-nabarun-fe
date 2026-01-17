
import { Injectable } from '@angular/core';
import { forkJoin, map, of, Observable, switchMap, catchError } from 'rxjs';
import {
  AccountControllerService,
  UserControllerService,
  ExpenseControllerService,
  DmsControllerService,
  ProjectControllerService,
  EarningControllerService
} from 'src/app/core/api-client/services';
import { date } from 'src/app/core/service/utilities.service';
import { AccountDefaultValue } from '../finance.const';
import {
  Account,
  PagedAccounts,
  Expense,
  PagedExpenses,
  Transaction,
  PagedTransactions,
  mapAccountDtoToAccount,
  mapPagedAccountDtoToPagedAccounts,
  mapExpenseDtoToExpense,
  mapPagedExpenseDtoToPagedExpenses,
  mapPagedTransactionDtoToPagedTransactions,
  mapTransactionDtoToTransaction,
  BankDetail,
  UpiDetail,
  ExpenseItem
} from '../model';
import { CreateExpenseDto, DmsUploadDto, EarningDetailDto, TransactionDetailDto, UpdateExpenseDto } from 'src/app/core/api-client/models';
import { User } from '../../member/models/member.model';
import { mapPagedUserDtoToPagedUser, mapUserDtoToUser } from '../../member/models/member.mapper';
import { FileUpload } from 'src/app/shared/components/generic/file-upload/file-upload.component';
import { mapDocDtoToDoc } from 'src/app/shared/model/document.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  constructor(
    private accountController: AccountControllerService,
    private userController: UserControllerService,
    private expenseController: ExpenseControllerService,
    private dmsController: DmsControllerService,
    // private projectController: ProjectControllerService,
  ) { }

  /**
   * Fetch all accounts (no pagination)
   * @returns Observable of all accounts (domain model)
   */
  fetchAllAccounts(): Observable<PagedAccounts> {
    return this.accountController
      .listAccounts({
        pageIndex: 0,
        pageSize: 100000,
        includeBalance: true,
        includePaymentDetail: true
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapPagedAccountDtoToPagedAccounts)
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

  /**
   * Fetch current user's accounts
   * @param pageIndex Page index (0-based)
   * @param pageSize Page size
   * @param filter Additional filter options
   * @returns Observable of paged account results (domain model)
   */
  fetchMyAccounts(
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      accountId?: string;
      status?: Array<'ACTIVE' | 'INACTIVE' | 'BLOCKED'>;
      type?: Array<'PRINCIPAL' | 'GENERAL' | 'DONATION' | 'PUBLIC_DONATION'>;
    }
  ): Observable<PagedAccounts> {
    return this.accountController
      .listSelfAccounts({
        pageIndex: pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: pageSize ?? AccountDefaultValue.pageSize,
        includeBalance: true,
        includePaymentDetail: true,
        ...filter
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapPagedAccountDtoToPagedAccounts)
      );
  }

  /**
   * Update account details (admin operation)
   * @param id Account ID
   * @param value Update data with account status
   * @returns Observable of updated account (domain model)
   */
  updateAccountDetail(id: string, value: { status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' }): Observable<Account> {
    return this.accountController
      .updateAccount({
        id: id,
        body: {
          accountStatus: value.status
        }
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapAccountDtoToAccount)
      );
  }

  /**
   * Update banking and UPI details for own account
   * @param id Account ID
   * @param banking Bank details
   * @param upi UPI details
   * @returns Observable of updated account (domain model)
   */
  updateBankingAndUPIDetail(id: string, banking: BankDetail, upi: UpiDetail): Observable<Account> {
    return this.accountController
      .updateSelf({
        id: id,
        body: {
          bankDetail: banking,
          upiDetail: upi
        }
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapAccountDtoToAccount)
      );
  }

  /**
   * Create a new account
   * @param accountDetail Account creation data
   * @param banking Optional bank details
   * @param upi Optional UPI details
   * @returns Observable of created account (domain model)
   */
  createAccount(accountDetail: Account, banking?: BankDetail, upi?: UpiDetail): Observable<Account> {
    return this.accountController
      .createAccount({
        body: {
          currency: 'INR',
          name: `${accountDetail.accountType} Account`,
          initialBalance: accountDetail.openingBalance,
          type: accountDetail.accountType,
          accountHolderId: accountDetail.accountHolder,
          ...(banking && { bankDetail: banking }),
          ...(upi && { upiDetail: upi })
        }
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapAccountDtoToAccount)
      );
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

  /**
   * Fetch transactions for an account (admin operation)
   * @param id Account ID
   * @param pageIndex Page index (0-based)
   * @param pageSize Page size
   * @param filter Additional filter options
   * @returns Observable of paged transaction results (domain model)
   */
  fetchTransactions(
    id: string,
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      startDate?: Date | string;
      endDate?: Date | string;
    }
  ): Observable<PagedTransactions> {
    return this.accountController
      .listAccountTransactions({
        id: id,
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
        })
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapPagedTransactionDtoToPagedTransactions)
      );
  }

  /**
   * Fetch transactions for own account
   * @param id Account ID
   * @param pageIndex Page index (0-based)
   * @param pageSize Page size
   * @param filter Additional filter options
   * @returns Observable of paged transaction results (domain model)
   */
  fetchMyTransactions(
    id: string,
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      startDate?: Date | string;
      endDate?: Date | string;
    }
  ): Observable<PagedTransactions> {
    return this.accountController
      .listSelfAccountTransactions({
        id: id,
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
        })
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapPagedTransactionDtoToPagedTransactions)
      );
  }

  /**
   * Perform transfer between accounts
   * @param from Source account (domain model)
   * @param value Transfer details
   * @returns Observable of transaction result
   */
  performTransfer(from: Account, value: any, document_list: FileUpload[]): Observable<Transaction> {
    return this.accountController.transferAmountSelf({
      id: from.id,
      body: {
        amount: value.amount,
        toAccountId: value.transferTo,
        description: value.description,
        transferDate: value.transferDate,
      }
    }).pipe(
      map(response => response.responsePayload),
      switchMap((transaction: TransactionDetailDto) => {
        if (!document_list || document_list.length === 0) {
          return of(mapTransactionDtoToTransaction(transaction));
        }

        const uploadRequests = document_list.map(doc => {
          return this.dmsController.uploadFile({
            body: {
              contentType: doc.detail.contentType,
              fileBase64: doc.detail.base64Content,
              filename: doc.detail.originalFileName,
              documentMapping: [{
                entityId: transaction.txnId,
                entityType: 'TRANSACTION'
              }]
            }
          });
        });

        return forkJoin(uploadRequests).pipe(map(() => transaction));
      }),
      map(mapTransactionDtoToTransaction),
    );
  }

  reverseTransaction(accId: string, txnId: string, reasonForReversal: string) {
    return this.accountController.reverseTransaction({
      id: accId,
      body: {
        comment: reasonForReversal,
        transactionId: txnId
      }
    }).pipe(
      map(response => response.responsePayload),
      map(mapTransactionDtoToTransaction)
    );
  }

  /**
   * Add money to account
   * @param accountTo Target account (domain model)
   * @param value Money in details
   * @returns Observable of transaction result
   */
  performMoneyIn(accountTo: Account, value: any, document_list: FileUpload[]): Observable<any> {
    return this.accountController.addFundSelf({
      id: accountTo.id,
      body: {
        amount: value.amount,
        description: value.description,
        transferDate: value.inDate,
      }
    }).pipe(
      map(response => response.responsePayload),
      switchMap((transaction: TransactionDetailDto) => {
        if (!document_list || document_list.length === 0) {
          return of(mapTransactionDtoToTransaction(transaction));
        }

        const uploadRequests = document_list.map(doc => {
          return this.dmsController.uploadFile({
            body: {
              contentType: doc.detail.contentType,
              fileBase64: doc.detail.base64Content,
              filename: doc.detail.originalFileName,
              documentMapping: [{
                entityId: transaction.txnId!,
                entityType: 'TRANSACTION'
              }]
            }
          }).pipe(
            catchError(err => {
              console.error('File upload failed', err);
              return of(null); // swallow error
            })
          )
        });

        return forkJoin(uploadRequests).pipe(map(() => transaction));
      }),
    );
  }

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


  getExpenseDocuments(id: string) {
    return this.dmsController
      .getDocuments({ id: id, type: 'EXPENSE' })
      .pipe(map((d) => d.responsePayload), map(d => d.map(mapDocDtoToDoc)));
  }

  getTransactionDocuments(id: string) {
    return this.dmsController
      .getDocuments({ id: id, type: 'TRANSACTION' })
      .pipe(map((d) => d.responsePayload), map(d => d.map(mapDocDtoToDoc)));
  }

  getReferenceData() {
    return this.accountController
      .getAccountReferenceData()
      .pipe(map((d) => d.responsePayload));
  }
}
