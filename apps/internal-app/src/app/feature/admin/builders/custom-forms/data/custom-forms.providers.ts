import { Provider } from '@angular/core';
import { CustomFormsApiDataSource } from './api/custom-forms-api.data-source';
import { CustomFormsDataSource } from './custom-forms-data.source';

export function provideCustomFormsDataSource(): Provider[] {
  return [
    CustomFormsApiDataSource,
    { provide: CustomFormsDataSource, useExisting: CustomFormsApiDataSource },
  ];
}
