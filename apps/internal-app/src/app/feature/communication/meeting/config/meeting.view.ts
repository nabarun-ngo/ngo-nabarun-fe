import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import {
  detailItemListSection,
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-angular';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Meeting } from '../domain';

function statusBadge(status: string | undefined): ListRowBadge {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'cancelled') {
    return { label: status ?? 'cancelled', tone: 'danger' };
  }
  if (normalized === 'confirmed') {
    return { label: status ?? 'confirmed', tone: 'success' };
  }
  return { label: status ?? 'Unknown', tone: 'neutral' };
}

function typeLabel(type: Meeting['type']): string {
  return type === 'OFFLINE' ? 'Offline' : 'Online';
}

function timeWindow(meeting: Meeting): string {
  if (!meeting.startTime || !meeting.endTime) return '';
  return `${date(meeting.startTime, 'hh:mm a')} – ${date(meeting.endTime, 'hh:mm a')}`;
}

export function mapMeetingToListRow(meeting: Meeting): ListRowItem<Meeting> {
  const attendeeCount = meeting.attendees?.length ?? 0;
  return {
    id: meeting.id,
    title: meeting.summary,
    subtitleParts: [
      { text: typeLabel(meeting.type) },
      { text: `${attendeeCount} attendee${attendeeCount === 1 ? '' : 's'}` },
    ],
    metaLeft: timeWindow(meeting),
    metaRight: meeting.startTime ? date(meeting.startTime, 'dd MMM yy') : undefined,
    badge: statusBadge(meeting.status),
    icon: 'meeting',
    iconTone: meeting.type === 'ONLINE' ? 'blue' : 'orange',
    payload: meeting,
  };
}

export function buildMeetingDetailSections(meeting: Meeting): ListDetailSection[] {
  const detailFields = [
    detailTextField('Summary', meeting.summary || '-'),
    detailTextField('Type', typeLabel(meeting.type)),
    detailTextField('Status', meeting.status || '-'),
    detailTextField(
      'Start',
      meeting.startTime ? date(meeting.startTime, 'dd MMM yyyy hh:mm a') : '-',
    ),
    detailTextField(
      'End',
      meeting.endTime ? date(meeting.endTime, 'dd MMM yyyy hh:mm a') : '-',
    ),
    ...(meeting.description
      ? [detailTextField('Description', meeting.description)]
      : []),
    ...(meeting.location
      ? [detailTextField('Location', meeting.location)]
      : []),
    ...(meeting.meetLink
      ? [detailTextField('Meet link', meeting.meetLink)]
      : []),
    ...(meeting.calendarLink
      ? [detailTextField('Calendar', meeting.calendarLink)]
      : []),
    ...(meeting.hostEmail
      ? [detailTextField('Host', meeting.hostEmail)]
      : []),
    ...(meeting.outcomes
      ? [detailTextField('Outcomes', meeting.outcomes)]
      : []),
  ];

  const sections: ListDetailSection[] = [
    detailKeyValueSection('meeting_detail', 'Meeting details', detailFields),
    detailItemListSection(
      'meeting_agenda',
      'Agenda',
      (meeting.agenda ?? []).map((item, index) => ({
        id: `agenda-${index}`,
        title: item.agenda,
        subtitle: item.outcomes || undefined,
      })),
      { emptyMessage: 'No agenda items' },
    ),
    detailItemListSection(
      'meeting_attendees',
      'Attendees',
      (meeting.attendees ?? []).map((item, index) => ({
        id: item.id ?? `attendee-${index}`,
        title: item.name || item.email,
        subtitle: item.email,
        badge: item.attended
          ? { label: item.attended, tone: 'neutral' as const }
          : undefined,
      })),
      { emptyMessage: 'No attendees' },
    ),
  ];

  return sections;
}
