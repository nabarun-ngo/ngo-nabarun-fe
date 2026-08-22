import type {
  AddTeamMemberDto,
  TeamMemberDetailDto,
  TeamMemberListResponseDto,
  UpdateTeamMemberDto,
} from 'src/app/core/api/api-client/models';
import type { PagedTeamMembers, TeamMember, TeamRefDataMap } from '../domain';
import { TEAM_ROLES, TeamRefData } from '../domain';

export function mapTeamMemberDto(dto: TeamMemberDetailDto): TeamMember {
  return { ...dto };
}

/** The team list is returned whole; paging is applied by the caller. */
export function mapTeamMemberList(dto: TeamMemberListResponseDto): PagedTeamMembers {
  return {
    content: (dto.items ?? []).map(mapTeamMemberDto),
    totalSize: dto.total ?? 0,
  };
}

export function mapToAddTeamMember(data: Partial<TeamMember>): AddTeamMemberDto {
  return {
    userId: String(data.userId ?? ''),
    role: (data.role ?? 'VOLUNTEER') as AddTeamMemberDto['role'],
    startDate: String(data.startDate ?? new Date().toISOString().slice(0, 10)),
    responsibilities: data.responsibilities ?? undefined,
    hoursAllocated: data.hoursAllocated ?? undefined,
  };
}

/** Member and start date are fixed; deactivation ends the membership. */
export function mapToUpdateTeamMember(data: Partial<TeamMember>): UpdateTeamMemberDto {
  return {
    role: data.role as UpdateTeamMemberDto['role'],
    responsibilities: data.responsibilities ?? undefined,
    hoursAllocated: data.hoursAllocated ?? undefined,
  };
}

export function teamRefData(): TeamRefDataMap {
  return {
    [TeamRefData.refDataKey.roles]: TEAM_ROLES,
  };
}
