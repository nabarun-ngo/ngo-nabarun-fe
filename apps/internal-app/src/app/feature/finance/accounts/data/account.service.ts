
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, of, Observable, switchMap, throwError } from 'rxjs';
import { SuccessResponseIfscDetailsDto } from 'src/app/core/api/api-client/models/success-response-ifsc-details-dto';
import {
  AccountService as AccountApiService,
  UsersService,
  DmsService
} from 'src/app/core/api/api-client/services';
import { date } from 'src/app/shared/utils/utilities.service';
import { AccountDefaultValue } from '../../finance.const';
import type {
  Account,
  AccountCreatePayload,
  AccountDetailsUpdatePayload,
  IfscDetails,
  PagedAccounts,
  PagedTransactions,
} from '../domain';
import {
  mapAccountDtoToAccount,
  mapPagedAccountDtoToPagedAccounts,
  mapBankDetailToApi,
  mapUpiDetailToApi,
} from './account-api.mapper';
import { mapPagedTransactionDtoToPagedTransactions } from './transaction-api.mapper';
import { UploadDocumentRequestDto } from 'src/app/core/api/api-client/models';
import { User } from 'src/app/feature/member/domain';
import { mapUserDtoToUser } from 'src/app/feature/member/data/member-data.mapper';
import { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { mapDocDtoToDoc } from 'src/app/shared/models/document.model';
import { ApiPagedResult } from 'src/app/shared/models/paged-result.model';
import { isIfscLookupResultValid } from '../config/account/account.ifsc';

function normalizePaged<T>(payload: any): ApiPagedResult<T> {
  return {
    content: payload?.items ?? payload?.content ?? [],
    totalSize: payload?.total ?? payload?.totalSize ?? 0,
    pageIndex: payload?.pageIndex ?? 0,
    pageSize: payload?.pageSize ?? 0,
  };
}

function buildAccountName(payload: AccountCreatePayload): string {
  if (payload.ownerType === 'ORG') {
    return `Nabarun ${payload.accountType} Account`;
  }
  return `${payload.accountType} Account`;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  constructor(
    private accountApi: AccountApiService,
    private usersApi: UsersService,
    private dmsApi: DmsService,
    private http: HttpClient,
  ) { }

  fetchAllAccounts(): Observable<PagedAccounts> {
    return this.accountApi
      .accountControllerListAccounts({
        status: ['ACTIVE'],
        includePaymentDetail: 'N'
      })
      .pipe(
        map((d) => d.responsePayload),
        map(payload => mapPagedAccountDtoToPagedAccounts(normalizePaged(payload) as any))
      );
  }

  fetchPayableAccounts(params?: {
    reference?: 'ADHOC' | 'ADVANCE_EV';
    fromAccountId?: string;
    purpose?: 'EARNING_INTEREST' | 'DONATION' | 'INVESTMENT_FUNDING';
  }): Observable<Account[]> {
    return this.accountApi
      .accountControllerPayableAccount({
        reference: params?.reference,
        fromAccountId: params?.fromAccountId,
        // Generated client may lag swagger; purpose is supported by the API.
        ...({ purpose: params?.purpose } as Record<string, string | undefined>),
      } as Parameters<typeof this.accountApi.accountControllerPayableAccount>[0])
      .pipe(
        map(res => res.responsePayload),
        map(accounts => (accounts ?? []).map(mapAccountDtoToAccount)),
      );
  }

  fetchAccounts(options?: {
    type?: Array<'BANK' | 'INVESTMENT' | 'WALLET'>;
    ownerType?: Array<'ORG' | 'INDIVIDUAL'>;
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
        includePaymentDetail: 'N',
        includeBalance: 'Y',
        type: options?.type ?? [],
        ownerType: options?.ownerType ?? [],
      } as any)
      .pipe(
        map((d) => d.responsePayload),
        map(payload => mapPagedAccountDtoToPagedAccounts(normalizePaged(payload) as any))
      );
  }

  fetchMyAccounts(
    pageIndex?: number,
    pageSize?: number,
    filter?: {
      accountId?: string;
      status?: Array<'ACTIVE' | 'CLOSED'>;
      type?: Array<'BANK' | 'INVESTMENT' | 'WALLET'>;
      ownerType?: Array<'ORG' | 'INDIVIDUAL'>;
    }
  ): Observable<PagedAccounts> {
    return this.accountApi
      .accountControllerListSelfAccounts({
        pageIndex: pageIndex ?? AccountDefaultValue.pageNumber,
        pageSize: pageSize ?? AccountDefaultValue.pageSize,
        includePaymentDetail: 'Y',
        includeBalance: 'Y',
        status: filter?.status ?? ['ACTIVE'],
        ...filter,
      } as any)
      .pipe(
        map((d) => d.responsePayload),
        map(payload => mapPagedAccountDtoToPagedAccounts(normalizePaged(payload) as any))
      );
  }

  updateAccountDetail(id: string, value: { status: 'ACTIVE' | 'CLOSED' }): Observable<Account> {
    return this.accountApi
      .accountControllerUpdateAccount({
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

  updateAccountDetails(id: string, payload: AccountDetailsUpdatePayload, options?: { isSelf?: boolean }): Observable<Account> {
    const body = {
      description: payload.description,
      bankDetail: payload.bankDetail ? mapBankDetailToApi(payload.bankDetail) : undefined,
      upiDetails: payload.upiDetails?.map(mapUpiDetailToApi),
    };
    const request$ = options?.isSelf === false
      ? this.accountApi.accountControllerUpdateAccount({ id, body })
      : this.accountApi.accountControllerUpdateSelf({ id, body });

    return request$.pipe(
      map((d) => d.responsePayload),
      map(mapAccountDtoToAccount),
    );
  }

  lookupIfsc(ifsc: string): Observable<IfscDetails> {
    const normalized = ifsc.trim().toUpperCase();
    const url = `${this.accountApi.rootUrl}/api/account/static/ifsc/${encodeURIComponent(normalized)}`;
    return this.http.get<SuccessResponseIfscDetailsDto>(url, {
      headers: { hideError: 'true' },
    }).pipe(
      map(response => response.responsePayload),
      switchMap(payload => {
        const details: IfscDetails = {
          ifsc: payload?.ifsc ?? normalized,
          bankName: payload?.bankName ?? '',
          branch: payload?.branch ?? '',
        };
        if (!isIfscLookupResultValid(details)) {
          return throwError(() => new Error('Invalid IFSC code'));
        }
        return of(details);
      }),
    );
  }

  createAccount(payload: AccountCreatePayload): Observable<Account> {
    return this.accountApi
      .accountControllerCreateAccount({
        body: {
          currency: 'INR',
          name: buildAccountName(payload),
          type: payload.accountType,
          ownerType: payload.ownerType,
          description: payload.description,
          accountHolderId: payload.accountHolder,
          custodianUserIds: payload.custodianUserIds,
          bankDetail: payload.bankDetail ? mapBankDetailToApi(payload.bankDetail) : undefined,
          upiDetails: payload.upiDetails?.length
            ? payload.upiDetails.map(mapUpiDetailToApi)
            : undefined,
        },
      })
      .pipe(
        map((d) => d.responsePayload),
        map(mapAccountDtoToAccount)
      );
  }

  fetchUsers(accountType?: string): Observable<User[]> {
    return this.usersApi
      .userControllerListUsers({
        status: 'ACTIVE',
      })
      .pipe(
        map((d) => d.responsePayload),
        map((m) => (normalizePaged(m).content ?? []).map((u) => mapUserDtoToUser(u)))
      );
  }

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
    return this.accountApi
      .accountControllerListAccountTransactions({
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
        map(payload => mapPagedTransactionDtoToPagedTransactions(normalizePaged(payload) as any))
      );
  }

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
    return this.accountApi
      .accountControllerListSelfAccountTransactions({
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
        map(payload => mapPagedTransactionDtoToPagedTransactions(normalizePaged(payload) as any))
      );
  }

  performTransfer(from: Account, value: any, document_list: FileUpload[], isManageAccountsTab: boolean): Observable<string> {
    const body: Record<string, unknown> = {
      amount: value.amount,
      toAccountId: value.transferTo ?? from.id,
      description: value.description,
      transferDate: value.transferDate,
      reference: value.reference,
    };
    if (value.expenseId) {
      body['expenseId'] = value.expenseId;
    }
    const payload = {
      id: from.id,
      body: body as {
        amount: number;
        toAccountId: string;
        description: string;
        transferDate: string;
        reference: 'ADHOC' | 'ADVANCE_EV';
      },
    };
    return (isManageAccountsTab ?
      this.accountApi.accountControllerTransferAmount(payload)
      : this.accountApi.accountControllerTransferAmountSelf(payload))
      .pipe(
        map(response => response.responsePayload),
        switchMap((transaction: string) => {
          if (!document_list || document_list.length === 0) {
            return of(transaction);
          }

          const uploadRequests = document_list.map(doc => {
            return this.dmsApi.dms2ControllerUploadDocument({
              body: {
                contentType: doc.detail.contentType,
                fileBase64: doc.detail.base64Content,
                fileName: doc.detail.originalFileName,
                mappings: [{
                  entityId: transaction,
                  entityType: 'TRANSACTION'
                }]
              }
            });
          });

          return forkJoin(uploadRequests).pipe(map(() => transaction));
        }),
      );
  }

  performMoneyIn(_accountTo: Account, _value: any, _document_list: FileUpload[], _isManageAccountsTab: boolean): Observable<any> {
    return of([]);
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

  getTransactionDocuments(id: string) {
    return this.dmsApi
      .dms2ControllerListDocuments({ entityType: 'TRANSACTION', entityId: id })
      .pipe(map((d) => d.responsePayload?.data ?? []), map(d => d.map(mapDocDtoToDoc)));
  }

  getReferenceData() {
    return this.accountApi
      .accountControllerGetAccountReferenceData()
      .pipe(map((d) => d.responsePayload));
  }
}
