import { ResolveFn } from '@angular/router';
import { RequestService } from './request.service';
import { inject } from '@angular/core';
import { RequestDefaultValue, requestTab, TaskDefaultValue, workListTab } from './request.const';
import { CommonService } from 'src/app/shared/services/common.service';
import { RefDataType } from 'src/app/core/api/models';

export const requestListResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || RequestDefaultValue.tabName) as requestTab;
  let isDelegated = tab == 'delegated_request'
  return inject(RequestService).findRequests(isDelegated);
};

export const requestRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData([RefDataType.Workflow]);
};

export const taskListResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || TaskDefaultValue.tabName) as workListTab;
  let completed = tab == 'completed_worklist'
  return inject(RequestService).findMyWorkList(completed);
};