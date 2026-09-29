import type {
  RequestFilterCriteria,
  RequestListScope,
  RequestMemberOption,
  RequestRefData,
} from 'src/app/feature/workflow/request/domain';
import {
  mapRequestRefData,
  type WorkflowRequestDto,
  type WorkflowRequestEventDto,
  type WorkflowRequestSubmittedFieldDto,
  type WorkflowStartFormDto,
} from 'src/app/feature/workflow/request/data/request-data.mapper';
import type { StartRequestInput } from 'src/app/feature/workflow/request/data/request-data.source';

const DEMO_MEMBERS: RequestMemberOption[] = [
  { id: 'u-asha', fullName: 'Asha Verma', email: 'asha.verma@example.org' },
  { id: 'u-ravi', fullName: 'Ravi Sen', email: 'ravi.sen@example.org' },
  { id: 'u-meera', fullName: 'Meera Das', email: 'meera.das@example.org' },
];

let demoRequests: WorkflowRequestDto[] = [
  {
    id: 'req-a1b2c3d4-0001',
    type: 'DONATION_REQUEST',
    name: 'Donation request for Priya S.',
    formKey: 'DONATION_REQUEST:request',
    status: 'YetToStart',
    executorRoles: ['TREASURER'],
    executorGroups: [],
    needApproval: false,
    executorInstructions: 'Collect donation details and confirm receipt.',
    initiatedById: 'u-demo',
    initiatedForId: 'u-demo',
    initiatedBy: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    initiatedFor: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'req-c4d5e6f7-0002',
    type: 'CONTACT_REQUEST',
    name: 'Membership card help',
    formKey: 'CONTACT_REQUEST:request',
    status: 'Closed',
    executorRoles: ['SUPPORT'],
    executorGroups: [],
    needApproval: false,
    executorInstructions: 'Respond to the member and close the ticket.',
    initiatedById: 'u-demo',
    initiatedForId: 'u-demo',
    initiatedBy: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    claimedById: 'u-asha',
    claimedBy: { id: 'u-asha', firstName: 'Asha', lastName: 'Verma' },
    assigneeId: 'u-asha',
    assignee: { id: 'u-asha', firstName: 'Asha', lastName: 'Verma' },
    completedAt: '2026-08-12T16:00:00.000Z',
    createdAt: '2026-08-12T08:00:00.000Z',
    updatedAt: '2026-08-12T16:00:00.000Z',
  },
  {
    id: 'req-e6f7a8b9-0003',
    type: 'DONATION_REQUEST',
    name: 'Donation request for Ravi Sen',
    formKey: 'DONATION_REQUEST:request',
    status: 'PendingForApproval',
    executorRoles: ['TREASURER'],
    executorGroups: [],
    needApproval: true,
    approverRoles: ['SECRETARY'],
    executorInstructions: 'Verify amount and approve donation intake.',
    initiatedById: 'u-demo',
    initiatedForId: 'u-ravi',
    initiatedBy: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    initiatedFor: { id: 'u-ravi', firstName: 'Ravi', lastName: 'Sen' },
    assigneeId: 'u-demo',
    assignee: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    assignedToMeAtApproval: true,
    createdAt: '2026-08-08T08:00:00.000Z',
    updatedAt: '2026-08-08T10:00:00.000Z',
  },
  {
    id: 'req-pending-unassigned-0005',
    type: 'ACCOUNT_ADJUSTMENT',
    name: 'Account adjustment review',
    formKey: 'ACCOUNT_ADJUSTMENT:request',
    status: 'PendingForApproval',
    executorRoles: ['SECRETARY'],
    executorGroups: [],
    needApproval: true,
    approverRoles: ['PRESIDENT', 'SECRETARY'],
    executorInstructions: 'Review and approve the account adjustment.',
    initiatedById: 'u-ravi',
    initiatedForId: 'u-ravi',
    initiatedBy: { id: 'u-ravi', firstName: 'Ravi', lastName: 'Sen' },
    createdAt: '2026-08-14T08:00:00.000Z',
    updatedAt: '2026-08-14T08:00:00.000Z',
  },
  {
    id: 'req-in-progress-0006',
    type: 'CONTACT_REQUEST',
    name: 'Address update for Meera',
    formKey: 'CONTACT_REQUEST:request',
    status: 'InProgress',
    executorRoles: ['SUPPORT'],
    executorGroups: [],
    needApproval: false,
    executorInstructions: 'Update member address and confirm.',
    initiatedById: 'u-meera',
    initiatedForId: 'u-meera',
    initiatedBy: { id: 'u-meera', firstName: 'Meera', lastName: 'Das' },
    claimedById: 'u-demo',
    claimedBy: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    assigneeId: 'u-demo',
    assignee: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    claimedAt: '2026-08-13T10:00:00.000Z',
    createdAt: '2026-08-13T08:00:00.000Z',
    updatedAt: '2026-08-13T10:00:00.000Z',
  },
  {
    id: 'req-f7a8b9c0-0004',
    type: 'JOIN_REQUEST',
    name: 'Join request for Guest Applicant',
    formKey: 'JOIN_REQUEST:request',
    status: 'Withdrawn',
    executorRoles: ['MEMBERSHIP'],
    executorGroups: [],
    needApproval: true,
    approverRoles: ['SECRETARY'],
    executorInstructions: 'Review application and approve membership.',
    initiatedById: 'u-demo',
    initiatedForId: null,
    initiatedBy: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    decisionNote: 'Withdrawn by initiator',
    completedAt: '2026-08-10T11:00:00.000Z',
    createdAt: '2026-08-09T08:00:00.000Z',
    updatedAt: '2026-08-10T11:00:00.000Z',
  },
];

const demoEvents: Record<string, WorkflowRequestEventDto[]> = {
  'req-a1b2c3d4-0001': [
    {
      id: 'ev-1',
      requestId: 'req-a1b2c3d4-0001',
      type: 'Created',
      actorId: 'u-demo',
      occurredAt: '2026-08-15T08:00:00.000Z',
      payload: {},
    },
  ],
  'req-c4d5e6f7-0002': [
    {
      id: 'ev-3',
      requestId: 'req-c4d5e6f7-0002',
      type: 'Created',
      actorId: 'u-demo',
      occurredAt: '2026-08-12T08:00:00.000Z',
      payload: {},
    },
    {
      id: 'ev-4',
      requestId: 'req-c4d5e6f7-0002',
      type: 'Closed',
      actorId: 'u-asha',
      occurredAt: '2026-08-12T16:00:00.000Z',
      payload: {},
    },
  ],
  'req-e6f7a8b9-0003': [
    {
      id: 'ev-5',
      requestId: 'req-e6f7a8b9-0003',
      type: 'Created',
      actorId: 'u-demo',
      occurredAt: '2026-08-08T08:00:00.000Z',
      payload: {},
    },
    {
      id: 'ev-6',
      requestId: 'req-e6f7a8b9-0003',
      type: 'Assigned',
      actorId: 'u-demo',
      occurredAt: '2026-08-08T10:00:00.000Z',
      payload: {},
    },
  ],
};

const demoSubmissions: Record<string, WorkflowRequestSubmittedFieldDto[]> = {
  'req-a1b2c3d4-0001': [
    { key: 'fullName', label: 'Full name', fieldType: 'text', value: 'Priya Sharma' },
    { key: 'amount', label: 'Amount', fieldType: 'number', value: 5000 },
    { key: 'remarks', label: 'Remarks', fieldType: 'textarea', value: 'Monthly contribution.' },
  ],
  'req-c4d5e6f7-0002': [
    { key: 'fullName', label: 'Full name', fieldType: 'text', value: 'Demo User' },
    { key: 'email', label: 'Email', fieldType: 'email', value: 'demo.user@example.org' },
    { key: 'subject', label: 'Subject', fieldType: 'text', value: 'Membership card not received' },
    { key: 'message', label: 'Message', fieldType: 'textarea', value: 'Please re-issue my card.' },
  ],
  'req-e6f7a8b9-0003': [
    { key: 'fullName', label: 'Full name', fieldType: 'text', value: 'Ravi Sen' },
    { key: 'amount', label: 'Amount', fieldType: 'number', value: 12000 },
    { key: 'remarks', label: 'Remarks', fieldType: 'textarea', value: 'Annual donation pledge.' },
  ],
  'req-in-progress-0006': [
    { key: 'fullName', label: 'Full name', fieldType: 'text', value: 'Meera Das' },
    { key: 'subject', label: 'Subject', fieldType: 'text', value: 'Address update' },
    { key: 'message', label: 'Message', fieldType: 'textarea', value: 'Moved to a new flat.' },
  ],
};

export function getDemoSubmittedFieldDtos(id: string): WorkflowRequestSubmittedFieldDto[] {
  return (demoSubmissions[id] ?? []).map(field => ({ ...field }));
}

export function getDemoRequestRefData(): RequestRefData {
  return mapRequestRefData();
}

export function getDemoRequestMembers(): RequestMemberOption[] {
  return DEMO_MEMBERS.map(item => ({ ...item }));
}

function demoField(
  id: string,
  key: string,
  label: string,
  fieldType: string,
  sortOrder: number,
  mandatory = false,
): NonNullable<WorkflowStartFormDto['fields']>[number] {
  return {
    id,
    key,
    label,
    fieldType,
    mandatory,
    fieldOptions: [],
    isHidden: false,
    isEncrypted: false,
    enabled: true,
    sortOrder,
  };
}

export function getDemoStartFormDto(definitionId: string): WorkflowStartFormDto {
  if (definitionId === 'JOIN_REQUEST') {
    return {
      type: definitionId,
      formKey: 'JOIN_REQUEST:request',
      formId: 'demo-join-request',
      label: 'Join request',
      description: null,
      fields: [
        demoField('join-firstName', 'firstName', 'First name', 'text', 1, true),
        demoField('join-lastName', 'lastName', 'Last name', 'text', 2, true),
        demoField('join-email', 'email', 'Email', 'email', 3, true),
        demoField('join-contactNumber', 'contactNumber', 'Contact number', 'phone', 4, true),
        demoField('join-hometown', 'hometown', 'Hometown', 'text', 5, true),
      ],
    };
  }
  if (definitionId === 'CONTACT_REQUEST') {
    return {
      type: definitionId,
      formKey: 'CONTACT_REQUEST:request',
      formId: 'demo-contact-request',
      label: 'Contact & support',
      description: null,
      fields: [
        demoField('contact-fullName', 'fullName', 'Full name', 'text', 1, true),
        demoField('contact-email', 'email', 'Email', 'email', 2, true),
        demoField('contact-contactNumber', 'contactNumber', 'Contact number', 'phone', 3, true),
        demoField('contact-subject', 'subject', 'Subject', 'text', 4, true),
        demoField('contact-message', 'message', 'Message', 'textarea', 5, true),
      ],
    };
  }
  if (definitionId === 'DONATION_REQUEST') {
    return {
      type: definitionId,
      formKey: 'DONATION_REQUEST:request',
      formId: 'demo-donation-request',
      label: 'Donation request',
      description: null,
      fields: [
        demoField('donation-fullName', 'fullName', 'Full name', 'text', 1, true),
        demoField('donation-amount', 'amount', 'Amount', 'number', 2, true),
        demoField('donation-remarks', 'remarks', 'Remarks', 'textarea', 3, false),
      ],
    };
  }
  return {
    type: definitionId,
    formKey: null,
    formId: null,
    label: null,
    description: null,
    fields: [],
  };
}

export function findDemoRequestDtoById(id: string): WorkflowRequestDto | undefined {
  const found = demoRequests.find(item => item.id === id);
  if (!found) return undefined;
  return {
    ...found,
    events: getDemoRequestEventDtos(id),
  };
}

export function getDemoRequestEventDtos(id: string): WorkflowRequestEventDto[] {
  return (demoEvents[id] ?? []).map(entry => ({ ...entry }));
}

export function getDemoRequestPageDto(
  scope: RequestListScope,
  criteria: RequestFilterCriteria,
  pageIndex: number,
  pageSize: number,
  currentUserId: string,
): {
  content: WorkflowRequestDto[];
  totalSize: number;
  pageIndex: number;
  pageSize: number;
} {
  let items = demoRequests.filter(item => {
    if (scope === 'mine') {
      return item.initiatedById === currentUserId || item.initiatedById === 'u-demo';
    }
    if (scope === 'started') {
      return item.status === 'InProgress'
        && (item.claimedById === currentUserId
          || item.assigneeId === currentUserId
          || item.claimedById === 'u-demo'
          || item.assigneeId === 'u-demo');
    }
    // Unified inbox: pending approval (eligible) or yet to start
    return item.status === 'PendingForApproval' || item.status === 'YetToStart';
  });

  if (scope === 'inbox') {
    items = [...items].sort((a, b) => {
      const aPriority =
        a.status === 'PendingForApproval'
        && (a.assigneeId === currentUserId || a.assignedToMeAtApproval)
          ? 0
          : 1;
      const bPriority =
        b.status === 'PendingForApproval'
        && (b.assigneeId === currentUserId || b.assignedToMeAtApproval)
          ? 0
          : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''));
    });
    items = items.map(item => ({
      ...item,
      assignedToMeAtApproval:
        item.status === 'PendingForApproval'
        && (item.assigneeId === currentUserId || item.assigneeId === 'u-demo'),
    }));
  }

  if (criteria.definitionId?.length) {
    const set = new Set(criteria.definitionId);
    items = items.filter(item => set.has(item.type));
  }
  if (criteria.status?.length) {
    const set = new Set(criteria.status);
    items = items.filter(item => set.has(item.status));
  }
  if (criteria.requestId?.trim()) {
    const needle = criteria.requestId.trim().toLowerCase();
    items = items.filter(item => item.id.toLowerCase().includes(needle));
  }

  const totalSize = items.length;
  const start = pageIndex * pageSize;
  return {
    content: items.slice(start, start + pageSize).map(item => ({ ...item })),
    totalSize,
    pageIndex,
    pageSize,
  };
}

export function createDemoRequestDto(input: StartRequestInput): WorkflowRequestDto {
  const id = `req-${cryptoRandom()}`;
  const needApproval = input.type === 'JOIN_REQUEST' || input.type === 'ACCOUNT_ADJUSTMENT';
  const created: WorkflowRequestDto = {
    id,
    type: input.type,
    name: input.type,
    formKey: `${input.type}:request`,
    status: needApproval ? 'PendingForApproval' : 'YetToStart',
    executorRoles: [],
    executorGroups: [],
    executorPermissions: input.type === 'JOIN_REQUEST' ? ['create:users'] : [],
    needApproval,
    approverRoles: needApproval ? ['SECRETARY'] : [],
    approverGroups: [],
    approverPermissions: [],
    executorInstructions: 'Demo fulfillment instructions.',
    initiatedById: 'u-demo',
    initiatedForId: input.initiatedForId ?? 'u-demo',
    initiatedBy: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  demoRequests = [created, ...demoRequests];
  demoSubmissions[id] = submittedFieldsFromValues(input.type, input.formValues ?? {});
  demoEvents[id] = [
    {
      id: `ev-${id}-1`,
      requestId: id,
      type: 'Created',
      actorId: 'u-demo',
      occurredAt: created.createdAt!,
      payload: { formValues: input.formValues },
    },
  ];
  return { ...created, events: getDemoRequestEventDtos(id) };
}

export function mutateDemoRequest(
  id: string,
  patch: Partial<WorkflowRequestDto>,
  eventType: string,
  actorId = 'u-demo',
): WorkflowRequestDto | undefined {
  const index = demoRequests.findIndex(item => item.id === id);
  if (index < 0) return undefined;
  const current = demoRequests[index];
  const updated: WorkflowRequestDto = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  demoRequests = [
    ...demoRequests.slice(0, index),
    updated,
    ...demoRequests.slice(index + 1),
  ];
  demoEvents[id] = [
    ...(demoEvents[id] ?? []),
    {
      id: `ev-${id}-${(demoEvents[id]?.length ?? 0) + 1}`,
      requestId: id,
      type: eventType,
      actorId,
      occurredAt: updated.updatedAt!,
      payload: {},
    },
  ];
  return { ...updated, events: getDemoRequestEventDtos(id) };
}

export function withdrawDemoRequestDto(
  id: string,
  note?: string,
): WorkflowRequestDto | undefined {
  const current = demoRequests.find(item => item.id === id);
  if (!current) return undefined;
  if (current.status !== 'PendingForApproval' && current.status !== 'YetToStart') {
    return undefined;
  }
  return mutateDemoRequest(id, {
    status: 'Withdrawn',
    decisionNote: note || current.decisionNote || 'Withdrawn by initiator',
    completedAt: new Date().toISOString(),
  }, 'Withdrawn');
}

function submittedFieldsFromValues(
  definitionId: string,
  values: Record<string, unknown>,
): WorkflowRequestSubmittedFieldDto[] {
  const fields = getDemoStartFormDto(definitionId).fields ?? [];
  const known = fields.map(field => ({
    key: field.key,
    label: field.label,
    fieldType: field.fieldType,
    value: values[field.key],
  }));
  const extras = Object.keys(values)
    .filter(key => !fields.some(field => field.key === key))
    .map(key => ({ key, label: key, value: values[key] }));
  return [...known, ...extras];
}

function cryptoRandom(): string {
  return Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 6);
}
