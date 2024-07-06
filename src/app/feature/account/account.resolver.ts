import { ResolveFn } from '@angular/router';

export const accountDashboardResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const accountTransactionResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};

export const accountRefDataResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
