import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';


@NgModule({
  declarations: [
    ReportDashboardComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
  ]
})
export class ReportsModule { }
