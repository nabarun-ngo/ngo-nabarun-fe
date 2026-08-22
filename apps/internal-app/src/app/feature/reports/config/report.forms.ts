import { baseField } from '@nabarun-ngo/forms-core';
import type {
  CustomFieldType,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { ReportFilterCriteria, ReportInput, ReportStatus } from '../domain';
import { REPORT_STATUS_LABEL } from './report.rules';

/** Report definitions declare inputs with their own field keys. */
const INPUT_FIELD_TYPES: Record<string, CustomFieldType> = {
  INPUT_DATE_FIELD: 'date',
  INPUT_NUMBER_FIELD: 'number',
  INPUT_TEXTAREA_FIELD: 'textarea',
  INPUT_TEXT_FIELD: 'text',
};

function toFieldType(fieldType: string): CustomFieldType {
  return INPUT_FIELD_TYPES[fieldType] ?? 'text';
}

function field(
  key: string,
  label: string,
  fieldType: CustomFieldType,
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `report-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

export function buildReportFilterForm(): FormDefinition {
  return {
    id: 'report-filter',
    key: 'report-filter',
    label: 'Filter reports',
    description: null,
    fields: [
      field('status', 'Status', 'select', 1, {
        fieldOptions: (Object.keys(REPORT_STATUS_LABEL) as ReportStatus[]).map(status => ({
          key: status,
          label: REPORT_STATUS_LABEL[status],
        })),
      }),
    ],
  };
}

export function reportCriteriaToValues(criteria: ReportFilterCriteria): FormValues {
  return { status: criteria.status ?? '' };
}

export function reportValuesToCriteria(
  values: FormValues,
  criteria: ReportFilterCriteria,
): ReportFilterCriteria {
  const status = String(values['status'] ?? '').trim();
  return { ...criteria, status: status ? (status as ReportStatus) : undefined };
}

export function buildReportGenerateForm(typeName: string, inputs: ReportInput[]): FormDefinition {
  return {
    id: 'report-generate',
    key: 'report-generate',
    label: `Generate ${typeName}`,
    description: inputs.length
      ? null
      : 'This report needs no inputs — generating starts it straight away.',
    fields: inputs.map((input, index) =>
      field(input.key, input.label, toFieldType(input.fieldType), index + 1, {
        mandatory: input.mandatory,
      }),
    ),
  };
}

export function defaultReportGenerateValues(inputs: ReportInput[]): FormValues {
  return inputs.reduce<FormValues>((values, input) => ({ ...values, [input.key]: '' }), {});
}

export function missingMandatoryInput(
  inputs: ReportInput[],
  values: FormValues,
): ReportInput | undefined {
  return inputs.find(input => {
    if (!input.mandatory) return false;
    const value = values[input.key];
    return value === null || value === undefined || String(value).trim() === '';
  });
}

export function reportGenerateParameters(
  inputs: ReportInput[],
  values: FormValues,
): Record<string, unknown> {
  return inputs.reduce<Record<string, unknown>>((parameters, input) => {
    const value = values[input.key];
    if (value === null || value === undefined || String(value).trim() === '') {
      return parameters;
    }
    return { ...parameters, [input.key]: value };
  }, {});
}
