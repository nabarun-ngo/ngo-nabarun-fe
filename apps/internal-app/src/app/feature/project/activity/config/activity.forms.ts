import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Activity,
  ActivityFilterCriteria,
  ActivityPriority,
  ActivityRefDataMap,
  ActivityScale,
  ActivityStatus,
  ActivityType,
} from '../domain';
import { ActivityRefData } from '../domain';

function options(refData: ActivityRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `activity-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

/**
 * Activities are always created inside a project, so the project field is part of the form
 * whenever the page was not opened with a project scope.
 */
export function buildActivityCreateForm(
  refData: ActivityRefDataMap,
  deps: { projectOptions?: FieldOption[]; userOptions?: FieldOption[]; scopedProjectId?: string },
): FormDefinition {
  const fields: FormFieldDefinition[] = [];

  if (!deps.scopedProjectId) {
    fields.push(field('projectId', 'Project', 'autocomplete', 1, {
      mandatory: true,
      fieldOptions: deps.projectOptions ?? [],
    }));
  }

  fields.push(
    field('name', 'Activity Name', 'text', 2, {
      mandatory: true,
      validationRules: {
        pattern: '^.{2,100}$',
        regexErrMsg: 'Activity name must be 2 to 100 characters.',
      },
    }),
    field('description', 'Description', 'textarea', 3),
    field('type', 'Type', 'select', 4, {
      mandatory: true,
      fieldOptions: options(refData, ActivityRefData.refDataKey.types),
    }),
    field('scale', 'Scale', 'select', 5, {
      mandatory: true,
      fieldOptions: options(refData, ActivityRefData.refDataKey.scales),
    }),
    field('priority', 'Priority', 'select', 6, {
      fieldOptions: options(refData, ActivityRefData.refDataKey.priorities),
    }),
    field('startDate', 'Start Date', 'date', 7, { mandatory: true }),
    field('endDate', 'End Date', 'date', 8, {
      dateConstraints: { min: { kind: 'field', key: 'startDate' } },
    }),
    field('location', 'Location', 'text', 9),
    field('venue', 'Venue', 'text', 10),
    field('currency', 'Currency', 'text', 11),
    field('estimatedCost', 'Estimated Cost', 'number', 12),
    field('expectedParticipants', 'Expected Participants', 'number', 13),
    field('assignedTo', 'Assigned To', 'autocomplete', 14, {
      fieldOptions: deps.userOptions ?? [],
    }),
    field('organizerId', 'Organizer', 'autocomplete', 15, {
      fieldOptions: deps.userOptions ?? [],
    }),
  );

  return {
    id: 'activity-create',
    key: 'activity',
    label: 'Create activity',
    description: null,
    fields,
  };
}

export function defaultActivityCreateValues(scopedProjectId?: string): FormValues {
  return {
    projectId: scopedProjectId ?? '',
    name: '',
    description: '',
    type: '',
    scale: 'ACTIVITY',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    currency: 'INR',
    estimatedCost: null,
    expectedParticipants: null,
    assignedTo: '',
    organizerId: '',
  };
}

/**
 * Scale and parent activity cannot change after creation, and status is limited to the
 * transitions the backend reports on the activity.
 */
export function buildActivityUpdateForm(
  activity: Activity,
  refData: ActivityRefDataMap,
  userOptions: FieldOption[] = [],
): FormDefinition {
  const statusOptions = options(refData, ActivityRefData.refDataKey.statuses)
    .filter(option => option.key === activity.status
      || (activity.nextStatus ?? []).includes(option.key as ActivityStatus));

  return {
    id: `activity-update-${activity.id}`,
    key: 'activity',
    label: 'Update activity',
    description: null,
    fields: [
      field('name', 'Activity Name', 'text', 1, { mandatory: true }),
      field('description', 'Description', 'textarea', 2),
      field('type', 'Type', 'select', 3, {
        mandatory: true,
        fieldOptions: options(refData, ActivityRefData.refDataKey.types),
      }),
      field('status', 'Status', 'select', 4, {
        mandatory: true,
        fieldOptions: statusOptions,
      }),
      field('priority', 'Priority', 'select', 5, {
        fieldOptions: options(refData, ActivityRefData.refDataKey.priorities),
      }),
      field('startDate', 'Start Date', 'date', 6),
      field('endDate', 'End Date', 'date', 7, {
        dateConstraints: { min: { kind: 'field', key: 'startDate' } },
      }),
      field('location', 'Location', 'text', 8),
      field('venue', 'Venue', 'text', 9),
      field('estimatedCost', 'Estimated Cost', 'number', 10),
      field('expectedParticipants', 'Expected Participants', 'number', 11),
      field('assignedTo', 'Assigned To', 'autocomplete', 12, { fieldOptions: userOptions }),
      field('organizerId', 'Organizer', 'autocomplete', 13, { fieldOptions: userOptions }),
    ],
  };
}

export function activityToUpdateValues(activity: Activity): FormValues {
  return {
    name: activity.name ?? '',
    description: activity.description ?? '',
    type: activity.type ?? '',
    status: activity.status ?? '',
    priority: activity.priority ?? '',
    startDate: activity.startDate ?? '',
    endDate: activity.endDate ?? '',
    location: activity.location ?? '',
    venue: activity.venue ?? '',
    estimatedCost: activity.estimatedCost ?? null,
    expectedParticipants: activity.expectedParticipants ?? null,
    assignedTo: activity.assignedTo ?? '',
    organizerId: activity.organizerId ?? '',
  };
}

function text(values: FormValues, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numeric(values: FormValues, key: string): number | undefined {
  const value = Number(values[key]);
  return Number.isFinite(value) && values[key] !== null && values[key] !== ''
    ? value
    : undefined;
}

export function activityCreateEntity(values: FormValues): Partial<Activity> {
  return {
    name: text(values, 'name'),
    description: text(values, 'description'),
    type: text(values, 'type') as ActivityType | undefined,
    scale: text(values, 'scale') as ActivityScale | undefined,
    priority: text(values, 'priority') as ActivityPriority | undefined,
    startDate: text(values, 'startDate'),
    endDate: text(values, 'endDate'),
    location: text(values, 'location'),
    venue: text(values, 'venue'),
    currency: text(values, 'currency') ?? 'INR',
    estimatedCost: numeric(values, 'estimatedCost'),
    expectedParticipants: numeric(values, 'expectedParticipants'),
    assignedTo: text(values, 'assignedTo'),
    organizerId: text(values, 'organizerId'),
  };
}

export function activityProjectId(values: FormValues): string | undefined {
  return text(values, 'projectId');
}

export function activityUpdatePatch(values: FormValues): Partial<Activity> {
  return {
    name: text(values, 'name'),
    description: text(values, 'description'),
    type: text(values, 'type') as ActivityType | undefined,
    status: text(values, 'status') as ActivityStatus | undefined,
    priority: text(values, 'priority') as ActivityPriority | undefined,
    startDate: text(values, 'startDate'),
    endDate: text(values, 'endDate'),
    location: text(values, 'location'),
    venue: text(values, 'venue'),
    estimatedCost: numeric(values, 'estimatedCost'),
    expectedParticipants: numeric(values, 'expectedParticipants'),
    assignedTo: text(values, 'assignedTo'),
    organizerId: text(values, 'organizerId'),
  };
}

export function buildActivityFilterForm(
  refData: ActivityRefDataMap,
  deps: { projectOptions?: FieldOption[]; userOptions?: FieldOption[] } = {},
): FormDefinition {
  return {
    id: 'activity-filter',
    key: 'activity-filter',
    label: 'Filter activities',
    description: null,
    fields: [
      field('projectId', 'Project', 'autocomplete', 1, {
        fieldOptions: deps.projectOptions ?? [],
      }),
      field('status', 'Status', 'select', 2, {
        fieldOptions: options(refData, ActivityRefData.refDataKey.statuses),
      }),
      field('type', 'Type', 'select', 3, {
        fieldOptions: options(refData, ActivityRefData.refDataKey.types),
      }),
      field('scale', 'Scale', 'select', 4, {
        fieldOptions: options(refData, ActivityRefData.refDataKey.scales),
      }),
      field('assignedTo', 'Assigned To', 'autocomplete', 5, {
        fieldOptions: deps.userOptions ?? [],
      }),
      field('organizerId', 'Organizer', 'autocomplete', 6, {
        fieldOptions: deps.userOptions ?? [],
      }),
    ],
  };
}

export function activityCriteriaToValues(criteria: ActivityFilterCriteria): FormValues {
  return {
    projectId: criteria.projectId ?? '',
    status: criteria.status ?? '',
    type: criteria.type ?? '',
    scale: criteria.scale ?? '',
    assignedTo: criteria.assignedTo ?? '',
    organizerId: criteria.organizerId ?? '',
  };
}

export function activityValuesToCriteria(
  values: FormValues,
  criteria: ActivityFilterCriteria,
): ActivityFilterCriteria {
  return {
    ...criteria,
    projectId: text(values, 'projectId'),
    status: text(values, 'status') as ActivityStatus | undefined,
    type: text(values, 'type') as ActivityType | undefined,
    scale: text(values, 'scale') as ActivityScale | undefined,
    assignedTo: text(values, 'assignedTo'),
    organizerId: text(values, 'organizerId'),
  };
}

export function buildActivityEditSummary(
  activity: Activity,
  refData: ActivityRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    { label: 'Current status', value: label(ActivityRefData.refDataKey.statuses, activity.status) },
    { label: 'Scale', value: label(ActivityRefData.refDataKey.scales, activity.scale) },
    { label: 'Currency', value: activity.currency ?? '-' },
  ];
}

export function buildLinkExpenseForm(expenseOptions: FieldOption[] = []): FormDefinition {
  return {
    id: 'activity-link-expense',
    key: 'activity-link-expense',
    label: 'Link expense',
    description: null,
    fields: [
      field('expenseId', 'Expense', 'autocomplete', 1, {
        mandatory: true,
        fieldOptions: expenseOptions,
      }),
    ],
  };
}
