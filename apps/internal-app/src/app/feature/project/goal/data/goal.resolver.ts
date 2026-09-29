import type { ResolveFn } from '@angular/router';
import type { GoalRefDataMap } from '../domain';
import { goalRefData } from './goal-data.mapper';

/** Goal enums are domain constants; no reference-data call is needed. */
export const goalRefDataResolver: ResolveFn<GoalRefDataMap> = () => goalRefData();
