import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import type { ReportType } from '../domain';
import { ReportDataSource } from './report-data.source';

/** Report types become the list chips, so they must be known before the page renders. */
export const reportTypesResolver: ResolveFn<ReportType[]> = () =>
  inject(ReportDataSource).listReportTypes().pipe(catchError(() => of([] as ReportType[])));
