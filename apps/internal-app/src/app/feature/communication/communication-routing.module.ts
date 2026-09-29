import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { MeetingDashboardComponent } from './meeting/page/meeting-dashboard.component';
import { meetingRefDataResolver } from './meeting/data/meeting.resolver';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_meetings_list_page.path,
    component: MeetingDashboardComponent,
    resolve: {
      ref_data: meetingRefDataResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunicationRoutingModule { }
