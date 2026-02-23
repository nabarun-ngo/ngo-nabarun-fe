import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionRow } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Donation, DonationSummary } from '../../model';
import { BaseDonationTabComponent } from '../base-donation-tab.component';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';
import { SearchSelectModalService } from 'src/app/shared/components/search-select-modal/search-select-modal.service';
import { Validators } from '@angular/forms';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { getDonorSection } from '../../fields/donation.field';
import { DonationRefData } from '../../finance.const';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { User } from 'src/app/feature/member/models/member.model';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { DonationService } from '../../service/donation.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ProjectSelectionService } from 'src/app/feature/project/service/project-selection.service';

@Component({
  selector: 'app-member-donation-tab',
  templateUrl: './member-donation-tab.component.html',
  styleUrls: ['./member-donation-tab.component.scss']
})
export class MemberDonationTabComponent extends BaseDonationTabComponent {
  protected override detailedViews: DetailedView[] = [];
  protected summary!: DonationSummary;
  private readonly memberModalConfig = (kv: KeyValue[]) => {
    return {
      title: 'Select Member',
      buttonText: { search: 'Select', close: 'Close' },
      searchFormFields: [{
        formControlName: 'userId',
        inputModel: {
          html_id: 'user_search',
          inputType: 'text',
          tagName: 'input',
          autocomplete: true,
          placeholder: 'Select a member',
          selectList: kv
        },
        validations: [Validators.required]
      }]
    } as SearchSelectModalConfig;
  };
  protected profile: User | undefined;
  private selectedRows: AccordionRow[] = [];

  constructor(
    protected override donationService: DonationService,
    protected override identityService: UserIdentityService,
    protected override modalService: ModalService,
    protected override projectSelectionService: ProjectSelectionService,
    protected router: Router,
    protected route: ActivatedRoute,
    private searchSelectModalService: SearchSelectModalService
  ) {
    super(donationService, identityService, modalService, projectSelectionService);
  }

  override onInitHook(): void {
    this.setHeaderRow([
      {
        value: 'Donation Type',
        rounded: true
      },
      {
        value: 'Donation Amount',
        rounded: true
      },
      {
        value: 'Donation Period',
        rounded: true
      },
      {
        value: 'Donation Status',
        rounded: true
      }
    ]);
    this.setSelectable(true);
  }


  protected override prepareHighLevelView(data: Donation, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.type,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.type
      },
      {
        type: 'text',
        value: data?.formattedAmount,
      },
      {
        type: 'text',
        value: data?.startDate && data?.endDate ? `${date(data?.startDate)} - ${date(data?.endDate)}` : '-'
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.status
      }
    ];
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.donationService.getUserDonations(this.profile?.id!, {
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize
    }).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    });
  }

  onSelectionChange(selectedRows: AccordionRow[]) {
    this.selectedRows = selectedRows;
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch) {
      this.donationService.getUserDonations(this.profile?.id!, {
        filter: removeNullFields($event.value)
      }).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
    else if ($event.reset) {
      this.donationService.getUserDonations(this.profile?.id!, {}).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
  }

  loadData(changeUser: boolean = false): void {
    this.donationService.fetchMembers({ pageIndex: 0, pageSize: 100000, filter: {} }).subscribe(users => {
      const memberId = this.route.snapshot.queryParams['member_id'];
      if (memberId && !changeUser) {
        this.profile = users.content?.find(f => f.id == memberId);
        this.loadUserData();
        return;
      }
      const kv = users.content?.map(u => ({
        key: u.id,
        displayValue: u.status === 'ACTIVE' ? u.fullName : `${u.fullName} (${u.status})`
      } as KeyValue));

      const config = this.memberModalConfig(kv!);

      this.searchSelectModalService.open(config, {
        width: 700,
      }).subscribe((event: SearchEvent) => {
        this.profile = users.content?.find(f => f.id === event.value.userId);
        this.loadUserData();
      });
    });
  }


  private loadUserData() {
    if (this.profile) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { member_id: this.profile.id },
        queryParamsHandling: 'merge',
      });
      this.detailedViews = [
        getDonorSection({
          donorName: this.profile.fullName,
          donorEmail: this.profile.email,
          donorPhone: this.profile.primaryNumber?.fullNumber!
        }, {})];
      this.donationService.fetchUserDonations(this.profile.id, {}).subscribe(data => {
        this.setContent(data.donations?.content!, data.donations?.totalSize);
        this.summary = data.summary;
      });
    }
  }

  protected override handleConfirmCreate(): void {
    const donation_form = this.getSectionForm('donation_detail', 0, true);
    if (donation_form?.valid) {
      const donation = {
        ...donation_form?.value,
        donorId: this.profile?.id!,
        forEvent: donation_form?.value.donationFor === 'PROJECT' ? this.forEventId : null
      } as Donation;

      if (donation_form?.value.type === 'ONETIME'
        && donation_form?.value.donationFor === 'PROJECT'
        && !this.forEventId
      ) {
        this.modalService.openNotificationModal({
          title: 'Project Donation',
          description: 'Please select a project for this one-time donation.'
        }, 'notification', 'error')
        return;
      }

      this.donationService.createDonation(donation, false).subscribe((data) => {
        this.hideForm(0, true);
        this.addContentRow(data, true);
      });
    } else {
      donation_form?.markAllAsTouched();
    }
  }


  bulkUpdate(): void {
    const dons = this.selectedRows.map((m) => this.itemList[m.index]);

    if (!this.validateDonations(dons)) {
      return;
    }

    // Navigate to bulk edit page with donations data
    const donIds = dons.map(d => d.id).join(',');
    this.router.navigate([AppRoute.secured_donation_bulk_edit_page.url], {
      queryParams: { ids: donIds, member_id: this.profile?.id },
      state: { donations: dons }
    });
  }

  protected validateDonations(donations: Donation[]): boolean {
    const uniqueTypes = new Set(donations.map(d => d.type));
    if (uniqueTypes.size > 1) {
      this.modalService.openNotificationModal(AppDialog.err_sel_don_nt_sm_typ, 'notification', 'error');
      return false;
    }

    const uniqueStatus = new Set(donations.map(d => d.status));
    if (uniqueStatus.size > 1) {
      this.modalService.openNotificationModal(AppDialog.err_sel_don_nt_sm_sts, 'notification', 'error');
      return false;
    }

    const uniqueAmount = new Set(donations.map(d => d.amount));
    if (uniqueAmount.size > 1) {
      this.modalService.openNotificationModal({
        title: 'Error',
        description: 'All donations must have the same amount',
      }, 'notification', 'error');
      return false;
    }

    return true;
  }

}