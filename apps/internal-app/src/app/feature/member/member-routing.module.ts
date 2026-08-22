import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { MemberDashboardComponent } from './page/member-dashboard/member-dashboard.component';
import { MemberCompleteProfilePageComponent } from './page/member-complete-profile/member-complete-profile.component';
import { memberRefDataResolver, myProfileResolver } from './data/member.resolver';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: '',
    redirectTo: route_data.secured_member_members_page.path,
    pathMatch: 'full',
  },
  {
    path: route_data.secured_member_members_page.path,
    component: MemberDashboardComponent,
    resolve: {
      ref_data: memberRefDataResolver,
    },
  },
  {
    // Legacy bookmark — profile edit lives on the Me chip of the members list.
    path: route_data.secured_member_my_profile_page.path,
    redirectTo: () => `${route_data.secured_member_members_page.path}?chip=me`,
  },
  {
    path: route_data.secured_member_complete_my_profile_page.path,
    component: MemberCompleteProfilePageComponent,
    resolve: {
      data: myProfileResolver,
      ref_data: memberRefDataResolver,
    },
    data: { self_profile: true, complete_flag: true },
  },
  {
    path: route_data.secured_member_profile_page.path,
    redirectTo: (snapshot) => {
      const rawId = snapshot.params['id'] ?? '';
      let memberId = rawId;
      try {
        memberId = atob(rawId);
      } catch {
        memberId = rawId;
      }
      return `${route_data.secured_member_members_page.path}?memberId=${encodeURIComponent(memberId)}`;
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberRoutingModule {}
