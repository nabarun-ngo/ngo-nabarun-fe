import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../environments/environment';
import { HelpDataSource } from './help-data.source';
import { HelpApiDataSource } from './api/help-api.data-source';
import { HelpDemoDataSource } from 'src/demo/help/help-demo.data-source';

export function provideHelpDataSource(): Provider[] {
  const implementation = MOCK_DATA ? HelpDemoDataSource : HelpApiDataSource;
  return [
    implementation,
    { provide: HelpDataSource, useExisting: implementation },
  ];
}
