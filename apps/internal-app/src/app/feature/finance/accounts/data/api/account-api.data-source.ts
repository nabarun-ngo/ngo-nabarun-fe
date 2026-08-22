import { Injectable } from '@angular/core';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { catchError, map, Observable, of } from 'rxjs';
import { AccountRefDataDto } from 'src/app/core/api/api-client/models';
import { Doc } from 'src/app/shared/models/document.model';
import { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { mapUsersToMemberOptions } from '../account-data.mapper';
import {
  buildAccountApiFilter,
  normalizeAccountChip,
} from '../../config/account/account.rules';
import { buildTransactionApiFilter } from '../../config/transaction/transaction.rules';
import {
  AccountDataSource,
  AccountListOptions,
  AccountListPageQuery,
  AccountTransferPayload,
  FetchPayableAccountsParams,
  TransactionListPageQuery,
} from '../account-data.source';
import type {
  Account,
  AccountCreatePayload,
  AccountDetailsUpdatePayload,
  PagedAccounts,
  PagedTransactions,
} from '../../domain';
import { AccountService } from '../account.service';

@Injectable()
export class AccountApiDataSource implements AccountDataSource {
  constructor(private readonly accountService: AccountService) {}

  loadListPage(query: AccountListPageQuery): Observable<PagedAccounts> {
    const chipId = normalizeAccountChip(query.chipId);
    const filter = buildAccountApiFilter(chipId, query.criteria, query.searchText);
    const useOrgList = query.useOrgList ?? false;

    if (useOrgList) {
      return this.fetchAccounts({
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
        filter,
      });
    }

    return this.fetchMyAccounts(query.pageIndex, query.pageSize, filter);
  }

  fetchMyAccounts(
    pageIndex?: number,
    pageSize?: number,
    filter?: AccountListOptions['filter'],
  ): Observable<PagedAccounts> {
    return this.accountService.fetchMyAccounts(pageIndex, pageSize, filter as Parameters<AccountService['fetchMyAccounts']>[2]);
  }

  fetchAccounts(options?: AccountListOptions): Observable<PagedAccounts> {
    return this.accountService.fetchAccounts({
      pageIndex: options?.pageIndex,
      pageSize: options?.pageSize,
      accountId: options?.filter?.accountId,
      accountHolderId: options?.filter?.accountHolderId,
      type: options?.filter?.type,
      ownerType: (options?.filter?.ownerType ?? []).filter(
        (value): value is NonNullable<typeof value> => !!value,
      ) as Array<'ORG' | 'INDIVIDUAL'>,
      status: options?.filter?.status as Array<'ACTIVE' | 'CLOSED'> | undefined,
    });
  }

  fetchAccountById(accountId: string, isSelf: boolean): Observable<Account | undefined> {
    const request$ = isSelf
      ? this.fetchMyAccounts(undefined, undefined, { accountId })
      : this.fetchAccounts({ filter: { accountId } });

    return request$.pipe(
      map(page => page.content?.[0]),
      catchError(() => of(undefined)),
    );
  }

  fetchAllAccounts(): Observable<PagedAccounts> {
    return this.accountService.fetchAllAccounts();
  }

  fetchPayableAccounts(params?: FetchPayableAccountsParams): Observable<Account[]> {
    return this.accountService.fetchPayableAccounts(params);
  }

  createAccount(payload: AccountCreatePayload): Observable<Account> {
    return this.accountService.createAccount(payload);
  }

  updateAccountDetail(id: string, value: { status: 'ACTIVE' | 'CLOSED' }): Observable<Account> {
    return this.accountService.updateAccountDetail(id, value);
  }

  updateAccountDetails(id: string, payload: AccountDetailsUpdatePayload, options?: { isSelf?: boolean }): Observable<Account> {
    return this.accountService.updateAccountDetails(id, payload, options);
  }

  performTransfer(
    from: Account,
    value: AccountTransferPayload,
    documentList: FileUpload[],
    isAdminTransfer: boolean,
  ): Observable<string> {
    return this.accountService.performTransfer(from, value, documentList, isAdminTransfer);
  }

  loadTransactionListPage(query: TransactionListPageQuery): Observable<PagedTransactions> {
    const filter = buildTransactionApiFilter(query.criteria, query.searchText);
    const isSelf = query.isSelf ?? false;

    if (isSelf) {
      return this.accountService.fetchMyTransactions(
        query.accountId,
        query.pageIndex,
        query.pageSize,
        filter,
      );
    }

    return this.accountService.fetchTransactions(
      query.accountId,
      query.pageIndex,
      query.pageSize,
      filter,
    );
  }

  getTransactionDocuments(id: string): Observable<Doc[]> {
    return this.accountService.getTransactionDocuments(id).pipe(catchError(() => of([])));
  }

  fetchRefData(): Observable<AccountRefDataDto | undefined> {
    return this.accountService.getReferenceData().pipe(map(ref => ref ?? undefined));
  }

  fetchUsers(accountType?: string): Observable<import('src/app/feature/member/domain').User[]> {
    return this.accountService.fetchUsers(accountType);
  }

  fetchMemberOptions(): Observable<FieldOption[]> {
    return this.fetchUsers().pipe(
      map(mapUsersToMemberOptions),
      catchError(() => of([])),
    );
  }

  lookupIfsc(ifsc: string): Observable<import('../../domain').IfscDetails> {
    return this.accountService.lookupIfsc(ifsc);
  }
}
