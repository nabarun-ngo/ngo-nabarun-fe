import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ReportService } from "./report.service";

export const reportDashboardResolver: ResolveFn<any> = (route, state) => {
  return inject(ReportService).getReportCategories();
};
