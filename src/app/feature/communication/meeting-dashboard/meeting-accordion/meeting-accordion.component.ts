import { Component, AfterContentInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { Meeting, MeetingParticipant } from '../../model/meeting.model';
import { MeetingDefaultValue } from '../../communication.const';
import { meetingHeader, getMeetingSection, getMeetingAttendeeSection, getMeetingNotesSection } from '../../fields/meeting.field';
import { CommunicationService } from '../../service/communication.service';
import { compareObjects, date, removeNullFields, shareToWhatsApp } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { User } from 'src/app/feature/member/models/member.model';
import { Validators } from '@angular/forms';
import { filterFormChange } from 'src/app/core/service/form.service';
import { ModalService } from 'src/app/core/service/modal.service';

@Component({
  selector: 'app-meeting-accordion',
  templateUrl: './meeting-accordion.component.html',
  styleUrls: ['./meeting-accordion.component.scss']
})
export class MeetingAccordionComponent extends Accordion<Meeting> implements AfterContentInit {
  members: User[] = [];

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: MeetingDefaultValue.pageNumber,
      pageSize: MeetingDefaultValue.pageSize,
      pageSizeOptions: MeetingDefaultValue.pageSizeOptions
    };
  }

  defaultValue = MeetingDefaultValue;
  protected override activeButtonId: string = '';

  constructor(
    protected communicationService: CommunicationService,
    private dialog: ModalService
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(meetingHeader);
    this.communicationService.fetchUserList().subscribe(data => this.members = data)
  }

  protected override prepareHighLevelView(
    data: Meeting,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    const timeRange = data?.startTime && data?.endTime
      ? `${date(data.startTime, 'hh:mm a')} - ${date(data.endTime, 'hh:mm a')}`
      : data?.startTime ? date(data.startTime, 'hh:mm a') : '';

    return [
      {
        type: 'text',
        value: data?.summary!,
      },
      {
        type: 'date',
        value: data?.startTime ? data.startTime.toISOString() : '',
      },
      {
        type: 'text',
        value: timeRange,
      }
    ];
  }

  protected override prepareDetailedView(
    data: Meeting,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [
      getMeetingSection(data, this.getRefData() || {}, options && options['create']),
      getMeetingNotesSection(data, this.getRefData() || {}, options && options['create']),
      getMeetingAttendeeSection(data, this.getRefData() || {}, options && options['create'], this.members)
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
      },
      {
        button_id: 'SHARE_WHATSAPP',
        button_name: 'Share on WhatsApp'
      }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'UPDATE_MEETING') {
      this.showEditForm(event.rowIndex, ['meeting_detail']);
      const options = this.members.map((d) => {
        return {
          key: d.email,
          displayValue: `${d.fullName} (${d.email})`
        } as KeyValue
      })
      this.updateFieldOptions('meeting_detail', event.rowIndex, 'attendees', options);
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
    } else if (event.buttonId === 'SHARE_WHATSAPP') {
      const message = this.createWhatsAppMessage(this.itemList[event.rowIndex]);
      shareToWhatsApp(message);
    }
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
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
    const options = this.members.map((d) => {
      return {
        key: d.email,
        displayValue: `${d.fullName} (${d.email})`
      } as KeyValue
    })
    this.updateFieldOptions('meeting_detail', 0, 'attendees', options, true);
    const form = this.getSectionForm('meeting_detail', 0, true);
    form?.valueChanges.pipe(filterFormChange(form.value)).subscribe((value) => {
      if (value.type) {
        this.updateFieldValidators('meeting_detail', 0, {
          'location': value.type === 'OFFLINE' ? [Validators.required] : []
        }, true);
      }
    })
  }

  private performCreateMeeting(): void {
    const meetingForm = this.getSectionForm('meeting_detail', 0, true);
    const meetingNotesForm = this.getSectionForm('meeting_notes', 0, true);
    const meetingAttendeeForm = this.getSectionForm('meeting_attendee', 0, true);

    meetingForm?.markAllAsTouched();
    meetingNotesForm?.markAllAsTouched();
    meetingAttendeeForm?.markAllAsTouched();

    console.log(meetingForm?.value, meetingNotesForm?.value, meetingAttendeeForm?.value)

    if (meetingForm?.valid && meetingNotesForm?.valid && meetingAttendeeForm?.valid) {
      if (meetingNotesForm.value.agenda.length === 0) {
        this.dialog.openNotificationModal({
          title: 'Error',
          description: 'Please add at least one agenda item',
        }, 'notification', 'error');
        return;
      }
      if (meetingAttendeeForm.value.attendees.length === 0) {
        this.dialog.openNotificationModal({
          title: 'Error',
          description: 'Please add at least one attendee',
        }, 'notification', 'error');
        return;
      }
      const meeting = meetingForm.value;
      const attendees: MeetingParticipant[] = meetingAttendeeForm.value.attendees.map((d: string) => {
        return {
          name: this.members.find((m) => m.email === d)?.fullName,
          email: d
        }
      })
      console.log(meetingAttendeeForm.value.attendees, attendees)
      const data = removeNullFields(meeting);
      this.communicationService.createMeeting({
        ...data,
        attendees: attendees,
        agenda: meetingNotesForm.value.agenda,
      }).subscribe(data => {
        this.hideForm(0, true);
        this.addContentRow(data, true);
      });
    }
  }

  private performUpdateMeeting(rowIndex: number): void {
    const meeting = this.itemList[rowIndex];
    if (!meeting.id) return;

    const meetingForm = this.getSectionForm('meeting_detail', rowIndex);
    meetingForm?.markAllAsTouched();
    if (meetingForm?.valid) {
      const updated = compareObjects(meetingForm.value, meeting);
      if (updated.startTime || updated.endTime) {
        updated.meetingDate = meetingForm.value.meetingDate;
      }
      updated.attendees = updated.attendees?.map((d: string) => {
        return {
          name: this.members.find((m) => m.email === d)?.fullName,
          email: d
        }
      })
      this.communicationService.updateMeeting(meeting.id, updated).subscribe(data => {
        this.hideForm(rowIndex);
        this.updateContentRow(data, rowIndex);
      });
    }
  }


  private createWhatsAppMessage(meeting: Meeting): string {
    const lines: string[] = [];

    // Header with emojis
    lines.push('📅 *MEETING INVITATION*');
    lines.push('━━━━━━━━━━━━━━━━━━━');
    lines.push('');

    // Meeting title
    lines.push(`📌 *${meeting.summary}*`);
    lines.push('');

    // Date and time
    lines.push(`🗓️ *Date:* ${date(meeting.startTime)}`);
    lines.push(`🕐 *Time:* ${date(meeting.startTime, 'hh:mm a')} - ${date(meeting.endTime, 'hh:mm a')}`);
    lines.push('');

    // Location or meeting link
    if (meeting.location) {
      lines.push(`📍 *Location:* ${meeting.location}`);
      lines.push('');
    }

    if (meeting.meetLink) {
      lines.push(`🔗 *Join Link:*`);
      lines.push(meeting.meetLink);
      lines.push('');
    }

    // Attendees
    // if (meeting.attendees && meeting.attendees.length > 0) {
    //   lines.push(`👥 *Attendees:*`);
    //   meeting.attendees.forEach(attendee => {
    //     lines.push(`   • ${attendee}`);
    //   });
    //   lines.push('');
    // }

    // Agenda
    if (meeting.agenda && meeting.agenda.length > 0) {
      lines.push(`📋 *Agenda:*`);
      lines.push(`${meeting.agenda}`);
      lines.push('');
    }

    // Footer
    lines.push('━━━━━━━━━━━━━━━━━━━');
    lines.push('✨ Looking forward to seeing you! Please join with your registered email addedss with nabarun');

    return lines.join('\n');
  }
}
