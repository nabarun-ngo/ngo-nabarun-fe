import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { RiskApiDataSource } from './api/risk-api.data-source';
import { RiskDemoDataSource } from 'src/demo/project/risk/risk-demo.data-source';
import { RiskDataSource } from './risk-data.source';

export function provideRiskInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? RiskDemoDataSource : RiskApiDataSource;
  return [
    implementation,
    { provide: RiskDataSource, useExisting: implementation },
  ];
}
