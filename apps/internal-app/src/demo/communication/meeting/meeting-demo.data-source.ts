import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import type { Meeting, PagedMeeting } from 'src/app/feature/communication/meeting/domain';
import { normalizeMeetingChip } from 'src/app/feature/communication/meeting/config/meeting.rules';
import type { MeetingDataSource, MeetingListQuery } from 'src/app/feature/communication/meeting/data/meeting-data.source';
import {
  createDemoMeeting,
  findDemoMeetingById,
  getDemoMeetingPage,
  getDemoMeetingRefData,
  getDemoMembers,
  updateDemoMeeting,
} from './meeting-demo.fixtures';

@Injectable()
export class MeetingDemoDataSource implements MeetingDataSource {
  loadMeetingPage(query: MeetingListQuery): Observable<PagedMeeting> {
    const chip = normalizeMeetingChip(query.chipId);
    const { items, totalSize } = getDemoMeetingPage(
      chip,
      query.criteria ?? {},
      query.searchText,
      query.pageIndex,
      query.pageSize,
      query.currentUserId ?? 'u-demo',
    );
    return of({
      content: items,
      totalSize,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(200));
  }

  fetchMeetingById(id: string): Observable<Meeting | undefined> {
    return of(findDemoMeetingById(id)).pipe(delay(120));
  }

  fetchMeetingRefData() {
    return of(getDemoMeetingRefData()).pipe(delay(50));
  }

  fetchActiveMembers() {
    return of(getDemoMembers()).pipe(delay(80));
  }

  createMeeting(value: Partial<Meeting>): Observable<Meeting> {
    return of(createDemoMeeting({
      ...value,
      createdById: value.createdById ?? 'u-demo',
    })).pipe(delay(200));
  }

  updateMeeting(
    id: string,
    value: Partial<Meeting> & { cancelEvent?: boolean },
  ): Observable<Meeting> {
    const updated = updateDemoMeeting(id, value);
    return updated
      ? of(updated).pipe(delay(180))
      : throwError(() => new Error('Meeting not found'));
  }

  cancelMeeting(id: string): Observable<Meeting> {
    return this.updateMeeting(id, { cancelEvent: true });
  }
}
