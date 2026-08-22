import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  Meeting,
  MeetingAttendeeOption,
  MeetingFilterCriteria,
  MeetingRefData,
  PagedMeeting,
} from '../domain';

export interface MeetingListQuery {
  chipId?: string;
  criteria?: MeetingFilterCriteria;
  refData?: MeetingRefData;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
  currentUserId?: string;
  append?: boolean;
}

export interface MeetingDataSource {
  loadMeetingPage(query: MeetingListQuery): Observable<PagedMeeting>;
  fetchMeetingById(id: string): Observable<Meeting | undefined>;
  fetchMeetingRefData(): Observable<MeetingRefData>;
  fetchActiveMembers(): Observable<MeetingAttendeeOption[]>;
  createMeeting(value: Partial<Meeting>): Observable<Meeting>;
  updateMeeting(id: string, value: Partial<Meeting> & { cancelEvent?: boolean }): Observable<Meeting>;
  cancelMeeting(id: string): Observable<Meeting>;
}

export const MeetingDataSource =
  new InjectionToken<MeetingDataSource>('MeetingDataSource');
