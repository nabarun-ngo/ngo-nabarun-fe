import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { MilestoneApiDataSource } from './api/milestone-api.data-source';
import { MilestoneDemoDataSource } from 'src/demo/project/milestone/milestone-demo.data-source';
import { MilestoneDataSource } from './milestone-data.source';

export function provideMilestoneInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? MilestoneDemoDataSource : MilestoneApiDataSource;
  return [
    implementation,
    { provide: MilestoneDataSource, useExisting: implementation },
  ];
}
