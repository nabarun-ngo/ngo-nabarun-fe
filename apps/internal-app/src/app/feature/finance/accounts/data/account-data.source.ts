import { InjectionToken } from '@angular/core';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { Observable } from 'rxjs';
import { AccountRefDataDto } from 'src/app/core/api/api-client/models';
import { Doc } from 'src/app/shared/models/document.model';
import { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { User } from 'src/app/feature/member/domain';
import {
  Account,
  AccountCreatePayload,
  AccountDetailsUpdatePayload,
  IfscDetails,
  PagedAccounts,
  type AccountListCriteria,
  type PagedTransactions,
  type TransactionListCriteria,
} from '../domain';

export interface AccountListFilter {
  accountId?: string;
  type?: Account['accountType'][];
  ownerType?: Account['ownerType'][];
  status?: Account['status'][];
  accountHolderId?: string;
}

export interface AccountListOptions {
  pageIndex?: number;
  pageSize?: number;
  filter?: AccountListFilter;
}

export interface AccountListPageQuery {
  chipId?: string;
  criteria?: AccountListCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
  useOrgList?: boolean;
}

export interface TransactionListFilter {
  transactionRef?: string;
  txnType?: string | string[];
  txnStatus?: string | string[];
  txnId?: string;
  startDate?: string;
  endDate?: string;
  txnRefId?: string;
  txnRefType?: string;
}

export interface TransactionListOptions {
  accountId: string;
  pageIndex?: number;
  pageSize?: number;
  filter?: TransactionListFilter;
  isSelf?: boolean;
}

export interface TransactionListPageQuery extends TransactionListOptions {
  criteria?: TransactionListCriteria;
  searchText?: string;
}

export type AccountTransferReference = 'ADHOC' | 'ADVANCE_EV';

export interface AccountTransferPayload {
  transferTo: string;
  amount: number;
  description: string;
  transferDate: string;
  reference: AccountTransferReference;
  expenseId?: string;
}

export interface FetchPayableAccountsParams {
  reference?: AccountTransferReference;
  fromAccountId?: string;
  purpose?: 'EARNING_INTEREST' | 'DONATION' | 'INVESTMENT_FUNDING';
}

export interface AccountDataSource {
  loadListPage(query: AccountListPageQuery): Observable<PagedAccounts>;
  fetchMyAccounts(pageIndex?: number, pageSize?: number, filter?: AccountListFilter): Observable<PagedAccounts>;
  fetchAccounts(options?: AccountListOptions): Observable<PagedAccounts>;
  fetchAccountById(accountId: string, isSelf: boolean): Observable<Account | undefined>;
  fetchAllAccounts(): Observable<PagedAccounts>;
  fetchPayableAccounts(params?: FetchPayableAccountsParams): Observable<Account[]>;
  createAccount(payload: AccountCreatePayload): Observable<Account>;
  updateAccountDetail(id: string, value: { status: 'ACTIVE' | 'CLOSED' }): Observable<Account>;
  updateAccountDetails(id: string, payload: AccountDetailsUpdatePayload, options?: { isSelf?: boolean }): Observable<Account>;
  performTransfer(from: Account, value: AccountTransferPayload, documentList: FileUpload[], isAdminTransfer: boolean): Observable<string>;
  loadTransactionListPage(query: TransactionListPageQuery): Observable<PagedTransactions>;
  getTransactionDocuments(id: string): Observable<Doc[]>;
  fetchRefData(): Observable<AccountRefDataDto | undefined>;
  fetchUsers(accountType?: string): Observable<User[]>;
  fetchMemberOptions(): Observable<FieldOption[]>;
  lookupIfsc(ifsc: string): Observable<IfscDetails>;
}

export const AccountDataSource = new InjectionToken<AccountDataSource>('AccountDataSource');
