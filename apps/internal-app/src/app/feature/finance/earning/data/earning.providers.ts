import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { EarningApiDataSource } from './api/earning-api.data-source';
import { EarningDemoDataSource } from 'src/demo/finance/earning/earning-demo.data-source';
import { EarningDataSource } from './earning-data.source';

export function provideEarningInfrastructure(): Provider[] {
  const implementation = MOCK_DATA
    ? EarningDemoDataSource
    : EarningApiDataSource;
  return [
    implementation,
    { provide: EarningDataSource, useExisting: implementation },
  ];
}

/** @deprecated Prefer {@link provideEarningInfrastructure}. */
export const provideEarningDataSource = provideEarningInfrastructure;
