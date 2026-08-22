import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ListDashboardComponent,
  ListOverlayDirective,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  readRouteRefData,
  type ListDetailSection,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import {
  createDonationListConfig,
  type DonationListConfig,
} from '../config/donation.config';
import { DONATION_PAYMENT_DOCUMENT_HINT } from '../config/donation.forms';
import { createDonationContext } from '../config/donation.rules';
import { DonationDataSource } from '../data/donation-data.source';
import type { Donation, DonationListContext, DonationRefData } from '../domain';
import { DonorDataSource } from '../../donors/data/donor-data.source';
import {
  buildDonorListDetailSections,
  buildOwnDonorDetailSections,
} from '../../donors/config/donor.view';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-donation-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    ListOverlayDirective,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './donation-dashboard.component.html',
  styleUrls: ['./donation-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class DonationDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(DonationDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);
  private readonly donorData = inject(DonorDataSource);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly refData = readRouteRefData(this.route) as DonationRefData;
  protected readonly forEventId =
    this.route.snapshot.queryParamMap.get('forEventId') ?? undefined;
  protected readonly financeBackLink = AppRoute.secured_finance_hub_page.url;
  protected readonly documentHint = DONATION_PAYMENT_DOCUMENT_HINT;
  protected readonly routeContext: DonationListContext = createDonationContext({
    refData: this.refData,
    forEventId: this.forEventId,
    projectLabel: this.route.snapshot.queryParamMap.get('projectLabel')
      ?? this.route.snapshot.queryParamMap.get('eventLabel')
      ?? undefined,
  });
  protected readonly config: DonationListConfig = createDonationListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
    openDonor: donation => this.openDonor(donation),
  });

  private readonly canReadDonors = this.authorization
    .effectivePermissions()
    .includes(SCOPE.read.donors);

  protected donorDetailOpen = false;
  protected donorDetailLoading = false;
  protected donorDetailTitle = 'Donor details';
  protected donorDetailSections: ListDetailSection[] = [];

  constructor() {
    const projectId = this.route.snapshot.queryParamMap.get('projectId');
    this.sharedData.setPageName(projectId ? 'Project Donations' : 'Donations');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Donation action failed',
      success: 'Donation',
    });
  }

  protected closeDonor(): void {
    this.donorDetailOpen = false;
    this.donorDetailLoading = false;
    this.donorDetailSections = [];
  }

  private openDonor(donation: Donation): void {
    this.donorDetailTitle =
      donation.displayName || donation.donorName || donation.donorId;
    this.donorDetailSections = [];
    this.donorDetailLoading = true;
    this.donorDetailOpen = true;

    // Without donor-read access the only donations on screen are the user's own,
    // so their standing comes from the self-scoped summary instead of the donor record.
    if (!this.canReadDonors) {
      this.donorData.fetchOwnSummary()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: summary => {
            this.donorDetailLoading = false;
            this.donorDetailSections = buildOwnDonorDetailSections(summary, {
              fullName: donation.donorName || donation.displayName,
              email: donation.donorEmail,
              phone: donation.donorPhone,
            });
          },
          error: () => {
            this.donorDetailLoading = false;
          },
        });
      return;
    }

    this.donorData.fetchDonorById(donation.donorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: donor => {
          this.donorDetailLoading = false;
          if (!donor) return;
          this.donorDetailTitle = donor.fullName ?? donor.id;
          this.donorDetailSections = buildDonorListDetailSections(donor);
        },
        error: () => {
          this.donorDetailLoading = false;
        },
      });
  }

}
