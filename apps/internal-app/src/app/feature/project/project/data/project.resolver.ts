import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import type { ProjectRefDataMap } from '../domain';
import { mapProjectRefData } from './project-data.mapper';
import { ProjectDataSource } from './project-data.source';

export const projectRefDataResolver: ResolveFn<ProjectRefDataMap> = () =>
  inject(ProjectDataSource).fetchRefData().pipe(map(mapProjectRefData));
