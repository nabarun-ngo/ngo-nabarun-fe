import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { ActivityDataSource } from './activity-data.source';
import { ActivityApiDataSource } from './api/activity-api.data-source';
import { ActivityDemoDataSource } from 'src/demo/project/activity/activity-demo.data-source';

export function provideActivityInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? ActivityDemoDataSource : ActivityApiDataSource;
  return [
    implementation,
    { provide: ActivityDataSource, useExisting: implementation },
  ];
}
