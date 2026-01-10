import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { EventDetail, PaginateEventDetail } from 'src/app/core/api-client/models';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { UpcomingEventsTabComponent } from '../upcoming-events-tab/upcoming-events-tab.component';

@Component({
  selector: 'app-completed-events-tab',
  templateUrl: './completed-events-tab.component.html',
  styleUrls: ['./completed-events-tab.component.scss']
})
export class CompletedEventsTabComponent extends UpcomingEventsTabComponent {

  protected override prepareDefaultButtons(data: EventDetail, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }
}
