import { normalizeFieldType } from '@nabarun-ngo/forms-core';
import { mapPagedResult } from 'src/app/shared/models/paged-result.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type {
  PagedWorkflowRequest,
  RequestRefData,
  RequestStartForm,
  WorkflowRequest,
  WorkflowRequestPerson,
  WorkflowRequestSubmittedField,
  WorkflowTimelineEntry,
} from '../domain';
import { RequestRefDataKeys } from '../domain';

/** Simple Request API DTO until OpenAPI client is regenerated. */
export type WorkflowRequestDto = {
  id: string;
  type: string;
  name: string;
  formKey?: string;
  formSubmissionId?: string | null;
  status: string;
  initiatedById?: string | null;
  initiatedForId?: string | null;
  assigneeId?: string | null;
  claimedById?: string | null;
  claimedAt?: string | Date | null;
  executorRoles?: string[];
  executorGroups?: string[];
  executorPermissions?: string[];
  needApproval?: boolean;
  executorInstructions?: string | null;
  approverRoles?: string[];
  approverGroups?: string[];
  approverPermissions?: string[];
  assignedToMeAtApproval?: boolean;
  decisionNote?: string | null;
  completedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  initiatedBy?: WorkflowRequestPersonDto | null;
  initiatedFor?: WorkflowRequestPersonDto | null;
  assignee?: WorkflowRequestPersonDto | null;
  claimedBy?: WorkflowRequestPersonDto | null;
  events?: WorkflowRequestEventDto[];
};

export type WorkflowRequestPersonDto = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type WorkflowRequestEventDto = {
  id: string;
  requestId?: string;
  type: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
  occurredAt: string | Date;
};

export type WorkflowRequestPartyCriteriaDto = {
  roles?: string[];
  permissions?: string[];
  groups?: string[];
};

export type WorkflowRequestTypeDto = {
  id: string;
  version?: number;
  name: string;
  description?: string;
  formKey?: string;
  executorInstructions?: string;
  needApproval?: boolean;
  approvers?: WorkflowRequestPartyCriteriaDto;
  executors?: WorkflowRequestPartyCriteriaDto;
  /** @deprecated Prefer nested executors/approvers from the API. */
  executorRoles?: string[];
  executorGroups?: string[];
  approverRoles?: string[];
  approverGroups?: string[];
};

export type WorkflowStartFormDto = {
  type?: string;
  definitionId?: string;
  formKey?: string | null;
  formId?: string | null;
  label?: string | null;
  description?: string | null;
  fields?: Array<{
    id: string;
    key: string;
    label: string;
    fieldType: string;
    mandatory: boolean;
    fieldOptions?: Array<{ key: string; label: string }>;
    isHidden?: boolean;
    isEncrypted?: boolean;
    enabled?: boolean;
    sortOrder?: number;
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
  }>;
};

export function mapRequestPersonDto(
  dto?: WorkflowRequestPersonDto | null,
): WorkflowRequestPerson | null {
  if (!dto?.id) return null;
  return {
    id: dto.id,
    firstName: dto.firstName ?? null,
    lastName: dto.lastName ?? null,
  };
}

export function mapRequestEventDto(
  dto: WorkflowRequestEventDto,
  index: number,
): WorkflowTimelineEntry {
  return {
    id: dto.id,
    sequence: index + 1,
    eventType: dto.type,
    actorId: dto.actorId ?? null,
    occurredAt: toIso(dto.occurredAt) ?? '',
    payload: dto.payload ?? {},
  };
}

export function mapRequestDto(dto: WorkflowRequestDto): WorkflowRequest {
  const type = dto.type ?? '';
  const events = (dto.events ?? []).map((event, index) =>
    mapRequestEventDto(event, index));

  return {
    id: dto.id,
    name: dto.name,
    definitionId: type,
    type,
    formKey: dto.formKey,
    formSubmissionId: dto.formSubmissionId ?? null,
    status: dto.status,
    initiatedById: dto.initiatedById,
    initiatedForId: dto.initiatedForId,
    assigneeId: dto.assigneeId,
    claimedById: dto.claimedById,
    claimedAt: toIso(dto.claimedAt),
    executorRoles: dto.executorRoles ?? [],
    executorGroups: dto.executorGroups ?? [],
    executorPermissions: dto.executorPermissions ?? [],
    needApproval: !!dto.needApproval,
    executorInstructions: dto.executorInstructions ?? null,
    approverRoles: dto.approverRoles,
    approverGroups: dto.approverGroups,
    approverPermissions: dto.approverPermissions,
    assignedToMeAtApproval: !!dto.assignedToMeAtApproval,
    decisionNote: dto.decisionNote ?? null,
    completedAt: toIso(dto.completedAt),
    createdAt: toIso(dto.createdAt),
    updatedAt: toIso(dto.updatedAt),
    initiatedBy: mapRequestPersonDto(dto.initiatedBy),
    initiatedFor: mapRequestPersonDto(dto.initiatedFor),
    assignee: mapRequestPersonDto(dto.assignee),
    claimedBy: mapRequestPersonDto(dto.claimedBy),
    timeline: events,
  };
}

/** Resolved custom-form field value as returned by the form submissions API. */
export type WorkflowRequestSubmittedFieldDto = {
  key: string;
  label?: string;
  fieldType?: string;
  value?: unknown;
  isHidden?: boolean;
  availableOptions?: Array<{ key: string; label: string }> | null;
};

export function mapSubmittedFieldDtos(
  dtos: WorkflowRequestSubmittedFieldDto[] = [],
): WorkflowRequestSubmittedField[] {
  return dtos
    .filter(dto => !dto.isHidden)
    .map(dto => ({
      key: dto.key,
      label: dto.label || dto.key,
      value: formatSubmittedValue(dto),
    }));
}

function formatSubmittedValue(dto: WorkflowRequestSubmittedFieldDto): string {
  const value = dto.value;
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) {
    return value.map(item => optionLabel(dto, item)).filter(Boolean).join(', ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (dto.fieldType === 'date') return date(String(value), 'dd MMM yyyy') || String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return optionLabel(dto, value);
}

function optionLabel(dto: WorkflowRequestSubmittedFieldDto, value: unknown): string {
  const raw = String(value ?? '');
  const match = (dto.availableOptions ?? []).find(option => option.key === raw);
  return match?.label ?? raw;
}

export function mapPagedRequestDto(dto: {
  items?: WorkflowRequestDto[];
  content?: WorkflowRequestDto[];
  total?: number;
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}): PagedWorkflowRequest {
  return mapPagedResult(dto, mapRequestDto);
}

/**
 * A field type the form engine does not know throws while the step definition is
 * built, which leaves the create stepper stuck on the previous step. Fall back to
 * a text field so the rest of the start form still renders.
 */
function safeFieldType(raw?: string): string {
  try {
    return normalizeFieldType(String(raw ?? 'text'));
  } catch {
    return 'text';
  }
}

export function mapStartFormDto(dto: WorkflowStartFormDto): RequestStartForm {
  const definitionId = dto.type ?? dto.definitionId ?? '';
  return {
    definitionId,
    formKey: dto.formKey ?? null,
    formId: dto.formId ?? null,
    label: dto.label ?? null,
    description: dto.description ?? null,
    fields: (dto.fields ?? []).map(field => ({
      id: field.id,
      key: field.key,
      label: field.label,
      fieldType: safeFieldType(field.fieldType),
      mandatory: !!field.mandatory,
      fieldOptions: (field.fieldOptions ?? []).map(option => ({
        key: option.key,
        label: option.label,
      })),
      isHidden: !!field.isHidden,
      isEncrypted: !!field.isEncrypted,
      enabled: field.enabled !== false,
      sortOrder: typeof field.sortOrder === 'number' ? field.sortOrder : 0,
      stepId: field.stepId ?? null,
      stepName: field.stepName ?? null,
      condition: field.condition ?? null,
      dependentOptions: field.dependentOptions ?? null,
      validationRules: field.validationRules ?? null,
    })),
  };
}

export function mapRequestTypesToRefData(
  types: WorkflowRequestTypeDto[] = [],
): RequestRefData {
  const typeOptions = types.map(item => ({
    key: item.id,
    displayValue: item.name || item.id,
  }));

  return {
    [RequestRefDataKeys.types]: typeOptions,
    [RequestRefDataKeys.visibleTypes]: typeOptions,
    [RequestRefDataKeys.statuses]: defaultRequestStatuses(),
  };
}

export function mapRequestRefData(
  types: WorkflowRequestTypeDto[] = [],
): RequestRefData {
  if (types.length) return mapRequestTypesToRefData(types);
  return {
    [RequestRefDataKeys.types]: [
      { key: 'JOIN_REQUEST', displayValue: 'User Onboarding' },
      { key: 'CONTACT_REQUEST', displayValue: 'Contact & Support' },
      { key: 'DONATION_REQUEST', displayValue: 'Donation Request' },
    ],
    [RequestRefDataKeys.visibleTypes]: [
      { key: 'JOIN_REQUEST', displayValue: 'User Onboarding' },
      { key: 'CONTACT_REQUEST', displayValue: 'Contact & Support' },
      { key: 'DONATION_REQUEST', displayValue: 'Donation Request' },
    ],
    [RequestRefDataKeys.statuses]: defaultRequestStatuses(),
  };
}

function defaultRequestStatuses() {
  return [
    { key: 'PendingForApproval', displayValue: 'Pending for Approval' },
    { key: 'YetToStart', displayValue: 'Yet to Start' },
    { key: 'InProgress', displayValue: 'In Progress' },
    { key: 'Closed', displayValue: 'Closed' },
    { key: 'Rejected', displayValue: 'Rejected' },
    { key: 'Withdrawn', displayValue: 'Withdrawn' },
  ];
}

function toIso(value?: string | Date | null): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}
