import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import { ExpenseDataSource } from './expense/data/expense-data.source';
import { mapExpenseRefData } from './expense/data/expense-data.mapper';
import { AccountDataSource } from './accounts/data/account-data.source';
import { DonorDataSource } from './donors/data/donor-data.source';
import { mapDonorRefDataDtoToRefData } from './donors/data/donor-data.mapper';
import { mapAccountRefDataDtoToRefData } from './accounts/data/account-data.mapper';
import { AccountDefaultValue, accountTab, TransactionDefaultValue } from './finance.const';
import { PagedAccounts, PagedTransactions } from './accounts/domain';
import type { AccountRefData } from './accounts/domain';
import type { ExpenseRefData } from './expense/domain';

export { earningRefDataResolver as earningRefDataResolverNew } from './earning/data/earning.resolver';

export const accountDashboardResolver: ResolveFn<PagedAccounts | undefined> = (route) => {
  const tab = (route.queryParams['tab'] || AccountDefaultValue.tabName) as accountTab;
  const id = route.queryParams['id'] as string;
  const accountData = inject(AccountDataSource);
  const accountId = id ? atob(id) : undefined;

  if (tab === 'my_accounts') {
    return accountData.fetchMyAccounts(
      AccountDefaultValue.pageNumber,
      AccountDefaultValue.pageSize,
      { accountId },
    );
  }

  if (tab === 'all_accounts') {
    return accountData.fetchAccounts({
      pageIndex: AccountDefaultValue.pageNumber,
      pageSize: AccountDefaultValue.pageSize,
      filter: { accountId },
    });
  }

  return undefined;
};

export const accountTransactionResolver: ResolveFn<PagedTransactions> = (route) => {
  const self = route.queryParams['self'] as string;
  const accountId = atob(route.params['id']);
  const accountData = inject(AccountDataSource);

  return accountData.loadTransactionListPage({
    accountId,
    pageIndex: TransactionDefaultValue.pageNumber,
    pageSize: TransactionDefaultValue.pageSize,
    isSelf: self === 'Y',
  });
};

export const accountInfoResolver: ResolveFn<PagedAccounts> = (route) => {
  const self = route.queryParams['self'] as string;
  const accountId = atob(route.params['id']);
  const accountData = inject(AccountDataSource);

  return accountData.fetchAccountById(accountId, self === 'Y').pipe(
    map(account => ({
      content: account ? [account] : [],
      totalSize: account ? 1 : 0,
      pageIndex: 0,
      pageSize: 1,
    })),
  );
};

export const accountRefDataResolverNew: ResolveFn<AccountRefData> =
  () => inject(AccountDataSource).fetchRefData().pipe(
    map(refData => mapAccountRefDataDtoToRefData(refData)),
  );

export const accountRefDataResolver = accountRefDataResolverNew;

export const expenseRefDataResolverNew: ResolveFn<ExpenseRefData> =
  () => inject(ExpenseDataSource).fetchRefData().pipe(
    map(refData => mapExpenseRefData(refData)),
  );

export const donorRefDataResolverNew: ResolveFn<Record<string, KeyValue[] | string[]>> =
  () => inject(DonorDataSource).fetchRefData().pipe(
    map(refData => mapDonorRefDataDtoToRefData(refData)),
  );
