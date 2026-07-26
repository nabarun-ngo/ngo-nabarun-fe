import type {
  FormDefinition,
  FormEngineOptions,
  FormStep,
  FormValidationResult,
  FormValues,
  ResolvedField,
} from '../models/types.js';
import { getDefaultValueForFieldType } from './defaults.js';
import {
  applyDependentValueEffects,
  groupFieldsByStep,
  resolveAllFields,
  validateForm,
} from './form-engine.js';

export class FormEngine {
  private values: FormValues;
  private fieldErrors: Record<string, string> = {};

  constructor(
    readonly definition: FormDefinition,
    initialValues: FormValues = {},
    private readonly options: FormEngineOptions = {},
  ) {
    this.values = this.buildInitialValues(initialValues);
  }

  getValues(): FormValues {
    return { ...this.values };
  }

  setValue(key: string, value: FormValues[string]): void {
    this.values = { ...this.values, [key]: value };
    this.values = applyDependentValueEffects(this.definition, this.values, key, this.options);
    delete this.fieldErrors[key];
  }

  setValues(partial: FormValues): void {
    let next = { ...this.values, ...partial };
    for (const key of Object.keys(partial)) {
      next = applyDependentValueEffects(this.definition, next, key, this.options);
    }
    this.values = next;
    for (const key of Object.keys(partial)) {
      delete this.fieldErrors[key];
    }
  }

  getResolvedFields(): ResolvedField[] {
    return resolveAllFields(this.definition, this.values, this.options);
  }

  getVisibleFields(): ResolvedField[] {
    return this.getResolvedFields().filter((f) => f.visible);
  }

  getSteps(): FormStep[] {
    return groupFieldsByStep(this.getResolvedFields());
  }

  validate(): FormValidationResult {
    const result = validateForm(this.definition, this.values, this.options);
    this.fieldErrors = { ...result.fieldErrors };
    return result;
  }

  getFieldErrors(): Record<string, string> {
    return { ...this.fieldErrors };
  }

  reset(initialValues: FormValues = {}): void {
    this.values = this.buildInitialValues(initialValues);
    this.fieldErrors = {};
  }

  private buildInitialValues(overrides: FormValues): FormValues {
    let values: FormValues = {};
    for (const field of this.definition.fields) {
      if (field.isEncrypted && this.options.ignoreEncryptedValues) continue;
      values[field.key] =
        overrides[field.key] !== undefined
          ? overrides[field.key]
          : getDefaultValueForFieldType(field.fieldType);
    }
    for (const field of this.definition.fields) {
      values = applyDependentValueEffects(this.definition, values, field.key, this.options);
    }
    return values;
  }
}
