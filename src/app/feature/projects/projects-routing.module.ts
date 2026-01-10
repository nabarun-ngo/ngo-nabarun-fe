import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocialEventListComponent } from './social-event-list/social-event-list.component';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { eventListResolver, eventRefDataResolver } from './projects.resolver';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_event_list_page.path,
    component: SocialEventListComponent,
    resolve: {
      data: eventListResolver,
      ref_data: eventRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
