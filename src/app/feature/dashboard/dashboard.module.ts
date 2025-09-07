import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SecuredDashboardComponent } from './secured-dashboard/secured-dashboard.component';
import { NeedHelpComponent } from './need-help/need-help.component';
import { NoticeBoardComponent } from './notice-board.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    SecuredDashboardComponent,
    NeedHelpComponent,
    NoticeBoardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
  ],
  providers:[
   
  ]
})
export class DashboardModule { }
