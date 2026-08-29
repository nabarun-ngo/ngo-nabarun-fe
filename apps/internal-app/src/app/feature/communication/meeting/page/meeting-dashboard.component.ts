import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  provideListFormCustomStepRenderer,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { MeetingAgendaCustomStepComponent } from '../components/meeting-agenda-custom-step/meeting-agenda-custom-step.component';
import { MeetingAttendeesCustomStepComponent } from '../components/meeting-attendees-custom-step/meeting-attendees-custom-step.component';
import {
  createMeetingListConfig,
  type MeetingListConfig,
} from '../config/meeting.config';
import { createMeetingContext } from '../config/meeting.rules';
import { MeetingDataSource } from '../data/meeting-data.source';
import type { MeetingListContext, MeetingRefData } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-meeting-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './meeting-dashboard.component.html',
  styleUrls: ['./meeting-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
    provideListFormCustomStepRenderer(
      'meetingAgenda',
      MeetingAgendaCustomStepComponent,
    ),
    provideListFormCustomStepRenderer(
      'meetingAttendees',
      MeetingAttendeesCustomStepComponent,
    ),
  ],
})
export class MeetingDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(MeetingDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly homeBackLink = AppRoute.secured_dashboard_page.url;
  protected readonly refData = readRouteRefData(this.route) as MeetingRefData;
  protected readonly routeContext: MeetingListContext = createMeetingContext({
    refData: this.refData,
    currentUserId: this.authorization.snapshot?.userId,
  });
  protected readonly config: MeetingListConfig = createMeetingListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Events & Meetings');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Meeting action failed',
      success: 'Events & Meetings',
    });
  }
}
