import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CommonService } from 'src/app/feature/dashboard/dashboard.service';

export const adminDashboardResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const adminRefData: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData();
};