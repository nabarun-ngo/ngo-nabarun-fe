import { ResolveFn } from '@angular/router';

export const adminDashboardResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const adminRefData: ResolveFn<boolean> = (route, state) => {
  return true;
};