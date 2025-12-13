import { Injectable, OnInit } from '@angular/core';
import { NoticeControllerService, UserControllerService } from 'src/app/core/api/services';
import { NoticeDefaultValue } from './notice.const';
import { concatMap, from, map } from 'rxjs';
import { GoogleCalendarService } from 'src/app/core/service/google-calendar.service';
import { MeetingDetail, NoticeDetail, NoticeDetailFilter } from 'src/app/core/api-client/models';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {


  defaultValue = NoticeDefaultValue;

  constructor(
    private noticeController: NoticeControllerService,
    private googleCalService: GoogleCalendarService,
    private userController: UserControllerService,

  ) {

  }


  retrieveNotices(pageIndex: number = this.defaultValue.pageNumber, pageSize: number = this.defaultValue.pageSize) {
    return this.noticeController.getAllNotice({
      pageIndex: pageIndex,
      pageSize: pageSize,
      filter: {
        status: ['ACTIVE'],
      }
    }).pipe(map(d => d.responsePayload))
  }

  createNotice(formValue: any) {
    let notice: NoticeDetail = {};
    notice.title = formValue.title;
    notice.description = formValue.description;
    notice.noticeDate = formValue.noticeDate;
    if (formValue.hasMeeting == 'YES') {
      notice.noticeStatus = 'DRAFT';
      notice.hasMeeting = true;
      let meeting: MeetingDetail = {}
      meeting.meetingSummary = formValue.meetingSummary;
      meeting.meetingDescription = formValue.meetingAgenda;
      meeting.meetingType = formValue.meetingType;
      meeting.meetingLocation = meeting.meetingType == 'OFFLINE' ? formValue.meetingLocation : 'Virtually via Google Meet';
      meeting.meetingDate = formValue.meetingDate;
      meeting.meetingStartTime = formValue.meetingStartTime;
      meeting.meetingEndTime = formValue.meetingEndTime;
      meeting.meetingStatus = 'CREATED_L';
      meeting.meetingAttendees = []
      notice.meeting = meeting;

      return from(this.googleCalService.signInToGoogle()).pipe(
        concatMap(response => from(this.userController.getUsers({ filter: { status: ['ACTIVE'] } })).pipe(map(m => {
          m.responsePayload?.content?.forEach(f => {
            notice.meeting?.meetingAttendees?.push(f)
          })
          ////console.log(notice.meeting?.meetingAttendees)
          return m.responsePayload?.content
        }))),
        concatMap(response0 => from(this.noticeController.createNotice({ body: notice })).pipe(map(m => {
          notice = m.responsePayload!
          return m.responsePayload
        }))),
        concatMap(response1 => from(this.googleCalService.createCalendarEvent(notice.meeting, response1?.id)).pipe(map(m => m.result))),
        concatMap(response2 => from(this.noticeController.updateNotice({
          id: notice.id!,
          body: {
            hasMeeting: true,
            noticeStatus: 'ACTIVE',
            meeting: {
              extMeetingId: response2.id,
              extHtmlLink: response2.htmlLink,
              extVideoConferenceLink: response2.hangoutLink,
              meetingRefId: notice.id!,
              meetingStatus: 'CREATED_G',
              extConferenceStatus: response2.status,
              creatorEmail: response2.creator?.email
            }
          }
        })))
      ).pipe(map(m => m.responsePayload));
    } else {
      notice.noticeStatus = 'ACTIVE';
      notice.hasMeeting = false;
      return this.noticeController.createNotice({ body: notice }).pipe(map(m => m.responsePayload));
    }

  }


  editNotice(id: string, formValue: any) {

  }


  advancedSearch(filter: { noticeNumber?: string, noticeTitle?: string, startDate?: string, endDate?: string, status?: string }) {
    let filterOps: NoticeDetailFilter = {};
    if (filter.noticeNumber) {
      filterOps.id = filter.noticeNumber
    }
    if (filter.noticeTitle) {
      filterOps.title = filter.noticeTitle
    }
    if (filter.startDate) {
      filterOps.startDate = filter.startDate
    }
    if (filter.endDate) {
      filterOps.endDate = filter.endDate
    }
    if (filter.status) {
      filterOps.status = filter.status as any
    }
    return this.noticeController.getAllNotice({ filter: filterOps }).pipe(map(d => d.responsePayload));
  }
}
