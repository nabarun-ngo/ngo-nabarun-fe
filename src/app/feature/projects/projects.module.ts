import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SocialEventListComponent } from './social-event-list/social-event-list.component';
import { UpcomingEventsTabComponent } from './social-event-list/upcoming-events-tab/upcoming-events-tab.component';
import { CompletedEventsTabComponent } from './social-event-list/completed-events-tab/completed-events-tab.component';
import { ProjectsListComponent } from './projects-list/projects-list.component';


@NgModule({
  declarations: [
    SocialEventListComponent,
    UpcomingEventsTabComponent,
    CompletedEventsTabComponent,
    ProjectsListComponent],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    SharedModule
  ]
})
export class ProjectsModule { }
