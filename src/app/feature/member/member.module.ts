import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberRoutingModule } from './member-routing.module';
import { MemberProfileComponent } from './member-profile/member-profile.component';
import { MemberListComponent } from './member-list/member-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MemberSearchPipe } from './member.pipe';
import { MemberRoleComponent } from './member-role/member-role.component';


@NgModule({
  declarations: [
    MemberProfileComponent,
    MemberListComponent,
    MemberSearchPipe,
    MemberRoleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MemberRoutingModule
  ]
})
export class MemberModule { }
