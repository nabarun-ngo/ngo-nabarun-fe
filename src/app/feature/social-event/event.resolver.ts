import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EventsService } from './events.service';
import { CommonService } from 'src/app/shared/services/common.service';

export const eventListResolver: ResolveFn<any> = (route, state) => {
  return inject(EventsService).getSocialEventList();
};

export const eventRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData();
}; 
