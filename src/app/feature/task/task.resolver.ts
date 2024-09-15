import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TaskService } from './task.service';
import { TaskDefaultValue, workListTab } from './task.const';

export const taskListResolver: ResolveFn<any> = (route, state) => {
    let tab = (route.data['tab'] || TaskDefaultValue.tabName) as workListTab;
    let completed = tab == 'completed_worklist'
    return inject(TaskService).findMyWorkList({isCompleted:completed});
  };


  export const taskRefDataResolver: ResolveFn<any> = (route, state) => {
    return inject(TaskService).findTaskRefData();
  };