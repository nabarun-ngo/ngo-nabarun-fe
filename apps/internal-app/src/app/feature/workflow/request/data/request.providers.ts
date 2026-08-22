import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { RequestDataSource } from './request-data.source';
import { RequestApiDataSource } from './api/request-api.data-source';
import { RequestDemoDataSource } from 'src/demo/workflow/request/request-demo.data-source';

export function provideRequestInfrastructure(): Provider[] {
  const implementation = MOCK_DATA
    ? RequestDemoDataSource
    : RequestApiDataSource;
  return [
    implementation,
    { provide: RequestDataSource, useExisting: implementation },
  ];
}
