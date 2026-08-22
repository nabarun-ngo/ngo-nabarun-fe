import { baseField, fromPublicFormDefinition, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { ListFormStepperStep } from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  RequestFilterCriteria,
  RequestListContext,
  RequestPrimaryChip,
  RequestRefData,
  RequestStartForm,
  WorkflowRequest,
  WorkflowRequestDefinitionId,
} from '../domain';
import { RequestRefDataKeys } from '../domain';
import type { StartRequestInput } from '../data/request-data.source';

const YES_NO: FieldOption[] = [
  { key: 'Myself', label: 'Myself' },
  { key: 'Another member', label: 'Another member' },
];

const SHELL_KEYS = new Set(['definitionId', 'requestingFor', 'initiatedForId']);

function options(refData: RequestRefData, key: string): FieldOption[] {
  return toFieldOptions((refData[key] as KeyValue[] | undefined) ?? []);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({
    id: `request-${key}`,
    key,
    label,
    fieldType,
    sortOrder,
    ...overrides,
  });
}

export function buildRequestFilterForm(
  _chip: RequestPrimaryChip,
  refData: RequestRefData,
): FormDefinition {
  return {
    id: 'request-filter',
    key: 'request-filter',
    label: 'Filter requests',
    description: '',
    fields: [
      field('requestId', 'Request ID', 'text', 1, {
        placeholder: 'Request id',
      }),
      field('definitionId', 'Type', 'multiselect', 2, {
        fieldOptions: options(refData, RequestRefDataKeys.visibleTypes).length
          ? options(refData, RequestRefDataKeys.visibleTypes)
          : options(refData, RequestRefDataKeys.types),
      }),
      field('status', 'Status', 'multiselect', 3, {
        fieldOptions: options(refData, RequestRefDataKeys.statuses),
      }),
    ],
  };
}

export function requestCriteriaToValues(criteria: RequestFilterCriteria): FormValues {
  return {
    requestId: criteria.requestId ?? '',
    definitionId: criteria.definitionId ?? [],
    status: criteria.status ?? [],
  };
}

export function requestValuesToCriteria(values: FormValues): RequestFilterCriteria {
  const definitionId = normalizeCsv(values['definitionId']);
  const status = normalizeCsv(values['status']);
  return {
    requestId: String(values['requestId'] ?? '').trim() || undefined,
    definitionId: definitionId.length ? definitionId : undefined,
    status: status.length ? status : undefined,
  };
}

export type RequestCreateStep = 'request_type' | 'request_details';

export const REQUEST_CREATE_STEPS: ListFormStepperStep<RequestCreateStep>[] = [
  { id: 'request_type', label: 'Request type', kind: 'form' },
  { id: 'request_details', label: 'Request details', kind: 'form' },
];

export function buildRequestCreateStep(
  step: RequestCreateStep,
  refData: RequestRefData,
  memberOptions: FieldOption[] = [],
  startForm?: RequestStartForm,
): FormDefinition {
  return step === 'request_type'
    ? buildRequestTypeStep(refData, memberOptions)
    : buildRequestDetailsStep(startForm);
}

function buildRequestTypeStep(
  refData: RequestRefData,
  memberOptions: FieldOption[],
): FormDefinition {
  const typeOptions = options(refData, RequestRefDataKeys.visibleTypes).length
    ? options(refData, RequestRefDataKeys.visibleTypes)
    : options(refData, RequestRefDataKeys.types);

  return {
    id: 'request-create-type',
    key: 'request-create-type',
    label: 'New request',
    description: 'Choose a type and who this request is for',
    fields: [
      field('definitionId', 'Request type', 'select', 1, {
        mandatory: true,
        fieldOptions: typeOptions,
      }),
      field('requestingFor', 'Requesting for', 'select', 2, {
        mandatory: true,
        fieldOptions: YES_NO,
        condition: {
          dependsOnKey: 'definitionId',
          operator: 'not_equals',
          value: 'JOIN_REQUEST',
        },
      }),
      field('initiatedForId', 'Member', 'autocomplete', 3, {
        mandatory: true,
        fieldOptions: memberOptions,
        placeholder: 'Search member…',
        condition: {
          dependsOnKey: 'requestingFor',
          operator: 'equals',
          value: 'Another member',
        },
      }),
    ],
  };
}

function buildRequestDetailsStep(startForm?: RequestStartForm): FormDefinition {
  const definitionId = startForm?.definitionId ?? 'request';
  const mapped = fromPublicFormDefinition({
    id: startForm?.formId ?? `${definitionId}-start`,
    key: startForm?.formKey ?? `${definitionId}:request`,
    label: startForm?.label ?? 'Request details',
    description: startForm?.description,
    fields: startForm?.fields ?? [],
  });

  return {
    id: 'request-create-details',
    key: 'request-create-details',
    label: mapped.label || 'Request details',
    description: mapped.fields.length
      ? mapped.description ?? ''
      : 'This request type does not need any extra details.',
    fields: mapped.fields
      .filter(formField => !SHELL_KEYS.has(formField.key))
      .map(formField => ({
        ...formField,
        id: `request-${definitionId}-${formField.key}`,
      })),
  };
}

export function defaultRequestCreateValues(): FormValues {
  return {
    definitionId: '',
    requestingFor: 'Myself',
    initiatedForId: '',
  };
}

export function validateRequestCreateStep(
  step: RequestCreateStep,
  values: FormValues,
  startForm?: RequestStartForm,
): string | undefined {
  return step === 'request_type'
    ? validateRequestTypeStep(values)
    : validateRequestDetailsStep(values, startForm);
}

export function validateRequestCreate(
  values: FormValues,
  startForm?: RequestStartForm,
): string | undefined {
  return validateRequestTypeStep(values)
    ?? validateRequestDetailsStep(values, startForm);
}

function validateRequestTypeStep(values: FormValues): string | undefined {
  const definitionId = String(values['definitionId'] ?? '').trim();
  if (!definitionId) return 'Select a request type.';

  if (definitionId !== 'JOIN_REQUEST'
    && values['requestingFor'] === 'Another member'
    && !String(values['initiatedForId'] ?? '').trim()) {
    return 'Select the member you are requesting for.';
  }

  return undefined;
}

function validateRequestDetailsStep(
  values: FormValues,
  startForm?: RequestStartForm,
): string | undefined {
  for (const formField of startForm?.fields ?? []) {
    if (!formField.mandatory || formField.isHidden || !formField.enabled) continue;
    if (SHELL_KEYS.has(formField.key)) continue;
    const raw = values[formField.key];
    if (formField.fieldType === 'number') {
      const amount = Number(raw);
      if (!Number.isFinite(amount)) {
        return `${formField.label} is required.`;
      }
      continue;
    }
    if (raw == null || String(raw).trim() === '') {
      return `${formField.label} is required.`;
    }
  }

  return undefined;
}

export function requestCreatePayload(
  values: FormValues,
  startForm?: RequestStartForm,
): StartRequestInput {
  const type = String(values['definitionId'] ?? '') as WorkflowRequestDefinitionId | string;
  const formValues = buildFormValues(values, startForm);
  const initiatedForId = type === 'JOIN_REQUEST'
    ? undefined
    : values['requestingFor'] === 'Another member'
      ? (String(values['initiatedForId'] ?? '').trim() || undefined)
      : undefined;

  if (type === 'JOIN_REQUEST') {
    formValues['isExtUser'] = true;
    const email = String(values['email'] ?? '').trim();
    if (email) formValues['extUserEmail'] = email;
  }

  return {
    type,
    formValues,
    initiatedForId,
  };
}

function buildFormValues(
  values: FormValues,
  startForm?: RequestStartForm,
): Record<string, unknown> {
  const formValues: Record<string, unknown> = {};
  const keys = (startForm?.fields ?? [])
    .map(fieldDef => fieldDef.key)
    .filter(key => !SHELL_KEYS.has(key));

  for (const key of keys) {
    const raw = values[key];
    if (raw == null) continue;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed) formValues[key] = trimmed;
      continue;
    }
    if (typeof raw === 'number') {
      if (Number.isFinite(raw)) formValues[key] = raw;
      continue;
    }
    formValues[key] = raw;
  }

  return formValues;
}

export function buildWithdrawForm(_request: WorkflowRequest): FormDefinition {
  return {
    id: 'request-withdraw',
    key: 'request-withdraw',
    label: 'Withdraw request',
    description: '',
    fields: [
      field('note', 'Reason', 'textarea', 1, {
        placeholder: 'Optional note',
      }),
    ],
  };
}

export function buildDecisionNoteForm(
  id: string,
  label: string,
): FormDefinition {
  return {
    id,
    key: id,
    label,
    description: '',
    fields: [
      field('note', 'Note', 'textarea', 1, {
        placeholder: 'Optional note',
      }),
    ],
  };
}

export function buildAssignForm(memberOptions: FieldOption[]): FormDefinition {
  return {
    id: 'request-assign',
    key: 'request-assign',
    label: 'Assign request',
    description: '',
    fields: [
      field('assigneeId', 'Assignee', 'autocomplete', 1, {
        mandatory: true,
        fieldOptions: memberOptions,
        placeholder: 'Search member…',
      }),
    ],
  };
}

export function memberOptionsFromContext(
  context: RequestListContext,
): FieldOption[] {
  return (context.memberOptions ?? []).map(option => ({
    key: String(option.key),
    label: option.label,
  }));
}

export function startFormFromContext(
  context: RequestListContext,
  definitionId: string,
): RequestStartForm | undefined {
  return definitionId
    ? context.startFormsByDefinitionId?.[definitionId]
    : undefined;
}

function normalizeCsv(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  const text = String(value ?? '').trim();
  return text ? text.split(',').map(item => item.trim()).filter(Boolean) : [];
}
