import { Component, Input, AfterContentInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { Meeting, PagedMeeting } from '../../model/meeting.model';
import { MeetingDefaultValue, MeetingConstant } from '../../communication.const';
import { meetingHeader, getMeetingSection } from '../../fields/meeting.field';
import { CommunicationService } from '../../service/communication.service';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-meeting-accordion',
  templateUrl: './meeting-accordion.component.html',
  styleUrls: ['./meeting-accordion.component.scss']
})
export class MeetingAccordionComponent extends Accordion<Meeting> implements AfterContentInit {

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: MeetingDefaultValue.pageNumber,
      pageSize: MeetingDefaultValue.pageSize,
      pageSizeOptions: MeetingDefaultValue.pageSizeOptions
    };
  }

  @Input()
  accordionData?: PagedMeeting;

  @Input()
  refData?: { [name: string]: any[] };

  defaultValue = MeetingDefaultValue;
  protected override activeButtonId: string = '';

  constructor(
    protected communicationService: CommunicationService
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(meetingHeader);
  }

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    // Set refData if provided
    if (this.refData) {
      this.setRefData(this.refData);
    }
    // Load meetings when component initializes if no initial data
    if (!this.page?.content || this.page.content.length === 0) {
      this.loadData();
    }
  }

  protected override prepareHighLevelView(
    data: Meeting,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    const timeRange = data?.meetingStartTime && data?.meetingEndTime
      ? `${data.meetingStartTime} - ${data.meetingEndTime}`
      : data?.meetingStartTime || '';
    
    return [
      {
        type: 'text',
        value: data?.meetingSummary,
      },
      {
        type: 'text',
        value: data?.meetingType,
        showDisplayValue: true,
        refDataSection: MeetingConstant.refDataKey.types
      },
      {
        type: 'date',
        value: data?.meetingDate,
      },
      {
        type: 'text',
        value: timeRange,
      },
      {
        type: 'text',
        value: data?.meetingStatus,
        showDisplayValue: true,
        refDataSection: MeetingConstant.refDataKey.statuses
      },
    ];
  }

  protected override prepareDetailedView(
    data: Meeting,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [
      getMeetingSection(data, this.getRefData() || {}, options && options['create']),
    ];
  }

  protected override prepareDefaultButtons(
    data: Meeting,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    const isCreate = options && options['create'];
    if (isCreate) {
      return [
        {
          button_id: 'CANCEL_CREATE',
          button_name: 'Cancel'
        },
        {
          button_id: 'CONFIRM_CREATE',
          button_name: 'Confirm'
        }
      ];
    }
    return [
      {
        button_id: 'UPDATE_MEETING',
        button_name: 'Update Meeting'
      }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'UPDATE_MEETING') {
      this.showEditForm(event.rowIndex, ['meeting_detail']);
      this.activeButtonId = event.buttonId;
    } else if (event.buttonId === 'CANCEL') {
      this.hideForm(event.rowIndex);
    } else if (event.buttonId === 'CONFIRM') {
      if (this.activeButtonId === 'UPDATE_MEETING') {
        this.performUpdateMeeting(event.rowIndex);
      }
    } else if (event.buttonId === 'CANCEL_CREATE') {
      this.hideForm(0, true);
    } else if (event.buttonId === 'CONFIRM_CREATE') {
      this.performCreateMeeting();
    }
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    // Load additional data when accordion opens if needed
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.fetchMeetings(this.pageNumber, this.pageSize);
  }

  performSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.fetchMeetings(undefined, undefined, removeNullFields($event.value));
    } else if ($event.advancedSearch && $event.reset) {
      this.fetchMeetings(MeetingDefaultValue.pageNumber, MeetingDefaultValue.pageSize);
    } else if ($event.buttonName == 'ADVANCED_SEARCH') {
      this.getAccordionList().searchValue = '';
    }
  }

  loadData(): void {
    this.fetchMeetings(
      MeetingDefaultValue.pageNumber,
      MeetingDefaultValue.pageSize
    );
  }

  private fetchMeetings(pageNumber?: number, pageSize?: number, filter?: any): void {
    this.communicationService.fetchMeetings(pageNumber, pageSize).subscribe((data) => {
      this.setContent(data.content || [], data.totalSize);
    });
  }

  initCreateMeetingForm(): void {
    this.showCreateForm();
  }

  private performCreateMeeting(): void {
    const meetingForm = this.getSectionForm('meeting_detail', 0, true);
    meetingForm?.markAllAsTouched();
    if (meetingForm?.valid) {
      this.communicationService.createMeeting(meetingForm.value).subscribe({
        next: (data) => {
          this.hideForm(0, true);
          // Refresh the list to show the new meeting
          this.fetchMeetings(this.pageNumber, this.pageSize);
        },
        error: (error) => {
          console.error('Error creating meeting:', error);
          // Handle error - could show a toast notification here
        }
      });
    }
  }

  private performUpdateMeeting(rowIndex: number): void {
    const meeting = this.itemList[rowIndex];
    if (!meeting.id) return;
    
    const meetingForm = this.getSectionForm('meeting_detail', rowIndex);
    meetingForm?.markAllAsTouched();
    if (meetingForm?.valid) {
      this.communicationService.updateMeeting(meeting.id, meetingForm.value).subscribe({
        next: (data) => {
          this.hideForm(rowIndex);
          // Update the row with the new data
          this.updateContentRow(data, rowIndex);
        },
        error: (error) => {
          console.error('Error updating meeting:', error);
          // Handle error - could show a toast notification here
        }
      });
    }
  }
}
