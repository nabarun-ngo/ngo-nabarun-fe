import { Provider } from '@angular/core';
import { RoleCatalogApiDataSource } from './api/role-catalog-api.data-source';
import { RoleCatalogDataSource } from './role-catalog-data.source';

export function provideRoleCatalogDataSource(): Provider[] {
  return [
    RoleCatalogApiDataSource,
    { provide: RoleCatalogDataSource, useExisting: RoleCatalogApiDataSource },
  ];
}
