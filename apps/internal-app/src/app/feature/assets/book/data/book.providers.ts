import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { BookDemoDataSource } from 'src/demo/assets/book-demo.data-source';
import { BookApiDataSource } from './api/book-api.data-source';
import { BookDataSource } from './book-data.source';

export function provideBookInfrastructure(): Provider[] {
  const implementation = MOCK_DATA ? BookDemoDataSource : BookApiDataSource;
  return [
    implementation,
    { provide: BookDataSource, useExisting: implementation },
  ];
}
