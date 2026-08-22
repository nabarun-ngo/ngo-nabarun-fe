import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Project,
  ProjectCategory,
  ProjectFilterCriteria,
  ProjectPhase,
  ProjectRefDataMap,
  ProjectStatus,
} from '../domain';
import { ProjectRefData } from '../domain';

function options(refData: ProjectRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `project-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

/** A project moves through its phases in order, one step at a time. */
const PHASE_ORDER: ProjectPhase[] = [
  'INITIATION',
  'PLANNING',
  'EXECUTION',
  'MONITORING',
  'CLOSURE',
];

function reachablePhaseOptions(
  allPhases: FieldOption[],
  current?: ProjectPhase,
): FieldOption[] {
  const index = current ? PHASE_ORDER.indexOf(current) : -1;
  if (index < 0) {
    return allPhases;
  }
  const reachable = PHASE_ORDER.slice(index, index + 2) as string[];
  return allPhases.filter(option => reachable.includes(option.key));
}

export function buildProjectCreateForm(
  refData: ProjectRefDataMap,
  userOptions: FieldOption[] = [],
): FormDefinition {
  return {
    id: 'project-create',
    key: 'project',
    label: 'Create project',
    description: null,
    fields: [
      field('code', 'Project Code', 'text', 1, {
        mandatory: true,
        validationRules: {
          pattern: '^.{3}$',
          regexErrMsg: 'Project code must be exactly 3 characters.',
        },
      }),
      field('name', 'Project Name', 'text', 2, {
        mandatory: true,
        validationRules: {
          pattern: '^.{2,50}$',
          regexErrMsg: 'Project name must be 2 to 50 characters.',
        },
      }),
      field('description', 'Project Goal(s)', 'textarea', 3, {
        mandatory: true,
        validationRules: {
          pattern: '^[\\s\\S]{2,500}$',
          regexErrMsg: 'Goals must be 2 to 500 characters.',
        },
      }),
      field('category', 'Category', 'select', 4, {
        mandatory: true,
        fieldOptions: options(refData, ProjectRefData.refDataKey.categories),
      }),
      field('phase', 'Phase', 'select', 5, {
        fieldOptions: options(refData, ProjectRefData.refDataKey.phases),
      }),
      field('budget', 'Budget', 'number', 6, { mandatory: true }),
      field('currency', 'Currency', 'text', 7, { mandatory: true }),
      field('startDate', 'Start Date', 'date', 8, { mandatory: true }),
      field('endDate', 'End Date', 'date', 9, {
        dateConstraints: { min: { kind: 'field', key: 'startDate' } },
      }),
      field('location', 'Location', 'text', 10),
      field('managerId', 'Manager', 'autocomplete', 11, {
        mandatory: true,
        fieldOptions: userOptions,
      }),
      field('sponsorId', 'Sponsor', 'autocomplete', 12, { fieldOptions: userOptions }),
      field('targetBeneficiaryCount', 'Target Beneficiaries', 'number', 13),
      field('isPublic', 'Show on public site', 'toggle', 14),
    ],
  };
}

export function defaultProjectCreateValues(): FormValues {
  return {
    code: '',
    name: '',
    description: '',
    category: '',
    phase: 'INITIATION',
    budget: null,
    currency: 'INR',
    startDate: '',
    endDate: '',
    location: '',
    managerId: '',
    sponsorId: '',
    targetBeneficiaryCount: null,
    isPublic: false,
  };
}

/**
 * Update form. Code, currency, start date and manager are fixed after creation, and the
 * status options come from the transitions the backend reports on the project.
 */
export function buildProjectUpdateForm(
  project: Project,
  refData: ProjectRefDataMap,
  userOptions: FieldOption[] = [],
): FormDefinition {
  const statusOptions = options(refData, ProjectRefData.refDataKey.statuses)
    .filter(option => option.key === project.status
      || (project.nextStatus ?? []).includes(option.key as ProjectStatus));
  const phaseOptions = reachablePhaseOptions(
    options(refData, ProjectRefData.refDataKey.phases),
    project.phase,
  );
  const budgetFloor = project.spentAmount ?? 0;

  return {
    id: `project-update-${project.id}`,
    key: 'project',
    label: 'Update project',
    description: null,
    fields: [
      field('name', 'Project Name', 'text', 1, {
        mandatory: true,
        validationRules: {
          pattern: '^.{2,50}$',
          regexErrMsg: 'Project name must be 2 to 50 characters.',
        },
      }),
      field('description', 'Project Goal(s)', 'textarea', 2, { mandatory: true }),
      field('category', 'Category', 'select', 3, {
        mandatory: true,
        fieldOptions: options(refData, ProjectRefData.refDataKey.categories),
      }),
      field('status', 'Status', 'select', 4, {
        mandatory: true,
        fieldOptions: statusOptions,
      }),
      field('phase', 'Phase', 'select', 5, {
        fieldOptions: phaseOptions,
        hint: 'A project advances one phase at a time.',
      }),
      field('budget', 'Budget', 'number', 6, {
        mandatory: true,
        hint: budgetFloor > 0
          ? `Cannot be less than the ${budgetFloor} already spent.`
          : undefined,
      }),
      field('endDate', 'End Date', 'date', 7, {
        dateConstraints: { min: { kind: 'literal', value: project.startDate } },
      }),
      field('location', 'Location', 'text', 8),
      field('sponsorId', 'Sponsor', 'autocomplete', 9, { fieldOptions: userOptions }),
      field('targetBeneficiaryCount', 'Target Beneficiaries', 'number', 10),
      field('isPublic', 'Show on public site', 'toggle', 11),
    ],
  };
}

export function projectToUpdateValues(project: Project): FormValues {
  return {
    name: project.name ?? '',
    description: project.description ?? '',
    category: project.category ?? '',
    status: project.status ?? '',
    phase: project.phase ?? '',
    budget: project.budget ?? null,
    endDate: project.endDate ?? '',
    location: project.location ?? '',
    sponsorId: project.sponsorId ?? '',
    targetBeneficiaryCount: project.targetBeneficiaryCount ?? null,
    isPublic: project.isPublic ?? false,
  };
}

function text(values: FormValues, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numeric(values: FormValues, key: string): number | undefined {
  const value = Number(values[key]);
  return Number.isFinite(value) ? value : undefined;
}

export function projectCreateEntity(values: FormValues): Partial<Project> {
  return {
    code: text(values, 'code'),
    name: text(values, 'name'),
    description: text(values, 'description'),
    category: text(values, 'category') as ProjectCategory | undefined,
    phase: text(values, 'phase') as ProjectPhase | undefined,
    budget: numeric(values, 'budget'),
    currency: text(values, 'currency') ?? 'INR',
    startDate: text(values, 'startDate'),
    endDate: text(values, 'endDate'),
    location: text(values, 'location'),
    managerId: text(values, 'managerId'),
    sponsorId: text(values, 'sponsorId'),
    targetBeneficiaryCount: numeric(values, 'targetBeneficiaryCount'),
    isPublic: values['isPublic'] === true,
  };
}

export function projectUpdatePatch(values: FormValues): Partial<Project> {
  return {
    name: text(values, 'name'),
    description: text(values, 'description'),
    category: text(values, 'category') as ProjectCategory | undefined,
    status: text(values, 'status') as ProjectStatus | undefined,
    phase: text(values, 'phase') as ProjectPhase | undefined,
    budget: numeric(values, 'budget'),
    endDate: text(values, 'endDate'),
    location: text(values, 'location'),
    sponsorId: text(values, 'sponsorId'),
    targetBeneficiaryCount: numeric(values, 'targetBeneficiaryCount'),
    isPublic: values['isPublic'] === true,
  };
}

export function buildProjectFilterForm(
  refData: ProjectRefDataMap,
  userOptions: FieldOption[] = [],
): FormDefinition {
  return {
    id: 'project-filter',
    key: 'project-filter',
    label: 'Filter projects',
    description: null,
    fields: [
      field('status', 'Status', 'select', 1, {
        fieldOptions: options(refData, ProjectRefData.refDataKey.statuses),
      }),
      field('category', 'Category', 'select', 2, {
        fieldOptions: options(refData, ProjectRefData.refDataKey.categories),
      }),
      field('phase', 'Phase', 'select', 3, {
        fieldOptions: options(refData, ProjectRefData.refDataKey.phases),
      }),
      field('managerId', 'Manager', 'autocomplete', 4, { fieldOptions: userOptions }),
      field('sponsorId', 'Sponsor', 'autocomplete', 5, { fieldOptions: userOptions }),
      field('location', 'Location', 'text', 6),
      field('isPublic', 'Public projects only', 'toggle', 7),
    ],
  };
}

export function projectCriteriaToValues(criteria: ProjectFilterCriteria): FormValues {
  return {
    status: criteria.status ?? '',
    category: criteria.category ?? '',
    phase: criteria.phase ?? '',
    managerId: criteria.managerId ?? '',
    sponsorId: criteria.sponsorId ?? '',
    location: criteria.location ?? '',
    isPublic: criteria.isPublic === true,
  };
}

export function projectValuesToCriteria(
  values: FormValues,
  criteria: ProjectFilterCriteria,
): ProjectFilterCriteria {
  return {
    ...criteria,
    status: text(values, 'status') as ProjectStatus | undefined,
    category: text(values, 'category') as ProjectCategory | undefined,
    phase: text(values, 'phase') as ProjectPhase | undefined,
    managerId: text(values, 'managerId'),
    sponsorId: text(values, 'sponsorId'),
    location: text(values, 'location'),
    isPublic: values['isPublic'] === true ? true : undefined,
  };
}

export function buildProjectEditSummary(
  project: Project,
  refData: ProjectRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    { label: 'Project code', value: project.code ?? '-' },
    { label: 'Current status', value: label(ProjectRefData.refDataKey.statuses, project.status) },
    { label: 'Currency', value: project.currency ?? '-' },
    { label: 'Start date', value: project.startDate ?? '-' },
  ];
}
