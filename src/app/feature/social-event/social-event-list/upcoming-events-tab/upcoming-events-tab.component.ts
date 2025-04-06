import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { EventDetail, PaginateEventDetail } from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';

@Component({
  selector: 'app-upcoming-events-tab',
  templateUrl: './upcoming-events-tab.component.html',
  styleUrls: ['./upcoming-events-tab.component.scss'],
})
export class UpcomingEventsTabComponent extends Accordion<EventDetail> {
  @Input({ required: true }) set eventListDetail(page: PaginateEventDetail) {
    if (page) {
      this.setContent(page.content!, page.totalSize);
    }
  }

  protected override prepareHighLevelView(
    data: EventDetail,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return [];
  }
  protected override prepareDetailedView(
    data: EventDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [];
  }
  protected override prepareDefaultButtons(
    data: EventDetail,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    return [];
  }

  override handlePageEvent($event: PageEvent): void {}

  protected override onClick(event: {
    buttonId: string;
    rowIndex: number;
  }): void {}

  
  protected override onAccordionOpen(event: { rowIndex: number }): void {}

  create() {}
}
