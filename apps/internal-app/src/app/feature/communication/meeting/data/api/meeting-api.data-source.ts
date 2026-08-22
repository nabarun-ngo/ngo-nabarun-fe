import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import type {
  CreateMeetingDto,
  UpdateMeetingDto,
} from 'src/app/core/api/api-client/models';
import { MeetingService, UsersService } from 'src/app/core/api/api-client/services';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import { formatMeetingDate } from '../../domain';
import type { Meeting, MeetingAttendeeOption, PagedMeeting } from '../../domain';
import {
  buildMeetingApiFilter,
  normalizeMeetingChip,
} from '../../config/meeting.rules';
import {
  mapMeetingDto,
  mapMeetingRefData,
  mapPagedMeetingDto,
} from '../meeting-data.mapper';
import type { MeetingDataSource, MeetingListQuery } from '../meeting-data.source';

@Injectable()
export class MeetingApiDataSource implements MeetingDataSource {
  constructor(
    private readonly meetingApi: MeetingService,
    private readonly usersApi: UsersService,
  ) {}

  loadMeetingPage(query: MeetingListQuery): Observable<PagedMeeting> {
    const chip = normalizeMeetingChip(query.chipId);
    const filter = buildMeetingApiFilter(
      chip,
      query.criteria ?? {},
      query.searchText,
      query.currentUserId,
    );
    return this.meetingApi.meetingControllerListMeetings({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      ...filter,
    }).pipe(
      map(response => mapPagedMeetingDto(response.responsePayload ?? {})),
    );
  }

  fetchMeetingById(id: string): Observable<Meeting | undefined> {
    return this.meetingApi.meetingControllerGetMeetingById({ id }).pipe(
      map(response => {
        const payload = response.responsePayload;
        return payload ? mapMeetingDto(payload) : undefined;
      }),
    );
  }

  fetchMeetingRefData() {
    return of(mapMeetingRefData());
  }

  fetchActiveMembers(): Observable<MeetingAttendeeOption[]> {
    return this.usersApi.userControllerListUsers({ status: 'ACTIVE' }).pipe(
      map(response => mapPagedUserDtoToPagedUser(response.responsePayload as any)),
      map(page => (page.content ?? []).map(user => ({
        id: user.id,
        fullName: user.fullName ?? user.id,
        email: user.email ?? '',
      }))),
    );
  }

  createMeeting(value: Partial<Meeting>): Observable<Meeting> {
    const body = toCreateDto(value);
    return this.meetingApi.meetingControllerCreateMeeting({ body }).pipe(
      map(response => mapMeetingDto(response.responsePayload!)),
    );
  }

  updateMeeting(
    id: string,
    value: Partial<Meeting> & { cancelEvent?: boolean },
  ): Observable<Meeting> {
    const body = toUpdateDto(value);
    return this.meetingApi.meetingControllerUpdateMeeting({ id, body }).pipe(
      map(response => mapMeetingDto(response.responsePayload!)),
    );
  }

  cancelMeeting(id: string): Observable<Meeting> {
    return this.updateMeeting(id, { cancelEvent: true });
  }
}

function toCreateDto(value: Partial<Meeting>): CreateMeetingDto {
  const startTime = resolveIsoTime(value.meetingDate, value.startTime);
  const endTime = resolveIsoTime(value.meetingDate, value.endTime);
  return {
    summary: value.summary!,
    type: value.type!,
    description: value.description,
    agenda: value.agenda,
    startTime,
    endTime,
    attendees: (value.attendees ?? []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      attended: item.attended,
    })),
    location: value.location,
  };
}

function toUpdateDto(
  value: Partial<Meeting> & { cancelEvent?: boolean },
): UpdateMeetingDto {
  const body: UpdateMeetingDto = {
    summary: value.summary,
    description: value.description,
    agenda: value.agenda,
    outcomes: value.outcomes,
    attendees: value.attendees?.map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      attended: item.attended,
    })),
    location: value.location,
    cancelEvent: value.cancelEvent,
  };
  if (value.startTime != null) {
    body.startTime = resolveIsoTime(value.meetingDate, value.startTime);
  }
  if (value.endTime != null) {
    body.endTime = resolveIsoTime(value.meetingDate, value.endTime);
  }
  return body;
}

function resolveIsoTime(
  meetingDate: Date | string | undefined,
  time: Date | string | undefined,
): string {
  if (time instanceof Date) {
    return time.toISOString();
  }
  if (typeof time === 'string' && time.includes('T')) {
    return new Date(time).toISOString();
  }
  if (meetingDate != null && typeof time === 'string') {
    return formatMeetingDate(meetingDate, time);
  }
  if (typeof time === 'string') {
    return new Date(time).toISOString();
  }
  throw new Error('Meeting start/end time is required');
}
