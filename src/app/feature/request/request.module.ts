import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestRoutingModule } from './request-routing.module';
import { RequestListComponent } from './request-list/request-list.component';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    RequestListComponent,
    WorkflowListComponent,
  ],
  imports: [
    CommonModule,
    RequestRoutingModule,
    SharedModule,
  ]
})
export class RequestModule { }
