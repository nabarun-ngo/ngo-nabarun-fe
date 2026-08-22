import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Asset,
  AssetCategory,
  AssetFilterCriteria,
  AssetRefDataMap,
  AssetStatus,
} from '../domain';
import { AssetRefData } from '../domain';

function options(refData: AssetRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `asset-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

export function buildAssetCreateForm(
  refData: AssetRefDataMap,
  deps: {
    projectOptions?: FieldOption[];
    userOptions?: FieldOption[];
    expenseOptions?: FieldOption[];
  },
): FormDefinition {
  return {
    id: 'asset-create',
    key: 'asset',
    label: 'Register asset',
    description: null,
    fields: assetFormFields(refData, deps, { includeStatus: false }),
  };
}

export function buildAssetUpdateForm(
  asset: Asset,
  refData: AssetRefDataMap,
  deps: {
    projectOptions?: FieldOption[];
    userOptions?: FieldOption[];
    expenseOptions?: FieldOption[];
  },
): FormDefinition {
  return {
    id: `asset-update-${asset.id}`,
    key: 'asset',
    label: 'Update asset',
    description: null,
    fields: assetFormFields(refData, deps, { includeStatus: true }),
  };
}

function assetFormFields(
  refData: AssetRefDataMap,
  deps: {
    projectOptions?: FieldOption[];
    userOptions?: FieldOption[];
    expenseOptions?: FieldOption[];
  },
  config: { includeStatus: boolean },
): FormFieldDefinition[] {
  const fields: FormFieldDefinition[] = [
    field('name', 'Name', 'text', 1, { mandatory: true }),
    field('category', 'Category', 'select', 2, {
      mandatory: true,
      fieldOptions: options(refData, AssetRefData.refDataKey.categories),
    }),
    field('serialNumber', 'Serial number', 'text', 3),
    field('location', 'Location', 'text', 4),
  ];

  if (config.includeStatus) {
    fields.push(field('status', 'Status', 'select', 5, {
      mandatory: true,
      fieldOptions: options(refData, AssetRefData.refDataKey.statuses),
    }));
  }

  fields.push(
    field('projectId', 'Project', 'autocomplete', 6, {
      fieldOptions: deps.projectOptions ?? [],
    }),
    field('expenseId', 'Linked expense', 'autocomplete', 7, {
      fieldOptions: deps.expenseOptions ?? [],
    }),
    field('custodianUserId', 'Custodian', 'autocomplete', 8, {
      fieldOptions: deps.userOptions ?? [],
    }),
    field('purchaseDate', 'Purchase date', 'date', 9),
    field('purchaseCost', 'Purchase cost', 'number', 10),
    field('currentValue', 'Current value', 'number', 11),
    field('currency', 'Currency', 'text', 12),
    field('depreciationMethodNotes', 'Depreciation notes', 'textarea', 13),
    field('maintenanceNotes', 'Maintenance notes', 'textarea', 14),
  );

  return fields;
}

export function defaultAssetCreateValues(): FormValues {
  return {
    name: '',
    category: '',
    serialNumber: '',
    location: '',
    projectId: '',
    expenseId: '',
    custodianUserId: '',
    purchaseDate: '',
    purchaseCost: '',
    currentValue: '',
    currency: 'INR',
    depreciationMethodNotes: '',
    maintenanceNotes: '',
  };
}

export function assetCreateEntity(values: FormValues): Partial<Asset> {
  return {
    name: text(values, 'name'),
    category: text(values, 'category') as AssetCategory | undefined,
    serialNumber: text(values, 'serialNumber'),
    location: text(values, 'location'),
    status: 'AVAILABLE',
    projectId: text(values, 'projectId'),
    expenseId: text(values, 'expenseId'),
    custodianUserId: text(values, 'custodianUserId'),
    purchaseDate: text(values, 'purchaseDate'),
    purchaseCost: numberValue(values, 'purchaseCost'),
    currentValue: numberValue(values, 'currentValue'),
    currency: text(values, 'currency'),
    depreciationMethodNotes: text(values, 'depreciationMethodNotes'),
    maintenanceNotes: text(values, 'maintenanceNotes'),
  };
}

export function assetToUpdateValues(asset: Asset): FormValues {
  return {
    name: asset.name ?? '',
    category: asset.category ?? '',
    serialNumber: asset.serialNumber ?? '',
    location: asset.location ?? '',
    status: asset.status ?? '',
    projectId: asset.projectId ?? '',
    expenseId: asset.expenseId ?? '',
    custodianUserId: asset.custodianUserId ?? '',
    purchaseDate: normalizeDateValue(asset.purchaseDate),
    purchaseCost: asset.purchaseCost ?? '',
    currentValue: asset.currentValue ?? '',
    currency: asset.currency ?? '',
    depreciationMethodNotes: asset.depreciationMethodNotes ?? '',
    maintenanceNotes: asset.maintenanceNotes ?? '',
  };
}

export function assetUpdatePatch(values: FormValues): Partial<Asset> {
  return {
    name: text(values, 'name'),
    category: text(values, 'category') as AssetCategory | undefined,
    serialNumber: text(values, 'serialNumber'),
    location: text(values, 'location'),
    status: text(values, 'status') as AssetStatus | undefined,
    projectId: text(values, 'projectId'),
    expenseId: text(values, 'expenseId'),
    custodianUserId: text(values, 'custodianUserId'),
    purchaseDate: text(values, 'purchaseDate'),
    purchaseCost: numberValue(values, 'purchaseCost'),
    currentValue: numberValue(values, 'currentValue'),
    currency: text(values, 'currency'),
    depreciationMethodNotes: text(values, 'depreciationMethodNotes'),
    maintenanceNotes: text(values, 'maintenanceNotes'),
  };
}

export function buildAssetFilterForm(
  refData: AssetRefDataMap,
  deps: {
    projectOptions?: FieldOption[];
    userOptions?: FieldOption[];
  } = {},
): FormDefinition {
  return {
    id: 'asset-filter',
    key: 'asset-filter',
    label: 'Filter assets',
    description: null,
    fields: [
      field('status', 'Status', 'select', 1, {
        fieldOptions: options(refData, AssetRefData.refDataKey.statuses),
      }),
      field('category', 'Category', 'select', 2, {
        fieldOptions: options(refData, AssetRefData.refDataKey.categories),
      }),
      field('custodianUserId', 'Custodian', 'autocomplete', 3, {
        fieldOptions: deps.userOptions ?? [],
      }),
      field('projectId', 'Project', 'autocomplete', 4, {
        fieldOptions: deps.projectOptions ?? [],
      }),
    ],
  };
}

export function assetCriteriaToValues(criteria: AssetFilterCriteria): FormValues {
  return {
    status: criteria.status ?? '',
    category: criteria.category ?? '',
    custodianUserId: criteria.custodianUserId ?? '',
    projectId: criteria.projectId ?? '',
  };
}

export function assetValuesToCriteria(
  values: FormValues,
  criteria: AssetFilterCriteria,
): AssetFilterCriteria {
  return {
    ...criteria,
    status: text(values, 'status') as AssetStatus | undefined,
    category: text(values, 'category') as AssetCategory | undefined,
    custodianUserId: text(values, 'custodianUserId'),
    projectId: text(values, 'projectId'),
  };
}

export function buildAssetEditSummary(
  asset: Asset,
  refData: AssetRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    { label: 'Category', value: label(AssetRefData.refDataKey.categories, asset.category) },
    { label: 'Status', value: label(AssetRefData.refDataKey.statuses, asset.status) },
  ];
}

export function buildAssignCustodyForm(userOptions: FieldOption[] = []): FormDefinition {
  return {
    id: 'asset-assign-custody',
    key: 'asset-assign',
    label: 'Assign custody',
    description: null,
    fields: [
      field('custodianUserId', 'Custodian', 'autocomplete', 1, {
        mandatory: true,
        fieldOptions: userOptions,
      }),
      field('notes', 'Notes', 'textarea', 2),
    ],
  };
}

export function defaultAssignCustodyValues(): FormValues {
  return {
    custodianUserId: '',
    notes: '',
  };
}

export function assignCustodyPayload(values: FormValues): {
  custodianUserId: string;
  notes?: string;
} {
  const custodianUserId = text(values, 'custodianUserId');
  if (!custodianUserId) {
    throw new Error('Select the custodian for this asset.');
  }
  return {
    custodianUserId,
    notes: text(values, 'notes'),
  };
}

export function buildReturnCustodyForm(): FormDefinition {
  return {
    id: 'asset-return-custody',
    key: 'asset-return',
    label: 'Return custody',
    description: null,
    fields: [
      field('notes', 'Notes', 'textarea', 1),
    ],
  };
}

export function defaultReturnCustodyValues(): FormValues {
  return { notes: '' };
}

export function returnCustodyNotes(values: FormValues): string | undefined {
  return text(values, 'notes');
}

function text(values: FormValues, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberValue(values: FormValues, key: string): number | undefined {
  const value = values[key];
  if (value === '' || value == null) {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeDateValue(value: string | Date | undefined): string {
  if (value == null) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.includes('T') ? value.slice(0, 10) : value;
}
