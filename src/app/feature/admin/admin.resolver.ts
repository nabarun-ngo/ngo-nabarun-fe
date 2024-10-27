import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';

export const adminDashboardResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const adminRefData: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData();
};