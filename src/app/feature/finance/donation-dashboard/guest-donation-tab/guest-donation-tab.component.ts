import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { DonationDefaultValue } from '../../finance.const';
import { Donation, PagedDonations } from '../../model';

@Component({
  selector: 'app-guest-donation-tab',
  templateUrl: './guest-donation-tab.component.html',
  styleUrls: ['./guest-donation-tab.component.scss']
})
export class GuestDonationTabComponent extends Accordion<Donation> implements TabComponentInterface<PagedDonations> {
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


  protected override prepareHighLevelView(data: Donation, options?: { [key: string]: any; }): AccordionCell[] {
    return [];
  }
  protected override prepareDetailedView(data: Donation, options?: { [key: string]: any; }): DetailedView[] {
    return [];
  }
  protected override prepareDefaultButtons(data: Donation, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {

  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {

  }
  override handlePageEvent($event: PageEvent): void {

  }
  onSearch($event: SearchEvent): void {

  }
  loadData(): void {
  }

}