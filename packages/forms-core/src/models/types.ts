export const CUSTOM_FIELD_TYPES = [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'boolean',
  'date',
  'select',
  'multiselect',
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export type FieldConditionOperator = 'equals' | 'not_equals' | 'in' | 'not_in';

export type CustomFieldValueParsed = string | number | boolean | string[] | null;

export interface FieldOption {
  key: string;
  label: string;
}

export interface FieldCondition {
  dependsOnKey: string;
  operator: FieldConditionOperator;
  value: string | number | boolean | string[];
}

export interface DependentOptions {
  dependsOnKey: string;
  optionMap: Record<string, FieldOption[]>;
}

export interface FieldValidationRule {
  /** Optional stable key from backend (e.g. `no-digits`). */
  key?: string;
  pattern: string;
  regexErrMsg?: string;
}

/** Single rule or ordered list (all must pass). */
export type FieldValidationRules = FieldValidationRule | FieldValidationRule[];

export interface FormFieldDefinition {
  id: string;
  key: string;
  label: string;
  fieldType: CustomFieldType;
  mandatory: boolean;
  fieldOptions: FieldOption[];
  isHidden: boolean;
  isEncrypted: boolean;
  enabled: boolean;
  sortOrder: number;
  condition: FieldCondition | null;
  dependentOptions: DependentOptions | null;
  validationRules: FieldValidationRules | null;
  viewPermissions?: string[];
  stepId?: string | null;
  stepName?: string | null;
}

export interface FormDefinition {
  id: string;
  key: string;
  label: string;
  description: string | null;
  fields: FormFieldDefinition[];
}

export type FormValues = Record<string, CustomFieldValueParsed>;

export interface ResolvedField {
  definition: FormFieldDefinition;
  visible: boolean;
  effectiveMandatory: boolean;
  availableOptions: FieldOption[];
}

export interface FormStep {
  stepId: string;
  stepName: string | null;
  fields: ResolvedField[];
}

export interface FormValidationResult {
  missingMandatory: string[];
  conditionViolations: string[];
  validationViolations: string[];
  fieldErrors: Record<string, string>;
  valid: boolean;
}

export interface PhoneCountryCodeOption {
  /** Dial code including "+" (e.g. "+1", "+91"). */
  code: string;
  label?: string;
}

export interface FormEngineOptions {
  userPermissions?: string[];
  /** When true, encrypted fields are omitted from resolved visible fields (public site). */
  ignoreEncryptedValues?: boolean;
  /** Default dial code for `phone` fields (default "+1"). */
  defaultPhoneCountryCode?: string;
  /** Country codes shown in phone inputs; defaults to the default dial code only. */
  phoneCountryCodes?: PhoneCountryCodeOption[];
}
