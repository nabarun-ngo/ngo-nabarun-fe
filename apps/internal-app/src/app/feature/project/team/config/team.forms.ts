import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  TeamFilterCriteria,
  TeamMember,
  TeamRefDataMap,
  TeamRole,
} from '../domain';
import { TeamRefData } from '../domain';

function options(refData: TeamRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `team-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

export function buildTeamCreateForm(
  refData: TeamRefDataMap,
  deps: {
    projectOptions?: FieldOption[];
    userOptions?: FieldOption[];
    scopedProjectId?: string;
  },
): FormDefinition {
  const fields: FormFieldDefinition[] = [];

  if (!deps.scopedProjectId) {
    fields.push(field('projectId', 'Project', 'autocomplete', 1, {
      mandatory: true,
      fieldOptions: deps.projectOptions ?? [],
    }));
  }

  fields.push(
    field('userId', 'Member', 'autocomplete', 2, {
      mandatory: true,
      fieldOptions: deps.userOptions ?? [],
    }),
    field('role', 'Role', 'select', 3, {
      mandatory: true,
      fieldOptions: options(refData, TeamRefData.refDataKey.roles),
    }),
    field('startDate', 'Start Date', 'date', 4, { mandatory: true }),
    field('hoursAllocated', 'Hours Allocated', 'number', 5, {
      hint: 'Planned effort for this member.',
    }),
    field('responsibilities', 'Responsibilities', 'textarea', 6),
  );

  return {
    id: 'team-create',
    key: 'team',
    label: 'Add team member',
    description: null,
    fields,
  };
}

export function defaultTeamCreateValues(scopedProjectId?: string): FormValues {
  return {
    projectId: scopedProjectId ?? '',
    userId: '',
    role: 'VOLUNTEER',
    startDate: new Date().toISOString().slice(0, 10),
    hoursAllocated: null,
    responsibilities: '',
  };
}

/** Member and start date are fixed once added; deactivation ends the membership. */
export function buildTeamUpdateForm(
  member: TeamMember,
  refData: TeamRefDataMap,
): FormDefinition {
  return {
    id: `team-update-${member.id}`,
    key: 'team',
    label: 'Update team member',
    description: null,
    fields: [
      field('role', 'Role', 'select', 1, {
        mandatory: true,
        fieldOptions: options(refData, TeamRefData.refDataKey.roles),
      }),
      field('hoursAllocated', 'Hours Allocated', 'number', 2),
      field('responsibilities', 'Responsibilities', 'textarea', 3),
    ],
  };
}

export function teamToUpdateValues(member: TeamMember): FormValues {
  return {
    role: member.role ?? '',
    hoursAllocated: member.hoursAllocated ?? null,
    responsibilities: member.responsibilities ?? '',
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

export function teamCreateEntity(values: FormValues): Partial<TeamMember> {
  return {
    userId: text(values, 'userId'),
    role: text(values, 'role') as TeamRole | undefined,
    startDate: text(values, 'startDate'),
    hoursAllocated: numeric(values, 'hoursAllocated'),
    responsibilities: text(values, 'responsibilities'),
  };
}

export function teamProjectId(values: FormValues): string | undefined {
  return text(values, 'projectId');
}

export function teamUpdatePatch(values: FormValues): Partial<TeamMember> {
  return {
    role: text(values, 'role') as TeamRole | undefined,
    hoursAllocated: numeric(values, 'hoursAllocated'),
    responsibilities: text(values, 'responsibilities'),
  };
}

export function buildTeamFilterForm(
  refData: TeamRefDataMap,
  deps: {
    projectOptions?: FieldOption[];
    userOptions?: FieldOption[];
    scopedProjectId?: string;
  } = {},
): FormDefinition {
  const fields: FormFieldDefinition[] = [];

  if (!deps.scopedProjectId) {
    fields.push(field('projectId', 'Project', 'autocomplete', 1, {
      mandatory: true,
      fieldOptions: deps.projectOptions ?? [],
      hint: 'Team members are listed one project at a time.',
    }));
  }

  fields.push(
    field('role', 'Role', 'select', 2, {
      fieldOptions: options(refData, TeamRefData.refDataKey.roles),
    }),
    field('userId', 'Member', 'autocomplete', 3, {
      fieldOptions: deps.userOptions ?? [],
    }),
  );

  return {
    id: 'team-filter',
    key: 'team-filter',
    label: 'Filter team',
    description: null,
    fields,
  };
}

export function teamCriteriaToValues(criteria: TeamFilterCriteria): FormValues {
  return {
    projectId: criteria.projectId ?? '',
    role: criteria.role ?? '',
    userId: criteria.userId ?? '',
  };
}

export function teamValuesToCriteria(
  values: FormValues,
  criteria: TeamFilterCriteria,
): TeamFilterCriteria {
  return {
    ...criteria,
    projectId: text(values, 'projectId') ?? criteria.projectId,
    role: text(values, 'role') as TeamRole | undefined,
    userId: text(values, 'userId'),
  };
}

export function buildTeamEditSummary(
  member: TeamMember,
  memberLabel: string,
): { label: string; value: string }[] {
  return [
    { label: 'Member', value: memberLabel },
    { label: 'Joined on', value: member.startDate ?? '-' },
  ];
}

/** The deactivate endpoint accepts no payload, so this sheet only confirms the change. */
export function buildTeamDeactivateForm(member: TeamMember): FormDefinition {
  return {
    id: `team-deactivate-${member.id}`,
    key: 'team-deactivate',
    label: 'Deactivate member',
    description: 'The membership end date is recorded as today.',
    fields: [
      field('member', 'Member', 'text', 1, { readOnly: true }),
      field('startDate', 'Joined on', 'text', 2, { readOnly: true }),
    ],
  };
}

export function teamDeactivateValues(
  member: TeamMember,
  memberLabel: string,
): FormValues {
  return {
    member: memberLabel,
    startDate: member.startDate ?? '',
  };
}
