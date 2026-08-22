import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  buildAssetApiFilter,
  matchesAssetSearch,
  normalizeAssetChip,
} from '../../config/asset.rules';
import type { Asset, PagedAssets } from '../../domain';
import type { AssetDataSource, AssetListPageQuery } from '../asset-data.source';
import { AssetService } from '../asset.service';

/** Widest page the local search fallback requests before filtering on name, serial and location. */
const LOOKUP_PAGE_SIZE = 100;

@Injectable()
export class AssetApiDataSource implements AssetDataSource {
  constructor(private readonly assets: AssetService) {}

  loadListPage(query: AssetListPageQuery): Observable<PagedAssets> {
    const filter = buildAssetApiFilter(
      normalizeAssetChip(query.chipId),
      query.criteria ?? {},
    );
    const search = query.searchText?.trim();

    if (!search) {
      return this.assets.listAssets({
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
        ...filter,
      });
    }

    return this.assets.listAssets({
      pageIndex: 0,
      pageSize: LOOKUP_PAGE_SIZE,
      ...filter,
    }).pipe(
      map(page => {
        const matches = (page.content ?? []).filter(asset => matchesAssetSearch(asset, search));
        const start = query.pageIndex * query.pageSize;
        return {
          content: matches.slice(start, start + query.pageSize),
          totalSize: matches.length,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
        };
      }),
    );
  }

  fetchAssetById(id: string): Observable<Asset | undefined> {
    return this.assets.fetchAssetById(id).pipe(catchError(() => of(undefined)));
  }

  createAsset(data: Partial<Asset>): Observable<Asset> {
    return this.assets.createAsset(data);
  }

  updateAsset(id: string, patch: Partial<Asset>): Observable<Asset> {
    return this.assets.updateAsset(id, patch);
  }

  deleteAsset(id: string): Observable<void> {
    return this.assets.deleteAsset(id);
  }

  assignCustody(id: string, custodianUserId: string, notes?: string): Observable<Asset> {
    return this.assets.assignCustody(id, custodianUserId, notes);
  }

  returnCustody(id: string, notes?: string): Observable<Asset> {
    return this.assets.returnCustody(id, notes);
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.assets.fetchProjectOptions().pipe(catchError(() => of([])));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.assets.fetchUserOptions().pipe(catchError(() => of([])));
  }

  fetchExpenseOptions(): Observable<FieldOption[]> {
    return this.assets.fetchExpenseOptions().pipe(catchError(() => of([])));
  }
}
