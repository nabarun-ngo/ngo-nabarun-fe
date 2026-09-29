import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { DonorApiDataSource } from './api/donor-api.data-source';
import { DonorDataSource } from './donor-data.source';
import { DonorDemoDataSource } from 'src/demo/finance/donors/donor-demo.data-source';

export function provideDonorInfrastructure(): Provider[] {
  const implementation = MOCK_DATA
    ? DonorDemoDataSource
    : DonorApiDataSource;
  return [
    implementation,
    { provide: DonorDataSource, useExisting: implementation },
  ];
}

/** @deprecated Prefer {@link provideDonorInfrastructure}. */
export const provideDonorDataSource = provideDonorInfrastructure;
