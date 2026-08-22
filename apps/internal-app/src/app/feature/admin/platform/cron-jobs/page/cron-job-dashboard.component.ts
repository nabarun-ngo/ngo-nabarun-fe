import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
  createCronJobListConfig,
  type CronJobListConfig,
} from '../config/cron-job.config';
import { CronJobDataSource } from '../data/cron-job-data.source';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-cron-job-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './cron-job-dashboard.component.html',
  styleUrls: ['./cron-job-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class CronJobDashboardComponent {
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(CronJobDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);
  private readonly router = inject(Router);

  protected readonly adminBackLink = AppRoute.secured_admin_hub_page.url;
  protected readonly config: CronJobListConfig = createCronJobListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    router: this.router,
  });
  protected readonly refData = {};

  constructor() {
    this.sharedData.setPageName('Cron jobs');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Action failed',
      success: 'Cron jobs',
    });
  }
}
