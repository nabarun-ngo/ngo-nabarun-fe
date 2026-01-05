import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
// New dashboard components
import { RequestDashboardComponent } from './request-dashboard/request-dashboard.component';
import { MyRequestsTabComponent } from './request-dashboard/my-requests-tab/my-requests-tab.component';
import { DelegatedRequestsTabComponent } from './request-dashboard/delegated-requests-tab/delegated-requests-tab.component';
// New task dashboard components
import { TaskDashboardComponent } from './task-dashboard/task-dashboard.component';
import { PendingTasksTabComponent } from './task-dashboard/pending-tasks-tab/pending-tasks-tab.component';
import { CompletedTasksTabComponent } from './task-dashboard/completed-tasks-tab/completed-tasks-tab.component';
import { WorkflowRoutingModule } from './workflow-routing.module';


@NgModule({
  declarations: [
    // New dashboard components
    RequestDashboardComponent,
    MyRequestsTabComponent,
    DelegatedRequestsTabComponent,
    // New task dashboard components
    TaskDashboardComponent,
    PendingTasksTabComponent,
    CompletedTasksTabComponent,
  ],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    SharedModule,
  ],
  providers: [
  ]
})
export class WorkflowModule { }
