import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { ProjectListTabComponent } from './project-dashboard/project-list-tab/project-list-tab.component';
import { ProjectActivitiesComponent } from './project-activities/project-activities.component';
import { ActivityAccordionComponent } from './project-activities/activity-accordion/activity-accordion.component';

@NgModule({
  declarations: [
    ProjectDashboardComponent,
    ProjectListTabComponent,
    ProjectActivitiesComponent,
    ActivityAccordionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProjectRoutingModule,
  ],
  providers: []
})
export class ProjectModule { }
