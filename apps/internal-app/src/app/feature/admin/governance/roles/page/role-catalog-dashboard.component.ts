import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
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
import { createRoleCatalogListConfig, type RoleCatalogListConfig } from '../config/role-catalog.config';
import { createRoleCatalogContext } from '../config/role-catalog.rules';
import { RoleCatalogDataSource } from '../data/role-catalog-data.source';
import type { RoleCatalogItem } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-role-catalog-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ListDashboardComponent, UniversalListDashboardModule, NavBackComponent],
  templateUrl: './role-catalog-dashboard.component.html',
  styleUrls: ['./role-catalog-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class RoleCatalogDashboardComponent {
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(RoleCatalogDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  @ViewChild(ListDashboardComponent) private listDashboard?: ListDashboardComponent<RoleCatalogItem>;

  protected readonly adminBackLink = AppRoute.secured_admin_hub_page.url;
  protected readonly routeContext = createRoleCatalogContext();
  protected readonly config: RoleCatalogListConfig = createRoleCatalogListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
    reloadList: () => this.reload(),
    showChip: chipId => this.listDashboard?.controller.dashboard.listPage.onChipSelect(chipId),
  });
  protected readonly refData = {};

  constructor() {
    this.sharedData.setPageName('Roles Catalog');
  }

  /** The detail sheet may still show the entry that was just deleted. */
  private reload(): void {
    const dashboard = this.listDashboard?.controller.dashboard;
    if (dashboard?.detailPage.open) dashboard.detailPage.close();
    dashboard?.listPage.reloadList();
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Action failed',
      success: 'Roles Catalog',
    });
  }
}
