import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { TeamApiDataSource } from './api/team-api.data-source';
import { TeamDataSource } from './team-data.source';
import { TeamDemoDataSource } from 'src/demo/project/team/team-demo.data-source';

export function provideTeamInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? TeamDemoDataSource : TeamApiDataSource;
  return [
    implementation,
    { provide: TeamDataSource, useExisting: implementation },
  ];
}
