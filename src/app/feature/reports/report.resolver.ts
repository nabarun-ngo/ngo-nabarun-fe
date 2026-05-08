import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ReportService } from "./report.service";
import { ReportDefaultValue, reportManageTab } from "./report.const";

export const reportDashboardResolver: ResolveFn<any> = (route, state) => {
  return inject(ReportService).getReportCategories();
};

export const manageReportResolver: ResolveFn<any> = (_route, _state) => {
  const tab = (_route.queryParams['tab'] || ReportDefaultValue.tabName) as reportManageTab;
  const state = tab == 'approved_reports' ? 'APPROVED' : 'DRAFT';
  const code = _route.queryParams['reportCode'] as string;
  return inject(ReportService).listReports(code, state, ReportDefaultValue.pageNumber, ReportDefaultValue.pageSize);
};
