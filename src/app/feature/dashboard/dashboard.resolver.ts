import { ResolveFn } from "@angular/router";

export const helpResolver: ResolveFn<any> = (route, state) => {
  //return inject(DashboardService).getUsefulLink();
  return true;
};
