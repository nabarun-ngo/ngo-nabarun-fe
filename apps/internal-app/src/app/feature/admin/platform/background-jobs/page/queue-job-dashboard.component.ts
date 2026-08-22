import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
  createQueueJobListConfig,
  type QueueJobListConfig,
} from '../config/queue-job.config';
import { resolveQueueJobPermissions } from '../config/queue-job.rules';
import { QueueJobDataSource } from '../data/queue-job-data.source';
import type { QueueJob, QueueOverview } from '../domain';
import { QueueStatsCardComponent } from './queue-stats-card.component';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-queue-job-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
    QueueStatsCardComponent,
  ],
  templateUrl: './queue-job-dashboard.component.html',
  styleUrls: ['./queue-job-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class QueueJobDashboardComponent implements OnInit {
  @ViewChild(ListDashboardComponent) private dashboard?: ListDashboardComponent<QueueJob>;

  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(QueueJobDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly adminBackLink = AppRoute.secured_admin_hub_page.url;
  protected readonly permissions = resolveQueueJobPermissions(this.authorization);
  protected readonly config: QueueJobListConfig = createQueueJobListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    onMutation: () => this.reload(),
  });

  protected overview: QueueOverview | null = null;
  protected overviewLoading = false;

  constructor() {
    this.sharedData.setPageName('Background Jobs');
  }

  ngOnInit(): void {
    this.loadOverview();
  }

  protected onRefresh(): void {
    this.reload();
  }

  protected onPause(): void {
    this.config.operations?.pauseQueue();
  }

  protected onResume(): void {
    this.config.operations?.resumeQueue();
  }

  protected onClearOldJobs(): void {
    this.config.operations?.cleanOldJobs();
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Action failed',
      success: 'Background jobs',
    });
  }

  /** A retried or removed job no longer matches the open sheet, so close it first. */
  private reload(): void {
    const dashboard = this.dashboard?.controller.dashboard;
    if (dashboard?.detailPage.open) {
      dashboard.detailPage.close();
    }
    dashboard?.listPage.reloadList();
    this.loadOverview();
  }

  private loadOverview(): void {
    this.overviewLoading = true;
    this.data.getOverview().subscribe({
      next: overview => {
        this.overview = overview;
        this.overviewLoading = false;
      },
      error: () => {
        this.overview = null;
        this.overviewLoading = false;
      },
    });
  }
}
