import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { MemberProfileComponent } from './member-profile/member-profile.component';
import { memberRefDataResolver, memberResolver, membersResolver, myProfileResolver } from './member.resolver';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberRoleComponent } from './member-role/member-role.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_member_members_page.path,
    component: MemberListComponent,
    resolve:{
      data:membersResolver,
      ref_data:memberRefDataResolver
    }
  },
  {
    path: route_data.secured_member_my_profile_page.path,
    component: MemberProfileComponent,
    resolve:{
      data:myProfileResolver,
      ref_data:memberRefDataResolver,
    },
    data:{
      self_profile:true
    }
  },
  {
    path: route_data.secured_member_roles_page.path,
    component: MemberRoleComponent,
    resolve:{
      //data:memberResolver,
      ref_data:memberRefDataResolver
    }
  },
  {
    path: route_data.secured_member_profile_page.path,
    component: MemberProfileComponent,
    resolve:{
      data:memberResolver,
      ref_data:memberRefDataResolver
    }
  },
 
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
