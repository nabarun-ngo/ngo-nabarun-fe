import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { DonationDto, PagedResultDonationDto } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';

@Component({
  selector: 'app-member-donation-tab',
  templateUrl: './member-donation-tab.component.html',
  styleUrls: ['./member-donation-tab.component.scss']
})
export class MemberDonationTabComponent extends Accordion<DonationDto> implements TabComponentInterface<PagedResultDonationDto> {
  override ngOnInit(): void {
  }
  protected override prepareHighLevelView(data: DonationDto, options?: { [key: string]: any; }): AccordionCell[] {
    return [];
  }
  protected override prepareDetailedView(data: DonationDto, options?: { [key: string]: any; }): DetailedView[] {
    return [];
  }
  protected override prepareDefaultButtons(data: DonationDto, options?: { [key: string]: any; }): AccordionButton[] {
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