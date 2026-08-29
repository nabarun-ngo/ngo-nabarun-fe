import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { CorrespondenceFollowService } from 'src/app/shared/correspondence/correspondence-follow.service';
import {
  createRequestListConfig,
  type RequestListConfig,
} from '../config/request.config';
import { createRequestContext } from '../config/request.rules';
import { RequestDataSource } from '../data/request-data.source';
import type { RequestListContext, RequestRefData } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-request-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './request-dashboard.component.html',
  styleUrls: ['./request-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class RequestDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(RequestDataSource);
  private readonly modal = inject(ModalService);
  private readonly follow = inject(CorrespondenceFollowService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly homeBackLink = AppRoute.secured_dashboard_page.url;
  protected readonly refData = readRouteRefData(this.route) as RequestRefData;
  protected readonly routeContext: RequestListContext = createRequestContext({
    refData: this.refData,
    currentUserId: this.authorization.snapshot?.userId,
  });
  protected readonly config: RequestListConfig = createRequestListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    follow: this.follow,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Requests');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Request action failed',
      success: 'Requests',
    });
  }
}
