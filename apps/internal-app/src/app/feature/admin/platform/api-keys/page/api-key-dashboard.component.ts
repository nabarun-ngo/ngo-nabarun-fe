import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import type { RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import {
  createApiKeyListConfig,
  type ApiKeyListConfig,
} from '../config/api-key.config';
import { ApiKeyDataSource } from '../data/api-key-data.source';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-api-key-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './api-key-dashboard.component.html',
  styleUrls: ['./api-key-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class ApiKeyDashboardComponent implements OnInit {
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(ApiKeyDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly adminBackLink = AppRoute.secured_admin_hub_page.url;
  protected readonly config: ApiKeyListConfig = createApiKeyListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
  });
  protected refData: RefDataMap = { scopes: [] };

  constructor() {
    this.sharedData.setPageName('API keys');
  }

  ngOnInit(): void {
    this.data.listScopes().subscribe(scopes => {
      this.refData = { scopes: scopes.map(s => ({ key: s, label: s })) };
    });
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Action failed',
      success: 'API keys',
    });
  }
}
