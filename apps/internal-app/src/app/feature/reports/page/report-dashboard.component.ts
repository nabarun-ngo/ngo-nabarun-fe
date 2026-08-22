import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  UniversalListDashboardModule,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { createReportListConfig, type ReportListConfig } from '../config/report.config';
import { createReportContext } from '../config/report.rules';
import { ReportDataSource } from '../data/report-data.source';
import type { Report, ReportListContext, ReportType } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class ReportDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(ReportDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  @ViewChild(ListDashboardComponent) private listDashboard?: ListDashboardComponent<Report>;

  /** Finance and Projects mount this page on their own URL, each with its own back target. */
  protected readonly backLink =
    (this.route.snapshot.data['backTo'] as string | undefined) ?? AppRoute.secured_dashboard_page.url;
  protected readonly backLabel =
    (this.route.snapshot.data['backLabel'] as string | undefined) ?? 'Dashboard';
  protected readonly refData = {};
  protected readonly routeContext: ReportListContext = createReportContext({
    types: (this.route.snapshot.data['reportTypes'] as ReportType[] | undefined) ?? [],
    activeTypeCode: this.route.snapshot.queryParamMap.get('reportCode') ?? undefined,
  });
  protected readonly config: ReportListConfig = createReportListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
    reloadList: () => this.reload(),
  });

  constructor() {
    this.sharedData.setPageName('Reports');
  }

  /** Approving or deleting changes what the open sheet shows, so close it first. */
  private reload(): void {
    const dashboard = this.listDashboard?.controller.dashboard;
    if (dashboard?.detailPage.open) dashboard.detailPage.close();
    dashboard?.listPage.reloadList();
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Report action failed',
      success: 'Reports',
    });
  }
}
