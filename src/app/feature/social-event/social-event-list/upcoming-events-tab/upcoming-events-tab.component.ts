import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { EventDetail, PaginateEventDetail } from 'src/app/core/api/models';
import { date } from 'src/app/core/service/utilities.service';
import { Accordion } from 'src/app/shared/utils/accordion';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { EventsService } from '../../events.service';
import { eventDetailSection } from '../../social-event.field';
import { DefaultValue } from '../../events.conts';

@Component({
  selector: 'app-upcoming-events-tab',
  templateUrl: './upcoming-events-tab.component.html',
  styleUrls: ['./upcoming-events-tab.component.scss'],
})
export class UpcomingEventsTabComponent extends Accordion<EventDetail> {
  constructor(private eventService: EventsService) {
    super();
    super.init(
      DefaultValue.pageNumber,
      DefaultValue.pageSize,
      DefaultValue.pageSizeOptions
    );
  }

  override ngOnInit(): void {
    this.setHeaderRow([
      {
        type: 'text',
        value: 'Event Id',
        rounded: true,
      },
      {
        type: 'text',
        value: 'Event Title',
        rounded: true,
      },
      {
        type: 'text',
        value: 'Event Location',
        rounded: true,
      },
      {
        type: 'date',
        value: 'Event Date',
        rounded: true,
      },
    ]);
  }

  protected override prepareHighLevelView(
    data: EventDetail,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return [
      {
        type: 'text',
        bgColor: 'bg-purple-200',
        value: data ? data.id! : '',
        rounded: true,
      },
      {
        type: 'text',
        value: data ? data.eventTitle! : '',
      },
      {
        type: 'text',
        value: data ? data.eventLocation! : '',
      },
      {
        type: 'text',
        value: data ? date(data.eventDate!) : '',
      },
    ];
  }
  protected override prepareDetailedView(
    data: EventDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    let isCreate = options && options!['create'];
    console.log('data', data);
    return [
      eventDetailSection(data),
      // {
      //   section_name: 'Event Expenses',
      //   section_html_id: 'event-expenses',
      //   section_type: 'key_value',
      //   section_form: new FormGroup({}),
      //   hide_section: isCreate,
      // },
    ];
  }
  protected override prepareDefaultButtons(
    data: EventDetail,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    let isCreate = options && options!['create'];
    if (isCreate) {
      return [
        {
          button_id: 'cancel_create',
          button_name: 'Cancel',
        },
        {
          button_id: 'confirm_create',
          button_name: 'Create',
        },
      ];
    }
    return [
      {
        button_id: 'edit',
        button_name: 'Edit',
      },
    ];
  }

  override handlePageEvent($event: PageEvent): void {
    console.log('pageEvent', $event);
    this.eventService
      .getSocialEventList($event.pageIndex, $event.pageSize, false)
      .subscribe((data) => {
        this.setContent(data!.content!, data!.totalSize);
      });
  }

  protected override onClick(event: {
    buttonId: string;
    rowIndex: number;
  }): void {
    console.log('buttonId', event.buttonId);
    console.log('rowIndex', event.rowIndex);
    console.log('activeButtonId', this.activeButtonId);
    switch (event.buttonId) {
      // Create Event
      case 'confirm_create':
        var createForm = this.getSectionForm('event-detail', 0, true)!;
        createForm.markAllAsTouched();
        if (createForm.valid) {
          this.createEvent(createForm.value);
        }
        break;
      case 'cancel_create':
        this.hideForm(0, true);
        break;
      // Edit Event
      case 'edit':
        this.showEditForm(event.rowIndex, ['event-detail']);
        this.activeButtonId = event.buttonId;
        break;
      case 'CONFIRM':
        if (this.activeButtonId === 'edit') {
          var editForm = this.getSectionForm('event-detail', event.rowIndex)!;
          console.log('editForm', editForm);
          editForm.markAllAsTouched();
          if (editForm.valid) {
            this.updateEvent(event.rowIndex, editForm.value);
          }
        }
        break;
      case 'CANCEL':
        this.hideForm(event.rowIndex);
        this.activeButtonId = undefined;
        break;
    }
  }

  private updateEvent(rowIndex: number, value: EventDetail) {
    let eventDetail = this.itemList[rowIndex];
    this.eventService
      .editSocialEvent(eventDetail.id!, value)
      .subscribe((data) => {
        this.hideForm(rowIndex);
        this.updateContentRow(data!, rowIndex);
      });
  }

  private createEvent(value: EventDetail) {
    this.eventService.createSocialEvent(value).subscribe((data) => {
      this.hideForm(0, true);
      this.addContentRow(data!, true);
    });
  }

  protected override onAccordionOpen(event: { rowIndex: number }): void {
    
  }
}
