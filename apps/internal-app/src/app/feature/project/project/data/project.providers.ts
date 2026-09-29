import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { ProjectApiDataSource } from './api/project-api.data-source';
import { ProjectDemoDataSource } from 'src/demo/project/project/project-demo.data-source';
import { ProjectDataSource } from './project-data.source';

export function provideProjectInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? ProjectDemoDataSource : ProjectApiDataSource;
  return [
    implementation,
    { provide: ProjectDataSource, useExisting: implementation },
  ];
}
