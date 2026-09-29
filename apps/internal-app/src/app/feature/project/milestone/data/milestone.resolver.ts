import type { ResolveFn } from '@angular/router';
import type { MilestoneRefDataMap } from '../domain';
import { milestoneRefData } from './milestone-data.mapper';

/** Milestone enums are domain constants; no reference-data call is needed. */
export const milestoneRefDataResolver: ResolveFn<MilestoneRefDataMap> = () => milestoneRefData();
