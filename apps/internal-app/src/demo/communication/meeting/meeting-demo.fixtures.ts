import type {
  AgendaItem,
  Meeting,
  MeetingAttendeeOption,
  MeetingFilterCriteria,
  MeetingPrimaryChip,
  MeetingRefData,
} from 'src/app/feature/communication/meeting/domain';
import { mapMeetingRefData } from 'src/app/feature/communication/meeting/data/meeting-data.mapper';
import { buildMeetingApiFilter } from 'src/app/feature/communication/meeting/config/meeting.rules';

const DEMO_MEMBERS: MeetingAttendeeOption[] = [
  { id: 'u-asha', fullName: 'Asha Verma', email: 'asha.verma@example.org' },
  { id: 'u-ravi', fullName: 'Ravi Sen', email: 'ravi.sen@example.org' },
  { id: 'u-meera', fullName: 'Meera Das', email: 'meera.das@example.org' },
];

const DEMO_AGENDA: AgendaItem[] = [
  {
    agenda: 'Review volunteer enrolment progress',
    outcomes: 'Team agreed next steps for the tracker.',
  },
  { agenda: 'Confirm camp logistics' },
];

let demoMeetings: Meeting[] = [
  {
    id: 'mtg-1',
    type: 'ONLINE',
    summary: 'Monthly programme review',
    description: 'Monthly review of programme delivery.',
    agenda: DEMO_AGENDA,
    location: undefined,
    startTime: new Date('2026-03-14T09:30:00.000Z'),
    endTime: new Date('2026-03-14T10:15:00.000Z'),
    attendees: [
      { id: 'u-asha', name: 'Asha Verma', email: 'asha.verma@example.org' },
      { id: 'u-ravi', name: 'Ravi Sen', email: 'ravi.sen@example.org' },
      { id: 'u-meera', name: 'Meera Das', email: 'meera.das@example.org' },
      { id: 'u-demo', name: 'Demo User', email: 'demo@example.org' },
    ],
    meetLink: 'https://meet.google.com/abc-defg-hij',
    calendarLink: 'https://calendar.google.com/calendar/event?eid=demo1',
    status: 'confirmed',
    hostEmail: 'asha.verma@example.org',
    createdById: 'u-demo',
    createdAt: new Date('2026-03-10T08:00:00.000Z'),
    updatedAt: new Date('2026-03-14T10:20:00.000Z'),
  },
  {
    id: 'mtg-2',
    type: 'OFFLINE',
    summary: 'Volunteer kickoff',
    description: 'In-person kickoff at the office.',
    agenda: [{ agenda: 'Introductions' }, { agenda: 'Role assignment' }],
    location: 'Nabarun office, Barasat',
    startTime: new Date('2026-03-02T16:00:00.000Z'),
    endTime: new Date('2026-03-02T17:00:00.000Z'),
    attendees: [
      { id: 'u-demo', name: 'Demo User', email: 'demo@example.org' },
      { id: 'u-asha', name: 'Asha Verma', email: 'asha.verma@example.org' },
    ],
    calendarLink: '',
    status: 'cancelled',
    hostEmail: 'demo@example.org',
    createdById: 'u-demo',
    createdAt: new Date('2026-02-28T08:00:00.000Z'),
    updatedAt: new Date('2026-03-01T08:00:00.000Z'),
  },
  {
    id: 'mtg-3',
    type: 'ONLINE',
    summary: 'Board sync',
    agenda: [{ agenda: 'Budget snapshot' }],
    startTime: new Date('2026-03-20T11:00:00.000Z'),
    endTime: new Date('2026-03-20T11:45:00.000Z'),
    attendees: [
      { id: 'u-demo', name: 'Demo User', email: 'demo@example.org' },
      { id: 'u-ravi', name: 'Ravi Sen', email: 'ravi.sen@example.org' },
    ],
    meetLink: 'https://meet.google.com/board-sync',
    calendarLink: '',
    status: 'confirmed',
    hostEmail: 'demo@example.org',
    createdById: 'u-demo',
    createdAt: new Date('2026-03-15T08:00:00.000Z'),
    updatedAt: new Date('2026-03-15T08:00:00.000Z'),
  },
];

export function getDemoMeetingRefData(): MeetingRefData {
  return mapMeetingRefData();
}

export function getDemoMembers(): MeetingAttendeeOption[] {
  return DEMO_MEMBERS.map(item => ({ ...item }));
}

export function findDemoMeetingById(id: string): Meeting | undefined {
  const found = demoMeetings.find(item => item.id === id);
  return found ? cloneMeeting(found) : undefined;
}

export function getDemoMeetingPage(
  chipId: MeetingPrimaryChip,
  criteria: MeetingFilterCriteria,
  searchText: string | undefined,
  pageIndex: number,
  pageSize: number,
  currentUserId?: string,
): { items: Meeting[]; totalSize: number } {
  const filter = buildMeetingApiFilter(chipId, criteria, searchText, currentUserId);
  let items = demoMeetings.slice().sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );

  if (filter.createdById) {
    items = items.filter(item => item.createdById === filter.createdById);
  }
  if (filter.participantId) {
    items = items.filter(item =>
      item.attendees?.some(attendee => attendee.id === filter.participantId));
  }
  if (filter.participantEmail) {
    const needle = filter.participantEmail.toLowerCase();
    items = items.filter(item =>
      item.attendees?.some(attendee =>
        (attendee.email ?? '').toLowerCase().includes(needle)));
  }

  const totalSize = items.length;
  const start = pageIndex * pageSize;
  return {
    items: items.slice(start, start + pageSize).map(cloneMeeting),
    totalSize,
  };
}

export function createDemoMeeting(value: Partial<Meeting>): Meeting {
  const meeting: Meeting = {
    id: `mtg-${Date.now()}`,
    type: value.type ?? 'ONLINE',
    summary: value.summary ?? 'Untitled meeting',
    description: value.description,
    agenda: value.agenda ?? [],
    location: value.location,
    startTime: toDate(value.startTime) ?? new Date(),
    endTime: toDate(value.endTime) ?? new Date(),
    attendees: value.attendees ?? [],
    meetLink: value.type === 'ONLINE' ? 'https://meet.google.com/demo-new' : undefined,
    calendarLink: '',
    status: 'confirmed',
    hostEmail: value.hostEmail ?? 'demo@example.org',
    createdById: value.createdById ?? 'u-demo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  demoMeetings = [meeting, ...demoMeetings];
  return cloneMeeting(meeting);
}

export function updateDemoMeeting(
  id: string,
  patch: Partial<Meeting> & { cancelEvent?: boolean },
): Meeting | undefined {
  const index = demoMeetings.findIndex(item => item.id === id);
  if (index < 0) return undefined;
  const current = demoMeetings[index];
  const next: Meeting = {
    ...current,
    ...patch,
    startTime: patch.startTime != null ? toDate(patch.startTime)! : current.startTime,
    endTime: patch.endTime != null ? toDate(patch.endTime)! : current.endTime,
    status: patch.cancelEvent ? 'cancelled' : (patch.status ?? current.status),
    updatedAt: new Date(),
  };
  delete (next as { cancelEvent?: boolean }).cancelEvent;
  demoMeetings[index] = next;
  return cloneMeeting(next);
}

function toDate(value: Date | string | undefined): Date | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value : new Date(value);
}

function cloneMeeting(meeting: Meeting): Meeting {
  return {
    ...meeting,
    agenda: meeting.agenda?.map(item => ({ ...item })),
    attendees: meeting.attendees?.map(item => ({ ...item })),
    startTime: new Date(meeting.startTime),
    endTime: new Date(meeting.endTime),
    createdAt: meeting.createdAt ? new Date(meeting.createdAt) : undefined,
    updatedAt: meeting.updatedAt ? new Date(meeting.updatedAt) : undefined,
  };
}
