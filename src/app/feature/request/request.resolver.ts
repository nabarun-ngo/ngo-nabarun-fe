import { ResolveFn } from '@angular/router';
import { RequestService } from './request.service';
import { inject } from '@angular/core';
import { RequestDefaultValue, requestTab } from './request.const';

export const requestListResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || RequestDefaultValue.tabName) as requestTab;
  let isDelegated = tab == 'delegated_request'
  return inject(RequestService).findRequests(isDelegated);
};

export const requestRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(RequestService).findRequestRefData();
};