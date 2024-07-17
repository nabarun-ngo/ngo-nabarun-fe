import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { NoticeService } from './notice.service';

export const noticeResolver: ResolveFn<any> = (route, state) => {
  return inject(NoticeService).retrieveNotices();
};

export const noticeRefDataResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const noticeCreateResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const noticeUpdateResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
