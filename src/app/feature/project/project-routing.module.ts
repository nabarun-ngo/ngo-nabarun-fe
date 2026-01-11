import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { projectRefDataResolver, projectsResolver, projectActivitiesResolver } from './project.resolver';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { ProjectActivitiesComponent } from './project-activities/project-activities.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_project_list_page.path,
    component: ProjectDashboardComponent,
    resolve: {
      data: projectsResolver,
      ref_data: projectRefDataResolver
    }
  },
  {
    path: route_data.secured_project_activities_page.path,
    component: ProjectActivitiesComponent,
    resolve: {
      data: projectActivitiesResolver,
      ref_data: projectRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
