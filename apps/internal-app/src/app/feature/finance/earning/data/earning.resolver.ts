import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import type { EarningRefDataMap } from '../domain';
import { mapEarningRefData } from './earning-data.mapper';
import { EarningDataSource } from './earning-data.source';

export const earningRefDataResolver: ResolveFn<EarningRefDataMap> = () =>
  inject(EarningDataSource).fetchRefData().pipe(map(mapEarningRefData));
