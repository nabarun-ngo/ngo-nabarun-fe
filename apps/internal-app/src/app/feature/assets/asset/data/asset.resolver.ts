import type { ResolveFn } from '@angular/router';
import type { AssetRefDataMap } from '../domain';
import { ASSET_CATEGORIES, ASSET_STATUSES, AssetRefData } from '../domain';

/** Asset enums are domain constants; no reference-data call is needed. */
export const assetRefDataResolver: ResolveFn<AssetRefDataMap> = () => ({
  [AssetRefData.refDataKey.statuses]: ASSET_STATUSES,
  [AssetRefData.refDataKey.categories]: ASSET_CATEGORIES,
});
