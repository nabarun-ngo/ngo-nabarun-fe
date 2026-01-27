import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { KeyValueDto } from "src/app/core/api-client/models";
import { ReportService } from "./services/report.service";
import { inject } from "@angular/core";

export const helpResolver: ResolveFn<any> = (route, state) => {
  //return inject(DashboardService).getUsefulLink();
  return true;
};

export const reportDashboardResolver: ResolveFn<KeyValueDto[]> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(ReportService).listActiveReports();
  };