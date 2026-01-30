import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CommunicationService } from './service/communication.service';
import { NoticeDefaultValue, MeetingDefaultValue } from './communication.const';
import { PagedNotice } from './model/notice.model';
import { PagedMeeting } from './model/meeting.model';
import { combineLatest } from 'rxjs';
import { User } from '../member/models/member.model';

const noticeDefaultValue = NoticeDefaultValue;
const meetingDefaultValue = MeetingDefaultValue;

export const noticesResolver: ResolveFn<PagedNotice> = (route, state) => {
  return inject(CommunicationService).fetchNotices(noticeDefaultValue.pageNumber, noticeDefaultValue.pageSize);
};

export const noticeRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommunicationService).getNoticeRefData();
};

export const meetingsResolver: ResolveFn<{ meetings: PagedMeeting, members: User[] }> = (route, state) => {
  return combineLatest({
    meetings: inject(CommunicationService).fetchMeetings(meetingDefaultValue.pageNumber, meetingDefaultValue.pageSize),
    members: inject(CommunicationService).fetchUserList()
  });
};

export const meetingRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommunicationService).getMeetingRefData();
};
