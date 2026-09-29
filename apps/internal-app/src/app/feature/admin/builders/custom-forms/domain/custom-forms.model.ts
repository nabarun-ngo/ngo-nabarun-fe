export type CustomFormStatus = 'draft' | 'published' | 'disabled';

export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multiselect';

export type ConditionOperator = 'equals' | 'not_equals' | 'in' | 'not_in';

export const CUSTOM_FIELD_TYPES: CustomFieldType[] = [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'boolean',
  'date',
  'select',
  'multiselect',
];

export const CONDITION_OPERATORS: ConditionOperator[] = [
  'equals',
  'not_equals',
  'in',
  'not_in',
];

export interface CustomFormPermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDisable: boolean;
}

export interface FieldOption {
  key: string;
  label: string;
}

export interface FieldCondition {
  dependsOnKey: string;
  operator: ConditionOperator;
  /** Scalar or list depending on operator (in / not_in). */
  value: unknown;
}

export interface DependentOptions {
  dependsOnKey: string;
  optionMap: Record<string, FieldOption[]>;
}

export interface FieldValidationRules {
  patterns: Array<{ pattern: string; regexErrMsg?: string }>;
}

export interface CustomFormField {
  id: string;
  formId: string;
  key: string;
  label: string;
  fieldType: CustomFieldType;
  mandatory: boolean;
  sortOrder: number;
  enabled: boolean;
  isHidden: boolean;
  isEncrypted: boolean;
  fieldOptions: FieldOption[];
  condition: FieldCondition | null;
  dependentOptions: DependentOptions | null;
  validationRules: FieldValidationRules | null;
  viewPermissions: string[];
  stepId: string | null | undefined;
  stepName: string | null | undefined;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomForm {
  id: string;
  entityType: string;
  key: string;
  label: string;
  description: string | null;
  status: CustomFormStatus;
  managePermissions: string[];
  readPermissions: string[];
  writePermissions: string[];
  fields: CustomFormField[];
  createdBy: string | null;
  publishedBy: string | null;
  disabledBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCustomFormInput {
  entityType: string;
  key: string;
  label: string;
  description?: string | null;
  managePermissions?: string[];
  readPermissions?: string[];
  writePermissions?: string[];
}

export interface UpdateCustomFormInput {
  label?: string;
  description?: string | null;
  managePermissions?: string[];
  readPermissions?: string[];
  writePermissions?: string[];
}

export interface UpsertCustomFormFieldInput {
  key?: string;
  label: string;
  fieldType: CustomFieldType;
  mandatory?: boolean;
  sortOrder?: number;
  isHidden?: boolean;
  isEncrypted?: boolean;
  fieldOptions?: FieldOption[];
  condition?: FieldCondition | null;
  dependentOptions?: DependentOptions | null;
  validationRules?: FieldValidationRules | null;
  viewPermissions?: string[];
  stepId?: string | null;
  stepName?: string | null;
}

export interface EntityTypeOption {
  value: string;
  label: string;
}
