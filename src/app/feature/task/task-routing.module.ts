import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { TaskListComponent } from './task-list/task-list.component';
import { taskListResolver, taskRefDataResolver } from './task.resolver';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_task_list_page.path,
    component: TaskListComponent,
    resolve:{
      data:taskListResolver,
      ref_data:taskRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule { }
