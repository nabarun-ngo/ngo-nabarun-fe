import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { CommunicationRoutingModule } from './communication-routing.module';
import { NoticeDashboardComponent } from './notice-dashboard/notice-dashboard.component';
import { NoticeAccordionComponent } from './notice-dashboard/notice-accordion/notice-accordion.component';
import { MeetingDashboardComponent } from './meeting-dashboard/meeting-dashboard.component';
import { MeetingAccordionComponent } from './meeting-dashboard/meeting-accordion/meeting-accordion.component';

@NgModule({
  declarations: [
    NoticeDashboardComponent,
    NoticeAccordionComponent,
    MeetingDashboardComponent,
    MeetingAccordionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CommunicationRoutingModule,
  ],
  providers: []
})
export class CommunicationModule { }
