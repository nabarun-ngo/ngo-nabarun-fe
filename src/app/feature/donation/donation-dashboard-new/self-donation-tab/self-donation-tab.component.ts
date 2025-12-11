import { Component, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { DonationDto, PagedResultDonationDto } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { DonationNewService } from '../../donation-new.service';
import { date } from 'src/app/core/service/utilities.service';
import { getDonationSection } from '../../donation.field';

@Component({
  selector: 'app-self-donation-tab',
  templateUrl: './self-donation-tab.component.html',
  styleUrls: ['./self-donation-tab.component.scss']
})
export class SelfDonationTabComponent extends Accordion<DonationDto> implements TabComponentInterface<PagedResultDonationDto> {

  constructor(
    protected taskService: DonationNewService,
    protected el: ElementRef,
  ) {
    super();
  }

  override ngOnInit(): void {
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
        refDataSection: 'donationTypes'
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
        refDataSection: 'donationStatuses'
      }
    ];
  }
  protected override prepareDetailedView(data: DonationDto, options?: { [key: string]: any; }): DetailedView[] {
    return [
      getDonationSection(data, {
        mode: 'view',
        refData: this.getRefData()
      })
    ];
  }
  protected override prepareDefaultButtons(data: DonationDto, options?: { [key: string]: any; }): AccordionButton[] {
    return [

    ];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    throw new Error('Method not implemented.');
  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    throw new Error('Method not implemented.');
  }
  override handlePageEvent($event: PageEvent): void {
    throw new Error('Method not implemented.');
  }
  onSearch($event: SearchEvent): void {
    throw new Error('Method not implemented.');
  }
  loadData(): void {
  }

}
