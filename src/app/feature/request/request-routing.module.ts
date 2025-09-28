import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { requestListResolver, requestRefDataResolver, taskListResolver } from './request.resolver';
import { RequestDashboardComponent } from './request-dashboard/request-dashboard.component';
import { TaskDashboardComponent } from './task-dashboard/task-dashboard.component';

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
  {
    path: route_data.secured_task_list_page.path,
    component: TaskDashboardComponent,
    resolve:{
      data:taskListResolver,
      ref_data:requestRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule { }
