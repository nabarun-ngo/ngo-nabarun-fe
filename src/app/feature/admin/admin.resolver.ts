import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AdminService } from './admin.service';
import { AdminDefaultValue, adminTabs } from './admin.const';

export const adminDashboardResolver: ResolveFn<any> = (route, state) => {
  // const adminService = inject(AdminService);
  // const tab = (route.queryParams['tab'] || AdminDefaultValue.tabName) as adminTabs;

  // if (tab === 'oauth') {
  //   return adminService.getOAuthTokenList();
  // }
  // else if (tab === 'api_keys') {
  //   return adminService.getAPIKeyList();
  // }


  return true;
};

export const adminRefData: ResolveFn<any> = (route, state) => {
  return true;
};