import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { PagedResult } from 'src/app/shared/models/paged-result.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type MeetingType = 'OFFLINE' | 'ONLINE';

export interface MeetingParticipant {
  id?: string;
  email: string;
  name?: string;
  attended?: string;
}

export interface AgendaItem {
  agenda: string;
  outcomes?: string;
}

export interface Meeting {
  id: string;
  type: MeetingType;
  summary: string;
  description?: string;
  agenda?: AgendaItem[];
  outcomes?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees?: MeetingParticipant[];
  meetLink?: string;
  calendarLink?: string;
  status: string;
  hostEmail?: string;
  createdById?: string;
  createdAt?: Date;
  updatedAt?: Date;
  /** Form-only: date portion when scheduling */
  meetingDate?: Date | string;
}

export type PagedMeeting = PagedResult<Meeting>;

export type MeetingPrimaryChip = 'participating' | 'created_by_me';

export interface MeetingFilterCriteria {
  [key: string]: unknown;
  participantEmail?: string;
  createdById?: string;
  createdByName?: string;
}

export type MeetingRefData = Record<string, KeyValue[] | undefined>;

export interface MeetingAttendeeOption {
  id: string;
  fullName: string;
  email: string;
}

export interface MeetingListContext {
  [key: string]: unknown;
  refData: MeetingRefData;
  activeChip: MeetingPrimaryChip;
  currentUserId?: string;
  attendeeOptions: FieldOption[];
  members: MeetingAttendeeOption[];
  entity?: Meeting;
}

export const MeetingRefDataKeys = {
  types: 'meetingTypes',
  statuses: 'meetingStatuses',
} as const;

export function formatMeetingDate(date: Date | string, time: string | Date): string {
  if (time instanceof Date) {
    return time.toISOString();
  }
  const combinedDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  combinedDate.setHours(hours, minutes, 0, 0);
  return combinedDate.toISOString();
}

export function isMeetingEnded(meeting: Meeting, now = new Date()): boolean {
  return !!meeting.endTime && meeting.endTime < now;
}

export function isMeetingCancelled(meeting: Meeting): boolean {
  return (meeting.status ?? '').toLowerCase() === 'cancelled';
}
