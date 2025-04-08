import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { EventDetail, PaginateEventDetail } from 'src/app/core/api/models';
import { date } from 'src/app/core/service/utilities.service';
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
    return [
      {
        type: 'text',
        bgColor: 'bg-purple-200',
        value: data.eventTitle!,
        rounded: true
      },
      {
        type: 'text',
        value: data.eventLocation!,
      },
      {
        type: 'text',
        value: date(data.eventDate!),
      }
    ];
  }
  protected override prepareDetailedView(
    data: EventDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [
      {
        section_name : 'Event Details',
        section_type: 'key_value',
        section_form: new FormGroup({}),
        section_html_id: 'event-detail',
        content: [
          {
            field_name: 'Event Id',
            field_value: data.id!,
            field_html_id: 'event-id',
          },
          {
            field_name: 'Event Title',
            field_value: data.eventTitle!,
            field_html_id: 'event-title',
          },
          {
            field_name: 'Event Description',
            field_value: data.eventDescription!,
            field_html_id: 'event-description',
          },
          {
            field_name: 'Event Location',
            field_value: data.eventLocation!,
            field_html_id: 'event-location',
          },
          {
            field_name: 'Event Date',
            field_value: date(data.eventDate!),
            field_html_id: 'event-date',
          },
          {
            field_name: 'Event Budget',
            field_value: ''+data.eventBudget!,
            field_html_id: 'event-budget',
          },
        ]
      },
      {
        section_name: 'Event Expenses',
        section_html_id: 'event-expenses',
        section_type: 'key_value',
        section_form: new FormGroup({}),
        
      }
      
    ];
  }
  protected override prepareDefaultButtons(
    data: EventDetail,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    return [
      {
        button_id: 'cancel',
        button_name: 'Cancel',
      },
      {
        button_id: 'edit',
        button_name: 'Edit',
      }
    ];
  }

  override handlePageEvent($event: PageEvent): void {}

  protected override onClick(event: {
    buttonId: string;
    rowIndex: number;
  }): void {}

  
  protected override onAccordionOpen(event: { rowIndex: number }): void {}

  create() {}
}
