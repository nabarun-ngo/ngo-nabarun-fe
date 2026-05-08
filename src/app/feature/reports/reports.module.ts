import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { DraftReportsTabComponent } from './manage-reports/draft-reports-tab/draft-reports-tab.component';
import { ApprovedReportsTabComponent } from './manage-reports/approved-reports-tab/approved-reports-tab.component';


@NgModule({
  declarations: [
    ReportDashboardComponent,
    ManageReportsComponent,
    DraftReportsTabComponent,
    ApprovedReportsTabComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
  ]
})
export class ReportsModule { }
