import type { MeetingDetailDto } from 'src/app/core/api/api-client/models';
import { mapPagedResult } from 'src/app/shared/models/paged-result.model';
import type { Meeting, MeetingRefData, PagedMeeting } from '../domain';
import { MeetingRefDataKeys } from '../domain';

export function mapMeetingDto(dto: MeetingDetailDto): Meeting {
  return {
    id: dto.id,
    type: dto.type,
    summary: dto.summary,
    description: dto.description,
    agenda: dto.agenda?.map(item => ({
      agenda: item.agenda,
      outcomes: item.outcomes,
    })),
    outcomes: dto.outcomes,
    location: dto.location,
    startTime: new Date(dto.startTime),
    endTime: new Date(dto.endTime),
    attendees: dto.attendees?.map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      attended: item.attended,
    })),
    meetLink: dto.meetLink,
    calendarLink: dto.calendarLink ?? '',
    status: dto.status,
    hostEmail: dto.hostEmail,
    createdById: dto.createdById,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

export function mapPagedMeetingDto(dto: {
  items?: MeetingDetailDto[];
  total?: number;
  pageIndex?: number;
  pageSize?: number;
}): PagedMeeting {
  return mapPagedResult(dto, mapMeetingDto);
}

export function mapMeetingRefData(): MeetingRefData {
  return {
    [MeetingRefDataKeys.types]: [
      { key: 'ONLINE', displayValue: 'Online' },
      { key: 'OFFLINE', displayValue: 'In person' },
    ],
    [MeetingRefDataKeys.statuses]: [
      { key: 'confirmed', displayValue: 'Confirmed' },
      { key: 'cancelled', displayValue: 'Cancelled' },
    ],
  };
}
