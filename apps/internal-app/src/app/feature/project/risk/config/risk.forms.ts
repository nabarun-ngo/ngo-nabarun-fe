import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  ProjectRisk,
  RiskCategory,
  RiskFilterCriteria,
  RiskProbability,
  RiskRefDataMap,
  RiskSeverity,
  RiskStatus,
} from '../domain';
import { RiskRefData } from '../domain';

function options(refData: RiskRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `risk-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

export function buildRiskCreateForm(
  refData: RiskRefDataMap,
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
    field('title', 'Risk', 'text', 2, {
      mandatory: true,
      validationRules: {
        pattern: '^.{3,150}$',
        regexErrMsg: 'Risk must be 3 to 150 characters.',
      },
    }),
    field('description', 'Description', 'textarea', 3),
    field('category', 'Category', 'select', 4, {
      mandatory: true,
      fieldOptions: options(refData, RiskRefData.refDataKey.categories),
    }),
    field('severity', 'Severity', 'select', 5, {
      mandatory: true,
      fieldOptions: options(refData, RiskRefData.refDataKey.severities),
    }),
    field('probability', 'Probability', 'select', 6, {
      mandatory: true,
      fieldOptions: options(refData, RiskRefData.refDataKey.probabilities),
    }),
    field('identifiedDate', 'Identified On', 'date', 7, { mandatory: true }),
    field('impact', 'Impact', 'textarea', 8),
    field('mitigationPlan', 'Mitigation Plan', 'textarea', 9),
    field('ownerId', 'Owner', 'autocomplete', 10, { fieldOptions: deps.userOptions ?? [] }),
  );

  return {
    id: 'risk-create',
    key: 'risk',
    label: 'Log risk',
    description: null,
    fields,
  };
}

export function defaultRiskCreateValues(scopedProjectId?: string): FormValues {
  return {
    projectId: scopedProjectId ?? '',
    title: '',
    description: '',
    category: '',
    severity: 'MEDIUM',
    probability: 'MEDIUM',
    identifiedDate: new Date().toISOString().slice(0, 10),
    impact: '',
    mitigationPlan: '',
    ownerId: '',
  };
}

/** Only the fields the update endpoint accepts are editable. */
export function buildRiskUpdateForm(
  risk: ProjectRisk,
  refData: RiskRefDataMap,
): FormDefinition {
  return {
    id: `risk-update-${risk.id}`,
    key: 'risk',
    label: 'Update risk',
    description: null,
    fields: [
      field('title', 'Risk', 'text', 1, { mandatory: true }),
      field('status', 'Status', 'select', 2, {
        mandatory: true,
        fieldOptions: options(refData, RiskRefData.refDataKey.statuses),
      }),
      field('severity', 'Severity', 'select', 3, {
        mandatory: true,
        fieldOptions: options(refData, RiskRefData.refDataKey.severities),
      }),
      field('probability', 'Probability', 'select', 4, {
        mandatory: true,
        fieldOptions: options(refData, RiskRefData.refDataKey.probabilities),
      }),
      field('mitigationPlan', 'Mitigation Plan', 'textarea', 5),
    ],
  };
}

export function riskToUpdateValues(risk: ProjectRisk): FormValues {
  return {
    title: risk.title ?? '',
    status: risk.status ?? '',
    severity: risk.severity ?? '',
    probability: risk.probability ?? '',
    mitigationPlan: risk.mitigationPlan ?? '',
  };
}

function text(values: FormValues, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function riskCreateEntity(values: FormValues): Partial<ProjectRisk> {
  return {
    title: text(values, 'title'),
    description: text(values, 'description'),
    category: text(values, 'category') as RiskCategory | undefined,
    severity: text(values, 'severity') as RiskSeverity | undefined,
    probability: text(values, 'probability') as RiskProbability | undefined,
    identifiedDate: text(values, 'identifiedDate'),
    impact: text(values, 'impact'),
    mitigationPlan: text(values, 'mitigationPlan'),
    ownerId: text(values, 'ownerId'),
  };
}

export function riskProjectId(values: FormValues): string | undefined {
  return text(values, 'projectId');
}

export function riskUpdatePatch(values: FormValues): Partial<ProjectRisk> {
  return {
    title: text(values, 'title'),
    status: text(values, 'status') as RiskStatus | undefined,
    severity: text(values, 'severity') as RiskSeverity | undefined,
    probability: text(values, 'probability') as RiskProbability | undefined,
    mitigationPlan: text(values, 'mitigationPlan'),
  };
}

export function buildRiskFilterForm(
  refData: RiskRefDataMap,
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
      hint: 'Risks are listed one project at a time.',
    }));
  }

  fields.push(
    field('status', 'Status', 'select', 2, {
      fieldOptions: options(refData, RiskRefData.refDataKey.statuses),
    }),
    field('severity', 'Severity', 'select', 3, {
      fieldOptions: options(refData, RiskRefData.refDataKey.severities),
    }),
    field('category', 'Category', 'select', 4, {
      fieldOptions: options(refData, RiskRefData.refDataKey.categories),
    }),
    field('ownerId', 'Owner', 'autocomplete', 5, { fieldOptions: deps.userOptions ?? [] }),
  );

  return {
    id: 'risk-filter',
    key: 'risk-filter',
    label: 'Filter risks',
    description: null,
    fields,
  };
}

export function riskCriteriaToValues(criteria: RiskFilterCriteria): FormValues {
  return {
    projectId: criteria.projectId ?? '',
    status: criteria.status ?? '',
    severity: criteria.severity ?? '',
    category: criteria.category ?? '',
    ownerId: criteria.ownerId ?? '',
  };
}

export function riskValuesToCriteria(
  values: FormValues,
  criteria: RiskFilterCriteria,
): RiskFilterCriteria {
  return {
    ...criteria,
    projectId: text(values, 'projectId') ?? criteria.projectId,
    status: text(values, 'status') as RiskStatus | undefined,
    severity: text(values, 'severity') as RiskSeverity | undefined,
    category: text(values, 'category') as RiskCategory | undefined,
    ownerId: text(values, 'ownerId'),
  };
}

export function buildRiskEditSummary(
  risk: ProjectRisk,
  refData: RiskRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    { label: 'Category', value: label(RiskRefData.refDataKey.categories, risk.category) },
    { label: 'Identified on', value: risk.identifiedDate ?? '-' },
  ];
}

/** The resolve endpoint accepts no payload, so this sheet only confirms the closure. */
export function buildRiskResolveForm(risk: ProjectRisk): FormDefinition {
  return {
    id: `risk-resolve-${risk.id}`,
    key: 'risk-resolve',
    label: 'Resolve risk',
    description: 'The resolution date is recorded as today.',
    fields: [
      field('title', 'Risk', 'text', 1, { readOnly: true }),
      field('mitigationPlan', 'Mitigation plan', 'textarea', 2, { readOnly: true }),
    ],
  };
}

export function riskResolveValues(risk: ProjectRisk): FormValues {
  return {
    title: risk.title ?? '',
    mitigationPlan: risk.mitigationPlan ?? '',
  };
}
