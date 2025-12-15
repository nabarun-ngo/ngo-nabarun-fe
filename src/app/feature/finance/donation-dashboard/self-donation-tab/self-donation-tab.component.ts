import { Component, ElementRef, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { DonationDto } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { DonationService } from '../../service/donation.service';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { DonationDefaultValue, DonationRefData } from '../../finance.const';
import { Donation, DonationSummary, PagedDonations, Account } from '../../model';
import { getDonationSection } from '../../fields/donation.field';

@Component({
  selector: 'app-self-donation-tab',
  templateUrl: './self-donation-tab.component.html',
  styleUrls: ['./self-donation-tab.component.scss']
})
export class SelfDonationTabComponent extends Accordion<Donation> implements TabComponentInterface<PagedDonations> {
  @Input()
  summary: DonationSummary | undefined;
  @Input()
  payableAccounts: Account[] = [];

  constructor(
    protected donationService: DonationService,
    protected el: ElementRef,
  ) {
    super();
  }

  protected get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: DonationDefaultValue.pageNumber,
      pageSize: DonationDefaultValue.pageSize,
      pageSizeOptions: DonationDefaultValue.pageSizeOptions
    };
  }

  protected get tabComponents() {
    return {};
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
        value: data.periodDisplay || `${date(data.startDate)} - ${date(data.endDate)}`
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.status
      }
    ];
  }
  protected override prepareDetailedView(data: Donation, options?: { [key: string]: any; }): DetailedView[] {
    // Convert domain model back to DTO for donation.field.ts functions
    const donationDto: DonationDto = {
      id: data.id,
      donorId: data.donorId,
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      amount: data.amount,
      currency: data.currency,
      type: data.type,
      status: data.status,
      raisedOn: data.raisedOn,
      startDate: data.startDate,
      endDate: data.endDate,
      paidOn: data.paidOn,
      confirmedOn: data.confirmedOn,
      paymentMethod: data.paymentMethod,
      paidUsingUPI: data.paidUsingUPI,
      transactionRef: data.transactionRef,
      paidToAccount: data.paidToAccount ? {
        id: data.paidToAccount.id,
        accountType: data.paidToAccount.accountType,
        accountStatus: data.paidToAccount.status,
        currentBalance: data.paidToAccount.balance,
        accountHolderName: data.paidToAccount.accountHolderName,
        activatedOn: data.paidToAccount.activatedOn
      } as any : undefined,
      forEvent: data.forEvent,
      isGuest: data.isGuest,
      isPaymentNotified: data.isPaymentNotified,
      confirmedBy: data.confirmedBy,
      remarks: data.remarks,
      cancelletionReason: data.cancelletionReason,
      laterPaymentReason: data.laterPaymentReason,
      paymentFailureDetail: data.paymentFailureDetail
    };

    return [
      getDonationSection(donationDto, {
        isCreate: options && options['create'],
        refData: this.getRefData()
      })
    ];
  }
  protected override prepareDefaultButtons(data: Donation, options?: { [key: string]: any; }): AccordionButton[] {
    return data.status === 'RAISED' || data.status === 'PENDING' ?
      [
        {
          button_id: 'NOTIFY',
          button_name: 'Notify Payment',
        }
      ] : [];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'NOTIFY') {
      const donation = this.itemList[event.rowIndex];
      // Convert domain model to DTO for API call
      const donationDto: DonationDto = {
        id: donation.id,
        donorId: donation.donorId,
        donorName: donation.donorName,
        amount: donation.amount,
        currency: donation.currency,
        type: donation.type,
        status: donation.status,
        raisedOn: donation.raisedOn
      };
      this.donationService.updatePaymentInfo(donation.id, 'NOTIFY', donationDto as any)?.subscribe(data => {
        if (data) {
          this.itemList[event.rowIndex] = data;
        }
      });
    }
  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {

  }
  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.donationService.getSelfDonations({
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize
    }).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    });
  }
  onSearch($event: SearchEvent): void {
    console.log($event);
    if ($event.advancedSearch) {
      this.donationService.getSelfDonations({
        filter: removeNullFields($event.value)
      }).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
    else if ($event.reset) {
      this.donationService.getSelfDonations({}).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
  }
  async loadData(): Promise<void> {
    const data = await this.donationService.fetchMyDonations({});
    this.summary = data.summary;
    this.payableAccounts = data.accounts;
    this.setContent(data.donations.content!, data.donations.totalSize);
  }

}
