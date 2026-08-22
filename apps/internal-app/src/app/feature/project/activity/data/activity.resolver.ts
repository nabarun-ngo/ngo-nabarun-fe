import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import type { ActivityRefDataMap } from '../domain';
import { mapActivityRefData } from './activity-data.mapper';
import { ActivityDataSource } from './activity-data.source';

export const activityRefDataResolver: ResolveFn<ActivityRefDataMap> = () =>
  inject(ActivityDataSource).fetchRefData().pipe(
    map(mapActivityRefData),
    catchError(() => of({} as ActivityRefDataMap)),
  );
