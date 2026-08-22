import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CfFormStepperComponent,
  CfFormStepperStepDirective,
} from '@nabarun-ngo/forms-angular';
import {
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  UniversalListDashboardModule,
} from '@nabarun-ngo/list-dashboard-angular';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MemberRoutingModule } from './member-routing.module';
import { MemberCompleteProfilePageComponent } from './page/member-complete-profile/member-complete-profile.component';
import {
  MemberProfilePictureUploadComponent,
} from './components/member-profile-picture-upload/member-profile-picture-upload.component';
import { provideMemberInfrastructure } from './data/member.providers';

@NgModule({
  declarations: [
    MemberCompleteProfilePageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    UniversalListDashboardModule,
    CfFormStepperComponent,
    CfFormStepperStepDirective,
    MemberProfilePictureUploadComponent,
    MemberRoutingModule,
  ],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
    ...provideMemberInfrastructure(),
  ],
})
export class MemberModule { }
