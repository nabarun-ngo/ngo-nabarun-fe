import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { RequestDashboardComponent } from './request/page/request-dashboard.component';
import { provideRequestInfrastructure } from './request/data/request.providers';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    RequestDashboardComponent,
  ],
  providers: [
    ...provideRequestInfrastructure(),
  ],
})
export class WorkflowModule {}
