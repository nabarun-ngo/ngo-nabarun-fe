import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  matchesAssetCriteria,
  normalizeAssetChip,
} from 'src/app/feature/assets/asset/config/asset.rules';
import type {
  Asset,
  AssetCustodyRecord,
  AssetFilterCriteria,
  PagedAssets,
} from 'src/app/feature/assets/asset/domain';
import type {
  AssetDataSource,
  AssetListPageQuery,
} from 'src/app/feature/assets/asset/data/asset-data.source';

const DEMO_ASSETS: Asset[] = [
  {
    id: 'ast-001',
    name: 'Dell Latitude laptop',
    category: 'ELECTRONICS',
    serialNumber: 'SN-DELL-88421',
    location: 'Nabarun office — room 2',
    status: 'AVAILABLE',
    projectId: 'prj-001',
    purchaseDate: '2026-01-15',
    purchaseCost: 45000,
    currentValue: 40000,
    currency: 'INR',
    depreciationMethodNotes: 'Straight-line over 3 years',
    custodyHistory: [],
    createdAt: '2026-01-15T06:00:00.000Z',
    updatedAt: '2026-01-15T06:00:00.000Z',
  },
  {
    id: 'ast-002',
    name: 'Ergonomic office chair',
    category: 'FURNITURE',
    serialNumber: 'CHAIR-2201',
    location: 'Field office — Kolkata',
    status: 'ASSIGNED',
    projectId: 'prj-001',
    custodianUserId: 'usr-001',
    purchaseDate: '2025-11-02',
    purchaseCost: 8500,
    currentValue: 7000,
    currency: 'INR',
    custodyHistory: [
      {
        id: 'cst-001',
        custodianUserId: 'usr-001',
        assignedAt: '2026-02-10T09:00:00.000Z',
        assignedById: 'usr-002',
        notes: 'Issued for field camp',
      },
    ],
    createdAt: '2025-11-02T06:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'ast-003',
    name: 'Epson projector',
    category: 'EQUIPMENT',
    serialNumber: 'PROJ-7788',
    location: 'Store room',
    status: 'MAINTENANCE',
    projectId: 'prj-002',
    maintenanceNotes: 'Lamp replacement scheduled',
    purchaseDate: '2024-08-20',
    purchaseCost: 32000,
    currentValue: 18000,
    currency: 'INR',
    custodyHistory: [],
    createdAt: '2024-08-20T06:00:00.000Z',
    updatedAt: '2026-07-01T06:00:00.000Z',
  },
];

const store: Asset[] = DEMO_ASSETS.map(asset => ({
  ...asset,
  custodyHistory: [...(asset.custodyHistory ?? [])],
}));

const DEMO_PROJECT_OPTIONS: FieldOption[] = [
  { key: 'prj-001', label: 'EDU · Village School Support' },
  { key: 'prj-002', label: 'HLT · Mobile Health Camps' },
];

const DEMO_USER_OPTIONS: FieldOption[] = [
  { key: 'usr-001', label: 'Anita Roy' },
  { key: 'usr-002', label: 'Debashis Ghosh' },
  { key: 'usr-003', label: 'Farhana Khatun' },
];

const DEMO_EXPENSE_OPTIONS: FieldOption[] = [
  { key: 'exp-001', label: 'Laptop purchase · 45,000' },
  { key: 'exp-002', label: 'Office furniture · 12,500' },
];

@Injectable()
export class AssetDemoDataSource implements AssetDataSource {
  loadListPage(query: AssetListPageQuery): Observable<PagedAssets> {
    const matches = store.filter(asset => matchesAssetCriteria(
      asset,
      normalizeAssetChip(query.chipId),
      (query.criteria ?? {}) as AssetFilterCriteria,
      query.searchText,
    ));
    const start = query.pageIndex * query.pageSize;
    return of({
      content: matches.slice(start, start + query.pageSize),
      totalSize: matches.length,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(200));
  }

  fetchAssetById(id: string): Observable<Asset | undefined> {
    return of(cloneAsset(store.find(asset => asset.id === id))).pipe(delay(120));
  }

  createAsset(data: Partial<Asset>): Observable<Asset> {
    const created: Asset = {
      id: `ast-${String(store.length + 1).padStart(3, '0')}`,
      name: data.name ?? 'New asset',
      category: data.category ?? 'OTHER',
      serialNumber: data.serialNumber,
      location: data.location,
      status: data.status ?? 'AVAILABLE',
      projectId: data.projectId,
      expenseId: data.expenseId,
      purchaseDate: data.purchaseDate,
      purchaseCost: data.purchaseCost,
      currentValue: data.currentValue,
      currency: data.currency,
      depreciationMethodNotes: data.depreciationMethodNotes,
      maintenanceNotes: data.maintenanceNotes,
      custodyHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.unshift(created);
    return of(cloneAsset(created)!).pipe(delay(200));
  }

  updateAsset(id: string, patch: Partial<Asset>): Observable<Asset> {
    const index = store.findIndex(asset => asset.id === id);
    const updated: Asset = {
      ...(index >= 0 ? store[index] : store[0]),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(cloneAsset(updated)!).pipe(delay(200));
  }

  deleteAsset(id: string): Observable<void> {
    const index = store.findIndex(asset => asset.id === id);
    if (index >= 0) {
      store.splice(index, 1);
    }
    return of(undefined).pipe(delay(200));
  }

  assignCustody(id: string, custodianUserId: string, notes?: string): Observable<Asset> {
    const index = store.findIndex(asset => asset.id === id);
    if (index < 0) {
      return of(store[0]).pipe(delay(200));
    }
    const record: AssetCustodyRecord = {
      id: `cst-${String(Date.now())}`,
      custodianUserId,
      assignedAt: new Date().toISOString(),
      notes,
    };
    const updated: Asset = {
      ...store[index],
      status: 'ASSIGNED',
      custodianUserId,
      custodyHistory: [...(store[index].custodyHistory ?? []), record],
      updatedAt: new Date().toISOString(),
    };
    store[index] = updated;
    return of(cloneAsset(updated)!).pipe(delay(200));
  }

  returnCustody(id: string, notes?: string): Observable<Asset> {
    const index = store.findIndex(asset => asset.id === id);
    if (index < 0) {
      return of(store[0]).pipe(delay(200));
    }
    const history = [...(store[index].custodyHistory ?? [])];
    const active = history.find(record => !record.returnedAt);
    if (active) {
      active.returnedAt = new Date().toISOString();
      active.notes = notes ?? active.notes;
    }
    const updated: Asset = {
      ...store[index],
      status: 'AVAILABLE',
      custodianUserId: undefined,
      custodyHistory: history,
      updatedAt: new Date().toISOString(),
    };
    store[index] = updated;
    return of(cloneAsset(updated)!).pipe(delay(200));
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return of(DEMO_PROJECT_OPTIONS).pipe(delay(120));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return of(DEMO_USER_OPTIONS).pipe(delay(120));
  }

  fetchExpenseOptions(): Observable<FieldOption[]> {
    return of(DEMO_EXPENSE_OPTIONS).pipe(delay(120));
  }
}

function cloneAsset(asset: Asset | undefined): Asset | undefined {
  if (!asset) {
    return undefined;
  }
  return {
    ...asset,
    custodyHistory: asset.custodyHistory?.map(record => ({ ...record })),
  };
}
