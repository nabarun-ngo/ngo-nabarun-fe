import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestRoutingModule } from './request-routing.module';
import { RequestListComponent } from './request-list/request-list.component';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskSearchPipe } from './task.pipe';
// New dashboard components
import { RequestDashboardComponent } from './request-dashboard/request-dashboard.component';
import { MyRequestsTabComponent } from './request-dashboard/my-requests-tab/my-requests-tab.component';
import { DelegatedRequestsTabComponent } from './request-dashboard/delegated-requests-tab/delegated-requests-tab.component';


@NgModule({
  declarations: [
    RequestListComponent,
    WorkflowListComponent,
    TaskListComponent,
    TaskSearchPipe,
    // New dashboard components
    RequestDashboardComponent,
    MyRequestsTabComponent,
    DelegatedRequestsTabComponent,
  ],
  imports: [
    CommonModule,
    RequestRoutingModule,
    SharedModule,
  ],
  providers:[
    TaskSearchPipe
  ]
})
export class RequestModule { }
