import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { BeneficiaryApiDataSource } from './api/beneficiary-api.data-source';
import { BeneficiaryDataSource } from './beneficiary-data.source';
import { BeneficiaryDemoDataSource } from 'src/demo/project/beneficiary/beneficiary-demo.data-source';

export function provideBeneficiaryInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? BeneficiaryDemoDataSource : BeneficiaryApiDataSource;
  return [
    implementation,
    { provide: BeneficiaryDataSource, useExisting: implementation },
  ];
}
