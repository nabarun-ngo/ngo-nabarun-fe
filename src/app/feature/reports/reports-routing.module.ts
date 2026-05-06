import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { reportDashboardResolver } from './report.resolver';

const routes: Routes = [{
  path: AppRoute.secured_report_dashboard_page.path,
  component: ReportDashboardComponent,
  resolve: {
    data: reportDashboardResolver,
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
