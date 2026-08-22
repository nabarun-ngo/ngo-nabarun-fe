import { baseField, toFieldOptions, type FormDefinition, type FormValues } from '@nabarun-ngo/forms-core';
import type { RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import type { AdminApiKey } from '../domain';

function permissionsOptions(refData: RefDataMap) {
  return toFieldOptions(refData['scopes'] as { key: string; label?: string }[] | undefined);
}

export function buildApiKeyCreateForm(refData: RefDataMap): FormDefinition {
  return {
    id: 'api-key-create',
    key: 'api-key-create',
    label: 'Generate API key',
    description: null,
    fields: [
      baseField({
        id: 'name',
        key: 'name',
        label: 'Key name',
        fieldType: 'text',
        mandatory: true,
        sortOrder: 1,
      }),
      baseField({
        id: 'permissions',
        key: 'permissions',
        label: 'Permissions',
        fieldType: 'multiselect',
        mandatory: true,
        sortOrder: 2,
        fieldOptions: permissionsOptions(refData),
      }),
      baseField({
        id: 'expiresAt',
        key: 'expiresAt',
        label: 'Expires on',
        fieldType: 'date',
        mandatory: false,
        sortOrder: 3,
      }),
    ],
  };
}

export function buildApiKeyEditForm(refData: RefDataMap): FormDefinition {
  return {
    id: 'api-key-edit',
    key: 'api-key-edit',
    label: 'Edit permissions',
    description: null,
    fields: [
      baseField({
        id: 'permissions',
        key: 'permissions',
        label: 'Permissions',
        fieldType: 'multiselect',
        mandatory: true,
        sortOrder: 1,
        fieldOptions: permissionsOptions(refData),
      }),
    ],
  };
}

export function defaultApiKeyCreateValues(): FormValues {
  return { name: '', permissions: [] };
}

export function apiKeyToEditValues(key: AdminApiKey): FormValues {
  return { permissions: [...key.permissions] };
}
