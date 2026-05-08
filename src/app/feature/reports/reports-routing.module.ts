import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { manageReportResolver, reportDashboardResolver } from './report.resolver';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';

const routes: Routes = [
  {
    path: AppRoute.secured_report_dashboard_page.path,
    component: ReportDashboardComponent,
    resolve: {
      data: reportDashboardResolver,
    }
  },
  {
    path: AppRoute.secured_manage_reports_page.path,
    component: ManageReportsComponent,
    resolve: {
      data: manageReportResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
