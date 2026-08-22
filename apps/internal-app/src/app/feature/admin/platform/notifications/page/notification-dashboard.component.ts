import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import {
  createNotificationContext,
  createNotificationListConfig,
  type NotificationListConfig,
} from '../config/notification.config';
import { NotificationDataSource } from '../data/notification-data.source';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-notification-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ListDashboardComponent, UniversalListDashboardModule, NavBackComponent],
  templateUrl: './notification-dashboard.component.html',
  styleUrls: ['./notification-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class NotificationDashboardComponent {
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(NotificationDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly adminBackLink = AppRoute.secured_admin_hub_page.url;
  protected readonly routeContext = createNotificationContext();
  protected readonly config: NotificationListConfig = createNotificationListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
  });
  protected readonly refData = {};

  constructor() {
    this.sharedData.setPageName('Notification Audit');
  }

  protected onNotification(n: ListDashboardNotification): void {
    handleListNotification(this.modal, n, {
      error: 'Action failed',
      success: 'Notifications',
    });
  }
}
