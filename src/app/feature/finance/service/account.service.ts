
import { Injectable } from '@angular/core';
import { forkJoin, map, of, Observable, switchMap, catchError } from 'rxjs';
import {
  AccountControllerService,
  UserControllerService,
  DmsControllerService
} from 'src/app/core/api-client/services';
import { date } from 'src/app/core/service/utilities.service';
import { AccountDefaultValue } from '../finance.const';
import {
  Account,
  PagedAccounts,
  Transaction,
  PagedTransactions,
  mapAccountDtoToAccount,
  mapPagedAccountDtoToPagedAccounts,
  mapPagedTransactionDtoToPagedTransactions,
  mapTransactionDtoToTransaction,
  BankDetail,
  UpiDetail
} from '../model';
import { DmsUploadDto, TransactionDetailDto } from 'src/app/core/api-client/models';
import { User } from '../../member/models/member.model';
import { mapUserDtoToUser } from '../../member/models/member.mapper';
import { FileUpload } from 'src/app/shared/components/generic/file-upload/file-upload.component';
import { mapDocDtoToDoc } from 'src/app/shared/model/document.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {


  constructor(
    private accountController: AccountControllerService,
    private userController: UserControllerService,
    private dmsController: DmsControllerService,
  ) { }

  /**
   * Fetch all accounts (no pagination)
   * @returns Observable of all accounts (domain model)
   */
  fetchAllAccounts(): Observable<PagedAccounts> {
    return this.accountController
      .listAccounts({
        status: ['ACTIVE'],
        includePaymentDetail: 'N'
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
    status?: Array<'ACTIVE' | 'CLOSED'>;
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
        includePaymentDetail: 'N',
        includeBalance: 'Y',
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
      status?: Array<'ACTIVE' | 'CLOSED'>;
      type?: Array<'PRINCIPAL' | 'GENERAL' | 'DONATION' | 'PUBLIC_DONATION'>;
    }
  ): Observable<PagedAccounts> {
    return this.accountController
      .listSelfAccounts({
        pageIndex: pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: pageSize ?? AccountDefaultValue.pageSize,
        includePaymentDetail: 'Y',
        includeBalance: 'Y',
        status: filter?.status ?? ['ACTIVE'],
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
  updateAccountDetail(id: string, value: { status: 'ACTIVE' | 'CLOSED' }): Observable<Account> {
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
      transactionRef?: string;
      txnType?: string | string[];
      txnStatus?: string | string[];
      txnId?: string;
      startDate?: Date | string;
      endDate?: Date | string;
    }
  ): Observable<PagedTransactions> {
    console.log(filter)
    return this.accountController
      .listAccountTransactions({
        id: id,
        pageIndex: pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: pageSize ?? AccountDefaultValue.pageSize,
        transactionRef: filter?.transactionRef,
        txnType: filter?.txnType as any,
        txnStatus: filter?.txnStatus as any,
        txnId: filter?.txnId,
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
      transactionRef?: string;
      txnType?: string | string[];
      txnStatus?: string | string[];
      txnId?: string;
    }
  ): Observable<PagedTransactions> {
    return this.accountController
      .listSelfAccountTransactions({
        id: id,
        pageIndex: pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: pageSize ?? AccountDefaultValue.pageSize,
        transactionRef: filter?.transactionRef,
        txnType: filter?.txnType as any,
        txnStatus: filter?.txnStatus as any,
        txnId: filter?.txnId,
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
                entityId: transaction.transactionRef,
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

  reverseTransaction(accId: string, txnRef: string, reasonForReversal: string) {
    return this.accountController.reverseTransaction({
      id: accId,
      body: {
        comment: reasonForReversal,
        transactionRef: txnRef
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
