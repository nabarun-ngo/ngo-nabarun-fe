import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Beneficiary,
  BeneficiaryFilterCriteria,
  BeneficiaryGender,
  BeneficiaryRefDataMap,
  BeneficiaryStatus,
  BeneficiaryType,
} from '../domain';
import { BeneficiaryRefData } from '../domain';

function options(refData: BeneficiaryRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `beneficiary-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

export function buildBeneficiaryCreateForm(
  refData: BeneficiaryRefDataMap,
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
    field('name', 'Name', 'text', 2, {
      mandatory: true,
      validationRules: {
        pattern: '^.{2,100}$',
        regexErrMsg: 'Name must be 2 to 100 characters.',
      },
    }),
    field('type', 'Type', 'select', 3, {
      mandatory: true,
      fieldOptions: options(refData, BeneficiaryRefData.refDataKey.types),
    }),
    field('enrollmentDate', 'Enrollment Date', 'date', 4, { mandatory: true }),
    field('category', 'Category', 'text', 5, { hint: 'e.g. student, farmer, self-help group' }),
    field('gender', 'Gender', 'select', 6, {
      fieldOptions: options(refData, BeneficiaryRefData.refDataKey.genders),
    }),
    field('age', 'Age', 'number', 7),
    field('dateOfBirth', 'Date of Birth', 'date', 8),
    field('contactNumber', 'Contact Number', 'phone', 9),
    field('email', 'Email', 'email', 10),
    field('location', 'Location', 'text', 11),
    field('address', 'Address', 'textarea', 12),
    field('notes', 'Notes', 'textarea', 13),
  );

  return {
    id: 'beneficiary-create',
    key: 'beneficiary',
    label: 'Enroll beneficiary',
    description: null,
    fields,
  };
}

export function defaultBeneficiaryCreateValues(scopedProjectId?: string): FormValues {
  return {
    projectId: scopedProjectId ?? '',
    name: '',
    type: 'INDIVIDUAL',
    enrollmentDate: new Date().toISOString().slice(0, 10),
    category: '',
    gender: '',
    age: null,
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    location: '',
    address: '',
    notes: '',
  };
}

/** Enrollment date is fixed and status changes through the exit action. */
export function buildBeneficiaryUpdateForm(
  beneficiary: Beneficiary,
  refData: BeneficiaryRefDataMap,
): FormDefinition {
  return {
    id: `beneficiary-update-${beneficiary.id}`,
    key: 'beneficiary',
    label: 'Update beneficiary',
    description: null,
    fields: [
      field('name', 'Name', 'text', 1, { mandatory: true }),
      field('type', 'Type', 'select', 2, {
        mandatory: true,
        fieldOptions: options(refData, BeneficiaryRefData.refDataKey.types),
      }),
      field('category', 'Category', 'text', 3),
      field('gender', 'Gender', 'select', 4, {
        fieldOptions: options(refData, BeneficiaryRefData.refDataKey.genders),
      }),
      field('age', 'Age', 'number', 5),
      field('contactNumber', 'Contact Number', 'phone', 6),
      field('email', 'Email', 'email', 7),
      field('location', 'Location', 'text', 8),
      field('address', 'Address', 'textarea', 9),
      field('notes', 'Notes', 'textarea', 10),
    ],
  };
}

export function beneficiaryToUpdateValues(beneficiary: Beneficiary): FormValues {
  return {
    name: beneficiary.name ?? '',
    type: beneficiary.type ?? '',
    category: beneficiary.category ?? '',
    gender: beneficiary.gender ?? '',
    age: beneficiary.age ?? null,
    contactNumber: beneficiary.contactNumber ?? '',
    email: beneficiary.email ?? '',
    location: beneficiary.location ?? '',
    address: beneficiary.address ?? '',
    notes: beneficiary.notes ?? '',
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

export function beneficiaryCreateEntity(values: FormValues): Partial<Beneficiary> {
  return {
    name: text(values, 'name'),
    type: text(values, 'type') as BeneficiaryType | undefined,
    enrollmentDate: text(values, 'enrollmentDate'),
    category: text(values, 'category'),
    gender: text(values, 'gender') as BeneficiaryGender | undefined,
    age: numeric(values, 'age'),
    dateOfBirth: text(values, 'dateOfBirth'),
    contactNumber: text(values, 'contactNumber'),
    email: text(values, 'email'),
    location: text(values, 'location'),
    address: text(values, 'address'),
    notes: text(values, 'notes'),
  };
}

export function beneficiaryProjectId(values: FormValues): string | undefined {
  return text(values, 'projectId');
}

export function beneficiaryUpdatePatch(values: FormValues): Partial<Beneficiary> {
  return {
    name: text(values, 'name'),
    type: text(values, 'type') as BeneficiaryType | undefined,
    category: text(values, 'category'),
    gender: text(values, 'gender') as BeneficiaryGender | undefined,
    age: numeric(values, 'age'),
    contactNumber: text(values, 'contactNumber'),
    email: text(values, 'email'),
    location: text(values, 'location'),
    address: text(values, 'address'),
    notes: text(values, 'notes'),
  };
}

export function buildBeneficiaryFilterForm(
  refData: BeneficiaryRefDataMap,
  deps: { projectOptions?: FieldOption[]; scopedProjectId?: string } = {},
): FormDefinition {
  const fields: FormFieldDefinition[] = [];

  if (!deps.scopedProjectId) {
    fields.push(field('projectId', 'Project', 'autocomplete', 1, {
      mandatory: true,
      fieldOptions: deps.projectOptions ?? [],
      hint: 'Beneficiaries are listed one project at a time.',
    }));
  }

  fields.push(
    field('status', 'Status', 'select', 2, {
      fieldOptions: options(refData, BeneficiaryRefData.refDataKey.statuses),
    }),
    field('type', 'Type', 'select', 3, {
      fieldOptions: options(refData, BeneficiaryRefData.refDataKey.types),
    }),
    field('category', 'Category', 'text', 4),
  );

  return {
    id: 'beneficiary-filter',
    key: 'beneficiary-filter',
    label: 'Filter beneficiaries',
    description: null,
    fields,
  };
}

export function beneficiaryCriteriaToValues(
  criteria: BeneficiaryFilterCriteria,
): FormValues {
  return {
    projectId: criteria.projectId ?? '',
    status: criteria.status ?? '',
    type: criteria.type ?? '',
    category: criteria.category ?? '',
  };
}

export function beneficiaryValuesToCriteria(
  values: FormValues,
  criteria: BeneficiaryFilterCriteria,
): BeneficiaryFilterCriteria {
  return {
    ...criteria,
    projectId: text(values, 'projectId') ?? criteria.projectId,
    status: text(values, 'status') as BeneficiaryStatus | undefined,
    type: text(values, 'type') as BeneficiaryType | undefined,
    category: text(values, 'category'),
  };
}

export function buildBeneficiaryEditSummary(
  beneficiary: Beneficiary,
  refData: BeneficiaryRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    {
      label: 'Current status',
      value: label(BeneficiaryRefData.refDataKey.statuses, beneficiary.status),
    },
    { label: 'Enrolled on', value: beneficiary.enrollmentDate ?? '-' },
  ];
}

/** The exit endpoint accepts no payload, so this sheet only confirms the exit. */
export function buildBeneficiaryExitForm(beneficiary: Beneficiary): FormDefinition {
  return {
    id: `beneficiary-exit-${beneficiary.id}`,
    key: 'beneficiary-exit',
    label: 'Record exit',
    description: 'The exit date is recorded as today.',
    fields: [
      field('name', 'Beneficiary', 'text', 1, { readOnly: true }),
      field('enrollmentDate', 'Enrolled on', 'text', 2, { readOnly: true }),
    ],
  };
}

export function beneficiaryExitValues(beneficiary: Beneficiary): FormValues {
  return {
    name: beneficiary.name ?? '',
    enrollmentDate: beneficiary.enrollmentDate ?? '',
  };
}
