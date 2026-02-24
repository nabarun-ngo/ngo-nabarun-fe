import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { DonationRefData } from '../../finance.const';
import { Donation, DonationSummary } from '../../model';
import { BaseDonationTabComponent } from '../base-donation-tab.component';
import { ProjectSelectionService } from 'src/app/feature/project/service/project-selection.service';
import { DonationService } from '../../service/donation.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { ModalService } from 'src/app/core/service/modal.service';

@Component({
  selector: 'app-self-donation-tab',
  templateUrl: './self-donation-tab.component.html',
  styleUrls: ['./self-donation-tab.component.scss']
})
export class SelfDonationTabComponent extends BaseDonationTabComponent {

  @Input()
  summary: DonationSummary | undefined;

  constructor(
    protected override donationService: DonationService,
    protected override identityService: UserIdentityService,
    protected override modalService: ModalService,
    protected override projectSelectionService: ProjectSelectionService,
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
        value: data.formattedAmount,
      },
      {
        type: 'text',
        value: data?.startDate && data?.endDate ? `${date(data?.startDate, 'dd MMM yyyy')} - ${date(data?.endDate, 'dd MMM yyyy')}` : '-'
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.status
      }
    ];
  }

  protected override prepareDefaultButtons(data: Donation, options?: { [key: string]: any; }): AccordionButton[] {
    return data.status === 'RAISED' || data.status === 'PENDING' ?
      [
        // {
        //   button_id: 'NOTIFY',
        //   button_name: 'Notify Payment',
        // }
      ] : [];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'NOTIFY') {
      const donation = this.itemList[event.rowIndex];
      this.donationService.updatePaymentInfo(donation.id, 'NOTIFY', donation)?.subscribe(data => {
        if (data) {
          this.itemList[event.rowIndex] = data;
        }
      });
    }
  }



  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.donationService.getSelfDonations({
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize,
      skipSummary: true,
      skipAccounts: true
    }).subscribe(data => {
      this.setContent(data.donations.content!, data.donations.totalSize);
    });
  }


  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch) {
      this.donationService.getSelfDonations({
        filter: removeNullFields($event.value),
        skipSummary: true,
        skipAccounts: true
      }).subscribe(data => {
        this.setContent(data.donations.content!, data.donations.totalSize);
      });
    }
    else if ($event.reset) {
      this.donationService.getSelfDonations({
        skipSummary: true,
        skipAccounts: true
      }).subscribe(data => {
        this.setContent(data.donations.content!, data.donations.totalSize);
      });
    }
  }


  loadData(): void {
    this.donationService.getSelfDonations({
      skipSummary: false,
      skipAccounts: false
    }).subscribe(data => {
      this.summary = data.summary;
      this.payableAccounts = data.accounts;
      this.setContent(data.donations.content!, data.donations.totalSize);
    });
  }

  protected override handleConfirmCreate(): void { }

}
