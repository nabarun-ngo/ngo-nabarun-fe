import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { DonationDataSource } from './donation-data.source';
import { DonationApiDataSource } from './api/donation-api.data-source';
import { DonationDemoDataSource } from 'src/demo/finance/donation/donation-demo.data-source';

export function provideDonationInfrastructure(): Provider[] {
  const implementation = MOCK_DATA
    ? DonationDemoDataSource
    : DonationApiDataSource;
  return [
    implementation,
    { provide: DonationDataSource, useExisting: implementation },
  ];
}
