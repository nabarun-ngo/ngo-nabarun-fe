import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ActivityDetailDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type Activity = ActivityDetailDto;

export type ActivityStatus = ActivityDetailDto['status'];
export type ActivityScale = ActivityDetailDto['scale'];
export type ActivityType = ActivityDetailDto['type'];
export type ActivityPriority = ActivityDetailDto['priority'];

export interface PagedActivities {
  content?: Activity[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type ActivityPrimaryChip = 'all' | 'in_progress' | 'completed';

export interface ActivityFilterCriteria {
  [key: string]: unknown;
  projectId?: string;
  status?: ActivityStatus;
  scale?: ActivityScale;
  type?: ActivityType;
  assignedTo?: string;
  organizerId?: string;
  parentActivityId?: string;
}

export const ActivityRefData = {
  refDataKey: {
    types: 'activityTypes',
    statuses: 'activityStatuses',
    priorities: 'activityPriorities',
    scales: 'activityScales',
  },
} as const;

export type ActivityRefDataMap = Record<string, KeyValue[] | undefined>;

export interface ActivityListContext {
  [key: string]: unknown;
  refData: ActivityRefDataMap;
  /** Project scope from the route; required to create an activity. */
  projectId?: string;
  projectOptions: FieldOption[];
  userOptions: FieldOption[];
  expenseOptions: FieldOption[];
}
