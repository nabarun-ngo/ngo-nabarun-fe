import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { MilestoneDetailDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type Milestone = MilestoneDetailDto;

export type MilestoneStatus = MilestoneDetailDto['status'];
export type MilestoneImportance = MilestoneDetailDto['importance'];

export interface PagedMilestones {
  content?: Milestone[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type MilestonePrimaryChip = 'all' | 'in_progress' | 'achieved';

export interface MilestoneFilterCriteria {
  [key: string]: unknown;
  projectId?: string;
  status?: MilestoneStatus;
  importance?: MilestoneImportance;
}

export const MilestoneRefData = {
  refDataKey: {
    statuses: 'milestoneStatuses',
    importances: 'milestoneImportances',
  },
} as const;

export type MilestoneRefDataMap = Record<string, KeyValue[] | undefined>;

/** Milestone enums are absent from the reference-data endpoint. */
export const MILESTONE_STATUSES: KeyValue[] = [
  { key: 'PENDING', displayValue: 'Pending' },
  { key: 'IN_PROGRESS', displayValue: 'In progress' },
  { key: 'ACHIEVED', displayValue: 'Achieved' },
  { key: 'DELAYED', displayValue: 'Delayed' },
  { key: 'MISSED', displayValue: 'Missed' },
];

export const MILESTONE_IMPORTANCES: KeyValue[] = [
  { key: 'LOW', displayValue: 'Low' },
  { key: 'MEDIUM', displayValue: 'Medium' },
  { key: 'HIGH', displayValue: 'High' },
  { key: 'CRITICAL', displayValue: 'Critical' },
];

export interface MilestoneListContext {
  [key: string]: unknown;
  refData: MilestoneRefDataMap;
  projectId?: string;
  projectOptions: FieldOption[];
}
