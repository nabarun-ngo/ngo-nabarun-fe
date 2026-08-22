import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  AgendaItem,
  Meeting,
  MeetingAttendeeOption,
  MeetingFilterCriteria,
  MeetingListContext,
  MeetingParticipant,
  MeetingPrimaryChip,
  MeetingRefData,
  MeetingType,
} from '../domain';
import { formatMeetingDate, MeetingRefDataKeys } from '../domain';

export type MeetingCreateStep = 'basics' | 'agenda' | 'attendees';

export const MEETING_CREATE_STEPS: { id: MeetingCreateStep; label: string; kind: 'form' | 'custom' }[] = [
  { id: 'basics', label: 'Basics', kind: 'form' },
  { id: 'agenda', label: 'Agenda', kind: 'custom' },
  { id: 'attendees', label: 'Attendees', kind: 'custom' },
];

export interface MeetingAgendaRow {
  agenda: string;
  outcomes?: string;
}

const MEETING_TIME_OPTIONS: KeyValue[] = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';
  const key = `${String(hours).padStart(2, '0')}:${minutes}`;
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return {
    key,
    displayValue: `${String(displayHour).padStart(2, '0')}:${minutes} ${period}`,
  };
});

export function buildMeetingFilterForm(
  _chip: MeetingPrimaryChip,
  _refData: MeetingRefData,
  memberOptions: { key: string; label: string }[] = [],
): FormDefinition {
  return {
    id: 'meeting-filter',
    key: 'meeting-filter',
    label: 'Filter meetings',
    description: '',
    fields: [
      baseField({
        id: 'participantEmail',
        key: 'participantEmail',
        label: 'Participant email',
        placeholder: 'name@example.org',
        fieldType: 'text',
        sortOrder: 1,
      }),
      baseField({
        id: 'createdById',
        key: 'createdById',
        label: 'Created by',
        fieldType: 'select',
        sortOrder: 2,
        fieldOptions: memberOptions,
      }),
    ],
  };
}

export function meetingCriteriaToValues(criteria: MeetingFilterCriteria): FormValues {
  return {
    participantEmail: criteria.participantEmail ?? '',
    createdById: criteria.createdById ?? '',
  };
}

export function meetingValuesToCriteria(
  values: FormValues,
  members: MeetingAttendeeOption[] = [],
): MeetingFilterCriteria {
  const createdById = String(values['createdById'] ?? '').trim() || undefined;
  const member = members.find(item => item.id === createdById);
  return {
    participantEmail: String(values['participantEmail'] ?? '').trim() || undefined,
    createdById,
    createdByName: member?.fullName,
  };
}

export function buildMeetingBasicsForm(
  refData: MeetingRefData,
  options?: { enabled?: boolean },
): FormDefinition {
  const enabled = options?.enabled ?? true;
  return {
    id: 'meeting-basics',
    key: 'meeting-basics',
    label: 'Meeting details',
    description: '',
    fields: buildMeetingBasicsFields(refData, enabled),
  };
}

function buildMeetingBasicsFields(
  refData: MeetingRefData,
  enabled: boolean,
): FormFieldDefinition[] {
  return [
    baseField({
      id: 'summary',
      key: 'summary',
      label: 'Summary',
      fieldType: 'text',
      mandatory: true,
      enabled,
      sortOrder: 1,
    }),
    baseField({
      id: 'type',
      key: 'type',
      label: 'Type',
      fieldType: 'select',
      mandatory: true,
      enabled,
      sortOrder: 2,
      fieldOptions: toFieldOptions(
        (refData[MeetingRefDataKeys.types] as KeyValue[] | undefined) ?? [],
      ),
    }),
    baseField({
      id: 'description',
      key: 'description',
      label: 'Description',
      fieldType: 'textarea',
      enabled,
      sortOrder: 3,
    }),
    baseField({
      id: 'meetingDate',
      key: 'meetingDate',
      label: 'Date',
      fieldType: 'date',
      mandatory: true,
      enabled,
      sortOrder: 4,
    }),
    baseField({
      id: 'startTime',
      key: 'startTime',
      label: 'Start time',
      fieldType: 'select',
      mandatory: true,
      enabled,
      sortOrder: 5,
      fieldOptions: toFieldOptions(MEETING_TIME_OPTIONS),
    }),
    baseField({
      id: 'endTime',
      key: 'endTime',
      label: 'End time',
      fieldType: 'select',
      mandatory: true,
      enabled,
      sortOrder: 6,
      fieldOptions: toFieldOptions(MEETING_TIME_OPTIONS),
    }),
    baseField({
      id: 'location',
      key: 'location',
      label: 'Location',
      fieldType: 'text',
      enabled,
      sortOrder: 7,
      condition: {
        dependsOnKey: 'type',
        operator: 'equals',
        value: 'OFFLINE',
      },
    }),
  ];
}

export function buildMeetingCreateStep(
  step: MeetingCreateStep,
  refData: MeetingRefData,
): FormDefinition {
  if (step === 'agenda') {
    return {
      id: 'meeting-create-agenda',
      key: 'meeting-create-agenda',
      label: 'Agenda',
      description: '',
      fields: [],
    };
  }
  if (step === 'attendees') {
    return {
      id: 'meeting-create-attendees',
      key: 'meeting-create-attendees',
      label: 'Attendees',
      description: '',
      fields: [],
    };
  }
  return buildMeetingBasicsForm(refData);
}

export function defaultMeetingCreateValues(): FormValues {
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  return {
    summary: '',
    type: 'ONLINE',
    description: '',
    meetingDate: dateKey,
    startTime: '09:30',
    endTime: '10:00',
    location: '',
  };
}

export function meetingToEditValues(meeting: Meeting): FormValues {
  return {
    summary: meeting.summary ?? '',
    type: meeting.type ?? 'ONLINE',
    description: meeting.description ?? '',
    meetingDate: meeting.startTime
      ? meeting.startTime.toISOString().slice(0, 10)
      : '',
    startTime: meeting.startTime
      ? `${String(meeting.startTime.getHours()).padStart(2, '0')}:${meeting.startTime.getMinutes() < 30 ? '00' : '30'}`
      : '09:30',
    endTime: meeting.endTime
      ? `${String(meeting.endTime.getHours()).padStart(2, '0')}:${meeting.endTime.getMinutes() < 30 ? '00' : '30'}`
      : '10:00',
    location: meeting.location ?? '',
  };
}

export function agendaItemsToRows(items?: AgendaItem[]): MeetingAgendaRow[] {
  if (!items?.length) return [{ agenda: '', outcomes: '' }];
  return items.map(item => ({
    agenda: item.agenda ?? '',
    outcomes: item.outcomes ?? '',
  }));
}

export function agendaRowsToItems(rows: MeetingAgendaRow[]): AgendaItem[] {
  return rows
    .map(row => ({
      agenda: row.agenda.trim(),
      outcomes: row.outcomes?.trim() || undefined,
    }))
    .filter(item => item.agenda.length > 0);
}

export function attendeesFromSelectedIds(
  selectedIds: string[],
  members: MeetingAttendeeOption[],
): MeetingParticipant[] {
  return selectedIds
    .map(id => members.find(member => member.id === id))
    .filter((member): member is MeetingAttendeeOption => !!member)
    .map(member => ({
      id: member.id,
      name: member.fullName,
      email: member.email,
    }));
}

export function selectedAttendeeIds(meeting?: Meeting): string[] {
  return (meeting?.attendees ?? [])
    .map(item => item.id)
    .filter((id): id is string => !!id);
}

export function buildMeetingEntityFromForm(
  values: FormValues,
  agenda: AgendaItem[],
  attendees: MeetingParticipant[],
): Partial<Meeting> {
  const meetingDate = String(values['meetingDate'] ?? '');
  const startSlot = String(values['startTime'] ?? '');
  const endSlot = String(values['endTime'] ?? '');
  const type = String(values['type'] ?? 'ONLINE') as MeetingType;
  return {
    summary: String(values['summary'] ?? '').trim(),
    type,
    description: String(values['description'] ?? '').trim() || undefined,
    meetingDate,
    startTime: formatMeetingDate(meetingDate, startSlot) as unknown as Date,
    endTime: formatMeetingDate(meetingDate, endSlot) as unknown as Date,
    location: type === 'OFFLINE'
      ? (String(values['location'] ?? '').trim() || undefined)
      : undefined,
    agenda,
    attendees,
  };
}

export function validateMeetingBasics(values: FormValues): string | undefined {
  if (!String(values['summary'] ?? '').trim()) return 'Summary is required.';
  if (!String(values['type'] ?? '').trim()) return 'Type is required.';
  if (!String(values['meetingDate'] ?? '').trim()) return 'Date is required.';
  const start = String(values['startTime'] ?? '');
  const end = String(values['endTime'] ?? '');
  if (!start || !end) return 'Start and end time are required.';
  if (start >= end) return 'End time must be after start time.';
  if (String(values['type']) === 'OFFLINE' && !String(values['location'] ?? '').trim()) {
    return 'Location is required for offline meetings.';
  }
  return undefined;
}

export function validateMeetingCreateStep(
  step: MeetingCreateStep,
  values: FormValues,
  customStepData?: Record<string, unknown>,
): string | undefined {
  if (step === 'basics') {
    return validateMeetingBasics(values);
  }
  if (step === 'agenda') {
    const rows = (customStepData?.['agenda'] as MeetingAgendaRow[] | undefined) ?? [];
    return agendaRowsToItems(rows).length >= 1
      ? undefined
      : 'Add at least one agenda item.';
  }
  if (step === 'attendees') {
    const ids = (customStepData?.['attendees'] as string[] | undefined) ?? [];
    return ids.length >= 1 ? undefined : 'Add at least one attendee.';
  }
  return undefined;
}

export function memberOptionsFromContext(
  context: MeetingListContext,
): { key: string; label: string }[] {
  return (context.attendeeOptions ?? []).map(option => ({
    key: String(option.key),
    label: option.label,
  }));
}
