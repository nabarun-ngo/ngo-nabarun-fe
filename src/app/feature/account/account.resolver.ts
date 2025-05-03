import { ActivatedRoute, ResolveFn } from '@angular/router';
import { AccountService } from './account.service';
import { Inject, inject } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { AccountDefaultValue, accountTab, TransactionDefaultValue } from './account.const';
import { RefDataType } from 'src/app/core/api/models';

export const accountDashboardResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || AccountDefaultValue.tabName) as accountTab;
  if (tab == 'my_accounts') {
    return inject(AccountService).fetchMyAccounts(AccountDefaultValue.pageNumber, AccountDefaultValue.pageSize);
  }else if (tab == 'my_expenses') {
    return inject(AccountService).fetchMyExpenses(AccountDefaultValue.pageNumber, AccountDefaultValue.pageSize,{});
  }
  return;
};

export const manageAccountResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || 'all_accounts') as accountTab;
  if (tab == 'all_accounts') {
    return inject(AccountService).fetchAccounts(AccountDefaultValue.pageNumber, AccountDefaultValue.pageSize);
  } else if (tab == 'expense_list') {
    return inject(AccountService).fetchExpenses(AccountDefaultValue.pageNumber, AccountDefaultValue.pageSize);
  }
  return;
};

export const accountTransactionResolver: ResolveFn<any> = (route, state) => {
  //console.log(route, state)
  let self = route.queryParams['self'] as string;
  console.log(self)
  if (self == 'Y') {
    return inject(AccountService).fetchMyTransactions(atob(route.params['id']), TransactionDefaultValue.pageNumber, TransactionDefaultValue.pageSize);
  }else{
    return inject(AccountService).fetchTransactions(atob(route.params['id']), TransactionDefaultValue.pageNumber, TransactionDefaultValue.pageSize);
  }
};

export const accountRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData([RefDataType.Account]);
};
