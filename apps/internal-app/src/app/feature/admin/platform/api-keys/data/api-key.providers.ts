import { Provider } from '@angular/core';
import { ApiKeyApiDataSource } from './api/api-key-api.data-source';
import { ApiKeyDataSource } from './api-key-data.source';

export function provideApiKeyDataSource(): Provider[] {
  return [
    ApiKeyApiDataSource,
    { provide: ApiKeyDataSource, useExisting: ApiKeyApiDataSource },
  ];
}
