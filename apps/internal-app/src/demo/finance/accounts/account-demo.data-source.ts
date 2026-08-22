import { Injectable } from '@angular/core';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { Observable, of, throwError } from 'rxjs';
import { AccountRefDataDto } from 'src/app/core/api/api-client/models';
import { Doc } from 'src/app/shared/models/document.model';
import { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { User } from 'src/app/feature/member/domain';
import {
  buildAccountApiFilter,
  normalizeAccountChip,
} from 'src/app/feature/finance/accounts/config/account/account.rules';
import { buildTransactionApiFilter } from 'src/app/feature/finance/accounts/config/transaction/transaction.rules';
import type {
  Account,
  AccountCreatePayload,
  AccountDetailsUpdatePayload,
  IfscDetails,
  PagedAccounts,
  PagedTransactions,
} from 'src/app/feature/finance/accounts/domain';
import {
  AccountDataSource,
  AccountListOptions,
  AccountListPageQuery,
  AccountTransferPayload,
  FetchPayableAccountsParams,
  TransactionListPageQuery,
} from 'src/app/feature/finance/accounts/data/account-data.source';
import {
  DEMO_ACCOUNTS,
  DEMO_IFSC_LOOKUP,
  DEMO_MINE_HOLDER_ID,
  findDemoAccountById,
  pageDemoAccounts,
  pageDemoTransactions,
} from './account-list.demo-data';

const DEMO_MEMBER_OPTIONS = [{ key: DEMO_MINE_HOLDER_ID, label: 'Demo Member' }];

const DEMO_REF_DATA: AccountRefDataDto = {
  accountTypes: [
    { key: 'BANK', value: 'Bank Account', description: 'ORG,INDIVIDUAL' },
    { key: 'INVESTMENT', value: 'Investment Account', description: 'ORG,INDIVIDUAL' },
    { key: 'WALLET', value: 'Wallet', description: 'INDIVIDUAL' },
  ],
  ownerTypes: [
    { key: 'ORG', value: 'Organization' },
    { key: 'INDIVIDUAL', value: 'Individual' },
  ],
  accountStatuses: [
    { key: 'ACTIVE', value: 'Active' },
    { key: 'CLOSED', value: 'Closed' },
  ],
  accountStatusGroups: {
    outstanding: ['ACTIVE'],
    closed: ['CLOSED'],
    excluded: [],
  },
  bankAccountTypes: [
    { key: 'Savings', value: 'Savings' },
    { key: 'Current', value: 'Current' },
  ],
  investmentTypes: [
    { key: 'FD', value: 'Fixed Deposit' },
    { key: 'MF', value: 'Mutual Fund' },
    { key: 'DEMAT', value: 'Demat' },
    { key: 'PPF', value: 'PPF' },
    { key: 'NSC', value: 'NSC' },
    { key: 'OTHER', value: 'Other' },
  ],
  interestPayingTerms: [
    { key: 'MONTHLY', value: 'Monthly' },
    { key: 'QUARTERLY', value: 'Quarterly' },
    { key: 'HALF_YEARLY', value: 'Half Yearly' },
    { key: 'YEARLY', value: 'Yearly' },
    { key: 'AT_MATURITY', value: 'At Maturity' },
    { key: 'OTHER', value: 'Other' },
  ],
  transferReferenceTypes: [
    { key: 'ADHOC', value: 'General' },
    { key: 'ADVANCE_EV', value: 'Advance for Event' },
  ],
  transferMatrix: [
    { fromAccountType: 'WALLET', reference: 'ADHOC', toAccountTypes: ['BANK'] },
    { fromAccountType: 'BANK', reference: 'ADHOC', toAccountTypes: ['BANK', 'WALLET'] },
    { fromAccountType: 'BANK', reference: 'ADVANCE_EV', toAccountTypes: ['WALLET'] },
  ],
  transactionTypes: [
    { key: 'IN', value: 'Credit (IN)' },
    { key: 'OUT', value: 'Debit (OUT)' },
  ],
  transactionStatuses: [
    { key: 'SUCCESS', value: 'Success' },
    { key: 'REVERSED', value: 'Reversed' },
  ],
  transactionRefTypes: [
    { key: 'DONATION', value: 'Donation' },
    { key: 'EXPENSE', value: 'Expense' },
    { key: 'EARNING', value: 'Earning' },
    { key: 'NONE', value: 'None' },
    { key: 'TXN_REVERSE', value: 'Reversal' },
  ],
};

@Injectable()
export class AccountDemoDataSource implements AccountDataSource {
  loadListPage(query: AccountListPageQuery): Observable<PagedAccounts> {
    const chipId = normalizeAccountChip(query.chipId);
    const filter = buildAccountApiFilter(chipId, query.criteria, query.searchText);
    const mineOnly = !query.useOrgList;
    return of(pageDemoAccounts(query.pageIndex, query.pageSize, filter, mineOnly));
  }

  fetchMyAccounts(pageIndex?: number, pageSize?: number, filter?: AccountListOptions['filter']): Observable<PagedAccounts> {
    return of(pageDemoAccounts(pageIndex ?? 0, pageSize ?? 12, filter, true));
  }

  fetchAccounts(options?: AccountListOptions): Observable<PagedAccounts> {
    return of(pageDemoAccounts(
      options?.pageIndex ?? 0,
      options?.pageSize ?? 12,
      options?.filter,
      false,
    ));
  }

  fetchAccountById(accountId: string, _isSelf?: boolean): Observable<Account | undefined> {
    return of(findDemoAccountById(accountId));
  }

  fetchAllAccounts(): Observable<PagedAccounts> {
    return of(pageDemoAccounts(0, 500, { status: ['ACTIVE'] }, false));
  }

  fetchPayableAccounts(params?: FetchPayableAccountsParams): Observable<Account[]> {
    const active = DEMO_ACCOUNTS.filter(account => account.status === 'ACTIVE');
    const from = params?.fromAccountId
      ? DEMO_ACCOUNTS.find(account => account.id === params.fromAccountId)
      : undefined;

    let matches: Account[];
    if (params?.purpose === 'EARNING_INTEREST') {
      matches = active.filter(
        account => account.accountType === 'BANK' || account.accountType === 'INVESTMENT',
      );
    } else if (params?.purpose === 'INVESTMENT_FUNDING') {
      matches = active.filter(account => account.accountType === 'BANK');
    } else if (!params?.reference) {
      matches = active.filter(
        account => account.accountType === 'BANK' && account.ownerType === 'ORG',
      );
    } else if (from?.accountType === 'INVESTMENT') {
      matches = [];
    } else if (from?.accountType === 'WALLET') {
      matches = params.reference === 'ADHOC'
        ? active.filter(account => account.accountType === 'BANK')
        : [];
    } else if (params.reference === 'ADVANCE_EV') {
      matches = active.filter(account => account.accountType === 'WALLET');
    } else {
      matches = active.filter(
        account => account.accountType === 'BANK' || account.accountType === 'WALLET',
      );
    }

    return of(
      matches.filter(account => account.id !== params?.fromAccountId),
    );
  }

  createAccount(payload: AccountCreatePayload): Observable<Account> {
    const created: Account = {
      id: `acc-new-${Date.now()}`,
      accountType: payload.accountType,
      ownerType: payload.ownerType,
      accountHolder: payload.accountHolder,
      custodianUserIds: payload.custodianUserIds,
      bankDetail: payload.bankDetail,
      status: 'ACTIVE',
      balance: 0,
      displayName: `${payload.accountType} Account`,
      isActive: true,
      formattedBalance: '₹0',
      accountTypeLabel: payload.accountType,
      ownerTypeLabel: payload.ownerType === 'ORG' ? 'Organization' : 'Individual',
    };
    return of(created);
  }

  updateAccountDetail(id: string, value: { status: 'ACTIVE' | 'CLOSED' }): Observable<Account> {
    const existing = findDemoAccountById(id);
    return of({ ...(existing ?? DEMO_ACCOUNTS[0]), status: value.status });
  }

  updateAccountDetails(id: string, payload: AccountDetailsUpdatePayload, _options?: { isSelf?: boolean }): Observable<Account> {
    const existing = findDemoAccountById(id);
    return of({
      ...(existing ?? DEMO_ACCOUNTS[0]),
      bankDetail: payload.bankDetail ?? existing?.bankDetail,
      upiDetails: payload.upiDetails ?? existing?.upiDetails,
      upiDetail: payload.upiDetails?.find(u => u.isPrimary) ?? payload.upiDetails?.[0] ?? existing?.upiDetail,
    });
  }

  performTransfer(
    _from: Account,
    _value: AccountTransferPayload,
    _documentList: FileUpload[],
    _isAdminTransfer: boolean,
  ): Observable<string> {
    return of(`txn-demo-${Date.now()}`);
  }

  loadTransactionListPage(query: TransactionListPageQuery): Observable<PagedTransactions> {
    const filter = buildTransactionApiFilter(query.criteria, query.searchText);
    return of(pageDemoTransactions(
      query.accountId,
      query.pageIndex ?? 0,
      query.pageSize ?? 12,
      filter,
    ));
  }

  getTransactionDocuments(_id: string): Observable<Doc[]> {
    return of([]);
  }

  fetchRefData(): Observable<AccountRefDataDto | undefined> {
    return of(DEMO_REF_DATA);
  }

  fetchUsers(_accountType?: string): Observable<User[]> {
    return of([]);
  }

  fetchMemberOptions(): Observable<FieldOption[]> {
    return of(DEMO_MEMBER_OPTIONS);
  }

  lookupIfsc(ifsc: string): Observable<IfscDetails> {
    const normalized = ifsc.trim().toUpperCase();
    const match = DEMO_IFSC_LOOKUP[normalized];
    if (!match) {
      return throwError(() => new Error('Invalid IFSC code'));
    }
    return of({ ifsc: normalized, ...match });
  }
}
