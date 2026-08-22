import type { FieldOption } from '@nabarun-ngo/forms-core';
import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import type {
  Asset,
  AssetFilterCriteria,
  AssetPrimaryChip,
  PagedAssets,
} from '../domain';

export interface AssetListPageQuery {
  chipId?: string;
  criteria?: AssetFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface AssetDataSource {
  loadListPage(query: AssetListPageQuery): Observable<PagedAssets>;
  fetchAssetById(id: string): Observable<Asset | undefined>;
  createAsset(data: Partial<Asset>): Observable<Asset>;
  updateAsset(id: string, patch: Partial<Asset>): Observable<Asset>;
  deleteAsset(id: string): Observable<void>;
  assignCustody(id: string, custodianUserId: string, notes?: string): Observable<Asset>;
  returnCustody(id: string, notes?: string): Observable<Asset>;
  fetchProjectOptions(): Observable<FieldOption[]>;
  fetchUserOptions(): Observable<FieldOption[]>;
  fetchExpenseOptions(): Observable<FieldOption[]>;
}

export const AssetDataSource = new InjectionToken<AssetDataSource>('AssetDataSource');

export type { AssetPrimaryChip };
