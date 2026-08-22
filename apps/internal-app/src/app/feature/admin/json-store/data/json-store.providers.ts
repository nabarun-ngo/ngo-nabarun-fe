import { Provider } from '@angular/core';
import { JsonStoreApiDataSource } from './api/json-store-api.data-source';
import { JsonStoreDataSource } from './json-store-data.source';

export function provideJsonStoreDataSource(): Provider[] {
  return [
    JsonStoreApiDataSource,
    { provide: JsonStoreDataSource, useExisting: JsonStoreApiDataSource },
  ];
}
