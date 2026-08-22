import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  ListOverlayDirective,
  UniversalListDashboardModule,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import {
  DonorMergeSheetComponent,
  type DonorMergeConfirmation,
} from '../components/donor-merge-sheet/donor-merge-sheet.component';
import {
  createDonorListConfig,
  type DonorListConfig,
} from '../config/donor.config';
import { GUEST_DONOR_PHONE_ENGINE_OPTIONS } from '../config/donor.forms';
import { DonorDataSource } from '../data/donor-data.source';
import type { Donor, DonorRefData } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-donor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    ListOverlayDirective,
    UniversalListDashboardModule,
    DonorMergeSheetComponent,
    NavBackComponent,
  ],
  templateUrl: './donor-dashboard.component.html',
  styleUrls: ['./donor-dashboard.component.scss'],
})
export class DonorDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(DonorDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  @ViewChild(ListDashboardComponent)
  private readonly listDashboard?: ListDashboardComponent<Donor>;

  protected readonly financeBackLink = AppRoute.secured_finance_hub_page.url;
  protected readonly refData = readRouteRefData(this.route) as DonorRefData;
  protected readonly phoneEngineOptions = GUEST_DONOR_PHONE_ENGINE_OPTIONS;
  protected readonly config: DonorListConfig = createDonorListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    openMerge: donors => this.openMerge(donors),
  });

  protected mergeSheetOpen = false;
  protected mergeSaving = false;
  protected mergeDonors: Donor[] = [];

  constructor() {
    this.sharedData.setPageName('Donors');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Donor action failed',
      success: 'Donor',
    });
  }

  protected onMergeSheetClosed(): void {
    this.mergeSheetOpen = false;
    this.mergeSaving = false;
    this.mergeDonors = [];
  }

  protected onMergeConfirmed(request: DonorMergeConfirmation): void {
    this.mergeSaving = true;
    this.data.mergeGuestDonors(request).subscribe({
      next: merged => {
        this.mergeSaving = false;
        this.mergeSheetOpen = false;
        this.mergeDonors = [];
        this.listDashboard?.controller.dashboard.listPage.clearSelection();
        this.listDashboard?.controller.dashboard.listPage.reloadList();
        this.modal.openNotificationModal({
          title: 'Donors merged',
          description: `Guest donors were merged into ${merged.fullName ?? merged.id}.`,
        }, 'notification', 'success');
      },
      error: () => {
        this.mergeSaving = false;
        this.modal.openNotificationModal({
          title: 'Merge failed',
          description: 'Could not merge the selected donors. Please try again.',
        }, 'notification', 'error');
      },
    });
  }

  private openMerge(donors: Donor[]): void {
    this.mergeDonors = donors;
    this.mergeSheetOpen = true;
  }
}
