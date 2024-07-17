import { ResolveFn } from '@angular/router';
import { AccountService } from './account.service';
import { inject } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { AccountDefaultValue, accountTab, TransactionDefaultValue } from './account.const';

export const accountDashboardResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || AccountDefaultValue.tabName) as accountTab;
  if(tab == 'all_accounts'){
    return inject(AccountService).fetchAccounts(AccountDefaultValue.pageNumber,AccountDefaultValue.pageSize);
  }else if(tab == 'my_accounts'){
    return inject(AccountService).fetchMyAccounts(AccountDefaultValue.pageNumber,AccountDefaultValue.pageSize);
  }
  return;
};

export const accountTransactionResolver: ResolveFn<any> = (route, state) => {
  console.log(route,state)
  return inject(AccountService).fetchTransactions(route.params['id'],TransactionDefaultValue.pageNumber,TransactionDefaultValue.pageSize); 
};

export const accountRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(AccountService).fetchRefData();
};
