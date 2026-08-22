import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Goal,
  GoalFilterCriteria,
  GoalPriority,
  GoalRefDataMap,
  GoalStatus,
} from '../domain';
import { GoalRefData } from '../domain';

function options(refData: GoalRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `goal-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

export function buildGoalCreateForm(
  refData: GoalRefDataMap,
  deps: { projectOptions?: FieldOption[]; scopedProjectId?: string },
): FormDefinition {
  const fields: FormFieldDefinition[] = [];

  if (!deps.scopedProjectId) {
    fields.push(field('projectId', 'Project', 'autocomplete', 1, {
      mandatory: true,
      fieldOptions: deps.projectOptions ?? [],
    }));
  }

  fields.push(
    field('title', 'Goal', 'text', 2, {
      mandatory: true,
      validationRules: {
        pattern: '^.{3,150}$',
        regexErrMsg: 'Goal must be 3 to 150 characters.',
      },
    }),
    field('description', 'Description', 'textarea', 3),
    field('priority', 'Priority', 'select', 4, {
      mandatory: true,
      fieldOptions: options(refData, GoalRefData.refDataKey.priorities),
    }),
    field('targetValue', 'Target Value', 'number', 5),
    field('targetUnit', 'Target Unit', 'text', 6, { hint: 'e.g. children, litres, sessions' }),
    field('deadline', 'Deadline', 'date', 7),
    field('weight', 'Weight', 'number', 8, { hint: 'Relative contribution to the project' }),
  );

  return {
    id: 'goal-create',
    key: 'goal',
    label: 'Create goal',
    description: null,
    fields,
  };
}

export function defaultGoalCreateValues(scopedProjectId?: string): FormValues {
  return {
    projectId: scopedProjectId ?? '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    targetValue: null,
    targetUnit: '',
    deadline: '',
    weight: null,
  };
}

/** Status moves through progress recording, so it is not editable here. */
export function buildGoalUpdateForm(goal: Goal, refData: GoalRefDataMap): FormDefinition {
  return {
    id: `goal-update-${goal.id}`,
    key: 'goal',
    label: 'Update goal',
    description: null,
    fields: [
      field('title', 'Goal', 'text', 1, { mandatory: true }),
      field('description', 'Description', 'textarea', 2),
      field('priority', 'Priority', 'select', 3, {
        mandatory: true,
        fieldOptions: options(refData, GoalRefData.refDataKey.priorities),
      }),
      field('targetValue', 'Target Value', 'number', 4),
    ],
  };
}

export function goalToUpdateValues(goal: Goal): FormValues {
  return {
    title: goal.title ?? '',
    description: goal.description ?? '',
    priority: goal.priority ?? '',
    targetValue: goal.targetValue ?? null,
  };
}

function text(values: FormValues, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numeric(values: FormValues, key: string): number | undefined {
  const raw = values[key];
  if (raw === null || raw === undefined || raw === '') {
    return undefined;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export function goalCreateEntity(values: FormValues): Partial<Goal> & {
  deadline?: string;
  targetUnit?: string;
  weight?: number;
} {
  return {
    title: text(values, 'title'),
    description: text(values, 'description'),
    priority: text(values, 'priority') as GoalPriority | undefined,
    targetValue: numeric(values, 'targetValue'),
    targetUnit: text(values, 'targetUnit'),
    deadline: text(values, 'deadline'),
    weight: numeric(values, 'weight'),
  };
}

export function goalProjectId(values: FormValues): string | undefined {
  return text(values, 'projectId');
}

export function goalUpdatePatch(values: FormValues): Partial<Goal> {
  return {
    title: text(values, 'title'),
    description: text(values, 'description'),
    priority: text(values, 'priority') as GoalPriority | undefined,
    targetValue: numeric(values, 'targetValue'),
  };
}

export function buildGoalFilterForm(
  refData: GoalRefDataMap,
  deps: { projectOptions?: FieldOption[]; scopedProjectId?: string } = {},
): FormDefinition {
  const fields: FormFieldDefinition[] = [];

  if (!deps.scopedProjectId) {
    fields.push(field('projectId', 'Project', 'autocomplete', 1, {
      mandatory: true,
      fieldOptions: deps.projectOptions ?? [],
      hint: 'Goals are listed one project at a time.',
    }));
  }

  fields.push(
    field('status', 'Status', 'select', 2, {
      fieldOptions: options(refData, GoalRefData.refDataKey.statuses),
    }),
    field('priority', 'Priority', 'select', 3, {
      fieldOptions: options(refData, GoalRefData.refDataKey.priorities),
    }),
  );

  return {
    id: 'goal-filter',
    key: 'goal-filter',
    label: 'Filter goals',
    description: null,
    fields,
  };
}

export function goalCriteriaToValues(criteria: GoalFilterCriteria): FormValues {
  return {
    projectId: criteria.projectId ?? '',
    status: criteria.status ?? '',
    priority: criteria.priority ?? '',
  };
}

export function goalValuesToCriteria(
  values: FormValues,
  criteria: GoalFilterCriteria,
): GoalFilterCriteria {
  return {
    ...criteria,
    projectId: text(values, 'projectId') ?? criteria.projectId,
    status: text(values, 'status') as GoalStatus | undefined,
    priority: text(values, 'priority') as GoalPriority | undefined,
  };
}

export function buildGoalEditSummary(
  goal: Goal,
  refData: GoalRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    { label: 'Current status', value: label(GoalRefData.refDataKey.statuses, goal.status) },
    {
      label: 'Progress',
      value: goal.targetValue
        ? `${goal.currentValue ?? 0} of ${goal.targetValue}`
        : `${goal.currentValue ?? 0}`,
    },
  ];
}

export function buildGoalProgressForm(goal: Goal): FormDefinition {
  return {
    id: `goal-progress-${goal.id}`,
    key: 'goal-progress',
    label: 'Record progress',
    description: 'Enter the running total achieved, not the change since last time.',
    fields: [
      field('currentValue', 'Achieved so far', 'number', 1, {
        mandatory: true,
        hint: goal.targetValue ? `Target is ${goal.targetValue}.` : undefined,
      }),
    ],
  };
}
