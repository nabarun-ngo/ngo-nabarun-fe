import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { AssetApiDataSource } from './api/asset-api.data-source';
import { AssetDataSource } from './asset-data.source';
import { AssetDemoDataSource } from 'src/demo/assets/asset-demo.data-source';

export function provideAssetInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? AssetDemoDataSource : AssetApiDataSource;
  return [
    implementation,
    { provide: AssetDataSource, useExisting: implementation },
  ];
}
