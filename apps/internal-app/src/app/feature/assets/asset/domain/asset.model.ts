import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED';
export type AssetCategory =
  | 'EQUIPMENT'
  | 'FURNITURE'
  | 'ELECTRONICS'
  | 'VEHICLE'
  | 'OTHER';

export interface AssetCustodyRecord {
  id: string;
  custodianUserId: string;
  assignedAt: string | Date;
  assignedById?: string;
  returnedAt?: string | Date;
  returnedById?: string;
  notes?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber?: string;
  location?: string;
  status: AssetStatus;
  custodianUserId?: string;
  projectId?: string;
  expenseId?: string;
  purchaseDate?: string | Date;
  purchaseCost?: number;
  currency?: string;
  currentValue?: number;
  depreciationMethodNotes?: string;
  maintenanceNotes?: string;
  createdById?: string;
  updatedById?: string;
  custodyHistory?: AssetCustodyRecord[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PagedAssets {
  content?: Asset[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type AssetPrimaryChip = 'all' | 'available' | 'assigned' | 'maintenance' | 'retired';

export interface AssetFilterCriteria {
  [key: string]: unknown;
  status?: AssetStatus;
  category?: AssetCategory;
  custodianUserId?: string;
  projectId?: string;
}

export const AssetRefData = {
  refDataKey: {
    statuses: 'assetStatuses',
    categories: 'assetCategories',
  },
} as const;

export type AssetRefDataMap = Record<string, KeyValue[] | undefined>;

export const ASSET_STATUSES: KeyValue[] = [
  { key: 'AVAILABLE', displayValue: 'Available' },
  { key: 'ASSIGNED', displayValue: 'Assigned' },
  { key: 'MAINTENANCE', displayValue: 'Maintenance' },
  { key: 'RETIRED', displayValue: 'Retired' },
];

export const ASSET_CATEGORIES: KeyValue[] = [
  { key: 'EQUIPMENT', displayValue: 'Equipment' },
  { key: 'FURNITURE', displayValue: 'Furniture' },
  { key: 'ELECTRONICS', displayValue: 'Electronics' },
  { key: 'VEHICLE', displayValue: 'Vehicle' },
  { key: 'OTHER', displayValue: 'Other' },
];

export interface AssetListContext {
  [key: string]: unknown;
  refData: AssetRefDataMap;
  projectOptions: FieldOption[];
  userOptions: FieldOption[];
  expenseOptions: FieldOption[];
}
