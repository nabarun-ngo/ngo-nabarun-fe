import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { TeamMemberDetailDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type TeamMember = TeamMemberDetailDto;

export type TeamRole = TeamMemberDetailDto['role'];

export interface PagedTeamMembers {
  content?: TeamMember[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type TeamPrimaryChip = 'all' | 'active' | 'inactive';

export interface TeamFilterCriteria {
  [key: string]: unknown;
  projectId?: string;
  role?: TeamRole;
  userId?: string;
}

export const TeamRefData = {
  refDataKey: {
    roles: 'teamRoles',
  },
} as const;

export type TeamRefDataMap = Record<string, KeyValue[] | undefined>;

/** Team roles are absent from the reference-data endpoint. */
export const TEAM_ROLES: KeyValue[] = [
  { key: 'PROJECT_MANAGER', displayValue: 'Project manager' },
  { key: 'TEAM_LEAD', displayValue: 'Team lead' },
  { key: 'COORDINATOR', displayValue: 'Coordinator' },
  { key: 'VOLUNTEER', displayValue: 'Volunteer' },
  { key: 'CONSULTANT', displayValue: 'Consultant' },
  { key: 'OTHER', displayValue: 'Other' },
];

export interface TeamListContext {
  [key: string]: unknown;
  refData: TeamRefDataMap;
  projectId?: string;
  projectOptions: FieldOption[];
  userOptions: FieldOption[];
}
