import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { FormDefinition, FormValues } from '@nabarun-ngo/forms-core';
import {
  ListCreateSheetComponent,
  ListDashboardComponent,
  ListOverlayDirective,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  readRouteRefData,
  type ListDashboardNotification,
  type ListDashboardRuntime,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import {
  FileUpload,
  FileUploadComponent,
} from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedFormsModule } from 'src/app/shared/modules/forms.module';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import {
  createEarningListConfig,
  EARNING_CREATE_DOCUMENT_HINT,
  EARNING_DOCUMENT_TYPES,
  type EarningListConfig,
} from '../config/earning.config';
import {
  buildEarningCreateForm,
  defaultEarningCreateValues,
} from '../config/earning.forms';
import { createEarningContext } from '../config/earning.rules';
import { EarningDataSource } from '../data/earning-data.source';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';
import type {
  Earning,
  EarningFilterCriteria,
  EarningListContext,
  EarningRefDataMap,
} from '../domain';

@Component({
  selector: 'app-earning-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    ListOverlayDirective,
    ListCreateSheetComponent,
    UniversalListDashboardModule,
    NavBackComponent,
    SharedFormsModule,
  ],
  templateUrl: './earning-dashboard.component.html',
  styleUrls: ['./earning-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class EarningDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(EarningDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);
  private createFormAccountsRef?: EarningListContext['payableAccountOptions'];
  private createFormDefinitionCache?: FormDefinition;

  protected readonly refData = readRouteRefData(this.route) as EarningRefDataMap;
  protected readonly financeBackLink = AppRoute.secured_finance_hub_page.url;
  protected readonly createHint = EARNING_CREATE_DOCUMENT_HINT;
  protected readonly createDocumentTypes = EARNING_DOCUMENT_TYPES;
  protected readonly createInitialValues = defaultEarningCreateValues();
  protected createDocuments: FileUpload[] = [];
  protected readonly routeContext: EarningListContext = createEarningContext({
    refData: this.refData,
  });
  protected readonly config: EarningListConfig = createEarningListConfig({
    data: this.data,
    authorization: this.authorization,
    context: this.routeContext,
  });
  protected get createFormDefinition(): FormDefinition {
    const accounts = this.routeContext.payableAccountOptions;
    if (!this.createFormDefinitionCache || this.createFormAccountsRef !== accounts) {
      this.createFormAccountsRef = accounts;
      this.createFormDefinitionCache = buildEarningCreateForm(this.refData, accounts);
    }
    return this.createFormDefinitionCache;
  }

  constructor() {
    this.sharedData.setPageName('Earnings');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Earning action failed',
      success: 'Earning',
    });
  }

  protected onCreateDocumentsChange(files: FileUpload[]): void {
    this.createDocuments = files ?? [];
  }

  protected onCreateSaved(
    values: FormValues,
    controller: ListDashboardRuntime<Earning, EarningFilterCriteria, EarningListContext>,
  ): void {
    controller.dashboard.setCreateContextExtras({
      pendingDocuments: this.createDocuments,
    });
    controller.submitCreate(values);
    this.createDocuments = [];
  }

  protected onCreateDismissed(
    controller: ListDashboardRuntime<Earning, EarningFilterCriteria, EarningListContext>,
  ): void {
    this.createDocuments = [];
    controller.dashboard.createPage.close();
  }
}
