import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EventsService } from './events.service';
import { CommonService } from 'src/app/feature/dashboard/dashboard.service';
import { DefaultValue, eventTabs } from './events.conts';

export const eventListResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || DefaultValue.tabName) as eventTabs;
  let completed = tab == 'completed_events'
  return inject(EventsService).getSocialEventList(completed, DefaultValue.pageNumber, DefaultValue.pageSize);
};

export const eventRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData();
}; 
