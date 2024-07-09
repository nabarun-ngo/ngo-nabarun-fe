import { ResolveFn } from '@angular/router';
import { AccountService } from './account.service';
import { inject } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';

export const accountDashboardResolver: ResolveFn<any> = (route, state) => {
  return inject(AccountService).fetchAccounts({active:true});
};

export const accountTransactionResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const accountRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData({names:['ACCOUNT']});
};
