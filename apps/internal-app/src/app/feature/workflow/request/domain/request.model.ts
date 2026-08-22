import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { PagedResult } from 'src/app/shared/models/paged-result.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type WorkflowRequestStatus =
  | 'PendingForApproval'
  | 'YetToStart'
  | 'InProgress'
  | 'Closed'
  | 'Rejected'
  | 'Withdrawn';

/** FE create/filter key; API field is `type`. */
export type WorkflowRequestDefinitionId =
  | 'JOIN_REQUEST'
  | 'CONTACT_REQUEST'
  | 'DONATION_REQUEST';

export interface WorkflowRequestPerson {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface WorkflowTimelineEntry {
  id: string;
  sequence: number;
  eventType: string;
  elementId?: string | null;
  actorId?: string | null;
  occurredAt: string;
  payload?: Record<string, unknown>;
}

/** A submitted request-form answer, already formatted for display. */
export interface WorkflowRequestSubmittedField {
  key: string;
  label: string;
  value: string;
}

export interface WorkflowRequest {
  id: string;
  name: string;
  /** Mapped from API `type` for create/filter form continuity. */
  definitionId: string;
  type: string;
  formKey?: string;
  formSubmissionId?: string | null;
  status: string;
  initiatedById?: string | null;
  initiatedForId?: string | null;
  assigneeId?: string | null;
  claimedById?: string | null;
  claimedAt?: string | null;
  executorRoles: string[];
  executorGroups: string[];
  executorPermissions: string[];
  needApproval: boolean;
  executorInstructions?: string | null;
  approverRoles?: string[];
  approverGroups?: string[];
  approverPermissions?: string[];
  /** Backend: Pending for Approval and assignee is the current actor. */
  assignedToMeAtApproval?: boolean;
  decisionNote?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  initiatedBy?: WorkflowRequestPerson | null;
  initiatedFor?: WorkflowRequestPerson | null;
  assignee?: WorkflowRequestPerson | null;
  claimedBy?: WorkflowRequestPerson | null;
  /** Activity feed; mapped from API `events`. */
  timeline?: WorkflowTimelineEntry[];
  /** Answers captured on the request form, loaded with the detail view. */
  submittedFields?: WorkflowRequestSubmittedField[];
}

export type PagedWorkflowRequest = PagedResult<WorkflowRequest>;

export type RequestPrimaryChip = 'my_requests' | 'request_inbox' | 'started_by_me';

export type RequestListScope = 'mine' | 'inbox' | 'started';

export interface RequestFilterCriteria {
  [key: string]: unknown;
  status?: string[];
  definitionId?: string[];
  requestId?: string;
}

export type RequestRefData = Record<string, KeyValue[] | undefined>;

export interface RequestMemberOption {
  id: string;
  fullName: string;
  email: string;
}

export interface RequestStartFormField {
  id: string;
  key: string;
  label: string;
  fieldType: string;
  mandatory: boolean;
  fieldOptions: Array<{ key: string; label: string }>;
  isHidden: boolean;
  isEncrypted: boolean;
  enabled: boolean;
  sortOrder: number;
  stepId?: string | null;
  stepName?: string | null;
  condition?: {
    dependsOnKey: string;
    operator: string;
    value: string | number | boolean | string[];
  } | null;
  dependentOptions?: {
    dependsOnKey: string;
    optionMap: Record<string, Array<{ key: string; label: string }>>;
  } | null;
  validationRules?: unknown;
}

export interface RequestStartForm {
  definitionId: string;
  formKey?: string | null;
  formId?: string | null;
  label?: string | null;
  description?: string | null;
  fields: RequestStartFormField[];
}

export interface RequestListContext {
  [key: string]: unknown;
  refData: RequestRefData;
  activeChip: RequestPrimaryChip;
  currentUserId?: string;
  memberOptions: FieldOption[];
  members: RequestMemberOption[];
  startFormsByDefinitionId: Record<string, RequestStartForm>;
  entity?: WorkflowRequest;
}

export const RequestRefDataKeys = {
  types: 'workflowTypes',
  statuses: 'workflowStatuses',
  visibleTypes: 'visibleWorkflowTypes',
} as const;

export function requestStatus(request: WorkflowRequest | undefined): string {
  return (request?.status ?? '').trim();
}

export function isRequestActive(request: WorkflowRequest | undefined): boolean {
  const status = requestStatus(request);
  return (
    status === 'PendingForApproval'
    || status === 'YetToStart'
    || status === 'InProgress'
  );
}

export function personDisplayName(
  person?: WorkflowRequestPerson | null,
  fallbackId?: string | null,
): string {
  if (person) {
    const name = [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
    if (name) return name;
    return person.id;
  }
  return fallbackId?.trim() || '-';
}
