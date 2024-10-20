import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestRoutingModule } from './request-routing.module';
import { RequestListComponent } from './request-list/request-list.component';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskSearchPipe } from './task.pipe';


@NgModule({
  declarations: [
    RequestListComponent,
    WorkflowListComponent,
    TaskListComponent,
    TaskSearchPipe,
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
