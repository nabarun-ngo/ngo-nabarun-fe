import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { CommunicationRoutingModule } from './communication-routing.module';
import { MeetingDashboardComponent } from './meeting/page/meeting-dashboard.component';
import { provideMeetingDataSource } from './meeting/data/meeting.providers';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    CommunicationRoutingModule,
    MeetingDashboardComponent,
  ],
  providers: [
    ...provideMeetingDataSource(),
  ]
})
export class CommunicationModule { }
