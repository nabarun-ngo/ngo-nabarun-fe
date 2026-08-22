import { baseField, toFieldOptions, type FormDefinition, type FormValues } from '@nabarun-ngo/forms-core';
import type { RoleCatalogItem, RoleCatalogKind } from '../domain';

export function roleCatalogKindLabel(kind: RoleCatalogKind): string {
  if (kind === 'group') return 'Group';
  if (kind === 'permission') return 'Permission';
  return 'Role';
}

export function buildRoleCatalogCreateForm(allowedKinds: RoleCatalogKind[]): FormDefinition {
  return {
    id: 'role-catalog-create',
    key: 'role-catalog-create',
    label: 'Create catalog entry',
    description: null,
    fields: [
      baseField({
        id: 'kind',
        key: 'kind',
        label: 'Type',
        fieldType: 'select',
        mandatory: true,
        sortOrder: 1,
        fieldOptions: toFieldOptions(
          allowedKinds.map(kind => ({ key: kind, label: roleCatalogKindLabel(kind) })),
        ),
      }),
      baseField({
        id: 'key',
        key: 'key',
        label: 'Key',
        fieldType: 'text',
        mandatory: true,
        sortOrder: 2,
      }),
      baseField({
        id: 'description',
        key: 'description',
        label: 'Description',
        fieldType: 'textarea',
        sortOrder: 3,
      }),
    ],
  };
}

export function buildRoleCatalogEditForm(
  kind: RoleCatalogKind,
  options: {
    permissionOptions?: { key: string; label: string }[];
    roleOptions?: { key: string; label: string }[];
  },
): FormDefinition {
  // The key is immutable and already shown in the sheet's edit summary.
  const fields = [
    baseField({
      id: 'description',
      key: 'description',
      label: 'Description',
      fieldType: 'textarea',
      sortOrder: 1,
    }),
  ];

  if (kind === 'role') {
    fields.push(
      baseField({
        id: 'memberKeys',
        key: 'memberKeys',
        label: 'Linked permissions',
        fieldType: 'multiselect',
        sortOrder: 2,
        fieldOptions: toFieldOptions(options.permissionOptions ?? []),
      }),
    );
  }

  if (kind === 'group') {
    fields.push(
      baseField({
        id: 'memberKeys',
        key: 'memberKeys',
        label: 'Linked roles',
        fieldType: 'multiselect',
        sortOrder: 2,
        fieldOptions: toFieldOptions(options.roleOptions ?? []),
      }),
    );
  }

  return {
    id: `role-catalog-edit-${kind}`,
    key: `role-catalog-edit-${kind}`,
    label: `Edit ${roleCatalogKindLabel(kind).toLowerCase()}`,
    description: null,
    fields,
  };
}

export function defaultRoleCatalogCreateValues(kind: RoleCatalogKind): FormValues {
  return { kind, key: '', description: '' };
}

export function roleCatalogToEditValues(item: RoleCatalogItem): FormValues {
  return {
    description: item.description ?? '',
    memberKeys: [...item.memberKeys],
  };
}
