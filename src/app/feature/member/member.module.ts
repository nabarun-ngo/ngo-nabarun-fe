import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberRoutingModule } from './member-routing.module';
import { MemberProfileComponent } from './member-profile/member-profile.component';
import { MemberListComponent } from './member-list/member-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MemberSearchPipe } from './member.pipe';
import { MemberRoleComponent } from './member-role/member-role.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProfileViewComponent } from './member-profile/profile-view/profile-view.component';
import { ProfileCardComponent } from './member-list/profile-card/profile-card.component';


@NgModule({
  declarations: [
    MemberProfileComponent,
    MemberListComponent,
    MemberSearchPipe,
    MemberRoleComponent,
    ProfileCardComponent,
    ProfileViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MemberRoutingModule,
    DragDropModule,
  ],
  providers: [
    MemberSearchPipe,
  ]
})
export class MemberModule { }
