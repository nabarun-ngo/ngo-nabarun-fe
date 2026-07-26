import type { CustomFieldType, FormEngineOptions } from '../models/types.js';
import { isPhoneValueEmpty } from './phone.js';

export function getDefaultValueForFieldType(fieldType: CustomFieldType): string | number | boolean | string[] {
  switch (fieldType) {
    case 'boolean':
      return false;
    case 'multiselect':
      return [];
    case 'number':
      return '';
    default:
      return '';
  }
}

export function isEmptyValue(
  fieldType: CustomFieldType,
  value: unknown,
  engineOptions?: FormEngineOptions,
): boolean {
  if (value === null || value === undefined) return true;
  if (fieldType === 'boolean') return false;
  if (fieldType === 'phone') return isPhoneValueEmpty(value, engineOptions);
  if (fieldType === 'multiselect') return !Array.isArray(value) || value.length === 0;
  if (fieldType === 'number') {
    if (value === '') return true;
    return false;
  }
  return value === '';
}
