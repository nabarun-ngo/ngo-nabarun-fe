import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import { activityStatusForChip, matchesActivitySearch } from 'src/app/feature/project/activity/config/activity.rules';
import type {
  Activity,
  ActivityFilterCriteria,
  ActivityPrimaryChip,
} from 'src/app/feature/project/activity/domain';

const DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'act-001',
    projectId: 'prj-001',
    name: 'Teacher orientation workshop',
    description: 'Two-day orientation for 18 teachers on the new learning kit.',
    type: 'WORKSHOP',
    scale: 'ACTIVITY',
    priority: 'HIGH',
    status: 'COMPLETED',
    startDate: '2026-02-10',
    endDate: '2026-02-11',
    actualStartDate: '2026-02-10',
    actualEndDate: '2026-02-11',
    location: 'Nadia, West Bengal',
    venue: 'Block Resource Centre',
    currency: 'INR',
    estimatedCost: 42000,
    actualCost: 38500,
    expectedParticipants: 20,
    actualParticipants: 18,
    assignedTo: 'usr-001',
    organizerId: 'usr-002',
    nextStatus: [],
    tags: ['training'],
    createdAt: '2026-01-20T06:00:00.000Z',
    updatedAt: '2026-02-12T06:00:00.000Z',
  },
  {
    id: 'act-002',
    projectId: 'prj-001',
    name: 'Study material distribution',
    description: 'Distribute learning kits across both schools.',
    type: 'DISTRIBUTION',
    scale: 'TASK',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    startDate: '2026-08-01',
    endDate: '2026-08-20',
    location: 'Nadia, West Bengal',
    currency: 'INR',
    estimatedCost: 65000,
    expectedParticipants: 320,
    actualParticipants: 140,
    assignedTo: 'usr-003',
    nextStatus: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
    tags: ['logistics'],
    createdAt: '2026-07-14T06:00:00.000Z',
    updatedAt: '2026-08-10T06:00:00.000Z',
  },
  {
    id: 'act-003',
    projectId: 'prj-002',
    name: 'August health screening camp',
    type: 'FIELD_VISIT',
    scale: 'EVENT',
    priority: 'URGENT',
    status: 'CONFIRMED',
    startDate: '2026-08-24',
    location: 'Purulia, West Bengal',
    venue: 'Gram Panchayat Hall',
    currency: 'INR',
    estimatedCost: 28000,
    expectedParticipants: 250,
    assignedTo: 'usr-002',
    organizerId: 'usr-002',
    nextStatus: ['IN_PROGRESS', 'CANCELLED', 'ON_HOLD'],
    tags: ['health', 'camp'],
    createdAt: '2026-07-30T06:00:00.000Z',
    updatedAt: '2026-08-05T06:00:00.000Z',
  },
  {
    id: 'act-004',
    projectId: 'prj-004',
    name: 'Trainer identification survey',
    type: 'SURVEY',
    scale: 'TASK',
    priority: 'LOW',
    status: 'PLANNED',
    startDate: '2026-09-05',
    location: 'Howrah, West Bengal',
    currency: 'INR',
    estimatedCost: 12000,
    expectedParticipants: 40,
    nextStatus: ['CONFIRMED', 'CANCELLED'],
    tags: ['survey'],
    createdAt: '2026-08-02T06:00:00.000Z',
    updatedAt: '2026-08-02T06:00:00.000Z',
  },
];

const store = DEMO_ACTIVITIES.map(activity => ({ ...activity }));

export function getDemoActivityPage(
  chipId: ActivityPrimaryChip,
  criteria: ActivityFilterCriteria,
  searchText: string | undefined,
  pageIndex: number,
  pageSize: number,
): { items: Activity[]; totalSize: number } {
  const status = activityStatusForChip(chipId) ?? criteria.status;
  const matches = store.filter(activity =>
    (!criteria.projectId || activity.projectId === criteria.projectId)
    && (!status || activity.status === status)
    && (!criteria.type || activity.type === criteria.type)
    && (!criteria.scale || activity.scale === criteria.scale)
    && (!criteria.assignedTo || activity.assignedTo === criteria.assignedTo)
    && (!criteria.organizerId || activity.organizerId === criteria.organizerId)
    && matchesActivitySearch(activity, searchText));

  const start = pageIndex * pageSize;
  return { items: matches.slice(start, start + pageSize), totalSize: matches.length };
}

export function findDemoActivity(id: string): Activity | undefined {
  return store.find(activity => activity.id === id);
}

export function buildDemoCreatedActivity(
  projectId: string,
  data: Partial<Activity>,
): Activity {
  const created: Activity = {
    id: `act-${String(store.length + 1).padStart(3, '0')}`,
    projectId,
    name: data.name ?? 'New activity',
    description: data.description,
    type: data.type ?? 'OTHER',
    scale: data.scale ?? 'ACTIVITY',
    priority: data.priority ?? 'MEDIUM',
    status: 'PLANNED',
    startDate: data.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: data.endDate,
    location: data.location,
    venue: data.venue,
    currency: data.currency ?? 'INR',
    estimatedCost: data.estimatedCost,
    expectedParticipants: data.expectedParticipants,
    assignedTo: data.assignedTo,
    organizerId: data.organizerId,
    nextStatus: ['CONFIRMED', 'CANCELLED'],
    tags: data.tags ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.unshift(created);
  return created;
}

export function updateDemoActivity(id: string, patch: Partial<Activity>): Activity {
  const index = store.findIndex(activity => activity.id === id);
  const current = index >= 0 ? store[index] : store[0];
  const updated: Activity = { ...current, ...patch, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    store[index] = updated;
  }
  return updated;
}

export const DEMO_ACTIVITY_REF_DATA = {
  activityTypes: [
    { key: 'TRAINING', displayValue: 'Training' },
    { key: 'AWARENESS', displayValue: 'Awareness' },
    { key: 'DISTRIBUTION', displayValue: 'Distribution' },
    { key: 'SURVEY', displayValue: 'Survey' },
    { key: 'MEETING', displayValue: 'Meeting' },
    { key: 'FIELD_VISIT', displayValue: 'Field visit' },
    { key: 'DOCUMENTATION', displayValue: 'Documentation' },
    { key: 'WORKSHOP', displayValue: 'Workshop' },
    { key: 'SEMINAR', displayValue: 'Seminar' },
    { key: 'FUNDRAISING', displayValue: 'Fundraising' },
    { key: 'VOLUNTEER_ACTIVITY', displayValue: 'Volunteer activity' },
    { key: 'CONFERENCE', displayValue: 'Conference' },
    { key: 'EXHIBITION', displayValue: 'Exhibition' },
    { key: 'OTHER', displayValue: 'Other' },
  ],
  activityStatuses: [
    { key: 'PLANNED', displayValue: 'Planned' },
    { key: 'CONFIRMED', displayValue: 'Confirmed' },
    { key: 'IN_PROGRESS', displayValue: 'In progress' },
    { key: 'COMPLETED', displayValue: 'Completed' },
    { key: 'CANCELLED', displayValue: 'Cancelled' },
    { key: 'ON_HOLD', displayValue: 'On hold' },
  ],
  activityPriorities: [
    { key: 'LOW', displayValue: 'Low' },
    { key: 'MEDIUM', displayValue: 'Medium' },
    { key: 'HIGH', displayValue: 'High' },
    { key: 'URGENT', displayValue: 'Urgent' },
  ],
  activityScales: [
    { key: 'TASK', displayValue: 'Task' },
    { key: 'ACTIVITY', displayValue: 'Activity' },
    { key: 'EVENT', displayValue: 'Event' },
  ],
} as unknown as ProjectRefDataDto;

export const DEMO_ACTIVITY_PROJECT_OPTIONS = [
  { key: 'prj-001', label: 'EDU · Village School Support' },
  { key: 'prj-002', label: 'HLT · Mobile Health Camps' },
  { key: 'prj-004', label: 'WMN · Women Skill Collective' },
];

export const DEMO_ACTIVITY_USER_OPTIONS = [
  { key: 'usr-001', label: 'Anita Roy' },
  { key: 'usr-002', label: 'Debashis Ghosh' },
  { key: 'usr-003', label: 'Farhana Khatun' },
];

export const DEMO_ACTIVITY_EXPENSE_OPTIONS = [
  { key: 'exp-001', label: 'EXP-2026-014 · Workshop catering' },
  { key: 'exp-002', label: 'EXP-2026-021 · Learning kit printing' },
];
