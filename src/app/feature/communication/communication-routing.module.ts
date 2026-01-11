import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { noticeRefDataResolver, noticesResolver, meetingRefDataResolver, meetingsResolver } from './communication.resolver';
import { NoticeDashboardComponent } from './notice-dashboard/notice-dashboard.component';
import { MeetingDashboardComponent } from './meeting-dashboard/meeting-dashboard.component';

const route_data = AppRoute;

const routes: Routes = [
  // {
  //   path: route_data.secured_communication_notice_page.path,
  //   component: NoticeDashboardComponent,
  //   resolve: {
  //     data: noticesResolver,
  //     ref_data: noticeRefDataResolver
  //   }
  // },
  {
    path: route_data.secured_meetings_list_page.path,
    component: MeetingDashboardComponent,
    resolve: {
      data: meetingsResolver,
      ref_data: meetingRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunicationRoutingModule { }
