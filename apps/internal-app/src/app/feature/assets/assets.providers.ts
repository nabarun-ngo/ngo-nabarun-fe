import type { Provider } from '@angular/core';
import { provideAssetInfrastructure } from './asset/data/asset.providers';
import { provideBookInfrastructure } from './book/data/book.providers';

export function provideAssetFeatureInfrastructure(): Provider[] {
  return [
    ...provideAssetInfrastructure(),
    ...provideBookInfrastructure(),
  ];
}

export { provideAssetInfrastructure as provideAssetDataSource } from './asset/data/asset.providers';
export { provideBookInfrastructure as provideBookDataSource } from './book/data/book.providers';
