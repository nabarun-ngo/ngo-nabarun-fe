import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { requestListResolver, requestRefDataResolver, taskListResolver } from './request.resolver';
import { RequestDashboardComponent } from './request-dashboard/request-dashboard.component';
import { TaskDashboardComponent } from './task-dashboard/task-dashboard.component';
import { RequestListComponent } from './deleted/request-list/request-list.component';
import { TaskListComponent } from './deleted/task-list/task-list.component';
 
const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_request_list_page.path,
    component: RequestDashboardComponent,
    resolve:{
      data:requestListResolver,
      ref_data:requestRefDataResolver
    }
  },
  // Keep old component for backward compatibility if needed
  {
    path: 'legacy-list',
    component: RequestListComponent,
    resolve:{
      data:requestListResolver,
      ref_data:requestRefDataResolver
    }
  },
  {
    path: route_data.secured_task_list_page.path,
    component: TaskDashboardComponent,
    resolve:{
      data:taskListResolver,
      ref_data:requestRefDataResolver
    }
  },
  // Keep legacy component for backward compatibility
  {
    path: 'legacy-task-list',
    component: TaskListComponent,
    resolve:{
      data:taskListResolver,
      ref_data:requestRefDataResolver
    }
  },
  // {
  //   path: route_data.secured_request_workflow_page.path,
  //   component: WorkflowListComponent,
  //   resolve:{
  //     data:requestWorkflowResolver,
  //     ref_data:requestRefDataResolver
  //   }
  // },
  // {
  //   path: route_data.secured_request_create_page.path,
  //   component: CreateRequestComponent,
  //   resolve:{
  //     ref_data:requestRefDataResolver
  //   }
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule { }
