import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@ssdev-toolkit/forms-core';
import type { PagedTeamMembers, TeamFilterCriteria, TeamMember } from '../domain';
import type { ListPagingMode } from 'src/app/shared/data/list-paging.contract';

/**
 * The current roster endpoint accepts only projectId. True server paging
 * requires pageIndex, pageSize, search and filter parameters in that API.
 */
export const TEAM_LIST_PAGING_MODE: ListPagingMode = 'clientRoster';

export interface TeamListPageQuery {
  chipId?: string;
  criteria?: TeamFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface TeamDataSource {
  /** Returns an empty page until a project is in scope. */
  loadListPage(query: TeamListPageQuery): Observable<PagedTeamMembers>;
  fetchTeamMemberById(projectId: string, id: string): Observable<TeamMember | undefined>;
  addTeamMember(projectId: string, data: Partial<TeamMember>): Observable<TeamMember>;
  updateTeamMember(
    projectId: string,
    id: string,
    patch: Partial<TeamMember>,
  ): Observable<TeamMember>;
  deactivateTeamMember(projectId: string, id: string): Observable<TeamMember>;
  fetchProjectOptions(): Observable<FieldOption[]>;
  fetchUserOptions(): Observable<FieldOption[]>;
}

export const TeamDataSource = new InjectionToken<TeamDataSource>('TeamDataSource');
