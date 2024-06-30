import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { RequestListComponent } from './request-list/request-list.component';
import { requestListResolver, requestRefDataResolver, requestWorkflowResolver } from './request.resolver';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { CreateRequestComponent } from './create-request/create-request.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_request_list_page.path,
    component: RequestListComponent,
    resolve:{
      data:requestListResolver,
      ref_data:requestRefDataResolver
    }
  },
  {
    path: route_data.secured_request_workflow_page.path,
    component: WorkflowListComponent,
    resolve:{
      data:requestWorkflowResolver,
      ref_data:requestRefDataResolver
    }
  },
  {
    path: route_data.secured_request_create_page.path,
    component: CreateRequestComponent,
    resolve:{
      ref_data:requestRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule { }
