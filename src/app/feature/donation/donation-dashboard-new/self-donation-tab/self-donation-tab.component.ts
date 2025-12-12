import { Component, ElementRef, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccountDetailDto, DonationDto, DonationSummaryDto, PagedResultDonationDto } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { DonationNewService } from '../../donation-new.service';
import { date } from 'src/app/core/service/utilities.service';
import { getDonationSection } from '../../donation.field';
import { DonationDefaultValue, DonationRefData } from '../../donation.const';

@Component({
  selector: 'app-self-donation-tab',
  templateUrl: './self-donation-tab.component.html',
  styleUrls: ['./self-donation-tab.component.scss']
})
export class SelfDonationTabComponent extends Accordion<DonationDto> implements TabComponentInterface<PagedResultDonationDto> {
  @Input()
  summary: DonationSummaryDto | undefined;
  @Input()
  payableAccounts: AccountDetailDto[] = [];

  constructor(
    protected donationService: DonationNewService,
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
  protected override prepareHighLevelView(data: DonationDto, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.type!,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.type
      },
      {
        type: 'text',
        value: `${data.currency} ${data.amount}`,
      },
      {
        type: 'text',
        value: `${date(data.startDate)} - ${date(data.endDate)}`
      },
      {
        type: 'text',
        value: data?.status!,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.status
      }
    ];
  }
  protected override prepareDetailedView(data: DonationDto, options?: { [key: string]: any; }): DetailedView[] {
    return [
      getDonationSection(data, {
        isCreate: options && options['create'],
        refData: this.getRefData()
      })
    ];
  }
  protected override prepareDefaultButtons(data: DonationDto, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {

  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {

  }
  override handlePageEvent($event: PageEvent): void {
    this.donationService.getSelfDonations({
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize
    }).subscribe(data => {
      this.setContent(data.content, data.totalSize);
    });
  }
  onSearch($event: SearchEvent): void {
    console.log($event);
    // this.donationService.getSelfDonations($event.pageIndex, $event.pageSize, $event.filter).subscribe(data => {
    //   this.setContent(data.content, data.totalSize);
    // });
  }
  async loadData(): Promise<void> {
    const data = await this.donationService.fetchMyDonations({});
    this.summary = data.summary;
    this.payableAccounts = data.accounts;
    this.setContent(data.donations.content, data.donations.totalSize);
  }

}
