import type { Provider } from '@angular/core';
import { ReportApiDataSource } from './api/report-api.data-source';
import { ReportDataSource } from './report-data.source';

export function provideReportInfrastructure(): Provider[] {
  return [
    ReportApiDataSource,
    { provide: ReportDataSource, useExisting: ReportApiDataSource },
  ];
}
