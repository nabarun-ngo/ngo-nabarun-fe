import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { GoalApiDataSource } from './api/goal-api.data-source';
import { GoalDemoDataSource } from 'src/demo/project/goal/goal-demo.data-source';
import { GoalDataSource } from './goal-data.source';

export function provideGoalInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? GoalDemoDataSource : GoalApiDataSource;
  return [
    implementation,
    { provide: GoalDataSource, useExisting: implementation },
  ];
}
