import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RequestDataSource } from './request/data/request-data.source';
import type { RequestRefData } from './request/domain';

export const requestRefDataResolver: ResolveFn<RequestRefData> = () =>
  inject(RequestDataSource).fetchRequestRefData().pipe(
    catchError(() => of({})),
  );
