import type { FieldOption } from '@nabarun-ngo/forms-core';
import type {
  ActivitySummaryDto,
  MilestoneSummaryDto,
  ProjectDetailDto,
  ProjectProgressResponseDto,
} from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type ProjectStatus = ProjectDetailDto['status'];
export type ProjectCategory = ProjectDetailDto['category'];
export type ProjectPhase = ProjectDetailDto['phase'];

export type ProjectProgress = ProjectProgressResponseDto;

/** Progress counts plus recent activities and upcoming milestones, shown read-only on the detail sheet. */
export interface ProjectDashboardSnapshot {
  progress?: ProjectProgress;
  recentActivities: ActivitySummaryDto[];
  upcomingMilestones: MilestoneSummaryDto[];
}

export type Project = ProjectDetailDto;

export interface PagedProjects {
  content?: Project[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type ProjectPrimaryChip = 'all' | 'in_progress' | 'completed';

export interface ProjectFilterCriteria {
  [key: string]: unknown;
  status?: ProjectStatus;
  category?: ProjectCategory;
  phase?: ProjectPhase;
  managerId?: string;
  sponsorId?: string;
  location?: string;
  tags?: string[];
  isPublic?: boolean;
}

export const ProjectRefData = {
  refDataKey: {
    categories: 'projectCategories',
    statuses: 'projectStatuses',
    phases: 'projectPhases',
  },
} as const;

export type ProjectRefDataMap = Record<string, KeyValue[] | undefined>;

export interface ProjectListContext {
  [key: string]: unknown;
  refData: ProjectRefDataMap;
  /** Active users offered as manager and sponsor options. */
  userOptions: FieldOption[];
}
