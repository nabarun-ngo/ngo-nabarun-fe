import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialEventRoutingModule } from './social-event-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SocialEventListComponent } from './social-event-list/social-event-list.component';
import { UpcomingEventsTabComponent } from './social-event-list/upcoming-events-tab/upcoming-events-tab.component';
import { CompletedEventsTabComponent } from './social-event-list/completed-events-tab/completed-events-tab.component';


@NgModule({
  declarations: [SocialEventListComponent, UpcomingEventsTabComponent, CompletedEventsTabComponent],
  imports: [
    CommonModule,
    SocialEventRoutingModule,
    SharedModule
  ]
})
export class SocialEventModule { }
