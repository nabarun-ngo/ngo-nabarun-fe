import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SecuredDashboardComponent } from './secured-dashboard/secured-dashboard.component';
import { NeedHelpComponent } from './need-help/need-help.component';
import { NoticeBoardComponent } from './notice-board.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { FinanceReportTabComponent } from './report-dashboard/finance-report-tab/finance-report-tab.component';


@NgModule({
  declarations: [
    SecuredDashboardComponent,
    NeedHelpComponent,
    NoticeBoardComponent,
    DocumentViewerComponent,
    ReportDashboardComponent,
    FinanceReportTabComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
  ],
  providers: [

  ]
})
export class DashboardModule { }
