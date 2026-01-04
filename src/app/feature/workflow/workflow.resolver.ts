import { ResolveFn } from '@angular/router';
import { RequestService } from './service/request.service';
import { inject } from '@angular/core';
import { RequestDefaultValue, requestTab, TaskDefaultValue, workListTab } from './workflow.const';
import { PagedRequest } from './model/request.model';
import { WorkflowRefDataDto } from 'src/app/core/api-client/models';
import { TaskService } from './service/task.service';
import { PagedTask } from './model/task.model';

export const requestListResolver: ResolveFn<PagedRequest> = (route, state) => {
  let tab = (route.queryParams['tab'] || RequestDefaultValue.tabName) as requestTab;
  if (tab == 'self_request') {
    return inject(RequestService).findRequests('me', RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize);
  }
  return inject(RequestService).findRequests('others', RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize);
};


export const workflowRefDataResolver: ResolveFn<WorkflowRefDataDto> = (route, state) => {
  return inject(RequestService).getRefData();
};

export const taskListResolver: ResolveFn<PagedTask> = (route, state) => {
  let tab = (route.queryParams['tab'] || TaskDefaultValue.tabName) as workListTab;
  if (tab == 'completed_worklist') {
    return inject(TaskService).findMyTasks(true, TaskDefaultValue.pageNumber, TaskDefaultValue.pageSize);
  }
  return inject(TaskService).findMyTasks(false, TaskDefaultValue.pageNumber, TaskDefaultValue.pageSize);
};
