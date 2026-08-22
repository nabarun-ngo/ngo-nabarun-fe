import type { ResolveFn } from '@angular/router';
import type { TeamRefDataMap } from '../domain';
import { teamRefData } from './team-data.mapper';

/** Team roles are domain constants; no reference-data call is needed. */
export const teamRefDataResolver: ResolveFn<TeamRefDataMap> = () => teamRefData();
