import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { GoalDetailDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type Goal = GoalDetailDto;

export type GoalStatus = GoalDetailDto['status'];
export type GoalPriority = GoalDetailDto['priority'];

export interface PagedGoals {
  content?: Goal[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type GoalPrimaryChip = 'all' | 'in_progress' | 'achieved';

export interface GoalFilterCriteria {
  [key: string]: unknown;
  projectId?: string;
  status?: GoalStatus;
  priority?: GoalPriority;
}

export const GoalRefData = {
  refDataKey: {
    statuses: 'goalStatuses',
    priorities: 'goalPriorities',
  },
} as const;

export type GoalRefDataMap = Record<string, KeyValue[] | undefined>;

/** Goal enums are not exposed by the reference-data endpoint, so they live here. */
export const GOAL_STATUSES: KeyValue[] = [
  { key: 'NOT_STARTED', displayValue: 'Not started' },
  { key: 'IN_PROGRESS', displayValue: 'In progress' },
  { key: 'ACHIEVED', displayValue: 'Achieved' },
  { key: 'PARTIALLY_ACHIEVED', displayValue: 'Partially achieved' },
  { key: 'FAILED', displayValue: 'Failed' },
];

export const GOAL_PRIORITIES: KeyValue[] = [
  { key: 'LOW', displayValue: 'Low' },
  { key: 'MEDIUM', displayValue: 'Medium' },
  { key: 'HIGH', displayValue: 'High' },
  { key: 'CRITICAL', displayValue: 'Critical' },
];

export interface GoalListContext {
  [key: string]: unknown;
  refData: GoalRefDataMap;
  /** Goals are always read and written inside one project. */
  projectId?: string;
  projectOptions: FieldOption[];
}
