import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CommunicationService } from './service/communication.service';
import { NoticeDefaultValue, MeetingDefaultValue } from './communication.const';
import { PagedNotice } from './model/notice.model';
import { PagedMeeting } from './model/meeting.model';

const noticeDefaultValue = NoticeDefaultValue;
const meetingDefaultValue = MeetingDefaultValue;

export const noticesResolver: ResolveFn<PagedNotice> = (route, state) => {
  return inject(CommunicationService).fetchNotices(noticeDefaultValue.pageNumber, noticeDefaultValue.pageSize);
};

export const noticeRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommunicationService).getNoticeRefData();
};

export const meetingsResolver: ResolveFn<PagedMeeting> = (route, state) => {
  return inject(CommunicationService).fetchMeetings(meetingDefaultValue.pageNumber, meetingDefaultValue.pageSize);
};

export const meetingRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommunicationService).getMeetingRefData();
};
