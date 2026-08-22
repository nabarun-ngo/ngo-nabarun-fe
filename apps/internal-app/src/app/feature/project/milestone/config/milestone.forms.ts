import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Milestone,
  MilestoneFilterCriteria,
  MilestoneImportance,
  MilestoneRefDataMap,
  MilestoneStatus,
} from '../domain';
import { MilestoneRefData } from '../domain';

function options(refData: MilestoneRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `milestone-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

export function buildMilestoneCreateForm(
  refData: MilestoneRefDataMap,
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
    field('name', 'Milestone', 'text', 2, {
      mandatory: true,
      validationRules: {
        pattern: '^.{3,150}$',
        regexErrMsg: 'Milestone must be 3 to 150 characters.',
      },
    }),
    field('description', 'Description', 'textarea', 3),
    field('importance', 'Importance', 'select', 4, {
      mandatory: true,
      fieldOptions: options(refData, MilestoneRefData.refDataKey.importances),
    }),
    field('targetDate', 'Target Date', 'date', 5, { mandatory: true }),
  );

  return {
    id: 'milestone-create',
    key: 'milestone',
    label: 'Create milestone',
    description: null,
    fields,
  };
}

export function defaultMilestoneCreateValues(scopedProjectId?: string): FormValues {
  return {
    projectId: scopedProjectId ?? '',
    name: '',
    description: '',
    importance: 'MEDIUM',
    targetDate: '',
  };
}

/** Status changes through the complete action, so it is not part of the edit form. */
export function buildMilestoneUpdateForm(
  milestone: Milestone,
  refData: MilestoneRefDataMap,
): FormDefinition {
  return {
    id: `milestone-update-${milestone.id}`,
    key: 'milestone',
    label: 'Update milestone',
    description: null,
    fields: [
      field('name', 'Milestone', 'text', 1, { mandatory: true }),
      field('description', 'Description', 'textarea', 2),
      field('importance', 'Importance', 'select', 3, {
        mandatory: true,
        fieldOptions: options(refData, MilestoneRefData.refDataKey.importances),
      }),
      field('targetDate', 'Target Date', 'date', 4, { mandatory: true }),
    ],
  };
}

export function milestoneToUpdateValues(milestone: Milestone): FormValues {
  return {
    name: milestone.name ?? '',
    description: milestone.description ?? '',
    importance: milestone.importance ?? '',
    targetDate: milestone.targetDate ?? '',
  };
}

function text(values: FormValues, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function milestoneCreateEntity(values: FormValues): Partial<Milestone> {
  return {
    name: text(values, 'name'),
    description: text(values, 'description'),
    importance: text(values, 'importance') as MilestoneImportance | undefined,
    targetDate: text(values, 'targetDate'),
  };
}

export function milestoneProjectId(values: FormValues): string | undefined {
  return text(values, 'projectId');
}

export function milestoneUpdatePatch(values: FormValues): Partial<Milestone> {
  return {
    name: text(values, 'name'),
    description: text(values, 'description'),
    importance: text(values, 'importance') as MilestoneImportance | undefined,
    targetDate: text(values, 'targetDate'),
  };
}

export function buildMilestoneFilterForm(
  refData: MilestoneRefDataMap,
  deps: { projectOptions?: FieldOption[]; scopedProjectId?: string } = {},
): FormDefinition {
  const fields: FormFieldDefinition[] = [];

  if (!deps.scopedProjectId) {
    fields.push(field('projectId', 'Project', 'autocomplete', 1, {
      mandatory: true,
      fieldOptions: deps.projectOptions ?? [],
      hint: 'Milestones are listed one project at a time.',
    }));
  }

  fields.push(
    field('status', 'Status', 'select', 2, {
      fieldOptions: options(refData, MilestoneRefData.refDataKey.statuses),
    }),
    field('importance', 'Importance', 'select', 3, {
      fieldOptions: options(refData, MilestoneRefData.refDataKey.importances),
    }),
  );

  return {
    id: 'milestone-filter',
    key: 'milestone-filter',
    label: 'Filter milestones',
    description: null,
    fields,
  };
}

export function milestoneCriteriaToValues(criteria: MilestoneFilterCriteria): FormValues {
  return {
    projectId: criteria.projectId ?? '',
    status: criteria.status ?? '',
    importance: criteria.importance ?? '',
  };
}

export function milestoneValuesToCriteria(
  values: FormValues,
  criteria: MilestoneFilterCriteria,
): MilestoneFilterCriteria {
  return {
    ...criteria,
    projectId: text(values, 'projectId') ?? criteria.projectId,
    status: text(values, 'status') as MilestoneStatus | undefined,
    importance: text(values, 'importance') as MilestoneImportance | undefined,
  };
}

export function buildMilestoneEditSummary(
  milestone: Milestone,
  refData: MilestoneRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    {
      label: 'Current status',
      value: label(MilestoneRefData.refDataKey.statuses, milestone.status),
    },
    { label: 'Target date', value: milestone.targetDate ?? '-' },
  ];
}

/**
 * The complete endpoint accepts no payload, so this sheet only confirms the milestone
 * being closed out.
 */
export function buildMilestoneCompleteForm(milestone: Milestone): FormDefinition {
  return {
    id: `milestone-complete-${milestone.id}`,
    key: 'milestone-complete',
    label: 'Mark milestone achieved',
    description: 'The achievement date is recorded as today.',
    fields: [
      field('name', 'Milestone', 'text', 1, { readOnly: true }),
      field('targetDate', 'Target date', 'text', 2, { readOnly: true }),
    ],
  };
}

export function milestoneCompleteValues(milestone: Milestone): FormValues {
  return {
    name: milestone.name ?? '',
    targetDate: milestone.targetDate ?? '',
  };
}
