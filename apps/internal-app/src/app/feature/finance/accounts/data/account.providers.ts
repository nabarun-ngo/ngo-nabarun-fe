import { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { AccountApiDataSource } from './api/account-api.data-source';
import { AccountDemoDataSource } from 'src/demo/finance/accounts/account-demo.data-source';
import { AccountDataSource } from './account-data.source';

export function provideAccountInfrastructure(): Provider[] {
  const implementation = MOCK_DATA
    ? AccountDemoDataSource
    : AccountApiDataSource;
  return [
    implementation,
    { provide: AccountDataSource, useExisting: implementation },
  ];
}

/** @deprecated Prefer {@link provideAccountInfrastructure}. */
export const provideAccountDataSource = provideAccountInfrastructure;
