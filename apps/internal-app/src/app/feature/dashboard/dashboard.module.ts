import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SecuredDashboardComponent } from './page/secured-dashboard/secured-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { provideDashboardMetricsSource } from './data/dashboard-metrics.providers';

@NgModule({
  declarations: [
    SecuredDashboardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
  ],
  providers: [
    ...provideDashboardMetricsSource(),
  ],
})
export class DashboardModule { }
